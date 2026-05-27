/**
 * Nummi Service Worker
 * Estrategia: Network-first para API, Cache-first para assets estáticos.
 */

const CACHE_NAME = "nummi-v1";

// Assets que se cachean en la instalación
const PRECACHE = ["/", "/index.html"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Peticiones a la API → siempre red (sin cachear)
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/auth") ||
      url.hostname !== location.hostname) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Navegación y assets → Network-first, fallback a cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
