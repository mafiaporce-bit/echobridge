// EchoBridge offline cache: the app and any voice pack it has used keep working without internet.
const CACHE='echobridge-v4';
const FILES=['/','/index.html','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))); self.skipWaiting() });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim() });
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin)) return;
  const url=new URL(e.request.url);
  if(url.pathname.startsWith('/voices/')){   // voice packs never change under the same name: cache first
    e.respondWith(caches.open(CACHE).then(async c=>{ const m=await c.match(e.request); if(m) return m; const r=await fetch(e.request); if(r.ok) c.put(e.request,r.clone()); return r })); return }
  e.respondWith(fetch(e.request).then(r=>{ const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{}); return r }).catch(()=>caches.match(e.request).then(m=>m||caches.match('/index.html'))));
});
