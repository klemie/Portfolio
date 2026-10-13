import type {SiteSettings} from '../lib/types'
import {urlFor} from '../lib/sanity'
import type {ReactNode} from 'react'
import './FinishLine.css'

export const FinishLine = ({settings, count, active, musicControl}: {settings: SiteSettings; count: number; active: boolean; musicControl: ReactNode}) => (
  <section className="ride-finish" aria-label="About and contact" aria-hidden={!active} inert={!active}>
    <div className="ride-finish-copy">
      <p className="ride-eyebrow">The end of the ride</p>
      <h1>Thanks for<br />coming along.</h1>
      <div className="ride-finish-person">
        {settings.headshot && <img src={urlFor(settings.headshot).width(160).height(160).fit('crop').url()}
          alt={settings.headshot.alt ?? settings.name} width={64} height={64} />}
        <p>{settings.name}<span>Product engineer &amp; cyclist</span></p>
      </div>
      <p>I build human–machine interfaces that make complex systems intuitive and keep people coming back.<span className="ride-finish-bio-detail"> From browser experiences at Shift to telemetry systems for UVic Rocketry.</span></p>
      <p className="ride-finish-note">Based in Victoria. Usually building something or out on a bike.</p>
      <div className="ride-finish-links">
        <a href={`mailto:${settings.email}`}>Say hello ↗</a>
        {settings.linkedInLink && <a href={settings.linkedInLink} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
        {settings.gitHubLink && <a href={settings.gitHubLink} target="_blank" rel="noreferrer">GitHub ↗</a>}
      </div>
    </div>
    <p className="ride-finish-caption">{count} stops. One ride.</p>
    <div className="ride-finish-music">{musicControl}</div>
  </section>
)
