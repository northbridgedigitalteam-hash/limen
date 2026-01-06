const CACHE_NAME = "limen-offline-v1";
const OFFLINE_URL = "/index.html";

// Install event: cache offline page
self.addEventListener("install", async event => {
  const cache = await caches.open(CACHE_NAME);
  await cache.add(OFFLINE_URL);
  return self.skipWaiting();
});

// Activate event
self.addEventListener("activate", event => {
  event.waitUntil(clients.claim());
});

// Fetch handler
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        try {
          return await fetch(event.request);
        } catch (err) {
          return await cache.match(OFFLINE_URL);
        }
      })
    );
  }
});

