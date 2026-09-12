/**
 * One-off migration of the hardcoded content in portfolio/src/utils/content.ts
 * into Sanity. Run from the studio package:
 *
 *   pnpm exec sanity exec scripts/importV1Content.ts --with-user-token
 *
 * Idempotent: documents use deterministic ids, so re-running overwrites rather
 * than duplicating. Images are uploaded once and reused by filename.
 *
 * Field mapping decisions (confirmed with Kris):
 * - v1 `skills` (tech names)   -> `technologies`
 * - v1 `competencies`          -> `skills`
 * - v1 `overview: string[]`    -> `overview` text, paragraphs joined by blank lines
 * - v1 `color`, `duration`, `coop` are dropped; no equivalent fields exist.
 */
import {existsSync, readFileSync} from 'node:fs'
import {basename, resolve} from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient()

// `sanity exec` runs with cwd set to the studio package root.
const V1_ASSETS = resolve(process.cwd(), '../../portfolio/public/assets')
const V1_SRC_ASSETS = resolve(process.cwd(), '../../portfolio/src/assets')

if (!existsSync(V1_ASSETS)) {
  throw new Error(
    `Cannot find v1 assets at ${V1_ASSETS}. Run this from the studio package: ` +
      `pnpm exec sanity exec scripts/importV1Content.ts --with-user-token`,
  )
}

/** The existing TableTapp document, which already has its 5 images uploaded. */
const TABLETAPP_ID = '87709030-86b7-4a84-a026-5225e33456d2'

/** Collapses the indented template literals in content.ts into clean paragraphs. */
const paragraphs = (...parts: string[]): string =>
  parts.map((part) => part.replace(/\s+/g, ' ').trim()).join('\n\n')

/** 'May 2023 - Aug 2023' -> ['May 2023', 'Aug 2023']; schema allows max 2. */
const timeline = (range: string): string[] => range.split(/\s*-\s*/).map((s) => s.trim())

const MONTHS: Record<string, string> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  sept: '09',
  oct: '10',
  nov: '11',
  dec: '12',
}

/** 'Sep 2022' -> '2022-09-01'. Sanity date fields need ISO strings. */
const isoDate = (value: string): string => {
  const [month, year] = value.trim().split(/\s+/)
  const key = month.toLowerCase().replace(/\./g, '')
  const num = MONTHS[key] ?? MONTHS[key.slice(0, 3)]
  if (!num) throw new Error(`Unrecognised month in date: ${value}`)
  return `${year}-${num}-01`
}

const uploadCache = new Map<string, string>()

const uploadImage = async (filename: string): Promise<string> => {
  const cached = uploadCache.get(filename)
  if (cached) return cached

  const path = resolve(V1_ASSETS, filename)
  const asset = await client.assets.upload('image', readFileSync(path), {filename})
  uploadCache.set(filename, asset._id)
  console.log(`  uploaded image ${filename}`)
  return asset._id
}

const imageField = async (filename: string) => ({
  _type: 'image',
  _key: basename(filename).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
  asset: {_type: 'reference', _ref: await uploadImage(filename)},
})

const imageArray = (filenames: string[]) => Promise.all(filenames.map(imageField))

/** Strips '' and undefined so required/url fields aren't set to empty strings. */
const clean = <T extends Record<string, unknown>>(doc: T): T =>
  Object.fromEntries(
    Object.entries(doc).filter(([, value]) => {
      if (value === '' || value === undefined || value === null) return false
      if (Array.isArray(value) && value.length === 0) return false
      return true
    }),
  ) as T

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

interface V1Project {
  id: string
  title: string
  slug: string
  overview: string
  skillDescription: string
  timeline: string[]
  /** v1 `competencies` */
  skills: string[]
  /** v1 `skills` */
  technologies: string[]
  photos: string[]
  gitHubLink?: string
  websiteLink?: string
  linkedInLink?: string
}

