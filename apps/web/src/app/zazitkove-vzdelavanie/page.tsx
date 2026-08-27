import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { EXPERIENTIAL_EDUCATION_QUERY } from '@/sanity/queries';
import { Container } from '@/components/Container/Container';
import { CoverImage } from '@/components/CoverImage/CoverImage';
import { PageBuilder } from '@/components/pagebuilder/PageBuilder';
import { Heading } from '@/components/Typography/Typography';
import { accents, routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/metadata';
import { ogImageUrl } from '@/sanity/lib/og';

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(EXPERIENTIAL_EDUCATION_QUERY);
  return pageMetadata({
    title: 'Zážitkové vzdelávanie',
    image: ogImageUrl(page?.cover),
    path: routes.experientialEducation,
  });
}

export default async function ExperientialEducationPage() {
  const page = await client.fetch(EXPERIENTIAL_EDUCATION_QUERY);

  return (
    <main style={{ '--accent': accents.experientialEducation } as CSSProperties}>
      {page?.cover && <CoverImage value={page.cover} placement="top" priority />}

      <Container width="narrow">
        <Heading>Zážitkové vzdelávanie</Heading>
        <PageBuilder content={page?.content} />
      </Container>

      {page?.cover && <CoverImage value={page.cover} placement="bottom" />}
    </main>
  );
}
