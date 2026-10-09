import {capstoneExperience, legacyProjectEmbeds, legacyProjectExperiences, legacyProjectOrder} from '../../../shared/projectExperienceMigration'
import {shiftProjectSeeds} from '../../../shared/shiftProjects'
import type {Experience, Project, Stop} from './types'

const shiftEndDate = '2026-09-01'
const shiftPreviewImages = {
  'project-shift-pdf-app': [
    {src: '/images/shift-pdf/my-pdfs-desktop.jpg', alt: 'My PDFs — upload, select a file and choose a tool'},
    {src: '/images/shift-pdf/merge-pdf-desktop.jpg', alt: 'Merge PDF — combine files in a Shift-themed tool'},
  ],
}

/** Preview pending relationships and new project drafts without publishing them. */
export const previewProjectRelations = (projects: Project[], experiences: Experience[], stops: Stop[]) => {
  const pendingProjects: Project[] = shiftProjectSeeds
    .filter((seed) => experiences.some((role) => role._id === seed.experience._ref) &&
      !projects.some((project) => project._id === seed._id || project.slug === seed.slug.current || project.title === seed.title))
    .map((seed) => ({...seed, slug: seed.slug.current, experienceId: seed.experience._ref,
      websiteLinkLabel: seed._id === 'project-shift-pdf-app' ? 'Open app'
        : seed._id === 'project-shift-agent-toolkit-seminar' ? 'View presentation' : 'Explore directory',
      localImages: seed._id === 'project-shift-pdf-app' ? shiftPreviewImages['project-shift-pdf-app'] : undefined}))
  if (projects.every((project) => project.experienceId) && !pendingProjects.length && !experiences.some((role) => role._id === 'experience-shift-product-engineer')) return {projects, experiences, stops}
  const linkedProjects = [...projects, ...pendingProjects].map((project) => project.experienceId ? project : {
    ...project,
    experienceId: legacyProjectExperiences[project.slug] ?? null,
    embedUrl: project.embedUrl ?? legacyProjectEmbeds[project.slug] ?? null,
    viewerOrder: project.viewerOrder ?? legacyProjectOrder[project.slug] ?? 0,
  }).sort((a, b) => (a.viewerOrder ?? 0) - (b.viewerOrder ?? 0))
  const roles = [...experiences]
  if (linkedProjects.some((project) => project.experienceId === capstoneExperience._id) && !roles.some((role) => role._id === capstoneExperience._id)) {
    roles.push({...capstoneExperience, projects: []})
  }
  const linkedExperiences = roles.map((role) => ({...role,
    ...(role._id === 'experience-shift-product-engineer' ? {endDate: shiftEndDate, about: role.about
      .replace('engineer building', 'engineer who built')
      .replace('— shipping', '— shipped')
      .replace('I also own and maintain', 'I also owned and maintained')
      .replace('and help drive', 'and helped drive')} : {}),
    projects: linkedProjects.filter((project) => project.experienceId === role._id)}))
  const linkedStops = stops.map((stop) => {
    const ids = stop.experiences.map((role) => role._id)
    if (stop._id === 'stop-uvic' && roles.some((role) => role._id === capstoneExperience._id) && !ids.includes(capstoneExperience._id)) {
      const latest = ids.indexOf('experience-uvic-rocketry-technical-coordinator')
      ids.splice(latest < 0 ? ids.length : latest, 0, capstoneExperience._id)
    }
    return {
      ...stop,
      experiences: ids.flatMap((id) => linkedExperiences.filter((role) => role._id === id)),
      projects: linkedProjects.filter((project) => ids.includes(project.experienceId ?? '')),
    }
  })
  return {projects: linkedProjects, experiences: linkedExperiences, stops: linkedStops}
}
