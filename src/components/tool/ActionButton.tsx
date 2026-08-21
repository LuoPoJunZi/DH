import { LoaderCircle, type LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  busy?: boolean;
}

export function ActionButton({
  icon: Icon,
  variant = 'secondary',
  busy = false,
  children,
  className = '',
  disabled,
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={`button button--${variant} ${className}`}
      type="button"
      disabled={disabled || busy}
      {...props}
    >
      {busy ? (
        <LoaderCircle className="spin" size={16} aria-hidden="true" />
      ) : Icon ? (
        <Icon size={16} aria-hidden="true" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
