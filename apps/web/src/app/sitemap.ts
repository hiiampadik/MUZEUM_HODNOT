import type { MetadataRoute } from 'next';
import { client } from '@/sanity/lib/client';
import { EXHIBITION_SITEMAP_QUERY } from '@/sanity/queries';
import { siteUrl } from '@/sanity/env';
import { routes } from '@/lib/routes';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: new URL(routes.home, siteUrl).toString(), lastModified: now, priority: 1 },
    { url: new URL(routes.contact, siteUrl).toString(), lastModified: now, priority: 0.7 },
    {
      url: new URL(routes.experientialEducation, siteUrl).toString(),
      lastModified: now,
      priority: 0.7,
    },
    {
      url: new URL(routes.valueGenerator, siteUrl).toString(),
      lastModified: now,
      priority: 0.7,
    },
  ];

  let exhibitionEntries: MetadataRoute.Sitemap = [];
  try {
    const items = await client.fetch(EXHIBITION_SITEMAP_QUERY);
    exhibitionEntries = items
      .filter((i): i is { slug: string; _updatedAt: string } => Boolean(i.slug))
      .map((i) => ({
        url: new URL(routes.exhibition(i.slug), siteUrl).toString(),
        lastModified: i._updatedAt ? new Date(i._updatedAt) : now,
        priority: 0.6,
      }));
  } catch (error) {
    console.error('Sitemap: exhibitions fetch failed', error);
  }

  return [...staticEntries, ...exhibitionEntries];
}
