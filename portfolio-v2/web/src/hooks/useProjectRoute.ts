import {useCallback, useEffect, useState} from 'react'

const PROJECT_PATH = /^\/projects\/([^/]+)\/?$/

const slugFromPath = (pathname: string): string | null => {
  const match = PROJECT_PATH.exec(pathname)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Keeps the open project in sync with the URL without a router.
 * The site is one page; /projects/:slug just means "modal open".
 * Deep links work because Cloudflare Pages serves index.html for any path
 * (see public/_redirects).
 */
export const useProjectRoute = () => {
  const [slug, setSlug] = useState(() => slugFromPath(window.location.pathname))

  useEffect(() => {
    const onPopState = () => setSlug(slugFromPath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const openProject = useCallback((next: string) => {
    window.history.pushState({slug: next}, '', `/projects/${encodeURIComponent(next)}`)
    setSlug(next)
  }, [])

  const closeProject = useCallback(() => {
    // If we pushed the current entry, stepping back keeps history clean.
    // A direct deep link has no entry to return to, so rewrite it instead.
    if (window.history.state?.slug) {
      window.history.back()
    } else {
      window.history.replaceState(null, '', '/')
      setSlug(null)
    }
  }, [])

  return {slug, openProject, closeProject}
}
