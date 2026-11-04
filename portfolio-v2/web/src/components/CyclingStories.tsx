import type {CyclingEntry, Stop} from '../lib/types'
import {formatMonthYear} from '../lib/formatDate'
import {projectUrl} from '../lib/projectMedia'
import {urlFor} from '../lib/sanity'
import './CyclingStories.css'

const RaceGallery = ({entry}: {entry: CyclingEntry}) => {
  const media = (entry.gallery ?? []).filter((item) => item._type === 'image' ? item.asset?._ref : projectUrl(item.url))
  if (!media.length && entry.image?.asset?._ref) media.push({...entry.image, _type: 'image', _key: 'legacy-photo'})
  if (!media.length) return null

  return <div className="race-gallery" role="region" tabIndex={0} aria-label={`${entry.title} photos and videos — scroll horizontally`}>
    {media.map((item, index) => <div className="race-gallery-tile" key={item._key}>
      {item._type === 'image'
        ? <a href={urlFor(item).width(2400).auto('format').url()} target="_blank" rel="noopener noreferrer" aria-label={`Open ${entry.title} photo ${index + 1} full size`}>
          <img src={urlFor(item).width(1000).auto('format').url()} alt={item.alt || `${entry.title} photo ${index + 1}`} loading="lazy" />
        </a>
        : <video controls playsInline preload="metadata" aria-label={item.title}
          src={projectUrl(item.url)!} poster={item.poster?.asset ? urlFor(item.poster).width(1000).auto('format').url() : undefined}>
          Your browser cannot play this video. <a href={projectUrl(item.url)!}>Open video</a>
        </video>}
    </div>)}
  </div>
}

const RaceCard = ({entry}: {entry: CyclingEntry}) => {
  const url = projectUrl(entry.url)
  return <article className="cycling-card race-card">
    <div className="race-card-heading">
      <h3>{entry.title}</h3>
      {entry.result && <p className="cycling-card-result">{entry.result}</p>}
    </div>
    <RaceGallery entry={entry} />
    {url && <a className="cycling-card-link race-card-link" href={url} target="_blank" rel="noopener noreferrer">View race on Strava ↗</a>}
  </article>
}

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
      <div className={id === 'cycling-races' ? 'race-gallery-list' : 'cycling-grid'}>{entries.map((entry) => id === 'cycling-races'
        ? <RaceCard entry={entry} key={entry._key} />
        : <CyclingCard entry={entry} key={entry._key} />)}</div>
    </section> : null)}
  </div>
)
