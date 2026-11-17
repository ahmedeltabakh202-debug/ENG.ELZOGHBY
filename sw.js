/* مقايسة — Service Worker (offline shell) */
const CACHE = 'moqayasa-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        try {
          const copy = res.clone();
          if (res.ok && (req.url.startsWith(self.location.origin))) {
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
        } catch (e) {}
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
