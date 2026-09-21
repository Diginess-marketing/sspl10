/**
 * useWebVitals Hook
 * 
 * Captures Core Web Vitals (LCP, CLS, INP, FID) and sends them to Google Analytics 4.
 * 
 * Core Web Vitals:
 * - LCP (Largest Contentful Paint): Measures loading performance
 * - CLS (Cumulative Layout Shift): Measures visual stability
 * - INP (Interaction to Next Paint): Measures responsiveness (replaces FID)
 * - FID (First Input Delay): Measures interactivity (legacy, being replaced by INP)
 * 
 * @see https://web.dev/vitals/
 * @see https://github.com/GoogleChrome/web-vitals
 */

import { useEffect } from 'react';
import type { Metric } from 'web-vitals';

interface WebVitalsOptions {
  /**
   * Enable debug logging to console
   * @default false
   */
  debug?: boolean;

  /**
   * Only report metrics in production
   * @default true
   */
  productionOnly?: boolean;

  /**
   * Custom event name prefix for GA4 events
   * @default 'web_vitals'
   */
  eventPrefix?: string;

  /**
   * Report FID (legacy metric, being replaced by INP)
   * @default false
   */
  includeFID?: boolean;

  /**
   * Custom callback for each metric
   */
  onMetric?: (metric: Metric) => void;
}

/**
 * Send Web Vitals metric to Google Analytics 4
 */
const sendToGA4 = (metric: Metric, eventPrefix: string, debug: boolean) => {
  // Check if gtag is available
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    if (debug) {
    }
    return;
  }

  // Round the value based on metric type
  const value = metric.name === 'CLS' 
    ? Math.round(metric.value * 1000) / 1000 // CLS: 3 decimal places
    : Math.round(metric.value); // Others: whole numbers (ms)

  const eventName = `${eventPrefix}_${metric.name.toLowerCase()}`;

  // Send to GA4
  window.gtag('event', eventName, {
    value,
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_rating: metric.rating,
    metric_navigation_type: metric.navigationType,
    event_category: 'Web Vitals',
    event_label: metric.name,
    non_interaction: true, // Don't affect bounce rate
  });

  if (debug) {
  }
};

/**
 * Get rating thresholds for each metric
 */
const getMetricThreshold = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const thresholds: Record<string, [number, number]> = {
    LCP: [2500, 4000],      // good: ≤2.5s, poor: >4s
    FID: [100, 300],        // good: ≤100ms, poor: >300ms
    CLS: [0.1, 0.25],       // good: ≤0.1, poor: >0.25
    INP: [200, 500],        // good: ≤200ms, poor: >500ms
    FCP: [1800, 3000],      // good: ≤1.8s, poor: >3s
    TTFB: [800, 1800],      // good: ≤800ms, poor: >1.8s
  };

  const [good, poor] = thresholds[name] || [0, Infinity];

  if (value <= good) return 'good';
  if (value > poor) return 'poor';
  return 'needs-improvement';
};

/**
 * Hook to capture and report Core Web Vitals to GA4
 * 
 * @example
 * ```tsx
 * // Basic usage
 * useWebVitals();
 * 
 * // With debug logging
 * useWebVitals({ debug: true });
 * 
 * // With custom callback
 * useWebVitals({
 *   debug: true,
 *   onMetric: (metric) => {
 *     
 *   }
 * });
 * ```
 */
const useWebVitals = (options: WebVitalsOptions = {}) => {
  const {
    debug = false,
    productionOnly = true,
    eventPrefix = 'web_vitals',
    includeFID = false,
    onMetric,
  } = options;

  useEffect(() => {
    // Gate logging/monitoring behind explicit flags to avoid noisy production consoles.
    const loggingEnabled =
      import.meta.env.DEV ||
      import.meta.env.VITE_ENABLE_WEB_VITALS_LOG === 'true';

    // Respect productionOnly flag primarily for GA sending behavior; we still
    // allow optional logging when explicitly enabled.
    if (productionOnly && import.meta.env.DEV && !loggingEnabled) {
      if (debug) {
      }
      return;
    }

    // Handler for all metrics with optional GA forwarding
    const handleMetric = (metric: Metric) => {
      if (!metric.rating) {
        (metric as any).rating = getMetricThreshold(metric.name, metric.value);
      }

      // Only send to GA4 when not in DEV and when GA is expected to be present
      const canSendToGA =
        typeof window !== 'undefined' &&
        typeof window.gtag === 'function' &&
        (!import.meta.env.DEV || !productionOnly);

      if (canSendToGA) {
        sendToGA4(metric, eventPrefix, debug && loggingEnabled);
      }

      if (onMetric) {
        onMetric(metric);
      }

      // Optional structured logging in dev or when explicitly enabled
      if (loggingEnabled && debug) {
        // Use info to avoid console.error/console.warn noise for normal values
        const { name, value, rating, id, navigationType } = metric;
      }
    };

    // Dynamically import web-vitals to avoid bundling if not used
    import('web-vitals')
      .then((vitals) => {
        const { onCLS, onINP, onLCP, onFCP, onTTFB } = vitals;

        onLCP(handleMetric);
        onCLS(handleMetric);
        onINP(handleMetric);
        onFCP(handleMetric);
        onTTFB(handleMetric);

        if (includeFID && 'onFID' in vitals) {
          (vitals as any).onFID(handleMetric);
        }

        if (loggingEnabled && debug) {
        }
      })
      .catch((error) => {
        // Only surface load issues when actively debugging to avoid production noise
        if (loggingEnabled) {
        }
      });
  }, [debug, productionOnly, eventPrefix, includeFID, onMetric]);
};

/**
 * Manually report current Web Vitals metrics
 * Useful for SPA route changes or manual reporting
 */
export const reportWebVitals = async (
  callback?: (metric: Metric) => void,
  options: { debug?: boolean; eventPrefix?: string } = {},
) => {
  const { debug = false, eventPrefix = 'web_vitals' } = options;

  try {
    const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import('web-vitals');

    const handleMetric = (metric: Metric) => {
      if (!metric.rating) {
        (metric as any).rating = getMetricThreshold(metric.name, metric.value);
      }

      sendToGA4(metric, eventPrefix, debug);

      if (callback) {
        callback(metric);
      }
    };

    onLCP(handleMetric, { reportAllChanges: true });
    onCLS(handleMetric, { reportAllChanges: true });
    onINP(handleMetric, { reportAllChanges: true });
    onFCP(handleMetric, { reportAllChanges: true });
    onTTFB(handleMetric, { reportAllChanges: true });
  } catch (error) {
  }
};

/**
 * Get Web Vitals thresholds for reference
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: {
    good: 2500,
    needsImprovement: 4000,
    unit: 'ms',
    description: 'Largest Contentful Paint - Loading performance',
  },
  FID: {
    good: 100,
    needsImprovement: 300,
    unit: 'ms',
    description: 'First Input Delay - Interactivity (legacy)',
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
    unit: 'score',
    description: 'Cumulative Layout Shift - Visual stability',
  },
  INP: {
    good: 200,
    needsImprovement: 500,
    unit: 'ms',
    description: 'Interaction to Next Paint - Responsiveness',
  },
  FCP: {
    good: 1800,
    needsImprovement: 3000,
    unit: 'ms',
    description: 'First Contentful Paint - Initial rendering',
  },
  TTFB: {
    good: 800,
    needsImprovement: 1800,
    unit: 'ms',
    description: 'Time to First Byte - Server response time',
  },
} as const;

export default useWebVitals;
