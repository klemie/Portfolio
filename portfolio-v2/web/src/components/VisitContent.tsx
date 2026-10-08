import {useLayoutEffect, useRef, useState} from 'react'
import type {Experience, Project} from '../lib/types'
import type {Visit, VisitTarget} from '../lib/visit'
import {formatRange} from '../lib/formatDate'
import {urlFor} from '../lib/sanity'
import './VisitContent.css'

const Labels = ({labels}: {labels: string[]}) => (
  <ul className="visit-content-labels">{[...new Set(labels)].map((label) => <li key={label}>{label}</li>)}</ul>
)

const ExperienceContent = ({experience}: {experience: Experience}) => (
  <article className="visit-role">
    <p className="visit-content-kicker">{formatRange(experience.startDate, experience.endDate)}</p>
    <h2>{experience.position}</h2>
    <p className="visit-content-prose">{experience.about}</p>
  </article>
)

const ProjectContent = ({project}: {project: Project}) => {
  const links = [
    project.hasDemo && project.demoLink && {label: 'View demo', href: project.demoLink},
    project.gitHubLink && {label: 'GitHub', href: project.gitHubLink},
    project.websiteLink && {label: 'Website', href: project.websiteLink},
    project.linkedInLink && {label: 'LinkedIn', href: project.linkedInLink},
  ].filter(Boolean) as {label: string; href: string}[]

  return (
    <>
      <div className="visit-project-intro">
        <div>
          <p className="visit-content-kicker">Overview</p>
          <h2>{project.title}</h2>
          <p className="visit-content-prose">{project.overview}</p>
        </div>
        <aside className="visit-project-meta" aria-label="Project details">
          {project.timeline?.length > 0 && <><h3>Timeline</h3><p>{project.timeline.join(' — ')}</p></>}
          {links.length > 0 && <><h3>Explore</h3><ul className="visit-project-links">{links.map((link) => <li key={link.href}><a href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a></li>)}</ul></>}
        </aside>
      </div>
      {project.skillDescription && (
        <section className="visit-project-skills">
          <p className="visit-content-kicker">The work</p>
          <h2>Skills & contribution</h2>
          {project.skillDescription && <p className="visit-content-prose">{project.skillDescription}</p>}
        </section>
      )}
      {project.images?.map((image, index) => (
        <figure className="visit-project-image" key={image._key ?? `${image.asset._ref}-${index}`}>
          <img src={urlFor(image).width(1600).url()} alt={image.alt ?? `${project.title} screenshot ${index + 1}`} loading="lazy" />
          {image.alt && <figcaption>{image.alt}</figcaption>}
        </figure>
      ))}
    </>
  )
}

interface VisitContentProps {
  visit: Visit
  onVisit: (target: VisitTarget) => void
}

export const VisitContent = ({visit, onVisit}: VisitContentProps) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [longPage, setLongPage] = useState(false)

  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content) return
    const measure = () => {
      // Ignore the optional footer so showing it cannot make a short page long.
      const bottom = content.getBoundingClientRect().bottom + window.scrollY
      const padding = parseFloat(getComputedStyle(content.parentElement!).paddingBottom)
      setLongPage(bottom + padding > window.innerHeight + 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(content)
    observer.observe(content.parentElement!)
    observer.observe(document.body)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [visit.target.kind, visit.target.id])

  return (
    <main className="visit-content" id="visit-content" tabIndex={-1}>
      <div ref={contentRef} className="visit-content-body">
        {visit.project ? <ProjectContent project={visit.project} /> : visit.experience ? (
          <ExperienceContent experience={visit.experience} />
        ) : visit.stop && (
          <>
            {visit.stop.blurb && <div className="visit-stop-intro"><p className="visit-content-prose">{visit.stop.blurb}</p></div>}
            {visit.stop.experiences.map((experience) => <ExperienceContent key={experience._id} experience={experience} />)}
            {visit.stop.projects.length > 0 && (
              <section className="visit-stop-projects">
                <p className="visit-content-kicker">Selected projects</p>
                <h2>Explore the work</h2>
                <div className="visit-project-grid">
                  {visit.stop.projects.map((project) => (
                    <article className="visit-project-card" key={project._id}>
                      <p className="visit-content-kicker">{project.timeline?.join(' — ')}</p>
                      <h3>{project.title}</h3>
                      <p>{project.overview}</p>
                      <Labels labels={project.technologies ?? []} />
                      <button type="button" onClick={() => onVisit({kind: 'projects', id: project.slug})}>Visit project <span aria-hidden="true">↗</span></button>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
      {longPage && <footer className="visit-content-footer">
        <button type="button" onClick={() => window.scrollTo({top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})}>Back to top ↑</button>
      </footer>}
    </main>
  )
}
