// EchoBridge offline cache: the app and any voice file it has used keep working without internet.
const CACHE='echobridge-v7';
const FILES=['/','/index.html','/manifest.webmanifest','/icon-192.png','/icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{}))))); self.skipWaiting() });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim() });
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin)) return;
  const url=new URL(e.request.url);
  if(/\.ebv$/.test(url.pathname)){   // voice files never change under the same name: cache first
    e.respondWith(caches.open(CACHE).then(async c=>{ const m=await c.match(e.request); if(m) return m; const r=await fetch(e.request); if(r.ok&&r.status===200) c.put(e.request,r.clone()); return r })); return }
  e.respondWith(fetch(e.request).then(r=>{ if(r.ok){ const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{}) } return r }).catch(()=>caches.match(e.request).then(m=>m||caches.match('/index.html'))));
});
