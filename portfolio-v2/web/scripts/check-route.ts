/**
 * Validates a GPX route against the ride stops in Sanity.
 *
 *   pnpm --filter web check:route                     # route from Sanity
 *   pnpm --filter web check:route path/to/file.gpx    # a local file
 *
 * Reports the things that actually break the ride: a stop with no matching
 * waypoint, a waypoint with no stop, pins that sit off the line, and the leg
 * distances that drive camera pacing. Exits non-zero if the route is unusable.
 */
import {readFileSync} from 'node:fs'
import {parseGpx} from '../src/lib/gpx'
import {buildRoute, placeWaypoints} from '../src/lib/route'

const PROJECT = process.env.VITE_SANITY_PROJECT_ID ?? 'az7tzozl'
const DATASET = process.env.VITE_SANITY_DATASET ?? 'production'
const API = process.env.VITE_SANITY_API_VERSION ?? '2025-09-06'

const query = async <T>(groq: string): Promise<T> => {
  const url = new URL(`https://${PROJECT}.api.sanity.io/v${API}/data/query/${DATASET}`)
  url.searchParams.set('query', groq)
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Sanity ${response.status}: ${await response.text()}`)
  return (await response.json()).result as T
}

interface StopDoc {
  title: string
  waypointName: string
  order: number
  blurb: string | null
  projectCount: number
  experienceCount: number
}

const main = async () => {
  const stops = await query<StopDoc[]>(
    `*[_type == "stop"] | order(order asc){
       title, waypointName, order, blurb,
       "projectCount": count(projects), "experienceCount": count(experiences)
     }`,
  )

  const localPath = process.argv[2]
  let xml: string

  if (localPath) {
    xml = readFileSync(localPath, 'utf8')
    console.log(`route: ${localPath}`)
  } else {
    const url = await query<string | null>(
      `*[_id == "siteSettings"][0].routeGpx.asset->url`,
    )
    if (!url) throw new Error('no routeGpx uploaded to siteSettings, and no local path given')
    xml = await (await fetch(url)).text()
    console.log(`route: ${url}`)
  }

  const gpx = parseGpx(xml)
  const raw = gpx.track.length
  const route = buildRoute(gpx.track)
  const placed = placeWaypoints(route, gpx.waypoints)

  console.log(`       "${gpx.name ?? 'untitled'}"`)
  console.log(
    `       ${raw} points -> ${route.points.length} after simplify, ` +
      `${(route.totalDistance / 1000).toFixed(2)} km\n`,
  )

  let fatal = false

  // --- stops vs waypoints --------------------------------------------------
  console.log('stops:')
  const byName = new Map(placed.map((stop) => [stop.name.toLowerCase(), stop]))

  for (const stop of stops) {
    const match = byName.get(stop.waypointName.toLowerCase())
    if (!match) {
      console.log(`  MISSING  ${stop.title} — no <wpt> named "${stop.waypointName}"`)
      fatal = true
      continue
    }
    const off = match.offTrack > 25 ? `  ${match.offTrack.toFixed(0)}m off-track` : ''
    const blurb = stop.blurb ? `${stop.blurb.trim().split(/\s+/).length}w` : 'no blurb'
    console.log(
      `  ok       ${stop.order}. ${stop.title.padEnd(28)} ` +
        `${(match.alongTrack / 1000).toFixed(2)} km  ${blurb}` +
        `  ${stop.experienceCount}r/${stop.projectCount}p${off}`,
    )
  }

  const stopNames = new Set(stops.map((stop) => stop.waypointName.toLowerCase()))
  for (const waypoint of placed) {
    if (!stopNames.has(waypoint.name.toLowerCase())) {
      console.log(`  ORPHAN   <wpt> "${waypoint.name}" has no stop document`)
    }
  }

  // --- route order vs sanity order ----------------------------------------
  const matched = stops
    .map((stop) => ({stop, placed: byName.get(stop.waypointName.toLowerCase())}))
    .filter((entry): entry is {stop: StopDoc; placed: NonNullable<typeof entry.placed>} =>
      Boolean(entry.placed),
    )

  const outOfOrder = matched.some(
    (entry, index) => index > 0 && entry.placed.alongTrack < matched[index - 1].placed.alongTrack,
  )
  if (outOfOrder) {
    console.log('\n  WARNING  Sanity `order` disagrees with the order the route reaches them.')
    console.log('           The camera follows the route; presentation order will differ.')
  }

  // --- pacing --------------------------------------------------------------
  if (matched.length > 1) {
    console.log('\nlegs (drive camera speed):')
    const legs: number[] = []
    for (let i = 1; i < matched.length; i += 1) {
      const length = matched[i].placed.alongTrack - matched[i - 1].placed.alongTrack
      legs.push(length)
      const bar = '#'.repeat(Math.max(1, Math.round(length / 250)))
      console.log(
        `  ${matched[i - 1].stop.title.padEnd(28)} -> ${matched[i].stop.title.padEnd(28)} ` +
          `${(length / 1000).toFixed(2)} km  ${bar}`,
      )
    }
    const swing = Math.max(...legs) / Math.min(...legs)
    console.log(`\n  speed variance ${swing.toFixed(1)}x across ${legs.length} legs`)
  }

  const unwritten = stops.filter((stop) => !stop.blurb).length
  if (unwritten > 0) console.log(`\n${unwritten} of ${stops.length} blurbs still unwritten`)

  if (fatal) {
    console.log('\nFAIL — the ride cannot render every stop.')
    process.exit(1)
  }
  console.log('\nOK')
}

main().catch((error) => {
  console.error(error.message ?? error)
  process.exit(1)
})
