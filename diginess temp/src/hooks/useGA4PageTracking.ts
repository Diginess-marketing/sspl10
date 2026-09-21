/**
 * GA4 Page Tracking Hook
 * 
 * Automatically tracks pageviews on React Router route changes.
 * Integrates with Google Analytics 4 via gtag.
 * 
 * @usage
 * ```tsx
 * import useGA4PageTracking from '@/hooks/useGA4PageTracking';
 * 
 * function App() {
 *   useGA4PageTracking(import.meta.env.VITE_GA4_ID);
 *   return <Routes>...</Routes>;
 * }
 * ```
 */

import { useEffect, useRef } from 'react';
import { useLocation, type Location as RouterLocation } from 'react-router-dom';

interface GA4PageTrackingOptions {
  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Custom page title function
   * @default () => document.title
   */
  getPageTitle?: () => string;

  /**
   * Custom page path function
   * @default (location) => location.pathname + location.search
   */
  getPagePath?: (location: RouterLocation) => string;

  /**
   * Custom parameters to include with every pageview
   */
  customParams?: Record<string, any>;

  /**
   * Delay in milliseconds before tracking pageview
   * Useful for waiting for dynamic title updates
   * @default 0
   */
  trackingDelay?: number;
}

/**
 * Hook to track page views with GA4 on route changes
 * 
 * @param ga4Id - GA4 Measurement ID (G-XXXXXXXXXX). If undefined, tracking is disabled.
 * @param options - Configuration options
 */
export default function useGA4PageTracking(
  ga4Id?: string,
  options: GA4PageTrackingOptions = {},
) {
  const location = useLocation();
  const previousPath = useRef<string>('');

  const {
    debug = false,
    getPageTitle = () => document.title,
    getPagePath = (loc: RouterLocation) => loc.pathname + loc.search,
    customParams = {},
    trackingDelay = 0,
  } = options;

  useEffect(() => {
    // No-op if GA4 ID is not provided
    if (!ga4Id || ga4Id.trim() === '') {
      if (debug) {
      }
      return;
    }

    // Check if gtag is available
    if (typeof window === 'undefined' || !window.gtag) {
      if (debug) {
      }
      return;
    }

    // Get current page info
    const pagePath = getPagePath(location);
    const pageTitle = getPageTitle();

    // Skip duplicate tracking (prevents double-tracking on mount)
    if (previousPath.current === pagePath) {
      if (debug) {
      }
      return;
    }

    // Track pageview after optional delay
    const timeoutId = setTimeout(() => {
      try {
        const eventParams = {
          page_title: pageTitle,
          page_location: window.location.href,
          page_path: pagePath,
          ...customParams,
        };

        window.gtag('event', 'page_view', eventParams);

        if (debug) {
        }

        // Update previous path
        previousPath.current = pagePath;
      } catch (error) {
      }
    }, trackingDelay);

    return () => clearTimeout(timeoutId);
  }, [location, ga4Id, debug, getPageTitle, getPagePath, customParams, trackingDelay]);
}

/**
 * Helper function to manually track custom events
 * 
 * @example
 * ```ts
 * trackGA4Event('button_click', {
 *   button_name: 'Register Now',
 *   button_location: 'hero_section'
 * });
 * ```
 */
export function trackGA4Event(
  eventName: string,
  eventParams?: Record<string, any>,
  debug = false,
) {
  if (typeof window === 'undefined' || !window.gtag) {
    if (debug) {
    }
    return;
  }

  try {
    window.gtag('event', eventName, eventParams);

    if (debug) {
    }
  } catch (error) {
  }
}

/**
 * Type declarations for gtag (if not already declared)
 */
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
