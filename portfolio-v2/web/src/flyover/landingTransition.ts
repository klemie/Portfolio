const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ramp = (progress: number, from: number, to: number) => {
  const t = clamp((progress - from) / (to - from))
  return t * t * (3 - 2 * t)
}

/** One scroll slice: place the route, crossfade, then approach the stop. */
export const landingTransitionFor = (progress: number) => {
  const alignment = ramp(progress, 0, 0.68)
  const fade = ramp(progress, 0.68, 0.80)
  return {
    mapReveal: fade,
    copyOpacity: 1 - fade,
    routeMorph: alignment,
    routeOpacity: 1 - fade,
    mapRouteOpacity: fade,
    detailsOpacity: ramp(progress, 0.80, 0.96),
    cameraApproach: ramp(progress, 0.80, 0.99),
  }
}

/** Clear the caption below the drawing as the route expands into its space.
 * Keep it hidden after the line passes through, until scrolling reverses. */
export const projectsOpacityFor = (points: {x: number; y: number}[], bounds: {left: number; right: number; top: number}) => {
  let bottom = -Infinity
  for (let index = 1; index < points.length; index++) {
    const from = points[index - 1]
    const to = points[index]
    const dx = to.x - from.x
    if (dx === 0) {
      if (from.x >= bounds.left && from.x <= bounds.right) bottom = Math.max(bottom, from.y, to.y)
      continue
    }
    const a = (bounds.left - from.x) / dx
    const b = (bounds.right - from.x) / dx
    const start = Math.max(0, Math.min(a, b))
    const end = Math.min(1, Math.max(a, b))
    if (start > end) continue
    const dy = to.y - from.y
    bottom = Math.max(bottom, from.y + dy * start, from.y + dy * end)
  }
  // Start fading 24px ahead of the line, leaving room for its stroke.
  const opacity = clamp((bounds.top - bottom - 2) / 24)
  return opacity * opacity * (3 - 2 * opacity)
}
