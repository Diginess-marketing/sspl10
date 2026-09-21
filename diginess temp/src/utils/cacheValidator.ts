// Cache Validation and Testing Utilities
// Comprehensive testing suite for caching implementation

export interface CacheValidationResult {
  passed: boolean;
  message: string;
  details?: any;
}

export interface CachePerformanceMetrics {
  cacheHitRate: number;
  averageResponseTime: number;
  cacheSize: number;
  storageUsage: number;
  lastTestTime: Date;
}

export class CacheValidator {
  private static instance: CacheValidator;
  private testResults: CacheValidationResult[] = [];
  private performanceMetrics: CachePerformanceMetrics | null = null;

  private constructor() {}

  static getInstance(): CacheValidator {
    if (!CacheValidator.instance) {
      CacheValidator.instance = new CacheValidator();
    }
    return CacheValidator.instance;
  }

  // Comprehensive cache validation test suite
  async runFullValidation(): Promise<CacheValidationResult[]> {
    this.testResults = [];

    // Basic cache API availability
    await this.testCacheAPISupport();

    // Service worker registration and activation
    await this.testServiceWorkerStatus();

    // Cache storage functionality
    await this.testCacheStorage();

    // Runtime caching strategies
    await this.testRuntimeCaching();

    // Cache cleanup mechanisms
    await this.testCacheCleanup();

    // Performance metrics
    await this.testPerformanceMetrics();

    // Offline functionality
    await this.testOfflineFunctionality();
    return this.testResults;
  }

  // Test 1: Cache API support
  private async testCacheAPISupport(): Promise<void> {
    const testName = 'Cache API Support';

    try {
      if (!('caches' in window)) {
        this.addTestResult(testName, false, 'Cache API not supported');
        return;
      }

      if (!('serviceWorker' in navigator)) {
        this.addTestResult(testName, false, 'Service Worker API not supported');
        return;
      }

      this.addTestResult(testName, true, 'Cache and Service Worker APIs supported');
    } catch (error) {
      this.addTestResult(testName, false, `Error testing Cache API: ${error}`);
    }
  }

  // Test 2: Service worker status
  private async testServiceWorkerStatus(): Promise<void> {
    const testName = 'Service Worker Status';

    try {
      if (!('serviceWorker' in navigator)) {
        this.addTestResult(testName, false, 'Service Worker not supported');
        return;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        this.addTestResult(testName, false, 'No service worker registered');
        return;
      }

      if (registration.active) {
        this.addTestResult(testName, true, `Service worker active (state: ${registration.active.state})`);
      } else {
        this.addTestResult(testName, false, 'Service worker registered but not active');
      }
    } catch (error) {
      this.addTestResult(testName, false, `Error checking service worker: ${error}`);
    }
  }

  // Test 3: Cache storage functionality
  private async testCacheStorage(): Promise<void> {
    const testName = 'Cache Storage Functionality';

    try {
      if (!('caches' in window)) {
        this.addTestResult(testName, false, 'Cache API not available');
        return;
      }

      // Test opening a cache
      const testCache = await caches.open('test-cache-validation');
      this.addTestResult(testName, true, 'Cache opened successfully');

      // Test storing and retrieving data
      const testData = { message: 'test', timestamp: Date.now() };
      const response = new Response(JSON.stringify(testData), {
        headers: { 'content-type': 'application/json' },
      });

      await testCache.put('/test-cache-entry', response);

      const retrievedResponse = await testCache.match('/test-cache-entry');
      if (retrievedResponse) {
        const retrievedData = await retrievedResponse.json();
        if (retrievedData.message === 'test') {
          this.addTestResult(testName, true, 'Cache storage and retrieval working');
        } else {
          this.addTestResult(testName, false, 'Retrieved data does not match stored data');
        }
      } else {
        this.addTestResult(testName, false, 'Could not retrieve stored data');
      }

      // Clean up
      await testCache.delete('/test-cache-entry');
      await caches.delete('test-cache-validation');

    } catch (error) {
      this.addTestResult(testName, false, `Cache storage test failed: ${error}`);
    }
  }

  // Test 4: Runtime caching strategies
  private async testRuntimeCaching(): Promise<void> {
    const testName = 'Runtime Caching Strategies';

    try {
      // Test different cache strategies by checking existing caches
      const cacheNames = await caches.keys();
      const expectedCaches = ['static-assets-v2.0', 'images-cache-v2.0', 'api-cache-v2.0'];

      let foundExpectedCaches = 0;
      for (const expectedCache of expectedCaches) {
        if (cacheNames.includes(expectedCache)) {
          foundExpectedCaches++;
        }
      }

      if (foundExpectedCaches > 0) {
        this.addTestResult(testName, true, `Found ${foundExpectedCaches}/${expectedCaches.length} expected caches`);
      } else {
        this.addTestResult(testName, false, 'No expected caches found');
      }

      // Test cache versioning
      const versionedCaches = cacheNames.filter(name => name.includes('v2.0'));
      if (versionedCaches.length > 0) {
        this.addTestResult(testName, true, `Found ${versionedCaches.length} versioned caches`);
      } else {
        this.addTestResult(testName, false, 'No versioned caches found');
      }

    } catch (error) {
      this.addTestResult(testName, false, `Runtime caching test failed: ${error}`);
    }
  }

