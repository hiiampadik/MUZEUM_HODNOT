import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { EXHIBITIONS_QUERY } from '@/sanity/queries';
import { Container } from '@/components/Container/Container';
import { CoverImage } from '@/components/CoverImage/CoverImage';
import { ExhibitionSection } from '@/components/Exhibitions/ExhibitionSection';
import { Heading } from '@/components/Typography/Typography';
import { JsonLd } from '@/components/JsonLd/JsonLd';
import { groupExhibitions } from '@/lib/exhibitions';
import { accents, routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/metadata';
import { revealOrder } from '@/lib/motion';
import { breadcrumbSchema, exhibitionListSchema } from '@/lib/schema';
import { exhibitionList, pages } from '@/lib/strings';
import styles from './exhibitions.module.css';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: pages.exhibitions,
    description: exhibitionList.description,
    path: routes.exhibitions,
  });
}

export default async function ExhibitionsPage() {
  const exhibitions = await client.fetch(EXHIBITIONS_QUERY);
  const { active, upcoming, past } = groupExhibitions(exhibitions);

  const jsonLd = [
    exhibitionListSchema({
      name: pages.exhibitions,
      path: routes.exhibitions,
      description: exhibitionList.description,
      items: [...active, ...upcoming, ...past].flatMap((ex) =>
        ex.canOpenDetail && ex.slug && ex.title
          ? [{ title: ex.title, path: routes.exhibition(ex.slug) }]
          : [],
      ),
    }),
    breadcrumbSchema({ name: pages.exhibitions, path: routes.exhibitions }),
  ];

  return (
    <main className="page-main" style={{ '--accent': accents.exhibition } as CSSProperties}>
      <JsonLd data={jsonLd} />

      {/* No CMS document behind this page: the covers are the shared fallbacks. */}
      <CoverImage placement="top" priority background className="cover-bg-top" />

      <Container>
        <Heading className={`${styles.headerTitle} reveal`} style={revealOrder(1)}>
          {pages.exhibitions}
        </Heading>
      </Container>

      <ExhibitionSection title={exhibitionList.active} exhibitions={active} />
      <ExhibitionSection title={exhibitionList.upcoming} exhibitions={upcoming} layout="mixed" />
      <ExhibitionSection title={exhibitionList.past} exhibitions={past} />

      <CoverImage placement="bottom" background className="cover-bg-bottom" />
    </main>
  );
}
