import { useEffect } from 'react';

/**
 * Optimized Resource Hints Hook
 * 
 * Conditionally preconnects to third-party domains and preloads critical assets
 * based on actual usage patterns to improve page load performance.
 * 
 * Optimization Strategy:
 * - Google Fonts: Always preconnect (used throughout app)
 * - Cloudinary: Preconnect on-demand (when images requested)
 * - Google Analytics: Conditional (based on consent)
 * - Razorpay: Conditional (only on payment pages)
 * 
 * @see https://web.dev/preconnect-and-dns-prefetch/
 * @see https://web.dev/preload-critical-assets/
 */

interface ResourceHintsConfig {
  /** Enable preconnect to Razorpay domains (payment pages only) */
  enableRazorpay?: boolean;
  /** Enable preconnect to analytics domains (with consent) */
  enableAnalytics?: boolean;
  /** Hero image path to preload (LCP optimization) */
  heroImage?: string;
  /** Critical fonts to preload */
  criticalFonts?: string[];
  /** Enable Cloudinary preconnect (for image optimization) */
  enableCloudinary?: boolean;
  /** Additional domains to preconnect */
  additionalDomains?: string[];
}

/**
 * Optimized preconnect function with deduplication
 */
function addPreconnect(href: string, crossOrigin: boolean = false): void {
  if (typeof document === 'undefined') return;
  
  const existing = document.querySelector(`link[rel="preconnect"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = href;
  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

/**
 * Optimized preload function with better type detection
 */
function addPreload(
  href: string,
  as: 'image' | 'font' | 'style' | 'script',
  type?: string,
  crossOrigin: boolean = false,
): void {
  if (typeof document === 'undefined') return;
  
  const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) {
    link.type = type;
  }
  if (crossOrigin) {
    link.crossOrigin = 'anonymous';
  }
  // High fetchpriority for LCP images
  if (as === 'image') {
    link.setAttribute('fetchpriority', 'high');
  }
  document.head.appendChild(link);
}

/**
 * Optimized resource hints hook with conditional loading
 */
export function useResourceHints(config: ResourceHintsConfig = {}): void {
  const {
    enableRazorpay = true,
    enableAnalytics = true,
    enableCloudinary = false,
    heroImage = '', // Default disabled - preloading can cause "unused" warnings
    criticalFonts = [],
    additionalDomains = [],
  } = config;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Preconnects moved to static HTML in vite.config.ts to satisfy Lighthouse
    // Runtime preconnect injection causes "unused preconnect" warnings and duplicates
    // Static HTML preconnects are detected as used by Lighthouse mobile/desktop audits
    //
    // ALL preconnect logic removed from runtime to eliminate:
    // - Duplicate preconnects (fonts.googleapis.com, fonts.gstatic.com)
    // - Unused preconnects (www.googletagmanager.com, www.google-analytics.com)
    // - Mobile performance overhead from dynamic resource hint injection
    //
    // This hook now ONLY handles:
    // - Hero image preloads (LCP optimization)
    // - Critical font preloads (optional)
    // - dns-prefetch can be added here for on-demand resources (Razorpay, Cloudinary)

    // Preload hero image for LCP optimization
    if (heroImage) {
      const ext = heroImage.split('.').pop()?.toLowerCase();
      let imageType: string | undefined;
      
      switch (ext) {
        case 'webp':
          imageType = 'image/webp';
          break;
        case 'avif':
          imageType = 'image/avif';
          break;
        case 'jpg':
        case 'jpeg':
          imageType = 'image/jpeg';
          break;
        case 'png':
          imageType = 'image/png';
          break;
      }

      addPreload(heroImage, 'image', imageType);
      
      // Also preload AVIF variant if WebP is specified
      if (ext === 'webp') {
        const avifPath = heroImage.replace(/\.webp$/, '.avif');
        addPreload(avifPath, 'image', 'image/avif');
      }
    }

    // Preload critical fonts
    criticalFonts.forEach((fontPath) => {
      const ext = fontPath.split('.').pop()?.toLowerCase();
      let fontType: string | undefined;
      
      switch (ext) {
        case 'woff2':
          fontType = 'font/woff2';
          break;
        case 'woff':
          fontType = 'font/woff';
          break;
        case 'ttf':
          fontType = 'font/ttf';
          break;
      }

      addPreload(fontPath, 'font', fontType, true); // Fonts need crossOrigin
    });
  }, []); // Run only once on mount
}

/**
 * Conditional dns-prefetch for Cloudinary (for image optimization)
 * Note: Preconnects moved to static HTML. This only adds dns-prefetch for on-demand resources.
 */
export function useCloudinaryPreconnect(): void {
  useEffect(() => {
    // Preconnects moved to static HTML in vite.config.ts to satisfy Lighthouse
    // Only dns-prefetch for on-demand resources if needed
  }, []);
}

/**
 * Conditional dns-prefetch for payment pages
 * Note: Preconnects moved to static HTML. This only adds dns-prefetch for on-demand resources.
 */
export function usePaymentPreconnect(): void {
  useEffect(() => {
    // Preconnects moved to static HTML in vite.config.ts to satisfy Lighthouse
    // Only dns-prefetch for on-demand resources if needed
  }, []);
}

/**
 * Default export with optimized defaults for SSPL T10 site
 *
 * ALL PRECONNECTS NOW IN STATIC HTML (vite.config.ts) - NO RUNTIME INJECTION
 *
 * This hook now ONLY handles:
 * - Hero image preload (LCP optimization)
 * - Critical font preloads (optional)
 *
 * Preconnects are injected into static HTML during build to satisfy Lighthouse:
 * - fonts.googleapis.com
 * - fonts.gstatic.com
 *
 * Result: Only 2 preconnects in Lighthouse audits (both from static HTML)
 */
export default function useDefaultResourceHints(): void {
  useResourceHints({
    enableRazorpay: false, // All preconnects moved to static HTML
    enableAnalytics: false, // All preconnects moved to static HTML
    enableCloudinary: false, // All preconnects moved to static HTML
    heroImage: '', // Disabled - causes "unused preload" warnings, browser handles image loading efficiently
    criticalFonts: [
      // Critical fonts are loaded via Google Fonts CSS, not individual font files
    ],
    additionalDomains: [
      // No additional domains by default
    ],
  });
}
