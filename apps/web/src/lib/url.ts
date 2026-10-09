import { siteUrl } from '@/sanity/env';

/**
 * Absolute URL of a page route, with the trailing slash the static export
 * serves (`trailingSlash: true`). Matches the canonical, so sitemap and JSON-LD
 * never point at a URL that GitHub Pages redirects.
 */
export function pageUrl(path: string): string {
  return new URL(path.endsWith('/') ? path : `${path}/`, siteUrl).toString();
}
