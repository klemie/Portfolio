import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import type {Map as MapLibreMap} from 'maplibre-gl'
import {createBikeMarker} from '../src/flyover/BikeMarker'
import {parseGpx} from '../src/lib/gpx'
import {buildRoute, placeWaypoints, positionAt} from '../src/lib/route'

const parsed = parseGpx(readFileSync(new URL('../public/flyover-route.gpx', import.meta.url), 'utf8'))
const route = buildRoute(parsed.track)
const anchors = placeWaypoints(route, parsed.waypoints)
const heading = {style: {transform: ''}}
let removed = false
const element = {
  style: {transform: ''}, hidden: false, className: '', innerHTML: '',
  setAttribute() {}, querySelector: () => heading, remove: () => { removed = true },
}
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document')
Object.defineProperty(globalThis, 'document', {configurable: true, value: {createElement: () => element}})

try {
  const handlers = new Map<string, () => void>()
  let screen = {x: 400, y: 300}
  let bearing = 0
  let projected: [number, number] | undefined
  const map = {
    getCanvasContainer: () => ({appendChild() {}}),
    on: (name: string, handler: () => void) => handlers.set(name, handler),
    off: (name: string) => handlers.delete(name),
    project: (coordinate: [number, number]) => { projected = coordinate; return screen },
    getBearing: () => bearing,
    triggerRepaint() {},
  } as unknown as MapLibreMap
  const bike = createBikeMarker(map, route)

  // Scrub both long legs in both directions. Position must wait for the map's
  // render, which can change elevation/projection after the move event.
  for (const index of [3, 4]) {
    for (const t of [0, 0.2, 0.5, 0.8, 1, 0.5, 0]) {
      const distance = anchors[index - 1].alongTrack + (anchors[index].alongTrack - anchors[index - 1].alongTrack) * t
      const before = element.style.transform
      bike.update(distance / route.totalDistance, true)
      assert.equal(element.style.transform, before, 'A scroll update must not move the bike ahead of the rendered map')
      screen = {x: screen.x + 5, y: screen.y + 9}
      bearing += 3
      handlers.get('render')!()
      const position = positionAt(route, distance)
      assert.deepEqual(projected, [position.lon, position.lat])
      assert.equal(element.style.transform, `translate(-50%, -50%) translate(${screen.x}px, ${screen.y}px)`)
      assert.equal(heading.style.transform, `rotate(${position.bearing - bearing}deg)`)
    }
  }
  screen = {x: 500, y: 400}
  handlers.get('render')!()
  assert.ok(element.style.transform.includes('translate(500px, 400px)'), 'New terrain frames reposition the bike even without scrolling')
  bike.update(0, false)
  assert.equal(element.hidden, true)
  bike.remove()
  assert.equal(handlers.size, 0)
  assert.equal(removed, true)
} finally {
  if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument)
  else Reflect.deleteProperty(globalThis, 'document')
}
console.log('Bike checks passed: Rocketry/UVic forward and reverse scrubbing, render timing, terrain refresh, heading, cleanup.')
