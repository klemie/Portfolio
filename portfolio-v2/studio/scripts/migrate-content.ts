/**
 * One-off migration: pulls the hard-coded content out of the old site
 * (portfolio/src/utils/content.ts) into Sanity.
 *
 * Run from the studio directory:
 *   npx sanity exec scripts/migrate-content.ts --with-user-token
 *
 * Idempotent: every document uses a deterministic _id and createOrReplace,
 * and asset uploads are de-duplicated by Sanity on content hash. The existing
 * TableTapp document is left untouched — it was already migrated by hand.
 *
 * IDs use dashes only. A `.` in a document _id marks it as private in Sanity,
 * which hides it from the unauthenticated reads the site makes at runtime.
 */
import fs from 'node:fs'
import path from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-09-06'})

const OLD_SITE = path.join(__dirname, '..', '..', '..', 'portfolio')
const ASSETS = path.join(OLD_SITE, 'public', 'assets')
const RESUME = path.join(OLD_SITE, 'src', 'assets', 'Kris Lemieux Resume 2024.pdf')

const uploadCache = new Map<string, string>()

async function uploadImage(filename: string): Promise<string> {
  const cached = uploadCache.get(filename)
  if (cached) return cached

  const filePath = path.join(ASSETS, filename)
  if (!fs.existsSync(filePath)) throw new Error(`missing asset: ${filePath}`)

  const asset = await client.assets.upload('image', fs.createReadStream(filePath), {filename})
  uploadCache.set(filename, asset._id)
  console.log(`  uploaded ${filename} -> ${asset._id}`)
  return asset._id
}

async function imageArray(filenames: string[]) {
  const items = []
  for (const [index, filename] of filenames.entries()) {
    const assetId = await uploadImage(filename)
    items.push({
      _key: `img${index}`,
      _type: 'image',
      asset: {_type: 'reference', _ref: assetId},
    })
  }
  return items
}

// --- projects ----------------------------------------------------------------
// `skills` holds technology tags and `technologies` holds competencies, matching
// how the already-migrated TableTapp document is shaped. Long competency
// sentences from the old site are folded into `overview` so nothing is lost.

interface ProjectSeed {
  slug: string
  title: string
  overview: string
  skillDescription: string
  timeline: [string, string]
  skills: string[]
  technologies: string[]
  images: string[]
  gitHubLink?: string
  websiteLink?: string
  linkedInLink?: string
}

