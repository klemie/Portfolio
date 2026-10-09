import {formatRange} from '../lib/formatDate'
import type {Experience} from '../lib/types'
import './ExperienceSection.css'

export const ExperienceSection = ({experiences, onOpen}: {experiences: Experience[]; onOpen: (id: string) => void}) => (
  <section className="section" id="experience">
    <h2>Experience</h2>
    <ul className="list">
      {experiences.map((experience) => (
        <li key={experience._id} className="entry">
          <h3>
            {experience.position} · {experience.company}
          </h3>
          <p className="entry-meta">{formatRange(experience.startDate, experience.endDate)}</p>
          <p>{experience.about}</p>
          <ul className="tags">
            {experience.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
          <button type="button" className="experience-visit" onClick={() => onOpen(experience._id)}>Visit experience ↗</button>
        </li>
      ))}
    </ul>
  </section>
)
