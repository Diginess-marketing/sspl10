import { Card, CardContent } from '@/components/ui/card';

interface LoadingSkeletonProps {
  type?: 'card' | 'text' | 'image' | 'table' | 'hero';
  count?: number;
  className?: string;
}

const LoadingSkeleton = ({ type = 'card', count = 1, className = '' }: LoadingSkeletonProps) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'hero':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="min-h-[70vh] bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-32"></div>
                    <div className="space-y-2">
                      <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg w-3/4"></div>
                      <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-lg w-full max-w-md"></div>
                    <div className="flex gap-4 pt-4">
                      <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg w-32"></div>
                      <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'card':
        return (
          <Card className={`animate-pulse ${className}`}>
            <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-t-lg"></div>
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
              </div>
            </CardContent>
          </Card>
        );

      case 'image':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            <div className="mt-3 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-8"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`animate-pulse space-y-2 ${className}`}>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/6"></div>
          </div>
        );

      default:
        return (
          <Card className={`animate-pulse ${className}`}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;