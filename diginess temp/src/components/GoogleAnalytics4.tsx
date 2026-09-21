/**
 * Google Analytics 4 Component
 * 
 * Dynamically injects GA4 script using react-helmet-async.
 * Gracefully no-ops if ga4Id is undefined.
 * 
 * @usage
 * ```tsx
 * import GoogleAnalytics4 from '@/components/GoogleAnalytics4';
 * 
 * function App() {
 *   return (
 *     <>
 *       <GoogleAnalytics4 ga4Id={import.meta.env.VITE_GA4_ID} />
 *       {/ * rest of app * /}
 *     </>
 *   );
 * }
 * ```
 */

import { Helmet } from 'react-helmet-async';

interface GoogleAnalytics4Props {
  /**
   * GA4 Measurement ID (format: G-XXXXXXXXXX)
   * If undefined, component will no-op
   */
  ga4Id?: string;

  /**
   * Optional GA4 configuration
   */
  config?: {
    /**
     * Anonymize IP addresses
     * @default true
     */
    anonymize_ip?: boolean;

    /**
     * Respect Do Not Track browser setting
     * @default true
     */
    respect_do_not_track?: boolean;

    /**
     * Cookie expiration in seconds
     * @default 63072000 (2 years)
     */
    cookie_expires?: number;

    /**
     * Custom dimensions
     */
    custom_map?: Record<string, string>;

    /**
     * Additional configuration options
     */
    [key: string]: any;
  };

  /**
   * Enable debug mode
   * @default false
   */
  debug?: boolean;
}

/**
 * Google Analytics 4 Component
 * 
 * Injects GA4 tracking script via react-helmet-async.
 * No-ops if ga4Id is not provided.
 */
export default function GoogleAnalytics4({
  ga4Id,
  config = {},
  debug = false,
}: GoogleAnalytics4Props) {
  // No-op if GA4 ID is not provided
  if (!ga4Id || ga4Id.trim() === '') {
    if (debug) {
    }
    return null;
  }

  // Validate GA4 ID format (G-XXXXXXXXXX)
  if (!/^G-[A-Z0-9]+$/.test(ga4Id)) {
    return null;
  }

  // Default configuration
  const defaultConfig = {
    anonymize_ip: true,
    respect_do_not_track: true,
    cookie_expires: 63072000, // 2 years
    ...config,
  };

  if (debug) {
  }

  return (
    <Helmet>
      {/* Google Tag Manager Script */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
      />

      {/* GA4 Initialization Script */}
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga4Id}', ${JSON.stringify(defaultConfig)});
          ${debug ? '' : ''}
        `}
      </script>
    </Helmet>
  );
}

/**
 * Type declarations for gtag
 */
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
