const CACHE_NAME = "limen-cache-v1";
const OFFLINE_URL = "/index.html";

self.addEventListener("install", async event=>{
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll([OFFLINE_URL,"/style.css","/app.js","/interventions.js","/icon-192.png","/icon-512.png"]);
  self.skipWaiting();
});

self.addEventListener("activate", event=>{ event.waitUntil(clients.claim()); });

self.addEventListener("fetch", event=>{
  if(event.request.mode==="navigate"){
    event.respondWith(caches.open(CACHE_NAME).then(async cache=>{ try{return await fetch(event.request);} catch(err){return await cache.match(OFFLINE_URL);} }));
  } else { event.respondWith(caches.match(event.request).then(resp=>resp||fetch(event.request))); }
});
