import * as React from 'react';
import { cn } from '@/lib/utils';

interface LazySVGProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
  onLoad?: () => void
  onError?: () => void
  priority?: boolean
}

const LazySVG = React.forwardRef<
  HTMLImageElement,
  LazySVGProps
>(({
  src,
  alt,
  fallbackSrc,
  className,
  onLoad,
  onError,
  priority = false,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = React.useState(priority);
  const [hasError, setHasError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(priority ? src : '');
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setCurrentSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Load 50px before entering viewport
        threshold: 0.1,
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, priority]);

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      onError?.();
    }
  };

  return (
    <img
      ref={ref || imgRef}
      src={currentSrc}
      alt={alt}
      onLoad={onLoad}
      onError={handleError}
      className={cn(
        'transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0',
        className,
      )}
      {...props}
    />
  );
});

LazySVG.displayName = 'LazySVG';

export { LazySVG, type LazySVGProps };