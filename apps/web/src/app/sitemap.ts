import type { MetadataRoute } from 'next';
import { client } from '@/sanity/lib/client';
import { EXHIBITION_SITEMAP_QUERY } from '@/sanity/queries';
import { pageUrl } from '@/lib/url';
import { routes } from '@/lib/routes';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: pageUrl(routes.home), lastModified: now, priority: 1 },
    { url: pageUrl(routes.contact), lastModified: now, priority: 0.7 },
    {
      url: pageUrl(routes.methodicalMaterials),
      lastModified: now,
      priority: 0.7,
    },
    {
      url: pageUrl(routes.valueGenerator),
      lastModified: now,
      priority: 0.7,
    },
    {
      url: pageUrl(routes.aboutPlatform),
      lastModified: now,
      priority: 0.6,
    },
  ];

  let exhibitionEntries: MetadataRoute.Sitemap = [];
  try {
    const items = await client.fetch(EXHIBITION_SITEMAP_QUERY);
    exhibitionEntries = items
      .filter((i): i is { slug: string; _updatedAt: string } => Boolean(i.slug))
      .map((i) => ({
        url: pageUrl(routes.exhibition(i.slug)),
        lastModified: i._updatedAt ? new Date(i._updatedAt) : now,
        priority: 0.6,
      }));
  } catch (error) {
    console.error('Sitemap: exhibitions fetch failed', error);
  }

  return [...staticEntries, ...exhibitionEntries];
}
