/**
 * Seeds the four flyover ride stops and uploads the GPX route.
 *
 *   npx sanity exec scripts/seed-stops.ts --with-user-token
 *
 * Idempotent. Blurbs are intentionally left empty — Kris writes those; the
 * schema flags which stops are still unwritten. See docs/flyover-spec.md.
 *
 * Reference arrays are ordered chronologically within each stop, which is the
 * ordering rule in the spec: geographic between stops, chronological inside.
 */
import fs from 'node:fs'
import path from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-09-06'})

const GPX = process.argv[2] ?? path.join(process.env.HOME!, 'Downloads', 'Portfolio website map.gpx')

const TABLETAPP = '87709030-86b7-4a84-a026-5225e33456d2'

interface StopSeed {
  id: string
  title: string
  waypointName: string
  order: number
  experiences: string[]
  projects: string[]
}

const stops: StopSeed[] = [
  {
    id: 'shift',
    // Matches the GPX waypoint and the company name on the experience doc.
    title: 'Shift Browser',
    waypointName: 'Shift Browser',
    order: 0,
    experiences: ['experience-shift-product-engineer'],
    projects: [],
  },
  {
    id: 'helm-operations',
    title: 'Helm Operations',
    waypointName: 'Helm Operations',
    order: 1,
    experiences: [
      'experience-helm-operations-full-stack-developer',
      'experience-helm-operations-contract-software-engineer',
    ],
    projects: [],
  },
  {
    id: 'island-temperature-controls',
    title: 'Island Temperature Controls',
    waypointName: 'Island Temperature Controls',
    order: 2,
    experiences: ['experience-island-temperature-controls-graphics-developer'],
    projects: [],
  },
  {
    id: 'uvic',
    title: 'UVic',
    // The route carries two UVic waypoints ~310 m apart; the ride ends at the
    // second, which is the final point of the track. "UVic 1" is left unused
    // and check:route reports it as an orphan.
    waypointName: 'UVic 2',
    order: 3,
    experiences: [
      'experience-uvic-rocketry-propulsion-member',
      'experience-uvic-rocketry-media-lead',
      'experience-uvic-rocketry-avionics-co-lead',
      'experience-uvic-rocketry-technical-coordinator',
    ],
    projects: [
      'project-hybrid-controls-system',
      'project-xenia-1-flight-computer',
      'project-software-process',
      'project-ground-support',
      TABLETAPP,
      'project-anduril-flight-computer',
      'project-engine-monitoring-system',
    ],
  },
]

const refs = (ids: string[], prefix: string) =>
  ids.map((id, index) => ({_key: `${prefix}${index}`, _type: 'reference' as const, _ref: id}))

async function seed() {
  // Fail loudly rather than writing stops that point at nothing.
  const allRefs = stops.flatMap((stop) => [...stop.experiences, ...stop.projects])
  const found = await client.fetch<string[]>(`*[_id in $ids]._id`, {ids: allRefs})
  const missing = allRefs.filter((id) => !found.includes(id))
  if (missing.length > 0) throw new Error(`referenced documents not found:\n  ${missing.join('\n  ')}`)

  for (const stop of stops) {
    await client.createOrReplace({
      _id: `stop-${stop.id}`,
      _type: 'stop',
      title: stop.title,
      waypointName: stop.waypointName,
      order: stop.order,
      experiences: refs(stop.experiences, 'e'),
      projects: refs(stop.projects, 'p'),
    })
    console.log(
      `  ${stop.order}. ${stop.title} — ${stop.experiences.length} role(s), ${stop.projects.length} project(s)`,
    )
  }

  if (fs.existsSync(GPX)) {
    const asset = await client.assets.upload('file', fs.createReadStream(GPX), {
      filename: 'flyover-route.gpx',
      contentType: 'application/gpx+xml',
    })
    await client.patch('siteSettings').set({
      routeGpx: {_type: 'file', asset: {_type: 'reference', _ref: asset._id}},
    }).commit()
    console.log(`\n  uploaded route ${path.basename(GPX)} -> ${asset._id}`)
  } else {
    console.log(`\n  no GPX at ${GPX} — skipped route upload`)
  }

  console.log('\ndone')
}

seed().catch((error) => {
  console.error(error.message ?? error)
  process.exit(1)
})