const projects: ProjectSeed[] = [
  {
    slug: 'engine-monitoring-system',
    title: 'Engine Monitoring System',
    overview: [
      `UVic Rocketry has been developing a test hybrid engine for over five years, with a major pain point being the comms between the valve cart and mission control. The previous system used a serial USB connection and proved unreliable. Reliability is instrumental to safe operation at a remote distance, so the goal of this project is a reliable communication and monitoring system that can be used in the field. If it succeeds it will aid in completing UVic Rocketry's first ever hotfire test.`,
      `This project was taken on as a directed studies course with the goal of a functional prototype in four months or less. Within that scope I planned to integrate instrumentation and control of the feed system so both communicate with mission control over a single line. Combining instrumentation and control into one platform eliminates the need for two separate software stacks (LabVIEW and controls), which has been an issue in the past.`,
      `To combine controls and instrumentation, a mini PC running Linux connects directly to the LabJack and the Arduino. It acts as a middle man, relaying packets over a socket connection to mission control. Mission control is an add-on to the already built Ground Support, which is designed to be configurable and allows for greater expansion as our propulsion systems evolve. The addition displays instrumentation graphs and controls in one panel, opening the way to automated shutdown when the instrumentation detects a malfunction. On the valve cart side, a custom Python driver leveraging LabJack's built-in C library for the U6-Pro extracts raw filtered data to the socket connection, while the controls communicate both ways over serial. In real-time operation the system relays controls and instrumentation separately and displays them as they arrive.`,
      `Highlights: investigated multiple communication solutions through a weighted objectives chart and cost analysis; extracted instrumentation data from a LabJack and control feedback from an Arduino and sent it over WiFi to the mission control computer; integrated valve control and the instrumentation GUI into Ground Support, consolidating all ground operations for rocket and engine development into one system.`,
    ].join('\n\n'),
    skillDescription: `The project's main scope is to combine the instrumentation and valve control so they communicate with mission control over one connection.`,
    timeline: ['Jan 2024', 'Present'],
    skills: ['Python', 'Arduino', 'LabJack', 'WebSockets', 'Full Stack', 'Linux'],
    technologies: ['Systems Design', 'Instrumentation', 'Communication Networks', 'Trade Studies'],
    images: ['EMS-1.jpg', 'EMS-2.jpg', 'EMS-3.jpg'],
    gitHubLink: 'https://github.com/UVicRocketry/PDP-Monitoring-System',
    linkedInLink: 'https://www.linkedin.com/feed/update/urn:li:activity:7183004322358550528/',
  },
  {
    slug: 'ground-support',
    title: 'Ground Support',
    overview: [
      `Ground Support is a telemetry visualization and post-flight analysis tool developed by the University of Victoria Rocketry team. It is designed to be a modular and dynamic application that can be used for any configuration of sounding rocket.`,
      `The system was designed on the core principles of a micro service architecture, for easy maintainability and scalability. The core of the system is composed of two services: application and telemetry.`,
    ].join('\n\n'),
    skillDescription: `Built on a micro service architecture with three services: frontend (TypeScript and React), telemetry (Rust and Python), and server (Express and MongooseJS).`,
    timeline: ['Sep 2022', 'Present'],
    skills: ['TypeScript', 'React', 'Rust', 'MongooseJS', 'MUI', 'REST'],
    technologies: ['Web Development', 'UI/UX Design', 'API Design'],
    images: ['GS-1.jpg', 'GS-2.jpg', 'GS-3.jpg', 'GS-4.jpg'],
    gitHubLink: 'https://github.com/UVicRocketry/Ground-Support',
    linkedInLink: 'https://www.linkedin.com/feed/update/urn:li:activity:7104630524907855873/',
  },
  {
    slug: 'anduril-flight-computer',
    title: 'Andúril Flight Computer',
    overview: [
      `This project is Rocketry's first attempt at developing a Rust based flight computer system. My contribution was an investigation and report into the viability of Rust in embedded systems.`,
      `After the assessment was done it was determined we needed a stronger base in C before we could move to Rust. That led into the development of C based drivers for the STM32 microcontroller.`,
      `Highlights: developed a series of technical reports evaluating Rust's viability in embedded systems using quantifiable metrics; migrated the Xenia-2 C++ codebase to Rust and validated the system through HIL testing, planned to fly on an L1 certification flight in Feb 2024; wrote a guide on using Rust in embedded systems to help onboard new members.`,
    ].join('\n\n'),
    skillDescription: `An evaluation of Rust for flight software, alongside C drivers for the STM32 and hardware-in-the-loop validation of the migrated codebase.`,
    timeline: ['Sep 2023', 'Present'],
    skills: ['Rust', 'C', 'Embedded Systems', 'HIL Testing', 'STM32', 'FreeRTOS'],
    technologies: ['Embedded Systems', 'Technical Writing', 'HIL Testing', 'Onboarding'],
    images: ['AFC-1.jpg'],
    websiteLink:
      'https://drive.google.com/drive/folders/1HmbC9vWZxt-nJ8LGUyFYhisnisMbH3kO?usp=share_link',
  },
  {
    slug: 'xenia-1-flight-computer',
    title: 'Xenia-1 Flight Computer',
    overview: [
      `Xenia-1 was the first rocket UVR developed coming out of COVID-19. Due to pandemic restrictions the team lost a mass of members, so the avionics team simplified the system to run off a Raspberry Pi using Python. Though the avionics were simplified, the rocket itself contained some of the most ambitious projects on the team, such as airbrakes and a deployable payload.`,
      `During this time I was the software lead of Rocketry, making it my responsibility to ensure all embedded systems were tested and developed according to team-wide deadlines. As a project manager in collaboration with the electrical lead I developed requirements and epics, and throughout development created tasks with clear acceptance criteria. On the development side I implemented the foundations of an object oriented design pattern to allow for simple abstraction of the HAL features, and built sensor fault detection and mitigation so the airbrakes system would always act on reliable data.`,
      `Highlights: used object oriented principles alongside embedded libraries to develop a reliable data logger; taught new members and younger students how to use git and Python for embedded development; created a backlog of tasks with concrete goals and acceptance criteria, assigning them to members and helping break them down into smaller pieces.`,
    ].join('\n\n'),
    skillDescription: `Built in Python on a Raspberry Pi using the Adafruit libraries.`,
    timeline: ['Sep 2021', 'Aug 2022'],
    skills: ['Python', 'Embedded Systems', 'Raspberry Pi', 'Adafruit'],
    technologies: ['Object Oriented Design', 'Project Management', 'Mentorship', 'Requirements'],
    images: ['Xenia1-FC-1.png', 'Xenia1-FC-2.png', 'Xenia1-FC-3.png', 'Xenia1-FC-4.png'],
    gitHubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
  },
  {
    slug: 'software-process',
    title: 'Software Process',
    overview: [
      `In my almost two years as avionics software lead I developed an agile software process for the team. Voluntary positions are hard to manage inside cross-functional teams, so I built a process to encourage participation and accountability using scrum techniques.`,
      `Highlights: developed a series of presentations to teach new members how to use the process; recorded a series of videos walking members through how the process works by demonstrating a ticket lifecycle.`,
    ].join('\n\n'),
    skillDescription: `The process was built using integrations between Trello and Monday.com.`,
    timeline: ['Sep 2021', 'Aug 2022'],
    skills: ['Agile', 'Scrum', 'Monday.com', 'Trello', 'GitHub'],
    technologies: ['Process Design', 'Team Onboarding', 'Technical Writing'],
    images: [],
    websiteLink:
      'https://docs.google.com/presentation/d/1gkJjfWnc6jsr0PQ29cYPVdIOYFZum4SubFt4X8ovL-o/edit#slide=id.g15242db26bd_0_4',
  },
  {
    slug: 'hybrid-controls-system',
    title: 'Hybrid Controls System',
    overview: `For my first project in the rocketry club I developed multiple iterations of a GUI to interface with and control the valves on the hybrid engine feed system.`,
    skillDescription: `Iterations of a desktop GUI in Python and C++ with Qt, talking to the valve cart over a socket connection.`,
    timeline: ['Dec 2019', 'Mar 2021'],
    skills: ['Python', 'C++', 'Qt', 'Sockets'],
    technologies: ['GUI Development', 'Valve Control'],
    images: ['HBC-1.png', 'HBC-2.png'],
  },
]

