import {useCallback, useEffect, useRef, useState} from 'react'
import {visitFromPath, visitPath, type VisitTarget} from '../lib/visit'
import {captureMapFrame, type MapFrameBounds} from './useMapFrameTransition'

/** Real detail URLs, normal browser Back, and a separate return to the ride. */
export const useVisitRoute = () => {
  const [target, setTarget] = useState(() => visitFromPath(window.location.pathname))
  const targetRef = useRef(target)
  const rideScrollRef = useRef<number>(window.history.state?.rideScroll ?? 0)
  const savedRideRef = useRef(Boolean(window.history.state?.savedRide))
  const resumeStopRef = useRef<string | null>(null)
  const transitionFromRef = useRef<MapFrameBounds | null>(null)

  useEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    const onPopState = () => {
      const next = visitFromPath(window.location.pathname)
      transitionFromRef.current = captureMapFrame()
      if (next && !targetRef.current) {
        rideScrollRef.current = window.scrollY
        savedRideRef.current = true
      }
      if (typeof window.history.state?.rideScroll === 'number') rideScrollRef.current = window.history.state.rideScroll
      targetRef.current = next
      setTarget(next)
    }
    window.addEventListener('popstate', onPopState)
    return () => {
      window.history.scrollRestoration = previous
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  const openVisit = useCallback((next: VisitTarget) => {
    if (window.location.pathname === visitPath(next)) return
    transitionFromRef.current = captureMapFrame()
    if (!targetRef.current) {
      // Save before shrinking the document, when scrollY still represents the ride.
      rideScrollRef.current = window.scrollY
      savedRideRef.current = true
      window.history.replaceState({...window.history.state, rideScroll: rideScrollRef.current, savedRide: true, rideDepth: 0}, '')
    }
    const depth = Number(window.history.state?.rideDepth ?? 0) + 1
    targetRef.current = next
    window.history.pushState({visit: true, savedRide: savedRideRef.current, rideScroll: rideScrollRef.current, rideDepth: depth}, '', visitPath(next))
    setTarget(next)
  }, [])

  const resumeRide = useCallback((stopId?: string) => {
    transitionFromRef.current = captureMapFrame()
    const depth = Number(window.history.state?.rideDepth ?? 0)
    if (savedRideRef.current && depth > 0) {
      // Resume bypasses nested project pages; browser Back still visits them normally.
      window.history.go(-depth)
    } else {
      resumeStopRef.current = savedRideRef.current ? null : stopId ?? null
      window.history.replaceState(null, '', '/')
      targetRef.current = null
      setTarget(null)
    }
  }, [])

  return {target, openVisit, resumeRide, rideScrollRef, resumeStopRef, transitionFromRef}
}
