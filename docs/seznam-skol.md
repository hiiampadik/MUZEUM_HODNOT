# Seznam škol pod mapou (Generátor hodnôt)

Branch `feat/school-list`. Design: Figma `Muzeum-Hodnot`, node `743:386`.

## Co se změnilo

Na stránce `/generator-hodnot` se pod mapou zobrazuje soupis všech škol — ale jen
když je mapa vidět (`showMap` není vypnuté a existuje aspoň jeden bod).

Každá škola = jeden **bod na mapě** (`mapPoints` v singletonu `valueGenerator`).
Řádek školy obsahuje:

- **název** (`title`) s podtržením v barvě accentu,
- **„Zatiaľ ste spolu darovali“** — vybraná částka z Darujme.sk (skrytá, když ji neznáme),
- **„Potrebujeme“** — cílová částka (nové pole `goal`),
- **progress bar** — jen když je darováno víc než 0 a je vyplněný cíl,
- **„Zapojte sa na“** + pilulka s odkazem (`link`, emoji z CMS, jinak `↗`),
- **doprovodný text** (`text`, richTextBasic, max. 420 px).

Stylování vychází z řádků „Pripravované výstavy“ na homepage (přerušované
oddělovače, padding, nadpis sekce na střed).

## Soubory

| Soubor | Změna |
| --- | --- |
| `apps/studio/schemaTypes/objects/mapPoint.ts` | nové pole `goal` „Potrebujeme (€)“ (celé číslo ≥ 0), popis u odkazu |
| `apps/web/src/sanity/queries.ts` | `VALUE_GENERATOR_QUERY` načítá `goal` |
| `apps/web/src/sanity/types.generated.ts` | přegenerováno (`pnpm --filter studio typegen`) |
| `apps/web/src/components/SchoolList/*` | nová komponenta `SchoolList` (+ CSS modul) |
| `apps/web/src/components/ValueMap/ValueMap.tsx` | typ `MapPointData` rozšířen o `goal` a `link.emoji` |
| `apps/web/src/app/generator-hodnot/page.tsx` | `SchoolList` vložen pod `ValueMap` |
| `apps/web/src/lib/strings.ts` | texty `schoolList` (Školy, Zatiaľ ste spolu darovali, …) |
| `apps/web/src/styles/tokens.css` | nový token `--color-track` (#e3e3e3, dráha progress baru) |
| `apps/studio/schemaTypes/documents/darujmeFeeds.ts` | neveřejný singleton `secrets.darujmeFeeds` „Darujme.sk feedy“ (škola → ID feedu) |
| `apps/studio/schemaTypes/components/DarujmeFeedInput.tsx` | výběr školy z bodů na mapě |
| `apps/studio/structure.ts`, `schemaTypes/index.ts` | položka „Darujme.sk feedy“ ve Studiu |
| `apps/donations/*` | Cloudflare Worker `GET /amounts` (viz `apps/donations/README.md`) |
| `apps/web/src/lib/donations.ts` | stažení částek z Workeru (build i prohlížeč) |
| `apps/web/src/components/SchoolList/SchoolFunding.tsx`, `useDonationAmounts.ts` | klientská část: částky + progress bar, obnova v prohlížeči |
| `.github/workflows/deploy.yml`, `apps/web/.env.example` | proměnná `NEXT_PUBLIC_DONATIONS_API_URL` |

## Detaily

- **Modrá = accent.** Podtržení, výplň progress baru i pilulka berou `var(--accent)`
  (na Generátoru `#40a6e6`). Ve Figmě má pilulka tmavší `#3f44a7` — zatím záměrně
  sjednoceno s accentem (stejně jako odkazy na stránce výstavy).
- **Progress bar:** výška = 2 × `--radius-md` (26 px). Výplň má šířku
  `max(výška, procento)`, takže i malý dar je vidět jako celé kolečko. Má
  `role="progressbar"` s `aria-valuenow/max/text`.
- **Částky** se formátují přes `Intl.NumberFormat('sk-SK')` bez desetinných míst
  (`2 €`, `1 500 €`).
- **Bez cíle** (`goal` prázdné nebo 0) se nezobrazí „Potrebujeme“ ani progress bar.
- **Responzivita:** pod 768 px se sloupce (částky / odkaz) skládají pod sebe;
  pod 480 px se pod sebe skládají i obě částky.
- **Text Figmy „Zapojte se na“** je česky — na webu slovensky „Zapojte sa na“.

## Vybrané částky (Darujme.sk)

Cíl je ručně v Sanity, vybraná částka se bere živě z Darujme.sk.

- **Proč Worker:** feedy Darujme (`/v1/feeds/<id>/donations/` i `/donors/`) jsou
  veřejné, ale obsahují **jména a e-maily dárců** (ověřeno testovacím darem).
  ID feedu proto nesmí do prohlížeče ani do veřejných dat.
- **Kde jsou ID feedů:** v dokumentu `secrets.darujmeFeeds` („Darujme.sk feedy“
  ve Studiu). Dataset je veřejný, ale dokumenty s tečkou v `_id` vidí jen
  přihlášení / s tokenem — ověřeno na projektu (veřejné API vidí 101 dokumentů,
  přihlášený 114; pravidlo `_.groups.public` = `_id in path("*")`).
- **Worker** (`apps/donations`, `*.workers.dev`): s read-only tokenem přečte
  mapování (cache 30 min), pro každý feed vezme `metadata.total_amount`
  (`per_page=1`; součet celého feedu, ověřeno na ukázkovém feedu) a vrátí jen
  `{ amounts: { <_key školy>: částka } }`. Odpověď cachuje 5 min (Cache API,
  per datacentrum) → zátěž Sanity i Darujme nezávisí na návštěvnosti.
- **Web:** částky stáhne při buildu (poslední známá hodnota v HTML) a po načtení
  stránky je obnoví z Workeru. Když Worker selže, zůstane hodnota z buildu; když
  částku neznáme vůbec, řádek „Zatiaľ ste spolu darovali“ se nezobrazí.
- **Cíl z API nejde:** veřejné API ho nevrací; `donationTarget` je jen
  v neveřejném API (klíč + podpis), proto zůstává pole „Potrebujeme (€)“.

## Co zbývá (TODO)

- `pnpm install` (aktualizuje `pnpm-lock.yaml` o `apps/donations`).
- Sanity token (Viewer) → `wrangler secret put SANITY_READ_TOKEN`, pak
  `pnpm --filter donations run deploy`.
- GitHub repo variable `NEXT_PUBLIC_DONATIONS_API_URL` = URL Workeru.
- **Nasadit Studio** (`sanity deploy`), vyplnit „Potrebujeme (€)“ u škol a
  v „Darujme.sk feedy“ přiřadit školám ID feedů.
- Případně rozhodnout barvu pilulky (accent vs. `#3f44a7` z Figmy).
- Později případně vlastní doména Workeru (např. `api.muzeumhodnot.sk`).

## Ověření

- `tsc` web, Studio i Worker prošly; `wrangler deploy --dry-run` prošel.
- Logika Workeru otestována v Node (mock Sanity + cache, reálné Darujme):
  existující feed → částka, neexistující feed vynechán, neplatné UUID
  odfiltrováno, druhé volání z cache bez dotazů na Sanity/Darujme.
- `next build` po napojení Workeru jsem nespouštěl — ověř lokálně.
- Vizuální kontrolu proti Figmě (včetně šířky 320 px) je potřeba udělat ručně.
