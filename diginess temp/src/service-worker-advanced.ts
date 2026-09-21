/**
 * Advanced Service Worker for SSPL T10 Website
 * Implements cache-first, network-first, and stale-while-revalidate strategies
 */

declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  html: `html-${CACHE_VERSION}`,
  css: `css-${CACHE_VERSION}`,
  js: `js-${CACHE_VERSION}`,
  images: `images-${CACHE_VERSION}`,
  fonts: `fonts-${CACHE_VERSION}`,
  api: `api-${CACHE_VERSION}`,
};

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
];

// Cache-first resources (static assets with long cache)
const CACHE_FIRST_PATTERNS = [
  /\.(?:js|css|svg|gif|png|jpg|jpeg|webp|avif|woff|woff2|ttf)$/,
  /^https:\/\/fonts\.googleapis\.com\/.*/,
  /^https:\/\/fonts\.gstatic\.com\/.*/,
  /^https:\/\/cdn\.jsdelivr\.net\/.*/,
  /^https:\/\/cdnjs\.cloudflare\.com\/.*/,
];

// Network-first patterns (API calls, dynamic content)
const NETWORK_FIRST_PATTERNS = [
  /^https:\/\/api\./,
  /\/api\//,
  /\.html$/,
];

// Stale-while-revalidate patterns
const STALE_WHILE_REVALIDATE_PATTERNS = [
  /\.json$/,
  /\/data\//,
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAMES.html);
        await cache.addAll(STATIC_ASSETS);
        self.skipWaiting();
      } catch (error) {
      }
    })(),
  );
});

/**
 * Activate event - clean up old caches and claim clients
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      try {
        // Delete old cache versions
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => {
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              return caches.delete(cacheName);
            }
          }),
        );
        self.clients.claim();
      } catch (error) {
      }
    })(),
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine which strategy to use
  if (NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(networkFirst(request));
  } else if (STALE_WHILE_REVALIDATE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(staleWhileRevalidate(request));
  } else if (CACHE_FIRST_PATTERNS.some((pattern) => pattern.test(url.href || url.pathname))) {
    event.respondWith(cacheFirst(request));
  } else {
    // Default to network-first for unknown resources
    event.respondWith(networkFirst(request));
  }
});

/**
 * Cache-first strategy
 * Try cache first, fall back to network
 */
async function cacheFirst(request: Request): Promise<Response> {
  const cacheName = getCacheNameForRequest(request);

  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    const response = await fetch(request);

    if (response.ok && response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    return await caches.match(request) ||
      new Response('Offline - Resource not available', {
        status: 503,
        statusText: 'Service Unavailable',
      });
  }
}

/**
 * Network-first strategy
 * Try network first, fall back to cache
 */
async function networkFirst(request: Request): Promise<Response> {
  const cacheName = getCacheNameForRequest(request);

  try {
    const response = await Promise.race([
      fetch(request),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), 5000),
      ),
    ]);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    try {
      const cache = await caches.open(cacheName);
      const cached = await cache.match(request);

      if (cached) {
        return cached;
      }
    } catch (cacheError) {
    }

    // Return offline response
    if (request.destination === 'document') {
      // For HTML pages, try to return a custom offline page
      return new Response('Offline - Page not available', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      });
    }

    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Stale-while-revalidate strategy
 * Return cached version immediately, update cache in background
 */
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cacheName = getCacheNameForRequest(request);

  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Return cached response immediately
    if (cached) {
      // Update cache in background
      fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put(request, response);
          }
        })
        .catch((error) => {
        });

      return cached;
    }

    // No cache, try network
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Determine appropriate cache name for request
 */
function getCacheNameForRequest(request: Request): string {
  const url = new URL(request.url);

  if (url.pathname.endsWith('.js')) {
    return CACHE_NAMES.js;
  } if (url.pathname.endsWith('.css')) {
    return CACHE_NAMES.css;
  } if (/\.(png|jpg|jpeg|gif|svg|webp|avif)$/i.test(url.pathname)) {
    return CACHE_NAMES.images;
  } if (/\.(woff|woff2|ttf|eot)$/i.test(url.pathname)) {
    return CACHE_NAMES.fonts;
  } if (url.pathname.includes('/api/')) {
    return CACHE_NAMES.api;
  } if (url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    return CACHE_NAMES.html;
  }

  return CACHE_NAMES.html;
}

/**
 * Handle message from clients
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName)),
      ).then(() => {
        event.ports[0].postMessage({ success: true });
      });
    });
  }

  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    caches.keys().then((cacheNames) => {
      Promise.all(
        cacheNames.map(async (cacheName) => {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          return { cacheName, size: keys.length };
        }),
      ).then((info) => {
        event.ports[0].postMessage({ caches: info });
      });
    });
  }
});

export {};
