const SHELL='tp-shell-v1';
const TILES='tp-tiles';
const SHELL_URLS=[
 './','./index.html','./data.js','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install',e=>{
 self.skipWaiting();
 e.waitUntil(caches.open(SHELL).then(c=>Promise.all(
   SHELL_URLS.map(u=>c.add(u).catch(()=>{}))
 )));
});

self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});

self.addEventListener('fetch',e=>{
 const url=e.request.url;
 if(url.indexOf('tile.openstreetmap.org')>-1){
   // tiles: cache-first from tp-tiles, fall back to network, store runtime
   e.respondWith(
     caches.open(TILES).then(c=>c.match(e.request).then(hit=>{
       if(hit)return hit;
       return fetch(e.request,{mode:'cors'}).then(r=>{if(r.ok)c.put(e.request,r.clone());return r;})
         .catch(()=>hit||Response.error());
     }))
   );
   return;
 }
 // app shell: cache-first
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)));
});
