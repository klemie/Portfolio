import type {Education} from '../lib/types'
import './EducationBackground.css'

export const EducationBackground = ({education}: {education: Education}) => (
  <section className="education-background" aria-labelledby="education-heading">
    <h2 id="education-heading">Education</h2>
    <p className="education-degree">{education.degree}</p>
    <p className="education-period">{education.startYear}–{education.endYear ?? 'Present'}</p>
    <div className="education-details">
      {!!education.specializations?.length && <div>
        <h3>Specializations</h3>
        <ul>{education.specializations.map((specialization) => <li key={specialization}>{specialization}</li>)}</ul>
      </div>}
      {!!education.awards?.length && <div>
        <h3>Awards</h3>
        <ul>{education.awards.map((award) => <li key={award._key}>
          <span>{award.title}{award.year != null && <span className="education-award-year"> · {award.year}</span>}</span>
          {award.description && <p className="education-award-description">{award.description}</p>}
        </li>)}</ul>
      </div>}
    </div>
  </section>
)
