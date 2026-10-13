import {useLayoutEffect, useRef, useState} from 'react'
import type {Project, SanityImage} from '../lib/types'
import {projectMedia, projectPreviewLink} from '../lib/projectMedia'
import {urlFor} from '../lib/sanity'
import './ProjectMediaViewer.css'

const imageSource = (image: SanityImage | string, thumbnail = false) => typeof image === 'string'
  ? image
  : thumbnail ? urlFor(image).width(120).height(80).fit('crop').url() : urlFor(image).width(1600).url()

const demoHosts = ['kris-openpdf-demo.pages.dev', 'kris-ground-support-demo.pages.dev', 'kris-pdp-demo.pages.dev']

export const ProjectMediaViewer = ({project}: {project: Project}) => {
  const [index, setIndex] = useState(0)
  const [active, setActive] = useState(false)
  const [embedFailed, setEmbedFailed] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [previewVideoFailed, setPreviewVideoFailed] = useState(false)
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
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
  const previewVideo = selected.kind === 'embed' ? selected.previewVideo : undefined
  const coverImage = previewVideo?.poster ?? (firstImage?.kind === 'image' ? firstImage.image : undefined)
  const embedHost = selected.kind === 'embed' ? new URL(selected.url).hostname : ''
  const ownedDemo = demoHosts.includes(embedHost)
  const preserveStorage = ownedDemo || ['localhost', '127.0.0.1'].includes(embedHost)
  const choose = (next: number) => {setIndex(next); setActive(false); setVideoFailed(false); setPreviewVideoFailed(false)}

  return (
    <div className="project-media" aria-label={`${project.title} media`}>
      {active && selected.kind === 'embed' && <div className="project-media-toolbar">
        <span>{selected.label}</span>
        <button ref={doneRef} type="button" onClick={() => setActive(false)}>Done interacting</button>
      </div>}
      <div className={`project-media-stage${active && ownedDemo ? ' project-media-stage--demo' : ''}`}>
        {selected.kind === 'image' ? (
          <img className="project-media-image" src={imageSource(selected.image)}
            alt={`${project.title} — ${selected.label}`} loading="lazy" />
        ) : selected.kind === 'video' ? (
          videoFailed ? <div className="project-media-cover" role="alert">
            <strong>Video could not load</strong>
            <p>Open the recording directly to play or download it.</p>
            <a href={selected.url} target="_blank" rel="noreferrer">Open video <span aria-hidden="true">↗</span></a>
          </div> : <video key={selected.url} className="project-media-video" src={selected.url}
            poster={selected.poster ? imageSource(selected.poster) : undefined}
            controls playsInline preload="metadata" aria-label={`${project.title} — ${selected.label}`}
            onError={() => setVideoFailed(true)}>
            <a href={selected.url}>Play or download {selected.label}</a>
          </video>
        ) : active && selected.kind === 'embed' ? (
          <iframe src={selected.url} title={`${project.title} — ${selected.label}`} className="project-media-frame"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
            allow="fullscreen; cross-origin-isolated" {...(!preserveStorage ? {credentialless: ''} : {})} referrerPolicy="strict-origin-when-cross-origin"
            onError={() => {setEmbedFailed(true); setActive(false); setIndex(0)}} />
        ) : (
          <>
            {previewVideo && !previewVideoFailed ? <video key={`preview-${previewVideo.url}`}
              className="project-media-video project-media-video--preview" src={previewVideo.url}
              poster={previewVideo.poster ? imageSource(previewVideo.poster) : undefined}
              autoPlay={!reducedMotion} muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1}
              onError={() => setPreviewVideoFailed(true)} />
              : coverImage && <img className="project-media-image" src={imageSource(coverImage)} alt="" loading="lazy" />}
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
        {media.map((item, mediaIndex) => {
          const previewPoster = item.kind === 'video' ? item.poster : item.kind === 'embed' || item.kind === 'preview'
            ? (item.kind === 'embed' ? item.previewVideo?.poster : undefined) ?? (firstImage?.kind === 'image' ? firstImage.image : undefined)
            : undefined
          return (
          <button type="button" key={item.kind !== 'image' ? item.url : typeof item.image === 'string' ? item.image : item.image._key ?? `${item.image.asset._ref}-${mediaIndex}`}
            aria-label={item.label} aria-pressed={selectedIndex === mediaIndex} onClick={() => choose(mediaIndex)}>
            {item.kind === 'image' ? <img src={imageSource(item.image, true)} alt="" loading="lazy" />
              : previewPoster ? <span className="project-media-video-thumbnail" aria-hidden="true">
                <img src={imageSource(previewPoster, true)} alt="" loading="lazy" /><span>▷</span>
              </span> : <span className="project-media-embed-icon" aria-hidden="true">▷</span>}
            <span>{item.label}</span>
          </button>
        )})}
      </div>}
    </div>
  )
}
