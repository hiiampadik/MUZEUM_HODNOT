import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { client } from '@/sanity/lib/client';
import { SETTINGS_QUERY, CONTACT_QUERY } from '@/sanity/queries';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { siteUrl } from '@/sanity/env';
import { site } from '@/lib/strings';

const description = site.description;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.name,
    template: site.titleTemplate,
  },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'sk_SK',
    title: site.name,
    description,
    url: siteUrl,
  },
  twitter: { card: 'summary_large_image' },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, contact] = await Promise.all([
    client.fetch(SETTINGS_QUERY),
    client.fetch(CONTACT_QUERY),
  ]);

  return (
    <html lang="sk" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          {site.skipToContent}
        </a>
        <Nav donateLink={settings?.donateLink} />
        <div id="main" tabIndex={-1}>
          {children}
        </div>
        <Footer settings={settings} contact={contact} />
      </body>
    </html>
  );
}
