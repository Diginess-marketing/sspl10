import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import viteCompression from 'vite-plugin-compression';
import type { Plugin } from 'vite';

// Import PWA plugin conditionally to prevent build failure
let VitePWA: any;
try {
  VitePWA = require('vite-plugin-pwa').VitePWA;
} catch (e) {
  console.warn('vite-plugin-pwa not found, skipping PWA configuration');
}

// Critical CSS for above-the-fold content
const criticalCSS = `
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:currentColor}
html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:Inter,Poppins,system-ui,sans-serif}
body{margin:0;line-height:inherit;background:#fff;color:#111827}
#root{min-height:100vh;display:flex;flex-direction:column}
:root{--background:0 0% 100%;--foreground:222.2 84% 4.9%;--sport-orange:25 100% 50%;--sport-teal:217 91% 35%;--sport-dark:26 31% 10%;--sport-gold:45 100% 55%;--sport-green:142 76% 23%;--sport-white:0 0% 100%}
.hero-background{background-attachment:scroll}
.relative{position:relative}.absolute{position:absolute}.inset-0{inset:0}.z-10{z-index:10}.z-20{z-index:20}.flex{display:flex}.hidden{display:none}.items-center{align-items:center}.justify-center{justify-center}.w-full{width:100%}.h-full{height:100%}.min-h-screen{min-height:100vh}.overflow-hidden{overflow:hidden}.text-white{color:#fff}.text-center{text-align:center}.font-bold{font-weight:700}.font-black{font-weight:900}.text-5xl{font-size:3rem;line-height:1}.text-6xl{font-size:3.75rem;line-height:1}.drop-shadow-2xl{filter:drop-shadow(0 25px 25px rgb(0 0 0/0.15))}.animate-pulse{animation:pulse 2s cubic-bezier(0.4,0,0.6,1)infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.bg-gradient-to-br{background-image:linear-gradient(to bottom right,var(--tw-gradient-stops))}.from-black\\/10{--tw-gradient-from:rgb(0 0 0/0.1)}.to-black\\/10{--tw-gradient-to:rgb(0 0 0/0.1)}
#root:empty::before{content:"Loading...";display:flex;align-items:center;justify-content:center;min-height:100vh;font-size:1.5rem;color:#666}
`.replace(/\n/g, '');

