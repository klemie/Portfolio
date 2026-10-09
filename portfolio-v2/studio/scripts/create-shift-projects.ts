/**
 * Preview: pnpm exec sanity exec scripts/create-shift-projects.ts --with-user-token
 * Create drafts: PORTFOLIO_CREATE_SHIFT_DRAFTS=1 pnpm exec sanity exec scripts/create-shift-projects.ts --with-user-token
 * Creates unpublished drafts only, preserving existing documents and content.
 */
import {getCliClient} from 'sanity/cli'
import {shiftProjectSeeds} from '../../shared/shiftProjects'

const client = getCliClient({apiVersion: '2025-09-06'}).withConfig({useCdn: false, perspective: 'raw'})
interface ExistingProject {
  _id: string
  title: string
  slug?: {current: string}
  experience?: {_ref: string}
}

async function createProjects() {
  const parentId = shiftProjectSeeds[0].experience._ref
  const parent = await client.fetch<{_id: string; company: string; position: string} | null>(
    '*[_type == "experience" && _id == $id][0]{_id, company, position}', {id: parentId},
  )
  if (!parent || parent.company !== 'Shift Browser') throw new Error('The Shift Browser experience could not be verified.')

  const ids = shiftProjectSeeds.flatMap((project) => [project._id, `drafts.${project._id}`])
  const slugs = shiftProjectSeeds.map((project) => project.slug.current)
  const titles = shiftProjectSeeds.map((project) => project.title)
  const existing = await client.fetch<ExistingProject[]>(
    '*[_type == "project" && (_id in $ids || slug.current in $slugs || title in $titles)]{_id, title, slug, experience}',
    {ids, slugs, titles},
  )
  let transaction = client.transaction()
  let count = 0
  for (const project of shiftProjectSeeds) {
    const matches = existing.filter((item) => item._id.replace(/^drafts\./, '') === project._id || item.slug?.current === project.slug.current || item.title === project.title)
    if (matches.some((item) => item.experience?._ref !== parentId)) throw new Error(`${project.title} already exists with a different or missing experience. No documents changed.`)
    if (matches.length) {
      console.log(`${project.title}: already linked to ${parent.company} — ${parent.position}. Keeping existing content.`)
      continue
    }
    transaction = transaction.createIfNotExists<(typeof shiftProjectSeeds)[number]>({...project, _id: `drafts.${project._id}`})
    count += 1
    console.log(`${project.title} → ${parent.company} — ${parent.position} (unpublished draft)`)
  }
  if (process.env.PORTFOLIO_CREATE_SHIFT_DRAFTS !== '1') {
    console.log('Preview only. No Sanity documents changed.')
    return
  }
  if (count) await transaction.commit()
  const saved = await client.fetch<ExistingProject[]>(
    '*[_type == "project" && _id in $ids]{_id, title, slug, experience}', {ids},
  )
  for (const project of shiftProjectSeeds) {
    if (!saved.some((item) => item._id.replace(/^drafts\./, '') === project._id && item.experience?._ref === parentId) &&
        !existing.some((item) => (item.slug?.current === project.slug.current || item.title === project.title) && item.experience?._ref === parentId)) {
      throw new Error(`Could not verify the saved ${project.title} draft.`)
    }
  }
  console.log(`Created ${count} project drafts. Nothing published.`)
}

createProjects().catch((error) => {console.error(error.message ?? error); process.exit(1)})
