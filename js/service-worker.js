self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  self.skipWaiting(); // Activate immediately
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  clients.claim(); // Take control of all pages

  // Optional: clear old caches if needed
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.map((name) => caches.delete(name)))
      )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
