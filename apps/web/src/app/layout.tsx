import type { Metadata } from 'next';
import './globals.css';
import { client } from '@/sanity/lib/client';
import { SETTINGS_QUERY, CONTACT_QUERY } from '@/sanity/queries';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Múzeum hodnôt',
    template: '%s — Múzeum hodnôt',
  },
  description: 'Múzeum hodnôt — výstavy a vzdelávacie podklady pre školy.',
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
    <html lang="sk">
      <body>
        <a href="#main" className="sr-only">
          Preskočiť na obsah
        </a>
        <Nav donateLink={settings?.donateLink} />
        <div id="main">{children}</div>
        <Footer settings={settings} contact={contact} />
      </body>
    </html>
  );
}
