/**
 * Network-Aware Performance Optimization
 * Adapts loading strategies based on network conditions
 */

export type NetworkSpeed = 'slow' | 'medium' | 'fast';
export type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g';

export interface NetworkInfo {
  effectiveType: EffectiveConnectionType;
  downlink: number;
  rtt: number;
  saveData: boolean;
  speed: NetworkSpeed;
}

/**
 * Get current network information
 */
export function getNetworkInfo(): NetworkInfo {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
      speed: 'fast',
    };
  }

  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType || '4g';
  const downlink = connection?.downlink || 10;
  const rtt = connection?.rtt || 50;
  const saveData = connection?.saveData || false;

  let speed: NetworkSpeed = 'fast';
  if (effectiveType === 'slow-2g' || effectiveType === '2g' || saveData) {
    speed = 'slow';
  } else if (effectiveType === '3g' || downlink < 2) {
    speed = 'medium';
  }

  return {
    effectiveType,
    downlink,
    rtt,
    saveData,
    speed,
  };
}

/**
 * Check if user prefers reduced data usage
 */
export function shouldReduceData(): boolean {
  const networkInfo = getNetworkInfo();
  return networkInfo.saveData || networkInfo.speed === 'slow';
}

/**
 * Get image quality based on network speed
 */
export function getAdaptiveImageQuality(baseQuality: number = 85): number {
  const networkInfo = getNetworkInfo();

  switch (networkInfo.speed) {
    case 'slow':
      return Math.max(50, baseQuality - 35);
    case 'medium':
      return Math.max(60, baseQuality - 20);
    case 'fast':
    default:
      return baseQuality;
  }
}

/**
 * Get adaptive video quality
 */
export function getAdaptiveVideoQuality(): '360p' | '480p' | '720p' | '1080p' {
  const networkInfo = getNetworkInfo();

  switch (networkInfo.speed) {
    case 'slow':
      return '360p';
    case 'medium':
      return '480p';
    case 'fast':
    default:
      return '1080p';
  }
}

/**
 * Determine if heavy features should be loaded
 */
export function shouldLoadHeavyFeatures(): boolean {
  const networkInfo = getNetworkInfo();
  return networkInfo.speed === 'fast' && !networkInfo.saveData;
}

/**
 * Get adaptive chunk loading strategy
 */
export function getChunkLoadingStrategy(): 'aggressive' | 'moderate' | 'conservative' {
  const networkInfo = getNetworkInfo();

  if (networkInfo.speed === 'slow' || networkInfo.saveData) {
    return 'conservative';
  }

  if (networkInfo.speed === 'medium') {
    return 'moderate';
  }

  return 'aggressive';
}

/**
 * Get adaptive prefetch count
 */
export function getAdaptivePrefetchCount(baseCount: number = 5): number {
  const networkInfo = getNetworkInfo();

  switch (networkInfo.speed) {
    case 'slow':
      return 0;
    case 'medium':
      return Math.max(1, Math.floor(baseCount / 2));
    case 'fast':
    default:
      return baseCount;
  }
}

/**
 * Determine batch size for API requests
 */
export function getAdaptiveBatchSize(maxSize: number = 50): number {
  const networkInfo = getNetworkInfo();

  switch (networkInfo.speed) {
    case 'slow':
      return Math.min(10, maxSize);
    case 'medium':
      return Math.min(25, maxSize);
    case 'fast':
    default:
      return maxSize;
  }
}

/**
 * Get adaptive timeout for requests
 */
export function getAdaptiveTimeout(baseTimeout: number = 30000): number {
  const networkInfo = getNetworkInfo();

  switch (networkInfo.speed) {
    case 'slow':
      return baseTimeout * 2;
    case 'medium':
      return baseTimeout * 1.5;
    case 'fast':
    default:
      return baseTimeout;
  }
}

/**
 * Network change listener
 */
export class NetworkMonitor {
  private listeners: Array<(info: NetworkInfo) => void> = [];
  private currentInfo: NetworkInfo;

  constructor() {
    this.currentInfo = getNetworkInfo();
    this.setupListener();
  }

  private setupListener(): void {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return;
    }

    const connection = (navigator as any).connection;
    connection?.addEventListener('change', () => {
      const newInfo = getNetworkInfo();
      if (this.hasSignificantChange(this.currentInfo, newInfo)) {
        this.currentInfo = newInfo;
        this.notifyListeners(newInfo);
      }
    });
  }

  private hasSignificantChange(oldInfo: NetworkInfo, newInfo: NetworkInfo): boolean {
    return (
      oldInfo.speed !== newInfo.speed ||
      oldInfo.saveData !== newInfo.saveData ||
      oldInfo.effectiveType !== newInfo.effectiveType
    );
  }

  private notifyListeners(info: NetworkInfo): void {
    this.listeners.forEach((listener) => {
      try {
        listener(info);
      } catch { /* listener error ignored */ }
    });
  }

  public onChange(callback: (info: NetworkInfo) => void): () => void {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public getInfo(): NetworkInfo {
    return this.currentInfo;
  }
}

/**
 * Adaptive resource loader
 */
export class AdaptiveResourceLoader {
  private networkMonitor: NetworkMonitor;
  private loadedResources = new Set<string>();

  constructor() {
    this.networkMonitor = new NetworkMonitor();
  }

  public async loadResource(
    url: string,
    options: {
      priority?: 'high' | 'medium' | 'low';
      required?: boolean;
    } = {},
  ): Promise<boolean> {
    const { priority = 'medium', required = false } = options;

    // Skip if already loaded
    if (this.loadedResources.has(url)) {
      return true;
    }

    // Check if we should load based on network
    if (!required && !this.shouldLoad(priority)) {
      return false;
    }

    try {
      const response = await fetch(url, {
        priority: priority === 'high' ? 'high' : 'low',
      } as any);

      if (response.ok) {
        this.loadedResources.add(url);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private shouldLoad(priority: 'high' | 'medium' | 'low'): boolean {
    const networkInfo = this.networkMonitor.getInfo();

    if (priority === 'high') {
      return true;
    }

    if (networkInfo.saveData) {
      return false;
    }

    if (priority === 'medium') {
      return networkInfo.speed !== 'slow';
    }

    return networkInfo.speed === 'fast';
  }

  public onNetworkChange(callback: (info: NetworkInfo) => void): () => void {
    return this.networkMonitor.onChange(callback);
  }
}

/**
 * Adaptive lazy loading configuration
 */
export function getAdaptiveLazyLoadConfig(): {
  rootMargin: string;
  threshold: number;
} {
  const networkInfo = getNetworkInfo();

  switch (networkInfo.speed) {
    case 'slow':
      return {
        rootMargin: '10px 0px',
        threshold: 0.5,
      };
    case 'medium':
      return {
        rootMargin: '50px 0px',
        threshold: 0.1,
      };
    case 'fast':
    default:
      return {
        rootMargin: '200px 0px',
        threshold: 0.01,
      };
  }
}

// Export singleton instances
export const networkMonitor = new NetworkMonitor();
export const adaptiveLoader = new AdaptiveResourceLoader();

export default {
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
};
