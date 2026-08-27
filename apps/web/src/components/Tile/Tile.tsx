import type { ReactNode } from 'react';
import { Link } from '../Link/Link';
import { SanityImage, type SanityImageValue } from '../SanityImage/SanityImage';
import { Title } from '../Typography/Typography';
import styles from './Tile.module.css';

type TileProps = {
  title: string;
  href?: string;
  image?: SanityImageValue;
  children?: ReactNode;
  className?: string;
};

/** Reusable content tile. Becomes a link when `href` is provided. */
export function Tile({ title, href, image, children, className }: TileProps) {
  const inner = (
    <>
      {image?.asset?._id && (
        <div className={styles.media}>
          <SanityImage value={image} width={600} sizes="(max-width: 768px) 100vw, 400px" />
        </div>
      )}
      <div className={styles.body}>
        <Title as="h3">{title}</Title>
        {children}
      </div>
    </>
  );

  const classNames = [styles.tile, className].filter(Boolean).join(' ');

  if (href) {
    return (
      <Link href={href} className={classNames}>
        {inner}
      </Link>
    );
  }
  return <div className={classNames}>{inner}</div>;
}
