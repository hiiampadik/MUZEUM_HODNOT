import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Múzeum hodnôt',
    template: '%s — Múzeum hodnôt',
  },
  description: 'Múzeum hodnôt — výstavy a vzdelávacie podklady pre školy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <body>{children}</body>
    </html>
  );
}
