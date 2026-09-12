/**
 * Maps scroll position to a camera state.
 *
 * Pure, so the pacing can be reasoned about and tested without a WebGL
 * context. Everything MapLibre-specific lives in Flyover.tsx.
 *
 * The page is divided into equal slices: one for the landing approach, then
 * one per stop. Each stop's slice is split into a travel phase and a dwell
 * phase. The camera is completely still through every dwell, so a blurb is
 * never read over a moving map (spec §1) and the project cards anchored to a
 * stop do not drift while being clicked.
 *
 * Legs differ ~6.8x in length but each gets equal scroll, which is the
 * accepted trade in spec §8. Easing in and out of every stop is what keeps
 * that reading as deliberate rather than broken: the fast middle of a long leg
 * is bracketed by a slow departure and a slow arrival.
 */
import {bearingBetween, positionAt, type Route} from '../lib/route'

export interface CameraState {
  center: [number, number]
  zoom: number
  bearing: number
  pitch: number
}

export interface StopAnchor {
  name: string
  alongTrack: number
}

export interface RideState {
  camera: CameraState
  /** Index of the stop currently being approached or dwelt at. */
  stopIndex: number
  /** 0 while travelling, ramps 0..1 through the dwell phase. */
  dwell: number
  /** Fraction of the route line that should be drawn. */
  routeProgress: number
  /** True during the landing approach, before the ride proper. */
  landing: boolean
}

/** Share of a stop's slice spent travelling; the rest is dwell. */
const TRAVEL_SHARE = 0.6

const DWELL_ZOOM = 15.6
const DWELL_PITCH = 52
const TRAVEL_PITCH = 64

/**
 * Metres used to derive a tangent. Long enough that a single corner does not
 * swing the camera — heading follows the shape of the leg, not the street.
 */
const LOOKAHEAD = 400

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Interpolates the short way around the compass. */
const lerpBearing = (from: number, to: number, t: number) => {
  const delta = ((to - from + 540) % 360) - 180
  return (from + delta * t + 360) % 360
}

export const lerpCamera = (from: CameraState, to: CameraState, t: number): CameraState => ({
  center: [lerp(from.center[0], to.center[0], t), lerp(from.center[1], to.center[1], t)],
  zoom: lerp(from.zoom, to.zoom, t),
  bearing: lerpBearing(from.bearing, to.bearing, t),
  pitch: lerp(from.pitch, to.pitch, t),
})

/** Tangent heading at an along-track distance, measured over LOOKAHEAD metres. */
const tangentAt = (route: Route, distance: number): number => {
  const total = route.totalDistance
  const from = clamp(distance, 0, Math.max(0, total - LOOKAHEAD))
  const to = Math.min(total, from + LOOKAHEAD)
  const a = positionAt(route, from)
  const b = positionAt(route, to)
  return bearingBetween(a.lat, a.lon, b.lat, b.lon)
}

/**
 * One fixed heading per stop, interpolated across a leg while travelling.
 *
 * Deriving heading from the local tangent every frame instead makes the camera
 * whip around at every corner — the raw tangent on this route swings 184 deg
 * to 234 deg to 1 deg inside one leg. Temporal damping would smooth that but
 * break scroll reversibility, so the smoothing has to be positional.
 *
 * Anchoring a single heading at each stop and interpolating between
 * consecutive stops gives continuity for free: a dwell holds exactly the value
 * the adjacent travel phases start and end on.
 *
 * Each stop faces the way the route arrives at it; the first has no approach,
 * so it faces the way it is about to leave.
 */
const stopBearings = (route: Route, anchors: StopAnchor[]): number[] =>
  anchors.map((anchor, index) =>
    index === 0
      ? tangentAt(route, anchor.alongTrack)
      : tangentAt(route, Math.max(0, anchor.alongTrack - LOOKAHEAD)),
  )

/**
 * How far back to pull on a given leg. Long legs lift the camera so the
 * distance reads as distance; short hops stay close so they don't feel like a
 * nudge at altitude.
 */
const travelZoomFor = (legMetres: number): number =>
  clamp(16 - Math.log2(Math.max(legMetres, 1) / 500), 11.8, 15.2)

const cameraAtStop = (route: Route, anchor: StopAnchor, bearing: number): CameraState => {
  const position = positionAt(route, anchor.alongTrack)
  return {
    center: [position.lon, position.lat],
    zoom: DWELL_ZOOM,
    bearing,
    pitch: DWELL_PITCH,
  }
}

