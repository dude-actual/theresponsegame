/* Retire only the previous Response Game cache. No localStorage is modified. */
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const prefix=`trg-game:${self.registration.scope}:`;
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>key.startsWith(prefix)).map(key=>caches.delete(key)));
 await self.registration.unregister();
})()));
// No fetch handler: subsequent navigations return to the network.
