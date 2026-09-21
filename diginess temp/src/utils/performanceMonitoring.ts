/**
 * Core Web Vitals Monitoring & Performance Optimization
 * Tracks LCP, FID, CLS, TTFB, and FCP metrics
 */

export interface WebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fcp?: number; // First Contentful Paint
}

export interface PerformanceMetrics extends WebVitals {
  timestamp: number;
  pageUrl: string;
  userAgent: string;
  sessionId: string;
  navigationTiming?: PerformanceNavigationTiming;
}

export interface ResourceMetrics {
  resourceName: string;
  duration: number;
  size: number;
  cached: boolean;
}

/**
 * Performance Monitor class for comprehensive metrics tracking
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Partial<PerformanceMetrics> = {};
  private sessionId: string;
  private pageUrl: string;
  private userAgent: string;
  private resourceMetrics: ResourceMetrics[] = [];
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];

  private constructor() {
    this.sessionId = Math.random().toString(36).substr(2, 9);
    this.pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    this.userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    this.metrics = {
      timestamp: Date.now(),
      pageUrl: this.pageUrl,
      userAgent: this.userAgent,
      sessionId: this.sessionId,
    };
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  public initializeMonitoring(callback?: (metrics: PerformanceMetrics) => void): void {
    if (callback) {
      this.callbacks.push(callback);
    }

    this.monitorLCP();
    this.monitorFID();
    this.monitorCLS();
    this.monitorTTFB();
    this.monitorFCP();
    this.monitorResourceTiming();
  }

  /**
   * Monitor Largest Contentful Paint
   */
  private monitorLCP(): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntryWithMetadata;
        const lcp = lastEntry.renderTime || lastEntry.loadTime;
        this.metrics.lcp = lcp;
        this.notifyCallbacks();
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch { /* ignored */ }
  }

  /**
   * Monitor First Input Delay
   */
  private monitorFID(): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const firstInput = entries[0] as PerformanceEventTiming;
          this.metrics.fid = firstInput.processingDuration;
          this.notifyCallbacks();
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
    } catch { /* ignored */ }
  }

  /**
   * Monitor Cumulative Layout Shift
   */
  private monitorCLS(): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const layoutShiftEntry = entry as PerformanceEntryWithHadRecentInput;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value || 0;
            this.metrics.cls = clsValue;
            this.notifyCallbacks();
          }
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch { /* ignored */ }
  }

  /**
   * Monitor Time to First Byte and First Contentful Paint
   */
  private monitorTTFB(): void {
    if (typeof window === 'undefined' || !performance.getEntriesByType) {
      return;
    }

    window.addEventListener('load', () => {
      try {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          this.metrics.ttfb = perfData.responseStart - perfData.fetchStart;
          this.metrics.navigationTiming = perfData;
          this.notifyCallbacks();
        }
      } catch { /* ignored */ }
    });
  }

  /**
   * Monitor First Contentful Paint
   */
  private monitorFCP(): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.notifyCallbacks();
          }
        });
      });

      observer.observe({ entryTypes: ['paint'] });
    } catch { /* ignored */ }
  }

  /**
   * Monitor resource timing
   */
  private monitorResourceTiming(): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          this.resourceMetrics.push({
            resourceName: entry.name,
            duration: entry.duration,
            size: resourceEntry.transferSize || 0,
            cached: resourceEntry.transferSize === 0 && resourceEntry.decodedBodySize > 0,
          });
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch { /* ignored */ }
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(): void {
    const metrics = this.getMetrics();
    if (metrics) {
      this.callbacks.forEach((callback) => callback(metrics));
    }
  }

  /**
   * Get current metrics
   */
  public getMetrics(): PerformanceMetrics | null {
    if (!this.metrics.sessionId) {
      return null;
    }

    return {
      lcp: this.metrics.lcp,
      fid: this.metrics.fid,
      cls: this.metrics.cls,
      ttfb: this.metrics.ttfb,
      fcp: this.metrics.fcp,
      timestamp: this.metrics.timestamp || Date.now(),
      pageUrl: this.metrics.pageUrl || this.pageUrl,
      userAgent: this.metrics.userAgent || this.userAgent,
      sessionId: this.metrics.sessionId,
    };
  }

  /**
   * Get resource metrics
   */
  public getResourceMetrics(): ResourceMetrics[] {
    return this.resourceMetrics;
  }

  /**
   * Check if metrics meet Web Vitals thresholds
   */
  public checkThresholds(metrics: WebVitals = this.metrics as WebVitals): boolean {
    const thresholds = {
      lcp: 2500, // 2.5 seconds
      fid: 100, // 100 milliseconds
      cls: 0.1, // 0.1
      ttfb: 600, // 600 milliseconds
      fcp: 1800, // 1.8 seconds
    };

    return Object.entries(metrics).every(([key, value]) => {
      if (value === undefined) return true;
      return value <= (thresholds[key as keyof typeof thresholds] || Infinity);
    });
  }

  /**
   * Get performance score (0-100)
   */
  public getPerformanceScore(): number {
    const metrics = this.getMetrics();
    if (!metrics) return 0;

    const scores = {
      lcp: this.calculateMetricScore(metrics.lcp, 2500, 4000),
      fid: this.calculateMetricScore(metrics.fid, 100, 300),
      cls: this.calculateMetricScore(metrics.cls, 0.1, 0.25),
      ttfb: this.calculateMetricScore(metrics.ttfb, 600, 1800),
      fcp: this.calculateMetricScore(metrics.fcp, 1800, 3000),
    };

    const weights = { lcp: 0.25, fid: 0.25, cls: 0.25, ttfb: 0.125, fcp: 0.125 };
    let totalScore = 0;

    Object.entries(scores).forEach(([key, score]) => {
      totalScore += score * (weights[key as keyof typeof weights] || 0);
    });

    return Math.round(totalScore);
  }

  private calculateMetricScore(
    value: number | undefined,
    goodThreshold: number,
    poorThreshold: number,
  ): number {
    if (value === undefined) return 0;

    if (value <= goodThreshold) return 100;
    if (value >= poorThreshold) return 0;

    const range = poorThreshold - goodThreshold;
    const position = value - goodThreshold;
    return Math.round(100 - (position / range) * 100);
  }

  /**
   * Get performance report
   */
  public getReport(): {
    metrics: PerformanceMetrics | null;
    resources: ResourceMetrics[];
    threshold: boolean;
    passed: boolean;
  } {
    const metrics = this.getMetrics();
    const passed = metrics ? this.checkThresholds(metrics) : false;

    return {
      metrics,
      resources: this.getResourceMetrics(),
      threshold: passed,
      passed,
    };
  }

  /**
   * Reset metrics
   */
  public reset(): void {
    this.metrics = {
      timestamp: Date.now(),
      pageUrl: this.pageUrl,
      userAgent: this.userAgent,
      sessionId: this.sessionId,
    };
    this.resourceMetrics = [];
  }
}

