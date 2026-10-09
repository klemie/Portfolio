import {useLayoutEffect, useRef, useState} from 'react'
import type {Project, SanityImage} from '../lib/types'
import {projectMedia, projectPreviewLink} from '../lib/projectMedia'
import {urlFor} from '../lib/sanity'
import './ProjectMediaViewer.css'

const imageSource = (image: SanityImage | string, thumbnail = false) => typeof image === 'string'
  ? image
  : thumbnail ? urlFor(image).width(120).height(80).fit('crop').url() : urlFor(image).width(1600).url()

export const ProjectMediaViewer = ({project}: {project: Project}) => {
  const [index, setIndex] = useState(0)
  const [active, setActive] = useState(false)
  const [embedFailed, setEmbedFailed] = useState(false)
  const activateRef = useRef<HTMLButtonElement>(null)
  const doneRef = useRef<HTMLButtonElement>(null)
  const previousActive = useRef(false)
  const media = projectMedia(project).filter((item) => !embedFailed || item.kind !== 'embed')
  const selectedIndex = Math.min(index, media.length - 1)
  const selected = media[selectedIndex]
  const firstImage = media.find((item) => item.kind === 'image')

  useLayoutEffect(() => {
    if (active !== previousActive.current) {
      ;(active ? doneRef : activateRef).current?.focus({preventScroll: true})
      previousActive.current = active
    }
  }, [active])

  if (!selected) return null
  const choose = (next: number) => {setIndex(next); setActive(false)}

  return (
    <div className="project-media" aria-label={`${project.title} media`}>
      {active && selected.kind === 'embed' && <div className="project-media-toolbar">
        <span>{selected.label}</span>
        <button ref={doneRef} type="button" onClick={() => setActive(false)}>Done interacting</button>
      </div>}
      <div className="project-media-stage">
        {selected.kind === 'image' ? (
          <img className="project-media-image" src={imageSource(selected.image)}
            alt={`${project.title} — ${selected.label}`} loading="lazy" />
        ) : active && selected.kind === 'embed' ? (
          <iframe src={selected.url} title={`${project.title} — ${selected.label}`} className="project-media-frame"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            allow="fullscreen" referrerPolicy="strict-origin-when-cross-origin"
            onError={() => {setEmbedFailed(true); setActive(false); setIndex(0)}} />
        ) : (
          <>
            {firstImage?.kind === 'image' && <img className="project-media-image" src={imageSource(firstImage.image)} alt="" loading="lazy" />}
            <div className="project-media-cover">
              <strong>{selected.label}</strong>
              <p>{selected.kind === 'preview' ? 'Explore the live app in a new tab' : 'Explore without leaving this experience'}</p>
              {selected.kind === 'preview' ? <a href={selected.url} target="_blank" rel="noreferrer">Open app <span aria-hidden="true">↗</span></a> : <button ref={activateRef} type="button" onClick={() => setActive(true)}>{project.hasDemo ? 'Try demo' : 'Explore project'} <span aria-hidden="true">▷</span></button>}
            </div>
          </>
        )}
      </div>
      <div className="project-media-footer">
        <p className="project-media-caption" aria-live="polite">{selected.label}</p>
        {media.length > 1 && <div className="project-media-navigation">
          <button type="button" aria-label="Previous media" disabled={selectedIndex === 0} onClick={() => choose(selectedIndex - 1)}><span aria-hidden="true">‹</span></button>
          <span aria-live="polite">{selectedIndex + 1} / {media.length}</span>
          <button type="button" aria-label="Next media" disabled={selectedIndex === media.length - 1} onClick={() => choose(selectedIndex + 1)}><span aria-hidden="true">›</span></button>
        </div>}
      </div>
      {active && selected.kind === 'embed' && <div className="project-media-alternatives">
        <a href={projectPreviewLink(selected.url)} target="_blank" rel="noreferrer">Open in a new tab <span aria-hidden="true">↗</span></a>
        {firstImage && <button type="button" onClick={() => choose(media.findIndex((item) => item.kind === 'image'))}>Show photos</button>}
      </div>}
      {media.length > 1 && <div className="project-media-thumbnails" role="group" aria-label="Choose media">
        {media.map((item, mediaIndex) => (
          <button type="button" key={item.kind !== 'image' ? item.url : typeof item.image === 'string' ? item.image : item.image._key ?? `${item.image.asset._ref}-${mediaIndex}`}
            aria-label={item.label} aria-pressed={selectedIndex === mediaIndex} onClick={() => choose(mediaIndex)}>
            {item.kind === 'image' ? <img src={imageSource(item.image, true)} alt="" loading="lazy" /> : <span className="project-media-embed-icon" aria-hidden="true">▷</span>}
            <span>{item.label}</span>
          </button>
        ))}
      </div>}
    </div>
  )
}
