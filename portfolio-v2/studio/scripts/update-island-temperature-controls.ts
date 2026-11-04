/** Upload Kris's ITC work samples and expand the existing role. Preview by default. */
import {createHash} from 'node:crypto'
import {readFile, mkdtemp, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {isDeepStrictEqual} from 'node:util'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-09-06'}).withConfig({useCdn: false, perspective: 'raw'})
const id = 'experience-island-temperature-controls-graphics-developer'
const about = `During my co-op with Island Temperature Controls, I worked with a small team on web interfaces for building heating, ventilation, and air conditioning systems at Canadian Forces Base Esquimalt. The work focused on graphics for direct digital control (DDC): making equipment and building information understandable to the technicians using the system.

I used electrical floor plans and HVAC mechanical drawings to inform my UI designs, translating the physical systems into clear interface layouts. The work samples show a building floor-plan overview and detailed equipment screens. These bring together room temperatures, setpoints, equipment states, and airflow diagrams so technicians can relate the interface to the physical systems they work with.

I gathered requirements from other teams and reviewed designs directly with HVAC technicians, refining both the accuracy of the graphics and the user experience. This meant translating technical information into clear visual layouts and checking that the screens reflected the equipment and workflows they supported.`
const photos = [
  ['IMG_20210414_125706.jpg', 'Building floor-plan graphics in the enteliVIZ editor, showing room temperatures and equipment information.'],
  ['AC UNITS.png', 'Air-conditioning unit overview showing equipment states, room temperatures, and temperature setpoints.'],
  ['UH1.png', 'UH1 equipment view showing airflow, sensor readings, heating components, and room information.'],
]
type Image = {_key: string; asset?: {_ref: string; _type?: string}; [key: string]: unknown}
type Experience = {_id: string; _rev: string; _type: string; company: string; about?: string; images?: Image[]}

async function run() {
  const folder = process.env.PORTFOLIO_ITC_IMAGE_DIR
  if (!folder) throw new Error('PORTFOLIO_ITC_IMAGE_DIR is required')
  const files = await Promise.all(photos.map(async ([filename, alt]) => {
    const body = await readFile(join(folder, filename))
    if (!body.length) throw new Error(`Empty image: ${filename}`)
    return {filename, alt, body, key: `image-${createHash('sha256').update(body).digest('hex').slice(0, 16)}`}
  }))
  const ids = [id, `drafts.${id}`]
  const docs = await client.fetch<Experience[]>('*[_id in $ids]', {ids})
  if (!docs.some((doc) => doc._id === id)) throw new Error('Published experience not found')
  for (const doc of docs) {
    if (doc._type !== 'experience' || doc.company !== 'Island Temperature Controls') throw new Error(`Unexpected document: ${doc._id}`)
  }
  console.log(`Add ${files.length} work samples to Island Temperature Controls.\n\n${about}`)
  if (process.env.PORTFOLIO_APPLY_ITC !== '1') {
    console.log('\nPreview only. Set PORTFOLIO_APPLY_ITC=1 to upload and save.')
    return
  }
  const snapshot = await mkdtemp(join(tmpdir(), 'portfolio-itc-'))
  await writeFile(join(snapshot, 'before.json'), JSON.stringify(docs, null, 2))
  console.log(`Recovery snapshot: ${snapshot}/before.json`)
  const additions: Image[] = []
  for (const file of files) {
    const asset = await client.assets.upload('image', file.body, {filename: file.filename})
    additions.push({_type: 'image', _key: file.key, alt: file.alt, asset: {_type: 'reference', _ref: asset._id}})
  }
  let transaction = client.transaction()
  const expected = new Map<string, {about: string; images: Image[]}>()
  for (const doc of docs) {
    const previous = doc.images ?? []
    const images = [...previous, ...additions.filter((image) => !previous.some((item) => item._key === image._key || item.asset?._ref === image.asset?._ref))]
    const fields = {about, images}
    expected.set(doc._id, fields)
    transaction = transaction.patch(doc._id, (patch) => patch.ifRevisionId(doc._rev).set(fields))
  }
  await transaction.commit()
  const saved = await client.fetch<Experience[]>('*[_id in $ids]', {ids})
  for (const [docId, fields] of expected) {
    const doc = saved.find((item) => item._id === docId)
    if (!doc || doc.about !== fields.about || !isDeepStrictEqual(doc.images, fields.images)) throw new Error(`Verification failed: ${docId}`)
  }
  console.log('Verified the expanded description and three images in Sanity.')
}
run().catch((error) => {console.error(error.message ?? error); process.exit(1)})
