// 종료된 PWA — 모든 캐시 제거 후 자기 자신 unregister
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll();
    clients.forEach(c => c.navigate(c.url));
  })());
});
