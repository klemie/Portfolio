import {useCallback, useEffect, useMemo, useRef, useState, type RefObject, type ReactNode} from 'react'
import {LngLat, LngLatBounds, Map as MapLibreMap, Marker, type ErrorEvent} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './Flyover.css'
import {buildRoute, placeWaypoints, positionAt, type Route} from '../lib/route'
import {parseGpx} from '../lib/gpx'
import {usePrefersReducedMotion} from '../hooks/usePrefersReducedMotion'
import type {SiteSettings, Stop} from '../lib/types'
import type {Visit} from '../lib/visit'
import {
  addFlyoverLayers,
  buildStyle,
  setRouteProgress,
} from './mapStyle'
import {
  rideStateFor,
  stopCameras,
  type CameraState,
  type RideState,
  type StopAnchor,
} from './camera'
import type {Theme} from '../hooks/useTheme'
import {FloatingNavigation} from '../components/FloatingNavigation'
import {RidePreview} from './RidePreview'
import {VisitHero} from './VisitHero'
import {useMapFrameTransition, type MapFrameBounds} from '../hooks/useMapFrameTransition'
import {visitPath} from '../lib/visit'
import {createBikeMarker} from './BikeMarker'

interface FlyoverProps {
  theme: Theme
  themeControl: ReactNode
  settings: SiteSettings
  stops: Stop[]
  /** GPX text, already fetched by the caller. */
  gpx: string
  visit: Visit | null
  onVisit: (stop: Stop) => void
  onResume: () => void
  resumeStopRef: RefObject<string | null>
  transitionFromRef: RefObject<MapFrameBounds | null>
}

/**
 * Establishing shot: the whole route in frame, angled so it recedes.
 *
 * Padding scales with the canvas instead of sitting at a fixed 120px. On the
 * portrait map band 120px is over a quarter of the height, and `cameraForBounds`
 * answers that by logging "Map cannot fit within canvas with the given bounds,
 * padding, and/or offset" and returning undefined — which silently dropped the
 * landing shot to a hardcoded zoom 11 that frames nothing in particular.
 *
 * Recomputed on resize as well as at init, since the framing depends on the
 * canvas aspect and crossing the portrait threshold changes it.
 */
const establishingShot = (
  map: MapLibreMap,
  route: Route,
  fallback: {lat: number; lon: number},
): CameraState => {
  const bounds = route.coordinates.reduce(
    (acc, coordinate) => acc.extend(coordinate),
    new LngLatBounds(route.coordinates[0], route.coordinates[0]),
  )

  const canvas = map.getCanvas()
  const padding = Math.max(
    16,
    Math.min(120, Math.min(canvas.clientWidth, canvas.clientHeight) * 0.12),
  )

  const framed = map.cameraForBounds(bounds, {padding, bearing: 20})
  // cameraForBounds returns center as LngLat or [lng, lat] depending on how it
  // was constructed; LngLat.convert normalises both.
  const center = framed?.center
    ? LngLat.convert(framed.center)
    : new LngLat(fallback.lon, fallback.lat)

  return {
    center: [center.lng, center.lat],
    zoom: (framed?.zoom ?? 11) - 0.35,
    bearing: 20,
    pitch: 46,
  }
}

