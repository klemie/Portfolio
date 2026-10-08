import type {ReactNode} from 'react'
import './FloatingNavigation.css'

export const FloatingNavigation = ({onVisit, visitDisabled, visitLabel, resumeUrl, themeControl}: {
  themeControl: ReactNode
  onVisit: () => void
  visitDisabled: boolean
  visitLabel: string; resumeUrl?: string | null
}) => (
  <nav className="floating-navigation" aria-label="Route navigation">
    <button type="button" className="nav-visit" onClick={onVisit} disabled={visitDisabled}>{visitLabel}<span aria-hidden="true">↗</span></button>
    {resumeUrl && <a href={resumeUrl} target="_blank" rel="noreferrer" aria-label="Résumé PDF (opens in a new tab)">Résumé <span aria-hidden="true">↗</span></a>}
    {themeControl}
  </nav>
)
