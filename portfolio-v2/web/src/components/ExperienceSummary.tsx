import type {Experience} from '../lib/types'
import {formatRange} from '../lib/formatDate'
import {urlFor} from '../lib/sanity'
import './ExperienceSummary.css'

export const ExperienceSummary = ({experience}: {experience: Experience}) => (
  <article className="experience-summary">
    <p className="experience-summary-date">{formatRange(experience.startDate, experience.endDate)}</p>
    <h2>{experience.position}</h2>
    <p className="experience-summary-prose">{experience.about}</p>
    {experience.images?.some((image) => image.asset?._ref) && <div className="experience-summary-gallery" role="region" tabIndex={0}
      aria-label={`${experience.company} photos and screenshots — scroll horizontally`}>
      {experience.images.filter((image) => image.asset?._ref).map((image) => <a key={image._key ?? image.asset._ref}
        href={urlFor(image).width(2560).auto('format').url()} target="_blank" rel="noopener noreferrer"
        aria-label={`Open full-size image: ${image.alt || experience.company}`}>
        <img src={urlFor(image).width(1200).auto('format').url()} alt={image.alt ?? ''} loading="lazy" />
      </a>)}
    </div>}
  </article>
)
