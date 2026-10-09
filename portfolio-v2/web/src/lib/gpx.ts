/**
 * Minimal GPX reader for Strava route exports.
 *
 * Deliberately regex-based rather than DOMParser: GPX is a flat, predictable
 * document, this keeps the module environment-independent so the route maths
 * can be exercised in Node, and it avoids parsing a 26KB XML tree on the
 * critical path of the landing page.
 *
 * Strava *route* exports carry <wpt> elements; *activity* exports do not.
 * The pins come from those waypoints — see docs/flyover-spec.md §3.
 */

export interface TrackPoint {
  lat: number
  lon: number
  /** Metres. Present on Strava exports; 0 when the file omits <ele>. */
  ele: number
}

export interface Waypoint {
  name: string
  lat: number
  lon: number
}

export interface ParsedGpx {
  name: string | null
  track: TrackPoint[]
  waypoints: Waypoint[]
}

const TRKPT = /<trkpt[^>]*\blat="([-\d.]+)"[^>]*\blon="([-\d.]+)"[^>]*>([\s\S]*?)<\/trkpt>/g
const TRKPT_SELF_CLOSING = /<trkpt[^>]*\blat="([-\d.]+)"[^>]*\blon="([-\d.]+)"[^>]*\/>/g
const WPT = /<wpt[^>]*\blat="([-\d.]+)"[^>]*\blon="([-\d.]+)"[^>]*>([\s\S]*?)<\/wpt>/g
const ELE = /<ele>([-\d.]+)<\/ele>/
const NAME = /<name>([\s\S]*?)<\/name>/

const decode = (raw: string) =>
  raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim()

export const parseGpx = (xml: string): ParsedGpx => {
  const track: TrackPoint[] = []

  for (const match of xml.matchAll(TRKPT)) {
    track.push({
      lat: Number(match[1]),
      lon: Number(match[2]),
      ele: Number(ELE.exec(match[3])?.[1] ?? 0),
    })
  }
  // Some exporters emit bare self-closing trkpts with no children.
  if (track.length === 0) {
    for (const match of xml.matchAll(TRKPT_SELF_CLOSING)) {
      track.push({lat: Number(match[1]), lon: Number(match[2]), ele: 0})
    }
  }

  const waypoints: Waypoint[] = []
  for (const match of xml.matchAll(WPT)) {
    const name = NAME.exec(match[3])?.[1]
    if (!name) continue
    waypoints.push({name: decode(name), lat: Number(match[1]), lon: Number(match[2])})
  }

  // <metadata><name> comes first; fall back to the <trk><name>.
  const name = NAME.exec(xml)?.[1]

  return {name: name ? decode(name) : null, track, waypoints}
}
