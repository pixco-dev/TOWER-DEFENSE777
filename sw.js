const CACHE_NAME = "fur-frontline-offline-v57";
const CANDIDATE_SPRITES = [
  "./assets/candidates/unified-v1/ally-armored-armadillo.png",
  "./assets/candidates/unified-v1/ally-boksuli.png",
  "./assets/candidates/unified-v1/ally-bomber-raccoon.png",
  "./assets/candidates/unified-v1/ally-crossbow-lynx.png",
  "./assets/candidates/unified-v1/ally-drummer-monkey.png",
  "./assets/candidates/unified-v1/ally-firework-mage.png",
  "./assets/candidates/unified-v1/ally-frost-owl.png",
  "./assets/candidates/unified-v1/ally-gale-hawk.png",
  "./assets/candidates/unified-v1/ally-herb-hedgehog.png",
  "./assets/candidates/unified-v1/ally-lightning-otter.png",
  "./assets/candidates/unified-v1/ally-moon-priest.png",
  "./assets/candidates/unified-v1/ally-moon-shadow.png",
  "./assets/candidates/unified-v1/ally-night-fox.png",
  "./assets/candidates/unified-v1/ally-ram-charger.png",
  "./assets/candidates/unified-v1/ally-rock-shield.png",
  "./assets/candidates/unified-v1/ally-scout-cat.png",
  "./assets/candidates/unified-v1/ally-shield-bean.png",
  "./assets/candidates/unified-v1/ally-slingshot-cat.png",
  "./assets/candidates/unified-v1/ally-spear-squirrel.png",
  "./assets/candidates/unified-v1/ally-starlight-mage.png",
  "./assets/candidates/unified-v1/ally-steel-claw.png",
  "./assets/candidates/unified-v1/ally-sun-lion.png",
  "./assets/candidates/unified-v1/ally-war-drum-cat.png",
  "./assets/candidates/unified-v1/enemy-bloodwing-bat.png",
  "./assets/candidates/unified-v1/enemy-bone-raven.png",
  "./assets/candidates/unified-v1/enemy-iron-giant.png",
  "./assets/candidates/unified-v1/enemy-mist-fox.png",
  "./assets/candidates/unified-v1/enemy-moon-wolf.png",
  "./assets/candidates/unified-v1/enemy-mooncap-witch.png",
  "./assets/candidates/unified-v1/enemy-nightlord.png",
  "./assets/candidates/unified-v1/enemy-red-fang.png",
  "./assets/candidates/unified-v1/enemy-shell-toad.png",
  "./assets/candidates/unified-v1/enemy-siege-rhino.png",
  "./assets/candidates/unified-v1/enemy-spitter-mole.png",
  "./assets/candidates/unified-v1/enemy-sprout-boar.png",
  "./assets/candidates/unified-v1/enemy-stone-golem.png",
  "./assets/candidates/unified-v1/enemy-thorn-king.png",
  "./assets/candidates/unified-v1/enemy-thorn-prince.png",
  "./assets/candidates/unified-v1/enemy-thorn-shaman.png",
  "./assets/candidates/unified-v1/rift-ally-bloom-deer.png",
  "./assets/candidates/unified-v1/rift-ally-breeze-squirrel.png",
  "./assets/candidates/unified-v1/rift-ally-crystal-rabbit.png",
  "./assets/candidates/unified-v1/rift-ally-crystal-raccoon.png",
  "./assets/candidates/unified-v1/rift-ally-dusk-fox.png",
  "./assets/candidates/unified-v1/rift-ally-ember-otter.png",
  "./assets/candidates/unified-v1/rift-ally-flame-fox.png",
  "./assets/candidates/unified-v1/rift-ally-frost-bear.png",
  "./assets/candidates/unified-v1/rift-ally-gold-eagle.png",
  "./assets/candidates/unified-v1/rift-ally-gold-mole.png",
  "./assets/candidates/unified-v1/rift-ally-holy-deer.png",
  "./assets/candidates/unified-v1/rift-ally-iron-turtle.png",
  "./assets/candidates/unified-v1/rift-ally-lava-bear.png",
  "./assets/candidates/unified-v1/rift-ally-leaf-panda.png",
  "./assets/candidates/unified-v1/rift-ally-moon-fox.png",
  "./assets/candidates/unified-v1/rift-ally-pike-goat.png",
  "./assets/candidates/unified-v1/rift-ally-poison-quill.png",
  "./assets/candidates/unified-v1/rift-ally-shade-raccoon.png",
  "./assets/candidates/unified-v1/rift-ally-silver-fox.png",
  "./assets/candidates/unified-v1/rift-ally-spark-mouse.png",
  "./assets/candidates/unified-v1/rift-ally-star-owl.png",
  "./assets/candidates/unified-v1/rift-ally-storm-hawk.png",
  "./assets/candidates/unified-v1/rift-ally-thunder-lion.png",
  "./assets/candidates/unified-v1/rift-ally-wave-otter.png",
  "./assets/candidates/unified-v1/rift-enemy-blackflame-fox.png",
  "./assets/candidates/unified-v1/rift-enemy-bone-boar.png",
  "./assets/candidates/unified-v1/rift-enemy-briar-spider.png",
  "./assets/candidates/unified-v1/rift-enemy-crystal-giant.png",
  "./assets/candidates/unified-v1/rift-enemy-dusk-quill.png",
  "./assets/candidates/unified-v1/rift-enemy-ember-boar.png",
  "./assets/candidates/unified-v1/rift-enemy-ember-wolf.png",
  "./assets/candidates/unified-v1/rift-enemy-fog-crow.png",
  "./assets/candidates/unified-v1/rift-enemy-frost-boar.png",
  "./assets/candidates/unified-v1/rift-enemy-ice-fang.png",
  "./assets/candidates/unified-v1/rift-enemy-iron-boar.png",
  "./assets/candidates/unified-v1/rift-enemy-lava-toad.png",
  "./assets/candidates/unified-v1/rift-enemy-moon-hag.png",
  "./assets/candidates/unified-v1/rift-enemy-moss-boar.png",
  "./assets/candidates/unified-v1/rift-enemy-mud-golem.png",
  "./assets/candidates/unified-v1/rift-enemy-night-moth.png",
  "./assets/candidates/unified-v1/rift-enemy-poison-frog.png",
  "./assets/candidates/unified-v1/rift-enemy-rotwood.png",
  "./assets/candidates/unified-v1/rift-enemy-shadow-bat.png",
  "./assets/candidates/unified-v1/rift-enemy-shadow-wolf.png",
  "./assets/candidates/unified-v1/rift-enemy-spike-boar.png",
  "./assets/candidates/unified-v1/rift-enemy-spore-rat.png",
  "./assets/candidates/unified-v1/rift-enemy-swamp-croc.png",
  "./assets/candidates/unified-v1/rift-enemy-thorn-fox.png",
  "./assets/candidates/unified-v1/rift-enemy-thorn-rhino.png",
  "./assets/candidates/unified-v1/rift-enemy-venom-spider.png",
  "./assets/candidates/unified-v1/miku-diva.png",
  "./assets/candidates/unified-v1/miku-idle-b.png",
  "./assets/candidates/unified-v1/miku-note.png",
  "./assets/candidates/unified-v1/miku-leek.png",
  "./assets/candidates/unified-v1/miku-speaker.png",
  "./assets/candidates/unified-v1/miku-cannon.png",
];
const APP_SHELL = [
  "./", "./index.html", "./styles.css", "./game.js", "./rift-roster.js", "./firebase-config.js",
  "./firebase-save.js", "./pwa.js", "./manifest.webmanifest", "./assets/app-icon.svg",
  "./assets/pixel-title-night.png", "./assets/pixel-battlefield-night.png",
  "./assets/pixel-stage-ch2-pine-v1.png", "./assets/pixel-stage-ch3-swamp-v1.png",
  "./assets/pixel-stage-ch4-ruins-v1.png", "./assets/pixel-stage-ch5-siege-v1.png",
  "./assets/pixel-stage-ch6-palace-v1.png", "./assets/pixel-stage-ch7-fortress-v1.png",
  "./assets/pixel-stage-ch8-throne-v1.png", "./assets/pixel-allies-keyed.png",
  "./assets/pixel-allies-unlockables-v4.png", "./assets/pixel-ally-rockshield-v2.png",
  "./assets/pixel-ally-lightning-otter-v2.png", "./assets/pixel-ally-gale-hawk-v4.png",
  "./assets/pixel-ally-herb-hedgehog-v2.png", "./assets/pixel-ally-squirrel-scout-v2.png",
  "./assets/pixel-ally-bomber-v2.png", "./assets/pixel-ally-sniper-v2.png",
  "./assets/pixel-ally-drummer-v2.png", "./assets/pixel-ally-scout-v2.png",
  "./assets/pixel-ally-night-fox-v2.png", "./assets/pixel-ally-frost-owl-v1.png",
  "./assets/pixel-enemies-keyed.png",
  "./assets/pixel-enemy-bloodwing-bat-v4.png", "./assets/pixel-enemy-bone-raven-v4.png",
  "./assets/pixel-enemy-siege-rhino-v4.png", "./assets/pixel-enemy-mooncap-witch-v4.png",
  "./assets/pixel-enemy-moon-wolf-v2.png", "./assets/pixel-enemy-shell-toad-v2.png",
  "./assets/pixel-enemy-spitter-mole-v2.png", "./assets/pixel-enemy-thorn-shaman-v2.png",
  "./assets/pixel-enemy-iron-giant-v2.png", "./assets/pixel-enemy-mist-fox-v2.png",
  "./assets/pixel-enemy-thorn-king-v2.png", "./assets/pixel-enemy-nightlord-v2.png",
  "./assets/_new-allies-1.png", "./assets/_new-allies-2.png", "./assets/_new-allies-3.png",
  "./assets/_new-enemies-1.png", "./assets/_new-enemies-2.png", "./assets/_new-enemies-3.png",
  "./assets/pixel-miku-towers-v2.png",
  ...CANDIDATE_SPRITES,
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
