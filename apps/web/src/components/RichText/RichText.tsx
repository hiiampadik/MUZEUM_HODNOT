import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { Link } from '../Link/Link';
import { siteUrl } from '@/sanity/env';
import styles from './RichText.module.css';

const siteHostname = new URL(siteUrl).hostname;

/** Rewrites absolute links pointing at our own domain to relative routes, so they render as internal `Link`s instead of opening a new tab. */
function toInternalHref(href: string): string {
  try {
    const url = new URL(href, siteUrl);
    if (url.hostname !== siteHostname) return href;
    return `${url.pathname}${url.search}${url.hash}` || '/';
  } catch {
    return href;
  }
}

const components: PortableTextComponents = {
  marks: {
    link: ({ children, value }) => (
      <Link href={toInternalHref((value as { href: string })?.href ?? '#')}>{children}</Link>
    ),
    underline: ({ children }) => <u>{children}</u>,
  },
};

type RichTextProps = {
  // Accepts the generated Portable Text array shapes from any query.
  value?: readonly unknown[] | null;
  className?: string;
};

/** Renders richTextBasic / richTextFull portable text with shared styling. */
export function RichText({ value, className }: RichTextProps) {
  if (!value || value.length === 0) return null;
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <PortableText value={value as PortableTextBlock[]} components={components} />
    </div>
  );
}
