import {useEffect, useState} from 'react'
import {sanityClient} from '../lib/sanity'

interface QueryState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * Runs a GROQ query on mount. `query` must be a module-level constant —
 * an inline template string would re-trigger the effect on every render.
 */
export const useSanityQuery = <T>(query: string): QueryState<T> => {
  const [state, setState] = useState<QueryState<T>>({data: null, loading: true, error: null})

  useEffect(() => {
    let active = true

    sanityClient
      .fetch<T>(query)
      .then((data) => {
        if (active) setState({data, loading: false, error: null})
      })
      .catch((error: Error) => {
        if (active) setState({data: null, loading: false, error})
      })

    return () => {
      active = false
    }
  }, [query])

  return state
}
