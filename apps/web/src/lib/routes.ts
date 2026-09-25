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
  // home: '#3657ff',
  home: '#d89327',
  exhibition: '#66a755',
  contact: '#d89327',
  aboutPlatform: '#d89327',
  methodicalMaterials: '#ff67ee',
  valueGenerator: '#db62ff',
} as const;

/** Accent palette for cycling per-item colors (e.g. exhibition cards). */
export const accentPalette = [
  '#66a755',
  '#3657ff',
  '#c575e0',
  '#d89327',
] as const;
