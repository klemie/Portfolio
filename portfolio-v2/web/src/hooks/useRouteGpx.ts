import {useEffect, useState} from 'react'

/**
 * Loads the GPX route text.
 *
 * Prefers the file uploaded in the Studio so the route can be changed without
 * a deploy; falls back to the copy committed in /public when there is none or
 * it cannot be fetched. A malformed upload therefore never takes the ride
 * down — spec §3.
 */
const FALLBACK = '/flyover-route.gpx'

interface RouteGpxState {
  gpx: string | null
  loading: boolean
  /** True when the committed default was used instead of the uploaded route. */
  usedFallback: boolean
}

const looksLikeGpx = (text: string) => text.includes('<trkpt') || text.includes('<rtept')

export const useRouteGpx = (uploadedUrl?: string | null): RouteGpxState => {
  const [state, setState] = useState<RouteGpxState>({
    gpx: null,
    loading: true,
    usedFallback: false,
  })

  useEffect(() => {
    let active = true

    const load = async () => {
      if (uploadedUrl) {
        try {
          const response = await fetch(uploadedUrl)
          if (response.ok) {
            const text = await response.text()
            if (looksLikeGpx(text)) {
              if (active) setState({gpx: text, loading: false, usedFallback: false})
              return
            }
            console.warn('[flyover] uploaded route has no track points, using committed default')
          }
        } catch (error) {
          console.warn('[flyover] uploaded route unreachable, using committed default', error)
        }
      }

      try {
        const response = await fetch(FALLBACK)
        const text = await response.text()
        if (active) {
          setState({
            gpx: looksLikeGpx(text) ? text : null,
            loading: false,
            usedFallback: true,
          })
        }
      } catch {
        if (active) setState({gpx: null, loading: false, usedFallback: true})
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [uploadedUrl])

  return state
}
