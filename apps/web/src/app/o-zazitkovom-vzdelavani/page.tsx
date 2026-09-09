import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { ABOUT_EXPERIENTIAL_EDUCATION_QUERY } from '@/sanity/queries';
import { Container } from '@/components/Container/Container';
import { CoverImage } from '@/components/CoverImage/CoverImage';
import { PageBuilder } from '@/components/pagebuilder/PageBuilder';
import { Heading } from '@/components/Typography/Typography';
import { accents, routes } from '@/lib/routes';
import { pageMetadata } from '@/lib/metadata';
import { pages } from '@/lib/strings';
import { ogImageUrl } from '@/sanity/lib/og';
import builder from '@/components/pagebuilder/builderPage.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(ABOUT_EXPERIENTIAL_EDUCATION_QUERY);
  return pageMetadata({
    title: pages.aboutExperientialEducation,
    image: ogImageUrl(page?.cover),
    path: routes.aboutExperientialEducation,
  });
}

export default async function AboutExperientialEducationPage() {
  const page = await client.fetch(ABOUT_EXPERIENTIAL_EDUCATION_QUERY);

  return (
    <main className="page-main" style={{ '--accent': accents.aboutExperientialEducation } as CSSProperties}>
      {page?.topCover && (
        <CoverImage value={page.topCover} placement="top" priority background className="cover-bg-top" />
      )}

      <Container width="narrow">
        <Heading className={builder.title}>{pages.aboutExperientialEducation}</Heading>
        <PageBuilder content={page?.content} />
      </Container>

      {page?.bottomCover && (
        <CoverImage value={page.bottomCover} placement="bottom" background className="cover-bg-bottom" />
      )}
    </main>
  );
}
