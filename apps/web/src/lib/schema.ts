/**
 * Schema.org structured data generators.
 * Used for rich snippets and Knowledge Graph support.
 */

import { siteUrl } from '@/sanity/env';
import { site } from '@/lib/strings';

/** JSON-LD compatible schema objects */
type SchemaWithContext<T> = T & {
  '@context': 'https://schema.org';
};

/** Organization schema */
export interface OrganizationSchema {
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    telephone?: string;
    email?: string;
  };
}

/** Event/Exhibition schema */
export interface EventSchema {
  '@type': 'Event';
  name: string;
  url?: string;
  description?: string;
  image?: string | string[];
  startDate?: string;
  endDate?: string;
  location?: {
    '@type': 'Place';
    name: string;
    address?: {
      '@type': 'PostalAddress';
      addressLocality?: string;
      addressCountry: string;
    };
  };
  organizer?: {
    '@type': 'Organization';
    name: string;
    url?: string;
  };
}

/** WebPage schema */
export interface WebPageSchema {
  '@type': 'WebPage';
  name?: string;
  description?: string;
  image?: string | string[];
  url?: string;
  datePublished?: string;
  dateModified?: string;
  mainEntity?: unknown;
  breadcrumb?: {
    '@type': 'BreadcrumbList';
    itemListElement: Array<{
      '@type': 'ListItem';
      position: number;
      name: string;
      item?: string;
    }>;
  };
}

/** Generate Organization schema */
export function generateOrganizationSchema(
  contactPhone?: string,
  contactEmail?: string,
  socialLinks?: string[],
  logoUrl?: string,
): SchemaWithContext<OrganizationSchema> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: siteUrl,
    ...(logoUrl && { logo: logoUrl }),
    ...(socialLinks && socialLinks.length > 0 && { sameAs: socialLinks }),
    ...(contactPhone || contactEmail) && {
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        ...(contactPhone && { telephone: contactPhone }),
        ...(contactEmail && { email: contactEmail }),
      },
    },
  };
}

/** Generate Event schema for exhibitions */
export function generateEventSchema(exhibition: {
  title: string;
  slug?: string;
  description?: string;
  image?: string | string[];
  startDate?: string;
  endDate?: string;
  place?: string;
  location?: string;
}): SchemaWithContext<EventSchema> {
  const images = Array.isArray(exhibition.image)
    ? exhibition.image
    : exhibition.image
      ? [exhibition.image]
      : undefined;

  const url = exhibition.slug
    ? new URL(`/vystava/${exhibition.slug}`, siteUrl).toString()
    : undefined;

  const location = exhibition.place || exhibition.location;

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: exhibition.title,
    ...(url && { url }),
    ...(exhibition.description && { description: exhibition.description }),
    ...(images && { image: images }),
    ...(exhibition.startDate && { startDate: exhibition.startDate }),
    ...(exhibition.endDate && { endDate: exhibition.endDate }),
    ...(location && {
      location: {
        '@type': 'Place',
        name: location,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'SK',
        },
      },
    }),
    organizer: {
      '@type': 'Organization',
      name: site.name,
      url: siteUrl,
    },
  };
}

/** Generate WebPage schema */
export function generateWebPageSchema(page: {
  title?: string;
  description?: string;
  images?: string[];
  url?: string;
  datePublished?: string;
  dateModified?: string;
  breadcrumb?: Array<{ name: string; url?: string }>;
}): SchemaWithContext<WebPageSchema> {
  const images = page.images && page.images.length > 0 ? page.images : undefined;
  const url = page.url || siteUrl;

  let breadcrumb = undefined;
  if (page.breadcrumb && page.breadcrumb.length > 0) {
    breadcrumb = {
      '@type': 'BreadcrumbList' as const,
      itemListElement: page.breadcrumb.map((item, index) => ({
        '@type': 'ListItem' as const,
        position: index + 1,
        name: item.name,
        ...(item.url && { item: item.url }),
      })),
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    ...(page.title && { name: page.title }),
    ...(page.description && { description: page.description }),
    ...(images && { image: images }),
    url,
    ...(page.datePublished && { datePublished: page.datePublished }),
    ...(page.dateModified && { dateModified: page.dateModified }),
    ...(breadcrumb && { breadcrumb }),
  };
}

/** Generate schema for image collections (gallery) */
export function generateImageGallerySchema(images: Array<{
  url: string;
  title?: string;
  description?: string;
  photographer?: string;
}>) {
  return images.map((img, index) => ({
    '@context': 'https://schema.org',
    '@type': 'ImageObject' as const,
    url: img.url,
    ...(img.title && { name: img.title }),
    ...(img.description && { description: img.description }),
    ...(img.photographer && {
      author: {
        '@type': 'Person',
        name: img.photographer,
      },
    }),
    position: index + 1,
  }));
}
