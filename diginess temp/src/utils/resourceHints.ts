/**
 * Resource Hints and Preloading Optimizer
 * Manages DNS prefetch, preconnect, prefetch, and preload hints
 */

export interface ResourceHint {
  rel: 'dns-prefetch' | 'preconnect' | 'prefetch' | 'preload' | 'modulepreload';
  href: string;
  as?: 'script' | 'style' | 'font' | 'image' | 'document' | 'fetch';
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
  media?: string;
}

/**
 * Resource Hints Manager
 */
export class ResourceHintsManager {
  private hints = new Map<string, HTMLLinkElement>();
  private observer: IntersectionObserver | null = null;

  constructor() {
    this.setupIntersectionObserver();
  }

  /**
   * Add DNS prefetch for external domains
   */
  dnsPrefetch(domains: string[]): void {
    domains.forEach((domain) => {
      this.addHint({
        rel: 'dns-prefetch',
        href: domain,
      });
    });
  }

  /**
   * Add preconnect for critical external resources
   */
  preconnect(domains: string[], crossOrigin: boolean = false): void {
    domains.forEach((domain) => {
      this.addHint({
        rel: 'preconnect',
        href: domain,
        ...(crossOrigin && { crossOrigin: 'anonymous' }),
      });
    });
  }

  /**
   * Prefetch resources for next navigation
   */
  prefetch(resources: Array<{ href: string; as?: ResourceHint['as'] }>): void {
    resources.forEach((resource) => {
      this.addHint({
        rel: 'prefetch',
        href: resource.href,
        as: resource.as,
      });
    });
  }

  /**
   * Preload critical resources
   */
  preload(resources: Array<{
    href: string;
    as: ResourceHint['as'];
    type?: string;
    crossOrigin?: boolean;
  }>): void {
    resources.forEach((resource) => {
      this.addHint({
        rel: 'preload',
        href: resource.href,
        as: resource.as,
        type: resource.type,
        ...(resource.crossOrigin && { crossOrigin: 'anonymous' }),
      });
    });
  }

  /**
   * Preload ES modules
   */
  modulePreload(modules: string[]): void {
    modules.forEach((moduleUrl) => {
      this.addHint({
        rel: 'modulepreload',
        href: moduleUrl,
      });
    });
  }

  /**
   * Add resource hint to document
   */
  private addHint(hint: ResourceHint): void {
    if (typeof document === 'undefined') return;

    const key = `${hint.rel}:${hint.href}`;

    // Avoid duplicates
    if (this.hints.has(key)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;

    if (hint.as) link.as = hint.as;
    if (hint.type) link.type = hint.type;
    if (hint.crossOrigin) link.crossOrigin = hint.crossOrigin;
    if (hint.media) link.media = hint.media;
    if (hint.integrity) link.integrity = hint.integrity;

    document.head.appendChild(link);
    this.hints.set(key, link);
  }

  /**
   * Remove a resource hint
   */
  removeHint(rel: ResourceHint['rel'], href: string): void {
    const key = `${rel}:${href}`;
    const link = this.hints.get(key);

    if (link && link.parentNode) {
      link.parentNode.removeChild(link);
      this.hints.delete(key);
    }
  }

  /**
   * Setup intersection observer for conditional prefetching
   */
  private setupIntersectionObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const prefetchUrl = element.dataset.prefetch;

            if (prefetchUrl) {
              this.prefetch([{ href: prefetchUrl }]);
              element.removeAttribute('data-prefetch');
              this.observer?.unobserve(element);
            }
          }
        });
      },
      {
        rootMargin: '100px 0px',
      },
    );
  }

  /**
   * Observe element for prefetching
   */
  observeForPrefetch(element: HTMLElement, url: string): void {
    if (!this.observer) return;

    element.dataset.prefetch = url;
    this.observer.observe(element);
  }

  /**
   * Clear all hints
   */
  clearAll(): void {
    this.hints.forEach((link) => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });
    this.hints.clear();
  }
}

/**
 * Critical CSS injector
 */
export function injectCriticalCSS(css: string): void {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.setAttribute('data-critical', 'true');
  style.textContent = css;
  document.head.insertBefore(style, document.head.firstChild);
}

/**
 * Font preload helper
 */
