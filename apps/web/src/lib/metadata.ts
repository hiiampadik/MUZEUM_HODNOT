import type { Metadata } from 'next';
import { siteUrl } from '@/sanity/env';

type PageMetaInput = {
  title?: string;
  description?: string | null;
  image?: string | null;
  /** Path for canonical + og:url, e.g. "/kontakt". */
  path: string;
};

/** Build consistent per-page Metadata (canonical + Open Graph). */
export function pageMetadata({ title, description, image, path }: PageMetaInput): Metadata {
  const url = new URL(path, siteUrl).toString();
  const desc = description || undefined;
  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: 'Múzeum hodnôt',
      locale: 'sk_SK',
      title,
      description: desc,
      url,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
  };
}
