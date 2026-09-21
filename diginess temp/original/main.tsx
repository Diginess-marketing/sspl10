import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/hero-responsive.css';

// Add diagnostic logging for build detection
const devLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
  }
};

const validateEnvironmentVariables = () => {
  if (!import.meta.env.DEV) {
    return;
  }

  devLog('🔍 Starting environment variable validation...');
  devLog('Current environment:', import.meta.env.MODE);
  devLog('Available env vars:', Object.keys(import.meta.env));

  const requiredVars = [
    'VITE_API_URL',
    'VITE_RAZORPAY_KEY_ID',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  ];

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    const value = import.meta.env[varName];
    if (!value) {
      missingVars.push(varName);
    } else {
      devLog(`✅ Found: ${varName}`);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  }

  devLog('🎯 App initialization starting...');
};

const bootstrapAsyncSystems = () => {
  // Shared defer helper for non-critical work
  const deferNonCritical = (callback: () => void, fallbackDelay = 1000) => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout: fallbackDelay });
    } else {
      setTimeout(callback, fallbackDelay);
    }
  };

  // Initialize resource hints for critical resources
  deferNonCritical(() => {
    import('./utils/resourceHints')
      .then(({ setupEarlyHints, setupAdaptivePrefetch }) => {
        try {
          setupEarlyHints();
          setupAdaptivePrefetch();
        } catch (error) {
          if (import.meta.env.DEV) {
          }
        }
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
        }
      });
  }, 1000);

  // Critical: Session manager - load immediately (kept on main path)
  import('./utils/sessionManager')
    .then(({ sessionManager }) => {
      try {
        sessionManager.initialize();
      } catch (error) {
        if (import.meta.env.DEV) {
        }
      }
    })
    .catch((error) => {
      if (import.meta.env.DEV) {
      }
    });

  // Non-critical group: Sentry + GA + performance monitoring + bundle hints
  if (import.meta.env.PROD) {
    const scheduleNonCriticalMonitoring = () => {
      deferNonCritical(() => {
        // Initialize Sentry (guarded + lazy)
        import('./utils/sentry')
          .then(({ initSentry }) => {
            try {
              const result = initSentry();
              // Handle async initSentry
              if (result instanceof Promise) {
                result.catch((error) => {
                  if (import.meta.env.DEV) {
                  }
                });
              }
            } catch (error) {
              if (import.meta.env.DEV) {
              }
            }
          })
          .catch((error) => {
            if (import.meta.env.DEV) {
            }
          });

        // Ensure GA stubbed in index-enhanced.html is upgraded by loading GA script lazily
        if (typeof window !== 'undefined' && typeof (window as any).__SSPLT10_LOAD_GA__ === 'function') {
          try {
            (window as any).__SSPLT10_LOAD_GA__();
          } catch {
            // Fail-safe: do not break app if GA loader throws
          }
        }

        // Performance monitoring (heavy RUM) - optional and lazy
        if (import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true') {
          deferNonCritical(() => {
            import('./utils/performanceMonitoring')
              .then(({ PerformanceMonitor, sendMetricsToAnalytics }) => {
                const monitor = PerformanceMonitor.getInstance();
                monitor.initializeMonitoring(async (metrics) => {
                  try {
                    await sendMetricsToAnalytics(metrics);
                  } catch (error) {
                    if (import.meta.env.DEV) {
                    }
                  }
                });
              })
              .catch((error) => {
                if (import.meta.env.DEV) {
                }
              });
          }, 2000);
        }

        // Bundle optimization / resource hints - small, safe optimization
        deferNonCritical(() => {
          import('./utils/bundleOptimization')
            .then(({ setupResourceHints }) => {
              try {
                setupResourceHints();
              } catch (error) {
                if (import.meta.env.DEV) {
                }
              }
            })
            .catch((error) => {
              if (import.meta.env.DEV) {
              }
            });
        }, 2000);
      }, 2500);
    };

    if (document.readyState === 'complete') {
      scheduleNonCriticalMonitoring();
    } else {
      window.addEventListener('load', scheduleNonCriticalMonitoring, { once: true });
    }
  } else {
    // In DEV: keep only lightweight helpers; avoid heavy monitoring/analytics.
    deferNonCritical(() => {
      import('./utils/bundleOptimization')
        .then(({ setupResourceHints }) => {
          try {
            setupResourceHints();
          } catch (error) {
          }
        })
        .catch(() => {
          // Silent in dev to avoid noise
        });
    }, 1500);
  }
};

const renderApp = () => {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root element not found');
  }

  const root = createRoot(container);
  root.render(<App />);
};

try {
  validateEnvironmentVariables();
  renderApp();
  bootstrapAsyncSystems();
} catch (error) {
  console.error('Failed to initialize the application:', error);
}
