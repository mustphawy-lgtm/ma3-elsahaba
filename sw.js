const V='ms-v23';
const CORE=['/','/manifest.webmanifest','/fonts/panorama.woff2','/fonts/zanjabeel.woff2','/icon-192.png','/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||/youtube|ytimg|googlevideo/.test(u.host))return;
  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{caches.open(V).then(c=>c.put('/',r.clone()));return r;}).catch(()=>caches.match('/')));return;}
  e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{if(r.ok&&(u.origin===location.origin||/cdnjs|fonts\.g/.test(u.host))){const cl=r.clone();caches.open(V).then(c=>c.put(e.request,cl));}return r;})));
});
