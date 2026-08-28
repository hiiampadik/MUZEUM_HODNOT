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

## Blok 2 — Design systém / tokeny  *(z Figmy)*
- [x] `tokens.css` — barvy (#ececf0 bg, surface, akcentní paleta), `--space-*`,
      `--radius-*` (13 button / 30 karta), typografie
- [x] Fonty: Geist + Geist Mono (`geist` balíček, self-host); Cy (display) z Adobe Fonts/Typekit
      (`@import` v globals.css, rodina `"cy"`)
- [x] Typografie: heading/title (Cy) + akcentní podtržení, label (Geist Mono), text (Geist)
- [x] Accent systém (`--accent` per sekce, paleta v `routes.ts`)
- [x] `Container` — 3 šířky (full+padding / max 1200 / max 600)
- [x] Primitivy sladěné s Figmou: Button (pill), Nav (pilulky), Tile, Footer
- [ ] Přidat produkční doménu do povolených domén v Adobe Fonts (Cy) → před Blokem 8

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
- [x] Root layout (Nav klient + Footer, skip-link, fetch settings+contact)
- [x] Homepage (cover, hero dlaždice, intro bublina, výstavy active/upcoming/past)
- [x] Výstava — detail `/vystava/[slug]` (`generateStaticParams` + sentinel pro 0 výstav)
- [x] Kontakt `/kontakt`
- [x] Zážitkové vzdelávanie `/zazitkove-vzdelavanie` (page builder)
- [x] Generátor hodnôt `/generator-hodnot` (page builder + placeholder mapy → Blok 6)

## Blok 6 — Speciální efekty
- [x] Dithering cover obrázků (canvas Bayer ordered dithering + fallback img)
- [x] Mapa (MapLibre, vestavěný clustering, zoom na cluster, popover)
- [x] Rozbalovací bublina na homepage (clamp ~15 řádků + fade + „Čítať viac")
- [ ] Produkce: nahradit OSM raster dlaždice keyed providerem (MapTiler) — před Blokem 8
- [ ] Doplnit body mapy v CMS (zatím prázdné)

## Blok 7 — A11Y, SEO, výkon
- [x] Metadata (metadataBase, per-page OG z coveru), `sitemap.xml`, `robots.txt`,
      JSON-LD (Organization + ExhibitionEvent), `lang="sk"`, canonical
- [x] Skip-link, focus-visible baseline, `scroll-margin`, `prefers-reduced-motion`
- [ ] `NEXT_PUBLIC_SITE_URL` na produkční doménu (→ Blok 8)
- [ ] axe / Lighthouse audit *(až s reálným obsahem a schváleným designem)*

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


## Feedback
- Výstava v CMS musí mít u Odkazů a Materiálů možnost přidat vlastní emoji
- Když exhibition meta nemá 4. sloupec, tak vycentruj 3 sloupce. Stejné pro 2 sloupce.
- Použíj dočasně CY písmo z public folder 
- Mezi rozbaleným IntroBubble a buttonem na sbalení by měla být mezera.
- Vyextrahuj UI texty do extérního souboru. 
- U Coverů v CMS nepotřebujeme ALT.
