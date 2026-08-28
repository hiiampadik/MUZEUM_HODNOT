import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  ReactNode,
} from 'react';
import { Link } from '../Link/Link';
import hover from '../shared/emojiHover.module.css';
import styles from './Pill.module.css';

type Variant = 'solid' | 'surface';
type Size = 'md' | 'lg';

type CommonProps = {
  children: ReactNode;
  /** Leading emoji/icon, rendered decoratively (aria-hidden). */
  emoji?: ReactNode;
  /** Background color for the solid variant. */
  color?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  style?: CSSProperties;
};

type PillAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type PillAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

type PillProps = PillAsButton | PillAsLink;

/**
 * Reusable pill. Renders an <a> (via Link) when `href` is set, otherwise a
 * <button>. Set the fill via `color`, a leading icon via `emoji`, and switch to
 * the nav size with `size="lg"`.
 */
export function Pill(props: PillProps) {
  const {
    children,
    emoji,
    color,
    variant = 'solid',
    size = 'md',
    className,
    style,
  } = props;

  const classNames = [
    styles.pill,
    styles[variant],
    size === 'lg' && styles.lg,
    emoji != null && hover.wrap,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const mergedStyle = color
    ? ({ ...style, '--pill-bg': color } as CSSProperties)
    : style;

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
    const {
      children: _children,
      emoji: _emoji,
      color: _color,
      variant: _variant,
      size: _size,
      className: _className,
      style: _style,
      href,
      ...rest
    } = props;
    return (
      <Link href={href} className={classNames} style={mergedStyle} {...rest}>
        {content}
      </Link>
    );
  }

  const {
    children: _children,
    emoji: _emoji,
    color: _color,
    variant: _variant,
    size: _size,
    className: _className,
    style: _style,
    ...rest
  } = props as PillAsButton;
  return (
    <button className={classNames} style={mergedStyle} {...rest}>
      {content}
    </button>
  );
}
