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
  home: '#ea6f47',
  exhibition: '#3C7D5D',
  // contact: '#D2EC57',
  contact: '#ea6f47',
  aboutPlatform: '#ea6f47',
  methodicalMaterials: '#ec78b3',
  valueGenerator: '#A964D9',
} as const;

