const CACHE_NAME = "quran-harian-v2";
const APP_FILES = [
  "./", "./index.html", "./style.css", "./app.js",
  "./manifest.json", "./assets/icon.svg",
  "./assets/mushaf/002.webp", "./assets/mushaf/003.webp", "./assets/mushaf/004.webp"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(cached => {
    if (cached) return cached;
    return fetch(event.request).then(response => {
      if (response && response.status === 200 && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => {
      if (event.request.mode === "navigate") return caches.match("./index.html");
      return new Response("Konten ini belum tersimpan offline.", {status: 503, headers: {"Content-Type":"text/plain; charset=utf-8"}});
    });
  }));
});
