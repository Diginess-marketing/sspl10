import * as React from 'react';

import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'fixture' | 'team' | 'news' | 'stats'
  isLoading?: boolean
  clickable?: boolean
  ariaLabel?: string
}

const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, variant = 'default', isLoading = false, clickable = false, ariaLabel, ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      props.onClick?.(event as any);
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div
      ref={ref}
      role="article"
      tabIndex={clickable ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        // Base card styles using design tokens
        'rounded-(--card-border-radius) border bg-card text-card-foreground transition-all duration-300 relative overflow-hidden',
        'shadow-(--card-shadow) hover:shadow-(--card-shadow-hover)',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        {
          // Hover effects
          'hover:transform hover:-translate-y-1 cursor-pointer': clickable && !isLoading,
          'hover:border-primary/20': !isLoading,

          // Loading state
          'opacity-75 pointer-events-none': isLoading,

          // Variant-specific styles
          'border-border bg-background': variant === 'default' || variant === 'news',
          'border-primary/20 bg-white': variant === 'fixture' || variant === 'stats',
          'glass-card': variant === 'team',
        },
        className,
      )}
      {...props}
    />
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-(--card-padding)', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-h4 font-semibold leading-tight tracking-tight text-gray-900',
      { style: { fontFamily: 'var(--font-heading)' } },
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-base leading-relaxed font-body text-gray-600', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-(--card-padding) pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-(--card-padding) pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: '1' | '2' | '3' | '4' | 'stats' | 'fixture' | 'team' | 'news'
  children: React.ReactNode
  gap?: 'sm' | 'md' | 'lg'
}

const CardGrid = React.forwardRef<
  HTMLDivElement,
  CardGridProps
>(({ className, variant = '2', gap = 'md', children, ...props }, ref) => {
  const gapClass = {
    sm: 'gap-(--space-sm)',
    md: 'gap-(--space-md)',
    lg: 'gap-(--space-lg)',
  }[gap];

  return (
    <div
      ref={ref}
      className={cn(
        'grid w-full',
        gapClass,
        {
          // Single column layouts
          'grid-cols-1': variant === '1',

          // Two column layouts
          'grid-cols-1 sm:grid-cols-2': variant === '2',

          // Three column layouts
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': variant === '3',

          // Four column layouts
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4': variant === '4',

          // Stats grid (optimized for stats cards)
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-(--space-sm)': variant === 'stats',

          // Fixture grid (2-3 columns based on screen size)
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': variant === 'fixture',

          // Team grid (3-4 columns, optimized for team cards)
          'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5': variant === 'team',

          // News grid (1-2 columns, optimized for news cards)
          'grid-cols-1 md:grid-cols-2': variant === 'news',
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
CardGrid.displayName = 'CardGrid';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardGrid };
