// Static Asset Optimization Utilities
// Optimizes cache-first strategy for static assets with advanced prefetching and preloading

export interface AssetOptimizationOptions {
  priority?: 'high' | 'medium' | 'low';
  preload?: boolean;
  prefetch?: boolean;
  cacheStrategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  maxAge?: number; // in milliseconds
}

export interface AssetManifest {
  [key: string]: {
    url: string;
    hash: string;
    size: number;
    type: string;
    priority: 'high' | 'medium' | 'low';
  };
}

class StaticAssetOptimizer {
  private static instance: StaticAssetOptimizer;
  private assetManifest: AssetManifest = {};
  private preloadQueue: Set<string> = new Set();
  private prefetchQueue: Set<string> = new Set();
  private loadedAssets: Set<string> = new Set();

  private constructor() {}

  static getInstance(): StaticAssetOptimizer {
    if (!StaticAssetOptimizer.instance) {
      StaticAssetOptimizer.instance = new StaticAssetOptimizer();
    }
    return StaticAssetOptimizer.instance;
  }

  // Load asset manifest
  async loadManifest(manifestUrl: string = '/asset-manifest.json'): Promise<void> {
    try {
      const response = await fetch(manifestUrl);
      if (response.ok) {
        this.assetManifest = await response.json();
      } else {
        await this.generateFallbackManifest();
      }
    } catch (error) {
      await this.generateFallbackManifest();
    }
  }

  // Generate fallback manifest by scanning the DOM
  private async generateFallbackManifest(): Promise<void> {
    const assets: AssetManifest = {};

    // Scan for CSS and JS assets
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    const scripts = document.querySelectorAll('script[src]');

    links.forEach((link, index) => {
      const href = link.getAttribute('href');
      if (href) {
        assets[`css-${index}`] = {
          url: href,
          hash: this.generateSimpleHash(href),
          size: 0, // Unknown
          type: 'css',
          priority: 'high',
        };
      }
    });

    scripts.forEach((script, index) => {
      const src = script.getAttribute('src');
      if (src) {
        assets[`js-${index}`] = {
          url: src,
          hash: this.generateSimpleHash(src),
          size: 0, // Unknown
          type: 'js',
          priority: 'high',
        };
      }
    });

    this.assetManifest = assets;
  }

  // Simple hash generation for cache busting
  private generateSimpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Optimize asset loading with cache-first strategy
  async optimizeAsset(assetKey: string, options: AssetOptimizationOptions = {}): Promise<void> {
    const asset = this.assetManifest[assetKey];
    if (!asset) {
      return;
    }

    const {
      priority = asset.priority || 'medium',
      preload = priority === 'high',
      prefetch = priority === 'medium',
      cacheStrategy = 'cache-first',
      maxAge = 24 * 60 * 60 * 1000, // 24 hours
    } = options;

    // Check if already loaded
    if (this.loadedAssets.has(assetKey)) {
      return;
    }

    try {
      // Cache-first strategy: check cache first
      if (cacheStrategy === 'cache-first' && 'caches' in window) {
        const cache = await caches.open('static-assets-v2.0');
        const cachedResponse = await cache.match(asset.url);

        if (cachedResponse) {
          // Check if cache is still valid
          const cacheDate = cachedResponse.headers.get('sw-cache-date');
          if (cacheDate) {
            const age = Date.now() - parseInt(cacheDate);
            if (age < maxAge) {
              this.loadedAssets.add(assetKey);
              return;
            }
          }
        }
      }

      // Preload high-priority assets
      if (preload) {
        this.preloadAsset(asset);
      }

      // Prefetch medium-priority assets
      if (prefetch) {
        this.prefetchAsset(asset);
      }

      this.loadedAssets.add(assetKey);
    } catch (error) {
    }
  }

  // Preload asset (load immediately)
  private preloadAsset(asset: AssetManifest[string]): void {
    const link = document.createElement('link');

    if (asset.type === 'css') {
      link.rel = 'preload';
      link.as = 'style';
      link.href = asset.url;
      link.onload = () => {
        // Convert preload to stylesheet
        link.rel = 'stylesheet';
      };
    } else if (asset.type === 'js') {
      link.rel = 'preload';
      link.as = 'script';
      link.href = asset.url;
      link.onload = () => {
        // Load the script
        const script = document.createElement('script');
        script.src = asset.url;
        script.async = true;
        document.head.appendChild(script);
      };
    }

    document.head.appendChild(link);
  }

  // Prefetch asset (load when idle)
  private prefetchAsset(asset: AssetManifest[string]): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = asset.url;
        document.head.appendChild(link);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = asset.url;
        document.head.appendChild(link);
      }, 100);
    }
  }

  // Batch optimize multiple assets
  async optimizeAssets(assetKeys: string[], options: AssetOptimizationOptions = {}): Promise<void> {
    const promises = assetKeys.map(key => this.optimizeAsset(key, options));
    await Promise.allSettled(promises);
  }

  // Optimize critical path assets
  async optimizeCriticalPath(): Promise<void> {
    const criticalAssets = Object.keys(this.assetManifest).filter(key => {
      const asset = this.assetManifest[key];
      return asset.priority === 'high' || asset.type === 'css';
    });

    await this.optimizeAssets(criticalAssets, {
      priority: 'high',
      preload: true,
      cacheStrategy: 'cache-first',
    });
  }

  // Optimize assets for current page
  async optimizeForPage(pageAssets: string[]): Promise<void> {
    // First, optimize critical path
    await this.optimizeCriticalPath();

    // Then optimize page-specific assets
    await this.optimizeAssets(pageAssets, {
      priority: 'medium',
      prefetch: true,
      cacheStrategy: 'cache-first',
    });
  }

  // Warm up cache for predicted navigation
  async warmupCache(predictedAssets: string[]): Promise<void> {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open('static-assets-v2.0');
      const cachePromises = predictedAssets.map(async (assetKey) => {
        const asset = this.assetManifest[assetKey];
        if (asset) {
          const response = await fetch(asset.url);
          if (response.ok) {
            const responseClone = response.clone();
            const headers = new Headers(responseClone.headers);
            headers.set('sw-cache-date', Date.now().toString());

            const cachedResponse = new Response(responseClone.body, {
              status: responseClone.status,
              statusText: responseClone.statusText,
              headers,
            });

            await cache.put(asset.url, cachedResponse);
          }
        }
      });

      await Promise.allSettled(cachePromises);
    } catch (error) {
    }
  }

  // Get asset loading performance metrics
  getPerformanceMetrics(): {
    loadedAssets: number;
    preloadQueue: number;
    prefetchQueue: number;
    manifestSize: number;
  } {
    return {
      loadedAssets: this.loadedAssets.size,
      preloadQueue: this.preloadQueue.size,
      prefetchQueue: this.prefetchQueue.size,
      manifestSize: Object.keys(this.assetManifest).length,
    };
  }

  // Clear optimization state (for testing)
  clearState(): void {
    this.loadedAssets.clear();
    this.preloadQueue.clear();
    this.prefetchQueue.clear();
  }
}

// Export singleton instance
export const staticAssetOptimizer = StaticAssetOptimizer.getInstance();

// Utility functions
export const optimizeCriticalAssets = () => staticAssetOptimizer.optimizeCriticalPath();
export const optimizePageAssets = (assets: string[]) => staticAssetOptimizer.optimizeForPage(assets);
export const warmupAssetCache = (assets: string[]) => staticAssetOptimizer.warmupCache(assets);
export const getAssetPerformanceMetrics = () => staticAssetOptimizer.getPerformanceMetrics();