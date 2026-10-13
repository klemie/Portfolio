# portfolio-v2

pnpm workspace holding the portfolio site and its CMS.

```
portfolio-v2/
├── studio/   Sanity Studio (content editing) — run locally
└── web/      Vite + React + TypeScript site — deployed to Cloudflare Pages
```

## Stack

- **Site:** Vite, React, TypeScript, component CSS. A scroll-driven map ride
  opens story pages at `/stops/:id`, `/projects/:slug` and `/experiences/:id`.
  Returning to the ride restores the saved stop and scroll position.
- **Content:** Sanity project `az7tzozl`, dataset `production` (public). Content
  is fetched in the browser at runtime, so edits go live without a rebuild.
- **Hosting:** Cloudflare Pages, Git integration.

## Local development

```sh
pnpm install

pnpm dev      # site at http://localhost:5173
pnpm studio   # Sanity Studio at http://localhost:3333
```

`web/.env` holds the Sanity identifiers. They are read-only and the dataset is
public, so there is no token and nothing secret in the bundle. `web/.env.example`
documents the same values.

## Flyover

The landing page is a scroll-driven map flyover through the places Kris has
worked. Full design record and decision log in
[`docs/flyover-spec.md`](docs/flyover-spec.md).

```sh
pnpm --filter web check:route      # validate the GPX route against the stops
pnpm --filter web check:route f.gpx   # ...or a local file
web/scripts/build-tiles.sh         # extract + upload the self-hosted basemap
```

The route and its pins come from a Strava **route** export (activity exports
have no waypoints). Upload it in the Studio under Site Settings → Flyover
route; `web/public/flyover-route.gpx` is the committed fallback.

The same map runs on desktop and mobile. Visiting a stop docks a map thumbnail
beside the story title. A labeled Back to map control stays in the header while
scrolling and returns to the saved route position. Reduced motion skips the
frame animation.

## Content model

Defined in `studio/schemaTypes/`:

- **`siteSettings`** — singleton (fixed id `siteSettings`). Name, tagline, bio,
  headshot, email, resume PDF, and social links. Drives the Hero and Contact
  sections.
- **`project`** — required reference to its `experience`, title, slug, overview,
  skillDescription, timeline, skills, technologies, images, and links. Optional
  `embedUrl` accepts an iframe-compatible HTTPS URL. In an experience, the
  project title switches between its projects; the viewer cycles through the
  embedded preview and photos. Without an embed URL it shows photos and links.
- **`experience`** — company, position, startDate, endDate, about, skills.
- **`stop`** — a flyover stop: title, `waypointName` (must match a GPX
  `<wpt><name>`), order, blurb, and experience references, oldest first and
  newest last. Projects are derived from those experiences. The former project
  list is hidden and retained only for the currently deployed site's old query.
  No coordinates — those come from the GPX.

