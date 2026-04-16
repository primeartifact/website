const CACHE_NAME = 'primeartifact-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/navbar.js',
  '/js/interactive.js',
  '/js/effects.js',
  '/js/crypto-utils.js',
  '/js/clipboard.js',
  '/assets/logo.png',
  '/assets/favicon.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found, otherwise fetch network
        return response || fetch(event.request);
      })
  );
});
