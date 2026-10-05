// Activate only after all old game tabs close; serve one immutable release.
const RELEASE = '17.5.0-rc.1';
const PREFIX = `trg-game:${self.registration.scope}:`;
const VERSION = PREFIX + RELEASE;
const CORE = ['./','./index.html','./v17-engine.js?v=17.5.0-rc.1','./v17-scenes.js?v=17.5.0-rc.1','./v17-ui.js?v=17.5.0-rc.1','./v17.css?v=17.5.0-rc.1','./assets/v17/harbor.svg','./assets/v17/harbor-dawn.svg','./assets/v17/fonts/barlow-condensed-semibold-latin.woff2','./assets/v17/fonts/ibm-plex-sans-latin-variable.woff2','./trg-mark.svg','./manifest.webmanifest'];
const urls = new Set(CORE.map(path=>new URL(path,self.registration.scope).href));
const home = new URL('./',self.registration.scope), index = new URL('./index.html',self.registration.scope);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(CORE)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== VERSION).map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== home.origin) return;
  const isHome=request.mode==='navigate'&&[home.pathname,index.pathname].includes(url.pathname);
  if(!isHome&&!urls.has(url.href))return;
  event.respondWith(caches.open(VERSION).then(async cache=>(await cache.match(isHome?index.href:request))||Response.error()));
});
