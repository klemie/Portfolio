/** Preview by default; PORTFOLIO_APPLY_ORDER=1 publishes the project order. */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-09-06'}).withConfig({useCdn: false})
const experienceId = 'experience-uvic-rocketry-technical-coordinator'

async function reorder() {
  const role = await client.getDocument(experienceId)
  if (role?.position !== 'Technical Coordinator') throw new Error('Expected Technical Coordinator experience missing.')
  const projects = await client.fetch<{_id: string; _rev: string; title: string; viewerOrder?: number}[]>(
    '*[_type == "project" && experience._ref == $experienceId] | order(coalesce(viewerOrder, 0) asc, _createdAt asc){_id,_rev,title,viewerOrder}',
    {experienceId},
  )
  const engine = projects.find((project) => project._id === 'project-engine-monitoring-system')
  if (!engine) throw new Error('Engine Monitoring System is not linked to Technical Coordinator.')
  console.log(`Current first project: ${projects[0]?.title}`)
  const ordered = [engine, ...projects.filter((project) => project._id !== engine._id)]
  let transaction = client.transaction()
  let changed = false
  ordered.forEach((project, index) => {
    console.log(`${index + 1}. ${project.title}`)
    if (project.viewerOrder === index) return
    changed = true
    transaction = transaction.patch(project._id, (patch) => patch.ifRevisionId(project._rev).set({viewerOrder: index}))
  })
  if (process.env.PORTFOLIO_APPLY_ORDER === '1') {
    if (changed) await transaction.commit()
    console.log('Technical Coordinator project order published.')
  } else console.log('Preview only. No documents changed.')
}

reorder().catch((error) => {console.error(error.message ?? error); process.exit(1)})
