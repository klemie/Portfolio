import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {parseGpx} from '../src/lib/gpx'
import {buildRoute, placeWaypoints} from '../src/lib/route'
import {rideStateFor, stopCameras} from '../src/flyover/camera'
import {LANDING_SCROLL_STAGES, landingTransitionFor, projectsOpacityFor} from '../src/flyover/landingTransition'
import {DWELL_SHARE, FINISH_SCROLL_STAGES, rideStagesFor, scrollStagesFor, stopProgressFor} from '../src/flyover/rideTiming'
import {visitFromPath, visitPath} from '../src/lib/visit'

const parsed = parseGpx(readFileSync(new URL('../public/flyover-route.gpx', import.meta.url), 'utf8'))
const route = buildRoute(parsed.track)
const anchors = placeWaypoints(route, parsed.waypoints).map((point) => ({name: point.name, alongTrack: point.alongTrack}))
const establishing = {center: route.coordinates[0] as [number, number], zoom: 11, bearing: 20, pitch: 46}
const offsets = anchors.map((_, index) => 30 + index * 15)
const count = anchors.length
const scrollStages = scrollStagesFor(count)
const angularDifference = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180)
const cameras = stopCameras(route, anchors)

// The map must be fully revealed and the SVG placed before the camera moves.
for (let sample = 0; sample <= 80; sample++) {
  const state = rideStateFor(route, anchors, sample / 100 / scrollStages, establishing)
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
const approaching = rideStateFor(route, anchors, 0.85 / scrollStages, establishing)
assert.ok(approaching.camera.zoom > establishing.zoom && approaching.camera.zoom < cameras[0].zoom)
assert.ok(landingTransitionFor(1).cameraApproach < 0.3, 'The old arrival point is now early in the slower approach')
assert.ok(Math.abs(landingTransitionFor(1.1).cameraApproach - 0.5) < 0.000001)
assert.equal(landingTransitionFor(LANDING_SCROLL_STAGES).cameraApproach, 1)
const arriving = rideStateFor(route, anchors, (LANDING_SCROLL_STAGES - 0.000001) / scrollStages, establishing)
const arrived = rideStateFor(route, anchors, (LANDING_SCROLL_STAGES + 0.000001) / scrollStages, establishing)
assert.ok(Math.hypot(arriving.camera.center[0] - arrived.camera.center[0], arriving.camera.center[1] - arrived.camera.center[1]) < 0.000001)
assert.ok(Math.abs(arriving.camera.zoom - arrived.camera.zoom) < 0.000001)
assert.ok(Math.abs(arriving.camera.pitch - arrived.camera.pitch) < 0.000001)
assert.ok(angularDifference(arriving.camera.bearing, arrived.camera.bearing) < 0.000001, 'No camera jump when the first stop appears')

for (let index = 0; index < count; index++) {
  const settled = rideStateFor(route, anchors, stopProgressFor(index, count), establishing, {bearingOffsets: offsets})
  assert.equal(settled.stopIndex, index)
  assert.ok(settled.dwell > 0)
  assert.ok(angularDifference(settled.camera.bearing, cameras[index].bearing + offsets[index]) < 0.0001)
  if (index + 1 < count) {
    const boundary = (LANDING_SCROLL_STAGES + DWELL_SHARE + index) / scrollStages
    const departing = rideStateFor(route, anchors, boundary + 0.000001, establishing, {bearingOffsets: offsets})
    assert.ok(angularDifference(departing.camera.bearing, settled.camera.bearing) < 0.01, 'Departure carries the orbit heading')
  }
}
// Compare actual dwell durations across the whole page, including Shift.
const dwellSamples = Array.from({length: count}, () => 0)
for (let sample = 0; sample < 6800; sample++) {
  const state = rideStateFor(route, anchors, (sample + 0.5) / 6800, establishing)
  if (!state.landing && state.dwell > 0) dwellSamples[state.stopIndex]++
}
assert.ok(Math.max(...dwellSamples) - Math.min(...dwellSamples) <= 1, 'Every stop gets the same scroll distance for dwell')
for (const dwell of [0.1, 0.5, 0.9]) {
  for (let index = 0; index < count; index++) {
    const state = rideStateFor(route, anchors, stopProgressFor(index, count, dwell), establishing)
    assert.equal(state.stopIndex, index, 'Navigation and resume target the correct stop')
    assert.ok(Math.abs(state.dwell - dwell) < 0.000001, 'Stop controls target the same position within dwell')
  }
}
assert.deepEqual(rideStateFor(route, [], 1, establishing).camera, establishing)
assert.ok(Math.abs(rideStateFor(route, anchors.slice(0, 1), rideStagesFor(1) / scrollStagesFor(1), establishing).dwell - 1) < 0.000001)
const finishCamera = {center: [-123.36, 48.45] as [number, number], zoom: 10.5, bearing: 0, pitch: 0}
const finishStart = rideStagesFor(count) / scrollStages
const finishBefore = rideStateFor(route, anchors, finishStart - 0.000001, establishing, {bearingOffsets: offsets, finishCamera})
const finishAfter = rideStateFor(route, anchors, finishStart + 0.000001, establishing, {bearingOffsets: offsets, finishCamera})
assert.ok(Math.hypot(finishBefore.camera.center[0] - finishAfter.camera.center[0], finishBefore.camera.center[1] - finishAfter.camera.center[1]) < 0.000001)
assert.ok(Math.abs(finishBefore.camera.zoom - finishAfter.camera.zoom) < 0.000001)
assert.ok(angularDifference(finishBefore.camera.bearing, finishAfter.camera.bearing) < 0.000001, 'Final pullback carries the last orbit heading')
const finishing = rideStateFor(route, anchors, (rideStagesFor(count) + FINISH_SCROLL_STAGES * 0.5) / scrollStages, establishing, {finishCamera})
assert.ok(Math.abs((finishing.finish ?? 0) - 0.5) < 0.000001)
assert.equal(finishing.dwell, 0, 'The overview does not orbit or enable Visit stop')
const finished = rideStateFor(route, anchors, 1, establishing, {finishCamera})
assert.ok(Math.abs((finished.finish ?? 0) - 1) < 0.000001)
assert.ok(Math.abs(finished.routeProgress - 1) < 0.000001, 'The finish displays the complete route')
assert.ok(Math.abs(finished.camera.zoom - finishCamera.zoom) < 0.000001)
assert.ok(Math.abs(finished.camera.pitch) < 0.000001)
assert.ok(Math.hypot(finished.camera.center[0] - finishCamera.center[0], finished.camera.center[1] - finishCamera.center[1]) < 0.000001)
assert.equal(rideStateFor(route, anchors.slice(0, 1), 1, establishing, {reducedMotion: true}).finish, 1)
for (let sample = 0; sample <= 1000; sample++) {
  const state = rideStateFor(route, anchors, sample / 1000, establishing, {reducedMotion: true, bearingOffsets: offsets})
  if (state.finish) {
    assert.deepEqual(state.camera, establishing, 'Reduced motion cuts to the whole-route finish')
    assert.equal(state.finish, 1)
  } else if (!state.landing) {
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
console.log(`Visit checks passed: staged landing handoff, ${count} equal stop dwells, continuous finish-line pullback, 1,001 reduced-motion samples, URL round trips.`)
