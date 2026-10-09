import type {Experience, Project, Stop} from './types'

export type VisitTarget = {kind: 'stops' | 'projects' | 'experiences'; id: string}

export interface Visit {
  target: VisitTarget
  title: string
  subtitle: string
  labels: string[]
  stop: Stop | null
  project?: Project
  experience?: Experience
  /** Role shown beside the docked map. Other roles follow below it. */
  featuredExperience?: Experience
}

export const visitPath = ({kind, id}: VisitTarget): string =>
  `/${kind}/${encodeURIComponent(id)}`

export const visitFromPath = (pathname: string): VisitTarget | null => {
  const match = /^\/(stops|projects|experiences)\/([^/]+)\/?$/.exec(pathname)
  if (!match) return null
  try {
    return {kind: match[1] as VisitTarget['kind'], id: decodeURIComponent(match[2])}
  } catch {
    return null
  }
}

export const stopLabels = (stop: Stop): string[] => [...new Set([
  ...stop.experiences.flatMap((experience) => experience.skills ?? []),
  ...stop.projects.flatMap((project) => [...(project.technologies ?? []), ...(project.skills ?? [])]),
])]

export const resolveVisit = (
  target: VisitTarget | null,
  stops: Stop[],
  projects: Project[],
  experiences: Experience[],
): Visit | null => {
  if (!target) return null
  if (target.kind === 'stops') {
    const stop = stops.find((candidate) => candidate._id === target.id)
    if (!stop) return null
    const featuredExperience = stop.experiences.at(-1)
    return {target, stop, featuredExperience, title: featuredExperience?.company ?? stop.title, subtitle: 'A place along the way', labels: []}
  }
  if (target.kind === 'projects') {
    const project = projects.find((candidate) => candidate.slug === target.id)
    if (!project) return null
    return {
      target, project,
      stop: stops.find((stop) => stop.experiences.some((candidate) => candidate._id === project.experienceId)) ?? null,
      title: project.title,
      subtitle: 'Project',
      labels: [...new Set([...(project.technologies ?? []), ...(project.skills ?? [])])],
    }
  }
  const experience = experiences.find((candidate) => candidate._id === target.id)
  if (!experience) return null
  return {
    target, experience, featuredExperience: experience,
    stop: stops.find((stop) => stop.experiences.some((candidate) => candidate._id === experience._id)) ?? null,
    title: experience.company,
    subtitle: 'A place along the way',
    labels: [],
  }
}
