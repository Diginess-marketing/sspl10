import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import CricketPageLoader from './CricketPageLoader';
import { PerformanceMonitor } from '../utils/performanceMonitoring';

const CricketPageLoaderTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [metricsStatus, setMetricsStatus] = useState<'good' | 'warning' | 'poor'>('good');

  useEffect(() => {
    // Setup performance monitoring only if enabled
    if (import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true') {
      const monitor = PerformanceMonitor.getInstance();

      const handleMetrics = (metrics: any) => {
        setPerformanceMetrics(metrics);

        // Determine status based on Core Web Vitals thresholds
        let status: 'good' | 'warning' | 'poor' = 'good';
        if (
          (metrics.lcp && metrics.lcp > 2500) ||
          (metrics.fid && metrics.fid > 100) ||
          (metrics.cls && metrics.cls > 0.1)
        ) {
          status = 'poor';
        } else if (
          (metrics.lcp && metrics.lcp > 1800) ||
          (metrics.fid && metrics.fid > 50) ||
          (metrics.cls && metrics.cls > 0.05)
        ) {
          status = 'warning';
        }
        setMetricsStatus(status);

        // Send to analytics (optional)
        // sendMetricsToAnalytics(metrics);
      };

      monitor.initializeMonitoring(handleMetrics);
    }

  }, []);

  const getStatusColor = () => {
    switch (metricsStatus) {
      case 'good':
        return 'bg-green-50 border-green-500 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-800';
      case 'poor':
        return 'bg-red-50 border-red-500 text-red-800';
      default:
        return 'bg-blue-50 border-blue-500 text-blue-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>CricketPageLoader Test | SSPL T10</title>
        <meta name="description" content="Performance optimized cricket page loader component test with Core Web Vitals monitoring" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="CricketPageLoader Performance Test" />
        <meta property="og:description" content="Test page demonstrating cricket loader with real-time performance metrics" />
        <meta property="og:type" content="website" />
  {/** Removed outdated canonical to avoid incorrect SEO link on test-only page */}
      </Helmet>

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">CricketPageLoader Test Page</h1>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Loader Controls</h2>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setIsLoading(true)}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Show Loader
              </button>
              <button
                onClick={() => setIsLoading(false)}
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Hide Loader
              </button>
            </div>
          </div>

          {/* Performance Metrics Display */}
          {performanceMetrics && (
            <div className={`border-l-4 p-4 mb-8 rounded ${getStatusColor()}`}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>Core Web Vitals Metrics</span>
                <span className="text-xs px-2 py-1 bg-opacity-20 bg-current rounded">
                  {metricsStatus.toUpperCase()}
                </span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {performanceMetrics.lcp && (
                  <div className="p-2 bg-white bg-opacity-50 rounded">
                    <div className="font-semibold">LCP</div>
                    <div>{performanceMetrics.lcp.toFixed(0)}ms</div>
                    <div className="text-xs opacity-70">Largest Contentful Paint</div>
                  </div>
                )}
                {performanceMetrics.fid && (
                  <div className="p-2 bg-white bg-opacity-50 rounded">
                    <div className="font-semibold">FID</div>
                    <div>{performanceMetrics.fid.toFixed(0)}ms</div>
                    <div className="text-xs opacity-70">First Input Delay</div>
                  </div>
                )}
                {performanceMetrics.cls !== undefined && (
                  <div className="p-2 bg-white bg-opacity-50 rounded">
                    <div className="font-semibold">CLS</div>
                    <div>{performanceMetrics.cls.toFixed(3)}</div>
                    <div className="text-xs opacity-70">Cumulative Layout Shift</div>
                  </div>
                )}
                {performanceMetrics.ttfb && (
                  <div className="p-2 bg-white bg-opacity-50 rounded">
                    <div className="font-semibold">TTFB</div>
                    <div>{performanceMetrics.ttfb.toFixed(0)}ms</div>
                    <div className="text-xs opacity-70">Time to First Byte</div>
                  </div>
                )}
                {performanceMetrics.fcp && (
                  <div className="p-2 bg-white bg-opacity-50 rounded">
                    <div className="font-semibold">FCP</div>
                    <div>{performanceMetrics.fcp.toFixed(0)}ms</div>
                    <div className="text-xs opacity-70">First Contentful Paint</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optimization Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-blue-800 text-sm">
            <h3 className="font-semibold mb-2">✓ Optimizations Active</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Core Web Vitals monitoring enabled</li>
              <li>Service Worker caching strategies active</li>
              <li>Image lazy loading and responsive sizing</li>
              <li>Request caching for better performance</li>
            </ul>
          </div>
        </div>
      </div>

      <CricketPageLoader isLoading={isLoading} message="Testing cricket loader..." size="lg" showStadium={true} />
    </>
  );
};

export default CricketPageLoaderTest;