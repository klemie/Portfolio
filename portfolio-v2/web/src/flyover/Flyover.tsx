import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {LngLat, LngLatBounds, Map as MapLibreMap, Marker, type ErrorEvent} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './Flyover.css'
import {buildRoute, placeWaypoints, positionAt, type Route} from '../lib/route'
import {parseGpx} from '../lib/gpx'
import {useMediaQuery} from '../hooks/useMediaQuery'
import {usePrefersReducedMotion} from '../hooks/usePrefersReducedMotion'
import type {Project, SiteSettings, Stop} from '../lib/types'
import {
  addFlyoverLayers,
  buildStyle,
  setRouteProgress,
} from './mapStyle'
import {
  rideStateFor,
  type CameraState,
  type RideState,
  type StopAnchor,
} from './camera'
import {StopPanel} from './StopPanel'
import {ProjectPopover} from './ProjectPopover'

interface FlyoverProps {
  settings: SiteSettings
  stops: Stop[]
  /** GPX text, already fetched by the caller. */
  gpx: string
}

/**
 * Portrait layout threshold. Must stay in step with the `max-width` media
 * query in Flyover.css — JS owns the card geometry, CSS owns everything else,
 * and they have to agree on where the split happens.
 */
const COMPACT_QUERY = '(max-width: 900px)'

/** Row pitch for the project card column, in px. Looser when tappable. */
const CARD_PITCH = 34
const CARD_PITCH_COMPACT = 40

/**
 * Screen-space offset for a project card, relative to the stop pin (which the
 * camera always centres).
 *
 * A vertical column rather than a radial fan around the pin: UVic carries all
 * seven projects at a single coordinate, and titles like "Engine Monitoring
 * System" are wide enough that any arc arrangement collapses into an
 * unreadable pile. A column stays legible at any count and still reads as
 * attached to the pin.
 *
 * Portrait has no room to hang the column off to one side — 44px in from the
 * centre of a 390px screen leaves nothing for a title — so it centres on the
 * pin instead and takes the width. The centre card does then sit over the pin
 * dot at a stop carrying an odd number of projects.
 *
 * `y` is where the row's *centre* goes. The caller pairs it with a -50%
 * translate, so the column is centred on the pin without JS needing to know
 * how tall a card renders — which is CSS's business, and differs between the
 * two layouts.
 */
