/**
 * UI strings (not CMS content).
 *
 * The site is single-language Slovak. The one exception: an exhibition can be
 * flagged as `foreignLanguage` in the CMS, in which case the UI on that
 * exhibition's detail page is rendered in English. Navigation and footer always
 * stay Slovak, so only the exhibition-detail strings need both locales.
 */

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
    contributors: 'Ďalej sa podieľali',
  },
  en: {
    fallbackTitle: 'Exhibition',
    current: 'Now on view',
    duration: 'Exhibition dates',
    opening: 'Opening',
    materials: 'Materials',
    fileFallback: 'File',
    links: 'Links',
    contributors: 'Also contributed',
  },
} satisfies Record<Locale, Record<string, string>>;

export type ExhibitionStrings = (typeof exhibitionStrings)['sk'];

/** Resolve the exhibition-detail strings for the given locale. */
export function getExhibitionStrings(locale: Locale): ExhibitionStrings {
  return exhibitionStrings[locale];
}
