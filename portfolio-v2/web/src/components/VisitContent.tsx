import {useLayoutEffect, useRef, useState} from 'react'
import type {Visit} from '../lib/visit'
import {ExperienceSummary} from './ExperienceSummary'
import {ProjectShowcase} from './ProjectShowcase'
import './VisitContent.css'

export const VisitContent = ({visit}: {visit: Visit}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [longPage, setLongPage] = useState(false)
  const otherExperiences = visit.experience ? [] : [...(visit.stop?.experiences ?? [])]
    .reverse().filter((experience) => experience._id !== visit.featuredExperience?._id)

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
        {visit.project ? <ProjectShowcase projects={[visit.project]} showHeading={false} /> : (
          <>
            {!visit.experience && visit.stop?.blurb && <p className="visit-stop-intro">{visit.stop.blurb}</p>}
            {visit.featuredExperience && <section className="visit-featured-experience" aria-label={`${visit.featuredExperience.company} — ${visit.featuredExperience.position}`}>
              <ExperienceSummary experience={visit.featuredExperience} />
              <ProjectShowcase projects={visit.featuredExperience.projects} />
            </section>}
            {otherExperiences.map((experience) => <section className="visit-experience" key={experience._id} aria-label={`${experience.company} — ${experience.position}`}>
              <ExperienceSummary experience={experience} />
              <ProjectShowcase projects={experience.projects} />
            </section>)}
          </>
        )}
      </div>
      {longPage && <footer className="visit-content-footer">
        <button type="button" onClick={() => window.scrollTo({top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})}>Back to top ↑</button>
      </footer>}
    </main>
  )
}
