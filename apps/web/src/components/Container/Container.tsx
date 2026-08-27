import type { ElementType, ReactNode } from 'react';
import styles from './Container.module.css';

type Width = 'full' | 'content' | 'narrow';

type ContainerProps = {
  children: ReactNode;
  /** Layout width. Defaults to the 1200px content width. */
  width?: Width;
  as?: ElementType;
  className?: string;
};

/**
 * Constrains content to one of the three layout widths (see CLAUDE.md).
 * full = full-bleed + padding · content = max 1200px · narrow = max 600px.
 */
export function Container({
  children,
  width = 'content',
  as: Tag = 'div',
  className,
}: ContainerProps) {
  const classNames = [styles.container, styles[width], className]
    .filter(Boolean)
    .join(' ');
  return <Tag className={classNames}>{children}</Tag>;
}
