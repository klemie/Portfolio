# Flyover

A scroll-driven route through the places Kris has worked. The interaction
now takes inspiration from [Studio Mirage](https://studiomirage.io): preview
a place, visit its story, then return to the route.

Status: **built.** Runs at `/` for every visitor — desktop landscape and a
responsive preview layout on narrow screens. Terrain source resolved: AWS
terrarium. The fallback page has been removed; see §5.

Implementation:

| Path | |
|---|---|
| `web/src/flyover/` | `Flyover.tsx`, `camera.ts`, `mapStyle.ts`, `RidePreview.tsx`, `VisitHero.tsx` |
| `web/src/lib/` | `gpx.ts`, `route.ts`, `visit.ts` |
| `web/src/components/VisitContent.tsx` | stop, project and experience content |
| `web/src/hooks/` | `useRouteGpx.ts`, `useVisitRoute.ts`, `usePrefersReducedMotion.ts` |
| `web/public/flyover-route.gpx` | committed default route |
| `web/scripts/check-route.ts` | `pnpm --filter web check:route` |
| `web/scripts/build-tiles.sh` | pmtiles extract + R2 upload |
| `studio/schemaTypes/StopTypes.ts` | `stop` document |
| `studio/scripts/seed-stops.ts` | seeds the four stops |

---

## 1. Landing page

The route overview fills the rounded frame, inset 20px on all four sides.
Name and location sit at the top; the invitation and an Explore action start
the ride. The map stays available on portrait screens as well.

**The cursor reveal was built and then removed.** A dark overlay masked by a
radial gradient that followed the cursor and grew with cumulative movement,
with an idle auto-open for keyboard visitors. It worked as specified and was
cut on sight for looking bad. All of it is gone — `useCursorReveal.ts`,
`maskOpacityFor`, the `.ride-mask` element and its CSS — rather than left
switched off, so nothing has to be reasoned around later.

The landing is now simply the map with the invitation over it.

---

## 2. The ride

Scroll-driven scrub. The visitor sets the pace, can stop, and can scroll back.

| | |
|---|---|
| Total length | ~400vh |
| Per stop | 100vh (4 stops) |
| Camera | Single low tilted camera on 3D terrain, one mode throughout |
| Camera path | Follows the uploaded track |
| Camera speed | Varies with leg length — 6.8× swing, see risks |
| Chrome | Stop title, central Visit CTA, next destination at bottom left, previous destination at bottom right |
| Camera angles | Pitch / bearing / zoom hardcoded per stop, not in the CMS |

### Stops

Four stops. Geographic order, which lands as reverse-chronological
(2024 → 2019). Chronological *within* each stop.

| # | Stop | Coords | Source |
|---|---|---|---|
| 1 | Shift | 48.42832, -123.36184 | `<wpt>` added by hand at the track start |
| 2 | Helm Operations | 48.42614, -123.37011 | `<wpt>` |
| 3 | Island Temperature Controls | 48.44958, -123.37755 | `<wpt>` |
| 4 | UVic | 48.46048, -123.31071 | `<wpt>` — campus edge |

Pins come from the GPX waypoints, so they are on the line by construction and
the camera never leaves the route.

**Note on UVic:** this is the campus-edge point where the route ends, not
3800 Finnerty Rd. The geocoded address resolves to the Halpern Centre at
48.46607, -123.30744, which is 587 m off the route. The on-route point won.

Along-track leg distances:

```
Shift              -> Helm Operations     1.11 km  ####
Helm Operations    -> Island Temperature  3.57 km  ##############
Island Temperature -> UVic                7.62 km  ##############################
                                         12.30 km total
```

### Blurbs

Kris writes all four. Budget **~60 words each** — that is what 100vh per stop
buys. The schema ships with the fields empty and validation flagging which
stops are still unwritten.

### Preview and Visit

Arriving at a stop reveals its title and enables **Visit this stop**. While
settled, the map slowly rotates around the pin at two degrees per second. It
pauses offscreen and when the document is hidden. Orbit headings carry into
the departure leg, so scrolling away does not reset the camera heading.

Visit opens `/stops/:id` as an editorial story page. The existing map contracts
into a 240px-high card beside the title, stop number and discipline tags in
500ms. The orbit pauses, the map stays sharp, and the opening story appears
within the first screen. The map's bounds animate without scaling its labels;
its canvas resizes throughout. On mobile, it becomes a 180px-high strip below
the heading. Scrolling takes the card offscreen and returns it naturally.

Clicking anywhere on the compact map expands it in 350ms and returns to
the saved route position. The map itself is keyboard accessible; there is no
extra button overlaid on the map. A persistent Resume ride control also
returns to the map. It skips nested project detail pages, while browser
Back follows normal history (project → stop → ride). History entries retain
the ride position through refresh. Direct links resume at the associated stop.
Save the position **before** changing layout because a shorter document can
immediately clamp `window.scrollY`. Reduced motion changes layout without the
frame or heading animation; direct links open in the settled story layout.

Projects open `/projects/:slug`; experience links open `/experiences/:id`.
They use the same story layout and frame the associated stop, with existing
descriptions, skills, images and external links in ordinary document flow.
The former StopPanel, ProjectPopover and ProjectModal were removed.

---

## 3. Route data

Two sources, split by what they are good at: geometry in Strava, prose in the
Studio.

| Source | Owns |
|---|---|
| Uploaded **GPX** | The route line **and** the pins (`<wpt>` elements) |
| Sanity `stop` docs | Blurbs and project refs, matched to waypoints by name |

### The current file

`Portfolio website map.gpx` — a Strava **route** export
(`strava.com/routes/3531877400527939102`).

- 274 track points, 12.35 km
- Elevation on every point: 6–66 m, 109 m total gain
- 3 waypoints as exported: Helm Operations, Island Temperature Controls, UVic
- A 4th, `Shift`, was added at the track's first point — see open item 2
- Not a closed loop — starts downtown, ends at UVic
- Committed as `web/public/flyover-route.gpx` and uploaded to `siteSettings`

### Workflow

1. Draw or ride a route in Strava that passes every stop.
2. Place a `<wpt>` at each stop, named to match its Sanity `stop`.
3. Export GPX and upload to the Studio.

Notes:

- Strava **route** exports include `<wpt>` elements. Strava **activity**
  exports do not — only `<trk>`. Draw routes in the route builder if you want
  waypoints.
- A real ride track is thousands of points. Simplify before handing it to
  MapLibre. The current route is only 274 points, so this matters more for
  actual ride exports.
- Elevation is available if the elevation-profile chrome is ever revisited.
- `pnpm --filter web check:route` reports any `stop` with no matching
  waypoint, any waypoint with no `stop`, off-track distances, leg lengths and
  unwritten blurbs. Exits non-zero if a stop cannot be placed. Takes an
  optional local path, otherwise reads the uploaded route.

### Fallback route

No GPX, or a malformed one: fall back to a route committed in the repo. A bad
upload never reaches visitors.

Done: `web/public/flyover-route.gpx` is that default, rather than a synthetic
curve from hardcoded pins. `useRouteGpx` prefers the uploaded file, checks it
actually contains track points, and falls back to the committed copy otherwise.

---

## 4. Tech

- **MapLibre GL** with 3D terrain. Measured at **1.06 MB raw / 284 KB gzipped**
  in its own lazy chunk — the "~700 KB gzipped" figure quoted while designing
  was too pessimistic.
- **Basemap:** southern Vancouver Island `.pmtiles` extract, self-hosted on
  Cloudflare R2 (the site is already on Cloudflare Pages). No API key, no
  third-party SLA on the front door.
- **Terrain source:** AWS terrarium —
  `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`,
  free, planet-wide, no key. The one third-party runtime dependency left.
- **Basemap: MapTiler Dataviz Dark** (`VITE_MAPTILER_KEY` +
  `VITE_MAPTILER_STYLE=dataviz-dark`). Chosen over OpenFreeMap Liberty for its
  minimal cartography. Note the trade this reverses: MapTiler tiles cannot be
  extracted to R2, so the "no API key, no third-party SLA on the front door"
  property from the original decision is gone, and the free tier is 100k tile
  requests/month. `scripts/build-tiles.sh` now only applies to OpenFreeMap.
- **Route colours follow the basemap's lightness.** The casing and the
  route-ahead hint are read from the style's own background colour at load
  (`hsl`, hex and `rgb` are all parsed); on a dark basemap the near-black
  originals were invisible. The orange trace itself works on both.
- **3D buildings are injected.** Dataviz is a 2D style with no
  `fill-extrusion`, and it fakes depth with a `fill-translate` offset on its
  "Building top" layer — an offset that is only correct on a north-up flat map
  and smears under a rotating tilted camera. Those faked layers are dropped and
  a real extrusion driven by `render_height` is added. Without it the flyover
  is nearly flat, since Victoria only spans 6-66 m of elevation.
  `VITE_MAP_BUILDINGS_3D=false` opts out.
- **Basemap is decluttered at load.** Every `symbol` layer is stripped (all 25
  of them: POI pins, transit stops, shop and street names, highway shields,
  one-way arrows, place labels) along with administrative boundaries — 111
  layers down to 83. The ride carries its own pins and panel, so map labelling
  only competed with them. Filtering by layer *type* rather than by a list of
  ids means a style update cannot reintroduce clutter. `mapStyle.ts` documents
  how to keep a subset, e.g. city names.
- Plain-CSS constraint no longer applies
- Mobile rides too, in the portrait layout (§5)

pmtiles serves via HTTP range requests, so a larger extract costs storage, not
visitor bandwidth. R2's free tier is 10GB with no egress fees.

---

## 5. Reach

**Removed:** there was a fallback page here — a static route drawing plus the
plain scroll page, served to mobile, `prefers-reduced-motion`, no-WebGL and
throttled connections by a capability gate in `useFlyoverCapability.ts`.

Every visitor now gets the ride. What made that affordable is that 3D building
extrusions are off (`VITE_MAP_BUILDINGS_3D=false`), which was the expensive
part of the original bar — the remaining camera work is terrain and pitch. The
gate, the `RouteOutline` drawing and the second layout are all gone, so there
is one path to maintain instead of two.

**Portrait.** The map fills the inset frame on every screen. Below 700px,
the central Visit CTA stacks above next and previous controls. Visit screen
titles and tags stack above the scroll cue. There is no bottom sheet, and no
JS breakpoint needs to match the CSS.

**Reduced motion.** Kept as a behaviour rather than a separate page:
`RideOptions.reducedMotion` cuts between stops rather than flying between them.
The idle orbit is disabled too. Stops and their Visit screens remain available.

**Not covered.** No WebGL, or a basemap style that will not load, now lands on
the `.ride-failed` state — a short apology, and the page below it still renders
in full. That is the accepted cost of dropping the gate: strictly worse than a
route drawing for that visitor, and the tradeoff is deliberate.

---

## 6. Content model

New `stop` document type:

- `title`
- `waypointName` — defaults to title; what the GPX `<wpt><name>` must match
- `blurb` (text, ships empty, validation flags unwritten stops)
- `order`
- `experiences` — refs to existing `experience` docs
- `projects` — refs to existing `project` docs

Plus a GPX file field for the route.

No `geopoint` field: pins come from the file. Existing `experience` and
`project` documents are unchanged. Camera parameters are **not** in the CMS.

### Content distribution

| Stop | Roles | Projects |
|---|---|---|
| Shift | 1 | 0 |
| Helm Operations | 2 | 0 |
| Island Temperature Controls | 1 | 0 |
| UVic | 4 | 7 |

All seven projects hang off the UVic stop as cards.

---

## 7. Open items

1. **Basemap is still the hosted OpenFreeMap style.** The pmtiles path is
   implemented and wired to `VITE_MAP_PMTILES_URL`, but no archive has been
   built or uploaded — that needs `pmtiles` installed and R2 credentials. Run
   `web/scripts/build-tiles.sh`. Until then the landing page depends on
   OpenFreeMap's uptime.
2. **The `Shift` waypoint was added programmatically**, not in Strava. It sits
   at the track's first point (48.42832, -123.36184), which is where the route
   comes closest to 1515 Douglas St — 140 m away. Redo it properly in the route
   builder when convenient; until then re-exporting from Strava will drop it.
3. **Four blurbs**, ~60 words each. The ride renders without them and the
   panel says so explicitly.
4. **Bio and headshot placement.** Called, not confirmed: they land after the
   ride, before Contact. Now the only arrangement, since there is no second
   layout to keep the Hero up top.
5. **Camera constants want tuning by eye.** `camera.ts` — `DWELL_ZOOM`,
   `DWELL_PITCH`, `TRAVEL_PITCH`, `TRAVEL_SHARE`, `LOOKAHEAD`. In dev the map
   instance is on `window.__flyoverMap`.

---

## 8. Risks

1. **Variable camera speed.** Legs differ 6.9× along-track, but each gets equal
   scroll — so the camera covers 1.1 km in the first stop's scroll and 7.6 km
   in the last. Most likely thing to feel wrong. It is one mapping function,
   so switching to distance-proportional is cheap once it can be judged on
   screen.
2. **No path for a visitor whose map will not load.** Dropping the capability
   gate means no-WebGL and dead-basemap cases get `.ride-failed` instead of a
   route drawing. Deliberate (§5), but it is a real regression for them.
3. **Direct Visit links start a fresh ride.** URLs for stops, projects and
   experiences work independently; closing a direct link returns to the route
   overview because there is no saved in-session ride position.
4. **UVic is pinned at the campus boundary**, not at the address or the
   rocketry lab. Deliberate, but it is the one pin that is not where the
   institution actually is.

---

## 9. Found while building

Recorded because each cost real time and would cost it again.

1. **maplibre-gl.css overrides the app's own stylesheet.** It ships
   `.maplibregl-map { position: relative }` and, being imported inside the lazy
   Flyover chunk, loads *after* `index.css`. A single-class `.ride-map` rule
   loses on load order, the container collapses to height 0, and a zero-size
   map never fires `load` — so the whole ride silently never starts. Hence
   `.ride-sticky .ride-map` with explicit width/height.
2. **`line-gradient` stops must be strictly ascending.** Clamping only the
   drawn fraction is not enough: past ~0.9985 the trailing edge stop collides
   with the final stop, MapLibre rejects the entire expression, and the trace
   silently freezes for the rest of the ride. Both `drawn` and `edge` need
   headroom.
3. **Deriving camera heading from the local tangent makes it spin.** The raw
   tangent on this route swings 184° → 234° → 1° inside a single leg. Temporal
   damping would smooth it but break scroll reversibility, so heading is
   anchored per stop and interpolated across legs — which also keeps the camera
   stable through travel; the preview adds a slow orbit during dwell.
4. **A radial fan cannot hold 7 project cards.** UVic's seven titles collapsed
   into an illegible pile at one coordinate. A vertical column works at any
   count.
5. **Reading pixels off a WebGL canvas via `drawImage` returns black** without
   `preserveDrawingBuffer`. Screenshots composite correctly; canvas sampling
   does not. Cost a false "the map is blank" diagnosis.

---

## 10. Considered and rejected

Recorded so these are not re-litigated.

| Decision | Chosen | Rejected |
|---|---|---|
| Route source | Uploaded GPX line | Synthetic curve between pins; pins snapped to a ride track |
| Pin source | GPX waypoints, matched by name | Sanity geopoints; hybrid with Sanity fallback |
| Playback | Scroll scrub | Autoplay cinematic; click-through steps |
| Map style | Real 3D map, MapLibre | Stylized flat vector; Mapbox satellite |
| Tiles | Self-hosted pmtiles on R2 | OpenFreeMap hosted; MapTiler free tier |
| Extract | Southern Vancouver Island | Victoria only; all of Vancouver Island; all of BC |
| Format | GPX | GeoJSON; accepting both |
| Landing | Map with invitation over it | Dark screen + cursor reveal (built, then cut); keeping the existing Hero |
| Text legibility | Opaque plate over the map | Reveal-excluded zone; text fades as map opens |
| Chrome | Trace + stop counter | Full Strava chrome with elevation profile; none at all |
| Pacing | Tight and even, ~400vh | Variable per stop; generous ~700-900vh |
| Stop granularity | Places, aggregating what happened there | Every role and project; a curated 3-4 |
| UVic | One pin, at the campus edge | Three campus sub-stops; one long dwell; the geocoded address |
| Ordering | Geographic, chronological within stops | Pure chronological; geographic with scrambled dates |
| Off-track pins | Moot — pins come from the track | Route must reach Sanity pins; camera detours; snapping |
| Bad route file | Committed default in repo | Last known good route; drop to fallback page |
| Visit | Clickable compact map card, story page and a real URL | Project popover with scroll lock (previous implementation) |
| Blurb authorship | Kris writes all four | Drafted from existing content; place + auto-list |
| Camera params | In code | Sanity fields |

### Deferred

- **Engine lot / hybrid engine test site.** Dropped as a stop: 364 m off the
  route, no content assigned, placeholder coordinates. The real site is "kinda
  far away" and may fall outside a southern-island extract.
- **Launch sites.** Adding them later is a waypoint plus possibly a wider
  extract — not a rewrite.
- **UVic campus sub-stops** (rocketry lab, engine test stand, course building).
- **Elevation profile chrome**, now that GPX supplies real elevation.

### Appearance and floating navigation

The page uses `prefers-color-scheme` in CSS by default. An appearance icon inside the navigation bar opens
a menu for Light, Dark or System. The ride menu opens above the bottom bar;
the story menu opens below the top bar. It closes on selection, Escape or
clicking outside. Explicit choices persist locally; System
clears the override and follows the CSS media query. Semantic tokens cover content, overlays, labels and
controls. Dataviz/OpenFreeMap styles switch with the resolved appearance
without recreating the map, resetting its camera or losing ride progress.
Explicit custom map styles retain their authored palette.

A floating bottom navigation bar provides Visit during the ride; previous
and next controls live on the map itself. Story screens replace this bar
with a persistent top navigation containing Resume ride. The résumé PDF
link remains on the ride screen. Clicking the compact map also returns to the ride. The compact layout also fits mobile screens.

### Cycling identity

The intro explicitly introduces Kris as a gravel cyclist and product engineer,
with centered intro copy and a “Start the ride” action.
A compact orange bicycle marker follows the same GPX progress as the drawn
route, centered on the current location. Its outer pointer follows the route
heading relative to the camera bearing, including during an orbit. The bike
icon stays upright and readable. There is no decorative wheel animation.

Story skills and technology tags appear once in the heading. Back to top
appears only when the story content extends beyond the viewport, and updates
when the viewport or content size changes.
