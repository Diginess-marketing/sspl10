/**
 * Advanced Script Loading Optimization
 * Manages dynamic script loading with priority, caching, and error handling
 */

export type ScriptPriority = 'critical' | 'high' | 'medium' | 'low';
export type ScriptLoadStrategy = 'immediate' | 'idle' | 'visible' | 'interaction';

export interface ScriptConfig {
  src: string;
  priority?: ScriptPriority;
  strategy?: ScriptLoadStrategy;
  async?: boolean;
  defer?: boolean;
  module?: boolean;
  integrity?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  onLoad?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
  retries?: number;
}

export interface ScriptLoadResult {
  success: boolean;
  error?: Error;
  loadTime: number;
}

/**
 * Script Loader with advanced features
 */
export class ScriptLoader {
  private loadedScripts = new Map<string, Promise<ScriptLoadResult>>();
  private scriptElements = new Map<string, HTMLScriptElement>();
  private queue: ScriptConfig[] = [];
  private isProcessing = false;

  /**
   * Load a script with specified configuration
   */
  async load(config: ScriptConfig): Promise<ScriptLoadResult> {
    const { src, strategy = 'immediate' } = config;

    // Return cached promise if already loading/loaded
    if (this.loadedScripts.has(src)) {
      return this.loadedScripts.get(src)!;
    }

    // Create load promise based on strategy
    const loadPromise = this.createLoadPromise(config, strategy);
    this.loadedScripts.set(src, loadPromise);

    return loadPromise;
  }

  private createLoadPromise(
    config: ScriptConfig,
    strategy: ScriptLoadStrategy,
  ): Promise<ScriptLoadResult> {
    switch (strategy) {
      case 'immediate':
        return this.loadImmediately(config);

      case 'idle':
        return this.loadOnIdle(config);

      case 'visible':
        return this.loadWhenVisible(config);

      case 'interaction':
        return this.loadOnInteraction(config);

      default:
        return this.loadImmediately(config);
    }
  }

  /**
   * Load script immediately
   */
  private loadImmediately(config: ScriptConfig): Promise<ScriptLoadResult> {
    return this.executeLoad(config);
  }

  /**
   * Load script when browser is idle
   */
  private loadOnIdle(config: ScriptConfig): Promise<ScriptLoadResult> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(
          () => {
            this.executeLoad(config).then(resolve);
          },
          { timeout: config.timeout || 3000 },
        );
      } else {
        setTimeout(() => {
          this.executeLoad(config).then(resolve);
        }, 1000);
      }
    });
  }

  /**
   * Load script when element is visible
   */
  private loadWhenVisible(config: ScriptConfig): Promise<ScriptLoadResult> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        this.executeLoad(config).then(resolve);
        return;
      }

      // Create a sentinel element to observe
      const sentinel = document.createElement('div');
      sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;';
      document.body.appendChild(sentinel);

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            observer.disconnect();
            document.body.removeChild(sentinel);
            this.executeLoad(config).then(resolve);
          }
        },
        { threshold: 0 },
      );

      observer.observe(sentinel);
    });
  }

  /**
   * Load script on first user interaction
   */
  private loadOnInteraction(config: ScriptConfig): Promise<ScriptLoadResult> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        this.executeLoad(config).then(resolve);
        return;
      }

      const events = ['click', 'scroll', 'keydown', 'touchstart', 'mousemove'];
      let loaded = false;

      const loadScript = () => {
        if (loaded) return;
        loaded = true;

        events.forEach((event) => {
          window.removeEventListener(event, loadScript, { capture: true });
        });

        this.executeLoad(config).then(resolve);
      };

      events.forEach((event) => {
        window.addEventListener(event, loadScript, {
          once: true,
          passive: true,
          capture: true,
        });
      });

      // Fallback timeout
      setTimeout(() => {
        if (!loaded) {
          loadScript();
        }
      }, config.timeout || 5000);
    });
  }

  /**
   * Execute the actual script loading
   */
  private executeLoad(config: ScriptConfig): Promise<ScriptLoadResult> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const {
        src,
        async = true,
        defer = false,
        module = false,
        integrity,
        crossOrigin,
        onLoad,
        onError,
        timeout = 10000,
        retries = 2,
      } = config;

      const attemptLoad = (attemptsLeft: number) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = async;
        script.defer = defer;

        if (module) {
          script.type = 'module';
        }

        if (integrity) {
          script.integrity = integrity;
        }

        if (crossOrigin) {
          script.crossOrigin = crossOrigin;
        }

        let timeoutId: NodeJS.Timeout | null = null;

        const cleanup = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          script.removeEventListener('load', handleLoad);
          script.removeEventListener('error', handleError);
        };

        const handleLoad = () => {
          cleanup();
          this.scriptElements.set(src, script);

          const loadTime = performance.now() - startTime;
          const result: ScriptLoadResult = { success: true, loadTime };

          if (onLoad) {
            try {
              onLoad();
            } catch { /* user onLoad handler error ignored */ }
          }

          resolve(result);
        };

        const handleError = () => {
          cleanup();

          if (attemptsLeft > 0) {
            setTimeout(() => attemptLoad(attemptsLeft - 1), 1000);
          } else {
            const error = new Error(`Failed to load script: ${src}`);
            const loadTime = performance.now() - startTime;

            if (onError) {
              try {
                onError(error);
              } catch { /* user onError handler error ignored */ }
            }

            resolve({ success: false, error, loadTime });
          }
        };

        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);

        // Timeout handling
        timeoutId = setTimeout(() => {
          cleanup();
          script.remove();
          handleError();
        }, timeout);

        document.head.appendChild(script);
      };

      attemptLoad(retries);
    });
  }

  /**
   * Load multiple scripts in sequence
   */
  async loadSequential(configs: ScriptConfig[]): Promise<ScriptLoadResult[]> {
    const results: ScriptLoadResult[] = [];

    for (const config of configs) {
      const result = await this.load(config);
      results.push(result);

      // Stop on failure if script is critical
      if (!result.success && config.priority === 'critical') {
        break;
      }
    }

    return results;
  }

  /**
   * Load multiple scripts in parallel
   */
  async loadParallel(configs: ScriptConfig[]): Promise<ScriptLoadResult[]> {
    return Promise.all(configs.map((config) => this.load(config)));
  }

  /**
   * Preload a script (download but don't execute)
   */
  preload(src: string): void {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
  }

  /**
   * Unload a script
   */
  unload(src: string): void {
    const script = this.scriptElements.get(src);
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
      this.scriptElements.delete(src);
      this.loadedScripts.delete(src);
    }
  }

  /**
   * Check if script is loaded
   */
  isLoaded(src: string): boolean {
    return this.scriptElements.has(src);
  }

  /**
   * Get load statistics
   */
  getStats(): {
    loaded: number;
    failed: number;
    pending: number;
  } {
    return {
      loaded: this.scriptElements.size,
      failed: 0, // Would need to track failures separately
      pending: this.queue.length,
    };
  }
}

