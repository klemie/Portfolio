# Portfolio demos

All three apps are embedded in the project viewer. PDF frames permit downloads and cross-origin isolation; the three owned demo origins retain browser storage. Portfolio and demo responses use COOP/COEP headers for the PDF conversion engine. Third-party previews use credentialless frames.

Deploy only to Kris's verified personal Cloudflare account `cac3f72b8e93d38fc5100410a4b0f318` (the account owning `krislemie.ca`). Projects: `kris-ground-support-demo`, `kris-pdp-demo`, `kris-openpdf-demo`.

Build Ground Support from `Ground-Support/client` with `npm run check:demo && npm run build:demo`. Build PDP from `PDP-Monitoring-System-UI/monitoring-system` with the same commands. Their `demo-pages/wrangler.jsonc` configs target `../dist-demo`; run Wrangler from those directories. The demo typechecks cover the replay adapters and their dependencies. Vite bundles the original app screens; existing full-app TypeScript errors remain outside this hosting work.

Build PDF from `pdf` with `npm run pages:build:demo`, then use `npm run pages:deploy:demo`. Its isolated config, build marker, identity check, and forced account ID prevent the personal demo command from targeting Shift's project. The original `pages:deploy` remains the separate Shift deployment command. Office assets and the exact source archive are split below Pages' per-file limit and reassembled by a narrowly routed Pages Function.

After authentication, create the three Pages projects with production branch `main` in the personal account, then deploy each generated output with its explicit project name and `CLOUDFLARE_ACCOUNT_ID` above. Verify live pages and embedded storage/playback before publishing links.

The exact Sanity project IDs and intended URLs are in `shared/portfolioDemos.ts`. Preview the CMS update from `studio` with `pnpm exec sanity exec scripts/publish-demo-links.ts --with-user-token`; apply with `PORTFOLIO_APPLY_DEMOS=1`. The apply command verifies that every demo responds and permits portfolio embedding, then changes only demo fields using revision guards.

Rebuild and deploy the active `web` app to the existing Pages project `portfolio` after adding its `_headers`. The source and verified Cloudflare production branch are `main`. This also enables PDF isolation in the real portfolio; setting only child-frame headers is insufficient.

Deployed on October 12, 2026 to the personal account above. Portfolio project pages: `https://krislemie.ca/projects/ground-support`, `https://krislemie.ca/projects/engine-monitoring-system`, and `https://krislemie.ca/projects/shift-pdf-app`. All three use the original app screens in the project viewer.

Local QA covered original app navigation, recorded readings, PDP disabled valves, Ground browser-local rocket/module edits, reset, and sample PDFs. Live QA verified all three embeds, playback timelines, persistent PDF samples, and PDF compression (2.5 KB to 1.3 KB, stored in the library). Both Office assets and the full source archive were downloaded and verified against their build hashes. The Pages Function uses native fixed-length stream piping to avoid the CPU limit reached by a JavaScript chunk loop.

Browser automation could not expose the native upload picker or confirm saved file downloads. A full Office conversion also remains unverified. Do not describe those three checks as passing; they need a normal-browser smoke check. Existing full-app TypeScript errors in the rocketry repositories remain separate from the passing demo builds.
