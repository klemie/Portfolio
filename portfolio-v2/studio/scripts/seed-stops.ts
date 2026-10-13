/**
 * Preview the six ride stops and route, preserving authored content.
 *   pnpm exec sanity exec scripts/seed-stops.ts --with-user-token
 * Set PORTFOLIO_APPLY_STOPS=1 to upload the route and commit the stop updates.
 * An optional GPX path may be supplied as the first argument.
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {getCliClient} from 'sanity/cli'
import {cyclingRaceSeeds, rideStopSeeds} from '../../shared/rideStops'
import {parseGpx} from '../../web/src/lib/gpx'
import {buildRoute, placeWaypoints} from '../../web/src/lib/route'

const client = getCliClient({apiVersion: '2025-09-06'}).withConfig({useCdn: false})
const GPX = process.argv[2] ?? path.resolve('..', 'web', 'public', 'flyover-route.gpx')
type Reference = {_key: string; _type: 'reference'; _ref: string}
interface Document {
  _id: string
  _rev: string
  _type: string
  company?: string
  experience?: {_ref: string}
  experiences?: Reference[]
  projects?: Reference[]
  cycling?: {races?: {_key: string; title: string; url?: string}[]}
}
const refs = (ids: string[], prefix: string): Reference[] =>
  [...new Set(ids)].map((id, index) => ({_key: `${prefix}${index}`, _type: 'reference', _ref: id}))

async function seed() {
  const gpx = parseGpx(fs.readFileSync(GPX, 'utf8'))
  if (gpx.track.length < 2) throw new Error('GPX needs at least two track points')
  const route = buildRoute(gpx.track)
  const placed = placeWaypoints(route, gpx.waypoints)
  let previous = -1
  for (const stop of rideStopSeeds) {
    const matches = placed.filter((point) => point.name === stop.waypointName)
    if (matches.length !== 1) throw new Error(`Expected one waypoint named "${stop.waypointName}"`)
    const point = matches[0]
    if (point.offTrack > 25) throw new Error(`${stop.title} is ${point.offTrack.toFixed(0)} m off the route`)
    if (point.alongTrack <= previous) throw new Error(`${stop.title} does not follow the preceding stop on the route`)
    previous = point.alongTrack
  }
  console.log(`Route: ${path.basename(GPX)} — ${(route.totalDistance / 1000).toFixed(2)} km, ${placed.length} waypoints`)

  const documents = await client.fetch<Document[]>('*[(_type in ["stop", "experience", "project"] || _id == "siteSettings") && !(_id in path("drafts.**"))]')
  const byId = new Map(documents.map((document) => [document._id, document]))
  const settings = byId.get('siteSettings')
  if (!settings) throw new Error('siteSettings not found')
  const rocketryIds = new Set(documents.filter((document) => document._type === 'experience' && document.company === 'UVic Rocketry').map((document) => document._id))
  const rocketryProjectIds = new Set(documents.filter((document) => document._type === 'project' && rocketryIds.has(document.experience?._ref ?? '')).map((document) => document._id))
  const uvic = byId.get('stop-uvic')
  const updates = rideStopSeeds.map((stop) => {
    const existing = byId.get(`stop-${stop.id}`)
    const experienceIds = [...stop.experiences, ...(existing?.experiences ?? []).map((ref) => ref._ref)]
    const projectIds = [...stop.projects, ...(existing?.projects ?? []).map((ref) => ref._ref)]
    if (stop.id === 'uvic-rocketry') {
      experienceIds.push(...(uvic?.experiences ?? []).filter((ref) => rocketryIds.has(ref._ref)).map((ref) => ref._ref))
      projectIds.push(...(uvic?.projects ?? []).filter((ref) => rocketryProjectIds.has(ref._ref)).map((ref) => ref._ref))
    }
    const fields: Record<string, unknown> = {
      title: stop.title, waypointName: stop.waypointName, order: stop.order,
      experiences: refs(experienceIds.filter((id) => stop.id !== 'uvic' || !rocketryIds.has(id)), 'e'),
      projects: refs(projectIds.filter((id) => stop.id !== 'uvic' || !rocketryProjectIds.has(id)), 'p'),
    }
    const missing = [...fields.experiences as Reference[], ...fields.projects as Reference[]].filter((ref) => !byId.has(ref._ref))
    if (missing.length) throw new Error(`Referenced documents not found: ${missing.map((ref) => ref._ref).join(', ')}`)
    if (stop.id === 'fort-street-cycle') {
      const races = [...(existing?.cycling?.races ?? [])]
      for (const race of cyclingRaceSeeds) {
        if (!races.some((entry) => entry._key === race._key || entry.url === race.url || entry.title === race.title)) races.push(race)
      }
      fields['cycling.races'] = races
    }
    console.log(`  ${stop.order}. ${stop.title} — ${(fields.experiences as Reference[]).length} role(s), ${(fields.projects as Reference[]).length} legacy project(s)${stop.id === 'fort-street-cycle' ? ', 2 race stories' : ''}`)
    return {id: `stop-${stop.id}`, existing, fields}
  })

  if (process.env.PORTFOLIO_APPLY_STOPS !== '1') {
    console.log('Preview only. Set PORTFOLIO_APPLY_STOPS=1 to apply.')
    return
  }
  const snapshot = path.join(os.tmpdir(), `portfolio-ride-before-${Date.now()}.json`)
  fs.writeFileSync(snapshot, JSON.stringify(documents.filter((document) => document._type === 'stop' || document._id === 'siteSettings'), null, 2))
  console.log(`Recovery snapshot: ${snapshot}`)
  const asset = await client.assets.upload('file', fs.createReadStream(GPX), {filename: 'flyover-route.gpx', contentType: 'application/gpx+xml'})
  let transaction = client.transaction()
  for (const {id, existing, fields} of updates) {
    if (existing) transaction = transaction.patch(id, (patch) => patch.ifRevisionId(existing._rev).set(fields))
    else {
      const {['cycling.races']: races, ...base} = fields
      transaction = transaction.create({_id: id, _type: 'stop', ...base, ...(races ? {cycling: {_type: 'object', races}} : {})})
    }
  }
  transaction = transaction.patch('siteSettings', (patch) => patch.ifRevisionId(settings._rev).set({routeGpx: {_type: 'file', asset: {_type: 'reference', _ref: asset._id}}}))
  await transaction.commit()
  console.log('Six stops and the GPX route published. Existing blurbs, media, and cycling stories preserved.')
}

seed().catch((error) => {console.error(error.message ?? error); process.exit(1)})
