import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const labelVariants = cva(
  'inline-flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors',
  {
    variants: {
      variant: {
        // Category labels for news/articles
        category: 'px-2 py-1 rounded-md bg-sport-blue/10 text-sport-blue border border-sport-blue/20',
        'category-sports': 'px-2 py-1 rounded-md bg-sport-green/10 text-sport-green border border-sport-green/20',
        'category-news': 'px-2 py-1 rounded-md bg-sport-blue/10 text-sport-blue border border-sport-blue/20',
        'category-events': 'px-2 py-1 rounded-md bg-sport-orange/10 text-sport-orange border border-sport-orange/20',

        // Tag components for content organization
        tag: 'px-2 py-0.5 rounded-sm bg-gray-100 text-gray-700 border border-gray-200 text-xs',
        'tag-primary': 'px-2 py-0.5 rounded-sm bg-sport-green/10 text-sport-green border border-sport-green/20 text-xs',
        'tag-secondary': 'px-2 py-0.5 rounded-sm bg-sport-blue/10 text-sport-blue border border-sport-blue/20 text-xs',

        // Status labels for various content types
        status: 'px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
        'status-active': 'px-2 py-1 rounded-full bg-success text-success-foreground text-xs font-semibold uppercase tracking-wide',
        'status-inactive': 'px-2 py-1 rounded-full bg-gray-500 text-white text-xs font-semibold uppercase tracking-wide',
        'status-pending': 'px-2 py-1 rounded-full bg-warning text-warning-foreground text-xs font-semibold uppercase tracking-wide',
        'status-draft': 'px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-wide',

        // Priority indicators
        priority: 'px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
        'priority-low': 'px-2 py-1 rounded-full bg-info text-info-foreground text-xs font-bold uppercase tracking-wide',
        'priority-medium': 'px-2 py-1 rounded-full bg-warning text-warning-foreground text-xs font-bold uppercase tracking-wide',
        'priority-high': 'px-2 py-1 rounded-full bg-error text-error-foreground text-xs font-bold uppercase tracking-wide',
        'priority-urgent': 'px-2 py-1 rounded-full bg-error text-white text-xs font-bold uppercase tracking-wide animate-pulse',

        // Default label styles
        default: '',
      },
      size: {
        xs: 'text-xs px-1.5 py-0.5',
        sm: 'text-sm px-2 py-1',
        default: 'text-sm px-2.5 py-1.5',
        lg: 'text-base px-3 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  /**
   * Icon to display before the label text
   */
  startIcon?: React.ReactNode
  /**
   * Icon to display after the label text
   */
  endIcon?: React.ReactNode
  /**
   * Whether the label is removable (shows close button)
   */
  removable?: boolean
  /**
   * Callback when remove button is clicked
   */
  onRemove?: () => void
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, variant, size, startIcon, endIcon, removable, onRemove, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ variant, size }), className)}
    {...props}
  >
    {startIcon && <span className="mr-1 shrink-0">{startIcon}</span>}
    <span>{children}</span>
    {endIcon && <span className="ml-1 shrink-0">{endIcon}</span>}
    {removable && (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onRemove?.();
        }}
        className="ml-1 shrink-0 w-4 h-4 rounded-full bg-current/20 hover:bg-current/40 flex items-center justify-center text-xs leading-none"
        aria-label="Remove label"
      >
        ×
      </button>
    )}
  </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Root.displayName;

// Specialized label components
const CategoryLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  Omit<LabelProps, 'variant'>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    variant="category"
    className={cn('hover:bg-sport-blue/20 cursor-pointer', className)}
    {...props}
  />
));
CategoryLabel.displayName = 'CategoryLabel';

const TagLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  Omit<LabelProps, 'variant'>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    variant="tag"
    className={cn('hover:bg-gray-200 cursor-pointer', className)}
    {...props}
  />
));
TagLabel.displayName = 'TagLabel';

const StatusLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  Omit<LabelProps, 'variant'>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    variant="status"
    className={cn('shadow-sm', className)}
    {...props}
  />
));
StatusLabel.displayName = 'StatusLabel';

const PriorityLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  Omit<LabelProps, 'variant'>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    variant="priority"
    className={cn('shadow-sm', className)}
    {...props}
  />
));
PriorityLabel.displayName = 'PriorityLabel';

export { Label, CategoryLabel, TagLabel, StatusLabel, PriorityLabel, labelVariants };
