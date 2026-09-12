import {useEffect, useState} from 'react'

/**
 * Subscribes to a media query.
 *
 * Evaluated synchronously on first render rather than in an effect: the ride
 * uses this to pick its layout and its camera behaviour, and deciding those on
 * a second pass means rendering the wrong one first and then snatching it away.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const apply = () => setMatches(media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [query])

  return matches
}
