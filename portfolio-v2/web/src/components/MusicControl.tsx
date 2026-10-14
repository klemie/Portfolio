import {useEffect, useRef, type RefObject} from 'react'
import {usePrefersReducedMotion} from '../hooks/usePrefersReducedMotion'
import './MusicControl.css'

const frequencyBands = [40, 120, 250, 500, 1000, 2500]
// Fixed ceilings measured from this track at 5% volume, with 5 dB of peak headroom.
const bandCeilings = [-59, -56, -59, -62, -77]
const displayRange = 32

export const MusicControl = ({playing, onToggle, analyserRef, compact = false}: {
  playing: boolean; onToggle: () => void; analyserRef: RefObject<AnalyserNode | null>; compact?: boolean
}) => {
  const waveRef = useRef<SVGSVGElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  useEffect(() => {
    const bars = Array.from(waveRef.current?.querySelectorAll('rect') ?? [])
    bars.forEach((bar) => bar.style.removeProperty('transform'))
    if (!playing || reducedMotion) return
    let frame = 0
    let last = 0
    let data = new Float32Array(0)
    const draw = (now: number) => {
      const analyser = analyserRef.current
      if (analyser && now - last >= 1000 / 30) {
        if (data.length !== analyser.frequencyBinCount) data = new Float32Array(analyser.frequencyBinCount)
        analyser.getFloatFrequencyData(data)
        const binHz = analyser.context.sampleRate / analyser.fftSize
        bars.forEach((bar, index) => {
          const from = Math.min(data.length - 1, Math.floor(frequencyBands[index] / binHz))
          const to = Math.min(data.length, Math.max(from + 1, Math.ceil(frequencyBands[index + 1] / binHz)))
          let power = 0
          for (let bin = from; bin < to; bin++) power += 10 ** (data[bin] / 10)
          const decibels = 10 * Math.log10(power / (to - from))
          const level = Math.max(0, Math.min(1, (decibels - bandCeilings[index] + displayRange) / displayRange))
          const scale = 0.15 + 0.85 * level ** 1.3
          bar.style.transform = `scaleY(${scale})`
        })
        last = now
      }
      frame = requestAnimationFrame(draw)
    }
    const updateVisibility = () => {
      cancelAnimationFrame(frame)
      if (!document.hidden) frame = requestAnimationFrame(draw)
    }
    updateVisibility()
    document.addEventListener('visibilitychange', updateVisibility)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [playing, reducedMotion, analyserRef])

  return (
  <button type="button" className={`music-control${compact ? ' music-control--compact' : ''}`}
    onClick={onToggle} aria-label={`${playing ? 'Pause' : 'Play'} background music: 20191229 by Mac DeMarco`}
    title={compact ? undefined : `${playing ? 'Pause' : 'Play'} 20191229 — Mac DeMarco`}>
    <svg ref={waveRef} className={`music-wave${playing ? ' music-wave--playing' : ''}`} viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path className="music-play" d="M5 3 16 10 5 17Z" />
      {[1, 5, 9, 13, 17].map((x) => <rect key={x} x={x} y="2" width="2" height="16" rx="1" />)}
    </svg>
    {!compact && <span>20191229 · Mac DeMarco</span>}
    {compact && <span className="music-control-tooltip" role="tooltip">{playing ? 'Pause' : 'Play'} · 20191229 · Mac DeMarco</span>}
  </button>
  )
}