// Plugin to inject critical CSS and optimize loading
function performanceOptimizationPlugin(): Plugin {
  return {
    name: 'performance-optimization',
    enforce: 'post', // Run after other plugins
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        // Inject critical CSS before closing head tag
        html = html.replace(
          '</head>',
          `<style>${criticalCSS}</style>\n</head>`,
        );
        
        // Add defer to Razorpay script if not already present
        html = html.replace(
          /<script src="https:\/\/checkout\.razorpay\.com\/v1\/checkout\.js"><\/script>/g,
          '<script defer src="https://checkout.razorpay.com/v1/checkout.js"></script>',
        );
        
        // Make CSS load with preload + async pattern
        html = html.replace(
          /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g,
          '<link rel="preload" as="style" href="$1"><link rel="stylesheet" href="$1" media="print" onload="this.media=\'all\';this.onload=null"><noscript><link rel="stylesheet" href="$1"></noscript>',
        );
        
        // Add async font loading before closing head
    const fontLoading = `
  <!-- Async Font Loading (preload removed to avoid unused-preload warnings) -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Bebas+Neue&family=Oswald:wght@300;400;500;600;700;800&display=swap" media="print" onload="this.media='all';this.onload=null">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Bebas+Neue&family=Oswald:wght@300;400;500;600;700;800&display=swap"></noscript>
`;
        
        // Only add if not already present
        if (!html.includes('Async Font Loading')) {
          html = html.replace('</head>', `${fontLoading}</head>`);
        }

        // For localhost preview, prevent SW (re)registration by removing the injected script tag.
        const localSwGuardScript = `
  <script>
    (function(){
      try {
        var host = location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
          var swScript = document.getElementById('vite-plugin-pwa:register-sw');
          if (swScript && swScript.parentNode) {
            swScript.parentNode.removeChild(swScript);
            console.info('[SW] Disabled register script for localhost preview');
          }
        }
      } catch (e) {}
    })();
  </script>`;
        if (!html.includes('Disabled register script for localhost preview')) {
          html = html.replace('</head>', `${localSwGuardScript}\n</head>`);
        }

        // When explicitly requested via ?sw=off on localhost, unregister any existing SW
        // and clear caches to avoid stale assets during preview.
        const localSwUnregisterScript = `
  <script>
    (function(){
      try {
        var host = location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
          var qs = new URLSearchParams(location.search);
          if (qs.get('sw') === 'off') {
            if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
              navigator.serviceWorker.getRegistrations().then(function(regs){
                regs.forEach(function(r){ r.unregister(); });
              });
            }
            if (window.caches && window.caches.keys) {
              caches.keys().then(function(keys){ keys.forEach(function(k){ caches.delete(k); }); });
            }
            console.info('[SW] Unregistered all and cleared caches (sw=off)');
          }
        }
      } catch (e) {}
    })();
  </script>`;
        if (!html.includes('Unregistered all and cleared caches (sw=off)')) {
          html = html.replace('</head>', `${localSwUnregisterScript}\n</head>`);
        }
        // Sanitize any percent-encoded filenames inside srcset/imagesrcset attributes
        // This handles cases where filenames were percent-encoded earlier ("%20") and then
        // double-encoded during the build ("%2520"). We decode the attribute value,
        // replace whitespace with hyphens (to match renamed public files), and write it back.
        try {
          html = html.replace(/(imagesrcset|srcset)="([^"]+)"/g, (_, attr, val) => {
            try {
              // Each value is a comma-separated list of "URL [descriptor]" entries
              // We want to sanitize only the URL part (replace spaces with '-') and
              // leave the descriptor (e.g. "480w") intact.
              const items = val.split(',').map((item: string) => {
                const seg = item.trim();
                const lastSpace = seg.lastIndexOf(' ');
                if (lastSpace === -1) {
                  // No descriptor — treat whole segment as URL
                  const decodedUrl = decodeURIComponent(seg);
                  return decodedUrl.replace(/\s+/g, '-');
                }
                const urlPart = seg.slice(0, lastSpace);
                const descPart = seg.slice(lastSpace + 1);
                const decodedUrl = decodeURIComponent(urlPart);
                const safeUrl = decodedUrl.replace(/\s+/g, '-');
                return `${safeUrl  } ${  descPart}`;
              });
              return `${attr  }="${  items.join(', ')  }"`;
            } catch (e) {
              return _;
            }
          });
        } catch (e) {
          // no-op on any unexpected errors during sanitization
        }

        return html;
      },
    },
  };
}

// Build the plugins array conditionally
const plugins = [
  react() as any, // Type assertion to resolve version incompatibility
  performanceOptimizationPlugin(),
  // Brotli and Gzip compression for production builds
  viteCompression({
    algorithm: 'brotliCompress',
    ext: '.br',
    threshold: 10240, // Only compress files > 10KB
    deleteOriginFile: false,
  }),
  viteCompression({
    algorithm: 'gzip',
    ext: '.gz',
    threshold: 10240,
    deleteOriginFile: false,
  }),
];

