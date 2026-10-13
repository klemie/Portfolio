import {useCallback, useEffect, useRef, useState} from 'react'

const backgroundVolume = 0.05
const videoVolume = 0.01

/** One audio element survives route changes; a visitor's pause always wins. */
export const useSoundtrack = () => {
  const ref = useRef<HTMLAudioElement>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const graphRef = useRef<{context: AudioContext; source: MediaElementAudioSourceNode | null} | null>(null)
  const preference = useRef<'auto' | 'play' | 'pause'>('auto')
  const [playing, setPlaying] = useState(false)
  const prepareAudio = useCallback(() => {
    const audio = ref.current
    if (!audio || !window.AudioContext) return
    try {
      const graph = graphRef.current ?? {context: new AudioContext(), source: null}
      graphRef.current = graph
      const connect = () => {
        if (graph.source || graphRef.current !== graph || ref.current !== audio || graph.context.state !== 'running') return
        const analyser = graph.context.createAnalyser()
        analyser.fftSize = 2048
        analyser.smoothingTimeConstant = 0.65
        graph.source = graph.context.createMediaElementSource(audio)
        graph.source.connect(analyser)
        analyser.connect(graph.context.destination)
        analyserRef.current = analyser
      }
      // Keep the element's normal output until Web Audio can actually run.
      if (graph.context.state === 'running') connect()
      else void graph.context.resume().then(connect).catch(() => {})
    } catch { /* The ordinary audio control still works without analysis. */ }
  }, [])
  const play = useCallback(() => {
    prepareAudio()
    const audio = ref.current
    if (audio && audio.paused) void audio.play().catch(() => {
      if (audio.paused) setPlaying(false)
    })
  }, [prepareAudio])
  const start = useCallback(() => {
    if (preference.current !== 'pause') play()
  }, [play])
  const toggle = useCallback(() => {
    const audio = ref.current
    if (!audio) return
    if (audio.paused) {
      preference.current = 'play'
      play()
    } else {
      preference.current = 'pause'
      audio.pause()
    }
  }, [play])

  const attach = useCallback((audio: HTMLAudioElement | null) => {
    ref.current = audio
    if (!audio) {
      // React may detach and reattach the same ref within one render.
      queueMicrotask(() => {
        if (ref.current) return
        const graph = graphRef.current
        graphRef.current = null
        analyserRef.current = null
        graph?.source?.disconnect()
        if (graph) void graph.context.close().catch(() => {})
      })
      return
    }
    audio.volume = backgroundVolume
    start()
  }, [start])

  useEffect(() => {
    if (playing || preference.current === 'pause') return
    // Try every kind of first interaction. Movement and scrolling may still
    // be blocked, so keep listening for a browser-approved click/tap/key.
    const gestures = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']
    const movement = ['pointermove', 'touchmove', 'wheel', 'scroll']
    const interactions = [...gestures, ...movement]
    const onInteraction = (event: Event) => {
      if (!event.isTrusted) return
      if (event.target instanceof Element && event.target.closest('.music-control')) return
      start()
    }
    gestures.forEach((event) => document.addEventListener(event, onInteraction, {passive: true}))
    // One attempt per movement type avoids repeatedly requesting audio on
    // every animation frame while the browser requires a stronger gesture.
    movement.forEach((event) => document.addEventListener(event, onInteraction, {passive: true, once: true}))
    return () => {
      interactions.forEach((event) => document.removeEventListener(event, onInteraction))
    }
  }, [start, playing])

  useEffect(() => {
    const updateVolume = () => {
      const videoPlaying = Array.from(document.querySelectorAll('video')).some((video) => !video.paused && !video.ended && !video.muted)
      if (ref.current) ref.current.volume = videoPlaying ? videoVolume : backgroundVolume
    }
    updateVolume()
    const events = ['play', 'pause', 'ended', 'volumechange']
    const onMediaChange = (event: Event) => {
      if (event.target instanceof HTMLVideoElement) updateVolume()
    }
    events.forEach((event) => document.addEventListener(event, onMediaChange, true))
    const observer = new MutationObserver(updateVolume)
    observer.observe(document.body, {childList: true, subtree: true})
    return () => {
      events.forEach((event) => document.removeEventListener(event, onMediaChange, true))
      observer.disconnect()
    }
  }, [])

  return {ref: attach, analyserRef, playing, start, toggle, onPlay: () => setPlaying(true), onPause: () => setPlaying(false)}
}
