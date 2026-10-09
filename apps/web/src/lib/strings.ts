/**
 * UI strings (not CMS content).
 *
 * The site is single-language Slovak. The one exception: an exhibition can be
 * flagged as `foreignLanguage` in the CMS, in which case the UI on that
 * exhibition's detail page is rendered in English. Navigation and footer always
 * stay Slovak, so only the exhibition-detail strings need both locales
 * (see `exhibitionStrings` at the bottom of this file).
 *
 * Everything else — nav, footer, home, page headings, metadata — is Slovak-only
 * and grouped below by area. Import these instead of hardcoding copy in JSX.
 */

/** Site-wide brand + metadata. */
export const site = {
  /** Brand / organisation name. */
  name: 'Múzeum hodnôt',
  /** Per-page <title> template; `%s` is the page title. */
  titleTemplate: '%s — Múzeum hodnôt',
  /** Site-wide meta description. */
  description: 'Múzeum hodnôt — výstavy a vzdelávacie podklady pre školy.',
  /** Skip-to-content accessibility link. */
  skipToContent: 'Preskočiť na obsah',
} as const;

/** Main navigation. */
export const nav = {
  ariaLabel: 'Hlavná navigácia',
  homeAriaLabel: 'Domov',
  /** Home logo abbreviation. */
  brandAbbr: 'MH',
  /** Full brand name (nav brand pill; uppercased via CSS). */
  brandName: 'Múzeum hodnôt',
  contact: 'Kontakt',
  valueGenerator: 'Generátor hodnôt',
  methodicalMaterials: 'Metodické materiály',
  aboutPlatform: 'O platforme',
  /** Fallback label for the donate pill when the CMS label is missing. */
  donateFallback: 'Darovať',
  /** Mobile menu trigger + overlay controls. */
  menu: 'Menu',
  menuOpenAriaLabel: 'Otvoriť menu',
  menuClose: 'Zavrieť menu',
} as const;

/** Footer column headings. */
export const footer = {
  contact: 'Kontakt',
  /** Administrative-info column heading (organisation name; intentional capital H). */
  administrative: 'Múzeum hodnôt',
  partners: 'Partneri výstav Múzeum hodnôt',
  valuesPartners: 'Partneri programu Generátor hodnôt',
  social: 'Sledujte nás!',
  /** Credit line; the name links out to the designer/developer's site. */
  creditLead: 'Design & vývoj webu:',
  creditName: 'Bronislav Musil',
  creditUrl: 'https://bronislavmusil.com/',
} as const;

/** Homepage copy. */
export const home = {
  currentExhibitions: 'Aktuálne výstavy',
  showMore: 'Zistiť viac',
  /** Hero-tile eyebrow, split so a line break can go between the two parts. */
  forSchoolsLead: 'Zážitkové vzdelávanie',
  forSchoolsSuffix: 'pre školy',
  /**
   * Value-generator tile title. Only the lead is underlined; the suffix stays
   * plain (see the hero tiles on the homepage).
   */
  valueGeneratorLead: 'Generátor hodnôt',
  forTeachersLead: 'Zážitkové vzdelávanie',
  forTeachersSuffix: 'pre učiteľov',
  methodicalMaterialsTitle: 'Metodické materiály',
  upcoming: 'Pripravované výstavy',
  past: 'Minulé výstavy',
  /**
   * Project-intro heading (moved out of the CMS). Only the lead is underlined;
   * note the intentional capital H, matching the footer's brand heading.
   */
  /** Fixed bottom pill that scrolls to the intro bubble section. */
} as const;

/** Page metadata titles + <h1>/heading copy. */
export const pages = {
  contact: 'Kontakt',
  valueGenerator: 'Generátor hodnôt',
  methodicalMaterials: 'Metodické materiály',
  aboutPlatform: 'O platforme',
} as const;

/** School list under the value-generator map. */
export const schoolList = {
  title: 'Školy',
  donated: 'Zatiaľ ste spolu darovali',
  goal: 'Potrebujeme',
  joinOn: 'Zapojte sa na',
  /** Progress bar aria-label. */
  progress: 'Priebeh zbierky',
} as const;

/** Contact page field labels. */
export const contact = {
  phone: 'Telefón',
  email: 'E-mail',
} as const;

/** Small shared strings reused across components. */
export const common = {
  /** Fallback title for a downloadable file with no title. */
  fileFallback: 'Súbor',
  /** Fallback label for a map-popup link. */
  moreLink: 'Viac',
  /** ValueMap container aria-label. */
  mapAriaLabel: 'Mapa bodov',
  /** ValueMap popover close button label. */
  mapClose: 'Zavrieť',
  /** "Active exhibition" tag. */
  currentTag: 'Aktuálne',
  /** First item of the structured-data breadcrumb. */
  breadcrumbHome: 'Domov',
} as const;

export type Locale = 'sk' | 'en';

/** Strings used on the exhibition detail page. */
export const exhibitionStrings = {
  sk: {
    fallbackTitle: 'Výstava',
    current: 'Aktuálne',
    duration: 'Trvanie výstavy',
    opening: 'Vernisáž',
    materials: 'Materiály',
    fileFallback: 'Súbor',
    links: 'Odkazy',
    exhibitingAuthors: 'Vystavujúci autori',
    contributors: 'Tím',
    breadcrumbHome: 'Domov',
  },
  en: {
    fallbackTitle: 'Exhibition',
    current: 'Now on view',
    duration: 'Exhibition dates',
    opening: 'Opening',
    materials: 'Materials',
    fileFallback: 'File',
    links: 'Links',
    exhibitingAuthors: 'Exhibiting authors',
    contributors: 'Team',
    breadcrumbHome: 'Home',
  },
} satisfies Record<Locale, Record<string, string>>;

export type ExhibitionStrings = (typeof exhibitionStrings)['sk'];

/** Resolve the exhibition-detail strings for the given locale. */
export function getExhibitionStrings(locale: Locale): ExhibitionStrings {
  return exhibitionStrings[locale];
}
