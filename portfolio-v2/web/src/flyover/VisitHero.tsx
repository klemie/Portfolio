import type {ReactNode} from 'react'
import type {Visit} from '../lib/visit'
import './VisitHero.css'

export const VisitHero = ({visit, stopIndex, stopCount, onResume, themeControl}: {
  visit: Visit; stopIndex: number; stopCount: number; onResume: () => void; themeControl: ReactNode
}) => (
  <header className="visit-hero">
    <nav className="visit-navigation" aria-label="Story navigation">
      <button type="button" className="visit-resume" onClick={onResume}>← Resume ride</button>
      {themeControl}
    </nav>
    <div className="visit-hero-heading">
      <p>{stopIndex >= 0 ? `Stop ${String(stopIndex + 1).padStart(2, '0')} / ${String(stopCount).padStart(2, '0')} · ` : ''}{visit.subtitle}</p>
      <h1 tabIndex={-1} data-visit-heading>{visit.title}</h1>
      <ul className="visit-labels" aria-label="Skills and disciplines">
        {[...new Set(visit.labels)].map((label) => <li key={label}>{label}</li>)}
      </ul>
    </div>
  </header>
)