export const stopCameras = (route: Route, anchors: StopAnchor[]): CameraState[] => {
  const bearings = stopBearings(route, anchors)
  return anchors.map((anchor, index) => cameraAtStop(route, anchor, bearings[index]))
}

export interface RideOptions {
  /**
   * Serve the ride without the flying camera.
   *
   * The camera holds perfectly still on one stop and cuts to the next at the
   * slice boundary, rather than being scrubbed along the leg between them.
   * Every stop, blurb, pin and project card is still reachable by scrolling —
   * what goes away is the continuous motion, which is the part
   * `prefers-reduced-motion` is actually asking about.
   */
  reducedMotion?: boolean
}

/**
 * @param pageProgress 0..1 across the whole sticky section, landing included.
 * @param establishing Wide opening shot, held at pageProgress 0.
 */
export const rideStateFor = (
  route: Route,
  anchors: StopAnchor[],
  pageProgress: number,
  establishing: CameraState,
  options: RideOptions = {},
): RideState => {
  const count = anchors.length

  if (count === 0) {
    return {camera: establishing, stopIndex: 0, dwell: 0, routeProgress: 0, landing: true}
  }

  const progress = clamp(pageProgress, 0, 1)
  const landingShare = 1 / (count + 1)
  const bearings = stopBearings(route, anchors)
  const startProgress = anchors[0].alongTrack / route.totalDistance

  // --- reduced motion: cut between stops, never interpolate ----------------
  if (options.reducedMotion) {
    if (progress < landingShare) {
      return {
        camera: establishing,
        stopIndex: 0,
        dwell: 0,
        routeProgress: startProgress,
        landing: true,
      }
    }
    const rideT = (progress - landingShare) / (1 - landingShare)
    const index = clamp(Math.floor(rideT * count), 0, count - 1)
    return {
      camera: cameraAtStop(route, anchors[index], bearings[index]),
      stopIndex: index,
      // Settled on arrival: the dwell ramp exists to hold text back while the
      // camera moves, and here it never does.
      dwell: 1,
      routeProgress: anchors[index].alongTrack / route.totalDistance,
      landing: false,
    }
  }

  // --- landing approach: establishing shot flies down into the first stop ---
  if (progress < landingShare) {
    const t = progress / landingShare
    // Arrive a little before the zone ends so the first stop is settled by the
    // time its own slice begins.
    const eased = easeInOutCubic(clamp(t / 0.85, 0, 1))
    return {
      camera: lerpCamera(establishing, cameraAtStop(route, anchors[0], bearings[0]), eased),
      stopIndex: 0,
      dwell: 0,
      routeProgress: startProgress,
      landing: true,
    }
  }

  const rideProgress = (progress - landingShare) / (1 - landingShare)
  const slice = 1 / count
  const index = clamp(Math.floor(rideProgress / slice), 0, count - 1)
  const t = clamp((rideProgress - index * slice) / slice, 0, 1)

  // First stop has nothing to travel from; the landing zone did the approach.
  if (index === 0) {
    return {
      camera: cameraAtStop(route, anchors[0], bearings[0]),
      stopIndex: 0,
      dwell: t,
      routeProgress: startProgress,
      landing: false,
    }
  }

  const previous = anchors[index - 1]
  const current = anchors[index]

  if (t >= TRAVEL_SHARE) {
    return {
      camera: cameraAtStop(route, current, bearings[index]),
      stopIndex: index,
      dwell: (t - TRAVEL_SHARE) / (1 - TRAVEL_SHARE),
      routeProgress: current.alongTrack / route.totalDistance,
      landing: false,
    }
  }

  const legT = t / TRAVEL_SHARE
  const eased = easeInOutCubic(legT)
  const distance = lerp(previous.alongTrack, current.alongTrack, eased)
  const position = positionAt(route, distance)

  // Rise and fall across the leg: highest and furthest back at the midpoint.
  const arc = Math.sin(Math.PI * legT)

  return {
    camera: {
      center: [position.lon, position.lat],
      zoom:
        DWELL_ZOOM -
        (DWELL_ZOOM - travelZoomFor(current.alongTrack - previous.alongTrack)) * arc,
      bearing: lerpBearing(bearings[index - 1], bearings[index], eased),
      pitch: lerp(DWELL_PITCH, TRAVEL_PITCH, arc),
    },
    stopIndex: index,
    dwell: 0,
    routeProgress: distance / route.totalDistance,
    landing: false,
  }
}

