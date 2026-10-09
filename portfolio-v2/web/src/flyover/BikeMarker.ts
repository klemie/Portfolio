import {Marker, type Map as MapLibreMap} from 'maplibre-gl'
import {positionAt, type Route} from '../lib/route'
import './BikeMarker.css'

/** The bike stays upright; the outer pointer shows travel direction on screen. */
export const createBikeMarker = (map: MapLibreMap, route: Route) => {
  const element = document.createElement('div')
  element.className = 'ride-cyclist'
  element.setAttribute('aria-hidden', 'true')
  element.innerHTML = `<div class="ride-cyclist-heading"><span></span></div>
    <div class="ride-cyclist-badge">
      <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="21" r="9"/><circle cx="37" cy="21" r="9"/>
        <path d="m11 21 8-11 6 11H11l8-11 13-1-7 12M32 9l5 12M19 10l-1-3M15 7h7" stroke-width="2"/>
        <path d="M31 5h6c4 0 4 6 0 6h-2" stroke-width="2.2"/>
        <circle cx="25" cy="21" r="1.5"/>
        <path d="m25 21 4 3h2"/>
      </svg>
    </div>`
  const heading = element.querySelector<HTMLElement>('.ride-cyclist-heading')!
  const start = positionAt(route, 0)
  const marker = new Marker({element, anchor: 'center', subpixelPositioning: true})
    .setLngLat([start.lon, start.lat]).addTo(map)
  let bearing = start.bearing
  const orient = () => { heading.style.transform = `rotate(${bearing - map.getBearing()}deg)` }
  // The route heading must also track the camera's slow orbit while stopped.
  map.on('rotate', orient)
  orient()
  return {
    update(progress: number, visible: boolean) {
      const position = positionAt(route, progress * route.totalDistance)
      marker.setLngLat([position.lon, position.lat])
      element.hidden = !visible
      bearing = position.bearing
      orient()
    },
    remove() { map.off('rotate', orient); marker.remove() },
  }
}
