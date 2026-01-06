// Minimal Service Worker for Android PWA recognition
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', e => {}); // no caching yet
