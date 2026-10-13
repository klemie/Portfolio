/** Preview by default. Keeps a CMS draft and a local snapshot before unpublishing. */
import {writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-09-06'}).withConfig({useCdn: false, perspective: 'raw'})
type Document = {_id: string; _rev: string; _type: string; title?: string; projects?: {_ref: string}[]; [key: string]: unknown}

const referencePaths = (value: unknown, id: string, path = ''): string[] => {
  if (!value || typeof value !== 'object') return []
  if (Array.isArray(value)) return value.flatMap((child, index) => referencePaths(child, id, `${path}[${index}]`))
  const object = value as Record<string, unknown>
  if (object._ref === id) return [path]
  return Object.entries(object).flatMap(([key, child]) => referencePaths(child, id, path ? `${path}.${key}` : key))
}

async function unpublish() {
  const slug = process.env.PORTFOLIO_UNPUBLISH_PROJECT?.trim()
  if (!slug) throw new Error('PORTFOLIO_UNPUBLISH_PROJECT is required')
  const projects = await client.fetch<Document[]>(
    '*[_type == "project" && !(_id in path("drafts.**")) && slug.current == $slug]', {slug},
  )
  if (projects.length !== 1) throw new Error(`Expected one published project with slug ${slug}`)
  const project = projects[0]
  const draftId = `drafts.${project._id}`
  const draft = await client.getDocument<Document>(draftId)
  if (draft && draft._type !== 'project') throw new Error('Unexpected draft document type')
  const references = await client.fetch<Document[]>('*[references($id) && _id != $draftId]', {id: project._id, draftId})
  for (const document of references) {
    const paths = referencePaths(document, project._id)
    if (document._type !== 'stop' || !paths.every((path) => /^projects\[\d+\]$/.test(path))) {
      throw new Error(`Review references in ${document._id} before unpublishing: ${paths.join(', ')}`)
    }
  }
  console.log(`Unpublish ${project.title} (${project._id}); ${draft ? 'preserve existing' : 'create'} draft ${draftId}`)
  console.log(`Remove only this project from stop references: ${references.map((document) => document._id).join(', ') || 'none'}`)
  if (process.env.PORTFOLIO_APPLY_UNPUBLISH !== '1') {
    console.log('Preview only. Set PORTFOLIO_APPLY_UNPUBLISH=1 to unpublish.')
    return
  }
  const snapshot = join(tmpdir(), `portfolio-unpublish-${slug}-${Date.now()}.json`)
  await writeFile(snapshot, JSON.stringify({project, draft, references}, null, 2), {flag: 'wx'})
  console.log(`Snapshot: ${snapshot}`)
  const {_rev, _createdAt, _updatedAt, _system, ...saved} = project
  let transaction = client.transaction().createIfNotExists({...saved, _id: draftId})
  for (const document of references) {
    transaction = transaction.patch(document._id, (patch) => patch.ifRevisionId(document._rev).set({
      projects: (document.projects ?? []).filter((reference) => reference._ref !== project._id),
    }))
  }
  // Guard the published revision in the same atomic transaction as the removal.
  transaction = transaction.patch(project._id, (patch) => patch.ifRevisionId(project._rev).set({title: project.title}))
  await transaction.delete(project._id).commit()
  console.log('Project unpublished. Its draft and media assets remain available in Studio.')
}

unpublish().catch((error) => {console.error(error.message ?? error); process.exit(1)})
