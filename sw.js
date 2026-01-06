const CACHE_NAME = "limen-cache-v1";
const OFFLINE_URL = "/index.html"; // fallback page

// Install event: cache offline page and assets
self.addEventListener("install", async event => {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll([
    OFFLINE_URL,
    "/style.css",
    "/app.js",
    "/interventions.js",
    "/icon-192.png",
    "/icon-512.png"
  ]);
  self.skipWaiting();
});

// Activate event: claim clients immediately
self.addEventListener("activate", event => {
  event.waitUntil(clients.claim());
});

// Fetch event: serve cached content for navigation requests
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
  } else {
    // optional: cache other requests like CSS/JS/images
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});
