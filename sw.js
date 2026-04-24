const CACHE = 'hsa-v1';
const ASSETS = ['/hsa-dashboard/'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Sempre buscar da rede (dados do Dropbox precisam estar frescos)
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
