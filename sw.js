const CACHE_NAME = 'primeartifact-v3';
const STATIC_ASSETS = [
  '/css/style.css',
  '/js/navbar.js',
  '/js/interactive.js',
  '/js/effects.js',
  '/js/crypto-utils.js',
  '/js/clipboard.js',
  '/js/toast.js',
  '/js/theme.js',
  '/assets/logo.png',
  '/assets/favicon.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET and API requests entirely
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  // Navigation requests (HTML pages): network-first, cache the response for offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache a clean copy for offline use
          if (response.ok && !response.redirected) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
