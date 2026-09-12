import {urlFor} from '../lib/sanity'
import type {SiteSettings} from '../lib/types'

export const Hero = ({settings}: {settings: SiteSettings}) => (
  <header>
    {settings.headshot && (
      <img
        src={urlFor(settings.headshot).width(240).height(240).fit('crop').url()}
        alt={settings.headshot.alt ?? settings.name}
        width={240}
        height={240}
      />
    )}
    <h1>{settings.name}</h1>
    <p>{settings.tagline}</p>
    <p>{settings.bio}</p>
  </header>
)
