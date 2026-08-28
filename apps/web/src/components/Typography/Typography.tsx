import type { CSSProperties, ElementType, ReactNode } from 'react';
import styles from './Typography.module.css';

type BaseProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

function cx(...names: (string | false | undefined)[]) {
  return names.filter(Boolean).join(' ');
}

/** Large display heading (CY font). Defaults to <h1>. */
export function Heading({ children, as: Tag = 'h1', className, style }: BaseProps) {
  return (
    <Tag className={cx(styles.heading, className)} style={style}>
      {children}
    </Tag>
  );
}

/** Section title (CY font), with an optional accent underline. Defaults to <h2>. */
export function Title({
  children,
  as: Tag = 'h2',
  className,
  style,
  underline = false,
}: BaseProps & { underline?: boolean }) {
  return (
    <Tag
      className={cx(styles.title, underline && styles.titleUnderline, className)}
      style={style}
    >
      {children}
    </Tag>
  );
}

/**
 * Inline accent underline for part of a Title/Heading — wrap only the words
 * that should carry the underline, leaving the rest of the heading plain.
 */
export function Underline({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cx(styles.titleUnderline, className)}>{children}</span>;
}

/** Monospace label / eyebrow. Defaults to <span>. */
export function Label({ children, as: Tag = 'span', className, style }: BaseProps) {
  return (
    <Tag className={cx(styles.label, className)} style={style}>
      {children}
    </Tag>
  );
}

/** Body text. Defaults to <p>. */
export function Text({ children, as: Tag = 'p', className, style }: BaseProps) {
  return (
    <Tag className={cx(styles.text, className)} style={style}>
      {children}
    </Tag>
  );
}