const projects: V1Project[] = [
  {
    id: TABLETAPP_ID,
    title: 'TableTapp',
    slug: 'tabletapp',
    overview: paragraphs(
      `Small restaurant businesses run on small profit margins and often have to subscribe to
       multiple software solutions in order to run their business. Our solution to this is TableTapp,
       an all-in-one service industry solution with the added benefit of serverless in-restaurant ordering.`,
      `In the project I took responsibilities of UX/UI Designer, Scrum master, Full stack developer. Since
       the project was limited to a semester we worked as a team to develop realistic time estimates and design phases
       delivered through a sprint scrum process. The team as a whole treated the project as a start up
       has it had a high viability and targeted an product area that had minimal innovation as suggested through market research.`,
      `Throughout the deign and development process I created wire frames and prototypes in Figma for all three
       sections (Front of house, back of house, and customer) of the application. These designs were validated and
       improved through UX surveys and interviews with restaurant owners and front and back of house professionals.
       These designs then influenced the system design of the entity based mongoDB documents and the REST API. More
       specifically all sections of the application would share the same entity with different permissions being present depending
       on the solution being used. Towards the end of the project I was responsible for the customer side and reliability
       of the api and database. For the demonstration we had the customer and restaurant side connected to show off our ticketing system.`,
    ),
    skillDescription:
      'This project was built with the MERN stack using React and Chakra UI. With a backend in ExpressJS and MongoDB.',
    timeline: timeline('May 2023 - Aug 2023'),
    skills: ['Web Development', 'UI/UX Design', 'API Design'],
    technologies: ['TypeScript', 'React', 'MongooseJS', 'ChakraUI', 'REST'],
    // Already uploaded on this document — left untouched by the patch below.
    photos: [],
    gitHubLink: 'https://github.com/UVicRocketry/Ground-Support',
    websiteLink: 'https://tabletapp.github.io/TableTapp/',
    linkedInLink:
      'https://www.linkedin.com/feed/update/urn:li:activity:7104630524907855873/',
  },
  {
    id: 'project.engine-monitoring-system',
    title: 'Engine Monitoring System',
    slug: 'engine-monitoring-system',
    overview: paragraphs(
      `UVic Rocketry has been developing a test hybrid engine for over
       5 years with a major pain point of the comms between the valve cart and mission control.
       This system previous system used a serial usb connection and has proven to be unreliable.
       Reliability of the system is instrumental to its safe operation at a remote distance, the goal of this
       project is to develop a reliable communication and monitoring system that can be used in the field.
       If this project is successful it will aid in completing UVic Rocketry's first ever hotfire test.`,
      `This project was taken on as a directed studies course with the goal of developing a
       functional prototype in 4 months or less. For the scope of the four months I planned to integrate
       instrumentation and control of the feed system to communicate with mission control over one communication line.
       The act of integrating instrumentation and control into one platforms will eliminate the need for two separate
       software platforms (Labview and controls) which has been an issue in the past.`,
      `To combine the controls and instrumentation a mini-pc running linux connects directly to the labjack and the arduino.
       This serves as a middle man relaying packets over a socket network connection to the mission control. The mission
       control is an addon to the already built Ground Support which is designed to be configurable which allows greater expansion as
       our propulsion systems evolve. The addition to this system will display instrumentation graphs and controls in one
       panel, opening the way to automated shut down in case of malfunction detected by the instrumentation. On the Valve
       cart side a custom python driver leveraging Labjacks built in C based library for the U6-pro will extract raw filtered
       data to the socket connection. Whilst the controls communicates both ways over serial to the socket. In real time operation
       the system will relay controls and instrumentation separately and display them as they arrive.`,
    ),
    skillDescription: paragraphs(
      `The projects main scope is to combine the instrumentation and valve control to communicate with mission
       control over one connection.`,
    ),
    timeline: timeline('Jan 2024 - present'),
    skills: [
      'Investigated multiple solutions for communication through weighted objectives chart and cost analysis',
      'Extracted instrumentation data from a Labjack and control feedback from a Arduino and sent it over a Wifi connected to mission control computer',
      'Integrated Valve control and instrumentation GUI into ground support system, consulating all ground operations for rocket and engine develop into one system',
    ],
    technologies: [
      'Labjack',
      'Arduino',
      'Full stack',
      'Comm Networks',
      'AsyncPython',
      'WebSockets',
    ],
    photos: ['EMS-1.jpg', 'EMS-2.jpg', 'EMS-3.jpg'],
    gitHubLink: 'https://github.com/UVicRocketry/PDP-Monitoring-System',
    linkedInLink:
      'https://www.linkedin.com/feed/update/urn:li:activity:7183004322358550528/',
  },
  {
    id: 'project.ground-support',
    title: 'Ground Support',
    slug: 'ground-support',
    overview: paragraphs(
      `Ground Support is a telemetry visualization and post flight analysis tool developed by the University of
       Victoria Rocketry Team. It is designed to be a modular and dynamic
       application that can be used for any configuration of sounding rocket.`,
      `The system was designed with the core principles of a micro service architecture, for easy maintainability and
       scalability. The core of the system is composed of two services, application, and telemetry.`,
    ),
    skillDescription:
      'This project was built on a micro service architecture with three services, frontend (Typescript React), telemetry (rust and python) and server (Express and MongooseJs).',
    timeline: timeline('Sep 2022 - present'),
    skills: ['Web Development', 'UI/UX Design', 'API Design'],
    technologies: ['TypeScript', 'React', 'Rust', 'MongooseJS', 'MUI', 'REST'],
    photos: ['GS-1.jpg', 'GS-2.jpg', 'GS-3.jpg', 'GS-4.jpg'],
    gitHubLink: 'https://github.com/UVicRocketry/Ground-Support',
    linkedInLink:
      'https://www.linkedin.com/feed/update/urn:li:activity:7104630524907855873/',
  },
  {
    id: 'project.anduril-flight-computer',
    title: 'AndÚril Flight Computer',
    slug: 'anduril-flight-computer',
    overview: paragraphs(
      `This Project is rocketry's first attempt at a developing a rust based
       flight computer system. My contribution to the project was do an investigation and report
       into the viability of rust in embedded systems.`,
      `After the an assessment of the viability of rust was done it was determined we needed a stronger base in C
       before we could move to rust. This lead into the develop of C based drivers for the STM32 microcontroller.`,
    ),
    // v1 had an empty skillsDescription; left unset so the Studio flags it.
    skillDescription: '',
    timeline: timeline('Sep 2023 - present'),
    skills: [
      'Developed series of technical report focusing on evaluating rusts viability in embedded systems using quantifiable metrics',
      'Migrated Xenia-2 C++ codebase to rust, validated system through HIL testing. Plan to fly in on a L1 certification flight Feb 2024.',
      'Wrote guide on how to use rust in embedded systems to help onboard new members.',
    ],
    technologies: ['Rust', 'C', 'Embedded Systems', 'HIL Testing', 'STM32', 'FreeRTOS'],
    photos: ['AFC-1.jpg'],
    websiteLink:
      'https://drive.google.com/drive/folders/1HmbC9vWZxt-nJ8LGUyFYhisnisMbH3kO?usp=share_link',
  },
  {
    id: 'project.xenia-1-flight-computer',
    title: 'Xenia-1 Flight Computer',
    slug: 'xenia-1-flight-computer',
    overview: paragraphs(
      `Xenia-1 was the first rocket that UVR developed coming out of covid-19. Due to the pandemic restrictions the team lost mass of members,
       therefore the avionics team simplified the system to operate off of a raspberry pi using python. Though the avionics system was simplified the rocket itself was
       contained some of the most ambition projects, such as airbrakes and a deployable payload.`,
      `During this time I was the Software lead of rocketry, making it my responsibility to ensure all embedded systems were tested and
       developed according to team wide deadlines. As a project manager in collaboration with the electrical lead I developed requirements, epics and throughout development
       created tasks with clear acceptance criteria. In the development side of thing using the requirement I implemented the foundations of a object oriented design pattern to allow for simple abstraction
       of the HAL features. In addition I developed sensor fault detection and migration so the airbrakes system would always act on reliable data.`,
    ),
    skillDescription:
      'This project was built using python using adafruit libraries and a raspberry pi.',
    timeline: timeline('Sep 2021 - Aug 2022'),
    skills: [
      'Use Object Oriented principles in combination with an embedded libraries to develop a reliable data logger',
      'Taught new members and younger students how to use git and python for embedded development',
      'Created a backlog of tasks with concrete goals and acceptance create and assigned them to members by helping them break down the task into smaller pieces',
    ],
    technologies: ['Python', 'Embedded Systems'],
    photos: [
      'Xenia1-FC-1.png',
      'Xenia1-FC-2.png',
      'Xenia1-FC-3.png',
      'Xenia1-FC-4.png',
    ],
    gitHubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
  },
  {
    id: 'project.software-process',
    title: 'Software Process',
    slug: 'software-process',
    overview: paragraphs(
      `In my almost 2 years a Avionics software Lead I developed a Agile software process for the team.
       Voluntary positions are hard to manage inside cross-functional teams, with that in mind I developed a process
       to encourage participation, and accountability using scrum techniques.`,
    ),
    skillDescription: 'The process was built using integrations between Trello and Monday.com.',
    timeline: timeline('Sep 2021 - Aug 2022'),
    skills: [
      'Developed a series of presentations to teach new members how to use the process',
      'Recorded a series of video to teach members how the process works, through demonstrating a ticket lifecycle',
    ],
    technologies: ['Agile', 'Scrum', 'Monday.com', 'Trello', 'Github'],
    // v1 had photos: [''] — no real image.
    photos: [],
    gitHubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
    websiteLink:
      'https://docs.google.com/presentation/d/1gkJjfWnc6jsr0PQ29cYPVdIOYFZum4SubFt4X8ovL-o/edit#slide=id.g15242db26bd_0_4',
  },
  {
    id: 'project.hybrid-controls-system',
    title: 'Hybrid Controls System',
    slug: 'hybrid-controls-system',
    overview: paragraphs(
      `For my first project in the rocketry club I developed multiple iterations of a GUI to
       interface with and control valves`,
    ),
    // v1 had an empty skillsDescription; left unset so the Studio flags it.
    skillDescription: '',
    timeline: timeline('Dec 2019 - Mar 2021'),
    // v1 competencies was [''] — nothing to carry over.
    skills: [],
    technologies: ['Python', 'Socket', 'C++', 'Qt'],
    photos: ['HBC-1.png', 'HBC-2.png'],
    gitHubLink: 'https://github.com/UVicRocketry/Xenia1-Flight-Computer',
  },
]

