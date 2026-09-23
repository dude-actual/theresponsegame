const VERSION = 'trg-v17-1';
const CORE = ['./','./index.html','./v17-engine.js?v=17.1','./v17-ui.js?v=17.1','./v17.css?v=17.1','./assets/v17/harbor.svg','./assets/v17/harbor-dawn.svg','./assets/v17/fonts/barlow-condensed-semibold-latin.woff2','./assets/v17/fonts/ibm-plex-sans-latin-variable.woff2','./trg-mark.svg','./manifest.webmanifest'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('trg-') && key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok) { const saved = response.clone(); event.waitUntil(caches.open(VERSION).then(cache => cache.put(request, saved))); }
    return response;
  }).catch(async () => (await caches.match(request)) || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});
