import {useEffect, useId, useRef, useState} from 'react'
import type {Project} from '../lib/types'
import {projectLinks} from '../lib/projectMedia'
import {ProjectMediaViewer} from './ProjectMediaViewer'
import './ProjectShowcase.css'

export const ProjectShowcase = ({projects, showHeading = true}: {projects: Project[]; showHeading?: boolean}) => {
  const [selectedId, setSelectedId] = useState(projects[0]?._id)
  const [open, setOpen] = useState(false)
  const selectorRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const project = projects.find((item) => item._id === selectedId) ?? projects[0]

  useEffect(() => {
    if (!open) return
    selectorRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus()
    const outside = (event: PointerEvent) => {
      if (!selectorRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {setOpen(false); triggerRef.current?.focus()}
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  if (!project) return null
  const links = projectLinks(project)
  const tags = [...new Set([...(project.skills ?? []), ...(project.technologies ?? [])])]

  return (
    <section className="project-showcase" aria-label="Projects from this experience">
      <div className="project-showcase-heading">
        {showHeading && <div className="project-selector" ref={selectorRef} onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
        }}>
          <h2 aria-live="polite" aria-label={project.title}>
            {projects.length > 1 ? <button ref={triggerRef} type="button" className="project-selector-trigger"
              aria-label={`Choose project: ${project.title}`} aria-expanded={open} aria-controls={menuId}
              onClick={() => setOpen(!open)}>
              <span>{project.title}</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button> : project.title}
          </h2>
          {open && <div className="project-selector-options" id={menuId} role="group" aria-label="Choose a project">
            {projects.map((item) => <button type="button" key={item._id} aria-pressed={item._id === project._id}
              onClick={() => {setSelectedId(item._id); setOpen(false); triggerRef.current?.focus({preventScroll: true})}}>
              <span>{item.title}</span>{item._id === project._id && <span aria-hidden="true">✓</span>}
            </button>)}
          </div>}
        </div>}
        {links.length > 0 && <ul className="project-showcase-links" aria-label="Project links">
          {links.map((link) => <li key={link.href}><a href={link.href} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span></a></li>)}
        </ul>}
      </div>
      <ProjectMediaViewer project={project} key={project._id} />
      {(project.overview || project.skillDescription || tags.length > 0) && <div className="project-showcase-context">
        {(project.overview || tags.length > 0) && <div>
          <p className="project-showcase-kicker">The project{project.timeline?.length ? ` · ${project.timeline.join(' — ')}` : ''}</p>
          {project.overview && <p className="project-showcase-prose">{project.overview}</p>}
          {tags.length > 0 && <ul className="project-showcase-tags" aria-label="Project skills and technologies">{tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
        </div>}
        {project.skillDescription && <div>
          <p className="project-showcase-kicker">My contribution</p>
          <p className="project-showcase-prose">{project.skillDescription}</p>
        </div>}
      </div>}
    </section>
  )
}
