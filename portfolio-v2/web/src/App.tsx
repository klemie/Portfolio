import {Suspense, lazy} from 'react'
import './App.css'
import {Contact} from './components/Contact'
import {ExperienceSection} from './components/ExperienceSection'
import {Hero} from './components/Hero'
import {ProjectModal} from './components/ProjectModal'
import {ProjectsSection} from './components/ProjectsSection'
import {useProjectRoute} from './hooks/useProjectRoute'
import {useRouteGpx} from './hooks/useRouteGpx'
import {useSanityQuery} from './hooks/useSanityQuery'
import {experiencesQuery, projectsQuery, siteSettingsQuery, stopsQuery} from './lib/queries'
import type {Experience, Project, SiteSettings, Stop} from './lib/types'

/**
 * Lazy so 1 MB of MapLibre does not block first paint. It is no longer about
 * keeping map code off a fallback path — every visitor gets the ride now — so
 * the placeholder in App.css matches the map's frame exactly and the page below
 * renders while the chunk arrives.
 */
const Flyover = lazy(() => import('./flyover/Flyover'))

export const App = () => {
  const settings = useSanityQuery<SiteSettings>(siteSettingsQuery)
  const projects = useSanityQuery<Project[]>(projectsQuery)
  const experiences = useSanityQuery<Experience[]>(experiencesQuery)
  const stops = useSanityQuery<Stop[]>(stopsQuery)
  const {slug, openProject, closeProject} = useProjectRoute()

  const route = useRouteGpx(settings.data?.routeGpxUrl)

  const loading = settings.loading || projects.loading || experiences.loading || stops.loading
  const error = settings.error ?? projects.error ?? experiences.error ?? stops.error

  if (loading) return <main className="page">Loading…</main>
  if (error) {
    return (
      <main className="page">
        <p>Could not load content from Sanity.</p>
        <p className="entry-meta">{error.message}</p>
      </main>
    )
  }

  const openedProject = slug ? projects.data?.find((project) => project.slug === slug) : undefined

  // The only thing that can now withhold the ride is missing data: with no
  // route or no stops there is nothing to fly. That is a content problem, not a
  // capability one — `pnpm --filter web check:route` reports it.
  const hasRide = Boolean(settings.data) && Boolean(route.gpx) && (stops.data?.length ?? 0) > 0

  return (
    <>
      {hasRide && settings.data && route.gpx && (
        <Suspense fallback={<div className="ride-booting">Loading the ride…</div>}>
          <Flyover settings={settings.data} stops={stops.data!} gpx={route.gpx} />
        </Suspense>
      )}

      <main className="page">
        {/* The landing screen is name + invitation over the map, so the bio and
            headshot land here at the end instead (spec §7). */}
        {settings.data && <Hero settings={settings.data} />}

        {experiences.data && experiences.data.length > 0 && (
          <ExperienceSection experiences={experiences.data} />
        )}
        {projects.data && projects.data.length > 0 && (
          <ProjectsSection projects={projects.data} onOpen={openProject} />
        )}
        {settings.data && <Contact settings={settings.data} />}
      </main>

      {openedProject && <ProjectModal project={openedProject} onClose={closeProject} />}
    </>
  )
}
