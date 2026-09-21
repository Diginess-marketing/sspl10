import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
  enabled?: boolean;
}

interface UseIntersectionObserverReturn<T extends Element = Element> {
  ref: React.RefObject<T>;
  isIntersecting: boolean;
  hasIntersected: boolean;
}

/**
 * Custom hook for Intersection Observer API with lazy loading support
 * Prevents main thread blocking by deferring component rendering until visible
 */
export const useIntersectionObserver = <T extends Element = Element>(
  options: UseIntersectionObserverOptions = {},
): UseIntersectionObserverReturn<T> => {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '50px',
    triggerOnce = true,
    enabled = true,
  } = options;

  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: assume element is visible
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting && triggerOnce && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold,
        root,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, root, rootMargin, triggerOnce, enabled, hasIntersected]);

  return {
    ref,
    isIntersecting,
    hasIntersected,
  };
};

/**
 * Lazy loading component wrapper using Intersection Observer
 * Only renders children when component comes into view
 */
interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  enabled?: boolean;
}

export const LazyLoad = ({
  children,
  fallback = null,
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  enabled = true,
}: LazyLoadProps) => {
  const { ref, hasIntersected } = useIntersectionObserver<HTMLDivElement>({
    threshold,
    rootMargin,
    triggerOnce,
    enabled,
  });

  return (
    <div ref={ref} className={className}>
      {hasIntersected ? children : fallback}
    </div>
  );
};

/**
 * Hook for lazy loading images with Intersection Observer
 */
export const useLazyImage = (src: string, options: UseIntersectionObserverOptions = {}) => {
  const { ref, hasIntersected } = useIntersectionObserver<HTMLImageElement>(options);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!hasIntersected || !src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [hasIntersected, src]);

  return {
    ref,
    src: hasIntersected ? src : undefined,
    loaded,
    error,
    shouldLoad: hasIntersected,
  };
};

/**
 * Hook for lazy loading multiple images in chunks to prevent main thread blocking
 */
export const useLazyImageBatch = (
  images: string[],
  options: UseIntersectionObserverOptions & { chunkSize?: number } = {},
) => {
  const { chunkSize = 3, ...observerOptions } = options;
  const { ref, hasIntersected } = useIntersectionObserver<HTMLDivElement>(observerOptions);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasIntersected || images.length === 0) return;

    const loadImagesInChunks = async () => {
      setLoading(true);

      for (let i = 0; i < images.length; i += chunkSize) {
        const chunk = images.slice(i, i + chunkSize);

        // Load chunk of images
        const promises = chunk.map(src => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
              setLoadedImages(prev => new Set(prev).add(src));
              resolve();
            };
            img.onerror = () => resolve(); // Continue even if one fails
          });
        });

        await Promise.all(promises);

        // Yield control back to main thread between chunks
        if (i + chunkSize < images.length) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      setLoading(false);
    };

    loadImagesInChunks();
  }, [hasIntersected, images, chunkSize]);

  return {
    ref,
    loadedImages,
    loading,
    allLoaded: loadedImages.size === images.length,
    shouldLoad: hasIntersected,
  };
};