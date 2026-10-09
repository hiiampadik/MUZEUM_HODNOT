/**
 * Schema.org structured data builders (rendered via the `JsonLd` component).
 * Used for rich snippets and Knowledge Graph support.
 */

import { siteUrl } from '@/sanity/env';
import { site, common } from '@/lib/strings';
import { routes } from '@/lib/routes';
import { pageUrl } from '@/lib/url';

const context = 'https://schema.org';

/** The organisation itself; referenced as organizer/publisher elsewhere. */
function organization() {
  return {
    '@type': 'Organization' as const,
    name: site.name,
    url: pageUrl(routes.home),
  };
}

/** Organization (homepage): logo + social profiles. */
export function organizationSchema({ sameAs }: { sameAs: string[] }) {
  return {
    '@context': context,
    ...organization(),
    logo: new URL('/icon.png', siteUrl).toString(),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

/** WebSite (homepage). */
export function webSiteSchema({ description, image }: { description: string; image: string }) {
  return {
    '@context': context,
    '@type': 'WebSite',
    name: site.name,
    url: pageUrl(routes.home),
    inLanguage: 'sk',
    description,
    image,
  };
}

/** ContactPage with the organisation's contact details as its main entity. */
export function contactPageSchema({
  name,
  path,
  phone,
  email,
}: {
  name: string;
  path: string;
  phone?: string | null;
  email?: string | null;
}) {
  const contact = {
    ...(phone && { telephone: phone }),
    ...(email && { email }),
  };
  const hasContact = Object.keys(contact).length > 0;

  return {
    '@context': context,
    '@type': 'ContactPage',
    name,
    url: pageUrl(path),
    mainEntity: {
      ...organization(),
      ...contact,
      ...(hasContact && {
        contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', ...contact },
      }),
    },
  };
}

type ExhibitionPhoto = { url: string; caption?: string | null; photographer?: string | null };

/**
 * ExhibitionEvent for an exhibition detail page. Returns null without a start
 * date — Google treats an Event without `startDate` as invalid.
 */
export function exhibitionEventSchema({
  title,
  path,
  locale,
  description,
  cover,
  photos,
  startDate,
  endDate,
  place,
}: {
  title: string;
  path: string;
  locale: string;
  description?: string | null;
  cover?: string | null;
  photos: ExhibitionPhoto[];
  startDate?: string | null;
  endDate?: string | null;
  place?: string | null;
}) {
  if (!startDate) return null;

  const images = [
    ...(cover ? [cover] : []),
    ...photos.map((photo) => ({
      '@type': 'ImageObject',
      contentUrl: photo.url,
      ...(photo.caption && { caption: photo.caption }),
      ...(photo.photographer && { creator: { '@type': 'Person', name: photo.photographer } }),
    })),
  ];

  return {
    '@context': context,
    '@type': 'ExhibitionEvent',
    name: title,
    url: pageUrl(path),
    inLanguage: locale,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    startDate,
    ...(endDate && { endDate }),
    ...(description && { description }),
    ...(images.length > 0 && { image: images }),
    // The CMS only stores the venue name (exhibitions run in Slovakia and
    // abroad), so the venue doubles as a free-text address.
    ...(place && { location: { '@type': 'Place', name: place, address: place } }),
    organizer: organization(),
  };
}

/** BreadcrumbList: Home › current page. */
export function breadcrumbSchema({
  name,
  path,
  homeLabel = common.breadcrumbHome,
}: {
  name: string;
  path: string;
  homeLabel?: string;
}) {
  return {
    '@context': context,
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: homeLabel, item: pageUrl(routes.home) },
      { '@type': 'ListItem', position: 2, name, item: pageUrl(path) },
    ],
  };
}
