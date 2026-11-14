const CACHE_NAME = 'hitstar-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/songs.json',
  '/favicon.ico',
];

// install caches
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('PWA-Cache wird aufgebaut...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Alten PWA-Cache gelöscht:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// fetch from cache if offline
self.addEventListener('fetch', (event) => {
  // dont cache api routes
  if (event.request.url.includes('/api/') || event.request.url.includes('spotify.com')) {
    return; // Reicht den Request einfach direkt ans Internet weiter
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