// --- experience --------------------------------------------------------------

interface ExperienceSeed {
  id: string
  company: string
  position: string
  startDate: string
  endDate?: string
  about: string
  skills: string[]
}

const experiences: ExperienceSeed[] = [
  {
    id: 'shift-product-engineer',
    company: 'Shift Browser',
    position: 'Product Engineer',
    startDate: '2024-09-01',
    about: `A product-focused software engineer building customizable browser experiences — shipping UI/UX features across a Chromium-based browser and integrated web apps in React and TypeScript with MobX, while keeping stakeholders aligned through clear specs, fast iteration, and tight feedback loops. I also own and maintain key Chromium WebUI settings surfaces, and help drive quality through consistent triage and collaboration with QA.`,
    skills: [
      'React',
      'TypeScript',
      'MobX',
      'Chromium',
      'WebUI',
      'UI/UX',
      'Stakeholder Management',
    ],
  },
  {
    id: 'uvic-rocketry-technical-coordinator',
    company: 'UVic Rocketry',
    position: 'Technical Coordinator',
    startDate: '2022-09-01',
    about: `Oversaw the backlog and assigned tasks through a three week sprint to ensure member participation. Ran full stack skill development sessions to onboard new members and make sure they were comfortable with the MERN stack. Developed a micro service based system so the project could be open sourced for other rocketry teams to use. Designed UI/UX in Figma and ensured the implementation matched the design pattern.`,
    skills: ['Backlog Management', 'Scrum', 'MERN', 'Micro Services', 'Figma', 'UI/UX Design'],
  },
  {
    id: 'uvic-rocketry-avionics-co-lead',
    company: 'UVic Rocketry',
    position: 'Avionics Co-lead',
    startDate: '2021-03-01',
    endDate: '2022-09-01',
    about: `Standardized an agile software process for the team. Created a series of presentations, Figma prototypes, and videos to onboard new members. Designed and implemented an object oriented design pattern for the HAL features of the rocket.`,
    skills: ['Agile', 'Onboarding', 'Figma', 'Object Oriented Design', 'Embedded Systems'],
  },
  {
    id: 'uvic-rocketry-media-lead',
    company: 'UVic Rocketry',
    position: 'Media Lead',
    startDate: '2021-03-01',
    endDate: '2022-09-01',
    about: `Organized fundraisers and events to raise money and community presence for the team. Developed sponsorship packages and reached out to potential sponsors, landing sponsorship from Lockheed Martin and other aerospace companies. Maintained a social media presence on Instagram and LinkedIn.`,
    skills: ['Fundraising', 'Sponsorship', 'Social Media', 'Community Outreach'],
  },
  {
    id: 'uvic-rocketry-propulsion-member',
    company: 'UVic Rocketry',
    position: 'Propulsion Member',
    startDate: '2019-12-01',
    endDate: '2021-03-01',
    about: `Developed a GUI to interface with and control the valves on the hybrid engine feed system.`,
    skills: ['Python', 'GUI Development', 'Qt'],
  },
  {
    id: 'helm-operations-contract-software-engineer',
    company: 'Helm Operations',
    position: 'Contract Software Engineer',
    startDate: '2022-09-01',
    endDate: '2023-01-01',
    about: `Prototyped features that were demonstrated at conferences to over 100 representatives from separate companies. Created client-requested features to help win bids for large maritime commodities. Worked with the product team to give technical insight into their designs. Developed and altered foundational frontend components for a new VueJS codebase.`,
    skills: ['VueJS', 'Prototyping', 'Frontend Components', 'Client Requirements'],
  },
  {
    id: 'helm-operations-full-stack-developer',
    company: 'Helm Operations',
    position: 'Full Stack Developer (Co-op)',
    startDate: '2022-01-01',
    endDate: '2022-09-01',
    about: `Designed, developed, tested, and implemented a feature that enables saving filtering presets for a dispatching system. Created complex API endpoints along with data and schema migrations to interact with a LINQ backbone. Contributed to quality assurance efforts by identifying bugs and unexpected workflows.`,
    skills: ['Full Stack', 'LINQ', 'API Design', 'Schema Migrations', 'QA'],
  },
  {
    id: 'island-temperature-controls-graphics-developer',
    company: 'Island Temperature Controls',
    position: 'Graphics Developer, DDC (Co-op)',
    startDate: '2022-09-01',
    endDate: '2023-01-01',
    about: `Worked with a small team to develop a web application for a local HVAC company. Elicited requirements from other teams and validated designs with HVAC technicians to ensure the accuracy of the user experience. Coordinated directly with technicians to improve the design and the accuracy of the interface.`,
    skills: ['Web Development', 'Requirements Elicitation', 'UX Validation', 'DDC / HVAC'],
  },
]

