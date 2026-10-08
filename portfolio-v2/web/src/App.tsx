import {Suspense, lazy, useLayoutEffect, useRef} from 'react'
import './App.css'
import {ThemeSwitch} from './components/ThemeSwitch'
import {useTheme} from './hooks/useTheme'
import {Contact} from './components/Contact'
import {ExperienceSection} from './components/ExperienceSection'
import {Hero} from './components/Hero'
import {ProjectsSection} from './components/ProjectsSection'
import {VisitContent} from './components/VisitContent'
import {useVisitRoute} from './hooks/useVisitRoute'
import {useRouteGpx} from './hooks/useRouteGpx'
import {useSanityQuery} from './hooks/useSanityQuery'
import {resolveVisit, visitPath} from './lib/visit'
import {experiencesQuery, projectsQuery, siteSettingsQuery, stopsQuery} from './lib/queries'
import type {Experience, Project, SiteSettings, Stop} from './lib/types'

const Flyover = lazy(() => import('./flyover/Flyover'))

export const App = () => {
  const {theme, preference, change} = useTheme()
  const settings = useSanityQuery<SiteSettings>(siteSettingsQuery)
  const projects = useSanityQuery<Project[]>(projectsQuery)
  const experiences = useSanityQuery<Experience[]>(experiencesQuery)
  const stops = useSanityQuery<Stop[]>(stopsQuery)
  const {target, openVisit, resumeRide, rideScrollRef, resumeStopRef, transitionFromRef} = useVisitRoute()
  const route = useRouteGpx(settings.data?.routeGpxUrl)
  const previousScreenRef = useRef<string | null>(null)
  const screen = target ? visitPath(target) : null
  const visit = resolveVisit(target, stops.data ?? [], projects.data ?? [], experiences.data ?? [])

  // The map stays mounted across screens. Save the ride's document position
  // before docking it beside the story, and restore it on return.
  useLayoutEffect(() => {
    if (screen === previousScreenRef.current) return
    window.scrollTo({top: screen ? 0 : rideScrollRef.current, behavior: 'instant'})
    previousScreenRef.current = screen
    if (visit) document.querySelector<HTMLElement>('[data-visit-heading]')?.focus({preventScroll: true})
  }, [screen, visit, rideScrollRef])

  const loading = settings.loading || projects.loading || experiences.loading || stops.loading
  const error = settings.error ?? projects.error ?? experiences.error ?? stops.error
  if (loading) return <main className="page">Loading…</main>
  if (error) return <main className="page"><p>Could not load content from Sanity.</p><p className="entry-meta">{error.message}</p></main>
  if (target && !visit) return <main className="page"><h1>This visit could not be found.</h1><button type="button" onClick={() => resumeRide()}>Back</button></main>

  const hasRide = Boolean(settings.data) && Boolean(route.gpx) && (stops.data?.length ?? 0) > 0
  const returnToRide = () => resumeRide(visit?.stop?._id)

  return (
    <>
      <div id="top" />
      {hasRide && settings.data && route.gpx && (
        <Suspense fallback={<div className={`ride-booting${visit ? ' ride-booting--visit' : ''}`}>Loading the ride…</div>}>
          <Flyover settings={settings.data} stops={stops.data!} gpx={route.gpx}
            theme={theme} themeControl={<ThemeSwitch preference={preference} onChange={change} />} visit={visit} onVisit={(stop) => openVisit({kind: 'stops', id: stop._id})}
            onResume={returnToRide} resumeStopRef={resumeStopRef} transitionFromRef={transitionFromRef} />
        </Suspense>
      )}
      {visit ? <VisitContent visit={visit} onVisit={openVisit} /> : (
        <main className="page">
          {settings.data && <Hero settings={settings.data} />}
          {experiences.data && experiences.data.length > 0 && <ExperienceSection experiences={experiences.data} onOpen={(id) => openVisit({kind: 'experiences', id})} />}
          {projects.data && projects.data.length > 0 && <ProjectsSection projects={projects.data} onOpen={(id) => openVisit({kind: 'projects', id})} />}
          {settings.data && <Contact settings={settings.data} />}
        </main>
      )}
    </>
  )
}
