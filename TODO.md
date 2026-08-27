# TODO — Muzeum Hodnot

Roadmapa v blocích. Postupujeme od strukturálních („jasných") věcí k vizuálnímu ladění,
protože design zatím není finálně schválený (schválená je struktura).

Legenda: `[ ]` čeká · `[~]` rozpracováno · `[x]` hotovo

---

## Blok 0 — Dokumentace + rozhodnutí
- [x] Rozhodnout stack (Next.js + TS, static export; CSS Modules + CSS proměnné; pnpm)
- [~] `CLAUDE.md`, `README.md`, `TODO.md`

## Blok 1 — Scaffold & infrastruktura
- [x] `pnpm-workspace.yaml`, root `package.json`, `.gitignore`, `.editorconfig`
- [x] `apps/web` — Next.js App Router + TS, `output: 'export'`, `.nojekyll` (image loader → Blok 4)
- [x] ESLint + Prettier
- [x] `apps/studio` — Sanity Studio kostra (`sanity.config.ts`)
- [x] `git init` + první commit (větev `main`)

## Blok 2 — Design systém / tokeny  *(hodnoty po schválení Figmy)*
- [ ] `tokens.css` — `--space-*`, `--color-*`, `--radius-*`, breakpointy
- [ ] Typografie: heading (CY), title (CY + dynamické podtržení/akcent), label (mono), body
- [ ] Accent systém (`--accent` na wrapperu sekce)
- [ ] `Container`/`Section` — 3 šířky (full+padding / max 1200 / max 600)
- [ ] Globální paragrafové/typo třídy

## Blok 3 — Sanity schémata  *(struktura schválená)*
- [x] `siteSettings` — navigace (donate link) + patička (sociální sítě, Partneri textblok)
- [x] `homePage` — cover, navigační dlaždice (`heroTile`), bublina (excerpt + rest)
- [x] `exhibition` — místo, vernisáž, trvání (tag Aktuálne derivován), role, cover, galerie,
      abstract, materiály, odkazy, „Dále se podíleli", přepínač detailu
- [x] `contactPage` — telefon, email, adresa, admin údaje, lidé, cover
- [x] `experientialEducation` — cover + page builder
- [x] `valueGenerator` — cover + page builder + mapa (body s geopoint)
- [x] Sdílené objekty: `coverImage`, `richTextBasic`, `richTextFull`, `materialFile`,
      `namedLink`, `roleWithPeople`, `socialLink`, `galleryImage`, `person`, `mapPoint`, `heroTile`
- [x] Page builder bloky: `textBlock`, `headingBlock`, `decorativeImage`, `tileBlock`, `materialsBlock`
- [x] Studio structure — singletony (fixní ID, bez duplicit)
- [x] `sanity typegen` → generované typy (`apps/web/src/sanity/types.generated.ts`)

## Blok 4 — Základní komponenty + datová vrstva
- [x] `Button`, `Link`, `Tile`, `Container` (3 šířky), typo komponenty (`Heading/Title/Label/Text`)
- [x] `SanityImage` (custom loader) + `CoverImage` (gradient + placeholder ditheru)
- [x] `RichText` PortableText renderer (`richTextBasic` / `richTextFull`)
- [x] Sanity client (build-time, static export) + `@sanity/image-url` + GROQ dotazy (8×) + typegen

## Blok 5 — Stránky
- [ ] Root layout (nav + footer)
- [ ] Homepage
- [ ] Výstava — listing + detail (`generateStaticParams`)
- [ ] Kontakt
- [ ] Zážitkové vzdělávanie (page builder)
- [ ] Generátor hodnôt (page builder)

## Blok 6 — Speciální efekty  *(po vizuálním schválení)*
- [ ] Dithering cover obrázků (WebGL shader overlay + fallback)
- [ ] Mapa (MapLibre + Supercluster — clustering, zoom, popover)
- [ ] Rozbalovací bublina na homepage

## Blok 7 — A11Y, SEO, výkon
- [ ] Metadata, OG, `sitemap.xml`, `robots.txt`, JSON-LD, `lang="sk"`
- [ ] Responzivita 320px, kontrast, focus, klávesnice, `prefers-reduced-motion`
- [ ] axe / Lighthouse audit

## Blok 8 — Deploy & DNS
- [ ] Sanity projekt + dataset `production` + CORS
- [ ] GitHub Actions `deploy.yml` (push + `repository_dispatch`)
- [ ] `CNAME`, Cloudflare DNS + proxy
- [ ] Sanity webhook → `repository_dispatch`
- [ ] Studio deploy na `*.sanity.studio`

---

## Otevřené otázky (neblokují start)
- Přesné hodnoty tokenů + fonty (CY, monospace) → finální Figma
- Vlastní doména + Cloudflare zóna → před Blokem 8
- Sdílet page builder `experientialEducation` × `valueGenerator` 1:1?