  // Test 5: Cache cleanup mechanisms
  private async testCacheCleanup(): Promise<void> {
    const testName = 'Cache Cleanup Mechanisms';

    try {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name =>
        name.includes('cache') && !name.includes('v2.0'),
      );

      if (oldCaches.length === 0) {
        this.addTestResult(testName, true, 'No old cache versions detected');
      } else {
        this.addTestResult(testName, false, `Found ${oldCaches.length} old cache versions: ${oldCaches.join(', ')}`);
      }

      // Test cache size limits
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();

        if (cacheName.includes('api-cache') && keys.length > 50) {
          this.addTestResult(testName, false, `${cacheName} exceeds recommended size limit (50)`);
        } else if (cacheName.includes('images-cache') && keys.length > 200) {
          this.addTestResult(testName, false, `${cacheName} exceeds recommended size limit (200)`);
        } else {
          this.addTestResult(testName, true, `${cacheName} within size limits (${keys.length} entries)`);
        }
      }

    } catch (error) {
      this.addTestResult(testName, false, `Cache cleanup test failed: ${error}`);
    }
  }

  // Test 6: Performance metrics
  private async testPerformanceMetrics(): Promise<void> {
    const testName = 'Performance Metrics';

    try {
      // Test cache access performance
      const startTime = performance.now();

      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames.slice(0, 3)) { // Test first 3 caches
        const cache = await caches.open(cacheName);
        await cache.keys();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration < 1000) { // Should complete within 1 second
        this.addTestResult(testName, true, `Cache access performance good (${duration.toFixed(2)}ms)`);
      } else {
        this.addTestResult(testName, false, `Cache access performance slow (${duration.toFixed(2)}ms)`);
      }

      // Update performance metrics
      this.performanceMetrics = {
        cacheHitRate: 0, // Would need more complex tracking
        averageResponseTime: duration,
        cacheSize: cacheNames.length,
        storageUsage: 0, // Would need storage API
        lastTestTime: new Date(),
      };

    } catch (error) {
      this.addTestResult(testName, false, `Performance test failed: ${error}`);
    }
  }

  // Test 7: Offline functionality
  private async testOfflineFunctionality(): Promise<void> {
    const testName = 'Offline Functionality';

    try {
      // Check if we can simulate offline behavior
      const originalOnLine = navigator.onLine;

      // Test cache-only requests (simulate offline)
      const cache = await caches.open('static-assets-v2.0');
      const keys = await cache.keys();

      if (keys.length > 0) {
        // Try to match a cached resource
        const testRequest = keys[0];
        const cachedResponse = await cache.match(testRequest);

        if (cachedResponse) {
          this.addTestResult(testName, true, 'Offline cache functionality working');
        } else {
          this.addTestResult(testName, false, 'Cached resources not accessible');
        }
      } else {
        this.addTestResult(testName, false, 'No cached resources for offline testing');
      }

    } catch (error) {
      this.addTestResult(testName, false, `Offline functionality test failed: ${error}`);
    }
  }

  // Helper method to add test results
  private addTestResult(testName: string, passed: boolean, message: string, details?: any): void {
    this.testResults.push({
      passed,
      message: `${testName}: ${message}`,
      details,
    });
  }

  // Get validation summary
  getValidationSummary(): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
    results: CacheValidationResult[];
  } {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      results: this.testResults,
    };
  }

  // Get performance metrics
  getPerformanceMetrics(): CachePerformanceMetrics | null {
    return this.performanceMetrics;
  }

  // Export test results for debugging
  exportResults(): string {
    const summary = this.getValidationSummary();
    return JSON.stringify({
      summary,
      performance: this.performanceMetrics,
      timestamp: new Date().toISOString(),
    }, null, 2);
  }
}

// Export singleton instance and utility functions
export const cacheValidator = CacheValidator.getInstance();

export const runCacheValidation = () => cacheValidator.runFullValidation();
export const getCacheValidationSummary = () => cacheValidator.getValidationSummary();
export const getCachePerformanceMetrics = () => cacheValidator.getPerformanceMetrics();
export const exportCacheValidationResults = () => cacheValidator.exportResults();