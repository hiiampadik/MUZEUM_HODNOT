import type { Metadata } from 'next';
import { siteUrl } from '@/sanity/env';
import { site } from '@/lib/strings';

type PageMetaInput = {
  title?: string;
  description?: string | null;
  image?: string | null;
  /** Path for canonical + og:url, e.g. "/kontakt". */
  path: string;
  /** Optional author name (used in article-type pages). */
  author?: string;
  /** Optional publish/modification date (ISO 8601). */
  publishedTime?: string;
  modifiedTime?: string;
};

/** Build consistent per-page Metadata (canonical + Open Graph + Twitter). */
export function pageMetadata({
  title,
  description,
  image,
  path,
  author,
  publishedTime,
  modifiedTime,
}: PageMetaInput): Metadata {
  const url = new URL(path, siteUrl).toString();
  const desc = description || undefined;

  const metadata: Metadata = {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: 'sk_SK',
      title,
      description: desc,
      url,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title || site.name,
              type: 'image/jpeg',
            },
          ]
        : undefined,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: image ? [image] : undefined,
    },
  };

  return metadata;
}
