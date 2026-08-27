import NextLink from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

type LinkProps = {
  href: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

function isExternal(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || /^(mailto|tel):/.test(href);
}

/**
 * Smart link: internal hrefs use next/link, external ones get safe rel/target.
 */
export function Link({ href, children, ...rest }: LinkProps) {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <NextLink href={href} {...rest}>
      {children}
    </NextLink>
  );
}
