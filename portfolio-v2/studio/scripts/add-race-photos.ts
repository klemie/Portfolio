/** Append the four user-supplied BWR Arizona photos; preview unless explicitly applied. */
import {createHash} from 'node:crypto'
import {readFile, mkdtemp, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {getCliClient} from 'sanity/cli'
const client = getCliClient({apiVersion: '2025-09-06'}).withConfig({useCdn: false})
const photos = [
  ['39_m-FPIX-26-01320248-DIGITAL_HIGHRES-9417_016656-62273797.JPG', 'Kris riding a dusty trail at BWR Arizona in a white jersey and helmet.'],
  ['41_m-FPIX-26-01320248-DIGITAL_HIGHRES-9417_022619-62273799.JPG', 'Kris climbing a desert trail at BWR Arizona with riders behind.'],
  ['56_m-FPIX-26-01320248-DIGITAL_HIGHRES-9417_027368-62273814.JPG', 'Kris riding with a group on a wide gravel trail at BWR Arizona.'],
  ['PXL_20250224_163112523.jpg', 'A gravel bike resting against a bench in the Arizona desert.'],
]
type Entry = {_key: string; [key: string]: unknown}
type Stop = {_id: string; _rev: string; cycling?: {races?: Entry[]}}
async function run() {
  const folder = process.env.PORTFOLIO_RACE_PHOTO_DIR
  if (!folder) throw new Error('PORTFOLIO_RACE_PHOTO_DIR is required')
  const files = await Promise.all(photos.map(async ([filename, alt]) => {
    const body = await readFile(join(folder, filename))
    if (!body.length) throw new Error(`Empty photo: ${filename}`)
    return {filename, alt, body, key: `photo-${createHash('sha256').update(body).digest('hex').slice(0, 16)}`}
  }))
  const ids = ['stop-fort-street-cycle', 'drafts.stop-fort-street-cycle']
  const docs = await client.fetch<Stop[]>('*[_id in $ids]', {ids})
  if (!docs.some((doc) => doc._id === ids[0])) throw new Error('Published Fort Street stop not found')
  for (const doc of docs) {
    if (doc.cycling?.races?.filter((race) => race._key === 'bwr-az-wafer').length !== 1) throw new Error(`Expected one Arizona race in ${doc._id}`)
  }
  console.log(`Append ${files.length} photos to BWR AZ Wafer in ${docs.map((doc) => doc._id).join(', ')}`)
  if (process.env.PORTFOLIO_APPLY_RACE_PHOTOS !== '1') return
  const snapshot = await mkdtemp(join(tmpdir(), 'portfolio-race-photos-'))
  await writeFile(join(snapshot, 'before.json'), JSON.stringify(docs, null, 2))
  console.log(`Recovery snapshot: ${snapshot}/before.json`)
  const entries: Entry[] = []
  for (const file of files) {
    const asset = await client.assets.upload('image', file.body, {filename: file.filename})
    entries.push({_type: 'image', _key: file.key, alt: file.alt, asset: {_type: 'reference', _ref: asset._id}})
  }
  let transaction = client.transaction()
  for (const doc of docs) {
    const race = doc.cycling!.races!.find((item) => item._key === 'bwr-az-wafer')!
    const previous = Array.isArray(race.gallery) ? race.gallery as Entry[] : []
    const keys = new Set(previous.map((item) => item._key))
    const gallery = [...previous, ...entries.filter((item) => !keys.has(item._key))]
    transaction = transaction.patch(doc._id, (patch) => patch.ifRevisionId(doc._rev).set({'cycling.races[_key=="bwr-az-wafer"].gallery': gallery}))
  }
  await transaction.commit()
  const saved = await client.fetch<Stop[]>('*[_id in $ids]', {ids})
  for (const doc of saved) {
    const gallery = doc.cycling?.races?.find((item) => item._key === 'bwr-az-wafer')?.gallery as Entry[] | undefined
    if (!entries.every((entry) => gallery?.some((item) => item._key === entry._key))) throw new Error(`Verification failed for ${doc._id}`)
  }
  console.log('Verified all four Arizona photos in the saved galleries.')
}
run().catch((error) => {console.error(error.message ?? error); process.exit(1)})
