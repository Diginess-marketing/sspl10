import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase tracking-wide',
  {
    variants: {
      variant: {
        // Status badges with design system colors
        live: 'border-transparent bg-sport-orange text-black hover:bg-sport-orange/90 shadow-sm',
        upcoming: 'border-transparent bg-sport-teal text-white hover:bg-sport-teal/90 shadow-sm',
        completed: 'border-transparent bg-gray-500 text-white hover:bg-gray-600 shadow-sm',

        // Semantic status badges
        success: 'border-transparent bg-success text-success-foreground hover:bg-success/90 shadow-sm',
        warning: 'border-transparent bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm',
        error: 'border-transparent bg-error text-error-foreground hover:bg-error/90 shadow-sm',
        info: 'border-transparent bg-info text-info-foreground hover:bg-info/90 shadow-sm',

        // Default and outline variants
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border-current hover:bg-accent hover:text-accent-foreground',

        // Special animated variants
        'live-animated': 'border-transparent bg-sport-orange text-black shadow-lg animate-pulse-glow',
        'numeric': 'border-transparent bg-sport-blue text-white font-bold min-w-6 h-6 flex items-center justify-center',
      },
      size: {
        xs: 'px-2 py-0.5 text-[0.625rem]',
        sm: 'px-2.5 py-0.5 text-xs',
        default: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
  VariantProps<typeof badgeVariants> {
  /**
   * Show numeric value instead of children content
   */
  count?: number
  /**
   * Maximum count to display before showing "+"
   */
  maxCount?: number
  /**
   * Show dot indicator for notifications
   */
  showDot?: boolean
  /**
   * Enable live animation for live badges
   */
  animated?: boolean
}

function Badge({
  className,
  variant,
  size,
  count,
  maxCount = 99,
  showDot = false,
  animated = false,
  children,
  ...props
}: BadgeProps) {
  // Handle numeric badges
  const displayContent = React.useMemo(() => {
    if (count !== undefined) {
      if (count === 0) return null;
      const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
      return displayCount;
    }
    return children;
  }, [count, maxCount, children]);

  // Determine final variant for animated badges
  const finalVariant = animated && variant === 'live' ? 'live-animated' : variant;

  // Handle dot indicator
  const dotElement = showDot && count === 0 ? (
    <span className="w-2 h-2 bg-current rounded-full mr-1" aria-hidden="true" />
  ) : null;

  return (
    <span
      className={cn(badgeVariants({ variant: finalVariant, size }), className)}
      role={variant?.includes('live') ? 'status' : undefined}
      aria-label={
        variant === 'live' ? 'Live content' :
          variant === 'upcoming' ? 'Upcoming content' :
            variant === 'completed' ? 'Completed content' :
              count !== undefined ? `${count} notifications` :
                undefined
      }
      {...props}
    >
      {dotElement}
      {displayContent}
    </span>
  );
}

// Additional specialized badge components
const LiveBadge = React.forwardRef<HTMLSpanElement, Omit<BadgeProps, 'variant' | 'animated'>>(
  ({ className, ...props }, ref) => (
    <Badge
      variant="live"
      animated
      className={cn('animate-pulse-glow', className)}
      {...props}
    />
  ),
);
LiveBadge.displayName = 'LiveBadge';

const NumericBadge = React.forwardRef<HTMLSpanElement, Omit<BadgeProps, 'variant'> & { count: number }>(
  ({ className, count, ...props }, ref) => (
    <Badge
      variant="numeric"
      count={count}
      className={cn('font-mono', className)}
      {...props}
    />
  ),
);
NumericBadge.displayName = 'NumericBadge';

export { Badge, badgeVariants, LiveBadge, NumericBadge };
