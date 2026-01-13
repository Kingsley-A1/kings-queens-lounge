// Service Worker for Kings & Queens Restaurant PWA
const CACHE_NAME = "kings-queens-v1";
const OFFLINE_URL = "/index.html";

// Assets to cache on install
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/menu.html",
  "/about.html",
  "/contact.html",
  "/reservations.html",
  "/events.html",
  "/gallery.html",
  "/checkout.html",
  "/blog.html",
  "/404.html",
  "/styles/styles.css",
  "/styles/components.css",
  "/scripts/main.js",
  "/scripts/menu.js",
  "/scripts/modal.js",
  "/scripts/products.js",
  "/scripts/checkout.js",
  "/scripts/contact.js",
  "/scripts/animations.js",
  "/scripts/pwa.js",
  "/assets/icons/icon-512.png",
  "/manifest.json",
];

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching app shell");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.log("[SW] Cache failed:", err))
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        event.waitUntil(updateCache(event.request));
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Network failed, return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          return new Response("Offline", { status: 503 });
        });
    })
  );
});

// Helper to update cache in background
async function updateCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response);
    }
  } catch (err) {
    // Silently fail - we already have cached version
  }
}

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
