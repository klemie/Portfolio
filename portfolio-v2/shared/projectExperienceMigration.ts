/** Existing content only. New projects choose their parent in Sanity Studio. */
export const legacyProjectExperiences: Record<string, string> = {
  'ground-support': 'experience-uvic-rocketry-technical-coordinator',
  'engine-monitoring-system': 'experience-uvic-rocketry-technical-coordinator',
  'anduril-flight-computer': 'experience-uvic-rocketry-technical-coordinator',
  'xenia-1-flight-computer': 'experience-uvic-rocketry-avionics-co-lead',
  'software-process': 'experience-uvic-rocketry-avionics-co-lead',
  'hybrid-controls-system': 'experience-uvic-rocketry-propulsion-member',
  'tabletapp': 'experience-uvic-capstone',
}

export const legacyProjectEmbeds: Record<string, string> = {
  tabletapp: 'https://tabletapp.github.io/TableTapp/',
  'software-process': 'https://docs.google.com/presentation/d/1gkJjfWnc6jsr0PQ29cYPVdIOYFZum4SubFt4X8ovL-o/preview',
}

export const legacyProjectOrder: Record<string, number> = {
  'ground-support': 0,
  'engine-monitoring-system': 1,
  'anduril-flight-computer': 2,
  'xenia-1-flight-computer': 0,
  'software-process': 1,
  'hybrid-controls-system': 0,
  tabletapp: 0,
}

export const capstoneExperience = {
  _id: 'experience-uvic-capstone',
  _type: 'experience',
  company: 'University of Victoria',
  position: 'Capstone project',
  startDate: '2023-05-01',
  endDate: '2023-08-01',
  about: 'Designed and built TableTapp, an all-in-one restaurant platform, as a Computer Engineering capstone. Worked across UI/UX design, full stack development and Scrum, validating designs with restaurant owners and front- and back-of-house professionals.',
  skills: ['UI/UX Design', 'Full Stack Development', 'Scrum'],
}
