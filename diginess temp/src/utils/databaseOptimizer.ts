import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

export interface QueryOptions {
  cache?: boolean;
  cacheTime?: number;
  retries?: number;
  timeout?: number;
}

export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  isFromCache?: boolean;
  executionTime: number;
}

// Simple in-memory cache for frequently accessed data
class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void { // 5 minutes default
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

const queryCache = new QueryCache();

// Clean up cache every 10 minutes
setInterval(() => queryCache.cleanup(), 10 * 60 * 1000);

class DatabaseOptimizer {
  private connectionPool: any[] = [];
  private maxPoolSize = 5;
  private activeConnections = 0;

  // Optimized query execution with caching and retry logic
  async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    options: QueryOptions = {},
  ): Promise<QueryResult<T>> {
    const startTime = performance.now();
    const {
      cache = false,
      cacheTime = 5 * 60 * 1000,
      retries = 3,
      timeout = 30000,
    } = options;

    // Generate cache key for this query
    const cacheKey = this.generateCacheKey(queryFn);

    // Check cache first
    if (cache) {
      const cachedData = queryCache.get(cacheKey);
      if (cachedData) {
        const executionTime = performance.now() - startTime;
        logger.debug('Query served from cache', { cacheKey, executionTime });
        return {
          data: cachedData,
          error: null,
          isFromCache: true,
          executionTime,
        };
      }
    }

    // Execute query with retry logic
    let lastError: any = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), timeout);
        });

        // Execute query with timeout
        const queryPromise = queryFn();
        const result = await Promise.race([queryPromise, timeoutPromise]);

        const executionTime = performance.now() - startTime;

        if (result.error) {
          throw new Error(result.error.message || 'Database query failed');
        }

        // Cache successful results
        if (cache && result.data) {
          queryCache.set(cacheKey, result.data, cacheTime);
        }

        logger.debug('Query executed successfully', {
          attempt,
          executionTime,
          cacheKey,
        });

        return {
          data: result.data,
          error: null,
          executionTime,
        };

      } catch (error) {
        lastError = error;
        logger.warn(`Query attempt ${attempt} failed`, {
          error: error.message,
          attempt,
          cacheKey,
        });

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    const executionTime = performance.now() - startTime;
    logger.error('Query failed after all retries', {
      error: lastError.message,
      cacheKey,
      executionTime,
    });

    return {
      data: null,
      error: lastError,
      executionTime,
    };
  }

  // Generate cache key from query function
  private generateCacheKey(queryFn: Function): string {
    // Simple cache key generation - in production, you'd want more sophisticated key generation
    return btoa(JSON.stringify(queryFn.toString().slice(0, 100)));
  }

  // Optimized select query
  async select<T>(
    table: string,
    options: {
      select?: string;
      filter?: Record<string, any>;
      orderBy?: string;
      limit?: number;
      cache?: boolean;
      cacheTime?: number;
    } = {},
  ): Promise<QueryResult<T[]>> {
    const queryFn = async () => {
      let query = supabase.from(table).select(options.select || '*');

      // Apply filters
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy);
      }

      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    };

    return this.executeQuery<T[]>(queryFn, {
      cache: options.cache,
      cacheTime: options.cacheTime,
    });
  }

  // Optimized insert with conflict resolution
  async insert<T>(
    table: string,
    data: Partial<T> | Partial<T>[],
    options: {
      onConflict?: string;
      returning?: string;
      retries?: number;
    } = {},
  ): Promise<QueryResult<T[]>> {
    const queryFn = async () => {
      let query = supabase.from(table).insert(data);

      if (options.onConflict) {
        query = query.onConflict(options.onConflict);
      }

      if (options.returning) {
        query = query.select(options.returning);
      }

      return await query;
    };

    return this.executeQuery<T[]>(queryFn, {
      retries: options.retries || 1, // Inserts typically don't need retries
      cache: false, // Don't cache inserts
    });
  }

  // Optimized update
  async update<T>(
    table: string,
    data: Partial<T>,
    filter: Record<string, any>,
    options: QueryOptions = {},
  ): Promise<QueryResult<T[]>> {
    const queryFn = async () => {
      let query = supabase.from(table).update(data);

      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      return await query.select();
    };

    return this.executeQuery<T[]>(queryFn, {
      ...options,
      cache: false, // Don't cache updates
    });
  }

  // Health check for database connection
  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const startTime = performance.now();

    try {
      const { error } = await supabase.from('admin_settings').select('id').limit(1);

      const latency = performance.now() - startTime;

      if (error) {
        logger.error('Database health check failed', { error: error.message });
        return { healthy: false, latency, error: error.message };
      }

      return { healthy: true, latency };
    } catch (error) {
      const latency = performance.now() - startTime;
      logger.error('Database health check error', { error });
      return { healthy: false, latency, error: error.message };
    }
  }

  // Clear cache
  clearCache(): void {
    queryCache.clear();
    logger.info('Database cache cleared');
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: queryCache['cache'].size,
      keys: Array.from(queryCache['cache'].keys()),
    };
  }

  // Batch operations for better performance
  async batchInsert<T>(
    table: string,
    data: Partial<T>[],
    batchSize: number = 100,
  ): Promise<QueryResult<T[]>> {
    const results: T[] = [];
    const startTime = performance.now();

    try {
      // Process in batches
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const batchResult = await this.insert(table, batch, { retries: 1 });

        if (batchResult.error) {
          throw batchResult.error;
        }

        if (batchResult.data) {
          results.push(...batchResult.data);
        }
      }

      const executionTime = performance.now() - startTime;
      logger.info('Batch insert completed', {
        totalRecords: data.length,
        batches: Math.ceil(data.length / batchSize),
        executionTime,
      });

      return {
        data: results,
        error: null,
        executionTime,
      };

    } catch (error) {
      const executionTime = performance.now() - startTime;
      logger.error('Batch insert failed', { error, executionTime });

      return {
        data: null,
        error: error as Error,
        executionTime,
      };
    }
  }
}

// Create singleton instance
export const dbOptimizer = new DatabaseOptimizer();

// Export cache instance for direct access if needed
export { queryCache };