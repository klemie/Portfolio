import type {ReactNode} from 'react'
import {ScrollHint} from './ScrollHint'
import './FloatingNavigation.css'

export const FloatingNavigation = ({onVisit, visitDisabled, visitLabel, visitReady, scrollHint, resumeUrl, themeControl, musicControl}: {
  themeControl: ReactNode
  musicControl?: ReactNode
  onVisit: () => void
  visitDisabled: boolean
  visitReady: boolean
  scrollHint?: string
  visitLabel: string; resumeUrl?: string | null
}) => (
  <nav className="floating-navigation" aria-label="Route navigation">
    {scrollHint && <ScrollHint id="ride-scroll-hint" className="nav-scroll-hint">{scrollHint}</ScrollHint>}
    <button type="button" className={`nav-visit${visitReady ? ' nav-visit--ready' : ''}`} onClick={onVisit} disabled={visitDisabled} aria-describedby={scrollHint ? 'ride-scroll-hint' : undefined}>{visitLabel}<span aria-hidden="true">{visitLabel === 'Start the ride' ? '↓' : visitLabel === 'Ride again' ? '↺' : '→'}</span></button>
    {resumeUrl && <a href={resumeUrl} target="_blank" rel="noreferrer" aria-label="Résumé PDF (opens in a new tab)">Résumé <span aria-hidden="true">↗</span></a>}
    {musicControl}
    {themeControl}
  </nav>
)