export const Flyover = ({theme, themeControl, settings, stops, gpx, visit, onVisit, onResume, resumeStopRef, transitionFromRef}: FlyoverProps) => {
  const themeRef = useRef(theme)
  themeRef.current = theme
  const styledThemeRef = useRef(theme)
  const frameNodeRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const mapNodeRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const establishingRef = useRef<CameraState | null>(null)
  const bikeRef = useRef<ReturnType<typeof createBikeMarker> | null>(null)
  const markersRef = useRef<Marker[]>([])
  const frameRef = useRef(0)
  const orbitOffsetsRef = useRef<number[]>([])
  const stateRef = useRef<RideState | null>(null)

  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const visiting = Boolean(visit)
  useMapFrameTransition(frameNodeRef, transitionFromRef, visit ? visitPath(visit.target) : null, reducedMotion)

  // Discrete state only — camera updates stay imperative so scrolling does
  // not re-render the tree every frame.
  const [phase, setPhase] = useState<{index: number; dwell: number; landing: boolean}>({
    index: 0,
    dwell: 0,
    landing: true,
  })

  const {route, anchors, orderedStops} = useMemo(() => {
    const parsed = parseGpx(gpx)
    const built = buildRoute(parsed.track)
    const placed = placeWaypoints(built, parsed.waypoints)

    // The camera visits stops in the order the line reaches them; Sanity's
    // `order` is only authoring intent. Stops with no matching waypoint cannot
    // be placed on the route, so they are dropped here and reported by
    // `pnpm --filter web check:route`.
    const byName = new Map(stops.map((stop) => [stop.waypointName.toLowerCase(), stop]))
    const resolved: {stop: Stop; anchor: StopAnchor}[] = []

    for (const waypoint of placed) {
      const stop = byName.get(waypoint.name.toLowerCase())
      if (!stop) continue
      resolved.push({
        stop,
        anchor: {name: waypoint.name, alongTrack: waypoint.alongTrack},
      })
    }

    return {
      route: built,
      anchors: resolved.map((entry) => entry.anchor),
      orderedStops: resolved.map((entry) => entry.stop),
    }
  }, [gpx, stops])

  // --- map lifecycle -------------------------------------------------------
  useEffect(() => {
    const node = mapNodeRef.current
    if (!node || anchors.length === 0) return

    setReady(false)
    setFailed(null)
    let cancelled = false
    let map: MapLibreMap | null = null
    let loadGuard = 0

    const start = positionAt(route, anchors[0].alongTrack)

    const initialTheme = themeRef.current
    styledThemeRef.current = initialTheme
    buildStyle(initialTheme)
      .then((style) => {
        if (cancelled) return

        map = new MapLibreMap({
          container: node,
          style,
          center: [start.lon, start.lat],
          zoom: 11,
          pitch: 45,
          bearing: 0,
          // The ride owns the camera. Leaving interaction on would let the map
          // swallow the wheel events the scroll scrub depends on — and, now
          // that touch devices get the ride too, the touch gestures the page
          // needs in order to scroll at all.
          interactive: false,
          attributionControl: {compact: true},
        })
        mapRef.current = map

        // Handy when tuning the camera constants by feel, which the spec
        // expects to happen on screen rather than by guessing.
        if (import.meta.env.DEV) {
          ;(window as unknown as {__flyoverMap?: MapLibreMap}).__flyoverMap = map
        }

        map.on('error', (event: ErrorEvent) => {
          // Tile 404s are noisy but survivable; only a hard style failure is fatal.
          console.warn('[flyover]', event.error?.message ?? event)
        })

        let initialised = false

        /**
         * Terrain and the route layers both need a resolved style — `setTerrain`
         * throws "Style is not done loading" otherwise, which the load guard
         * below can walk straight into. Now that the ride is the only path, an
         * unhandled throw here costs the whole landing page, so wait the style
         * out instead. `styledata` fires repeatedly, hence the re-check.
         */
        const addLayersWhenStyled = () => {
          if (cancelled || !map) return
          if (!map.isStyleLoaded()) {
            map.once('styledata', addLayersWhenStyled)
            return
          }
          try {
            addFlyoverLayers(map, route.coordinates)
          } catch (error) {
            // A ride with no trace still beats a blank page.
            console.warn('[flyover] could not add route layers', error)
          }
        }

        const initialise = () => {
          if (cancelled || !map || initialised) return
          initialised = true
          addLayersWhenStyled()

          establishingRef.current = establishingShot(map, route, start)

          setReady(true)
        }

        map.once('load', initialise)

        // The landing page *is* the map, so a missed `load` would leave the
        // visitor staring at an empty container. Proceed regardless after a
        // grace period — a partially-tiled map still rides fine.
        loadGuard = window.setTimeout(() => {
          if (!initialised) {
            console.warn('[flyover] map load timed out, starting anyway')
            initialise()
          }
        }, 8000)
      })
      .catch((error: Error) => {
        if (!cancelled) setFailed(error.message)
      })

    return () => {
      cancelled = true
      window.clearTimeout(loadGuard)
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      map?.remove()
      mapRef.current = null
    }
  }, [route, anchors])

  // Swap cartography without recreating the map or losing the current camera.
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map || styledThemeRef.current === theme) return
    const controller = new AbortController()
    const restoreRoute = () => {
      addFlyoverLayers(map, route.coordinates)
      if (stateRef.current) setRouteProgress(map, stateRef.current.routeProgress)
    }
    buildStyle(theme, controller.signal).then((style) => {
      if (controller.signal.aborted) return
      styledThemeRef.current = theme
      map.once('style.load', restoreRoute)
      map.setStyle(style)
    }).catch((error: Error) => {
      if (!controller.signal.aborted) console.warn('[flyover] could not switch map theme', error)
    })
    return () => { controller.abort(); map.off('style.load', restoreRoute) }
  }, [theme, ready, route])

  // --- stop pins -----------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = anchors.map((anchor, index) => {
      const position = positionAt(route, anchor.alongTrack)
      const element = document.createElement('div')
      element.className = 'ride-pin'
      const dot = document.createElement('span')
      dot.className = 'ride-pin-dot'
      const label = document.createElement('span')
      label.className = 'ride-pin-label'
      label.textContent = orderedStops[index]?.title ?? anchor.name
      element.append(dot, label)
      // Each orbit frame emits moveend. Preserve fractional pixels so
      // markers do not alternate between rounded and projected positions.
      return new Marker({element, anchor: 'center', subpixelPositioning: true})
        .setLngLat([position.lon, position.lat])
        .addTo(map)
    })

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [ready, route, anchors, orderedStops])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const bike = createBikeMarker(map, route)
    bikeRef.current = bike
    return () => { bike.remove(); bikeRef.current = null }
  }, [ready, route])

  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    // Compact attribution starts expanded in MapLibre. Collapse it on load and
    // screen changes while keeping the information button available to open it.
    const collapseAttribution = () => {
      const attribution = mapNodeRef.current?.querySelector<HTMLDetailsElement>('.maplibregl-ctrl-attrib')
      if (attribution) {
        attribution.open = false
        attribution.classList.remove('maplibregl-compact-show')
      }
    }
    collapseAttribution()
    map.on('style.load', collapseAttribution)
    return () => {map.off('style.load', collapseAttribution)}
  }, [ready, visiting])

  const cameras = useMemo(() => stopCameras(route, anchors), [route, anchors])
  const visitedIndex = visit?.stop
    ? orderedStops.findIndex((stop) => stop._id === visit.stop?._id)
    : -1

  // Keep the accumulated heading at each stop. The departure interpolates
  // from that heading too, so scrolling out of an orbit does not snap north.
  const update = useCallback(() => {
    const wrap = wrapRef.current
    const map = mapRef.current
    const establishing = establishingRef.current
    if (!wrap || !map || !establishing) return

    const rect = wrap.getBoundingClientRect()
    const scrollable = rect.height - window.innerHeight
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0
    const offsets = reducedMotion ? [] : orbitOffsetsRef.current
    const state: RideState = visit ? {
      camera: visitedIndex >= 0
        ? {...cameras[visitedIndex], zoom: cameras[visitedIndex].zoom - 0.6, pitch: 40, bearing: cameras[visitedIndex].bearing + (offsets[visitedIndex] ?? 0)}
        : establishing,
      stopIndex: Math.max(0, visitedIndex),
      dwell: 1,
      routeProgress: visitedIndex >= 0 ? anchors[visitedIndex].alongTrack / route.totalDistance : 1,
      landing: visitedIndex < 0,
    } : rideStateFor(route, anchors, progress, establishing, {
      reducedMotion,
      bearingOffsets: offsets,
    })

    stateRef.current = state
    bikeRef.current?.update(state.routeProgress, !visit || visitedIndex >= 0)
    map.jumpTo(state.camera)
    setRouteProgress(map, state.routeProgress)
    setPhase((previous) =>
      previous.index === state.stopIndex &&
      previous.landing === state.landing &&
      Math.abs(previous.dwell - state.dwell) < 0.02
        ? previous
        : {index: state.stopIndex, dwell: state.dwell, landing: state.landing},
    )
  }, [route, anchors, cameras, reducedMotion, visit, visitedIndex])

  useEffect(() => {
    if (!ready) return
    const node = mapNodeRef.current
    const onResize = () => {
      const map = mapRef.current
      if (map) {
        map.resize()
        establishingRef.current = establishingShot(map, route, positionAt(route, anchors[0].alongTrack))
      }
      update()
    }
    const observer = new ResizeObserver(onResize)
    if (node) observer.observe(node)
    update()
    window.addEventListener('scroll', update, {passive: true})
    window.addEventListener('resize', onResize)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', onResize)
    }
  }, [ready, update, route, anchors])

  useEffect(() => {
    if (!ready || reducedMotion || visiting) return
    let last = 0
    const orbit = (now: number) => {
      const elapsed = last ? Math.min(now - last, 100) : 0
      last = now
      const state = stateRef.current
      const map = mapRef.current
      const rect = mapNodeRef.current?.getBoundingClientRect()
      if (map && state && !state.landing && state.dwell > 0 &&
          rect && rect.bottom > 0 && rect.top < window.innerHeight && !document.hidden) {
        // Two degrees per second: a full turn takes three minutes. Ramp in on
        // arrival, and pause when the map has scrolled out of the detail page.
        const delta = elapsed * 0.002 * Math.min(1, state.dwell * 8)
        const index = state.stopIndex
        orbitOffsetsRef.current[index] = (orbitOffsetsRef.current[index] ?? 0) + delta
        state.camera.bearing += delta
        map.setBearing(state.camera.bearing)
      }
      frameRef.current = requestAnimationFrame(orbit)
    }
    frameRef.current = requestAnimationFrame(orbit)
    return () => cancelAnimationFrame(frameRef.current)
  }, [ready, reducedMotion, visiting])

  const navigate = (index: number) => {
    const wrap = wrapRef.current
    if (!wrap) return
    const top = window.scrollY + wrap.getBoundingClientRect().top
    const scrollable = wrap.offsetHeight - window.innerHeight
    const progress = index < 0 ? 0 : (index + 1.82) / (anchors.length + 1)
    window.scrollTo({
      top: index >= anchors.length ? top + wrap.offsetHeight : top + scrollable * progress,
      behavior: reducedMotion ? 'instant' : 'smooth',
    })
  }

  useEffect(() => {
    if (!ready || visit || !resumeStopRef.current) return
    const index = orderedStops.findIndex((stop) => stop._id === resumeStopRef.current)
    resumeStopRef.current = null
    if (index >= 0) {
      const wrap = wrapRef.current
      if (wrap) window.scrollTo({top: (wrap.offsetHeight - window.innerHeight) * (index + 1.82) / (anchors.length + 1), behavior: 'instant'})
    }
  }, [ready, visit, orderedStops, anchors.length, resumeStopRef])

  if (failed) return (
    <section className="ride-failed">
      <p>The map could not load.</p>
      <p className="entry-meta">{failed}</p>
      {visit && <><h1>{visit.title}</h1><button type="button" onClick={onResume}>Back to map</button></>}
    </section>
  )

  return (
    <section ref={wrapRef} className={`ride${visit ? ' ride--visit' : ''}`}
      style={visit ? undefined : {height: `${(anchors.length + 1) * 100}svh`}}
      role={visit ? 'banner' : undefined}
      aria-label={visit ? `${visit.title} header` : 'Career flyover'}>
      {visit && <VisitHero visit={visit} stopIndex={visitedIndex} stopCount={anchors.length} />}
      {!visit && <FloatingNavigation
        onVisit={() => phase.landing ? navigate(0) : onVisit(orderedStops[phase.index])}
        visitDisabled={!ready || (!phase.landing && phase.dwell <= 0)}
        visitLabel={phase.landing ? 'Start the ride' : 'Visit stop'}
        resumeUrl={settings.resumeUrl} themeControl={themeControl} />}
      <div className="ride-map-slot">
        <div ref={frameNodeRef} className="ride-sticky">
          <div ref={mapNodeRef} className="ride-map" />
          {visit && <button type="button" className="ride-map-resume" onClick={onResume} aria-label="Return to the ride" />}
          {!visit && <RidePreview settings={settings} stop={orderedStops[phase.index]}
            previous={orderedStops[phase.index - 1]} next={orderedStops[phase.index + 1]}
            index={phase.index} count={anchors.length} landing={phase.landing}
            settled={phase.dwell > 0} onNavigate={navigate} />}
          {!ready && <p className="ride-loading" role="status">Loading the map…</p>}
        </div>
      </div>
    </section>
  )
}

export default Flyover
