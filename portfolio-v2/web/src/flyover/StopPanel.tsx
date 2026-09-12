import {formatRange} from '../lib/formatDate'
import type {Stop} from '../lib/types'
import './StopPanel.css'

interface StopPanelProps {
  stop: Stop
  /** 0 while arriving, 1 once fully settled. Drives the fade-in. */
  dwell: number
}

/**
 * The blurb panel for the current stop.
 *
 * Text only appears once the camera has settled — `dwell` is 0 for the whole
 * travel phase, so nothing is readable while the map is moving. Roles are
 * listed in the order they are stored, which is chronological within a stop.
 */
export const StopPanel = ({stop, dwell}: StopPanelProps) => {
  // Hold until the camera has actually stopped, then fade in over the first
  // third of the dwell.
  const opacity = Math.min(1, Math.max(0, (dwell - 0.08) / 0.28))

  return (
    <div className="ride-panel" style={{opacity}} aria-hidden={opacity < 0.5}>
      <h2>{stop.title}</h2>

      {stop.blurb ? (
        <p className="ride-blurb">{stop.blurb}</p>
      ) : (
        <p className="ride-blurb ride-blurb-empty">
          No blurb written for this stop yet.
        </p>
      )}

      {stop.experiences.length > 0 && (
        <ul className="ride-roles">
          {stop.experiences.map((experience) => (
            <li key={experience._id}>
              <span className="ride-role-title">{experience.position}</span>
              <span className="entry-meta">
                {formatRange(experience.startDate, experience.endDate)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {stop.projects.length > 0 && (
        <p className="entry-meta ride-panel-hint">
          {stop.projects.length} project{stop.projects.length === 1 ? '' : 's'} on the map —
          click a card
        </p>
      )}
    </div>
  )
}
