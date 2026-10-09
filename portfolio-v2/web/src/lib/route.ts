/**
 * Route geometry for the flyover: simplification, along-track distance,
 * interpolation and bearings.
 *
 * All distances are metres. Coordinates are [lon, lat] in anything handed to
 * MapLibre, and {lat, lon} in anything handed to a human — the conversion
 * happens at the boundary rather than being carried around.
 */
import type {TrackPoint, Waypoint} from './gpx'

const EARTH_RADIUS = 6371000
const rad = (deg: number) => (deg * Math.PI) / 180
const deg = (radians: number) => (radians * 180) / Math.PI

export const haversine = (
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number => {
  const dLat = rad(bLat - aLat)
  const dLon = rad(bLon - aLon)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(h))
}

/** Initial bearing in degrees, 0 = north. MapLibre's camera bearing convention. */
export const bearingBetween = (
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number => {
  const dLon = rad(bLon - aLon)
  const y = Math.sin(dLon) * Math.cos(rad(bLat))
  const x =
    Math.cos(rad(aLat)) * Math.sin(rad(bLat)) -
    Math.sin(rad(aLat)) * Math.cos(rad(bLat)) * Math.cos(dLon)
  return (deg(Math.atan2(y, x)) + 360) % 360
}

/**
 * Ramer-Douglas-Peucker in a locally-flat metre projection.
 *
 * A Strava *activity* export is one point per second — thousands of them.
 * Handing that straight to MapLibre as a GeoJSON line is wasteful, and the
 * camera only needs enough resolution to look smooth. Route exports are
 * already sparse (~274 points here) so this is mostly insurance.
 */
export const simplify = (points: TrackPoint[], toleranceMetres = 2): TrackPoint[] => {
  if (points.length < 3) return [...points]

  const latScale = 111132
  const lonScale = 111320 * Math.cos(rad(points[0].lat))
  const x = (p: TrackPoint) => p.lon * lonScale
  const y = (p: TrackPoint) => p.lat * latScale

  const keep = new Uint8Array(points.length)
  keep[0] = 1
  keep[points.length - 1] = 1

  const stack: [number, number][] = [[0, points.length - 1]]

  while (stack.length > 0) {
    const [first, last] = stack.pop()!
    if (last - first < 2) continue

    const ax = x(points[first])
    const ay = y(points[first])
    const bx = x(points[last])
    const by = y(points[last])
    const dx = bx - ax
    const dy = by - ay
    const lengthSquared = dx * dx + dy * dy

    let worstIndex = -1
    let worstDistance = 0

    for (let i = first + 1; i < last; i += 1) {
      const px = x(points[i])
      const py = y(points[i])
      let distance: number

      if (lengthSquared === 0) {
        distance = Math.hypot(px - ax, py - ay)
      } else {
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))
        distance = Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
      }

      if (distance > worstDistance) {
        worstDistance = distance
        worstIndex = i
      }
    }

    if (worstDistance > toleranceMetres && worstIndex > 0) {
      keep[worstIndex] = 1
      stack.push([first, worstIndex], [worstIndex, last])
    }
  }

  return points.filter((_, index) => keep[index] === 1)
}

export interface Route {
  points: TrackPoint[]
  /** Cumulative along-track distance at each point. Same length as `points`. */
  cumulative: number[]
  totalDistance: number
  /** GeoJSON [lon, lat] pairs, for the map source. */
  coordinates: [number, number][]
}

export const buildRoute = (track: TrackPoint[], toleranceMetres = 2): Route => {
  const points = simplify(track, toleranceMetres)
  const cumulative = [0]

  for (let i = 1; i < points.length; i += 1) {
    cumulative.push(
      cumulative[i - 1] +
        haversine(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon),
    )
  }

  return {
    points,
    cumulative,
    totalDistance: cumulative[cumulative.length - 1] ?? 0,
    coordinates: points.map((point) => [point.lon, point.lat]),
  }
}

export interface RoutePosition {
  lat: number
  lon: number
  /** Direction of travel at this point, degrees. */
  bearing: number
}

/** Binary search for the segment containing `distance`. */
const segmentAt = (route: Route, distance: number): number => {
  const {cumulative} = route
  let low = 0
  let high = cumulative.length - 1

  while (low < high - 1) {
    const mid = (low + high) >> 1
    if (cumulative[mid] <= distance) low = mid
    else high = mid
  }

  return low
}

/** Interpolated position and heading at an along-track distance. */
export const positionAt = (route: Route, distance: number): RoutePosition => {
  const {points, cumulative} = route

  if (points.length === 0) return {lat: 0, lon: 0, bearing: 0}
  if (points.length === 1) return {lat: points[0].lat, lon: points[0].lon, bearing: 0}

  const clamped = Math.max(0, Math.min(route.totalDistance, distance))
  const i = segmentAt(route, clamped)
  const a = points[i]
  const b = points[Math.min(i + 1, points.length - 1)]

  const segmentLength = cumulative[i + 1] - cumulative[i]
  const t = segmentLength > 0 ? (clamped - cumulative[i]) / segmentLength : 0

  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lon: a.lon + (b.lon - a.lon) * t,
    bearing: bearingBetween(a.lat, a.lon, b.lat, b.lon),
  }
}

/**
 * Perpendicular distance from a point to the route, plus where along the route
 * that happens. Used to place waypoints on the track and to report pins that
 * drift off it.
 */
export const projectOntoRoute = (
  route: Route,
  lat: number,
  lon: number,
): {distance: number; alongTrack: number} => {
  const {points, cumulative} = route
  if (points.length < 2) return {distance: Infinity, alongTrack: 0}

  const latScale = 111132
  const lonScale = 111320 * Math.cos(rad(lat))
  const px = lon * lonScale
  const py = lat * latScale

  let best = Infinity
  let bestAlong = 0

  for (let i = 0; i < points.length - 1; i += 1) {
    const ax = points[i].lon * lonScale
    const ay = points[i].lat * latScale
    const bx = points[i + 1].lon * lonScale
    const by = points[i + 1].lat * latScale
    const dx = bx - ax
    const dy = by - ay
    const lengthSquared = dx * dx + dy * dy

    const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))
    const distance = Math.hypot(px - (ax + t * dx), py - (ay + t * dy))

    if (distance < best) {
      best = distance
      bestAlong = cumulative[i] + t * (cumulative[i + 1] - cumulative[i])
    }
  }

  return {distance: best, alongTrack: bestAlong}
}

export interface RideStop {
  /** Matches the Sanity stop's waypointName. */
  name: string
  lat: number
  lon: number
  /** Where this stop sits along the route. */
  alongTrack: number
  /** How far the waypoint was from the line. Should be ~0 for GPX waypoints. */
  offTrack: number
}

/**
 * Places the GPX waypoints along the route, in route order.
 *
 * `order` from Sanity decides presentation order, but the camera has to visit
 * them in the order the line actually reaches them — otherwise it would double
 * back. Where the two disagree, the route wins and the caller is told.
 */
export const placeWaypoints = (route: Route, waypoints: Waypoint[]): RideStop[] =>
  waypoints
    .map((waypoint) => {
      const {distance, alongTrack} = projectOntoRoute(route, waypoint.lat, waypoint.lon)
      return {
        name: waypoint.name,
        lat: waypoint.lat,
        lon: waypoint.lon,
        alongTrack,
        offTrack: distance,
      }
    })
    .sort((a, b) => a.alongTrack - b.alongTrack)
