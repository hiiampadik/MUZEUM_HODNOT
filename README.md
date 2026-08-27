# Muzeum Hodnot

Website for a Slovak museum — exhibitions and educational resources for schools. A static
site (Next.js) driven by a headless CMS (Sanity), hosted on GitHub Pages with a custom
domain via Cloudflare.

> Note: the website and CMS content are **in Slovak**; the codebase is in English.
> Planning docs (`TODO.md`, project notes) are kept in Czech for the developer.

## Tech stack
- **Next.js (App Router) + TypeScript** — static export (`output: 'export'`).
- **CSS Modules + CSS custom properties** — design tokens for spacing/colors/radius/typography.
- **Sanity** — headless CMS (Studio in `apps/studio`).
- **pnpm** — monorepo (workspace).
- **GitHub Pages + Cloudflare DNS** — deploy; rebuilds via Sanity webhook → GitHub Actions.

## Structure
```
apps/
  web/       Next.js frontend
  studio/    Sanity Studio
packages/    shared packages (added as needed)
```

## Requirements
- Node.js 20+
- pnpm 9+  (`corepack enable`)

## Development
```bash
pnpm install

# frontend
pnpm --filter web dev        # http://localhost:3000

# Sanity Studio
pnpm --filter studio dev     # http://localhost:3333
```

## Build
```bash
pnpm --filter web build      # static export to apps/web/out
```

## Deploy
- **Frontend:** GitHub Actions builds and deploys `apps/web/out` to GitHub Pages.
  Trigger: push to `main` + `repository_dispatch` (Sanity webhook on content change).
- **Studio:** `pnpm --filter studio deploy` → `*.sanity.studio`.
- **DNS/domain:** Cloudflare (CNAME to GitHub Pages, proxy enabled).

## Configuration (env)
`apps/web/.env.local` (a template will live in `.env.example`):
```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=      # build-time only, if draft/preview is needed
```

## Project status
Work is split into blocks — see `TODO.md`. Current focus: foundational structural blocks
(setup, CMS schemas, components). Visuals are finalized after the Figma design is approved.
