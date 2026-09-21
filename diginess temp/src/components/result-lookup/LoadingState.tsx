import React from 'react';
import { Loader2, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  message?: string;
  showSkeleton?: boolean;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Searching for player results...',
  showSkeleton = false,
  className = '',
}) => {
  if (showSkeleton) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Player Info Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Skeleton */}
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>

                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Search className="w-12 h-12 text-blue-600 animate-pulse" />
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin absolute -top-1 -right-1" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Searching Player Results
            </h3>
            <p className="text-sm text-gray-600 max-w-xs">
              {message}
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-[0ms]" />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-[150ms]" />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-[300ms]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;