/** Central place for all route paths + section accents (provisional colors). */

export const routes = {
  home: '/',
  contact: '/kontakt',
  methodicalMaterials: '/metodicke-materialy',
  aboutPlatform: '/o-platforme',
  valueGenerator: '/generator-hodnot',
  exhibition: (slug: string) => `/vystava/${slug}`,
} as const;

/**
 * Per-section accent colors, from the Figma palette.
 * Applied via inline `--accent` on the page/section wrapper (drives title
 * underline + button color).
 */
export const accents = {
  home: '#3657ff', // blue — project intro bubble
  exhibition: '#66a755', // green — exhibitions
  contact: '#a77d3f', // gold
  methodicalMaterials: '#fe81ee', // pink — "Metodické materiály"
  aboutPlatform: '#fe81ee', // pink — "O platforme"
  valueGenerator: '#c575e0', // purple — "Generátor hodnôt"
} as const;

/** Accent palette for cycling per-item colors (e.g. exhibition cards). */
export const accentPalette = [
  '#66a755',
  '#3657ff',
  '#c575e0',
  '#a77d3f',
  '#ffb6ed',
  '#c1be66',
  '#399135',
] as const;
