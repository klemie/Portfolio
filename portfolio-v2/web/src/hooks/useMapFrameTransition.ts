import {useLayoutEffect, type RefObject} from 'react'

export interface MapFrameBounds {left: number; top: number; width: number; height: number}

export const captureMapFrame = (): MapFrameBounds | null => {
  const frame = document.querySelector<HTMLElement>('.ride-sticky')
  const rect = frame?.getBoundingClientRect()
  if (!rect || rect.bottom <= 0 || rect.top >= window.innerHeight) return null
  return {left: rect.left, top: rect.top, width: rect.width, height: rect.height}
}

/** Animate the existing map's bounds, keeping its canvas and labels unscaled. */
export const useMapFrameTransition = (
  frameRef: RefObject<HTMLDivElement | null>,
  fromRef: RefObject<MapFrameBounds | null>,
  screen: string | null,
  reducedMotion: boolean,
) => {
  useLayoutEffect(() => {
    const frame = frameRef.current
    const from = fromRef.current
    fromRef.current = null
    if (!frame || !from || reducedMotion) return
    let animation: Animation | undefined
    let restored = false
    const restore = () => {
      if (restored) return
      restored = true
      delete frame.dataset.frameTransition
      for (const name of ['position', 'inset', 'margin', 'z-index', 'left', 'top', 'width', 'height']) frame.style.removeProperty(name)
    }
    // The parent restores document scroll in its layout effect. Measure after
    // that restoration so the destination is the visible card, not a stale rect.
    const request = requestAnimationFrame(() => {
      const rect = frame.getBoundingClientRect()
      const to = {left: rect.left, top: rect.top, width: rect.width, height: rect.height}
      if (Math.abs(from.width - to.width) + Math.abs(from.height - to.height) < 2) return
      const geometry = (bounds: MapFrameBounds) => ({
        left: `${bounds.left}px`, top: `${bounds.top}px`,
        width: `${bounds.width}px`, height: `${bounds.height}px`,
      })
      frame.dataset.frameTransition = screen ? 'visit' : 'resume'
      Object.assign(frame.style, {position: 'fixed', inset: 'auto', margin: '0', zIndex: '30', ...geometry(to)})
      animation = frame.animate([geometry(from), geometry(to)], {
        duration: screen ? 500 : 350, easing: 'cubic-bezier(.22, 1, .36, 1)',
      })
      void animation.finished.then(restore, restore)
    })
    return () => { cancelAnimationFrame(request); animation?.cancel(); restore() }

  }, [screen, reducedMotion, frameRef, fromRef])
}
