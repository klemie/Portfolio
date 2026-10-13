/** Preview by default. PORTFOLIO_APPLY_IMAGE=1 publishes a gallery cover image. */
import {createHash} from 'node:crypto'
import {createReadStream} from 'node:fs'
import {readFile} from 'node:fs/promises'
import {basename, extname} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-09-06'}).withConfig({useCdn: false})
const required = (name: string) => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}
type ImageEntry = {_key: string; asset: {_ref: string}; [key: string]: unknown}

async function publish() {
  const slug = required('PORTFOLIO_IMAGE_PROJECT')
  const path = required('PORTFOLIO_IMAGE_FILE')
  const alt = required('PORTFOLIO_IMAGE_ALT')
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(extname(path).toLowerCase())) throw new Error('Use JPEG, PNG, or WebP')
  const body = await readFile(path)
  if (!body.length) throw new Error('Image is empty')
  const projects = await client.fetch<{_id: string; _rev: string; title: string; images?: ImageEntry[]}[]>(
    '*[_type == "project" && !(_id in path("drafts.**")) && slug.current == $slug]{_id,_rev,title,images}', {slug},
  )
  if (projects.length !== 1) throw new Error(`Expected exactly one published project with slug ${slug}`)
  const project = projects[0]
  console.log(`${project.title} → ${basename(path)} (${body.length} bytes)\nDescription: ${alt}`)
  if (process.env.PORTFOLIO_APPLY_IMAGE !== '1') {
    console.log('Preview only. Set PORTFOLIO_APPLY_IMAGE=1 to upload and publish the cover.')
    return
  }
  const asset = await client.assets.upload('image', createReadStream(path), {filename: basename(path)})
  const key = `image-${createHash('sha256').update(body).digest('hex').slice(0, 16)}`
  const existing = (project.images ?? []).find((image) => image._key === key || image.asset?._ref === asset._id)
  const entry = {_type: 'image', _key: existing?._key ?? key, alt, asset: {_type: 'reference', _ref: asset._id}}
  const images = [entry, ...(project.images ?? []).filter((image) => image._key !== entry._key && image.asset?._ref !== asset._id)]
  await client.patch(project._id).ifRevisionId(project._rev).set({images}).commit()
  console.log(`Gallery cover published: ${asset.url}`)
}

publish().catch((error) => {console.error(error.message ?? error); process.exit(1)})
