// Mirrors the document types in ../../studio/schemaTypes.
// Optional fields are `| null` because GROQ projects missing values as null.
export interface SanityImage {
  _key?: string
  asset: {_ref: string; _type: 'reference'}
  alt?: string | null
}

export interface SiteSettings {
  name: string
  tagline: string
  bio: string
  headshot?: SanityImage | null
  email: string
  resumeUrl?: string | null
  /** Uploaded GPX route for the flyover. Falls back to the file in /public. */
  routeGpxUrl?: string | null
  gitHubLink?: string | null
  linkedInLink?: string | null
  websiteLink?: string | null
}

export interface Project {
  _id: string
  title: string
  /** Falls back to _id for documents created before the slug field existed */
  slug: string
  overview: string
  skillDescription: string
  /** Schema allows at most 2 entries: [start, end] */
  timeline: string[]
  skills: string[]
  technologies: string[]
  images?: SanityImage[] | null
  hasDemo: boolean
  demoLink?: string | null
  gitHubLink?: string | null
  websiteLink?: string | null
  linkedInLink?: string | null
}

export interface Experience {
  _id: string
  company: string
  position: string
  startDate: string
  /** Absent means current role */
  endDate?: string | null
  about: string
  skills: string[]
}

/**
 * A stop on the flyover ride. Holds prose and references only — the map
 * position comes from a GPX `<wpt>` matched on `waypointName`.
 */
export interface Stop {
  _id: string
  title: string
  waypointName: string
  order: number
  /** Null until written. The ride renders the stop regardless. */
  blurb?: string | null
  experiences: Experience[]
  projects: Project[]
}
