// Nova AI — минимальный service worker.
// Нужен главным образом для того, чтобы браузер считал приложение
// полноценным PWA (условие для установки и для работы Web Share Target
// на Android/Chrome), плюс даёт базовое офлайн-кеширование оболочки.
const CACHE='nova-ai-shell-v29';
const SHELL=['./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

// Стратегия: сеть в приоритете (чат всегда должен идти по свежим данным),
// офлайн-кеш оболочки — только как запасной вариант, если сети совсем нет.
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // Чужие адреса (сервисы озвучки Cartesia и т.п.) браузер загружает сам, в обход service worker —
  // иначе он мог мешать потоковому воспроизведению аудио.
  if(new URL(e.request.url).origin!==self.location.origin)return;
  e.respondWith(
    fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
  );
});
