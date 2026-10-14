/** Preview by default. PORTFOLIO_APPLY_INTRODUCTIONS=1 publishes the interviewed content. */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {isDeepStrictEqual} from 'node:util'
import {getCliClient} from 'sanity/cli'
import {stopIntroductionUpdates} from '../../shared/stopIntroductions'

const client = getCliClient({apiVersion: '2025-09-06'}).withConfig({
  useCdn: false,
  perspective: 'raw',
})
interface StopDocument {
  _id: string
  _rev: string
  _type: string
  title: string
  [key: string]: unknown
}

const fieldsFor = (update: (typeof stopIntroductionUpdates)[string]): Record<string, unknown> => ({
  blurb: update.blurb,
  ...(update.education
    ? {
        education: {
          _type: 'education',
          ...update.education,
          ...(update.education.awards
            ? {
                awards: update.education.awards.map((award) => ({
                  _type: 'educationAward',
                  ...award,
                })),
              }
            : {}),
        },
      }
    : {}),
})
const matches = (document: StopDocument, fields: Record<string, unknown>) =>
  Object.entries(fields).every(([key, value]) => isDeepStrictEqual(document[key], value))

async function updateIntroductions() {
  const ids = Object.keys(stopIntroductionUpdates)
  const allIds = ids.flatMap((id) => [id, `drafts.${id}`])
  const documents = await client.fetch<StopDocument[]>('*[_id in $ids]', {ids: allIds})
  const byId = new Map(documents.map((document) => [document._id, document]))
  const patches: {document: StopDocument; fields: Record<string, unknown>}[] = []
  for (const [id, update] of Object.entries(stopIntroductionUpdates)) {
    const published = byId.get(id)
    if (!published || published._type !== 'stop') throw new Error(`Published stop not found: ${id}`)
    const words = update.blurb.trim().split(/\s+/).length
    if (!words || words > 90) throw new Error(`${id}: expected a blurb of 1–90 words`)
    const fields = fieldsFor(update)
    console.log(`\n${published.title} (${words} words)\n${update.blurb}`)
    if (update.education) {
      const education = update.education
      if (!education.degree || education.startYear > (education.endYear ?? Infinity))
        throw new Error(`${id}: invalid education details`)
      console.log(
        `Degree: ${education.degree}\nStudy years: ${education.startYear}–${education.endYear ?? 'Present'}`,
      )
      console.log(`Specializations: ${(education.specializations ?? []).join(', ')}`)
      console.log(`Awards: ${(education.awards ?? []).map((award) => award.title).join('; ')}`)
    }
    for (const document of [published, byId.get(`drafts.${id}`)]) {
      if (!document) continue
      if (document._type !== 'stop') throw new Error(`Expected a stop: ${document._id}`)
      if (!matches(document, fields)) patches.push({document, fields})
    }
  }
  if (process.env.PORTFOLIO_APPLY_INTRODUCTIONS !== '1') {
    console.log(
      `\nPreview only: ${patches.length} document update(s). Set PORTFOLIO_APPLY_INTRODUCTIONS=1 to publish.`,
    )
    return
  }
  if (!patches.length) {
    console.log('\nThe stop introductions and education are already up to date.')
    return
  }
  const snapshot = path.join(os.tmpdir(), `portfolio-introductions-before-${Date.now()}.json`)
  fs.writeFileSync(snapshot, JSON.stringify(documents, null, 2))
  console.log(`\nRecovery snapshot: ${snapshot}`)
  let transaction = client.transaction()
  for (const {document, fields} of patches) {
    transaction = transaction.patch(document._id, (patch) =>
      patch.ifRevisionId(document._rev).set(fields),
    )
  }
  await transaction.commit()
  const saved = await client.fetch<StopDocument[]>('*[_id in $ids]', {
    ids: patches.map(({document}) => document._id),
  })
  const savedById = new Map(saved.map((document) => [document._id, document]))
  for (const {document, fields} of patches) {
    const result = savedById.get(document._id)
    if (!result || !matches(result, fields))
      throw new Error(`Could not verify the saved introduction: ${document._id}`)
  }
  console.log('\nSix stop introductions and UVic education published and verified.')
}

updateIntroductions().catch((error) => {
  console.error(error.message ?? error)
  process.exit(1)
})
