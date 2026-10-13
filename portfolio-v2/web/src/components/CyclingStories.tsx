import type {CyclingEntry, Stop} from '../lib/types'
import {formatMonthYear} from '../lib/formatDate'
import {projectUrl} from '../lib/projectMedia'
import {urlFor} from '../lib/sanity'
import './CyclingStories.css'

const CyclingCard = ({entry}: {entry: CyclingEntry}) => {
  const url = projectUrl(entry.url)
  const stats = [
    entry.distanceKm != null ? `${entry.distanceKm.toLocaleString()} km` : null,
    entry.elevationM != null ? `${entry.elevationM.toLocaleString()} m climbing` : null,
  ].filter(Boolean)
  return <article className="cycling-card">
    {entry.image?.asset && <img className="cycling-card-photo" src={urlFor(entry.image).width(1000).auto('format').url()} alt={entry.image.alt ?? ''} loading="lazy" />}
    <div className="cycling-card-body">
      {entry.date && <p className="cycling-card-date"><time dateTime={entry.date}>{formatMonthYear(entry.date)}</time></p>}
      <h3>{entry.title}</h3>
      {entry.result && <p className="cycling-card-result">{entry.result}</p>}
      {stats.length > 0 && <p className="cycling-card-stats">{stats.join(' · ')}</p>}
      {entry.description && <p className="cycling-card-story">{entry.description}</p>}
      {url && <a className="cycling-card-link" href={url} target="_blank" rel="noopener noreferrer">{new URL(url).hostname === 'www.strava.com' || new URL(url).hostname === 'strava.com' ? 'View ride on Strava' : 'View ride'} ↗</a>}
    </div>
  </article>
}

export const CyclingStories = ({cycling}: {cycling: NonNullable<Stop['cycling']>}) => (
  <div className="cycling-stories">
    {[
      {title: 'Races', id: 'cycling-races', entries: cycling.races},
      {title: 'Favourite routes in Victoria', id: 'cycling-routes', entries: cycling.routes},
    ].map(({title, id, entries}) => entries?.length ? <section className="cycling-section" aria-labelledby={id} key={id}>
      <h2 id={id}>{title}</h2>
      <div className="cycling-grid">{entries.map((entry) => <CyclingCard entry={entry} key={entry._key} />)}</div>
    </section> : null)}
  </div>
)
