import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CardSkeletonProps {
  variant?: 'default' | 'fixture' | 'team' | 'news' | 'stats'
  className?: string
  showImage?: boolean
  lines?: number
}

const CardSkeleton = React.forwardRef<
  HTMLDivElement,
  CardSkeletonProps
>(({
  variant = 'default',
  className,
  showImage = false,
  lines = 3,
  ...props
}, ref) => {
  return (
    <Card
      ref={ref}
      variant={variant}
      isLoading={true}
      className={cn('animate-pulse', className)}
      {...props}
    >
      {showImage && (
        <div className="h-48 bg-linear-to-r from-muted via-muted/50 to-muted bg-size-[200%_100%] animate-shimmer" />
      )}

      <CardHeader>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted/70 rounded w-1/2" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-3 bg-muted/60 rounded',
                index === lines - 1 ? 'w-2/3' : 'w-full',
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

CardSkeleton.displayName = 'CardSkeleton';

export { CardSkeleton, type CardSkeletonProps };