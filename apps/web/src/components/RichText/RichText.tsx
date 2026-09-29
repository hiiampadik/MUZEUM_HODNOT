import { Children, type ReactNode } from 'react';
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

/**
 * Splits leading/trailing whitespace off a mark's children so decorations such as
 * the `strong` highlight background don't extend past the visible text.
 */
function trimEdges(children: ReactNode): [string, ReactNode[], string] {
  const nodes = Children.toArray(children);
  let lead = '';
  let trail = '';
  if (typeof nodes[0] === 'string') {
    const match = nodes[0].match(/^\s+/);
    if (match) {
      lead = match[0];
      nodes[0] = nodes[0].slice(lead.length);
    }
  }
  const last = nodes.length - 1;
  if (last >= 0 && typeof nodes[last] === 'string') {
    const match = (nodes[last] as string).match(/\s+$/);
    if (match) {
      trail = match[0];
      nodes[last] = (nodes[last] as string).slice(0, -trail.length);
    }
  }
  return [lead, nodes.filter((node) => node !== ''), trail];
}

const components: PortableTextComponents = {
  marks: {
    link: ({ children, value }) => {
      const { href, newTab } = (value ?? {}) as { href?: string; newTab?: boolean };
      return (
        <Link href={toInternalHref(href ?? '#')} target={newTab ? '_blank' : '_self'}>
          {children}
        </Link>
      );
    },
    underline: ({ children }) => <u>{children}</u>,
    strong: ({ children }) => {
      const [lead, inner, trail] = trimEdges(children);
      return (
        <>
          {lead}
          <strong>{inner}</strong>
          {trail}
        </>
      );
    },
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
