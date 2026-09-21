// Safe Service Worker with Instant Updates
// Version: 1.0.0
const CACHE_NAME = 'sspl-v1.0.0';
const STATIC_CACHE = 'sspl-static-v1.0.0';
const DYNAMIC_CACHE = 'sspl-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt'
];

// API endpoints that should not be cached
const API_ENDPOINTS = [
  '/api/',
  '/health'
];

// Function to check if request is for API
function isApiRequest(url) {
  return API_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

// Function to check if request is for static asset
function isStaticAsset(url) {
  return url.includes('/assets/') ||
         url.includes('.js') ||
         url.includes('.css') ||
         url.includes('.png') ||
         url.includes('.jpg') ||
         url.includes('.jpeg') ||
         url.includes('.gif') ||
         url.includes('.svg') ||
         url.includes('.webp') ||
         url.includes('.ico') ||
         url.includes('.woff') ||
         url.includes('.woff2') ||
         url.includes('.ttf') ||
         url.includes('.eot');
}

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('SW: Install event');
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('SW: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).catch(err => {
      console.error('SW: Failed to cache static assets:', err);
    })
  );
});

// Activate event - clean old caches and claim clients
self.addEventListener('activate', event => {
  console.log('SW: Activate event');

  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests
  if (isApiRequest(url.pathname)) return;

  // Skip external requests
  if (!url.origin.includes(self.location.origin)) return;

  // Handle different types of requests
  if (isStaticAsset(url.pathname)) {
    // Cache-first for static assets
    event.respondWith(cacheFirst(event.request));
  } else if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    // Network-first for HTML pages
    event.respondWith(networkFirst(event.request));
  } else {
    // Stale-while-revalidate for other resources
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

// Cache-first strategy
function cacheFirst(request) {
  return caches.match(request).then(cachedResponse => {
    if (cachedResponse) {
      return cachedResponse;
    }

    return fetch(request).then(response => {
      // Cache successful responses
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(STATIC_CACHE).then(cache => {
          cache.put(request, responseClone);
        });
      }
      return response;
    });
  });
}

// Network-first strategy
function networkFirst(request) {
  return fetch(request).then(response => {
    // Cache successful responses
    if (response.status === 200) {
      const responseClone = response.clone();
      caches.open(DYNAMIC_CACHE).then(cache => {
        cache.put(request, responseClone);
      });
    }
    return response;
  }).catch(() => {
    // Fallback to cache
    return caches.match(request);
  });
}

// Stale-while-revalidate strategy
function staleWhileRevalidate(request) {
  return caches.match(request).then(cachedResponse => {
    const fetchPromise = fetch(request).then(response => {
      // Update cache with fresh response
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(request, responseClone);
        });
      }
      return response;
    });

    // Return cached response immediately if available
    if (cachedResponse) {
      return cachedResponse;
    }

    // Otherwise wait for network
    return fetchPromise;
  });
}

// Message event - handle update requests
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});