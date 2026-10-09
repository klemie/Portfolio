import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  optimizeDeps: {
    /**
     * MapLibre must be pre-bundled or the flyover's basemap silently fails in
     * dev while working perfectly in a production build.
     *
     * It loads vector tiles inside a Web Worker. Left unbundled, the dev
     * server serves that worker's dependency graph as raw ESM and the worker
     * never gets far enough to issue tile requests — no error, no failed
     * request, just an empty map. Terrain still appears, because raster-dem
     * tiles are fetched on the main thread, which makes it look like the map
     * is "half working".
     *
     * It is listed explicitly because the import lives inside a lazy chunk, so
     * Vite does not discover it during its initial dependency scan.
     */
    include: ['maplibre-gl', 'pmtiles'],
  },
})
