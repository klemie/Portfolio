/** Preview by default. PORTFOLIO_PUBLISH_HELM_PROJECT=1 creates the requested public project. */
import {readFile, mkdtemp, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join, basename} from 'node:path'
import {createHash} from 'node:crypto'
import {isDeepStrictEqual} from 'node:util'
import {getCliClient} from 'sanity/cli'
import {helmLogisticsProject} from '../../shared/helmLogisticsProject'

const client = getCliClient({apiVersion: '2025-09-06'}).withConfig({useCdn: false, perspective: 'raw'})
async function run() {
  const file = process.env.PORTFOLIO_HELM_IMAGE
  if (!file) throw new Error('PORTFOLIO_HELM_IMAGE is required')
  const image = await readFile(file)
  if (!image.length) throw new Error('Image is empty')
  const parentId = helmLogisticsProject.experience._ref
  const parent = await client.fetch<{_id: string; company: string; position: string; startDate: string; endDate?: string} | null>(
    '*[_type == "experience" && _id == $id][0]{_id, company, position, startDate, endDate}', {id: parentId},
  )
  if (!parent || parent.company !== 'Helm Operations' || !parent.position.includes('Co-op')) throw new Error('Helm co-op role could not be verified')
  const existing = await client.fetch<{_id: string; experience?: {_ref: string}}[]>(
    '*[_type == "project" && (_id in $ids || slug.current == $slug)]',
    {ids: [helmLogisticsProject._id, `drafts.${helmLogisticsProject._id}`], slug: helmLogisticsProject.slug.current},
  )
  if (existing.length) {
    if (existing.some((doc) => doc.experience?._ref !== parentId)) throw new Error('Existing project belongs to another role')
    console.log('Project already exists. Existing content preserved.')
    return
  }
  const month = (date: string) => new Intl.DateTimeFormat('en', {month: 'short', year: 'numeric', timeZone: 'UTC'}).format(new Date(`${date}T00:00:00Z`))
  const timeline = [parent.startDate, parent.endDate].filter((date): date is string => Boolean(date)).map(month)
  console.log(`${helmLogisticsProject.title} → ${parent.company} / ${parent.position}\n${timeline.join(' – ')}\n\n${helmLogisticsProject.overview}\n\nMy contribution\n${helmLogisticsProject.skillDescription}\n\nImage: ${basename(file)}\nWebsite: ${helmLogisticsProject.websiteLink}`)
  if (process.env.PORTFOLIO_PUBLISH_HELM_PROJECT !== '1') {
    console.log('Preview only. No content changed.')
    return
  }
  const snapshot = await mkdtemp(join(tmpdir(), 'portfolio-helm-project-'))
  await writeFile(join(snapshot, 'before.json'), JSON.stringify({parent, existing}, null, 2))
  const asset = await client.assets.upload('image', image, {filename: basename(file)})
  const project = {...helmLogisticsProject, timeline, images: [{
    _type: 'image', _key: `image-${createHash('sha256').update(image).digest('hex').slice(0, 16)}`,
    alt: 'Helm CONNECT Logistics dispatch preview showing trips, expanded vessel details, and saved-filter controls.',
    asset: {_type: 'reference', _ref: asset._id},
  }]}
  await client.createIfNotExists(project)
  const saved = await client.getDocument<Record<string, unknown>>(project._id)
  if (!saved || !Object.entries(project).every(([key, value]) => isDeepStrictEqual(saved[key], value))) throw new Error('Published project could not be verified')
  console.log(`Published and verified: /projects/${project.slug.current}`)
}
run().catch((error) => {console.error(error.message ?? error); process.exit(1)})
