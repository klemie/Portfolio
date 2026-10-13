/** Stop membership follows the waypoints in Kris's Strava route export. */
export const rideStopSeeds = [
  {
    id: 'shift', title: 'Shift Browser', waypointName: 'Shift Browser', order: 0,
    experiences: ['experience-shift-product-engineer'], projects: [],
  },
  {
    id: 'helm-operations', title: 'Helm Operations', waypointName: 'Helm Operations', order: 1,
    experiences: ['experience-helm-operations-full-stack-developer', 'experience-helm-operations-contract-software-engineer'], projects: [],
  },
  {
    id: 'island-temperature-controls', title: 'Island Temperature Controls', waypointName: 'Island Temperature Controls', order: 2,
    experiences: ['experience-island-temperature-controls-graphics-developer'], projects: [],
  },
  {
    id: 'uvic-rocketry', title: 'UVic Rocketry', waypointName: 'UVic Rocketry', order: 3,
    experiences: [
      'experience-uvic-rocketry-propulsion-member',
      'experience-uvic-rocketry-media-lead',
      'experience-uvic-rocketry-avionics-co-lead',
      'experience-uvic-rocketry-technical-coordinator',
    ],
    projects: ['project-hybrid-controls-system', 'project-xenia-1-flight-computer', 'project-ground-support', 'project-engine-monitoring-system'],
  },
  {
    id: 'uvic', title: 'UVic', waypointName: 'UVic 1', order: 4,
    experiences: ['experience-uvic-capstone'], projects: ['87709030-86b7-4a84-a026-5225e33456d2'],
  },
  {
    id: 'fort-street-cycle', title: 'Fort Street Cycle', waypointName: 'Fort Street Cycles', order: 5,
    experiences: [], projects: [],
  },
]

export const cyclingRaceSeeds = [
  {
    _type: 'cyclingEntry', _key: 'bwr-bc-wafer', title: 'BWR BC Wafer',
    result: '1st in my age category', url: 'https://www.strava.com/activities/12479089516',
  },
  {
    _type: 'cyclingEntry', _key: 'bwr-az-wafer', title: 'BWR AZ Wafer',
    url: 'https://www.strava.com/activities/13762361613',
  },
]
