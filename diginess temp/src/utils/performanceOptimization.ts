/**
 * Performance Optimization Utilities
 * Helps implement Core Web Vitals optimizations and performance best practices
 */

/**
 * Image loading configuration for lazy loading and performance
 */
export const imageLoadingConfig = {
  // Use native lazy loading for above-the-fold images
  above_the_fold: {
    loading: 'eager' as const,
    priority: true,
    fetchPriority: 'high' as const,
  },
  // Use native lazy loading for below-the-fold images
  below_the_fold: {
    loading: 'lazy' as const,
    priority: false,
    fetchPriority: 'low' as const,
  },
  // Use intersection observer for critical performance images
  critical: {
    loading: 'eager' as const,
    priority: true,
    fetchPriority: 'high' as const,
  },
};

/**
 * Performance monitoring utility for tracking Core Web Vitals
 */
export const performanceMonitor = {
  /**
   * Report Web Vitals (LCP, FID, CLS)
   */
  reportWebVitals: (callback: (metric: any) => void) => {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const lcpEntry = entry as any;
            callback({
              name: 'LCP',
              value: lcpEntry.renderTime || lcpEntry.loadTime,
              entry,
            });
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
      }
    }

    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      try {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const clsEntry = entry as any;
            if (!clsEntry.hadRecentInput) {
              const firstSessionEntry = clsValue + clsEntry.value;
              clsValue = firstSessionEntry;
              callback({
                name: 'CLS',
                value: clsValue,
                entry,
              });
            }
          }
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
      }
    }

    // First Input Delay (via Web Vitals library or manual tracking)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as any;
            callback({
              name: 'FID',
              value: fidEntry.processingDuration,
              entry,
            });
          }
        });
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
      }
    }
  },

  /**
   * Measure page load performance
   */
  measurePageLoad: (): {
    timeToFirstByte: number;
    domInteractive: number;
    domComplete: number;
    loadComplete: number;
  } | null => {
    if (!window.performance || !window.performance.timing) {
      return null;
    }

    const timing = window.performance.timing;
    const navigation = window.performance.navigation;

    return {
      timeToFirstByte: timing.responseStart - timing.fetchStart,
      domInteractive: timing.domInteractive - timing.fetchStart,
      domComplete: timing.domComplete - timing.fetchStart,
      loadComplete: timing.loadEventEnd - timing.fetchStart,
    };
  },

  /**
   * Get resource timing information
   */
  getResourceTiming: () => {
    if (!window.performance || !window.performance.getEntries) {
      return [];
    }

    return window.performance
      .getEntries()
      .filter((entry) => (entry as any).initiatorType !== 'xmlhttprequest')
      .map((entry) => ({
        name: entry.name,
        duration: entry.duration,
        size: (entry as any).transferSize || 0,
        type: (entry as any).initiatorType,
      }));
  },
};

/**
 * Render-blocking resource optimization
 * Helps identify and optimize render-blocking resources
 */
export const renderBlockingOptimizer = {
  /**
   * Check for render-blocking scripts
   */
  checkRenderBlockingScripts: (): HTMLScriptElement[] => {
    const scripts = Array.from(document.querySelectorAll('script:not([async]):not([defer])'));
    const renderBlocking = scripts.filter((script) => {
      // Scripts in the head before the first render
      return script.parentElement?.tagName === 'HEAD';
    });
    return renderBlocking as HTMLScriptElement[];
  },

  /**
   * Optimize script loading by deferring non-critical scripts
   */
  deferNonCriticalScripts: () => {
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach((script) => {
      // Check if script is not already async/defer
      if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
        // Don't defer critical scripts like GA, but defer others
        const src = script.getAttribute('src') || '';
        if (!src.includes('google-analytics') && !src.includes('gtag')) {
          script.setAttribute('defer', '');
        }
      }
    });
  },

  /**
   * Check for render-blocking CSS
   */
  checkRenderBlockingCSS: (): HTMLLinkElement[] => {
    const links = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    ) as HTMLLinkElement[];
    return links.filter((link) => {
      // CSS in the head that blocks rendering
      return link.parentElement?.tagName === 'HEAD' && !link.media;
    });
  },
};

/**
 * Font loading optimization
 */
export const fontOptimization = {
  /**
   * Preload critical fonts
   */
  preloadFonts: (fontUrls: string[]) => {
    fontUrls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = url;
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  },

  /**
   * Use font-display: swap to prevent invisible text
   */
  configureFontDisplay: () => {
    const styleSheets = document.styleSheets;
    let swapCount = 0;

    try {
      for (let i = 0; i < styleSheets.length; i++) {
        const sheet = styleSheets[i];
        try {
          const rules = sheet.cssRules || (sheet as any).rules;
          for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            if (rule instanceof CSSFontFaceRule) {
              // Check if font-display is already set
              const fontDisplayValue = (rule.style as any).fontDisplay;
              if (!fontDisplayValue) {
                (rule.style as any).fontDisplay = 'swap';
                swapCount++;
              }
            }
          }
        } catch (e) {
          // CORS or security error - skip this stylesheet
        }
      }
    } catch (e) {
    }

    return swapCount;
  },
};

/**
 * Image optimization recommendations
 */
export const imageOptimizationChecks = {
  /**
   * Check images for missing alt text
   */
  checkMissingAlt: (): HTMLImageElement[] => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.filter((img) => !img.alt && !img.getAttribute('aria-label'));
  },

  /**
   * Check for non-optimized image formats
   */
  checkImageFormats: (): string[] => {
    const images = Array.from(document.querySelectorAll('img'));
    const issues: string[] = [];

    images.forEach((img) => {
      const src = img.src || '';
      // Check for PNG/JPG that should be WEBP/AVIF
      if (src.match(/\.(png|jpg|jpeg)$/i) && !src.match(/favicon|apple-touch/i)) {
        issues.push(`Non-optimized image format: ${src}`);
      }
    });

    return issues;
  },

  /**
   * Check for missing lazy loading
   */
  checkMissingLazyLoading: (): HTMLImageElement[] => {
    const images = Array.from(document.querySelectorAll('img'));
    // Batch getBoundingClientRect calls to avoid forced reflows
    const imagePositions = images.map(img => ({
      img,
      top: img.getBoundingClientRect().top,
    }));
    
    return imagePositions
      .filter(({ top }) => top >= window.innerHeight)
      .map(({ img }) => img)
      .filter(img => img.loading !== 'lazy');
  },
};

/**
 * Cache optimization recommendations
 */
export const cacheOptimization = {
  /**
   * Get cache control directives for asset types
   */
  getCacheDirectives: (mimeType: string): string => {
    if (mimeType.includes('text/html')) {
      return 'public, max-age=3600, must-revalidate';
    } if (
      mimeType.includes('javascript') ||
      mimeType.includes('css') ||
      mimeType.includes('image') ||
      mimeType.includes('font')
    ) {
      return 'public, max-age=31536000, immutable';
    }
    return 'public, max-age=604800';
  },

  /**
   * Check if service worker is installed
   */
  isServiceWorkerInstalled: async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length > 0;
    } catch {
      return false;
    }
  },
};

export default {
  imageLoadingConfig,
  performanceMonitor,
  renderBlockingOptimizer,
  fontOptimization,
  imageOptimizationChecks,
  cacheOptimization,
};
