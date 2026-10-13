import type {Project, SiteSettings, Stop} from '../lib/types'
import type {ReactNode} from 'react'
import {visitPath} from '../lib/visit'
import {ScrollHint} from '../components/ScrollHint'
import './RidePreview.css'

interface RidePreviewProps {
  settings: SiteSettings
  stop?: Stop
  previous?: Stop
  next?: Stop
  index: number
  count: number
  landing: boolean
  settled: boolean
  finishing: boolean
  onNavigate: (index: number) => void
  musicControl: ReactNode
  suggestedProjects: Project[]
  onProject: (project: Project) => void
  highlightedProject: string | null
  onHighlightProject: (slug: string | null) => void
}

export const RidePreview = ({settings, stop, previous, next, index, count, landing, settled, finishing, onNavigate, musicControl, suggestedProjects, onProject, highlightedProject, onHighlightProject}: RidePreviewProps) => (
  <div className={`ride-preview${landing ? ' ride-preview--intro' : ''}`}>
    <div className="ride-preview-top">
      <button type="button" className="ride-wordmark" onClick={() => onNavigate(-1)}>{settings.name}</button>
      <span className="ride-preview-count">{landing || finishing ? 'Victoria, BC' : `${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`}</span>
    </div>

    <div className="ride-preview-title" aria-live="polite" hidden={finishing}>
      {!landing && <>
        <p className="ride-eyebrow">{settled ? 'You’ve arrived' : 'On the way to'}</p>
        <h1>{stop?.title}</h1>
      </>}
      {landing && <div className="living-route-slot" aria-hidden="true" />}
      {landing && suggestedProjects.length > 0 && <section className="ride-intro-projects" aria-label="Suggested projects">
        <h2>Suggested projects</h2>
        <div className="ride-intro-project-links">
          {suggestedProjects.map((project) => <a key={project._id} href={visitPath({kind: 'projects', id: project.slug})}
            data-project-slug={project.slug}
            data-highlighted={highlightedProject === project.slug}
            onMouseEnter={() => onHighlightProject(project.slug)}
            onMouseLeave={() => onHighlightProject(null)}
            onFocus={() => onHighlightProject(project.slug)}
            onBlur={() => onHighlightProject(null)}
            onAnimationEnd={(event) => event.currentTarget.classList.remove('ride-intro-project--passing')}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
              event.preventDefault()
              onProject(project)
            }}>
            <span className="ride-intro-project-name">{project.title}<span aria-hidden="true">↗</span></span>
            <span className="ride-intro-project-description">{project.slug === 'engine-monitoring-system' ? 'HMI for live telemetry and controls' : 'Tools for everyday PDF tasks'}</span>
          </a>)}
        </div>
      </section>}
    </div>
    <div className="ride-preview-footer" hidden={finishing}>
      {!landing && (
        <button type="button" className="ride-preview-previous" onClick={() => onNavigate(index - 1)}>
          <span className="ride-eyebrow">Previous</span>
          <span>{previous?.title ?? 'The route'}</span>
        </button>
      )}
      {landing ? <>
        <div className="ride-intro-music">{musicControl}</div>
        <ScrollHint className="ride-intro-hint">Scroll at your own pace</ScrollHint>
      </> : <div className="ride-preview-forward">
        <span className="ride-eyebrow">{next ? 'Next stop' : 'The rest of the story'}</span>
        <button type="button" onClick={() => onNavigate(index + 1)}>
          {next?.title ?? 'About & contact'}
        </button>
      </div>}

    </div>
  </div>
)
