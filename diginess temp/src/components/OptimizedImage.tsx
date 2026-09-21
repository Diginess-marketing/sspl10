import * as React from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallbackSrc?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | number
  sizes?: string
  quality?: number
  className?: string
  onLoad?: () => void
  onError?: () => void
  // Responsive image support
  srcSet?: string
  srcSetSizes?: string
  // Modern image formats
  webpSrc?: string
  avifSrc?: string
  // Responsive breakpoints
  breakpoints?: number[]
  // Performance optimizations
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  // Auto-fallback to optimized assets
  useOptimizedFallback?: boolean
}

// Check if running in development mode
const isDev = import.meta.env.DEV;

const OptimizedImage = React.forwardRef<
  HTMLImageElement,
  OptimizedImageProps
>(({
  src,
  alt,
  fallbackSrc,
  aspectRatio = 'square',
  sizes = '(max-width: 599px) 100vw, (max-width: 1024px) 50vw, 33vw',
  quality = 75,
  className,
  onLoad,
  onError,
  srcSet,
  srcSetSizes,
  webpSrc,
  avifSrc,
  breakpoints = [480, 768, 1024, 1280, 1920],
  priority = false,
  placeholder = 'empty',
  useOptimizedFallback = true,
  ...props
}, ref) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(src);

  // Warn about missing alt text in development
  React.useEffect(() => {
    if (isDev && (!alt || alt.trim() === '')) {

    }
  }, [alt, src]);

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    [aspectRatio]: `aspect-[${aspectRatio}]`,
  }[typeof aspectRatio === 'string' ? aspectRatio : 'custom'];

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);

    // Try fallback sources in order
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    } else if (useOptimizedFallback && !currentSrc.includes('/assets/optimized/')) {
      // Try /assets/optimized/ version
      const filename = src.split('/').pop();
      if (filename) {
        const optimizedPath = `/assets/optimized/${filename}`;
        if (currentSrc !== optimizedPath) {
          setCurrentSrc(optimizedPath);
          setHasError(false);
          setIsLoading(true);
          return;
        }
      }
    }

    setIsLoading(false);
    onError?.();
  };

  React.useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCurrentSrc(src);
  }, [src]);

  // Generate responsive srcset with modern formats
  const generateSrcSet = (baseSrc: string, format?: string) => {
    if (!baseSrc) return '';
    const extension = format ? `.${format}` : '';
    const baseWithoutExt = baseSrc.replace(/\.[^/.]+$/, '');
    return breakpoints
      .map(bp => `${baseWithoutExt}-${bp}w${extension} ${bp}w`)
      .join(', ');
  };

  // Generate srcSet with optimized fallback support
  // In dev mode, don't auto-generate srcSets as optimized images may not exist
  const webpSrcSet = React.useMemo(() => {
    if (webpSrc) return generateSrcSet(webpSrc, 'webp');
    // Only generate optimized srcSets in production
    if (!isDev && useOptimizedFallback) {
      const filename = src.split('/').pop()?.replace(/\.[^/.]+$/, '');
      if (filename) {
        return breakpoints
          .map(bp => `/assets/optimized/${filename}-${bp}w.webp ${bp}w`)
          .join(', ');
      }
    }
    return '';
  }, [webpSrc, src, useOptimizedFallback, breakpoints]);

  const avifSrcSet = React.useMemo(() => {
    if (avifSrc) return generateSrcSet(avifSrc, 'avif');
    // Only generate optimized srcSets in production
    if (!isDev && useOptimizedFallback) {
      const filename = src.split('/').pop()?.replace(/\.[^/.]+$/, '');
      if (filename) {
        return breakpoints
          .map(bp => `/assets/optimized/${filename}-${bp}w.avif ${bp}w`)
          .join(', ');
      }
    }
    return '';
  }, [avifSrc, src, useOptimizedFallback, breakpoints]);

  // Only use explicit srcSet if provided, otherwise don't generate one
  // This prevents 404 errors when responsive images don't exist
  const fallbackSrcSet = srcSet || '';

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClass, className)}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-linear-to-r from-muted via-muted/50 to-muted bg-size-[200%_100%] animate-shimmer" />
      )}

      {/* Error fallback */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}

      {/* Actual image with modern format support */}
      <picture>
        {avifSrcSet && (
          <source srcSet={avifSrcSet} sizes={srcSetSizes || sizes} type="image/avif" />
        )}
        {webpSrcSet && (
          <source srcSet={webpSrcSet} sizes={srcSetSizes || sizes} type="image/webp" />
        )}
        <img
          ref={ref}
          src={currentSrc}
          alt={alt}
          sizes={srcSetSizes || sizes}
          srcSet={fallbackSrcSet}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
          )}
          {...props}
        />
      </picture>
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export { OptimizedImage, type OptimizedImageProps };
export default OptimizedImage;