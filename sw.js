/* Corretor de provas - cache do app inteiro para uso sem internet */
var CACHE = "corretor-v1";
var ARQUIVOS = ["./", "./index.html", "./manifest.json", "./icone-192.png", "./icone-512.png", "./icone-apple.png"];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARQUIVOS); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(nomes.map(function (n) { return n === CACHE ? null : caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (achado) {
      if (achado) return achado;
      return fetch(e.request).then(function (resp) {
        var copia = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
        return resp;
      }).catch(function () { return caches.match("./index.html"); });
    })
  );
});
