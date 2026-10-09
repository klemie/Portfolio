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

The same map runs on desktop and mobile. Visiting a stop pauses and docks it
beside the story; mobile uses a compact map strip. Reduced motion skips the
frame animation. Click the docked map or Resume ride to return to the route.

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
credentials. New commits to `portfolio-v2-flyover` deploy automatically.

Push the repo, then create or configure a Pages project connected to
`klemie/Portfolio` with these settings:

```text
Root directory:         portfolio-v2
Build command:          pnpm --filter web build
Build output directory: web/dist
Production branch:      portfolio-v2-flyover
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
