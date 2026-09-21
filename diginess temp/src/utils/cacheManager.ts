// Cache Management Utilities
// Provides advanced cache versioning and cleanup mechanisms

export interface CacheStats {
  name: string;
  entries: number;
  size?: number;
  lastModified?: Date;
}

export interface CacheCleanupOptions {
  maxAge?: number; // in milliseconds
  maxEntries?: number;
  excludePatterns?: RegExp[];
}

export class CacheManager {
  private static instance: CacheManager;
  private cacheVersion = 'v2.0.0';

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Get detailed cache statistics
  async getCacheStats(): Promise<CacheStats[]> {
    if (!('caches' in window)) {
      return [];
    }

    try {
      const cacheNames = await caches.keys();
      const stats: CacheStats[] = [];

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        let totalSize = 0;

        // Calculate approximate size
        for (const request of keys) {
          try {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              totalSize += blob.size;
            }
          } catch (error) {
          }
        }

        stats.push({
          name: cacheName,
          entries: keys.length,
          size: totalSize,
          lastModified: new Date(),
        });
      }

      return stats;
    } catch (error) {
      return [];
    }
  }

  // Clean up old cache versions
  async cleanupOldVersions(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      const currentVersion = this.cacheVersion;

      for (const cacheName of cacheNames) {
        // Delete caches that don't match current version pattern
        if (cacheName.includes('-cache-') && !cacheName.includes(currentVersion)) {
          await caches.delete(cacheName);
        }
      }
    } catch (error) {
    }
  }

  // Clean up cache entries based on options
  async cleanupCache(cacheName: string, options: CacheCleanupOptions = {}): Promise<number> {
    if (!('caches' in window)) {
      return 0;
    }

    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      let deletedCount = 0;

      for (const request of keys) {
        let shouldDelete = false;

        // Check max entries
        if (options.maxEntries && keys.length > options.maxEntries) {
          shouldDelete = true;
        }

        // Check max age
        if (options.maxAge && !shouldDelete) {
          try {
            const response = await cache.match(request);
            if (response) {
              const dateHeader = response.headers.get('date');
              if (dateHeader) {
                const entryAge = Date.now() - new Date(dateHeader).getTime();
                if (entryAge > options.maxAge) {
                  shouldDelete = true;
                }
              }
            }
          } catch (error) {
          }
        }

        // Check exclude patterns
        if (options.excludePatterns && !shouldDelete) {
          for (const pattern of options.excludePatterns) {
            if (pattern.test(request.url)) {
              shouldDelete = false; // Don't delete if matches exclude pattern
              break;
            }
          }
        }

        if (shouldDelete) {
          await cache.delete(request);
          deletedCount++;
        }
      }
      return deletedCount;
    } catch (error) {
      return 0;
    }
  }

  // Perform comprehensive cache cleanup
  async performMaintenance(): Promise<void> {
    // Clean up old versions
    await this.cleanupOldVersions();

    // Clean up individual caches
    const maintenanceTasks = [
      // API cache - keep recent entries
      this.cleanupCache('api-cache-v2.0', {
        maxAge: 10 * 60 * 1000, // 10 minutes
        maxEntries: 50,
      }),

      // Images cache - keep longer
      this.cleanupCache('images-cache-v2.0', {
        maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
        maxEntries: 200,
      }),

      // Static assets - keep long term
      this.cleanupCache('static-assets-v2.0', {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxEntries: 100,
      }),

      // External resources - moderate cleanup
      this.cleanupCache('external-resources-v2.0', {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxEntries: 100,
      }),
    ];

    await Promise.all(maintenanceTasks);
  }

  // Clear all caches (for development/debugging)
  async clearAllCaches(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName)),
      );
    } catch (error) {
    }
  }

  // Get cache storage usage
  async getStorageUsage(): Promise<{ used: number; available: number; quota: number } | null> {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0),
        quota: estimate.quota || 0,
      };
    } catch (error) {
      return null;
    }
  }

  // Send cache stats to service worker
  async notifyServiceWorker(type: string, data?: any): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({
        type,
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Utility functions for easy access
export const getCacheStats = () => cacheManager.getCacheStats();
export const cleanupOldVersions = () => cacheManager.cleanupOldVersions();
export const performCacheMaintenance = () => cacheManager.performMaintenance();
export const clearAllCaches = () => cacheManager.clearAllCaches();
export const getStorageUsage = () => cacheManager.getStorageUsage();