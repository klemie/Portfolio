import type {Visit} from '../lib/visit'
import './VisitHero.css'

export const VisitHero = ({visit, stopIndex, stopCount}: {
  visit: Visit; stopIndex: number; stopCount: number
}) => (
  <div className="visit-hero-heading">
    <p>{stopIndex >= 0 ? `Stop ${String(stopIndex + 1).padStart(2, '0')} / ${String(stopCount).padStart(2, '0')}` : visit.subtitle}</p>
    <h1 tabIndex={-1} data-visit-heading>{visit.title}</h1>
  </div>
)
