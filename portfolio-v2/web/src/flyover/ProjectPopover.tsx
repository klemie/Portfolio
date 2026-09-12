import {useEffect, useRef} from 'react'
import {urlFor} from '../lib/sanity'
import type {Project} from '../lib/types'
import './ProjectPopover.css'

interface ProjectPopoverProps {
  project: Project
  onClose: () => void
}

/**
 * Project detail on the ride.
 *
 * Deliberately not the ProjectModal used on the fallback page: this one is a
 * lighter map-native panel and does not touch the URL (spec §2). The trade is
 * that project links are only shareable from the fallback page — recorded as
 * risk 3 in the spec.
 */
export const ProjectPopover = ({project, onClose}: ProjectPopoverProps) => {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [onClose])

  const links = [
    project.hasDemo && project.demoLink && {label: 'Demo', href: project.demoLink},
    project.gitHubLink && {label: 'GitHub', href: project.gitHubLink},
    project.websiteLink && {label: 'Website', href: project.websiteLink},
    project.linkedInLink && {label: 'LinkedIn', href: project.linkedInLink},
  ].filter(Boolean) as {label: string; href: string}[]

  const cover = project.images?.[0]

  return (
    <div
      className="ride-popover-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="ride-popover"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ride-popover-title"
      >
        <button ref={closeRef} type="button" className="ride-popover-close" onClick={onClose}>
          Close
        </button>

        {cover && (
          <img
            className="ride-popover-image"
            src={urlFor(cover).width(720).height(400).fit('crop').url()}
            alt={cover.alt ?? project.title}
            loading="lazy"
          />
        )}

        <h3 id="ride-popover-title">{project.title}</h3>
        {project.timeline.length > 0 && (
          <p className="entry-meta">{project.timeline.join(' — ')}</p>
        )}

        <p>{project.overview}</p>
        <p className="entry-meta">{project.skillDescription}</p>

        <ul className="tags">
          {project.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>

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
