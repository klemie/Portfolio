# portfolio-v2

pnpm workspace holding the portfolio site and its CMS.

```
portfolio-v2/
├── studio/   Sanity Studio (content editing) — run locally
└── web/      Vite + React + TypeScript site — deployed to Cloudflare Pages
```

## Stack

- **Site:** Vite, React, TypeScript, plain CSS. No router — the site is a single
  scroll page (Hero → Experience → Projects → Contact) and a project modal that
  syncs the URL to `/projects/:slug` via the History API.
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

Desktop gets the ride; mobile, `prefers-reduced-motion`, no WebGL and throttled
connections get a static route drawing plus the ordinary scroll page, with no
map JS shipped at all.

## Content model

Defined in `studio/schemaTypes/`:

- **`siteSettings`** — singleton (fixed id `siteSettings`). Name, tagline, bio,
  headshot, email, resume PDF, and social links. Drives the Hero and Contact
  sections.
- **`project`** — title, slug, overview, skillDescription, timeline, skills,
  technologies, images, and links. Rendered as cards plus the modal.
- **`experience`** — company, position, startDate, endDate, about, skills.
- **`stop`** — a flyover stop: title, `waypointName` (must match a GPX
  `<wpt><name>`), order, blurb, plus references to the experiences and projects
  that belong to that place. No coordinates — those come from the GPX.

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

Push the repo, then in the Cloudflare dashboard create a Pages project connected
to `klemie/Portfolio` with:

| Setting | Value |
| --- | --- |
| Production branch | your choice (currently on `pure-css-rewrite`) |
| Framework preset | None |
| Build command | `pnpm --filter web build` |
| Build output directory | `portfolio-v2/web/dist` |
| Root directory | `portfolio-v2` |

Add the `VITE_SANITY_*` variables from `web/.env.example` under **Settings →
Environment variables**, since `.env` is gitignored.

`web/public/_redirects` provides the SPA fallback so a deep link to
`/projects/some-slug` serves `index.html` instead of 404ing.

The Studio is not deployed. Run `pnpm studio` locally, or `pnpm studio:deploy`
to publish it to a `*.sanity.studio` URL.
