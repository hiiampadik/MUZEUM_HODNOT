import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from '../Link/Link';
import hover from '../shared/emojiHover.module.css';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary';

type CommonProps = {
  children: ReactNode;
  /** Leading emoji/icon; fades out on hover while the label recenters. */
  emoji?: ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

/** Reusable button. Renders an <a> when `href` is set, otherwise a <button>. */
export function Button(props: ButtonProps) {
  const { children, emoji, variant = 'primary', className } = props;
  const classNames = [
    styles.button,
    styles[variant],
    emoji != null && hover.wrap,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {emoji != null && (
        <span aria-hidden="true" className={hover.emoji}>
          {emoji}
        </span>
      )}
      <span className={hover.label}>{children}</span>
    </>
  );

  if ('href' in props && props.href !== undefined) {
    return (
      <Link href={props.href} className={classNames}>
        {content}
      </Link>
    );
  }

  const {
    children: _children,
    emoji: _emoji,
    variant: _variant,
    className: _className,
    ...rest
  } = props as ButtonAsButton;
  return (
    <button className={classNames} {...rest}>
      {content}
    </button>
  );
}
