/** Central place for all route paths + section accents (provisional colors). */

export const routes = {
  home: '/',
  contact: '/kontakt',
  experientialEducation: '/zazitkove-vzdelavanie',
  valueGenerator: '/generator-hodnot',
  exhibition: (slug: string) => `/vystava/${slug}`,
} as const;

/**
 * Per-section accent colors. Provisional — final values come from the Figma.
 * Applied via inline `--accent` on the page/section wrapper.
 */
export const accents = {
  home: '#1f6feb',
  exhibition: '#c2410c',
  contact: '#0f766e',
  experientialEducation: '#7c3aed',
  valueGenerator: '#b91c1c',
} as const;
