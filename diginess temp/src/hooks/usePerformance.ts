/**
 * React Hook for Performance Monitoring
 * Provides easy integration of performance monitoring in React components
 */

import { useEffect, useState, useCallback } from 'react';
import type { PerformanceMetrics } from '../utils/performanceMonitoring';
import type { NetworkInfo } from '../utils/networkAdaptive';

/**
 * Hook to monitor Web Vitals
 */
export function useWebVitalsMonitoring(
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void,
) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    import('../utils/performanceMonitoring').then(({ PerformanceMonitor }) => {
      if (!mounted) return;

      const monitor = PerformanceMonitor.getInstance();
      
      monitor.initializeMonitoring((newMetrics) => {
        if (!mounted) return;
        
        setMetrics(newMetrics);
        setScore(monitor.getPerformanceScore());
        
        if (onMetricsUpdate) {
          onMetricsUpdate(newMetrics);
        }
      });
    });

    return () => {
      mounted = false;
    };
  }, [onMetricsUpdate]);

  return { metrics, score };
}

/**
 * Hook to monitor network conditions
 */
export function useNetworkMonitoring() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    import('../utils/networkAdaptive').then(
      ({ getNetworkInfo, networkMonitor }) => {
        if (!mounted) return;

        // Set initial state
        setNetworkInfo(getNetworkInfo());

        // Listen for changes
        unsubscribe = networkMonitor.onChange((info) => {
          if (mounted) {
            setNetworkInfo(info);
          }
        });
      },
    );

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return networkInfo;
}

/**
 * Hook to get adaptive loading configuration
 */
export function useAdaptiveLoading() {
  const networkInfo = useNetworkMonitoring();

  const shouldLoadHeavyContent = useCallback(() => {
    if (!networkInfo) return true;
    return networkInfo.speed === 'fast' && !networkInfo.saveData;
  }, [networkInfo]);

  const getImageQuality = useCallback(
    (baseQuality: number = 85) => {
      if (!networkInfo) return baseQuality;

      switch (networkInfo.speed) {
        case 'slow':
          return Math.max(50, baseQuality - 35);
        case 'medium':
          return Math.max(60, baseQuality - 20);
        default:
          return baseQuality;
      }
    },
    [networkInfo],
  );

  const getPrefetchCount = useCallback(
    (baseCount: number = 5) => {
      if (!networkInfo) return baseCount;

      switch (networkInfo.speed) {
        case 'slow':
          return 0;
        case 'medium':
          return Math.max(1, Math.floor(baseCount / 2));
        default:
          return baseCount;
      }
    },
    [networkInfo],
  );

  return {
    networkInfo,
    shouldLoadHeavyContent,
    getImageQuality,
    getPrefetchCount,
    isSlowConnection: networkInfo?.speed === 'slow',
    saveDataEnabled: networkInfo?.saveData || false,
  };
}

/**
 * Hook for lazy loading images
 */
export function useLazyImage(src: string, options?: { threshold?: number }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let observer: IntersectionObserver | null = null;

    const loadImage = () => {
      const img = new Image();

      img.onload = () => {
        if (mounted) {
          setImageSrc(src);
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        if (mounted) {
          setError(new Error(`Failed to load image: ${src}`));
        }
      };

      img.src = src;
    };

    if ('IntersectionObserver' in window) {
      const sentinel = document.createElement('div');
      document.body.appendChild(sentinel);

      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadImage();
            observer?.disconnect();
            document.body.removeChild(sentinel);
          }
        },
        { threshold: options?.threshold || 0.01 },
      );

      observer.observe(sentinel);
    } else {
      // Fallback: load immediately
      loadImage();
    }

    return () => {
      mounted = false;
      if (observer) {
        observer.disconnect();
      }
    };
  }, [src, options?.threshold]);

  return { imageSrc, isLoaded, error };
}

/**
 * Hook to prefetch resources on hover
 */
export function usePrefetchOnHover(urls: string[]) {
  const prefetchedUrls = new Set<string>();

  const handleMouseEnter = useCallback(() => {
    if (urls.length === 0) return;

    import('../utils/resourceHints').then(({ resourceHintsManager }) => {
      urls.forEach((url) => {
        if (!prefetchedUrls.has(url)) {
          resourceHintsManager.prefetch([{ href: url }]);
          prefetchedUrls.add(url);
        }
      });
    });
  }, [urls]);

  return { onMouseEnter: handleMouseEnter };
}

/**
 * Hook to track component render performance
 */
export function useRenderPerformance(componentName: string) {
  const [renderCount, setRenderCount] = useState(0);
  const [avgRenderTime, setAvgRenderTime] = useState(0);

  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      setRenderCount((prev) => {
        const newCount = prev + 1;
        setAvgRenderTime((avgRenderTime * prev + renderTime) / newCount);
        return newCount;
      });

      if (import.meta.env.DEV) {
      }
    };
  });

  return { renderCount, avgRenderTime };
}

/**
 * Hook to measure long tasks
 */
export function useLongTaskMonitoring() {
  const [longTasks, setLongTasks] = useState<number[]>([]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('PerformanceObserver' in window)
    ) {
      return;
    }

    let observer: PerformanceObserver | null = null;

    try {
      observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const taskDurations = entries.map((entry) => entry.duration);
        setLongTasks((prev) => [...prev, ...taskDurations]);
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const avgLongTaskDuration =
    longTasks.length > 0
      ? longTasks.reduce((a, b) => a + b, 0) / longTasks.length
      : 0;

  return {
    longTaskCount: longTasks.length,
    avgLongTaskDuration,
    longTasks,
  };
}

/**
 * Hook for adaptive component loading
 */
export function useAdaptiveComponentLoading<T>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    priority?: 'high' | 'medium' | 'low';
    loadOnSlow?: boolean;
  },
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { networkInfo } = useAdaptiveLoading();

  useEffect(() => {
    let mounted = true;

    const shouldLoad =
      options?.loadOnSlow ||
      !networkInfo ||
      networkInfo.speed !== 'slow' ||
      options?.priority === 'high';

    if (!shouldLoad) {
      setLoading(false);
      return;
    }

    importFn()
      .then((module) => {
        if (mounted) {
          setComponent(() => module.default);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [networkInfo?.speed, options?.loadOnSlow, options?.priority]);

  return { Component, loading, error };
}

export default {
  useWebVitalsMonitoring,
  useNetworkMonitoring,
  useAdaptiveLoading,
  useLazyImage,
  usePrefetchOnHover,
  useRenderPerformance,
  useLongTaskMonitoring,
  useAdaptiveComponentLoading,
};
