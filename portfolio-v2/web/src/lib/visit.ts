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
    return stop ? {target, stop, title: stop.title, subtitle: 'A place along the way', labels: stopLabels(stop)} : null
  }
  if (target.kind === 'projects') {
    const project = projects.find((candidate) => candidate.slug === target.id)
    if (!project) return null
    return {
      target, project,
      stop: stops.find((stop) => stop.projects.some((candidate) => candidate._id === project._id)) ?? null,
      title: project.title,
      subtitle: 'Project',
      labels: [...new Set([...(project.technologies ?? []), ...(project.skills ?? [])])],
    }
  }
  const experience = experiences.find((candidate) => candidate._id === target.id)
  if (!experience) return null
  return {
    target, experience,
    stop: stops.find((stop) => stop.experiences.some((candidate) => candidate._id === experience._id)) ?? null,
    title: experience.company,
    subtitle: experience.position,
    labels: experience.skills ?? [],
  }
}
