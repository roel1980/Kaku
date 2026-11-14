/* Kaku 4.2.2 — isolated assets, offline-first PWA. Progress remains in localStorage. */
const CACHE='kaku-offline-v17-book422';
const APP_FILES=[
  "./",
  "./badge-niveau.svg",
  "./hout.png",
  "./boek-boven.png",
  "./boek-boven-portret.png",
  "./boek-boven-telefoon.png",
  "./boek-papier-voorgrond-telefoon.png",
  "./boek-papier-voorgrond-portret.png",
  "./boek-midden-herhaal.png",
  "./boek-onder.png",
  "./boek-papier-voorgrond.png",
  "./ico-kanji-41.svg",
  "./ico-woorden-41.svg",
  "./ico-zinnen-41.svg",
  "./icon.png",
  "./index.html",
  "./kaart-kanji.svg",
  "./kaart-woorden.svg",
  "./kaart-zinnen.svg",
  "./kat.png",
  "./knop-primair-ingedrukt.svg",
  "./knop-primair.svg",
  "./knop-secundair.svg",
  "./label-geel.svg",
  "./label-roze.svg",
  "./logo-cosy.svg",
  "./manifest.webmanifest",
  "./paneel-antwoord.svg",
  "./paneel-breed.svg",
  "./paneel-hero.svg",
  "./paneel-resultaat.svg",
  "./paneel-standaard.svg",
  "./paneel-statistiek.svg",
  "./paneel-vraag.svg",
  "./schrift.png",
  "./sw.js",
  "./tab-instellingen-actief.svg",
  "./tab-instellingen-normaal.svg",
  "./tab-oefening-actief.svg",
  "./tab-oefening-normaal.svg",
  "./tab-overzicht-actief.svg",
  "./tab-overzicht-normaal.svg",
  "./tab-woordenlijst-actief.svg",
  "./tab-woordenlijst-normaal.svg",
  "./thema.css"
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
