/* Kaku 1.8 — updateveilige offline cache */
const CACHE = 'kaku-offline-v9-layout18';
const APP_FILES = ['./', './index.html', './manifest.webmanifest', './icon.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('kaku-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(resp => {
      if (resp.ok) { const copy=resp.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); }
      return resp;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(cached => cached || fetch(req).then(resp=>{
    if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
    return resp;
  })));
});