/**
 * Send metrics to analytics service
 */
export const sendMetricsToAnalytics = async (
  metrics: PerformanceMetrics,
  endpoint: string = import.meta.env.VITE_ANALYTICS_ENDPOINT || '',
): Promise<void> => {
  // Skip if no endpoint is configured or if it's the default placeholder
    if (!endpoint || endpoint === '/api/analytics/performance') {
      // Log metrics locally for debugging only (optional)
      if (import.meta.env.DEV) { /* dev debug disabled */ }
    return;
  }

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
      keepalive: true,
    });
  } catch { /* silently ignored */ }
};

/**
 * Browser-based caching utility
 */
export class CacheManager {
  static async set(key: string, value: any, maxAge: number = 24 * 60 * 60 * 1000) {
    const data = {
      value,
      timestamp: Date.now(),
      maxAge,
    };

    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch { /* ignored */ }
  }

  static get(key: string): any {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { value, timestamp, maxAge } = JSON.parse(cached);
      if (Date.now() - timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }
      return value;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  static remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch { /* ignored */ }
  }

  static clear() {
    try {
      localStorage.clear();
    } catch { /* ignored */ }
  }
}

/**
 * Request caching decorator
 */
export const withRequestCache = async (
  key: string,
  fn: () => Promise<any>,
  maxAge: number = 5 * 60 * 1000,
): Promise<any> => {
  const cached = CacheManager.get(key);
  if (cached) return cached;

  const result = await fn();
  CacheManager.set(key, result, maxAge);
  return result;
};

/**
 * Type extensions for performance entries
 */
declare global {
  interface PerformanceEntryWithMetadata extends PerformanceEntry {
    renderTime?: number;
    loadTime?: number;
  }

  interface PerformanceEventTiming extends PerformanceEntry {
    processingDuration: number;
  }

  interface PerformanceEntryWithHadRecentInput extends PerformanceEntry {
    hadRecentInput?: boolean;
    value?: number;
  }
}

export default {
  PerformanceMonitor,
  CacheManager,
  sendMetricsToAnalytics,
  withRequestCache,
};
