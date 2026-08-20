const CACHE_NAME = "fur-frontline-offline-v4";
const APP_SHELL = [
  "./", "./index.html", "./styles.css", "./game.js", "./firebase-config.js",
  "./firebase-save.js", "./pwa.js", "./manifest.webmanifest", "./assets/app-icon.svg",
  "./assets/pixel-title-night.png", "./assets/pixel-battlefield-night.png",
  "./assets/pixel-stage-ch2-pine-v1.png", "./assets/pixel-stage-ch3-swamp-v1.png",
  "./assets/pixel-stage-ch4-ruins-v1.png", "./assets/pixel-stage-ch5-siege-v1.png",
  "./assets/pixel-stage-ch6-palace-v1.png", "./assets/pixel-stage-ch7-fortress-v1.png",
  "./assets/pixel-stage-ch8-throne-v1.png", "./assets/pixel-allies-keyed.png",
  "./assets/pixel-allies-unlockables-v4.png", "./assets/pixel-ally-rockshield-v1.png",
  "./assets/pixel-ally-lightning-otter-v1.png", "./assets/pixel-ally-gale-hawk-v2.png",
  "./assets/pixel-ally-herb-hedgehog-v1.png", "./assets/pixel-ally-march-drummer-v1.png",
  "./assets/pixel-ally-iron-hare-v1.png", "./assets/pixel-ally-star-fox-v1.png",
  "./assets/pixel-ally-bomb-fur-v1.png", "./assets/pixel-enemies-keyed.png",
  "./assets/pixel-enemy-bloodwing-bat-v2.png", "./assets/pixel-enemy-bone-raven-v3.png",
  "./assets/pixel-enemy-siege-rhino-v2.png", "./assets/pixel-enemy-mooncap-witch-v2.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;
      if (request.mode === "navigate") return cache.match("./index.html", { ignoreSearch: true });
      throw error;
    }
  })());
});
