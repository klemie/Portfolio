import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {parseGpx} from '../src/lib/gpx'
import {buildRoute, placeWaypoints} from '../src/lib/route'
import {rideStateFor, stopCameras} from '../src/flyover/camera'
import {landingTransitionFor, projectsOpacityFor} from '../src/flyover/landingTransition'
import {visitFromPath, visitPath} from '../src/lib/visit'

const parsed = parseGpx(readFileSync(new URL('../public/flyover-route.gpx', import.meta.url), 'utf8'))
const route = buildRoute(parsed.track)
const anchors = placeWaypoints(route, parsed.waypoints).map((point) => ({name: point.name, alongTrack: point.alongTrack}))
const establishing = {center: route.coordinates[0] as [number, number], zoom: 11, bearing: 20, pitch: 46}
const offsets = anchors.map((_, index) => 30 + index * 15)
const count = anchors.length
const angularDifference = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180)
const cameras = stopCameras(route, anchors)

// The map must be fully revealed and the SVG placed before the camera moves.
for (let sample = 0; sample <= 80; sample++) {
  const state = rideStateFor(route, anchors, sample / 100 / (count + 1), establishing)
  assert.deepEqual(state.camera, establishing, 'Opening holds the whole route until handoff')
}
for (let sample = 0; sample <= 100; sample++) {
  const transition = landingTransitionFor(sample / 100)
  if (transition.routeMorph < 1) {
    assert.equal(transition.mapReveal, 0, 'Map stays covered while the route is being placed')
    assert.equal(transition.routeOpacity, 1, 'Drawing remains visible throughout placement')
    assert.equal(transition.copyOpacity, 1, 'Intro remains visible throughout placement')
  }
  if (transition.mapReveal > 0) assert.equal(transition.routeMorph, 1, 'Fade starts only after complete alignment')
  assert.equal(transition.copyOpacity, 1 - transition.mapReveal, 'Intro and map crossfade together')
  assert.equal(transition.routeOpacity, 1 - transition.mapReveal, 'Drawing hands off during the short map reveal')
}
assert.equal(landingTransitionFor(0.68).mapReveal, 0)
assert.equal(landingTransitionFor(0.68).routeMorph, 1)
assert.equal(landingTransitionFor(0.68).cameraApproach, 0)
assert.ok(landingTransitionFor(0.74).mapReveal > 0 && landingTransitionFor(0.74).mapReveal < 1)
assert.equal(landingTransitionFor(0.78).cameraApproach, 0)
assert.equal(landingTransitionFor(0.80).routeOpacity, 0)
assert.equal(landingTransitionFor(0.80).mapRouteOpacity, 1)
const projectsBounds = {left: 100, right: 300, top: 200}
assert.equal(projectsOpacityFor([{x: 150, y: 160}, {x: 250, y: 160}], projectsBounds), 1)
assert.ok(projectsOpacityFor([{x: 150, y: 185}, {x: 250, y: 185}], projectsBounds) > 0)
assert.ok(projectsOpacityFor([{x: 150, y: 185}, {x: 250, y: 185}], projectsBounds) < 1)
assert.equal(projectsOpacityFor([{x: 0, y: 200}, {x: 400, y: 200}], projectsBounds), 0, 'Crossing segments hide projects even with both endpoints outside')
assert.equal(projectsOpacityFor([{x: 150, y: 300}, {x: 250, y: 300}], projectsBounds), 0, 'Projects stay hidden after the route passes')
assert.equal(projectsOpacityFor([{x: 50, y: 180}, {x: 50, y: 250}], projectsBounds), 1, 'A line beside the projects does not hide them')
const approaching = rideStateFor(route, anchors, 0.85 / (count + 1), establishing)
assert.ok(approaching.camera.zoom > establishing.zoom && approaching.camera.zoom < cameras[0].zoom)
const arriving = rideStateFor(route, anchors, 0.999999 / (count + 1), establishing)
const arrived = rideStateFor(route, anchors, 1.000001 / (count + 1), establishing)
assert.deepEqual(arriving.camera.center, arrived.camera.center)
assert.equal(arriving.camera.zoom, arrived.camera.zoom)
assert.equal(arriving.camera.pitch, arrived.camera.pitch)
assert.ok(angularDifference(arriving.camera.bearing, arrived.camera.bearing) < 0.000001, 'No camera jump when the first stop appears')

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
console.log(`Visit checks passed: staged landing handoff, ${count} stops, orbit departure continuity, 1,001 reduced-motion samples, URL round trips.`)
