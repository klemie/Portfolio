import type {SiteSettings} from '../lib/types'

export const Contact = ({settings}: {settings: SiteSettings}) => (
  <section className="section" id="contact">
    <h2>Contact</h2>
    <ul className="links">
      <li>
        <a href={`mailto:${settings.email}`}>Email</a>
      </li>
      {settings.gitHubLink && (
        <li>
          <a href={settings.gitHubLink} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </li>
      )}
      {settings.linkedInLink && (
        <li>
          <a href={settings.linkedInLink} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </li>
      )}
      {settings.websiteLink && (
        <li>
          <a href={settings.websiteLink} target="_blank" rel="noreferrer">
            Website
          </a>
        </li>
      )}
      {settings.resumeUrl && (
        <li>
          <a href={settings.resumeUrl} target="_blank" rel="noreferrer">
            Resume
          </a>
        </li>
      )}
    </ul>
  </section>
)
