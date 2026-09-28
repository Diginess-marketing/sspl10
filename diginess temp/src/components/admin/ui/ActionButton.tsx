import { forwardRef, type ButtonHTMLAttributes, type ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'soft' | 'danger' | 'ghost';
  size?: 'md' | 'sm';
  icon?: ComponentType<{ className?: string }>;
  loading?: boolean;
}

// Brand pill button. One `primary` (lime) per screen section; everything else uses another variant.
export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ variant = 'outline', size = 'md', icon: Icon, loading, disabled, children, className = '', type = 'button', ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`admin-btn admin-btn--${variant} ${size === 'sm' ? 'admin-btn--sm' : ''} ${!children ? 'admin-btn--icon' : ''} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  ),
);
ActionButton.displayName = 'ActionButton';
