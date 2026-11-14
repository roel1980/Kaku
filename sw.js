/* Kaku 4.0 — same local learning data; each separate asset cached offline. */
const CACHE='kaku-offline-v14-assets40';
const APP_FILES=[
  './',
  './badge-niveau.svg',
  './badge-status.svg',
  './boeken.svg',
  './dango.svg',
  './hout.png',
  './icon.png',
  './index.html',
  './kaart-kanji.svg',
  './kaart-woorden.svg',
  './kaart-zinnen.svg',
  './kat.png',
  './knop-primair-ingedrukt.svg',
  './knop-primair.svg',
  './knop-secundair.svg',
  './kopje.svg',
  './label-geel.svg',
  './label-roze.svg',
  './logo.png',
  './manifest.webmanifest',
  './paneel-antwoord.svg',
  './paneel-breed.svg',
  './paneel-hero.svg',
  './paneel-resultaat.svg',
  './paneel-standaard.svg',
  './paneel-statistiek.svg',
  './paneel-vraag.svg',
  './sakura.svg',
  './schrift.png',
  './sticker-kanji.svg',
  './sticker-woorden.svg',
  './sticker-zinnen.svg',
  './tab-instellingen-actief.svg',
  './tab-instellingen-normaal.svg',
  './tab-oefening-actief.svg',
  './tab-oefening-normaal.svg',
  './tab-overzicht-actief.svg',
  './tab-overzicht-normaal.svg',
  './tab-woordenlijst-actief.svg',
  './tab-woordenlijst-normaal.svg',
  './thema.css',
  './voortgang-bg.svg',
  './voortgang-fill.svg'
];
self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(APP_FILES)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('kaku-') && k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(resp=>{
      if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));}
      return resp;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(resp=>{
    if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));}
    return resp;
  })));
});