const cardOffset = (
  index: number,
  total: number,
  compact: boolean,
): {x: number; y: number; centred: boolean} => {
  const pitch = compact ? CARD_PITCH_COMPACT : CARD_PITCH
  return {
    x: compact ? 0 : 44,
    y: -((total - 1) * pitch) / 2 + index * pitch,
    centred: compact,
  }
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

export const Flyover = ({settings, stops, gpx}: FlyoverProps) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const mapNodeRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const establishingRef = useRef<CameraState | null>(null)
  const markersRef = useRef<Marker[]>([])
  const frameRef = useRef(0)
  const lockedRef = useRef(false)

  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const [openProject, setOpenProject] = useState<Project | null>(null)

  const compact = useMediaQuery(COMPACT_QUERY)
  const reducedMotion = usePrefersReducedMotion()

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

    let cancelled = false
    let map: MapLibreMap | null = null
    let loadGuard = 0

    const start = positionAt(route, anchors[0].alongTrack)

    buildStyle()
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

  // --- stop pins -----------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = anchors.map((anchor, index) => {
      const position = positionAt(route, anchor.alongTrack)
      const element = document.createElement('div')
      element.className = 'ride-pin'
      element.innerHTML = `<span class="ride-pin-dot"></span><span class="ride-pin-label">${
        orderedStops[index]?.title ?? anchor.name
      }</span>`
      return new Marker({element, anchor: 'center'})
        .setLngLat([position.lon, position.lat])
        .addTo(map)
    })

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [ready, route, anchors, orderedStops])

  // --- scroll scrub --------------------------------------------------------
  const update = useCallback(() => {
    const wrap = wrapRef.current
    const map = mapRef.current
    const establishing = establishingRef.current
    if (!wrap || !map || !establishing) return

    const rect = wrap.getBoundingClientRect()
    const scrollable = rect.height - window.innerHeight
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0

    const state: RideState = rideStateFor(route, anchors, progress, establishing, {
      reducedMotion,
    })

    map.jumpTo({
      center: state.camera.center,
      zoom: state.camera.zoom,
      bearing: state.camera.bearing,
      pitch: state.camera.pitch,
    })
    setRouteProgress(map, state.routeProgress)

    setPhase((previous) =>
      previous.index === state.stopIndex &&
      previous.landing === state.landing &&
      Math.abs(previous.dwell - state.dwell) < 0.02
        ? previous
        : {index: state.stopIndex, dwell: state.dwell, landing: state.landing},
    )
  }, [route, anchors, reducedMotion])

  useEffect(() => {
    if (!ready) return

    const onScroll = () => {
      // Scroll is locked while a popover is open so the ride cannot move out
      // from under the thing being read.
      if (lockedRef.current) return
      cancelAnimationFrame(frameRef.current)
      frameRef.current = requestAnimationFrame(update)
    }

    // Crossing the portrait threshold changes the map container's height (CSS
    // gives the bottom band to the stop panel), and MapLibre sizes its canvas
    // from the container, so it has to be told — and the establishing shot,
    // which frames the route to that canvas, has to be refitted.
    const onResize = () => {
      const map = mapRef.current
      if (map) {
        map.resize()
        if (anchors.length > 0) {
          establishingRef.current = establishingShot(
            map,
            route,
            positionAt(route, anchors[0].alongTrack),
          )
        }
      }
      onScroll()
    }

    update()
    window.addEventListener('scroll', onScroll, {passive: true})
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      cancelAnimationFrame(frameRef.current)
    }
  }, [ready, update, route, anchors])

  // --- popover scroll lock -------------------------------------------------
  useEffect(() => {
    lockedRef.current = openProject !== null
    if (!openProject) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [openProject])

  if (failed) {
    return (
      <section className="ride-failed">
        <p>The map could not load, so the ride is unavailable.</p>
        <p className="entry-meta">{failed}</p>
      </section>
    )
  }

  const activeStop = orderedStops[phase.index]
  const projects = activeStop?.projects ?? []
  const cardsVisible = phase.dwell > 0.25 && !phase.landing

  return (
    <section
      ref={wrapRef}
      className="ride"
      style={{height: `${(anchors.length + 1) * 100}vh`}}
      aria-label="Career flyover"
    >
      <div className="ride-sticky">
        <div ref={mapNodeRef} className="ride-map" />

        <div className="ride-intro" style={{opacity: phase.landing ? 1 : 0}}>
          <div className="ride-intro-plate">
            <h1>{settings.name}</h1>
            <p>take a ride with me</p>
            <span className="ride-intro-cue" aria-hidden="true">
              ⌄
            </span>
          </div>
        </div>

        {!phase.landing && activeStop && (
          <>
            <StopPanel stop={activeStop} dwell={phase.dwell} />
            <p className="ride-counter">
              stop {phase.index + 1} of {anchors.length}
            </p>
          </>
        )}

        {cardsVisible && projects.length > 0 && (
          <div className="ride-cards">
            {projects.map((project, index) => {
              const {x, y, centred} = cardOffset(index, projects.length, compact)
              return (
                <button
                  key={project._id}
                  type="button"
                  className="ride-card"
                  style={{
                    // Vertical -50% always, so the column is centred on the
                    // pin rather than hanging half a row below it; horizontal
                    // only in portrait, where the column straddles the pin
                    // instead of sitting beside it.
                    transform:
                      `translate(${centred ? `calc(-50% + ${x}px)` : `${x}px`}, ` +
                      `calc(-50% + ${y}px))`,
                    animationDelay: `${index * 40}ms`,
                  }}
                  onClick={() => setOpenProject(project)}
                >
                  {project.title}
                </button>
              )
            })}
          </div>
        )}

        {!ready && <p className="ride-loading">Loading the map…</p>}
      </div>

      {openProject && (
        <ProjectPopover project={openProject} onClose={() => setOpenProject(null)} />
      )}
    </section>
  )
}

export default Flyover
