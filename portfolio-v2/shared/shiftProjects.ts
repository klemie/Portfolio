/** Interview-based project content, previewed locally before publishing in Studio. */
const sharedFields = {
  _type: 'project' as const,
  experience: {_type: 'reference' as const, _ref: 'experience-shift-product-engineer'},
  images: [],
  hasDemo: false,
}

export const shiftProjectSeeds = [
  {
    ...sharedFields,
    _id: 'project-shift-apps-directory',
    title: 'Apps Directory',
    slug: {_type: 'slug' as const, current: 'shift-apps-directory'},
    viewerOrder: 2,
    timeline: [], // Start date remains unconfirmed; ownership ended September 2026.
    overview: 'Apps in Shift are bookmarks with superpowers: dedicated spaces for related tabs, with matching links routed into the right app. Expanding the Apps Directory gave users more of their everyday tools while helping people discover Shift through keyword searches and answer engines.\n\nOutside of tailored blogs and other marketing efforts, the directory was the leading contributor to organic browser installs. I observed increased search visibility and impressions in Google Search Console, alongside growth in browser downloads.',
    skillDescription: 'I was the sole owner, maintainer and project manager of the Apps Directory, responsible for its direction, implementation and ongoing delivery. The growth workflow connected app discovery, configuration generation, human review and release, using Brandfetch, Cloudflare and GitHub Actions to scale the catalog while maintaining quality.\n\nThe hardest challenge was stakeholder alignment as priorities and scope changed. Quality requirements extended the timeline, and SEO was added after the initial scope. I returned to the statement of work to negotiate changes and keep stakeholders aligned, then carried the SEO work through to delivery.',
    skills: ['Product Ownership', 'Stakeholder Management', 'Scope Negotiation', 'Automation', 'SEO / AEO'],
    technologies: ['Brandfetch', 'Cloudflare', 'GitHub Actions'],
    websiteLink: 'https://shift.com/apps/',
    presentations: [
      {_key: 'apps-growth', title: 'Apps Directory Growth', url: 'https://embed.figma.com/deck/E0uDv4lSRzb91KB5Q0yhsI?embed-host=kris-portfolio&node-id=12-174'},
      {_key: 'apps-seo', title: 'App SEO Pages', url: 'https://embed.figma.com/deck/QL3UbMHDavCN9R07sfLr2a?embed-host=kris-portfolio&node-id=17-184'},
    ],
  },
  {
    ...sharedFields,
    _id: 'project-shift-pdf-app',
    title: 'PDF App',
    slug: {_type: 'slug' as const, current: 'shift-pdf-app'},
    viewerOrder: 0,
    timeline: ['Aug 2026', 'Sep 2026'],
    overview: 'The PDF funnel drove the most installs of Shift Browser, making its performance critical to acquisition and revenue. The rebuild aimed to help people complete file tasks reliably, return for their next PDF job and discover the rest of the browser.',
    skillDescription: 'I owned the PDF funnel and built the replacement app from a BentoPDF fork through deployment. The MVP required parity with the previous app, verification that every tool worked correctly, consistent Shift theming and file handoff. That handoff used a Chromium API to let users edit files directly on their computer through the browser.\n\nCapping scope was the main challenge. I kept delivery focused on parity, tool reliability, theming and file handoff, deferring deeper browser integrations, including MCP. This kept the rebuild centered on the essential PDF workflow in a business-critical acquisition funnel.',
    skills: ['Product Ownership', 'Scope Management', 'UI/UX', 'Browser Integration'],
    technologies: ['BentoPDF', 'Chromium APIs'],
    previewUrl: 'https://shift-pdf-neo.integrated-apps.tryshift.com/',
    websiteLink: 'https://shift-pdf-neo.integrated-apps.tryshift.com/',
  },
  {
    ...sharedFields,
    _id: 'project-shift-agent-toolkit-seminar',
    title: 'Agent Toolkit Seminar',
    slug: {_type: 'slug' as const, current: 'shift-agent-toolkit-seminar'},
    viewerOrder: 1,
    timeline: ['Sep 2026'],
    overview: 'I initiated a hands-on seminar at the University of Victoria to give students practical exposure to how industry teams use AI tools—something I saw missing from their coursework. About 50 students attended the September 2026 event, which drew on our workflows at Shift Browser.\n\nThe session covered shared agent skills through the Model Context Protocol (MCP), clarifying requirements, review loops and improving reusable agent guidance. During the hands-on portion, I saw students have moments of understanding as the toolkit clicked, followed by excitement about building their own extensions.',
    skillDescription: 'The seminar was entirely my initiative, and I handled all event coordination and running the event myself. Alongside preparing and delivering the session, I brought the people, timing and hands-on activities together to make industry practices accessible to students.\n\nThe hardest coordination challenge was keeping a time-sensitive event moving across people with different priorities and response times. When progress stalled, I found additional contacts and kept alternative paths open without closing off existing relationships. That persistence helped turn the idea into an event for 50 students.',
    skills: ['Event Coordination', 'Public Speaking', 'Technical Teaching', 'Stakeholder Management'],
    technologies: ['AI Agent Workflows', 'Model Context Protocol'],
    embedUrl: 'https://embed.figma.com/deck/D1DQ5S0Dq7koJ1Vm6d86pc?embed-host=kris-portfolio',
    websiteLink: 'https://www.figma.com/deck/D1DQ5S0Dq7koJ1Vm6d86pc',
    gitHubLink: 'https://github.com/klemie/generic-agent-toolkit',
  },
]
