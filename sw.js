// 솔비 메모 PWA — Service Worker
// index.html은 네트워크 우선(최신 반영), 정적 자원만 cache-first
const CACHE = 'sobi-memo-v4';
const ASSETS = ['./manifest.json', './icon-192.svg', './icon-512.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 외부 API(script.google.com) 요청은 그대로 통과
  if (!url.origin.endsWith(self.location.origin.split('//')[1])) return;
  // index.html: 네트워크 우선
  if (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')) {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  // 정적 자원: 캐시 우선
  e.respondWith(caches.match(req).then(c => c || fetch(req).then(r => {
    const clone = r.clone();
    caches.open(CACHE).then(cache => cache.put(req, clone)).catch(()=>{});
    return r;
  })));
});
