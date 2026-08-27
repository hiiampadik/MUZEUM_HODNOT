import type { ElementType, ReactNode } from 'react';
import styles from './Typography.module.css';

type BaseProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

function cx(...names: (string | false | undefined)[]) {
  return names.filter(Boolean).join(' ');
}

/** Large display heading (CY font). Defaults to <h1>. */
export function Heading({ children, as: Tag = 'h1', className }: BaseProps) {
  return <Tag className={cx(styles.heading, className)}>{children}</Tag>;
}

/** Section title (CY font), with an optional accent underline. Defaults to <h2>. */
export function Title({
  children,
  as: Tag = 'h2',
  className,
  underline = false,
}: BaseProps & { underline?: boolean }) {
  return (
    <Tag className={cx(styles.title, underline && styles.titleUnderline, className)}>
      {children}
    </Tag>
  );
}

/** Monospace label / eyebrow. Defaults to <span>. */
export function Label({ children, as: Tag = 'span', className }: BaseProps) {
  return <Tag className={cx(styles.label, className)}>{children}</Tag>;
}

/** Body text. Defaults to <p>. */
export function Text({ children, as: Tag = 'p', className }: BaseProps) {
  return <Tag className={cx(styles.text, className)}>{children}</Tag>;
}
