/** Co-op contribution from Kris; product context from Helm's logistics page. */
export const helmLogisticsProject = {
  _id: 'project-helm-logistics-dispatch',
  _type: 'project' as const,
  title: 'Helm CONNECT Logistics Dispatch',
  slug: {_type: 'slug' as const, current: 'helm-connect-logistics-dispatch'},
  experience: {_type: 'reference' as const, _ref: 'experience-helm-operations-full-stack-developer'},
  viewerOrder: 0,
  overview: 'Helm CONNECT Logistics brings vessel dispatching, job scheduling, and related operational workflows into one platform. The dispatch view gives teams a place to review trips, vessel assignments, schedules, and job details.\n\nThe supplied product image illustrates the dispatch workflow: a trip list with expandable vessel details and controls for applying and saving filters. Helm’s logistics page provides more product information and a way to request a demo.',
  skillDescription: 'The dispatching view was my main project during my co-op at Helm Operations. I designed, developed, tested, and implemented saved filtering presets, allowing dispatchers to save a set of filters and return to it later.\n\nMy work spanned the interface and backend: I created API endpoints and data and schema migrations that worked with the LINQ backbone. I also contributed to quality assurance by identifying bugs and unexpected workflows in the dispatching system.',
  skills: ['Full-stack development', 'API design', 'Schema migrations', 'Quality assurance'],
  technologies: ['LINQ'],
  hasDemo: false,
  websiteLink: 'https://www.helmoperations.com/logistics',
}
