// GROQ queries. Slug is projected to a plain string so components never see {current}.
// Projects created before the slug field existed fall back to _id, so their
// modal links keep working until a slug is generated in the Studio.
export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  name,
  tagline,
  bio,
  headshot,
  email,
  "resumeUrl": resume.asset->url,
  "routeGpxUrl": routeGpx.asset->url,
  gitHubLink,
  linkedInLink,
  websiteLink
}`

const projectFields = `
  _id,
  title,
  "slug": coalesce(slug.current, _id),
  overview,
  skillDescription,
  timeline,
  skills,
  technologies,
  images,
  hasDemo,
  demoLink,
  gitHubLink,
  websiteLink,
  linkedInLink,
  embedUrl,
  presentations,
  previewUrl,
  viewerOrder,
  "experienceId": experience._ref
`

const experienceFields = `
  _id,
  company,
  position,
  startDate,
  endDate,
  about,
  skills,
  "projects": *[_type == "project" && experience._ref == ^._id] | order(coalesce(viewerOrder, 0) asc, _createdAt asc){${projectFields}}
`

export const projectsQuery = `*[_type == "project"] | order(_createdAt desc){${projectFields}}`
export const experiencesQuery = `*[_type == "experience"] | order(startDate desc){${experienceFields}}`

// Ride stops. `order` is the authoring order; the camera visits them in the
// order the GPX route actually reaches them. References are already stored
// chronologically within each stop, so no re-sorting here.
export const stopsQuery = `*[_type == "stop"] | order(order asc){
  _id,
  title,
  waypointName,
  order,
  blurb,
  "experiences": experiences[]->{${experienceFields}},
  "projects": *[_type == "project" && experience._ref in ^.experiences[]._ref] | order(coalesce(viewerOrder, 0) asc, _createdAt asc){${projectFields}}
}`