/**
 * Priority-based script queue
 */
export class PriorityScriptQueue {
  private queue: Map<ScriptPriority, ScriptConfig[]> = new Map([
    ['critical', []],
    ['high', []],
    ['medium', []],
    ['low', []],
  ]);

  private loader = new ScriptLoader();
  private isProcessing = false;

  add(config: ScriptConfig): void {
    const priority = config.priority || 'medium';
    const scripts = this.queue.get(priority) || [];
    scripts.push(config);
    this.queue.set(priority, scripts);

    this.process();
  }

  private async process(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    // Process in priority order
    const priorities: ScriptPriority[] = ['critical', 'high', 'medium', 'low'];

    for (const priority of priorities) {
      const scripts = this.queue.get(priority) || [];

      if (scripts.length > 0) {
        // Load critical scripts sequentially, others in parallel
        if (priority === 'critical') {
          await this.loader.loadSequential(scripts);
        } else {
          await this.loader.loadParallel(scripts);
        }

        this.queue.set(priority, []);
      }
    }

    this.isProcessing = false;
  }
}

/**
 * Third-party script manager
 */
export class ThirdPartyScriptManager {
  private loader = new ScriptLoader();
  private consentGiven = false;

  /**
   * Set user consent for third-party scripts
   */
  setConsent(granted: boolean): void {
    this.consentGiven = granted;
  }

  /**
   * Load Google Analytics
   */
  async loadGoogleAnalytics(measurementId: string): Promise<ScriptLoadResult> {
    if (!this.consentGiven) {
      return {
        success: false,
        error: new Error('User consent not given'),
        loadTime: 0,
      };
    }

    return this.loader.load({
      src: `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
      strategy: 'idle',
      async: true,
      onLoad: () => {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).gtag = function () {
          (window as any).dataLayer.push(arguments);
        };
        (window as any).gtag('js', new Date());
        (window as any).gtag('config', measurementId);
      },
    });
  }

  /**
   * Load Razorpay checkout
   */
  async loadRazorpay(): Promise<ScriptLoadResult> {
    return this.loader.load({
      src: 'https://checkout.razorpay.com/v1/checkout.js',
      strategy: 'interaction',
      async: false,
      priority: 'high',
    });
  }

  /**
   * Load Facebook Pixel
   */
  async loadFacebookPixel(pixelId: string): Promise<ScriptLoadResult> {
    if (!this.consentGiven) {
      return {
        success: false,
        error: new Error('User consent not given'),
        loadTime: 0,
      };
    }

    return this.loader.load({
      src: 'https://connect.facebook.net/en_US/fbevents.js',
      strategy: 'idle',
      async: true,
      onLoad: () => {
        (window as any).fbq = function () {
          (window as any).fbq.callMethod
            ? (window as any).fbq.callMethod.apply((window as any).fbq, arguments)
            : (window as any).fbq.queue.push(arguments);
        };
        (window as any).fbq.push = (window as any).fbq;
        (window as any).fbq.loaded = true;
        (window as any).fbq.version = '2.0';
        (window as any).fbq.queue = [];
        (window as any).fbq('init', pixelId);
        (window as any).fbq('track', 'PageView');
      },
    });
  }
}

// Export singleton instances
export const scriptLoader = new ScriptLoader();
export const priorityQueue = new PriorityScriptQueue();
export const thirdPartyManager = new ThirdPartyScriptManager();

export default {
  ScriptLoader,
  PriorityScriptQueue,
  ThirdPartyScriptManager,
  scriptLoader,
  priorityQueue,
  thirdPartyManager,
};
