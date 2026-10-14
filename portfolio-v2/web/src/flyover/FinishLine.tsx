import type {SiteSettings} from '../lib/types'
import {urlFor} from '../lib/sanity'
import type {ReactNode} from 'react'
import {EmailButton} from '../components/EmailButton'
import './FinishLine.css'

export const FinishLine = ({settings, active, musicControl}: {settings: SiteSettings; active: boolean; musicControl: ReactNode}) => (
  <section className="ride-finish" aria-label="About and contact" aria-hidden={!active} inert={!active}>
    <div className="ride-finish-copy" tabIndex={0}>
      <p className="ride-eyebrow">The end of the ride</p>
      <h1>Thanks for<br />coming along.</h1>
      <div className="ride-finish-person">
        {settings.headshot && <img src={urlFor(settings.headshot).width(160).height(160).fit('crop').url()}
          alt={settings.headshot.alt ?? settings.name} width={64} height={64} />}
        <p>{settings.name}<span>Product engineer &amp; cyclist</span></p>
      </div>
      <p>What do you get from Kris Lemieux? You get somebody who is authentically themself, extremely passionate, and pretty frank, someone who challenges assumptions even when it’s not the popular thing to do.</p>
      <p>I’m an engineer, a product manager, and a highly collaborative person who thrives with a little chaos and the freedom and scope to play. I perform best working closely with equally passionate people, all aligned on one goal.</p>
      <div className="ride-finish-links">
        <EmailButton email={settings.email} />
        {settings.linkedInLink && <a href={settings.linkedInLink} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
        {settings.gitHubLink && <a href={settings.gitHubLink} target="_blank" rel="noreferrer">GitHub ↗</a>}
      </div>
    </div>
    <div className="ride-finish-music">{musicControl}</div>
  </section>
)
