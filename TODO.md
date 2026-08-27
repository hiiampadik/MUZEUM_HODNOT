# TODO — Muzeum Hodnot

Roadmapa v blocích. Postupujeme od strukturálních („jasných") věcí k vizuálnímu ladění,
protože design zatím není finálně schválený (schválená je struktura).

Legenda: `[ ]` čeká · `[~]` rozpracováno · `[x]` hotovo

---

## Blok 0 — Dokumentace + rozhodnutí
- [x] Rozhodnout stack (Next.js + TS, static export; CSS Modules + CSS proměnné; pnpm)
- [~] `CLAUDE.md`, `README.md`, `TODO.md`

## Blok 1 — Scaffold & infrastruktura
- [ ] `pnpm-workspace.yaml`, root `package.json`, `.gitignore`, `.editorconfig`
- [ ] `apps/web` — Next.js App Router + TS, `output: 'export'`, image loader, `.nojekyll`
- [ ] ESLint + Prettier
- [ ] `apps/studio` — Sanity Studio kostra (`sanity.config.ts`)
- [ ] `git init` + první commit

## Blok 2 — Design systém / tokeny  *(hodnoty po schválení Figmy)*
- [ ] `tokens.css` — `--space-*`, `--color-*`, `--radius-*`, breakpointy
- [ ] Typografie: heading (CY), title (CY + dynamické podtržení/akcent), label (mono), body
- [ ] Accent systém (`--accent` na wrapperu sekce)
- [ ] `Container`/`Section` — 3 šířky (full+padding / max 1200 / max 600)
- [ ] Globální paragrafové/typo třídy

## Blok 3 — Sanity schémata  *(struktura schválená)*
- [ ] `siteSettings` — navigace + patička (sociální sítě, Partneri textblok)
- [ ] `homePage` — cover, navigační dlaždice, bublina, sekce výstav
- [ ] `exhibition` — místo, vernisáž, trvání (tag Aktuálne), role, cover, galerie, abstract,
      materiály, odkazy, „Dále se podíleli", přepínač detailu
- [ ] `contactPage` — telefon, email, adresa, admin údaje, lidé, cover
- [ ] `experientialEducation` — cover + page builder
- [ ] `valueGenerator` — cover + page builder + mapa (body)
- [ ] Sdílené objekty: `coverImage`, `richTextBasic`, `richTextFull`, `materialFile`,
      `namedLink`, `roleWithPeople`, `socialLink`, `mapPoint`, `tile`
- [ ] Page builder bloky: `textBlock`, `heading`, `decorativeImage`, `tileBlock`, `materialsBlock`
- [ ] `sanity typegen` → generované typy

## Blok 4 — Základní komponenty + datová vrstva
- [ ] `Button`, `Link`, `Tile`, typo komponenty, `CoverImage` (gradient + placeholder ditheru)
- [ ] `PortableText` renderery (`richTextBasic` / `richTextFull`)
- [ ] Sanity client + `@sanity/image-url` + GROQ dotazy

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