// ---------------------------------------------------------------------------
// Experiences — `skills` inferred from v1 bullet points (no v1 equivalent).
// ---------------------------------------------------------------------------

interface V1Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate?: string
  about: string
  skills: string[]
}

const experiences: V1Experience[] = [
  {
    id: 'experience.shift-product-engineer',
    company: 'Shift Browser',
    position: 'Product Engineer',
    startDate: isoDate('Sep 2024'),
    // Current role — no end date.
    about: '',
    skills: ['React', 'TypeScript', 'MobX', 'Chromium', 'UI/UX'],
  },
  {
    id: 'experience.uvr-technical-coordinator',
    company: 'UVic Rocketry',
    position: 'Technical Coordinator',
    startDate: isoDate('Sep 2022'),
    about: paragraphs(
      'Oversaw a backlog, and assigned tasks through an 3 week sprint to ensure member participation',
      'Ran full stack skilldevs to onboard new members and ensure members are comfortable with the MERN stack',
      'Developed a mirco service based system to allow for open source the project for other rocketry teams to use',
      'Designed UI/UX in Figma and ensured implementation matched design pattern',
    ),
    skills: ['Agile', 'Scrum', 'MERN', 'Microservices', 'Figma', 'UI/UX Design', 'Mentoring'],
  },
  {
    id: 'experience.helm-contract-software-engineer',
    company: 'Helm Operations',
    position: 'Contract Software Engineer',
    startDate: isoDate('Sep 2022'),
    endDate: isoDate('Jan 2023'),
    about: paragraphs(
      'Prototype features that were demonstrated at conferences to over 100 representatives from separate companies',
      'Created client requested features to help win bids for large maritime commodities',
      'Communicated with product team to for technical insight into there designs',
      'Developed and alters foundational frontend components for new VueJS',
    ),
    skills: ['VueJS', 'Prototyping', 'Frontend Components', 'Stakeholder Communication'],
  },
  {
    id: 'experience.island-temperature-controls',
    company: 'Island Temperature Controls',
    position: 'Graphics Developer DDC',
    startDate: isoDate('Sep 2022'),
    endDate: isoDate('Jan 2023'),
    about: paragraphs(
      'Worked with a small to develop a web application for a local HVAC company',
      'Elicited requirements from other teams and validated designs with HVAC technicians to ensure accuracy of the user experience',
      'Coordinated directly with technicians to improve design by ensuring accuracy and user experience',
    ),
    skills: ['Web Development', 'Requirements Gathering', 'UX Validation'],
  },
  {
    id: 'experience.helm-full-stack-developer',
    company: 'Helm Operations',
    position: 'Full Stack Developer',
    startDate: isoDate('Jan 2022'),
    endDate: isoDate('Sep 2022'),
    about: paragraphs(
      'Designed, Developed, Tested and implemented a feature that enables the saving filtering presets for a dispatching system.',
      'Created complex API endpoints, data and schema migrations to interact with a LINQ backbone.',
      'Contributed to Quality assurance efforts by identifying bugs and unexpected workflows.',
    ),
    skills: ['LINQ', 'API Design', 'Database Migrations', 'Full Stack', 'QA'],
  },
  {
    id: 'experience.uvr-avionics-co-lead',
    company: 'UVic Rocketry',
    position: 'Avionics co-lead',
    startDate: isoDate('Mar 2021'),
    endDate: isoDate('Sep 2022'),
    about: paragraphs(
      'Standardized a agile software process for the team',
      'Created series presentations, figma prototypes, and videos to onboard new members',
      'Designed and implemented a object oriented design pattern for the HAL features of the rocket',
    ),
    skills: ['Agile', 'Figma', 'Object-Oriented Design', 'Embedded Systems', 'Onboarding'],
  },
  {
    id: 'experience.uvr-media-lead',
    company: 'UVic Rocketry',
    position: 'Media Lead',
    startDate: isoDate('Mar 2021'),
    endDate: isoDate('Sep 2022'),
    about: paragraphs(
      'Organized fundraisers and events to raise money and community presence for the team',
      'Developed sponsorship packages and reached out to potential sponsors, landing sponsorship from Lockheed Martian and other aerospace companies',
      'Maintained a social media presence on Instagram and LinkedIn',
    ),
    skills: ['Fundraising', 'Sponsorship', 'Social Media', 'Community Outreach'],
  },
  {
    id: 'experience.uvr-propulsion-member',
    company: 'UVic Rocketry',
    position: 'Propulsion Member',
    startDate: isoDate('Dec 2019'),
    endDate: isoDate('Mar 2021'),
    about: 'Developed a GUI to interface with and control valves',
    skills: ['Python', 'C++', 'Qt', 'GUI Development'],
  },
]