export function preloadFonts(
  fonts: Array<{
    url: string;
    format?: 'woff' | 'woff2' | 'ttf' | 'otf';
    display?: 'swap' | 'block' | 'fallback' | 'optional';
  }>,
): void {
  if (typeof document === 'undefined') return;

  fonts.forEach((font) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = font.url;
    link.crossOrigin = 'anonymous';
    link.type = `font/${font.format || 'woff2'}`;
    document.head.appendChild(link);
  });
}

/**
 * Early hints for critical resources
 */
export function setupEarlyHints(): void {
  if (typeof document === 'undefined') return;

  const manager = new ResourceHintsManager();

  // DNS prefetch for external domains
  manager.dnsPrefetch([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://checkout.razorpay.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ]);

  // Note: Preconnect to Google Fonts removed as we use self-hosted fonts
  // Critical fonts are already preloaded in index.html
}

/**
 * Prefetch next page resources
 */
export function prefetchNextPage(pathname: string): void {
  if (typeof document === 'undefined') return;

  const manager = new ResourceHintsManager();

  // Map routes to their likely resources
  const routeResources: Record<string, string[]> = {
    '/register': ['/api/registration-status', '/api/teams'],
    '/gallery': ['/api/gallery', '/api/images'],
    '/teams': ['/api/teams', '/api/players'],
    '/trials-workflow': ['/api/workflow/stats'],
  };

  const resources = routeResources[pathname] || [];
  manager.prefetch(resources.map((href) => ({ href })));
}

/**
 * Adaptive prefetching based on connection speed
 */
export function setupAdaptivePrefetch(): void {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return;
  }

  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType;

  // Only prefetch on fast connections
  if (effectiveType === '4g' && !connection?.saveData) {
    // Prefetch visible links on hover
    document.addEventListener(
      'mouseover',
      (e) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a[href]') as HTMLAnchorElement;

        if (link && link.origin === location.origin) {
          const manager = new ResourceHintsManager();
          manager.prefetch([{ href: link.href, as: 'document' }]);
        }
      },
      { passive: true, capture: true },
    );
  }
}

/**
 * Priority hints for images
 */
export function applyImagePriorityHints(): void {
  if (typeof document === 'undefined') return;

  // Mark above-the-fold images as high priority
  // Batch DOM reads to avoid forced reflows
  requestAnimationFrame(() => {
    const images = document.querySelectorAll('img');
    const viewportHeight = window.innerHeight;
    
    // Batch all reads first
    const imageData = Array.from(images).map(img => ({
      img,
      isAboveFold: img.getBoundingClientRect().top < viewportHeight,
    }));
    
    // Then batch all writes
    requestAnimationFrame(() => {
      imageData.forEach(({ img, isAboveFold }) => {
        if (isAboveFold) {
          img.setAttribute('fetchpriority', 'high');
          img.setAttribute('loading', 'eager');
        } else {
          img.setAttribute('fetchpriority', 'low');
          img.setAttribute('loading', 'lazy');
        }
      });
    });
  });
}

/**
 * Service Worker prefetch strategy
 */
export function setupServiceWorkerPrefetch(urls: string[]): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'PREFETCH_URLS',
      urls,
    });
  }
}

/**
 * Predict and prefetch next navigation
 */
export class NavigationPredictor {
  private history: string[] = [];
  private predictions = new Map<string, string[]>();
  private manager: ResourceHintsManager;

  constructor() {
    this.manager = new ResourceHintsManager();
    this.trackNavigation();
  }

  private trackNavigation(): void {
    if (typeof window === 'undefined') return;

    // Track current page
    this.history.push(window.location.pathname);

    // Listen for navigation
    window.addEventListener('popstate', () => {
      this.history.push(window.location.pathname);
      this.updatePredictions();
    });
  }

  private updatePredictions(): void {
    // Simple prediction: if we've visited A then B multiple times,
    // predict B when we're on A
    if (this.history.length < 2) return;

    const current = this.history[this.history.length - 2];
    const next = this.history[this.history.length - 1];

    if (!this.predictions.has(current)) {
      this.predictions.set(current, []);
    }

    const predicted = this.predictions.get(current)!;
    if (!predicted.includes(next)) {
      predicted.push(next);
    }
  }

  public prefetchPredicted(): void {
    const current = window.location.pathname;
    const predicted = this.predictions.get(current) || [];

    predicted.forEach((path) => {
      this.manager.prefetch([{ href: path, as: 'document' }]);
    });
  }
}

// Export singleton instances
export const resourceHintsManager = new ResourceHintsManager();
export const navigationPredictor = new NavigationPredictor();

export default {
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
};
