import {useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, type Ref, type RefObject} from 'react'
import type {Map as MapLibreMap} from 'maplibre-gl'
import type {Route} from '../lib/route'
import type {Project} from '../lib/types'
import {visitPath} from '../lib/visit'
import {landingTransitionFor, projectsOpacityFor} from './landingTransition'
import './LivingRoute.css'

type Point = {x: number; y: number}
export interface LivingRouteHandle {
  update: (progress: number, map: MapLibreMap) => void
}

const mercator = (lon: number, lat: number): Point => ({
  x: lon * Math.PI / 180,
  y: -Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)),
})
const pathFor = (points: Point[]) => points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')

/** The hero and the map share GPX vertices, so every point can land in place. */
export const LivingRoute = ({route, frameRef, reducedMotion, projectCues, highlightedProject, onHighlightProject, onProject, ref}: {
  route: Route
  frameRef: RefObject<HTMLDivElement | null>
  reducedMotion: boolean
  projectCues: {project: Project; alongTrack: number}[]
  highlightedProject: string | null
  onHighlightProject: (slug: string | null) => void
  onProject: (project: Project) => void
  ref: Ref<LivingRouteHandle>
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const lineRef = useRef<SVGPathElement>(null)
  const traceRef = useRef<SVGPathElement>(null)
  const riderRef = useRef<SVGCircleElement>(null)
  const projectMarkersRef = useRef<SVGGElement>(null)
  const titleId = useId()
  const playback = useRef({progress: 0, elapsed: 0, map: null as MapLibreMap | null})
  const projectPasses = useRef({cycle: -1, played: new Set<string>()})
  const plottedRef = useRef<Point[]>([])
  const currentRef = useRef<Point[]>([])
  const projectSegments = useMemo(() => projectCues.map((cue) => {
    let index = 0
    while (index < route.cumulative.length - 2 && route.cumulative[index + 1] <= cue.alongTrack) index++
    const length = route.cumulative[index + 1] - route.cumulative[index]
    return {...cue, index, fraction: length ? (cue.alongTrack - route.cumulative[index]) / length : 0}
  }), [projectCues, route])
  const drawing = useMemo(() => {
    if (route.coordinates.length < 2) return null
    const points = route.coordinates.map(([lon, lat]) => mercator(lon, lat))
    const bounds = points.reduce((bounds, point) => ({
      left: Math.min(bounds.left, point.x), right: Math.max(bounds.right, point.x),
      top: Math.min(bounds.top, point.y), bottom: Math.max(bounds.bottom, point.y),
    }), {left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity})
    const scale = 320 / Math.max(bounds.right - bounds.left, bounds.bottom - bounds.top, Number.EPSILON)
    const projected = points.map((point) => ({
      x: 16 + (point.x - bounds.left) * scale,
      y: 16 + (point.y - bounds.top) * scale,
    }))
    const cumulative = [0]
    for (let index = 1; index < projected.length; index++) {
      cumulative.push(cumulative[index - 1] + Math.hypot(projected[index].x - projected[index - 1].x, projected[index].y - projected[index - 1].y))
    }
    return {
      width: (bounds.right - bounds.left) * scale + 32,
      height: (bounds.bottom - bounds.top) * scale + 32,
      points: projected, cumulative,
    }
  }, [route])

  const drawTrace = useCallback((points: Point[]) => {
    const trace = traceRef.current
    const rider = riderRef.current
    if (!drawing || !trace || !rider || points.length !== drawing.points.length) return
    const cycle = playback.current.elapsed % 34000
    const distance = drawing.cumulative[drawing.cumulative.length - 1] * Math.min(1, cycle / 30000)
    const loopOpacity = cycle > 32000 ? (34000 - cycle) / 2000 : Math.min(1, cycle / 1000)
    let index = 0
    let end = points.length - 1
    while (index < end - 1) {
      const middle = (index + end) >> 1
      if (drawing.cumulative[middle] <= distance) index = middle
      else end = middle
    }
    const from = points[index]
    const to = points[index + 1]
    const segmentLength = drawing.cumulative[index + 1] - drawing.cumulative[index]
    const fraction = segmentLength ? (distance - drawing.cumulative[index]) / segmentLength : 0
    const point = {x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction}
    // The trace and dot always share one endpoint, including during the morph.
    trace.setAttribute('d', `${pathFor(points.slice(0, index + 1))} L ${point.x} ${point.y}`)
    // The parent SVG owns the intro fade, so the trace and dot fade once with it.
    trace.style.opacity = String(loopOpacity)
    rider.setAttribute('cx', String(point.x))
    rider.setAttribute('cy', String(point.y))
    rider.style.opacity = String(loopOpacity)
    if (!reducedMotion && playback.current.progress === 0) {
      const loop = Math.floor(playback.current.elapsed / 34000)
      const cards = frameRef.current?.querySelectorAll<HTMLAnchorElement>('.ride-intro-project-links a[data-project-slug]')
      if (projectPasses.current.cycle !== loop) {
        projectPasses.current = {cycle: loop, played: new Set()}
        cards?.forEach((card) => card.classList.remove('ride-intro-project--passing'))
      }
      // Use the dot's exact segment and fraction, not a separate timer. This
      // also matches waypoints when projected and geographic lengths differ.
      const alongTrack = route.cumulative[index] + (route.cumulative[index + 1] - route.cumulative[index]) * fraction
      for (const cue of projectCues) {
        if (alongTrack < cue.alongTrack || projectPasses.current.played.has(cue.project.slug)) continue
        const card = cards && [...cards].find((card) => card.dataset.projectSlug === cue.project.slug)
        if (card) {
          card.classList.add('ride-intro-project--passing')
          projectPasses.current.played.add(cue.project.slug)
        }
      }
    }
  }, [drawing, frameRef, projectCues, reducedMotion, route])

  const updateProjectMarkers = useCallback((points: Point[], opacity: number, visible: boolean) => {
    const group = projectMarkersRef.current
    if (!group) return
    group.style.opacity = String(opacity)
    group.setAttribute('aria-hidden', String(!visible))
    const markers = group.querySelectorAll<SVGAElement>('.living-route-project')
    markers.forEach((marker, i) => {
      const segment = projectSegments[i]
      const from = points[segment.index]
      const to = points[segment.index + 1]
      if (from && to) marker.setAttribute('transform', `translate(${from.x + (to.x - from.x) * segment.fraction} ${from.y + (to.y - from.y) * segment.fraction})`)
      marker.setAttribute('tabindex', visible ? '0' : '-1')
      marker.style.pointerEvents = visible ? 'all' : 'none'
      if (!visible && document.activeElement === marker) marker.blur()
    })
  }, [projectSegments])

  const draw = useCallback((progress: number, map: MapLibreMap | null) => {
    const svg = svgRef.current
    const frame = frameRef.current
    if (!drawing || !svg || !frame) return
    frame.style.setProperty('--project-shimmer-state', progress === 0 && !document.hidden ? 'running' : 'paused')
    const transition = landingTransitionFor(progress)
    const projects = frame.querySelector<HTMLElement>('.ride-intro-projects')
    if (transition.routeOpacity === 0) {
      if (projects) {
        projects.style.setProperty('--intro-projects-opacity', '0')
        projects.inert = true
      }
      svg.style.opacity = '0'
      svg.setAttribute('aria-hidden', 'true')
      updateProjectMarkers([], 0, false)
      return
    }
    const bounds = frame.getBoundingClientRect()
    const slot = frame.querySelector('.living-route-slot')?.getBoundingClientRect()
    if (slot) {
      // Match SVG's original aspect-preserving fit in the hero's layout slot.
      const scale = Math.min(slot.width / drawing.width, slot.height / drawing.height)
      const left = slot.left - bounds.left + (slot.width - drawing.width * scale) / 2
      const top = slot.top - bounds.top + (slot.height - drawing.height * scale) / 2
      plottedRef.current = drawing.points.map((point) => ({x: left + point.x * scale, y: top + point.y * scale}))
    }
    const morph = reducedMotion ? 0 : transition.routeMorph
    const points = plottedRef.current.map((point, index) => {
      if (!map || morph === 0) return point
      const target = map.project(route.coordinates[index])
      return {x: point.x + (target.x - point.x) * morph, y: point.y + (target.y - point.y) * morph}
    })
    let projectsOpacity = 1
    if (projects) {
      const rect = projects.getBoundingClientRect()
      const opacity = reducedMotion || progress === 0 ? 1 : projectsOpacityFor(points, {
        left: rect.left - bounds.left, right: rect.right - bounds.left, top: rect.top - bounds.top,
      })
      projects.style.setProperty('--intro-projects-opacity', String(opacity))
      projects.inert = opacity * transition.copyOpacity < 0.1
      projectsOpacity = opacity
    }
    updateProjectMarkers(points, projectsOpacity, projectsOpacity * transition.copyOpacity >= 0.1)
    currentRef.current = points
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`)
    svg.style.opacity = String(reducedMotion ? 1 - transition.mapReveal : transition.routeOpacity)
    svg.setAttribute('aria-hidden', String(transition.routeOpacity === 0))
    lineRef.current?.setAttribute('d', pathFor(points))
    drawTrace(points)
  }, [drawing, drawTrace, frameRef, reducedMotion, route, updateProjectMarkers])

  useImperativeHandle(ref, () => ({update: (progress, map) => {
    playback.current.progress = progress
    playback.current.map = map
    draw(progress, map)
  }}), [draw])

  // The hero layout slot remounts when scrolling back from the ride. Re-read
  // it after that render, including if the viewport changed along the way.
  useLayoutEffect(() => { draw(playback.current.progress, playback.current.map) })

  useEffect(() => {
    draw(playback.current.progress, playback.current.map)
    if (reducedMotion) return
    let frame = 0
    let last = 0
    const animate = (now: number) => {
      if (playback.current.progress === 0) {
        playback.current.elapsed += last ? Math.min(now - last, 100) : 0
        last = now
        drawTrace(currentRef.current)
      } else {
        // Scrolling freezes time; returning to the top resumes this same cycle.
        last = 0
      }
      frame = requestAnimationFrame(animate)
    }
    const updateVisibility = () => {
      cancelAnimationFrame(frame)
      last = 0
      frameRef.current?.style.setProperty('--project-shimmer-state', document.hidden || playback.current.progress !== 0 ? 'paused' : 'running')
      if (!document.hidden) frame = requestAnimationFrame(animate)
    }
    updateVisibility()
    document.addEventListener('visibilitychange', updateVisibility)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [draw, drawTrace, frameRef, reducedMotion])

  if (!drawing) return null
  return (
    <svg ref={svgRef} className="living-route-overlay" role="group" aria-labelledby={titleId}>
      <title id={titleId}>The ride through Victoria, traced from the GPX route</title>
      <path ref={lineRef} className="living-route-line" />
      <path ref={traceRef} className="living-route-trace" />
      <circle ref={riderRef} className="living-route-rider" r="4.5" />
      <g ref={projectMarkersRef} className="living-route-project-markers">
        {projectSegments.map(({project}) => <a key={project._id}
          href={visitPath({kind: 'projects', id: project.slug})} aria-label={`View ${project.title}`}
          data-project-slug={project.slug}
          className="living-route-project" data-highlighted={highlightedProject === project.slug}
          onMouseEnter={() => onHighlightProject(project.slug)} onMouseLeave={() => onHighlightProject(null)}
          onFocus={() => onHighlightProject(project.slug)} onBlur={() => onHighlightProject(null)}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            event.preventDefault()
            onProject(project)
          }}>
          <circle className="living-route-project-hit" r="22" />
          <circle className="living-route-project-halo" r="11" />
          <circle className="living-route-project-dot" r="5" />
        </a>)}
      </g>
    </svg>
  )
}
