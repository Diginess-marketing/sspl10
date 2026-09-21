import React from 'react';
import { cn } from '@/lib/utils';
import './enhanced-loading.css';

const getEnhancedTableGridClasses = (columns: number) => {
  const clamped = Math.max(1, Math.min(columns, 12));
  return ['enhanced-table-grid', `enhanced-table-grid--${clamped}`];
};

interface SkeletonProps {
  className?: string;
  animated?: boolean;
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, animated = true, variant = 'default', ...props }, ref) => {
    const baseClasses = 'bg-gray-200 dark:bg-gray-800';

    const variantClasses = {
      default: 'h-4 w-full rounded',
      card: 'h-32 w-full rounded-lg',
      text: 'h-4 w-3/4 rounded',
      avatar: 'h-10 w-10 rounded-full',
      button: 'h-10 w-24 rounded-md',
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          animated && 'animate-pulse',
          className,
        )}
        {...props}
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';

// Enhanced Loading Spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
  text?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', color = 'primary', className, text, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    };

    const colorClasses = {
      primary: 'text-cricket-blue',
      white: 'text-white',
      gray: 'text-gray-400',
    };

    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center gap-2', className)}
        {...props}
      >
        <div className={cn('relative', sizeClasses[size])}>
          {/* Outer Ring */}
          <div className={cn(
            'absolute inset-0 rounded-full border-2 border-transparent animate-spin',
            color === 'primary' && 'border-t-cricket-blue border-r-cricket-electric-blue',
            color === 'white' && 'border-t-white border-r-gray-300',
            color === 'gray' && 'border-t-gray-400 border-r-gray-600',
          )} />

          {/* Inner Ring */}
          <div className={cn(
            'absolute inset-1 rounded-full border-2 border-transparent animate-spin',
            color === 'primary' && 'border-t-cricket-purple border-r-cricket-teal',
            color === 'white' && 'border-t-gray-300 border-r-white',
            color === 'gray' && 'border-t-gray-600 border-r-gray-400',
            '[animation-direction:reverse] animation-duration-[1500ms]',
          )}
          />

          {/* Center Dot */}
          <div className={cn(
            'absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse',
            colorClasses[color],
          )} />
        </div>

        {text && (
          <p className={cn(
            'text-sm font-medium animate-pulse',
            color === 'white' && 'text-white',
            color === 'gray' && 'text-gray-600',
            color === 'primary' && 'text-cricket-blue',
          )}>
            {text}
          </p>
        )}
      </div>
    );
  },
);

LoadingSpinner.displayName = 'LoadingSpinner';

// Enhanced Card Skeleton
interface CardSkeletonProps {
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}

const CardSkeleton = React.forwardRef<HTMLDivElement, CardSkeletonProps>(
  ({ className, showAvatar = false, lines = 3, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('bg-white rounded-lg shadow-card p-6 animate-pulse', className)}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          {showAvatar && <Skeleton variant="avatar" />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" className="w-1/4" />
          </div>
        </div>

        {/* Content Lines */}
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              className={index === lines - 1 ? 'w-2/3' : 'w-full'}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6">
          <Skeleton variant="button" />
          <Skeleton variant="button" className="w-16" />
        </div>
      </div>
    );
  },
);

CardSkeleton.displayName = 'CardSkeleton';

// Enhanced Table Skeleton
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

const TableSkeleton = React.forwardRef<HTMLDivElement, TableSkeletonProps>(
  ({ rows = 5, columns = 4, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('bg-white rounded-lg shadow-card overflow-hidden animate-pulse', className)}
        {...props}
      >
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className={cn('grid gap-4', ...getEnhancedTableGridClasses(columns))}>
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} variant="text" className="w-20" />
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4">
              <div className={cn('grid gap-4', ...getEnhancedTableGridClasses(columns))}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    variant="text"
                    className={colIndex === 0 ? 'w-32' : 'w-24'}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

TableSkeleton.displayName = 'TableSkeleton';

// Loading Overlay
interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  className?: string;
  children?: React.ReactNode;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ isVisible, text = 'Loading...', className, children, ...props }, ref) => {
    // Ensure the overlay never changes document flow height to avoid CLS.
    // We always render a relatively positioned container that reserves space
    // for its children; when visible, we only change visual state via absolute overlay.
    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        {...props}
      >
        {children}
        {isVisible && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-max rounded-lg border border-gray-200">
            <LoadingSpinner text={text} />
          </div>
        )}
      </div>
    );
  },
);

LoadingOverlay.displayName = 'LoadingOverlay';

export {
  Skeleton,
  LoadingSpinner,
  CardSkeleton,
  TableSkeleton,
  LoadingOverlay,
  type SkeletonProps,
  type LoadingSpinnerProps,
  type CardSkeletonProps,
  type TableSkeletonProps,
  type LoadingOverlayProps,
};