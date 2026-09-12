import {useEffect, useRef} from 'react'
import {urlFor} from '../lib/sanity'
import type {Project} from '../lib/types'
import './ProjectModal.css'

interface ProjectModalProps {
  project: Project
  onClose: () => void
}

export const ProjectModal = ({project, onClose}: ProjectModalProps) => {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [onClose])

  const links = [
    project.hasDemo && project.demoLink && {label: 'Demo', href: project.demoLink},
    project.gitHubLink && {label: 'GitHub', href: project.gitHubLink},
    project.websiteLink && {label: 'Website', href: project.websiteLink},
    project.linkedInLink && {label: 'LinkedIn', href: project.linkedInLink},
  ].filter(Boolean) as {label: string; href: string}[]

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
        <button ref={closeRef} type="button" className="modal-close" onClick={onClose}>
          Close
        </button>

        <h2 id="project-modal-title">{project.title}</h2>
        {project.timeline.length > 0 && (
          <p className="entry-meta">{project.timeline.join(' — ')}</p>
        )}

        <p>{project.overview}</p>

        <h3>Skills</h3>
        <p>{project.skillDescription}</p>
        <ul className="tags">
          {project.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>

        <h3>Technologies</h3>
        <ul className="tags">
          {project.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>

        {project.images?.map((image, index) => (
          <img
            key={image._key ?? image.asset._ref}
            src={urlFor(image).width(1200).url()}
            alt={image.alt ?? `${project.title} screenshot ${index + 1}`}
            loading="lazy"
          />
        ))}

        {links.length > 0 && (
          <ul className="links">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
