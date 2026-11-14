/* Kaku 2.1 — illustraties en leerstof volledig offline. */
const CACHE='kaku-offline-v12-illustrated21';
const APP_FILES=['./','./index.html','./manifest.webmanifest','./icon.png',
 './notebook-frame.webp','./hero-art.webp',
 './kanji-sticker.png','./woorden-sticker.png','./zinnen-sticker.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('kaku-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 if(req.mode==='navigate'){
  e.respondWith(fetch(req).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));}return resp;}).catch(()=>caches.match('./index.html')));return;
 }
 e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return resp;})));
});
