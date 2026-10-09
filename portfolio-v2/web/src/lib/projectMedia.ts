import type {Project, SanityImage} from './types'

export const projectUrl = (value?: string | null): string | null => {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  } catch {
    return null
  }
}

/** Open Figma decks in audience view rather than the embed or editor wrapper. */
export const projectPreviewLink = (value: string) => {
  const url = new URL(value)
  if (url.hostname === 'embed.figma.com' && url.pathname.startsWith('/deck/')) {
    url.hostname = 'www.figma.com'
    url.searchParams.delete('embed-host')
  }
  return url.href
}

export type ProjectMedia =
  | {kind: 'embed'; url: string; label: string}
  | {kind: 'preview'; url: string; label: string}
  | {kind: 'image'; image: SanityImage | string; label: string}

export const projectMedia = (project: Project): ProjectMedia[] => {
  const embed = projectUrl(project.embedUrl)
  const images: ProjectMedia[] = (project.images ?? [])
    .filter((image) => image?.asset?._ref)
    .map((image, index) => ({kind: 'image', image, label: image.alt || `Photo ${index + 1}`}))
  images.push(...(project.localImages ?? []).map(({src, alt}) => ({kind: 'image' as const, image: src, label: alt})))
  const presentations: ProjectMedia[] = (project.presentations ?? []).flatMap(({title, url}) => {
    const href = projectUrl(url)
    return href ? [{kind: 'embed' as const, url: href, label: title}] : []
  })
  if (embed) return [{kind: 'embed', url: embed, label: project.hasDemo ? 'Interactive demo' : 'Project preview'}, ...presentations, ...images]
  if (presentations.length) return [...presentations, ...images]
  const preview = projectUrl(project.previewUrl)
  return preview ? [{kind: 'preview', url: preview, label: 'Project preview'}, ...images] : images
}

export const projectLinks = (project: Project): {label: string; href: string}[] => {
  const candidates = [
    {label: 'View demo', href: project.hasDemo ? project.demoLink : null},
    {label: project.websiteLinkLabel ?? 'Website', href: project.websiteLink},
    {label: 'View source', href: project.gitHubLink},
    {label: 'LinkedIn', href: project.linkedInLink},
  ]
  const seen = new Set<string>()
  return candidates.flatMap(({label, href}) => {
    const url = projectUrl(href)
    if (!url || seen.has(url)) return []
    seen.add(url)
    return [{label, href: url}]
  })
}
