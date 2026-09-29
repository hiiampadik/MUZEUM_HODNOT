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
 * External links open in a new tab unless `target` says otherwise.
 */
export function Link({ href, children, target, ...rest }: LinkProps) {
  if (isExternal(href)) {
    const resolvedTarget = target ?? '_blank';
    return (
      <a
        href={href}
        target={resolvedTarget}
        rel={resolvedTarget === '_blank' ? 'noopener noreferrer' : undefined}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <NextLink href={href} target={target} {...rest}>
      {children}
    </NextLink>
  );
}
