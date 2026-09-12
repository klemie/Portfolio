import {addProtocol, type Map as MapLibreMap, type StyleSpecification} from 'maplibre-gl'
import {Protocol} from 'pmtiles'

/**
 * Basemap and terrain configuration. See docs/flyover-spec.md §4.
 *
 * The basemap style is chosen by env (see STYLE_URL below). Self-hosting the
 * tiles via `VITE_MAP_PMTILES_URL` is only possible for an open tileset such as
 * OpenFreeMap — a commercial style like MapTiler's cannot be extracted, so
 * choosing one trades the "no key, no third-party SLA" property for its
 * cartography.
 *
 * Terrain is always AWS terrarium: free, planet-wide, no key.
 */

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined

/** `dataviz`, `dataviz-light`, `dataviz-dark`, or any other MapTiler map id. */
const MAPTILER_STYLE = (import.meta.env.VITE_MAPTILER_STYLE as string | undefined) ?? 'dataviz'

/**
 * Basemap style, in precedence order:
 *
 *  1. `VITE_MAP_STYLE_URL` — an explicit style URL, wins over everything.
 *  2. `VITE_MAPTILER_KEY`  — MapTiler, defaulting to the Dataviz map. Dataviz
 *     is designed as a minimal backdrop for data on top, so it needs far less
 *     stripping than a navigation style.
 *  3. OpenFreeMap Liberty — no key, and the only option that can be extracted
 *     to your own .pmtiles.
 */
const STYLE_URL =
  (import.meta.env.VITE_MAP_STYLE_URL as string | undefined) ??
  (MAPTILER_KEY
    ? `https://api.maptiler.com/maps/${MAPTILER_STYLE}/style.json?key=${MAPTILER_KEY}`
    : 'https://tiles.openfreemap.org/styles/liberty')

const PMTILES_URL = import.meta.env.VITE_MAP_PMTILES_URL as string | undefined

/**
 * Dataviz already omits most of what `declutter` removes, so leaving labels in
 * is a reasonable choice with it. Set `VITE_MAP_DECLUTTER=false` to keep the
 * style exactly as its author designed it.
 */
const DECLUTTER = import.meta.env.VITE_MAP_DECLUTTER !== 'false'

/** Inject real extruded buildings into flat styles. Set 'false' to opt out. */
const BUILDINGS_3D = import.meta.env.VITE_MAP_BUILDINGS_3D !== 'false'

const TERRAIN_SOURCE = 'flyover-terrain'
const TERRARIUM_TILES = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'

export const ROUTE_SOURCE = 'flyover-route'
export const ROUTE_AHEAD_LAYER = 'flyover-route-ahead'
export const ROUTE_CASING_LAYER = 'flyover-route-casing'
export const ROUTE_LAYER = 'flyover-route-line'

/** Reads on both a light and a dark basemap, so it never needs a variant. */
export const ROUTE_COLOR = '#e4572e'

/**
 * The casing and the route-ahead hint have to contrast with the basemap, not
 * with the route, so they flip with the style's own lightness. On
 * `dataviz-dark` the near-black originals were simply invisible.
 *
 * `ahead` was also strengthened once the basemap got decluttered — against a
 * sparse map the original 0.22 alpha disappeared, and from the first stop you
 * could not tell where the ride was going.
 */
interface RouteTheme {
  casing: string
  casingFade: string
  ahead: string
  /** Base colour for injected 3D buildings. */
  building: string
}

const LIGHT_BASEMAP_THEME: RouteTheme = {
  casing: 'rgba(31, 30, 29, 0.5)',
  casingFade: 'rgba(31, 30, 29, 0)',
  ahead: 'rgba(31, 30, 29, 0.38)',
  building: 'hsl(35, 10%, 78%)',
}

const DARK_BASEMAP_THEME: RouteTheme = {
  casing: 'rgba(10, 9, 8, 0.65)',
  casingFade: 'rgba(10, 9, 8, 0)',
  ahead: 'rgba(244, 238, 233, 0.32)',
  building: 'hsl(0, 0%, 25%)',
}

let theme = LIGHT_BASEMAP_THEME

/**
 * Lightness of the style's background layer, 0..1, or null if it cannot be
 * read. Handles the `hsl()` MapTiler emits and the hex most styles use.
 */