// ---------------------------------------------------------------------------

const importProjects = async () => {
  for (const project of projects) {
    const {id, photos, ...fields} = project

    if (id === TABLETAPP_ID) {
      // Existing document: fill in fields without touching its uploaded images.
      await client
        .patch(id)
        .set(clean({...fields, slug: {_type: 'slug', current: fields.slug}, hasDemo: false}))
        .commit()
      console.log(`patched existing project: ${project.title}`)
      continue
    }

    const doc = clean({
      _id: id,
      _type: 'project',
      ...fields,
      slug: {_type: 'slug', current: fields.slug},
      hasDemo: false,
      images: photos.length > 0 ? await imageArray(photos) : undefined,
    })

    await client.createOrReplace(doc)
    console.log(`created project: ${project.title} (${photos.length} images)`)
  }
}

const importExperiences = async () => {
  for (const experience of experiences) {
    const {id, ...fields} = experience
    await client.createOrReplace(clean({_id: id, _type: 'experience', ...fields}))
    console.log(`created experience: ${experience.position} @ ${experience.company}`)
  }
}

const importSiteSettings = async () => {
  const headshot = await client.assets.upload(
    'image',
    readFileSync(resolve(V1_ASSETS, 'kris.png')),
    {filename: 'kris.png'},
  )
  const resume = await client.assets.upload(
    'file',
    readFileSync(resolve(V1_SRC_ASSETS, 'Kris Lemieux Resume 2024.pdf')),
    {filename: 'Kris Lemieux Resume 2024.pdf'},
  )

  await client.createOrReplace(
    clean({
      _id: 'siteSettings',
      _type: 'siteSettings',
      name: 'Kris Lemieux',
      // Intentionally unset — Kris is writing this line himself.
      tagline: undefined,
      bio: paragraphs(
        `Hello my name is Kris, I am a avid gravel cyclist, artist, and slightly illiterate Software Engineer.
         Growing up with Dyslexia my outlet was to express myself visually any way I could, from traditional painting
         to graphic design. This came to a head when in high school I was introduced to web site development and
         I became obsessed.`,
        `Today, I am on my cusp of Graduating with a bachelors of Computer Engineering from the University of Victoria,
         as of December 2024. Throughout the 5 years of university I've been involved in a range of projects, from web
         development to mechatronics systems, with a majority of them within the UVic Rocketry Team. My favorite type of
         projects often involves a mix of software and hardware which require a deep understanding of system design.
         Along side my technical skills, I've developed a liking for project and people management, as there is no greater
         feeling when match the right person to the right task and see them thrive.`,
      ),
      headshot: {
        _type: 'image',
        asset: {_type: 'reference', _ref: headshot._id},
        alt: 'Kris Lemieux',
      },
      email: 'lemieuxkristopher@gmail.com',
      resume: {_type: 'file', asset: {_type: 'reference', _ref: resume._id}},
      gitHubLink: 'https://github.com/klemie',
      linkedInLink: 'https://www.linkedin.com/in/krislemie/',
    }),
  )
  console.log('created siteSettings (tagline left blank)')
}

const run = async () => {
  await importSiteSettings()
  await importExperiences()
  await importProjects()
  console.log('\nDone. Remaining manual steps:')
  console.log('  - Write the tagline in Site Settings')
  console.log('  - Write the "about" text for Shift Browser (v1 had none)')
  console.log('  - Add skillDescription for Andúril and Hybrid Controls (v1 had none)')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
