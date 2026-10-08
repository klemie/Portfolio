import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {parseGpx} from '../src/lib/gpx'
import {buildRoute, placeWaypoints} from '../src/lib/route'
import {rideStateFor, stopCameras} from '../src/flyover/camera'
import {visitFromPath, visitPath} from '../src/lib/visit'

const parsed = parseGpx(readFileSync(new URL('../public/flyover-route.gpx', import.meta.url), 'utf8'))
const route = buildRoute(parsed.track)
const anchors = placeWaypoints(route, parsed.waypoints).map((point) => ({name: point.name, alongTrack: point.alongTrack}))
const establishing = {center: route.coordinates[0] as [number, number], zoom: 11, bearing: 20, pitch: 46}
const offsets = anchors.map((_, index) => 30 + index * 15)
const count = anchors.length
const angularDifference = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180)
const cameras = stopCameras(route, anchors)

for (let index = 0; index < count; index++) {
  const settled = rideStateFor(route, anchors, (index + 1.82) / (count + 1), establishing, {bearingOffsets: offsets})
  assert.equal(settled.stopIndex, index)
  assert.ok(settled.dwell > 0)
  assert.ok(angularDifference(settled.camera.bearing, cameras[index].bearing + offsets[index]) < 0.0001)
  if (index + 1 < count) {
    const boundary = (index + 2) / (count + 1)
    const departing = rideStateFor(route, anchors, boundary + 0.000001, establishing, {bearingOffsets: offsets})
    assert.ok(angularDifference(departing.camera.bearing, settled.camera.bearing) < 0.01, 'Departure carries the orbit heading')
  }
}
for (let sample = 0; sample <= 1000; sample++) {
  const state = rideStateFor(route, anchors, sample / 1000, establishing, {reducedMotion: true, bearingOffsets: offsets})
  if (!state.landing) {
    assert.deepEqual(state.camera, cameras[state.stopIndex], 'Reduced motion ignores every orbit offset')
    assert.equal(state.dwell, 1)
  }
}
for (const kind of ['stops', 'projects', 'experiences'] as const) {
  const target = {kind, id: 'a title / with accents é'}
  assert.deepEqual(visitFromPath(visitPath(target)), target)
}
assert.equal(visitFromPath('/projects/%ZZ'), null)
assert.equal(visitFromPath('/'), null)
console.log(`Visit checks passed: ${count} stops, orbit departure continuity, 1,001 reduced-motion samples, URL round trips.`)
