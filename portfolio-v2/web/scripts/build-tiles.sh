#!/usr/bin/env bash
#
# Extracts a southern Vancouver Island basemap and uploads it to Cloudflare R2,
# so the flyover's landing page does not depend on a third-party tile host
# staying up. See docs/flyover-spec.md §4.
#
#   ./scripts/build-tiles.sh
#
# Requires:
#   - pmtiles CLI   https://github.com/protomaps/go-pmtiles/releases
#   - rclone or wrangler, for the R2 upload
#
# IMPORTANT: the extract must use the same tile schema as the style in
# VITE_MAP_STYLE_URL, or layers will silently render empty. Both default to
# OpenFreeMap, which publishes its planet build as PMTILES_SOURCE below.

set -euo pipefail

# Bounding box: the route spans 48.426..48.468 N, -123.377..-123.307 W.
# Padded out to southern Vancouver Island so pins can move without a rebuild.
BBOX="${BBOX:--124.6,48.2,-122.9,49.6}"

PMTILES_SOURCE="${PMTILES_SOURCE:-https://tiles.openfreemap.org/planet}"
OUT="${OUT:-southern-vancouver-island.pmtiles}"
MAXZOOM="${MAXZOOM:-15}"

R2_BUCKET="${R2_BUCKET:-portfolio-tiles}"

command -v pmtiles >/dev/null || {
  echo "pmtiles CLI not found. Install from:" >&2
  echo "  https://github.com/protomaps/go-pmtiles/releases" >&2
  exit 1
}

echo "==> extracting $BBOX from $PMTILES_SOURCE (maxzoom $MAXZOOM)"
# pmtiles extract issues HTTP range requests, so only the covered tiles are
# downloaded — not the whole planet.
pmtiles extract "$PMTILES_SOURCE" "$OUT" \
  --bbox="$BBOX" \
  --maxzoom="$MAXZOOM"

echo "==> $OUT"
ls -lh "$OUT"
pmtiles show "$OUT" | head -20

cat <<EOF

==> next steps

1. Upload to R2:

     wrangler r2 object put $R2_BUCKET/$OUT --file=$OUT --remote

2. Give the bucket a public custom domain in the Cloudflare dashboard, then set
   in the Pages project's environment variables:

     VITE_MAP_PMTILES_URL=https://<your-tiles-domain>/$OUT

   The bucket must send CORS headers allowing your site's origin, and must
   permit Range requests — PMTILES reads slices of the archive rather than
   downloading it, which is why a large extract costs storage but not visitor
   bandwidth.

3. Redeploy. mapStyle.ts rewrites the style's vector sources to the archive
   automatically once that variable is present.
EOF
