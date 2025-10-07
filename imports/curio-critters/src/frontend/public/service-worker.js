

const CACHE_NAME = 'curio-critters-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/main.jsx',
  '/output.css',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/data/questions/math.json',
  '/data/questions/science.json'
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
        return response || fetch(event.request);
      })
  );
});
