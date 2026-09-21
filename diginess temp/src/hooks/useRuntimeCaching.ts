// Runtime Caching Hook
// Provides dynamic content caching capabilities for React components

import { useEffect, useState, useCallback } from 'react';
import { cacheManager } from '../utils/cacheManager';

export interface RuntimeCacheOptions {
  cacheName?: string;
  maxAge?: number; // in milliseconds
  maxEntries?: number;
  strategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate';
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt?: number;
  version: string;
}

export function useRuntimeCaching<T = any>(
  key: string,
  options: RuntimeCacheOptions = {},
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const {
    cacheName = 'runtime-cache-v2.0',
    maxAge = 5 * 60 * 1000, // 5 minutes default
    maxEntries = 100,
    strategy = 'network-first',
  } = options;

  // Generate cache key
  const cacheKey = `runtime:${key}`;

  // Check if data is expired
  const isExpired = useCallback((entry: CacheEntry<T>) => {
    if (!entry.expiresAt) return false;
    return Date.now() > entry.expiresAt;
  }, []);

  // Get data from cache
  const getFromCache = useCallback(async (): Promise<CacheEntry<T> | null> => {
    if (!('caches' in window)) return null;

    try {
      const cache = await caches.open(cacheName);
      const response = await cache.match(cacheKey);

      if (!response) return null;

      const entry: CacheEntry<T> = await response.json();

      // Check if entry is expired
      if (isExpired(entry)) {
        await cache.delete(cacheKey);
        return null;
      }

      return entry;
    } catch (error) {
      return null;
    }
  }, [cacheKey, cacheName, isExpired]);

  // Save data to cache
  const saveToCache = useCallback(async (data: T): Promise<void> => {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open(cacheName);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + maxAge,
        version: 'v2.0.0',
      };

      const response = new Response(JSON.stringify(entry), {
        headers: {
          'content-type': 'application/json',
          'cache-control': `max-age=${Math.floor(maxAge / 1000)}`,
        },
      });

      await cache.put(cacheKey, response);

      // Clean up old entries if needed
      const keys = await cache.keys();
      if (keys.length > maxEntries) {
        // Remove oldest entries
        const entriesToDelete = keys.slice(0, keys.length - maxEntries);
        await Promise.all(entriesToDelete.map(key => cache.delete(key)));
      }
    } catch (error) {
    }
  }, [cacheKey, cacheName, maxAge, maxEntries]);

  // Fetch data with caching strategy
  const fetchWithCache = useCallback(async (
    fetchFn: () => Promise<T>,
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      let result: T;
      let fromCache = false;

      switch (strategy) {
        case 'cache-first': {
          // Try cache first, then network
          const cacheFirstEntry = await getFromCache();
          if (cacheFirstEntry) {
            setData(cacheFirstEntry.data);
            setIsFromCache(true);
            setLoading(false);
            return cacheFirstEntry.data;
          }
          // Cache miss - fetch from network
          result = await fetchFn();
          await saveToCache(result);
          setData(result);
          setIsFromCache(false);
          break;
        }

        case 'network-first':
          // Try network first, fallback to cache
          try {
            result = await fetchFn();
            await saveToCache(result);
            setData(result);
            setIsFromCache(false);
          } catch (networkError) {
            const networkFirstEntry = await getFromCache();
            if (networkFirstEntry) {
              result = networkFirstEntry.data;
              fromCache = true;
            } else {
              throw networkError;
            }
          }
          break;

        case 'stale-while-revalidate':
          // Return cached data immediately, then update in background
          const staleEntry = await getFromCache();
          if (staleEntry) {
            setData(staleEntry.data);
            setIsFromCache(true);
            // Update in background
            fetchFn()
              .then(async (freshData) => {
                await saveToCache(freshData);
                setData(freshData);
                setIsFromCache(false);
              })
              .catch((error) => {
              });
            setLoading(false);
            return staleEntry.data;
          } 
            // No cache, fetch from network
            result = await fetchFn();
            await saveToCache(result);
            setData(result);
            setIsFromCache(false);
          
          break;

        default:
          result = await fetchFn();
          await saveToCache(result);
          setData(result);
          setIsFromCache(false);
      }

      setLoading(false);
      return result;
    } catch (error) {
      setError(error as Error);
      setLoading(false);
      throw error;
    }
  }, [strategy, getFromCache, saveToCache]);

  // Clear cache for this key
  const clearCache = useCallback(async (): Promise<void> => {
    if (!('caches' in window)) return;

    try {
      const cache = await caches.open(cacheName);
      await cache.delete(cacheKey);
      setData(null);
      setIsFromCache(false);
    } catch (error) {
    }
  }, [cacheKey, cacheName]);

  // Refresh data (force network request)
  const refresh = useCallback(async (fetchFn: () => Promise<T>): Promise<T> => {
    await clearCache();
    return fetchWithCache(fetchFn);
  }, [clearCache, fetchWithCache]);

  // Initialize cache cleanup on mount
  useEffect(() => {
    // Periodic cache maintenance
    const maintenanceInterval = setInterval(() => {
      cacheManager.performMaintenance().catch(() => {});
    }, 30 * 60 * 1000); // Every 30 minutes

    return () => {
      clearInterval(maintenanceInterval);
    };
  }, []);

  return {
    data,
    loading,
    error,
    isFromCache,
    fetchWithCache,
    clearCache,
    refresh,
  };
}

// Specialized hook for API data
export function useApiCache<T = any>(
  endpoint: string,
  options: RuntimeCacheOptions = {},
) {
  return useRuntimeCaching<T>(
    `api:${endpoint}`,
    {
      strategy: 'network-first',
      maxAge: 5 * 60 * 1000, // 5 minutes
      ...options,
    },
  );
}

// Specialized hook for user data
export function useUserDataCache<T = any>(
  userId: string,
  dataType: string,
  options: RuntimeCacheOptions = {},
) {
  return useRuntimeCaching<T>(
    `user:${userId}:${dataType}`,
    {
      strategy: 'stale-while-revalidate',
      maxAge: 10 * 60 * 1000, // 10 minutes
      ...options,
    },
  );
}

// Specialized hook for static content
export function useStaticContentCache<T = any>(
  contentId: string,
  options: RuntimeCacheOptions = {},
) {
  return useRuntimeCaching<T>(
    `static:${contentId}`,
    {
      strategy: 'cache-first',
      maxAge: 60 * 60 * 1000, // 1 hour
      ...options,
    },
  );
}