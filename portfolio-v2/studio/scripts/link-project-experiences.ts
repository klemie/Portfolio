/**
 * Preview: pnpm exec sanity exec scripts/link-project-experiences.ts --with-user-token
 * Apply: PORTFOLIO_APPLY_RELATIONS=1 pnpm exec sanity exec scripts/link-project-experiences.ts --with-user-token
 * Adds references only where absent and preserves all existing content/assets.
 */
import {getCliClient} from 'sanity/cli'
import {capstoneExperience, legacyProjectEmbeds, legacyProjectExperiences, legacyProjectOrder} from '../../shared/projectExperienceMigration'

const client = getCliClient({apiVersion: '2025-09-06'}).withConfig({useCdn: false})
interface Document {
  _id: string
  _rev: string
  title?: string
  slug?: {current: string}
  experience?: {_ref: string}
  embedUrl?: string
  viewerOrder?: number
  experiences?: {_key: string; _type: 'reference'; _ref: string}[]
}

async function migrate() {
  const apply = process.env.PORTFOLIO_APPLY_RELATIONS === '1'
  const documents = await client.fetch<Document[]>('*[_type in ["project", "experience", "stop"]]')
  const projects = documents.filter((document) => document.slug?.current)
  const stop = documents.find((document) => document._id === 'stop-uvic')
  const parents = new Set(documents.map((document) => document._id))
  parents.add(capstoneExperience._id)
  const needsCapstone = projects.some((project) => project.slug?.current === 'tabletapp')
  let transaction = client.transaction()
  if (needsCapstone) transaction = transaction.createIfNotExists(capstoneExperience)
  for (const project of projects) {
    const slug = project.slug!.current
    const parent = project.experience?._ref ?? legacyProjectExperiences[slug]
    if (!parent || !parents.has(parent)) throw new Error(`Choose an existing experience for ${project.title ?? project._id} before applying this migration.`)
    const fields: Record<string, unknown> = {}
    if (!project.experience?._ref) fields.experience = {_type: 'reference', _ref: parent}
    if (!project.embedUrl && legacyProjectEmbeds[slug]) fields.embedUrl = legacyProjectEmbeds[slug]
    if (project.viewerOrder === undefined && legacyProjectOrder[slug] !== undefined) fields.viewerOrder = legacyProjectOrder[slug]
    if (!Object.keys(fields).length) continue
    console.log(`${project.title ?? project._id} → ${parent}${fields.embedUrl ? ' + embedded preview' : ''}`)
    transaction = transaction.patch(project._id, (patch) => patch.ifRevisionId(project._rev).set(fields))
  }
  if (needsCapstone && stop && !stop.experiences?.some((role) => role._ref === capstoneExperience._id)) {
    const roles = [...(stop.experiences ?? [])]
    const latest = roles.findIndex((role) => role._ref === 'experience-uvic-rocketry-technical-coordinator')
    roles.splice(latest < 0 ? roles.length : latest, 0, {_key: 'capstone', _type: 'reference', _ref: capstoneExperience._id})
    transaction = transaction.patch(stop._id, (patch) => patch.ifRevisionId(stop._rev).set({experiences: roles}))
    console.log('Add University of Victoria — Capstone project to the UVic stop.')
  }
  if (apply) {
    await transaction.commit()
    console.log('Project relationships applied.')
  } else {
    console.log('Preview only. No Sanity documents changed.')
  }
}

migrate().catch((error) => {console.error(error.message ?? error); process.exit(1)})
