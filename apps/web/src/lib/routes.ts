/** Central place for all route paths + section accents (provisional colors). */

export const routes = {
  home: '/',
  contact: '/kontakt',
  experientialEducation: '/zazitkove-vzdelavanie',
  valueGenerator: '/generator-hodnot',
  exhibition: (slug: string) => `/vystava/${slug}`,
} as const;

/**
 * Per-section accent colors, from the Figma palette.
 * Applied via inline `--accent` on the page/section wrapper (drives title
 * underline + button color).
 */
export const accents = {
  home: '#5594b4', // blue — project intro bubble
  exhibition: '#66a755', // green — exhibitions
  contact: '#a77d3f', // gold
  experientialEducation: '#a77d3f', // gold — "Zážitkové vzdelávanie"
  valueGenerator: '#c575e0', // purple — "Generátor hodnôt"
} as const;

/** Accent palette for cycling per-item colors (e.g. exhibition cards). */
export const accentPalette = [
  '#66a755',
  '#5594b4',
  '#c575e0',
  '#a77d3f',
  '#ffb6ed',
  '#c1be66',
  '#399135',
] as const;
