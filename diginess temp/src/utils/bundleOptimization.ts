/**
 * Bundle Optimization & Code Splitting Configuration
 */

/**
 * Lazy-loaded route components
 */
export const LAZY_ROUTE_CONFIG = {
  // Main pages
  Index: () => import('../pages/Index'),
  Register: () => import('../pages/Register'),
  AboutUs: () => import('../pages/AboutUs'),
  HowItWorks: () => import('../pages/HowItWorks'),
  Enquiry: () => import('../pages/Enquiry'),
  TermsAndConditions: () => import('../pages/terms-and-conditions'),
  PrivacyPolicy: () => import('../pages/PrivacyPolicy'),
  QRScan: () => import('../pages/QRScan'),
  RegistrationSuccess: () => import('../pages/RegistrationSuccess'),
  NotFound: () => import('../pages/NotFound'),

  // Auth pages
  AuthPage: () => import('../pages/AuthPage'),
  TrialsWorkflow: () => import('../pages/TrialsWorkflow'),

  // Test pages
  ErrorHandlingTest: () => import('../components/ErrorHandlingTest'),
};

/**
 * Lazy-loaded component chunks
 */
export const LAZY_COMPONENT_CONFIG = {
  OptimizedImage: () => import('../components/OptimizedImage'),
  AnalyticsDashboard: () => import('../components/AnalyticsDashboard'),
  RewardsDashboard: () => import('../components/RewardsDashboard'),
  SSPLChatbot: () => import('../components/SSPLChatbot'),
};

/**
 * Critical paths that should be preloaded
 */
export const CRITICAL_ROUTES = [
  '/',
  '/register',
];

/**
 * Likely next page routes for prefetching
 */
export const PREFETCH_STRATEGY = {
  '/': ['/register'],
  '/register': ['/registration-success', '/'],
  '/about': ['/'],
};

/**
 * Preload critical JavaScript chunks
 */
export const preloadCriticalChunks = (chunkNames: string[]): void => {
  if (typeof document === 'undefined') return;

  chunkNames.forEach((chunkName) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = `/assets/js/${chunkName}.js`;
    document.head.appendChild(link);
  });
};

/**
 * Prefetch likely next page routes
 */
export const prefetchRoutes = (routePaths: string[]): void => {
  if (typeof document === 'undefined') return;

  routePaths.forEach((path) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'document';
    link.href = path;
    document.head.appendChild(link);
  });
};

/**
 * Predictive prefetch based on current route
 */
export const predictivePrefetch = (currentRoute: string): void => {
  const likelyRoutes = PREFETCH_STRATEGY[currentRoute as keyof typeof PREFETCH_STRATEGY];
  if (likelyRoutes) {
    prefetchRoutes(likelyRoutes);
  }
};

/**
 * DNS prefetch for external domains
 */
export const dnsPrefetch = (domains: string[]): void => {
  if (typeof document === 'undefined') return;

  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `https://${domain}`;
    document.head.appendChild(link);
  });
};

/**
 * Preconnect to external resources
 */
export const preconnect = (url: string, crossOrigin = true): void => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
};

/**
 * Setup resource hints for optimization (optimized version)
 * NOTE: Font preconnects (fonts.googleapis.com, fonts.gstatic.com) are now
 * injected in initial HTML via vite.config.ts to prevent Lighthouse "unused" warnings.
 * Runtime preconnects are NOT needed and cause duplicates.
 */
export const setupResourceHints = (): void => {
  // Font preconnects removed - now handled in vite.config.ts initial HTML injection
  // This prevents duplicate preconnects that Lighthouse flags as unused
};

/**
 * Setup resource hints for pages that use images (Cloudinary)
 */
export const setupImageResourceHints = (): void => {
  dnsPrefetch(['res.cloudinary.com']);
  preconnect('https://res.cloudinary.com');
};

/**
 * Setup resource hints for payment pages (Razorpay)
 */
export const setupPaymentResourceHints = (): void => {
  dnsPrefetch(['checkout.razorpay.com', 'api.razorpay.com']);
  preconnect('https://checkout.razorpay.com');
  preconnect('https://api.razorpay.com');
};

/**
 * Setup resource hints for analytics pages
 */
export const setupAnalyticsResourceHints = (): void => {
  dnsPrefetch([
    'www.googletagmanager.com',
    'www.google-analytics.com',
    'analytics.google.com',
  ]);
  preconnect('https://www.googletagmanager.com');
  preconnect('https://www.google-analytics.com');
};

/**
 * Dynamic import with error handling
 */
export const dynamicImport = async (
  modulePath: string,
  fallback?: React.ComponentType<any>,
): Promise<React.ComponentType<any>> => {
  try {
    // Vite cannot statically analyze arbitrary dynamic imports.
    // If this behavior is intentional, suppress the warning safely.
    // Reference: https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
    const module = await import(/* @vite-ignore */ modulePath);
    return module.default || module;
  } catch (error) {
    if (fallback) return fallback;
    throw error;
  }
};

/**
 * Measure bundle size and provide metrics
 */
export const generateBundleReport = async (): Promise<{
  totalSize: number;
  gzipSize: number;
  modules: Array<{ name: string; size: number }>;
}> => {
  // This would typically be called during build time
  // Using the vite-plugin-visualizer package
  return {
    totalSize: 0,
    gzipSize: 0,
    modules: [],
  };
};

/**
 * Code splitting recommendations
 */
export const CODE_SPLITTING_RECOMMENDATIONS = {
  target: {
    mainBundle: 250, // KB (gzipped)
    chunkSize: 100, // KB (gzipped)
  },
  splits: {
    vendor: ['react', 'react-dom', 'react-router-dom'],
    ui: ['@radix-ui/*', 'lucide-react'],
    charts: ['recharts'],
    supabase: ['@supabase/supabase-js'],
    utils: ['clsx', 'tailwind-merge', 'class-variance-authority', 'date-fns'],
  },
};

/**
 * Performance budgets
 */
export const PERFORMANCE_BUDGETS = {
  maxBundleSize: 300, // KB (gzipped)
  maxInitialChunkSize: 150, // KB (gzipped)
  maxLCP: 2500, // milliseconds
  maxFID: 100, // milliseconds
  maxCLS: 0.1,
  maxTTFB: 600, // milliseconds
  maxFCP: 1800, // milliseconds
};

export default {
  LAZY_ROUTE_CONFIG,
  LAZY_COMPONENT_CONFIG,
  CRITICAL_ROUTES,
  PREFETCH_STRATEGY,
  preloadCriticalChunks,
  prefetchRoutes,
  predictivePrefetch,
  dnsPrefetch,
  preconnect,
  setupResourceHints,
  setupImageResourceHints,
  setupPaymentResourceHints,
  setupAnalyticsResourceHints,
  dynamicImport,
  generateBundleReport,
  CODE_SPLITTING_RECOMMENDATIONS,
  PERFORMANCE_BUDGETS,
};
