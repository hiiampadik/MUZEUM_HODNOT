import type { Metadata } from 'next';
import { siteUrl } from '@/sanity/env';
import { site } from '@/lib/strings';
import { pageUrl } from '@/lib/url';

/** Site-wide fallback share image. TODO: replace with a real 1200×630 image. */
export const defaultOgImage = new URL('/icon.png', siteUrl).toString();

type PageMetaInput = {
  title?: string;
  description?: string | null;
  image?: string | null;
  /** Path for canonical + og:url, e.g. "/kontakt". */
  path: string;
};

/** Build consistent per-page Metadata (canonical + Open Graph + Twitter). */
export function pageMetadata({
  title,
  description,
  image,
  path,
}: PageMetaInput): Metadata {
  const url = pageUrl(path);
  // Every key set here replaces the layout's value wholesale, so fall back to
  // the site defaults instead of leaving title/description/image undefined.
  const shareTitle = title || site.name;
  const desc = description || site.description;

  const metadata: Metadata = {
    // `absolute` skips the title template on pages without their own title.
    title: title || { absolute: site.name },
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: 'sk_SK',
      title: shareTitle,
      description: desc,
      url,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: shareTitle,
              type: 'image/jpeg',
            },
          ]
        : [{ url: defaultOgImage, alt: site.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description: desc,
      images: [image || defaultOgImage],
    },
  };

  return metadata;
}
