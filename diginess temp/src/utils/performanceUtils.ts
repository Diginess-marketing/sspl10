/**
 * Performance Utilities Index
 * Centralized export for all performance optimization utilities
 */

// Core performance monitoring
export {
  PerformanceMonitor,
  CacheManager,
  sendMetricsToAnalytics,
  withRequestCache,
  type WebVitals,
  type PerformanceMetrics,
  type ResourceMetrics,
} from './performanceMonitoring';

// Image optimization
export {
  IMAGE_PRESETS,
  IMAGE_CDN_CONFIG,
  generateSrcSet,
  calculateAspectRatio,
  generateLQIP,
  generateCloudinaryUrl,
  generateResponsiveImageUrl,
  generatePictureElement,
  getResponsiveSizes,
  preloadImage,
  prefetchImages,
  getImageDimensions,
  isWebPSupported,
  isAVIFSupported,
  getSupportedFormats,
} from './imageOptimization';

// Network-aware loading
export {
  getNetworkInfo,
  shouldReduceData,
  getAdaptiveImageQuality,
  getAdaptiveVideoQuality,
  shouldLoadHeavyFeatures,
  getChunkLoadingStrategy,
  getAdaptivePrefetchCount,
  getAdaptiveBatchSize,
  getAdaptiveTimeout,
  getAdaptiveLazyLoadConfig,
  NetworkMonitor,
  AdaptiveResourceLoader,
  networkMonitor,
  adaptiveLoader,
  type NetworkInfo,
  type NetworkSpeed,
  type EffectiveConnectionType,
} from './networkAdaptive';

// Resource hints and preloading
export {
  ResourceHintsManager,
  NavigationPredictor,
  injectCriticalCSS,
  preloadFonts,
  setupEarlyHints,
  prefetchNextPage,
  setupAdaptivePrefetch,
  applyImagePriorityHints,
  setupServiceWorkerPrefetch,
  resourceHintsManager,
  navigationPredictor,
  type ResourceHint,
} from './resourceHints';

// Script loading optimization
export {
  ScriptLoader,
  PriorityScriptQueue,
  ThirdPartyScriptManager,
  scriptLoader,
  priorityQueue,
  thirdPartyManager,
  type ScriptConfig,
  type ScriptLoadResult,
  type ScriptPriority,
  type ScriptLoadStrategy,
} from './scriptLoader';

/**
 * Initialize all performance optimizations
 */
export function initializePerformanceOptimizations(config?: {
  enableMonitoring?: boolean;
  enableResourceHints?: boolean;
  enableAdaptiveLoading?: boolean;
  analyticsEndpoint?: string;
}): void {
  const {
    enableMonitoring = true,
    enableResourceHints = true,
    enableAdaptiveLoading = true,
    analyticsEndpoint,
  } = config || {};

  if (typeof window === 'undefined') return;

  // Initialize performance monitoring
  if (enableMonitoring) {
    import('./performanceMonitoring').then(
      ({ PerformanceMonitor, sendMetricsToAnalytics }) => {
        const monitor = PerformanceMonitor.getInstance();
        monitor.initializeMonitoring((metrics) => {
          if (analyticsEndpoint) {
            sendMetricsToAnalytics(metrics, analyticsEndpoint).catch(() => {
              // Silent fail in production
            });
          }
        });
      },
    );
  }

  // Initialize resource hints
  if (enableResourceHints) {
    import('./resourceHints').then(
      ({ setupEarlyHints, setupAdaptivePrefetch }) => {
        setupEarlyHints();
        setupAdaptivePrefetch();
      },
    );
  }

  // Initialize adaptive loading
  if (enableAdaptiveLoading) {
    import('./networkAdaptive').then(({ networkMonitor }) => {
      networkMonitor.onChange((info) => {
      });
    });
  }
}

/**
 * Get comprehensive performance report
 */
export async function getPerformanceReport(): Promise<{
  webVitals: any;
  networkInfo: any;
  resourceTiming: any;
  score: number;
}> {
  const { PerformanceMonitor } = await import('./performanceMonitoring');
  const { getNetworkInfo } = await import('./networkAdaptive');

  const monitor = PerformanceMonitor.getInstance();
  const report = monitor.getReport();
  const networkInfo = getNetworkInfo();

  return {
    webVitals: report.metrics,
    networkInfo,
    resourceTiming: report.resources,
    score: monitor.getPerformanceScore(),
  };
}

/**
 * Quick performance check
 */
export function checkPerformance(): {
  passed: boolean;
  score: number;
  message: string;
} {
  if (typeof window === 'undefined') {
    return { passed: false, score: 0, message: 'Not in browser environment' };
  }

  // Simple checks that can run synchronously
  const checks = {
    hasServiceWorker: 'serviceWorker' in navigator,
    hasHTTP2: (performance.getEntriesByType('navigation')[0] as any)
      ?.nextHopProtocol?.includes('h2'),
    hasResourceHints: document.querySelectorAll(
      'link[rel="preconnect"], link[rel="dns-prefetch"]',
    ).length > 0,
  };

  const score =
    (checks.hasServiceWorker ? 33 : 0) +
    (checks.hasHTTP2 ? 33 : 0) +
    (checks.hasResourceHints ? 34 : 0);

  return {
    passed: score > 50,
    score,
    message: `Performance check: ${score}% - ${
      score > 80 ? 'Excellent' : score > 50 ? 'Good' : 'Needs improvement'
    }`,
  };
}

export default {
  initializePerformanceOptimizations,
  getPerformanceReport,
  checkPerformance,
};
