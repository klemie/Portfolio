import type {SiteSettings, Stop} from '../lib/types'
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
  onNavigate: (index: number) => void
}

export const RidePreview = ({settings, stop, previous, next, index, count, landing, settled, onNavigate}: RidePreviewProps) => (
  <div className={`ride-preview${landing ? ' ride-preview--intro' : ''}`}>
    <div className="ride-preview-top">
      <button type="button" className="ride-wordmark" onClick={() => onNavigate(-1)}>{settings.name}</button>
      <span className="ride-preview-count">{landing ? 'Victoria, BC' : `${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`}</span>
    </div>

    <div className="ride-preview-title" aria-live="polite">
      <p className="ride-eyebrow">{landing ? 'A gravel cyclist. A product engineer.' : settled ? 'You’ve arrived' : 'On the way to'}</p>
      <h1>{landing ? 'Come along for the ride.' : stop?.title}</h1>
      {landing && <p className="ride-intro-description">From gravel roads to the things I build, a few stops along the way.</p>}
    </div>
    <div className="ride-preview-footer">
      <div className="ride-preview-forward">
        <span className="ride-eyebrow">{landing ? 'Your ride starts here' : next ? 'Next stop' : 'The rest of the story'}</span>
        <button type="button" onClick={() => onNavigate(landing ? 0 : index + 1)}>
          {landing ? 'Scroll to start riding' : next?.title ?? 'About & contact'} <span aria-hidden="true">↓</span>
        </button>
      </div>
      {!landing && (
        <button type="button" className="ride-preview-previous" onClick={() => onNavigate(index - 1)}>
          <span className="ride-eyebrow">Previous <span aria-hidden="true">↖</span></span>
          <span>{previous?.title ?? 'The route'}</span>
        </button>
      )}
    </div>
  </div>
)
