/** Preview by default; PORTFOLIO_APPLY_DEMOS=1 applies only after all hosts respond. */
import {getCliClient} from 'sanity/cli'
import {portfolioDemos} from '../../shared/portfolioDemos'

const client = getCliClient({apiVersion: '2025-09-06'}).withConfig({useCdn: false})
async function publish() {
  const apply = process.env.PORTFOLIO_APPLY_DEMOS === '1'
  const ids = Object.values(portfolioDemos).map((demo) => demo.id)
  const projects = await client.fetch<{_id: string; _rev: string; slug: {current: string}}[]>('*[_type == "project" && _id in $ids]{_id,_rev,slug}', {ids})
  let transaction = client.transaction()
  for (const [slug, demo] of Object.entries(portfolioDemos)) {
    const project = projects.find((project) => project._id === demo.id && project.slug?.current === slug)
    if (!project) throw new Error(`Expected portfolio project missing: ${demo.id}`)
    console.log(`${slug} → embedded ${demo.url}`)
    if (!apply) continue
    const response = await fetch(demo.url, {signal: AbortSignal.timeout(15000)})
    if (!response.ok || !(response.headers.get('content-type') ?? '').includes('text/html')) throw new Error(`Demo is not available: ${demo.url}`)
    if (!(response.headers.get('content-security-policy') ?? '').includes('https://krislemie.ca')) throw new Error(`Demo does not allow the portfolio iframe: ${demo.url}`)
    transaction = transaction.patch(project._id, (patch) => {
      const updated = patch.ifRevisionId(project._rev).set({hasDemo: true, embedUrl: demo.url, demoLink: demo.url}).unset(['previewUrl'])
      return slug === 'shift-pdf-app' ? updated.set({websiteLink: demo.url}) : updated
    })
  }
  if (apply) { await transaction.commit(); console.log('All three embedded demo links published.') }
  else console.log('Preview only. Deploy all three demos before applying.')
}
publish().catch((error) => {console.error(error.message ?? error); process.exit(1)})
