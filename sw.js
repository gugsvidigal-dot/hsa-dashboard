// HSA Dashboard — Service Worker
// Estratégia: Network First (sem cache agressivo para evitar versões desatualizadas)

const CACHE_NAME = 'hsa-v1777158187';

// Ao instalar, não pré-cacheia nada
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Ao ativar, limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: sempre busca da rede; fallback para cache só se offline
self.addEventListener('fetch', event => {
  // Ignora requests que não são GET
  if (event.request.method !== 'GET') return;

  // Ignora requests externos (Dropbox, APIs, CDNs)
  const url = new URL(event.request.url);
  if (!url.origin.includes(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Só cacheia o index.html como fallback offline
        if (url.pathname.endsWith('index.html') || url.pathname === '/') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
