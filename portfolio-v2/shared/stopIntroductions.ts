import type {Education} from '../web/src/lib/types'

/** Stop introductions and education collected from Kris in October 2026. */
export const stopIntroductionUpdates: Record<string, {blurb: string; education?: Education}> = {
  'stop-shift': {
    blurb:
      'Shift is a customizable browser built as a fork of Chromium, bringing web apps and everyday work into one place.',
  },
  'stop-helm-operations': {
    blurb:
      'Helm Operations builds software for maritime compliance and fleet management, helping vessel operators manage their day-to-day operations.',
  },
  'stop-island-temperature-controls': {
    blurb:
      'Island Temperature Controls works on building heating, ventilation, and air conditioning systems and the controls behind them. During my time there, I worked on contract at Canadian Forces Base Esquimalt.',
  },
  'stop-uvic-rocketry': {
    blurb:
      'UVic Rocketry is a student engineering team at the University of Victoria that designs, builds, and launches rockets, with rocket and engine development at its core. Students work across propulsion, avionics, and ground support, and compete in events such as Launch Canada and Spaceport America.',
  },
  'stop-uvic': {
    blurb:
      'The University of Victoria is where I studied computer engineering, specializing in mechatronics and digital systems. The program gave me a strong foundation in electrical engineering, alongside software, hardware, and system design.',
    education: {
      degree: 'Bachelor of Engineering in Computer Engineering',
      startYear: 2019,
      endYear: 2024,
      specializations: ['Mechatronics', 'Digital systems'],
      awards: [
        {
          _key: 'jcura',
          title: 'Jamie Cassels Undergraduate Research Award (JCURA)',
        },
        {
          _key: 'capstone-second-place',
          title: 'Second place — Capstone project',
        },
      ],
    },
  },
  'stop-fort-street-cycle': {
    blurb:
      'Fort Street Cycle is a local bike shop in Victoria and a third space for cyclists: somewhere to chat, meet people, and head out on group rides. Think of a skate shop, but for bikes. It’s my happy space.',
  },
}
