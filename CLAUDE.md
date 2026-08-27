# CLAUDE.md — Muzeum Hodnot

Guidance for Claude Code (and humans) working in this repo. Keep it short and binding.

## What this is
A Slovak, **single-language** website (exhibitions + educational resources for schools),
driven by the Sanity CMS. A static site deployed to GitHub Pages; content is edited in Sanity Studio.

## Language
- **Website UI and CMS content = Slovak** (copy, field labels in Studio, buttons).
- **Code, identifiers, code comments, commit messages = English.**
- Developer chat (Honza) may be in Czech. `TODO.md` and project notes are kept in Czech.

## Stack
- **Frontend:** Next.js (App Router) + TypeScript, **static export** (`output: 'export'`).
- **Styling:** CSS Modules + CSS custom properties (no Tailwind, no runtime CSS-in-JS).
- **CMS:** Sanity (Studio in `apps/studio`, deployed separately to `*.sanity.studio`).
- **Package manager:** pnpm (monorepo, pnpm workspace).
- **Hosting:** GitHub Pages + custom domain, Cloudflare DNS. Rebuilds via webhook → GitHub Actions.

## Repo layout
```
apps/web       Next.js frontend (→ static export → Pages)
apps/studio    Sanity Studio (schemas = source of truth for content)
packages/*     shared code (add when needed)
```

## Conventions — styling & design system
- **All sizing via tokens** — never hardcoded px. Use CSS variables:
  `--space-*`, `--color-*`, `--radius-*`, `--font-*`. Defined in `apps/web/src/styles/tokens.css`.
- **Typography** has 4 roles: `heading`/`title` use the **Cy** display font (`--font-display`,
  title 34px with a dynamic accent underline), `label` uses **Geist Mono** (`--font-mono`),
  `body` uses **Geist** (`--font-body`). Geist/Geist Mono come from the `geist` package
  (self-hosted via next/font). **Cy** (family `"cy"`) loads from Adobe Fonts / Typekit
  (`@import url('https://use.typekit.net/hcm5cdz.css')` in globals.css). The production
  domain must be added to the Adobe Fonts project's allowed domains.
- Design tokens (colors, spacing, radius) are derived from Figma in `src/styles/tokens.css`:
  page bg `#ececf0`, white surfaces, radius 13px (buttons) / 30px (cards).
- **Accent system:** sections carry an accent color (title underline + button color). Driven by a
  CSS variable `--accent` on the section wrapper — components read `var(--accent)`, not a fixed color.
- **3 layout widths** (`Container`/`Section` component):
  1. full-width with inner padding (gallery in Exhibition),
  2. max **1200px** (most blocks, 3-column layout),
  3. max **600px** (Exhibition body, Experiential education, Value generator).
- **Reusable components:** `Button`, `Link`, `Tile`, typography components, `CoverImage`.
- **Responsive from 320px.** Always test the smallest width.

## Conventions — images & effects
- Images come from the Sanity CDN (`@sanity/image-url`) + a custom Next image loader (for static export).
- **Cover image**: used both at the top and bottom of a page, with a linear gradient (top fades
  downward, bottom fades upward).
- **Dithering** is applied in React (do not pre-process images) — a WebGL shader overlay,
  with a fallback and respect for `prefers-reduced-motion`.

## Conventions — Sanity
- Before writing schemas/queries, load `get_schema` and the relevant Sanity Rules (`groq`, `nextjs`).
- Singletons (homePage, contactPage, siteSettings, experientialEducation, valueGenerator)
  hold a single document in the dataset.
- Text blocks: `richTextBasic` (bold/italic/links/paragraphs) vs `richTextFull` (+ bullet lists, monospace).
- Queries live in `apps/web/src/sanity/queries.ts` wrapped in `defineQuery` (from `groq`).
  After schema/query changes run `pnpm --filter studio typegen` — it regenerates
  `apps/web/src/sanity/types.generated.ts` (typegen config: `apps/studio/sanity-typegen.json`).
- **Static export caveat:** never import from the `next-sanity` root — it pulls in Server
  Actions (`defineLive`), which `output: 'export'` rejects. Import from `@sanity/client`,
  `groq`, `@portabletext/react` instead. Data is fetched at build time via `client` (no Live
  API, no Visual Editing, no draft mode in production); content updates come from a full rebuild.
- Images: `SanityImage` (next/image + custom CDN loader in `src/sanity/imageLoader.ts`).
  Sizing is done by the loader via the Sanity CDN; the base URL keeps hotspot/crop.

## Conventions — pages & routing
- Routes + provisional section accent colors live in `src/lib/routes.ts`. Set the accent
  per page via inline `style={{ '--accent': accents.x }}` on the page's `<main>`.
- Slovak URL slugs: `/kontakt`, `/zazitkove-vzdelavanie`, `/generator-hodnot`, `/vystava/[slug]`.
- Exhibition categories (active/upcoming/past) are derived at build time from dates in
  `src/lib/exhibitions.ts` — not stored in the CMS.
- `output: export` rejects an empty param list for a dynamic route. `/vystava/[slug]`
  emits a `_none` placeholder (renders 404) when there are zero openable exhibitions, so
  the first build on an empty dataset still succeeds.

## Conventions — A11Y & SEO
- Meet A11Y (semantics, focus states, keyboard, contrast, alt texts from the CMS).
- SEO: Next Metadata API, `sitemap.xml`, `robots.txt`, JSON-LD, `lang="sk"`.

## Scripts (after scaffolding)
- `pnpm --filter web dev` — frontend dev server.
- `pnpm --filter web build` — static export (must pass without errors).
- `pnpm --filter studio dev` — Sanity Studio locally.

## Roadmap
Work is split into blocks 0–8, see `TODO.md`. We go from structural work (setup, CMS,
components) to visual polish (final tokens, dithering, map), because the design is not yet
finally approved.

## Before starting visual work
Final token values, fonts (CY, monospace) and exact layout depend on the approved Figma.
Do not hardcode colors/sizes — keep them as tokens with provisional values and mark a TODO.
