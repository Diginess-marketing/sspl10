import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2, Play, Download, Heart, Star, Settings } from 'lucide-react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-sport uppercase tracking-wider ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sport-orange focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden text-black',
  {
    variants: {
      variant: {
        // New 3-Tier Design System Variants
        primary: 'bg-[linear-gradient(135deg,#00B4D8_0%,#0077B6_100%)] text-white hover:opacity-90 shadow-lg min-h-[44px] rounded-full border-0',
        secondary: 'border-2 border-[#00B4D8] bg-transparent text-white hover:bg-[#00B4D8] shadow-lg min-h-[44px] rounded-full',
        tertiary: 'bg-transparent text-white hover:bg-white/10 min-h-[44px] rounded-full',
        ghost: 'text-white hover:bg-white/10 min-h-[44px] rounded-full',

        // Legacy matching variants (mapped to modern theme)
        sqrBtn: 'bg-[linear-gradient(135deg,#00B4D8_0%,#0077B6_100%)] text-white font-semibold text-lg hover:opacity-90 rounded-full py-2 px-6 min-h-[44px]',
        hrButton: 'bg-[#F5A623] text-[#0A1628] font-medium hover:bg-[#F8C874] rounded-full py-2 px-8 min-h-[44px]',
        loginRegisterB: 'bg-[linear-gradient(135deg,#00B4D8_0%,#0077B6_100%)] text-white font-medium hover:opacity-90 rounded-full py-[2px] px-[12px] min-h-[30px]',

        // Legacy variants (maintained for compatibility)
        default: 'bg-[linear-gradient(135deg,#00B4D8_0%,#0077B6_100%)] text-white hover:opacity-90 shadow-lg min-h-[44px]',
        destructive:
          'bg-linear-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-500 shadow-lg hover:shadow-red-500/50 min-h-[44px]',
        outline:
          'border-2 border-[#00B4D8] bg-transparent text-white hover:bg-[#00B4D8] shadow-lg min-h-[44px]',
        link: 'text-white underline-offset-4 hover:underline min-h-[44px]',
        header: 'bg-white/10 text-white border border-white/20 hover:bg-[#00B4D8] hover:border-transparent backdrop-blur-sm shadow-lg min-h-[44px]',
        hero: 'bg-[linear-gradient(135deg,#00B4D8_0%,#0077B6_100%)] text-white hover:opacity-90 shadow-lg min-h-[44px]',
        success: 'bg-[linear-gradient(135deg,#10B981_0%,#059669_100%)] text-white transition-all duration-300 min-h-[44px]',
        magical: 'bg-[linear-gradient(135deg,#F5A623_0%,#C7851A_100%)] text-[#0A1628] hover:scale-105 shadow-[0_0_15px_rgba(245,166,35,0.5)] transition-all duration-500 animate-pulse-glow min-h-[44px]',
        cyber: 'relative overflow-hidden bg-[#0F1423] text-white font-bold hover:bg-[#1A2D4A] border border-[#00B4D8]/30 min-h-[44px]',
      },
      size: {
        default: 'h-11 px-6 py-3 text-[13px]',
        sm: 'h-10 rounded-md px-4 py-2 text-xs',
        lg: 'h-12 rounded-md px-8 py-4 text-base',
        icon: 'h-11 w-11',
        xl: 'h-14 px-10 py-5 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    // Responsive classes for full-width on mobile
    const responsiveClasses = fullWidth
      ? 'w-full sm:w-auto'
      : '';

    // When using asChild, we need to render only the single child
    // without adding our own wrapper elements
    if (asChild) {
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            responsiveClasses,
            'group', // For enhanced hover effects
          )}
          ref={ref}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          aria-busy={loading}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    // Normal button rendering with all enhancements
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          responsiveClasses,
          'group', // For enhanced hover effects
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}

        {/* Left icon */}
        {!loading && leftIcon && (
          <span className="mr-2 text-inherit" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Button content */}
        <span className={cn(loading ? 'opacity-0' : '', 'text-inherit')} style={{ color: 'inherit' }}>
          {children}
        </span>

        {/* Right icon */}
        {!loading && rightIcon && (
          <span className="ml-2 text-inherit" aria-hidden="true">
            {rightIcon}
          </span>
        )}

        {/* Shine effect overlay */}
        <span
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none"
          aria-hidden="true"
        />
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };

export default Button;
