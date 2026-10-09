import {useMediaQuery} from './useMediaQuery'

/**
 * Tracks the OS-level `prefers-reduced-motion` request.
 *
 * The ride is served to everyone — there is no fallback page any more — so this
 * is no longer a gate deciding *whether* the map renders. It only decides
 * whether the camera is scrubbed continuously or cuts from stop to stop; see
 * `RideOptions.reducedMotion` in flyover/camera.ts.
 */
export const usePrefersReducedMotion = (): boolean =>
  useMediaQuery('(prefers-reduced-motion: reduce)')
