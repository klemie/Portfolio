import {useLayoutEffect, useRef, useState} from 'react'
import type {Visit} from '../lib/visit'
import {ExperienceSummary} from './ExperienceSummary'
import {ProjectShowcase} from './ProjectShowcase'
import {CyclingStories} from './CyclingStories'
import {ScrollHint} from './ScrollHint'
import './VisitContent.css'

export const VisitContent = ({visit}: {visit: Visit}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [longPage, setLongPage] = useState(false)
  const [canScroll, setCanScroll] = useState(false)
  const otherExperiences = visit.experience ? [] : [...(visit.stop?.experiences ?? [])]
    .reverse().filter((experience) => experience._id !== visit.featuredExperience?._id)

  useLayoutEffect(() => {
    const content = contentRef.current
    if (!content) return
    const measure = () => {
      const bottom = content.getBoundingClientRect().bottom + window.scrollY
      const padding = parseFloat(getComputedStyle(content.parentElement!).paddingBottom)
      setLongPage(bottom + padding > window.innerHeight + 1)
      setCanScroll(bottom + padding - window.scrollY > window.innerHeight + 8)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(content)
    observer.observe(content.parentElement!)
    observer.observe(document.body)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, {passive: true})
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [visit.target.kind, visit.target.id])

  return (
    <main className="visit-content" id="visit-content" tabIndex={-1}>
      {longPage && <ScrollHint className="visit-scroll-hint" direction={canScroll ? 'down' : 'up'} onClick={() => {
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
        if (canScroll) window.scrollBy({top: window.innerHeight * 0.8, behavior})
        else window.scrollTo({top: 0, behavior})
      }}>{canScroll ? `Scroll to explore ${visit.project ? 'the project' : 'this stop'}` : 'Back to top'}</ScrollHint>}
      <div ref={contentRef} className="visit-content-body">
        {visit.project ? <ProjectShowcase projects={[visit.project]} showHeading={false} /> : (
          <>
            {!visit.experience && visit.stop?.blurb && <p className="visit-stop-intro">{visit.stop.blurb}</p>}
            {!visit.experience && visit.stop?.cycling && <CyclingStories cycling={visit.stop.cycling} />}
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
    </main>
  )
}