async function migrate() {
  console.log(`project ${client.config().projectId}, dataset ${client.config().dataset}\n`)

  console.log('site settings')
  const headshotId = await uploadImage('kris.png')
  const resume = await client.assets.upload('file', fs.createReadStream(RESUME), {
    filename: 'Kris Lemieux Resume 2024.pdf',
  })
  console.log(`  uploaded resume -> ${resume._id}`)

  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    name: 'Kristopher Lemieux',
    tagline: 'Product Engineer at Shift Browser',
    bio: [
      `Hello, my name is Kris. I am an avid gravel cyclist, artist, and slightly illiterate software engineer. Growing up with dyslexia my outlet was to express myself visually any way I could, from traditional painting to graphic design. That came to a head in high school when I was introduced to website development and became obsessed.`,
      `Today I am a product engineer at Shift Browser, building customizable browser experiences across a Chromium-based browser and its integrated web apps. I studied Computer Engineering at the University of Victoria, and across those years I worked on a range of projects from web development to mechatronics systems, most of them with the UVic Rocketry team. My favourite projects mix software and hardware and demand a deep understanding of system design. Alongside the technical side I've developed a liking for project and people management — there is no greater feeling than matching the right person to the right task and watching them thrive.`,
    ].join('\n\n'),
    headshot: {
      _type: 'image',
      asset: {_type: 'reference', _ref: headshotId},
      alt: 'Illustrated portrait of Kris Lemieux',
    },
    email: 'lemieuxkristopher@gmail.com',
    resume: {_type: 'file', asset: {_type: 'reference', _ref: resume._id}},
    gitHubLink: 'https://github.com/klemie',
    linkedInLink: 'https://www.linkedin.com/in/krislemie/',
  })
  console.log('  wrote siteSettings')

  console.log('\nprojects')
  for (const project of projects) {
    const {slug, images, ...rest} = project
    await client.createOrReplace({
      _id: `project-${slug}`,
      _type: 'project',
      ...rest,
      slug: {_type: 'slug', current: slug},
      images: await imageArray(images),
      hasDemo: false,
    })
    console.log(`  wrote ${project.title}`)
  }

  console.log('\nexperience')
  for (const experience of experiences) {
    const {id, ...rest} = experience
    await client.createOrReplace({
      _id: `experience-${id}`,
      _type: 'experience',
      ...rest,
    })
    console.log(`  wrote ${experience.company} — ${experience.position}`)
  }

  // Clean up the first pass, which used dotted (private) ids.
  const legacyIds = [
    ...projects.map((project) => `project.${project.slug}`),
    ...experiences.map((experience) => `experience.${experience.id}`),
  ]
  const legacy = await client.fetch<string[]>(`*[_id in $ids]._id`, {ids: legacyIds})
  if (legacy.length > 0) {
    await legacy.reduce(
      (transaction, id) => transaction.delete(id),
      client.transaction(),
    ).commit()
    console.log(`\nremoved ${legacy.length} document(s) with private dotted ids`)
  }

  const counts = await client.fetch(
    `{"projects": count(*[_type=="project"]), "experiences": count(*[_type=="experience"]), "settings": count(*[_type=="siteSettings"])}`,
  )
  console.log(`\ndone: ${JSON.stringify(counts)}`)
}

migrate().catch((error) => {
  console.error(error)
  process.exit(1)
})