The October 12, 2026 route (`A ride with me - website (2).gpx`) has six stops:
Shift Browser, Helm Operations, Island Temperature Controls, UVic Rocketry,
UVic, and Fort Street Cycle. Rocketry roles and their projects belong to UVic
Rocketry; the campus stop (`UVic 1` in the GPX) holds the TableTapp capstone.
Fort Street Cycle matches the GPX waypoint `Fort Street Cycles` and has optional
**Cycling → Races** and **Favourite routes in Victoria** lists in Studio. Each
story can include a result, notes, date, distance, climbing, photo and Strava
link. Only populated sections appear on the site. Its initial races are BWR BC
Wafer (1st in Kris's age category) and BWR AZ Wafer; the third race and favourite
routes are deferred.

To preview or apply the six-stop route update:

```sh
cd studio
pnpm exec sanity exec scripts/seed-stops.ts --with-user-token
PORTFOLIO_APPLY_STOPS=1 pnpm exec sanity exec scripts/seed-stops.ts --with-user-token
```

The script defaults to the committed GPX and validates every stop before any
write. It patches stop membership and route settings in one revision-guarded
transaction, preserves authored blurbs and cycling stories, and saves a recovery
snapshot in the system temporary directory. Re-running it does not duplicate races.

### Experience viewer migration

The development app previews the relationship migration without changing the
shared production dataset. It groups the existing rocketry projects by role
and adds a University of Victoria capstone experience for TableTapp. This
preview applies only while existing projects lack their parent reference;
authored references always take precedence. Production builds use Sanity only.

The local viewer includes PDF App, Agent Toolkit Seminar and Apps Directory
under Shift Browser until those projects are published. Interview-based copy and
presentation URLs are stored in `shared/shiftProjects.ts`; PDF screenshots are
local review assets. Create unpublished Studio drafts without changing published content:

```sh
cd studio
pnpm exec sanity exec scripts/create-shift-projects.ts --with-user-token
PORTFOLIO_CREATE_SHIFT_DRAFTS=1 pnpm exec sanity exec scripts/create-shift-projects.ts --with-user-token
```

The script verifies the parent experience and skips existing projects. Review
the drafts and upload the local screenshots as Sanity images before
publishing; published content takes precedence over the local preview.

Before deploying the new app, preview and apply the patch migration:

```sh
cd studio
pnpm exec sanity exec scripts/link-project-experiences.ts --with-user-token
PORTFOLIO_APPLY_RELATIONS=1 pnpm exec sanity exec scripts/link-project-experiences.ts --with-user-token
```

The migration preserves project text, assets, existing parent references, and
the legacy stop project list. It uses revision checks and includes the verified
TableTapp website and Software Process slide preview as embeds. In Studio, new
projects must choose their experience. Only set an embedded preview URL for a
page that permits framing; ordinary demo, website, GitHub and LinkedIn links
remain available externally. Readers can open an embed in another tab or
return to photos if its provider refuses to load.

```sh
pnpm --filter web check:projects
```

### Project covers and unpublishing

The first gallery image supplies the cover and small thumbnail for project previews and presentations. Interactive demos with a gallery video use that video's poster instead. To add an image from the Studio CLI, preview `scripts/publish-project-image.ts` with `PORTFOLIO_IMAGE_PROJECT` (slug), `PORTFOLIO_IMAGE_FILE` (absolute path), and `PORTFOLIO_IMAGE_ALT` (description). Add `PORTFOLIO_APPLY_IMAGE=1` to upload and publish it. Existing gallery images are preserved.

To remove a project from the public portfolio while retaining it in Studio, preview `scripts/unpublish-project.ts` with `PORTFOLIO_UNPUBLISH_PROJECT` (slug), then add `PORTFOLIO_APPLY_UNPUBLISH=1`. It saves a local recovery snapshot, preserves or creates the project's draft, and removes only its legacy stop references before unpublishing in one revision-guarded transaction. Unexpected references require review. Republishing the draft restores the project to its experience.

On October 12, 2026, Andúril Flight Computer and Software Process were unpublished this way. Their media remain in Sanity, and their legacy references were removed from the stop seed. The historical import scripts still describe the original portfolio dataset.

Apps Directory's cover is a screenshot of `https://shift.com/apps/`. Agent Toolkit Seminar's cover is its speaker-introduction slide (`1-106`) from the linked Figma presentation. Both were captured and published October 12, 2026.

### Content migration

The dataset is populated: `siteSettings`, 7 projects, and 8 experience entries,
migrated from the old site's hard-coded `portfolio/src/utils/content.ts` by
`studio/scripts/migrate-content.ts`. To re-run it (idempotent — deterministic
ids, `createOrReplace`, and asset uploads deduped by content hash):

```sh
cd studio && npx sanity exec scripts/migrate-content.ts --with-user-token
```

Note: document `_id`s must not contain a `.`. Sanity treats a dotted id as
private, so such documents are invisible to the unauthenticated reads the site
makes at runtime — they appear in the Studio but never on the site.

## Deploying to Cloudflare Pages

Live site: https://portfolio-boh.pages.dev

Cloudflare project: `portfolio`. Production and preview build variables are
configured in Cloudflare, and their Sanity origins allow requests without
credentials. New commits to `main` deploy automatically.

Push the repo, then create or configure a Pages project connected to
`klemie/Portfolio` with these settings:

```text
Root directory:         portfolio-v2
Build command:          pnpm --filter web build
Build output directory: web/dist
Production branch:      main
Framework preset:       None
```

The output directory is relative to the selected root directory. The workspace
pins Node 22 with `.node-version` and pnpm with `packageManager`.

Add the following build environment variables for both Production and Preview,
copying the values from the local `web/.env` (which is gitignored):

```text
VITE_SANITY_PROJECT_ID
VITE_SANITY_DATASET
VITE_SANITY_API_VERSION
VITE_MAPTILER_KEY
VITE_MAPTILER_STYLE
VITE_MAP_BUILDINGS_3D
PNPM_VERSION=10.14.0
```

The three Sanity identifiers are documented in `web/.env.example`. Never put a
Sanity write token in a `VITE_*` variable; this frontend reads the public dataset
without a token. MapTiler's browser key is public by design and should allow the
production and preview origins in its dashboard.

`web/public/_redirects` provides the SPA fallback so a deep link to a stop,
project or experience serves `index.html` instead of returning a 404.

In Sanity's API settings, allow the Pages origin and any custom domain as CORS
origins, without credentials. Add those origins to the MapTiler key's allowed
HTTP origins as well.

After deployment, verify the map and route, both themes and System mode, the
résumé PDF, direct story URLs, refreshing a story URL, and returning to the saved
ride position.

The Studio is not deployed. Run `pnpm studio` locally, or `pnpm studio:deploy`
to publish it to a `*.sanity.studio` URL.
