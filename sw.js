/* V20 Sheet — offline shell.
   Bump CACHE when index.html changes so devices pick up the new version. */
const CACHE = "vtm-sheet-v2";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      /* one failed asset must not sink the whole install */
      return Promise.all(SHELL.map(function(u){
        return c.add(new Request(u, {cache:"reload"})).catch(function(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; })
                             .map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  const req = e.request;
  if(req.method !== "GET") return;

  /* Navigations: network first, so a redeploy lands without a cache bump.
     Falls straight back to the cached copy when there is no signal. */
  if(req.mode === "navigate"){
    e.respondWith(
      fetch(req).then(function(res){
        if(res && res.ok){
          const copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put("./index.html", copy).catch(function(){}); });
        }
        return res;
      }).catch(function(){
        return caches.match("./index.html").then(function(hit){
          return hit || caches.match("./");
        });
      })
    );
    return;
  }

  /* Everything else (including Google Fonts): serve cache, refresh in background. */
  e.respondWith(
    caches.match(req).then(function(hit){
      const net = fetch(req).then(function(res){
        if(res && (res.ok || res.type === "opaque")){
          const copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy).catch(function(){}); });
        }
        return res;
      }).catch(function(){ return hit; });
      return hit || net;
    })
  );
});
