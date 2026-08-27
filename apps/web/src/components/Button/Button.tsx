import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from '../Link/Link';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary';

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

/** Reusable button. Renders an <a> when `href` is set, otherwise a <button>. */
export function Button(props: ButtonProps) {
  const { children, variant = 'primary', className } = props;
  const classNames = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  if ('href' in props && props.href !== undefined) {
    return (
      <Link href={props.href} className={classNames}>
        {children}
      </Link>
    );
  }

  const { variant: _variant, className: _className, ...rest } =
    props as ButtonAsButton;
  return (
    <button className={classNames} {...rest}>
      {children}
    </button>
  );
}
