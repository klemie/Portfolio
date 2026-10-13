# Project gallery videos

Project photos and videos are stored in the existing Sanity project `az7tzozl`, dataset `production`, and served from `cdn.sanity.io`. Short videos use ordinary Sanity file assets. The portfolio remains hosted on the personal Cloudflare Pages project `portfolio`; media files do not enter the Pages build or Git repository.

Run `pnpm studio`, open the project, and add a **Gallery videos** item. Give it a caption, upload a browser-compatible MP4 file, and optionally upload a poster image. Publish the project. Videos appear beside the existing demo and photos and play directly in the gallery with native controls, without autoplay. Switching media stops playback.

An interactive demo uses its first valid gallery video as the cover: a muted, looping preview behind “Try demo,” with the video's poster in the small thumbnail. Reduced-motion settings prevent preview autoplay. Opening the app or switching media removes the background video; a failed preview falls back to the poster or project photo. Standalone gallery videos retain manual playback and native controls.

## Prepare a clip

Sanity's normal file storage serves the uploaded file without automatic video conversion. Use H.264 video, AAC audio, and MP4 fast-start metadata for broad browser compatibility. FFmpeg commands:

```sh
ffmpeg -i INPUT.mov -map 0:v:0 -map '0:a:0?' -c:v libx264 -crf 22 -preset medium -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart -map_metadata -1 CLIP.mp4
ffmpeg -ss 2 -i CLIP.mp4 -frames:v 1 -q:v 3 POSTER.jpg
```

The original file remains unchanged. Asset storage and delivery count toward the existing Sanity plan's usage. This implementation uses ordinary Content Lake file assets; it does not require the paid Media Library video streaming feature.

## Upload from the command line

From `studio`, run this preview-first script using the existing Sanity CLI login:

```sh
PORTFOLIO_VIDEO_PROJECT=engine-monitoring-system \
PORTFOLIO_VIDEO_TITLE='Engine hotfire test' \
PORTFOLIO_VIDEO_FILE=/absolute/path/CLIP.mp4 \
PORTFOLIO_VIDEO_POSTER=/absolute/path/POSTER.jpg \
pnpm exec sanity exec scripts/publish-project-video.ts --with-user-token
```

Repeat with `PORTFOLIO_APPLY_VIDEO=1` to upload the video and poster and attach them to the published project. The script checks the MP4 container, requires byte-range playback support from the uploaded asset, preserves existing gallery entries, and applies a revision guard. Uploading the same clip again updates its gallery item rather than creating a duplicate.

## Validation and deployment

Run `pnpm --filter web check:projects`, `pnpm --filter web build`, and `pnpm --filter studio exec tsc --noEmit --incremental false`. Deploy `web/dist` to the personal Cloudflare Pages account `cac3f72b8e93d38fc5100410a4b0f318`, project `portfolio`, production branch `main`. The updated schema is available in the local Studio. Verify playback, seeking, and switching media on the project and experience pages.

Official documentation: [Sanity assets](https://www.sanity.io/docs/content-lake/assets), [asset CDN](https://www.sanity.io/docs/apis-and-sdks/asset-cdn), and [JavaScript asset uploads](https://www.sanity.io/docs/apis-and-sdks/js-client-assets).

Deployed October 12, 2026. The first clip is **Engine hotfire test** on [Engine Monitoring System](https://krislemie.ca/projects/engine-monitoring-system), sourced from `IMG_0412.mov`, converted to a 21.76-second H.264/AAC MP4 (3,885,406 bytes), and uploaded with its poster to the existing Sanity dataset. Live verification covered loading, playback, seeking, no autoplay, and stopping playback when switching gallery items. The Technical Coordinator viewer also queries the uploaded video. Frontend checks/build, Studio typecheck/build, and CDN byte-range verification passed.

**Rocket launch** on [Ground Support](https://krislemie.ca/projects/ground-support) was added October 12, 2026 from `IMG_7769.mov`. The 4K HEVC source was converted to a 19.37-second, 1920×1080, 30 fps H.264/AAC MP4 with fast-start metadata (9,628,704 bytes). Its poster is the launch at 9 seconds. The existing gallery and demo-cover implementation picks up the published Sanity assets without a new Pages deployment. Live verification passed for the muted looping preview on the project and Technical Coordinator pages, manual gallery playback, CDN byte-range support, and opening the embedded app with the preview video removed.

**Xenia-1 flight** on [Xenia-1 Flight Computer](https://krislemie.ca/projects/xenia-1-flight-computer) was added October 12, 2026 from `xenia-1-flight-small.mov`. It was converted to a 14.81-second, 1920×1080, 30 fps H.264/AAC MP4 with fast-start metadata (4,739,855 bytes). Its poster shows the airborne view at 8 seconds. The original clip and its mixed landscape/letterboxed footage remain intact. Live checks passed for loading, native gallery controls, manual playback, stopping playback when switching photos, and CDN byte-range support. The video also appears under Avionics Co-lead on the UVic stop.
