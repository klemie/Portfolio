import {useState} from 'react'
import {favouriteCyclingRoutes} from '../../../shared/cyclingRoutes'
import './StravaRoutes.css'

// Isolate Strava's DOM changes from React and initialize its script on every visit.
// All interpolated values come from the reviewed, committed route configuration.
const routeDocument = (route: (typeof favouriteCyclingRoutes)[number]) => `<!doctype html>
<html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;padding:0}body{font-family:system-ui}iframe{display:block;max-width:100%}</style>
</head><body>
<div class="strava-embed-placeholder" data-embed-type="route" data-embed-id="${route.id}"
 data-units="metric" data-full-width="true" data-style="standard" data-terrain="3d"
 ${route.surfaceType ? 'data-surface-type="true"' : ''} data-map-hash="${route.mapHash}"
 data-from-embed="${route.fromEmbed}"></div>
<script src="https://strava-embeds.com/embed.js"></script>
</body></html>`

export const StravaRoutes = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const count = favouriteCyclingRoutes.length
  const showRoute = (offset: number) => setActiveIndex((index) => (index + offset + count) % count)

  return (
    <section className="strava-routes" aria-labelledby="favourite-strava-routes" aria-roledescription="carousel">
      <h2 id="favourite-strava-routes">Favourite routes in Victoria</h2>
      <div className="strava-route-controls">
        <button type="button" aria-label="Previous route" aria-controls="strava-route-slides" onClick={() => showRoute(-1)}>← Previous</button>
        <span role="status" aria-live="polite" aria-atomic="true">Route {activeIndex + 1} of {count}</span>
        <button type="button" aria-label="Next route" aria-controls="strava-route-slides" onClick={() => showRoute(1)}>Next →</button>
      </div>
      <div id="strava-route-slides">
        {favouriteCyclingRoutes.map((route, index) => (
          <article className="strava-route" key={route.id} hidden={index !== activeIndex}
            aria-roledescription="slide" aria-label={`Route ${index + 1} of ${count}`}>
            <iframe
              title={`Favourite cycling route ${index + 1} — Strava map and elevation`}
              srcDoc={routeDocument(route)}
              loading="lazy"
              allow="fullscreen"
              allowFullScreen
            />
            <a href={`https://www.strava.com/routes/${route.id}`} target="_blank" rel="noopener noreferrer">
              Open route on Strava ↗
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
