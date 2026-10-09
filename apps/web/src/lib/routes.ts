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
  home: '#ff8359',
  exhibition: '#3b976a',
  // contact: '#D2EC57',
  contact: '#904646',
  aboutPlatform: '#ff8359',
  methodicalMaterials: '#ff93cc',
  // valueGenerator: '#A964D9',
  valueGenerator: '#40a6e6',
} as const;

