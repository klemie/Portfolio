import type {Experience} from '../lib/types'
import {formatRange} from '../lib/formatDate'
import './ExperienceSummary.css'

export const ExperienceSummary = ({experience}: {experience: Experience}) => (
  <article className="experience-summary">
    <p className="experience-summary-date">{formatRange(experience.startDate, experience.endDate)}</p>
    <h2>{experience.position}</h2>
    <p className="experience-summary-prose">{experience.about}</p>
  </article>
)
