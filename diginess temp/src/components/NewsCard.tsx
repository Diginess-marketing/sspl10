import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NewsCardProps {
  title: string
  excerpt: string
  thumbnail?: string
  author?: string
  publishedAt: string
  readTime?: number
  category?: string
  tags?: string[]
  isLoading?: boolean
  onClick?: () => void
  onReadMore?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const NewsCard = React.forwardRef<
  HTMLDivElement,
  NewsCardProps
>(({
  title,
  excerpt,
  thumbnail,
  author,
  publishedAt,
  readTime,
  category,
  tags = [],
  isLoading = false,
  onClick,
  onReadMore,
  className,
  size = 'md',
  ...props
}, ref) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const sizeClasses = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength).trim()}...`;
  };

  return (
    <Card
      ref={ref}
      variant="news"
      isLoading={isLoading}
      clickable={Boolean(onClick)}
      onClick={onClick}
      className={cn(
        sizeClasses[size],
        'h-full transition-all duration-300 overflow-hidden',
        'hover:shadow-lg hover:border-primary/20',
        className,
      )}
      ariaLabel={`News article: ${title}`}
      {...props}
    >
      {/* Thumbnail Section */}
      {thumbnail && (
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={thumbnail}
            alt={title}
            className={cn(
              'w-full h-full object-cover transition-all duration-300',
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          {/* Category Badge */}
          {category && (
            <Badge
              className="absolute top-3 left-3 bg-primary/90 hover:bg-primary text-primary-foreground"
            >
              {category}
            </Badge>
          )}
          {/* Read Time */}
          {readTime && (
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {readTime} min read
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="space-y-2">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </CardTitle>

          <CardDescription className="line-clamp-3">
            {truncateText(excerpt, size === 'sm' ? 120 : 150)}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              {author && (
                <>
                  <span>By {author}</span>
                  <span>•</span>
                </>
              )}
              <span>{formatDate(publishedAt)}</span>
            </div>
          </div>

          {/* Read More Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onReadMore?.();
              }}
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Read More
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

NewsCard.displayName = 'NewsCard';

export { NewsCard, type NewsCardProps };