// Add PWA plugin only if it's available
if (VitePWA) {
  plugins.push(
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // Disable service worker registration to avoid localhost caching issues
      workbox: {
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // 30 MB limit for large gallery images
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'SSPL T10 Cricket League',
        short_name: 'SSPL T10',
        description: 'Ultimate T10 cricket tournament platform',
        theme_color: '#1f2937',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  );
} else {
  console.warn('PWA plugin not available, skipping PWA configuration');
}

export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Add debugging for path resolution
  define: {
    __VITE_BASE_DIR__: JSON.stringify(__dirname),
    __VITE_SRC_DIR__: JSON.stringify(path.resolve(__dirname, 'src')),
  },
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5174,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173,
    // Disable proxy in preview mode since analytics is disabled
    proxy: {},
    // Enable compression for preview server
    cors: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
  plugins,
  build: {
    outDir: 'dist', // Explicitly set output directory
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        // Silence noisy module-level directive warnings from some React libraries ("use client")
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        defaultHandler(warning);
      },
      output: {
        /**
         * Manual chunk splitting for optimal code splitting and caching.
         * Separates vendor libraries into dedicated chunks to improve:
         * - Browser caching (vendor code changes less frequently)
         * - Parallel loading (browser can load multiple chunks simultaneously)
         * - Build performance (smaller individual chunks compile faster)
         */
        manualChunks: (id) => {
          // React core libraries - these rarely change and are used everywhere
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/scheduler')) {
            return 'vendor.react';
          }
          
          // React Router - separate chunk for better caching
          if (id.includes('node_modules/react-router')) {
            return 'vendor.router';
          }
          
          // Utility libraries - helper functions and common tools
          if (id.includes('node_modules/lodash') ||
              id.includes('node_modules/date-fns') ||
              id.includes('node_modules/clsx') ||
              id.includes('node_modules/class-variance-authority') ||
              id.includes('node_modules/tailwind-merge')) {
            return 'vendor.utils';
          }
          
          // UI component libraries split by package
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor.radix';
          }
          
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor.icons';
          }
          
          // Form libraries
          if (id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/@hookform') ||
              id.includes('node_modules/zod')) {
            return 'vendor.forms';
          }
          
          // Query/State management
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'vendor.query';
          }
          
          // Analytics and tracking - non-critical
          if (id.includes('node_modules/@supabase') ||
              id.includes('node_modules/firebase') ||
              id.includes('node_modules/@sentry')) {
            return 'vendor.analytics';
          }
          
          // Charts and visualization
          if (id.includes('node_modules/recharts')) {
            return 'vendor.charts';
          }
        },
        
        /**
         * Entry file naming with content hash for cache busting.
         * Format: assets/[name]-[hash].js
         * Example: assets/index-a1b2c3d4.js
         */
        entryFileNames: (chunkInfo) => {
          return 'assets/[name]-[hash].js';
        },
        
        /**
         * Chunk file naming with content hash.
         * Applies to all code-split chunks (lazy loaded routes, vendors, etc.)
         */
        chunkFileNames: (chunkInfo) => {
          return 'assets/[name]-[hash].js';
        },
        
        /**
         * Asset file naming with organized directory structure.
         * Images: assets/images/[name]-[hash].ext
         * CSS: assets/css/[name]-[hash].css
         * Others: assets/[name]-[hash].ext
         */
        assetFileNames: (assetInfo) => {
          // Sanitize asset filenames to avoid spaces and double-encoding issues
          // (e.g. "ravi mohan home with bg-1024w.avif" -> "ravi-mohan-home-with-bg-1024w.avif").
          // This prevents generated HTML from containing double-encoded sequences like "%2520".
          const originalName = assetInfo.name || '';
          // Decode any existing percent-encoding then replace whitespace with dashes
          const decoded = decodeURIComponent(originalName);
          const safeName = decoded.replace(/\s+/g, '-');

          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif)$/i.test(decoded)) {
            return `assets/images/${safeName}-[hash][extname]`;
          }
          if (/\.(css)$/i.test(decoded)) {
            return `assets/css/${safeName}-[hash][extname]`;
          }
          if (/\.(woff|woff2|ttf|eot)$/i.test(decoded)) {
            return `assets/fonts/${safeName}-[hash][extname]`;
          }
          return `assets/${safeName}-[hash][extname]`;
        },
      },
    },
    
    /**
     * CSS Code Splitting - Enabled
     * Splits CSS into separate files per route/component for better caching.
     * Benefits:
     * - Smaller initial CSS bundle (only critical CSS loads first)
     * - Better caching (route-specific CSS doesn't invalidate on other changes)
     * - Faster page transitions (CSS already loaded for visited routes)
     */
    cssCodeSplit: true,
    
    /**
     * CSS Minification - Using esbuild for speed
     * esbuild is 10-100x faster than other minifiers with comparable results
     */
    cssMinify: 'esbuild',
    
    /**
     * Source Maps - Disabled in production
     * Reduces bundle size by ~20-30% and prevents source code exposure.
     * Enable in development via --sourcemap flag if debugging production build.
     */
    sourcemap: false,
    
    /**
     * JavaScript Minification - Terser with aggressive compression
     * Terser provides better compression than esbuild (~5-10% smaller)
     * at the cost of slower build times (acceptable for production builds)
     */
    minify: 'terser',
    
    /**
     * Terser Options - Production-optimized configuration
     */
    terserOptions: {
      compress: {
        /**
         * drop_console: Remove all console.* calls
         * Reduces bundle size and prevents logging in production
         */
        drop_console: true,
        
        /**
         * drop_debugger: Remove debugger statements
         * Prevents accidental debugging in production
         */
        drop_debugger: true,
        
        /**
         * pure_funcs: Mark these functions as side-effect-free for removal
         * Explicitly removes these functions even if assigned to variables
         */
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        
        /**
         * passes: Number of compression passes (1-3)
         * More passes = smaller output but slower build
         * 2 is optimal balance for most projects
         */
        passes: 2,
        
        /**
         * dead_code: Remove unreachable code
         * Eliminates if (false) blocks, unused functions, etc.
         */
        dead_code: true,
        
        /**
         * keep_infinity: Don't convert Infinity to 1/0
         * Slightly larger but more readable and debuggable
         */
        keep_infinity: true,
        
        /**
         * arrows: Convert functions to arrow functions where possible
         * Slightly smaller output
         */
        arrows: true,
        
        /**
         * collapse_vars: Inline variables that are used once
         * Reduces variable declarations and assignments
         */
        collapse_vars: true,
        
        /**
         * reduce_vars: Optimize variable assignments and usage
         */
        reduce_vars: true,
      },
      
      /**
       * Output format options
       */
      format: {
        /**
         * comments: Remove all comments from output
         * Reduces bundle size and prevents license disclosure
         * (licenses are preserved in separate LICENSE file)
         */
        comments: false,
        
        /**
         * ecma: Target ECMAScript version (2020 = ES11)
         * Modern browsers support ES2020, allows for smaller output
         */
        ecma: 2020,
      },
      
      /**
       * mangle: Shorten variable/function names (a, b, c, etc.)
       * Significantly reduces bundle size (~30-40%)
       */
      mangle: {
        safari10: true, // Fix Safari 10 bugs
      },
    },
    
    /**
     * Chunk Size Warning Limit - 500KB (reduced for better performance)
     * Warns if any chunk exceeds this size
     * Helps identify opportunities for further code splitting
     */
    chunkSizeWarningLimit: 500,
    
    /**
     * Module Preload - Disabled
     * Removes <link rel="modulepreload"> tags that can cause issues in some browsers
     * Modern browsers handle module loading efficiently without explicit preload
     */
    modulePreload: {
      polyfill: false,
    },
    
    /**
     * Assets Inline Limit - 4096 bytes (4KB)
     * Files smaller than 4KB are inlined as base64 data URLs.
     * Benefits:
     * - Reduces HTTP requests for small assets
     * - Faster loading for tiny images/fonts
     * Tradeoffs:
     * - Slightly larger bundle size (base64 is ~33% larger than binary)
     * - No separate caching for inlined assets
     * - Recommended: 2048-8192 bytes depending on project needs
     */
    assetsInlineLimit: 4096,
    
    /**
     * Report Compressed Size - Enabled
     * Shows gzipped bundle sizes in build output
     * Helps identify optimization opportunities
     */
    reportCompressedSize: true,
    
    /**
     * Target - Modern browsers only
     * Produces smaller, faster code by targeting ES2020+
     */
    target: 'es2020',
  },
});