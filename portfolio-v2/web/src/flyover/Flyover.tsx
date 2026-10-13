import {useCallback, useEffect, useMemo, useRef, useState, type RefObject, type ReactNode} from 'react'
import {LngLat, LngLatBounds, Map as MapLibreMap, Marker, type ErrorEvent} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './Flyover.css'
import {buildRoute, placeWaypoints, positionAt, type Route} from '../lib/route'
import {parseGpx} from '../lib/gpx'
import {usePrefersReducedMotion} from '../hooks/usePrefersReducedMotion'
import type {Project, SiteSettings, Stop} from '../lib/types'
import type {Visit} from '../lib/visit'
import {
  addFlyoverLayers,
  buildStyle,
  setRouteProgress,
  setRouteOpacity,
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
import {MusicControl} from '../components/MusicControl'
import {LivingRoute, type LivingRouteHandle} from './LivingRoute'
import {LANDING_SCROLL_STAGES, landingTransitionFor} from './landingTransition'
import {scrollStagesFor, stopProgressFor} from './rideTiming'
import {FinishLine} from './FinishLine'
import {Hero} from '../components/Hero'
import {Contact} from '../components/Contact'

interface FlyoverProps {
  theme: Theme
  themeControl: ReactNode
  settings: SiteSettings
  stops: Stop[]
  projects: Project[]
  /** GPX text, already fetched by the caller. */
  gpx: string
  visit: Visit | null
  onVisit: (stop: Stop) => void
  onProject: (project: Project) => void
  onResume: () => void
  resumeStopRef: RefObject<string | null>
  transitionFromRef: RefObject<MapFrameBounds | null>
  musicPlaying: boolean
  musicAnalyserRef: RefObject<AnalyserNode | null>
  onToggleMusic: () => void
  onStartMusic: () => void
}

// Reserve the visible frame separately. Later legs get 1.5 screens of scroll;
// every stop's dwell gets 40% of that, including the first stop.
const SCROLL_STAGE_HEIGHT = 150

/**
 * Establishing shot: the whole route, north-up to receive the opening trace.
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

  const framed = map.cameraForBounds(bounds, {padding, bearing: 0, pitch: 0})
  // cameraForBounds returns center as LngLat or [lng, lat] depending on how it
  // was constructed; LngLat.convert normalises both.
  const center = framed?.center
    ? LngLat.convert(framed.center)
    : new LngLat(fallback.lon, fallback.lat)

  return {
    center: [center.lng, center.lat],
    zoom: framed?.zoom ?? 11,
    bearing: 0,
    pitch: 0,
  }
}

/** Keep the complete track beside the copy, or below it on portrait screens. */
const finishShot = (map: MapLibreMap, route: Route, frame: HTMLElement): CameraState => {
  const bounds = route.coordinates.reduce((acc, coordinate) => acc.extend(coordinate),
    new LngLatBounds(route.coordinates[0], route.coordinates[0]))
  const canvas = map.getCanvas()
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  const copy = frame.querySelector<HTMLElement>('.ride-finish-copy')?.getBoundingClientRect()
  const rect = frame.getBoundingClientRect()
  const padding = width <= 700 ? {
    top: Math.min(height - Math.min(130, height * 0.2) - 64, (copy?.bottom ?? rect.top + height * 0.5) - rect.top + 24),
    bottom: Math.min(130, height * 0.2), left: 24, right: 24,
  } : {
    top: height * 0.15, bottom: Math.min(150, height * 0.22),
    left: Math.min(width * 0.5, (copy?.right ?? rect.left + width * 0.4) - rect.left + 40),
    right: width * 0.06,
  }
  const framed = map.cameraForBounds(bounds, {padding, bearing: 0})
  const center = LngLat.convert(framed?.center ?? route.coordinates[0])
  return {center: [center.lng, center.lat], zoom: framed?.zoom ?? 11, pitch: 0, bearing: 0}
}

export const Flyover = ({theme, themeControl, settings, stops, projects, gpx, visit, onVisit, onProject, onResume, resumeStopRef, transitionFromRef, musicPlaying, musicAnalyserRef, onToggleMusic, onStartMusic}: FlyoverProps) => {
  const themeRef = useRef(theme)
  themeRef.current = theme
  const styledThemeRef = useRef(theme)
  const frameNodeRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const mapNodeRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const establishingRef = useRef<CameraState | null>(null)
  const finishCameraRef = useRef<CameraState | null>(null)
  const bikeRef = useRef<ReturnType<typeof createBikeMarker> | null>(null)
  const markersRef = useRef<Marker[]>([])
  const frameRef = useRef(0)
  const orbitOffsetsRef = useRef<number[]>([])
  const stateRef = useRef<RideState | null>(null)
  const livingRouteRef = useRef<LivingRouteHandle>(null)
  const routeOpacityRef = useRef(0)

  const [ready, setReady] = useState(false)
  const [highlightedProject, setHighlightedProject] = useState<string | null>(null)
  const [failed, setFailed] = useState<string | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const visiting = Boolean(visit)
  useMapFrameTransition(frameNodeRef, transitionFromRef, visit ? visitPath(visit.target) : null, reducedMotion)

  // Discrete state only — camera updates stay imperative so scrolling does
  // not re-render the tree every frame.
  const [phase, setPhase] = useState<{index: number; dwell: number; landing: boolean; finishing: boolean}>({
    index: 0,
    dwell: 0,
    landing: true,
    finishing: false,
  })
  useEffect(() => { setHighlightedProject(null) }, [visiting, phase.landing])

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
            setRouteOpacity(map, routeOpacityRef.current)
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
          if (frameNodeRef.current) finishCameraRef.current = finishShot(map, route, frameNodeRef.current)

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
      setRouteOpacity(map, routeOpacityRef.current)
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
  const suggestedProjects = useMemo(() => ['engine-monitoring-system', 'shift-pdf-app'].flatMap((slug) => {
    const project = projects.find((project) => project.slug === slug)
    return project ? [project] : []
  }), [projects])
  const suggestedProjectCues = useMemo(() => suggestedProjects.flatMap((project) => {
    const index = orderedStops.findIndex((stop) => stop.experiences.some((experience) => experience._id === project.experienceId))
    return index >= 0 ? [{project, alongTrack: anchors[index].alongTrack}] : []
  }), [suggestedProjects, orderedStops, anchors])
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
      finishCamera: finishCameraRef.current ?? establishing,
    })

    stateRef.current = state
    bikeRef.current?.update(state.routeProgress, !visit || visitedIndex >= 0)
    map.jumpTo(state.camera)
    const introProgress = visit ? 1 : Math.min(LANDING_SCROLL_STAGES, progress * scrollStagesFor(anchors.length))
    const transition = landingTransitionFor(introProgress)
    const frame = frameNodeRef.current
    const finish = state.finish ?? 0
    const finishOpacity = reducedMotion ? finish : Math.max(0, Math.min(1, (finish - 0.25) / 0.55))
    frame?.style.setProperty('--finish-opacity', String(finishOpacity))
    frame?.style.setProperty('--finish-markers-opacity', String(1 - finishOpacity))
    frame?.style.setProperty('--intro-map-reveal', String(transition.mapReveal))
    frame?.style.setProperty('--intro-copy-opacity', String(transition.copyOpacity))
    frame?.style.setProperty('--intro-details-opacity', String(transition.detailsOpacity))
    frame?.style.setProperty('--intro-footer-opacity', String(1 - transition.detailsOpacity))
    frame?.style.setProperty('--first-stop-opacity', String(state.landing || state.stopIndex > 0 || visit ? 1 : Math.min(1, state.dwell / 0.12)))
    livingRouteRef.current?.update(introProgress, map)
    const routeOpacity = visit ? 1 : reducedMotion ? transition.mapReveal : transition.mapRouteOpacity
    if (routeOpacityRef.current !== routeOpacity) {
      routeOpacityRef.current = routeOpacity
      setRouteOpacity(map, routeOpacity)
    }
    setRouteProgress(map, state.routeProgress)
    setPhase((previous) =>
      previous.index === state.stopIndex &&
      previous.landing === state.landing &&
      previous.finishing === (finish > 0) &&
      Math.abs(previous.dwell - state.dwell) < 0.02
        ? previous
        : {index: state.stopIndex, dwell: state.dwell, landing: state.landing, finishing: finish > 0},
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
        if (frameNodeRef.current) finishCameraRef.current = finishShot(map, route, frameNodeRef.current)
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
      if (map && state && !state.landing && !state.finish && state.dwell > 0 &&
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
    if (index >= 0) onStartMusic()
    const top = window.scrollY + wrap.getBoundingClientRect().top
    const scrollable = wrap.offsetHeight - window.innerHeight
    const progress = index < 0 ? 0 : index >= anchors.length ? 1 : stopProgressFor(index, anchors.length)
    window.scrollTo({
      top: top + scrollable * progress,
      behavior: reducedMotion ? 'instant' : 'smooth',
    })
  }

  useEffect(() => {
    if (!ready || visit || !resumeStopRef.current) return
    const index = orderedStops.findIndex((stop) => stop._id === resumeStopRef.current)
    resumeStopRef.current = null
    if (index >= 0) {
      const wrap = wrapRef.current
      if (wrap) window.scrollTo({top: (wrap.offsetHeight - window.innerHeight) * stopProgressFor(index, anchors.length), behavior: 'instant'})
    }
  }, [ready, visit, orderedStops, anchors.length, resumeStopRef])

  if (failed) return (
    <section className="ride-failed">
      <p>The map could not load.</p>
      <p className="entry-meta">{failed}</p>
      {visit && <><h1>{visit.title}</h1><button type="button" onClick={onResume}>Back to map</button></>}
      {!visit && <main className="page"><Hero settings={settings} /><Contact settings={settings} /></main>}
    </section>
  )

  return (
    <section ref={wrapRef} className={`ride${visit ? ' ride--visit' : phase.finishing ? ' ride--finishing' : ''}`}
      style={visit ? undefined : {height: `${100 + scrollStagesFor(anchors.length) * SCROLL_STAGE_HEIGHT}svh`}}
      role={visit ? 'banner' : undefined}
      aria-label={visit ? `${visit.title} header` : 'Career flyover'}>
      {visit && <VisitHero visit={visit} stopIndex={visitedIndex} stopCount={anchors.length} />}
      {!visit && <FloatingNavigation
        onVisit={() => phase.finishing ? navigate(-1) : phase.landing ? navigate(0) : onVisit(orderedStops[phase.index])}
        visitDisabled={!ready || (!phase.landing && !phase.finishing && phase.dwell <= 0)}
        visitLabel={phase.finishing ? 'Ride again' : phase.landing ? 'Start the ride' : 'Visit stop'}
        visitReady={ready && !phase.landing && !phase.finishing && phase.dwell > 0}
        scrollHint={phase.landing || phase.finishing ? undefined : phase.dwell > 0 ? 'Visit this stop or keep scrolling' : 'Keep scrolling to the next stop'}
        contactUrl={phase.finishing ? `mailto:${settings.email}` : undefined}
        resumeUrl={settings.resumeUrl} themeControl={themeControl}
        musicControl={!phase.landing && !phase.finishing && <MusicControl playing={musicPlaying} analyserRef={musicAnalyserRef} onToggle={onToggleMusic} compact />} />}
      <div className="ride-map-slot">
        <div ref={frameNodeRef} className="ride-sticky">
          <div ref={mapNodeRef} className={`ride-map${!visit && phase.landing ? ' ride-map--landing' : ''}`} inert={Boolean(visit) || phase.landing || phase.finishing} />
          {!visit && <RidePreview settings={settings} stop={orderedStops[phase.index]}
            suggestedProjects={suggestedProjects} onProject={onProject}
            highlightedProject={highlightedProject} onHighlightProject={setHighlightedProject}
            previous={orderedStops[phase.index - 1]} next={orderedStops[phase.index + 1]}
            index={phase.index} count={anchors.length} landing={phase.landing} finishing={phase.finishing}
            settled={phase.dwell > 0} onNavigate={navigate}
            musicControl={<MusicControl playing={musicPlaying} analyserRef={musicAnalyserRef} onToggle={onToggleMusic} />} />}
          {!visit && <FinishLine settings={settings} count={anchors.length} active={phase.finishing}
            musicControl={phase.finishing && <MusicControl playing={musicPlaying} analyserRef={musicAnalyserRef} onToggle={onToggleMusic} />} />}
          {!visit && <LivingRoute ref={livingRouteRef} route={route} frameRef={frameNodeRef} reducedMotion={reducedMotion} projectCues={suggestedProjectCues}
            highlightedProject={highlightedProject} onHighlightProject={setHighlightedProject} onProject={onProject} />}
          {!ready && <p className="ride-loading" role="status">Loading the map…</p>}
        </div>
        {visit && <button type="button" className="ride-map-resume" onClick={onResume} aria-label="Back to map — continue the ride">
          <span className="ride-map-resume-copy">
            <span className="ride-map-resume-title">Back to map</span>
            <span className="ride-map-resume-hint">Continue the ride</span>
          </span>
        </button>}
      </div>
    </section>
  )
}

export default Flyover
