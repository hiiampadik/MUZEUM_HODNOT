# Seznam škol pod mapou (Generátor hodnôt)

Branch `feat/school-list`. Design: Figma `Muzeum-Hodnot`, node `743:386`.

## Co se změnilo

Na stránce `/generator-hodnot` se pod mapou zobrazuje soupis všech škol — ale jen
když je mapa vidět (`showMap` není vypnuté a existuje aspoň jeden bod).

Každá škola = jeden **bod na mapě** (`mapPoints` v singletonu `valueGenerator`).
Řádek školy obsahuje:

- **název** (`title`) s podtržením v barvě accentu,
- **„Zatiaľ ste spolu darovali“** — darovaná částka,
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

## Co zbývá (TODO)

- **Darované částky z API.** Zatím neumíme — `donatedFor()` v `SchoolList.tsx`
  vrací vždy `0`, proto se progress bar zatím nikdy nezobrazí. Po napojení API
  stačí upravit tuto funkci (data se tahají při buildu, aktualizace = rebuild).
- **Nasadit Studio** (`sanity deploy`), aby se pole „Potrebujeme (€)“ objevilo
  editorům, a vyplnit cíle u jednotlivých škol.
- Případně rozhodnout barvu pilulky (accent vs. `#3f44a7` z Figmy).

## Ověření

- `next build` (clean, bez `.next`) prošel.
- Vizuální kontrolu proti Figmě (včetně šířky 320 px) je potřeba udělat ručně.
  Pro náhled progress baru lze dočasně upravit `donatedFor()` a `goal`.