const backgroundLightness = (style: StyleSpecification): number | null => {
  const background = style.layers.find((layer) => layer.type === 'background')
  const paint = background && 'paint' in background ? background.paint : undefined
  const color = paint && 'background-color' in paint ? paint['background-color'] : undefined
  if (typeof color !== 'string') return null

  const hsl = /hsla?\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*([\d.]+)%/i.exec(color)
  if (hsl) return Number(hsl[1]) / 100

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim())
  if (hex) {
    const raw = hex[1]
    const full =
      raw.length === 3
        ? raw
            .split('')
            .map((c) => c + c)
            .join('')
        : raw
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const rgb = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(color)
  if (rgb) {
    const [r, g, b] = [1, 2, 3].map((i) => Number(rgb[i]) / 255)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  return null
}

let protocolRegistered = false

/** Idempotent: MapLibre throws if a protocol is registered twice. */
const registerPmtiles = () => {
  if (protocolRegistered) return
  addProtocol('pmtiles', new Protocol().tile)
  protocolRegistered = true
}

/**
 * Strips the basemap down to physical geography.
 *
 * The stock style is built for a map you navigate: POI pins, transit stops,
 * shop names, street names, highway shields, one-way arrows, place labels.
 * None of that helps here — the ride has its own pins and panel, and the
 * clutter competes with them. Removing every `symbol` layer takes out all 25
 * icon-and-text layers in one rule, which is both simpler and more robust than
 * naming them: a style update cannot reintroduce clutter we forgot to list.
 *
 * What survives: background, water, landcover, parks, roads, buildings and the
 * low-zoom shaded relief. Colour and texture stay; naming and iconography go.
 *
 * To put a subset back — say city names for geographic anchoring — keep the
 * ones you want, e.g.
 *   layer.type !== 'symbol' || ['label_city', 'label_town'].includes(layer.id)
 */
const declutter = (style: StyleSpecification): StyleSpecification => {
  const before = style.layers.length

  style.layers = style.layers.filter((layer) => {
    // All icons and text.
    if (layer.type === 'symbol') return false
    // Dashed administrative lines, meaningless inside one city.
    if (layer.id.startsWith('boundary_')) return false
    return true
  })

  if (import.meta.env.DEV) {
    console.info(`[flyover] basemap decluttered: ${before} -> ${style.layers.length} layers`)
  }

  return style
}

/**
 * Removes faked 2.5D depth.
 *
 * Styles meant for a north-up 2D map often imply height by drawing a second
 * building fill nudged a few pixels with `fill-translate` — MapTiler's Dataviz
 * does exactly this in its "Building top" layer. That offset is only correct
 * from one viewing angle. Under a camera that tilts and rotates it points
 * somewhere unrelated to the view and reads as smeared duplicates.
 *
 * Always applied, regardless of the 3D setting: the fake is wrong here whether
 * or not real extrusions replace it, and flat-but-correct beats smeared.
 */
const removeFakeDepth = (style: StyleSpecification): StyleSpecification => {
  const before = style.layers.length
  style.layers = style.layers.filter(
    (layer) => !('paint' in layer && layer.paint && 'fill-translate' in layer.paint),
  )
  if (import.meta.env.DEV && style.layers.length !== before) {
    console.info(`[flyover] removed ${before - style.layers.length} faked-depth layer(s)`)
  }
  return style
}

/**
 * Gives a flat style real 3D buildings.
 *
 * A `fill-extrusion` driven by `render_height` is correct from any angle, and
 * it is what gives a tilted flyover something to bite on — Victoria only spans
 * 6-66 m across the route, so terrain alone barely registers.
 *
 * Skipped when the style already has an extrusion of its own.
 */
const addBuildingExtrusions = (style: StyleSpecification): StyleSpecification => {
  if (style.layers.some((layer) => layer.type === 'fill-extrusion')) return style

  const buildings = style.layers.filter(
    (layer) => 'source-layer' in layer && layer['source-layer'] === 'building',
  )
  if (buildings.length === 0) return style

  const source = 'source' in buildings[0] ? buildings[0].source : undefined
  if (typeof source !== 'string') return style

  style.layers.push({
    id: 'flyover-buildings-3d',
    type: 'fill-extrusion',
    source,
    'source-layer': 'building',
    minzoom: 13,
    paint: {
      'fill-extrusion-color': theme.building,
      'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 6],
      'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
      // Fade in rather than popping into existence mid-descent.
      'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14.5, 0.95],
    },
  })

  if (import.meta.env.DEV) console.info('[flyover] injected 3D buildings')
  return style
}

export const buildStyle = async (): Promise<StyleSpecification> => {
  const response = await fetch(STYLE_URL)
  if (!response.ok) {
    // Strip the key before it reaches a log or an error overlay.
    const safe = STYLE_URL.replace(/key=[^&]+/, 'key=***')
    throw new Error(`basemap style ${response.status} from ${safe}`)
  }

  const raw = (await response.json()) as StyleSpecification
  const style = DECLUTTER ? declutter(raw) : raw

  const lightness = backgroundLightness(style)
  theme = lightness !== null && lightness < 0.5 ? DARK_BASEMAP_THEME : LIGHT_BASEMAP_THEME
  if (import.meta.env.DEV) {
    console.info(
      `[flyover] basemap lightness ${lightness ?? 'unknown'} -> ` +
        `${theme === DARK_BASEMAP_THEME ? 'dark' : 'light'} route theme`,
    )
  }

  removeFakeDepth(style)
  if (BUILDINGS_3D) addBuildingExtrusions(style)

  if (PMTILES_URL) {
    // A .pmtiles archive only works with a style built for its tile schema.
    // Pointing a MapTiler style at your own extract yields a blank map with no
    // errors, which is a miserable thing to debug.
    if (MAPTILER_KEY && !import.meta.env.VITE_MAP_STYLE_URL) {
      console.warn(
        '[flyover] VITE_MAP_PMTILES_URL is set alongside a MapTiler style. ' +
          'MapTiler tiles cannot be self-hosted; the archive will be ignored.',
      )
    } else {
      registerPmtiles()
      for (const [name, source] of Object.entries(style.sources)) {
        if (source.type !== 'vector') continue
        style.sources[name] = {
          type: 'vector',
          url: `pmtiles://${PMTILES_URL}`,
          attribution: 'attribution' in source ? source.attribution : undefined,
        }
      }
    }
  }

  style.sources[TERRAIN_SOURCE] = {
    type: 'raster-dem',
    tiles: [TERRARIUM_TILES],
    encoding: 'terrarium',
    tileSize: 256,
    maxzoom: 13,
    attribution: 'Terrain: AWS Terrain Tiles',
  }

  return style
}

/**
 * Terrain and the route layers, added after `load`.
 *
 * `lineMetrics` is required for the `line-progress` expression that draws the
 * trace as the ride advances — without it the gradient silently does nothing.
 */
export const addFlyoverLayers = (
  map: MapLibreMap,
  coordinates: [number, number][],
): void => {
  map.setTerrain({source: TERRAIN_SOURCE, exaggeration: 1.35})

  map.addSource(ROUTE_SOURCE, {
    type: 'geojson',
    lineMetrics: true,
    data: {
      type: 'Feature',
      properties: {},
      geometry: {type: 'LineString', coordinates},
    },
  })

  // The whole route, faint. Reads as "where we are going" without competing
  // with the drawn portion.
  map.addLayer({
    id: ROUTE_AHEAD_LAYER,
    type: 'line',
    source: ROUTE_SOURCE,
    layout: {'line-cap': 'round', 'line-join': 'round'},
    paint: {
      'line-color': theme.ahead,
      'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 16, 3.5],
      'line-dasharray': [2.5, 2],
    },
  })

  // Casing and line are both progressive, so the drawn trace carries its own
  // outline instead of a dark full-length line spoiling the progressive draw.
  map.addLayer({
    id: ROUTE_CASING_LAYER,
    type: 'line',
    source: ROUTE_SOURCE,
    layout: {'line-cap': 'round', 'line-join': 'round'},
    paint: {
      'line-width': ['interpolate', ['linear'], ['zoom'], 10, 5, 16, 11],
      'line-blur': 1.5,
      'line-gradient': ['interpolate', ['linear'], ['line-progress'], 0, theme.casing, 1, theme.casing],
    },
  })

  map.addLayer({
    id: ROUTE_LAYER,
    type: 'line',
    source: ROUTE_SOURCE,
    layout: {'line-cap': 'round', 'line-join': 'round'},
    paint: {
      'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2.5, 16, 6],
      // Both gradients are replaced on every scroll frame by setRouteProgress.
      'line-gradient': ['interpolate', ['linear'], ['line-progress'], 0, ROUTE_COLOR, 1, ROUTE_COLOR],
    },
  })
}

/**
 * Reveals the trace up to `progress` (0..1 of route length).
 *
 * A gradient with a hard stop is used rather than trimming the geometry: the
 * source stays static, so this is a paint-property update rather than a
 * re-tile on every scroll frame.
 */
export const setRouteProgress = (map: MapLibreMap, progress: number): void => {
  if (!map.getLayer(ROUTE_LAYER)) return

  // `interpolate` requires strictly ascending stops, and there are four of
  // them: 0 < drawn < edge < 1. Clamping `drawn` alone is not enough — once it
  // passes 0.9985 the edge collides with the final stop, MapLibre rejects the
  // whole expression, and the trace silently stops updating for the rest of
  // the ride. The headroom below keeps all four distinct at every progress.
  const drawn = Math.min(Math.max(progress, 0.0005), 0.998)
  const edge = drawn + 0.0015

  const gradient = (color: string, fade: string) => [
    'interpolate',
    ['linear'],
    ['line-progress'],
    0,
    color,
    drawn,
    color,
    edge,
    fade,
    1,
    fade,
  ]

  map.setPaintProperty(ROUTE_LAYER, 'line-gradient', gradient(ROUTE_COLOR, 'rgba(228, 87, 46, 0)'))
  map.setPaintProperty(
    ROUTE_CASING_LAYER,
    'line-gradient',
    gradient(theme.casing, theme.casingFade),
  )
}
