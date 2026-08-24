const CACHE_NAME = "fur-frontline-offline-rift-v47";
const APP_SHELL = [
  "./", "./index.html", "./styles.css", "./game.js", "./rift-roster.js", "./firebase-config.js",
  "./firebase-save.js", "./pwa.js", "./manifest.webmanifest", "./assets/app-icon.svg",
  "./assets/pixel-title-night.png", "./assets/pixel-battlefield-night.png",
  "./assets/pixel-stage-ch2-pine-v1.png", "./assets/pixel-stage-ch3-swamp-v1.png",
  "./assets/pixel-stage-ch4-ruins-v1.png", "./assets/pixel-stage-ch5-siege-v1.png",
  "./assets/pixel-stage-ch6-palace-v1.png", "./assets/pixel-stage-ch7-fortress-v1.png",
  "./assets/pixel-stage-ch8-throne-v1.png", "./assets/pixel-allies-keyed.png",
  "./assets/pixel-allies-unlockables-v4.png", "./assets/pixel-ally-rockshield-v1.png",
  "./assets/pixel-ally-lightning-otter-v1.png", "./assets/pixel-ally-gale-hawk-v3.png",
  "./assets/pixel-ally-herb-hedgehog-v1.png", "./assets/pixel-ally-squirrel-scout-v1.png",
  "./assets/pixel-ally-bomber-v1.png", "./assets/pixel-ally-sniper-v1.png",
  "./assets/pixel-ally-drummer-v1.png", "./assets/pixel-ally-scout-v1.png",
  "./assets/pixel-ally-night-fox-v2.png", "./assets/pixel-ally-frost-owl-v1.png",
  "./assets/pixel-enemies-keyed.png",
  "./assets/pixel-enemy-bloodwing-bat-v3.png", "./assets/pixel-enemy-bone-raven-v3.png",
  "./assets/pixel-enemy-siege-rhino-v3.png", "./assets/pixel-enemy-mooncap-witch-v3.png",
  "./assets/pixel-enemy-moon-wolf-v1.png", "./assets/pixel-enemy-shell-toad-v1.png",
  "./assets/pixel-enemy-spitter-mole-v1.png", "./assets/pixel-enemy-thorn-shaman-v1.png",
  "./assets/pixel-enemy-iron-giant-v1.png", "./assets/pixel-enemy-mist-fox-v1.png",
  "./assets/pixel-enemy-thorn-king-v1.png", "./assets/pixel-enemy-nightlord-v1.png",
  "./assets/rift/blackflame_fox.png", "./assets/rift/bloom_deer.png",
  "./assets/rift/bone_boar.png", "./assets/rift/breeze_squirrel.png",
  "./assets/rift/briar_spider.png", "./assets/rift/crystal_giant.png",
  "./assets/rift/crystal_rabbit.png", "./assets/rift/crystal_raccoon.png",
  "./assets/rift/dusk_fox.png", "./assets/rift/dusk_quill.png",
  "./assets/rift/ember_boar.png", "./assets/rift/ember_otter.png",
  "./assets/rift/ember_wolf.png", "./assets/rift/flame_fox.png",
  "./assets/rift/fog_crow.png", "./assets/rift/frost_bear.png",
  "./assets/rift/frost_boar.png", "./assets/rift/gold_eagle.png",
  "./assets/rift/gold_mole.png", "./assets/rift/holy_deer.png",
  "./assets/rift/ice_fang.png", "./assets/rift/iron_boar.png",
  "./assets/rift/iron_turtle.png", "./assets/rift/lava_bear.png",
  "./assets/rift/lava_toad.png", "./assets/rift/leaf_panda.png",
  "./assets/rift/moon_fox.png", "./assets/rift/moon_hag.png",
  "./assets/rift/moss_boar.png", "./assets/rift/mud_golem.png",
  "./assets/rift/night_moth.png", "./assets/rift/pike_goat.png",
  "./assets/rift/poison_frog.png", "./assets/rift/poison_quill.png",
  "./assets/rift/rotwood.png", "./assets/rift/shade_raccoon.png",
  "./assets/rift/shadow_bat.png", "./assets/rift/shadow_wolf.png",
  "./assets/rift/silver_fox.png", "./assets/rift/spark_mouse.png",
  "./assets/rift/spike_boar.png", "./assets/rift/spore_rat.png",
  "./assets/rift/star_owl.png", "./assets/rift/storm_hawk.png",
  "./assets/rift/swamp_croc.png", "./assets/rift/thorn_fox.png",
  "./assets/rift/thorn_rhino.png", "./assets/rift/thunder_lion.png",
  "./assets/rift/venom_spider.png", "./assets/rift/wave_otter.png",
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
