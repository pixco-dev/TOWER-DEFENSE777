(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  let W = 1280;
  let H = 720;
  let GROUND = 605;
  let PLAYER_BASE_X = 105;
  let ENEMY_BASE_X = 1175;
  let BATTLE_START = 178;
  let BATTLE_END = 1102;
  let VIEW_SCALE = 1;
  let FIGHTER_VIEW_SCALE = 1;
  let outputScale = 1;
  const FIGHTER_SCALE = 0.72;

  function layoutBattle() {
    const previousLayout = {
      width: W,
      height: H,
      ground: GROUND,
      playerBaseX: PLAYER_BASE_X,
      enemyBaseX: ENEMY_BASE_X,
      battleStart: BATTLE_START,
      battleEnd: BATTLE_END,
      viewScale: VIEW_SCALE,
      fighterViewScale: FIGHTER_VIEW_SCALE,
    };
    const wrap = canvas.parentElement;
    let cssW = Math.round(wrap.clientWidth || window.innerWidth);
    let cssH = Math.round(wrap.clientHeight || window.innerHeight);
    if (cssW < 64 || cssH < 64) {
      cssW = Math.max(1, Math.round(window.innerWidth));
      cssH = Math.max(1, Math.round(window.innerHeight));
    }
    outputScale = Math.min(window.devicePixelRatio || 1, 2);
    const nextW = Math.max(1, Math.floor(cssW * outputScale));
    const nextH = Math.max(1, Math.floor(cssH * outputScale));
    if (canvas.width !== nextW || canvas.height !== nextH) {
      canvas.width = nextW;
      canvas.height = nextH;
    }
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    ctx.setTransform(outputScale, 0, 0, outputScale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    W = cssW;
    H = cssH;
    VIEW_SCALE = Math.min(W / 1280, H / 720);
    // Use the short viewport edge for sprite scale. Rotating a phone/tablet
    // swaps width and height, but no longer makes every fighter grow/shrink.
    FIGHTER_VIEW_SCALE = Math.max(0.5, Math.min(1.25, Math.min(W, H) / 720));
    GROUND = Math.round(H - 128);
    PLAYER_BASE_X = Math.round(Math.max(110, 120 * VIEW_SCALE));
    ENEMY_BASE_X = W - PLAYER_BASE_X;
    BATTLE_START = PLAYER_BASE_X + Math.round(80 * VIEW_SCALE);
    BATTLE_END = ENEMY_BASE_X - Math.round(80 * VIEW_SCALE);
    if (previousLayout.width !== W || previousLayout.height !== H) {
      rescaleBattleEntities(previousLayout);
    }
  }

  const ui = {
    titleScreen: document.getElementById("title-screen"),
    gameStartBtn: document.getElementById("game-start-btn"),
    howBtn: document.getElementById("how-btn"),
    howPanel: document.getElementById("how-panel"),
    howCloseBtn: document.getElementById("how-close-btn"),
    deckBtn: document.getElementById("deck-btn"),
    deckPanel: document.getElementById("deck-panel"),
    deckCloseBtn: document.getElementById("deck-close-btn"),
    deckDoneBtn: document.getElementById("deck-done-btn"),
    deckList: document.getElementById("deck-list"),
    deckCount: document.getElementById("deck-count"),
    deckSummary: document.getElementById("deck-summary"),
    profileGold: document.getElementById("profile-gold"),
    materialCount: document.getElementById("material-count"),
    convertStoneBtn: document.getElementById("convert-stone-btn"),
    convertGoldBtn: document.getElementById("convert-gold-btn"),
    chestBtn: document.getElementById("chest-btn"),
    chestPanel: document.getElementById("chest-panel"),
    chestCloseBtn: document.getElementById("chest-close-btn"),
    chestOpenBtn: document.getElementById("chest-open-btn"),
    chestCount: document.getElementById("chest-count"),
    collectionCount: document.getElementById("collection-count"),
    chestDesc: document.getElementById("chest-desc"),
    cloudSaveBtn: document.getElementById("cloud-save-btn"),
    cloudSaveStatus: document.getElementById("cloud-save-status"),
    playerHp: document.getElementById("player-hp"),
    playerHpBar: document.getElementById("player-hp-bar"),
    enemyHp: document.getElementById("enemy-hp"),
    enemyHpBar: document.getElementById("enemy-hp-bar"),
    money: document.getElementById("money"),
    moneyMax: document.getElementById("money-max"),
    income: document.getElementById("income"),
    workerBtn: document.getElementById("worker-btn"),
    workerLevel: document.getElementById("worker-level"),
    workerCost: document.getElementById("worker-cost"),
    cannonBtn: document.getElementById("cannon-btn"),
    cannonGauge: document.getElementById("cannon-gauge"),
    cannonState: document.getElementById("cannon-state"),
    commandBtn: document.getElementById("command-btn"),
    commandGauge: document.getElementById("command-gauge"),
    commandState: document.getElementById("command-state"),
    unitList: document.getElementById("unit-list"),
    overlay: document.getElementById("overlay"),
    overlayTitle: document.getElementById("overlay-title"),
    overlayDesc: document.getElementById("overlay-desc"),
    overlayBtn: document.getElementById("overlay-btn"),
    pauseBtn: document.getElementById("pause-btn"),
    homeBtn: document.getElementById("home-btn"),
    pauseLayer: document.getElementById("pause-layer"),
    soundBtn: document.getElementById("sound-btn"),
    message: document.getElementById("message"),
    stageList: document.getElementById("stage-list"),
    stageLabel: document.getElementById("stage-label"),
    stageName: document.getElementById("stage-name"),
    stageProgress: document.getElementById("stage-progress"),
    waveLabel: document.getElementById("wave-label"),
    comboBadge: document.getElementById("combo-badge"),
    comboCount: document.getElementById("combo-count"),
    overlayMenuBtn: document.getElementById("overlay-menu-btn"),
    modeCampaignBtn: document.getElementById("mode-campaign-btn"),
    modeRiftBtn: document.getElementById("mode-rift-btn"),
    modeMikuBtn: document.getElementById("mode-miku-btn"),
    enemyBaseName: document.getElementById("enemy-base-name"),
    stageBoardLabel: document.getElementById("stage-board-label"),
    deckBtnLabel: document.getElementById("deck-btn-label"),
    deckKicker: document.getElementById("deck-kicker"),
    deckTitle: document.getElementById("deck-title"),
    deckSubtitle: document.getElementById("deck-subtitle"),
    chestBtnLabel: document.getElementById("chest-btn-label"),
    chestTitle: document.getElementById("chest-title"),
    chestModeNote: document.getElementById("chest-mode-note"),
    chestVisual: document.getElementById("chest-visual"),
    chestFx: document.getElementById("chest-fx"),
    chestReveal: document.getElementById("chest-reveal"),
    chestRewardPortrait: document.getElementById("chest-reward-portrait"),
    chestRewardTitle: document.getElementById("chest-reward-title"),
    chestRewardTag: document.getElementById("chest-reward-tag"),
    chestRewardSub: document.getElementById("chest-reward-sub"),
  };

  ctx.imageSmoothingEnabled = false;

  const stageBackgrounds = Array.from({ length: 8 }, () => new Image());
  const bg = stageBackgrounds[0];
  const allySheet = new Image();
  const unlockableSheet = new Image();
  const rockShieldSheet = new Image();
  const enemySheet = new Image();
  const mikuTowerSheet = new Image();
  let allyPixels = null;
  let unlockablePixels = null;
  let rockShieldPixels = null;
  let enemyPixels = null;
  let mikuTowerPixels = null;

  const STAGE_BACKGROUND_FILES = [
    "assets/pixel-battlefield-night.png",
    "assets/pixel-stage-ch2-pine-v1.png",
    "assets/pixel-stage-ch3-swamp-v1.png",
    "assets/pixel-stage-ch4-ruins-v1.png",
    "assets/pixel-stage-ch5-siege-v1.png",
    "assets/pixel-stage-ch6-palace-v1.png",
    "assets/pixel-stage-ch7-fortress-v1.png",
    "assets/pixel-stage-ch8-throne-v1.png",
  ];
  stageBackgrounds.forEach((image, index) => {
    image.src = STAGE_BACKGROUND_FILES[index];
  });
  allySheet.src = "assets/pixel-allies-keyed.png?v=3";
  unlockableSheet.src = "assets/pixel-allies-unlockables-v4.png?v=17";
  rockShieldSheet.src = "assets/pixel-ally-rockshield-v2.png";
  enemySheet.src = "assets/pixel-enemies-keyed.png?v=3";

  const candidateSprite = (file, options = {}) => {
    const pixelCanvas = window.FurPixelSprites?.canvas?.(file);
    if (pixelCanvas) {
      return {
        image: pixelCanvas,
        sheet: pixelCanvas,
        src: "",
        crop: [0, 0, pixelCanvas.width, pixelCanvas.height],
        pixelData: true,
        ...options,
      };
    }
    return {
      image: new Image(),
      src: `assets/candidates/unified-v1/${file}.png?v=2`,
      crop: null,
      ...options,
    };
  };

  // 본편과 신월 전선은 별도 표를 사용한다. 같은 ID가 있어도 서로 덮어쓰지 않는다.
  const EXTRA_ALLY_SPRITES = {
    moco: candidateSprite("ally-boksuli"),
    shield: candidateSprite("ally-shield-bean"),
    archer: candidateSprite("ally-slingshot-cat"),
    ram: candidateSprite("ally-ram-charger"),
    mage: candidateSprite("ally-starlight-mage"),
    bomber: candidateSprite("ally-firework-mage"),
    sniper: candidateSprite("ally-moon-shadow"),
    titan: candidateSprite("ally-rock-shield"),
    drummer: candidateSprite("ally-war-drum-cat"),
    scout: candidateSprite("ally-scout-cat"),
    moon_cleric: candidateSprite("ally-moon-priest"),
    night_fox: candidateSprite("ally-night-fox"),
    frost_owl: candidateSprite("ally-frost-owl"),
    sun_lion: candidateSprite("ally-sun-lion"),
    raccoon_bomber: candidateSprite("ally-bomber-raccoon"),
    lynx_sniper: candidateSprite("ally-crossbow-lynx"),
    wolverine: candidateSprite("ally-steel-claw"),
    armadillo: candidateSprite("ally-armored-armadillo"),
    monkey_drummer: candidateSprite("ally-drummer-monkey"),
    squirrel_scout: candidateSprite("ally-spear-squirrel"),
    lightning_otter: candidateSprite("ally-lightning-otter"),
    gale_hawk: candidateSprite("ally-gale-hawk"),
    herb_hedgehog: candidateSprite("ally-herb-hedgehog"),
    miku: candidateSprite("miku-diva", { fitScale: 1.08 }),
  };

  const EXTRA_ENEMY_SPRITES = {
    sprout: candidateSprite("enemy-sprout-boar"),
    swarm: candidateSprite("enemy-sprout-boar", { allowTint: true, fitScale: 0.9 }),
    fang: candidateSprite("enemy-red-fang"),
    wolf: candidateSprite("enemy-moon-wolf"),
    brute: candidateSprite("enemy-stone-golem"),
    shell: candidateSprite("enemy-shell-toad"),
    spitter: candidateSprite("enemy-spitter-mole"),
    toxic: candidateSprite("enemy-spitter-mole", { allowTint: true }),
    shaman: candidateSprite("enemy-thorn-shaman"),
    priest: candidateSprite("enemy-thorn-shaman", { allowTint: true }),
    jugger: candidateSprite("enemy-iron-giant"),
    wraith: candidateSprite("enemy-mist-fox"),
    boss: candidateSprite("enemy-thorn-king"),
    king: candidateSprite("enemy-thorn-prince"),
    nightlord: candidateSprite("enemy-nightlord"),
    bloodwing_bat: candidateSprite("enemy-bloodwing-bat", { fitScale: 0.92 }),
    bone_raven: candidateSprite("enemy-bone-raven"),
    siege_rhino: candidateSprite("enemy-siege-rhino"),
    mooncap_witch: candidateSprite("enemy-mooncap-witch"),
    moon_wolf: candidateSprite("enemy-moon-wolf"),
    moss_toad: candidateSprite("enemy-shell-toad"),
    burrow_mole: candidateSprite("enemy-spitter-mole"),
    gloom_mole: candidateSprite("enemy-spitter-mole", { allowTint: true }),
    thorn_elder: candidateSprite("enemy-thorn-shaman"),
    thorn_bishop: candidateSprite("enemy-thorn-shaman", { allowTint: true }),
    iron_colossus: candidateSprite("enemy-iron-giant"),
    mist_fox: candidateSprite("enemy-mist-fox"),
    thorn_king: candidateSprite("enemy-thorn-prince"),
    dusk_lord: candidateSprite("enemy-nightlord"),
  };
  // 각 미쿠는 하나의 공격만 담당한다. 같은 캐릭터가 모든 기술을
  // 순환하지 않도록 전투 타입과 스프라이트를 공격별로 분리한다.
  const MIKU_ENEMY_FRAMES = {
    idleA: candidateSprite("miku-diva", { fitScale: 1.12, flipX: true }),
    idleB: candidateSprite("miku-idle-b", { fitScale: 1.12, flipX: true }),
    // The action frames have very different transparent margins. Normalize their
    // visible pixel height so Miku herself does not grow/shrink between attacks.
    song: candidateSprite("miku-note", { fitScale: 1.12, flipX: true }),
    leek: candidateSprite("miku-leek", { fitScale: 1.14, flipX: true }),
    guard: candidateSprite("miku-speaker", { fitScale: 0.84, flipX: true }),
    cannon: candidateSprite("miku-cannon", { fitScale: 1.02 }),
  };
  const MIKU_ALLY_ATTACK_FRAME = candidateSprite("miku-note", { fitScale: 1.33 });
  EXTRA_ENEMY_SPRITES.miku_song = MIKU_ENEMY_FRAMES.song;
  EXTRA_ENEMY_SPRITES.miku_leek = MIKU_ENEMY_FRAMES.leek;
  EXTRA_ENEMY_SPRITES.miku_guard = MIKU_ENEMY_FRAMES.guard;
  EXTRA_ENEMY_SPRITES.miku_cannon = MIKU_ENEMY_FRAMES.cannon;
  const RIFT_ALLY_SPRITES = {};
  const RIFT_ENEMY_SPRITES = {};
  // Sprite images can finish loading before `state` is initialized. UI refreshes
  // must wait until the runtime is ready or the entire menu bootstrap aborts.
  let spriteUiReady = false;
  const bindExtraSprite = (sprite, refreshUi) => {
    if (sprite.pixelData && sprite.sheet) return;
    sprite.image.addEventListener("load", () => {
      // PNGs are pre-keyed. Never strip interiors or dark fur/armor at runtime.
      sprite.sheet = sprite.image;
      if (!sprite.crop || sprite.crop[2] <= sprite.crop[0]) {
        sprite.crop = [0, 0, sprite.image.naturalWidth || 320, sprite.image.naturalHeight || 360];
      }
      if (refreshUi && spriteUiReady) {
        renderCardPortraits();
        renderDeckBuilder();
      }
    });
    sprite.image.src = sprite.src;
    if (sprite.image.complete && sprite.image.naturalWidth) {
      sprite.sheet = sprite.image;
      if (!sprite.crop || sprite.crop[2] <= sprite.crop[0]) {
        sprite.crop = [0, 0, sprite.image.naturalWidth, sprite.image.naturalHeight];
      }
    }
  };
  for (const sprite of Object.values(EXTRA_ALLY_SPRITES)) bindExtraSprite(sprite, true);
  for (const sprite of Object.values(EXTRA_ENEMY_SPRITES)) bindExtraSprite(sprite, false);
  for (const sprite of Object.values(MIKU_ENEMY_FRAMES)) {
    bindExtraSprite(sprite, false);
  }
  bindExtraSprite(MIKU_ALLY_ATTACK_FRAME, true);

  function montageCellCrop(img, index, cols = 4, rows = 2) {
    const w = img.naturalWidth || 1024;
    const h = img.naturalHeight || 576;
    const titleH = h * 0.11;
    const gridH = h - titleH - h * 0.02;
    const cellW = w / cols;
    const cellH = gridH / rows;
    const col = index % cols;
    const row = Math.floor(index / cols);
    const padX = cellW * 0.04;
    const padTop = cellH * 0.02;
    const padBot = cellH * 0.18;
    return [
      Math.round(col * cellW + padX),
      Math.round(titleH + row * cellH + padTop),
      Math.round((col + 1) * cellW - padX),
      Math.round(titleH + (row + 1) * cellH - padBot),
    ];
  }

  function bindRiftMontageSprites() {
    const roster = window.FurRiftRoster;
    if (!roster?.ALLIES?.length) return;
    const bindOne = (id, into, refreshUi, prefix, fitScale = 1) => {
      const fileId = id.replaceAll("_", "-");
      const entry = candidateSprite(`${prefix}-${fileId}`, { fitScale });
      into[id] = entry;
      if (entry.pixelData && entry.sheet) return;
      const apply = () => {
        entry.sheet = entry.image;
        entry.crop = [0, 0, entry.image.naturalWidth, entry.image.naturalHeight];
        if (refreshUi && spriteUiReady) {
          if (typeof renderCardPortraits === "function") renderCardPortraits();
          if (typeof renderDeckBuilder === "function") renderDeckBuilder();
        }
      };
      entry.image.addEventListener("load", apply);
      entry.image.src = entry.src;
      if (entry.image.complete && entry.image.naturalWidth) apply();
    };
    for (const unit of roster.ALLIES) bindOne(unit.id, RIFT_ALLY_SPRITES, true, "rift-ally");
    for (const id of Object.keys(roster.ENEMIES || {})) {
      bindOne(id, RIFT_ENEMY_SPRITES, false, "rift-enemy", 1.03);
    }
  }
  bindRiftMontageSprites();

  const ALLY_CROPS = [
    [12, 345, 303, 675],
    [308, 323, 600, 675],
    [612, 348, 923, 675],
    [927, 315, 1218, 675],
    [1226, 308, 1527, 678],
  ];
  const ENEMY_CROPS = [
    [42, 528, 312, 803],
    [315, 458, 672, 803],
    [668, 308, 1058, 807],
    [1065, 273, 1493, 810],
  ];

  const UNLOCKABLE_SPRITE_INDEX = {
    moon_cleric: 0, night_fox: 1, frost_owl: 2, sun_lion: 3, raccoon_bomber: 4,
    lynx_sniper: 5, wolverine: 6, armadillo: 7, monkey_drummer: 8, squirrel_scout: 9,
  };
  const UNLOCKABLE_CROPS = [
    [5, 155, 306, 470], [312, 175, 610, 470], [614, 175, 912, 470],
    [913, 135, 1236, 470], [1237, 200, 1536, 470],
    [0, 570, 307, 860], [312, 573, 608, 860], [629, 570, 907, 860],
    [928, 585, 1221, 860], [1222, 594, 1536, 860],
  ];
  const ROCK_SHIELD_CROP = [0, 0, 316, 270];

  function removeAtlasBackground(image) {
    const surface = document.createElement("canvas");
    surface.width = image.naturalWidth;
    surface.height = image.naturalHeight;
    const surfaceCtx = surface.getContext("2d", { willReadFrequently: true });
    surfaceCtx.drawImage(image, 0, 0);
    const frame = surfaceCtx.getImageData(0, 0, surface.width, surface.height);
    const pixels = frame.data;
    const total = surface.width * surface.height;
    const visited = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;
    const isBackdrop = (index) => {
      const p = index * 4;
      const r = pixels[p];
      const g = pixels[p + 1];
      const b = pixels[p + 2];
      return Math.min(r, g, b) > 232 && Math.max(r, g, b) - Math.min(r, g, b) < 14;
    };
    const enqueue = (index) => {
      if (index < 0 || index >= total || visited[index] || !isBackdrop(index)) return;
      visited[index] = 1;
      queue[tail++] = index;
    };
    for (let x = 0; x < surface.width; x++) {
      enqueue(x);
      enqueue((surface.height - 1) * surface.width + x);
    }
    for (let y = 0; y < surface.height; y++) {
      enqueue(y * surface.width);
      enqueue(y * surface.width + surface.width - 1);
    }
    while (head < tail) {
      const index = queue[head++];
      const x = index % surface.width;
      if (x > 0) enqueue(index - 1);
      if (x < surface.width - 1) enqueue(index + 1);
      if (index >= surface.width) enqueue(index - surface.width);
      if (index < total - surface.width) enqueue(index + surface.width);
    }
    for (let index = 0; index < total; index++) {
      if (visited[index]) pixels[index * 4 + 3] = 0;
    }
    surfaceCtx.putImageData(frame, 0, 0);
    return surface;
  }

  function stripSpriteBackdrop(image) {
    try {
      const surface = document.createElement("canvas");
      surface.width = image.naturalWidth;
      surface.height = image.naturalHeight;
      const surfaceCtx = surface.getContext("2d", { willReadFrequently: true });
      surfaceCtx.drawImage(image, 0, 0);
      const frame = surfaceCtx.getImageData(0, 0, surface.width, surface.height);
      const pixels = frame.data;
      const width = surface.width;
      const height = surface.height;
      const total = width * height;
      const visited = new Uint8Array(total);
      const queue = new Int32Array(total);
      let head = 0;
      let tail = 0;
      const isBackdrop = (index) => {
        const p = index * 4;
        const a = pixels[p + 3];
        if (a < 12) return true;
        const r = pixels[p];
        const g = pixels[p + 1];
        const b = pixels[p + 2];
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const magenta = r >= 180 && b >= 180 && g <= 90 && r - g >= 80 && b - g >= 80;
        const nearWhite = min >= 232 && max - min < 14;
        return magenta || nearWhite;
      };
      const enqueue = (index) => {
        if (index < 0 || index >= total || visited[index] || !isBackdrop(index)) return;
        visited[index] = 1;
        queue[tail++] = index;
      };
      for (let x = 0; x < width; x++) {
        enqueue(x);
        enqueue((height - 1) * width + x);
      }
      for (let y = 0; y < height; y++) {
        enqueue(y * width);
        enqueue(y * width + width - 1);
      }
      while (head < tail) {
        const index = queue[head++];
        const x = index % width;
        if (x > 0) enqueue(index - 1);
        if (x < width - 1) enqueue(index + 1);
        if (index >= width) enqueue(index - width);
        if (index < total - width) enqueue(index + width);
      }
      for (let index = 0; index < total; index++) {
        if (visited[index]) pixels[index * 4 + 3] = 0;
      }
      surfaceCtx.putImageData(frame, 0, 0);
      return surface;
    } catch (error) {
      return image;
    }
  }

  allySheet.addEventListener("load", () => {
    allyPixels = allySheet;
    renderCardPortraits();
    renderDeckBuilder();
  });
  unlockableSheet.addEventListener("load", () => {
    // The v4 atlas already has a transparent alpha channel. Reading its pixels
    // through a canvas breaks on file:// pages, so use the image directly.
    unlockablePixels = unlockableSheet;
    renderCardPortraits();
    renderDeckBuilder();
  });
  rockShieldSheet.addEventListener("load", () => {
    rockShieldPixels = rockShieldSheet;
    renderCardPortraits();
    renderDeckBuilder();
  });
  enemySheet.addEventListener("load", () => {
    enemyPixels = enemySheet;
  });
  mikuTowerSheet.addEventListener("load", () => {
    mikuTowerPixels = mikuTowerSheet;
  });
  mikuTowerSheet.src = "assets/pixel-miku-towers-v2.png?v=1";

  const UNIT_TYPES = [
    {
      id: "moco", name: "복슬이", cost: 50, hp: 150, damage: 18,
      speed: 53, range: 38, cooldown: 0.62, size: 54, recharge: 2.1, kind: "moco",
      sprite: 0, cleave: 34, info: "빠르게 전선을 채우는 기본 전사",
    },
    {
      id: "shield", name: "방패콩", cost: 110, hp: 520, damage: 12,
      speed: 31, range: 42, cooldown: 0.9, size: 62, recharge: 4.8, kind: "shield",
      sprite: 1, guard: true, info: "단단한 방패로 아군을 보호",
    },
    {
      id: "archer", name: "새총이", cost: 180, hp: 180, damage: 62,
      speed: 39, range: 225, cooldown: 1.25, size: 58, recharge: 5.8, kind: "archer",
      sprite: 2, projectile: true, shot: "#79d55f", info: "멀리서 강한 씨앗탄을 발사",
    },
    {
      id: "ram", name: "박치기뿔", cost: 300, hp: 680, damage: 98,
      speed: 44, range: 48, cooldown: 1.3, size: 74, recharge: 8.5, kind: "ram",
      sprite: 3, cleave: 88, info: "튼튼하고 강력한 돌격대",
    },
    {
      id: "mage", name: "별빛술사", cost: 480, hp: 330, damage: 135,
      speed: 29, range: 270, cooldown: 2.15, size: 68, recharge: 12, kind: "mage",
      sprite: 4, projectile: true, splash: 82, slow: 2.8, shot: "#ffd658",
      info: "별 폭발로 여러 적을 공격",
    },
    {
      id: "bomber", name: "폭죽술사", cost: 390, hp: 260, damage: 88,
      speed: 33, range: 185, cooldown: 1.85, size: 62, recharge: 10.2, kind: "bomber",
      projectile: true, splash: 118, unlockable: true, sprite: 4, shot: "#ff8a4a",
      info: "넓은 폭발을 일으키는 화공 유닛",
    },
    {
      id: "sniper", name: "달그림자", cost: 520, hp: 170, damage: 210,
      speed: 26, range: 340, cooldown: 2.55, size: 56, recharge: 13.5, kind: "sniper",
      projectile: true, critChance: 0.22, critPower: 1.9, unlockable: true, sprite: 2, shot: "#d7e7ff",
      info: "아주 멀리서 한 발을 꽂는 저격수",
    },
    {
      id: "titan", name: "바위방패", cost: 560, hp: 1280, damage: 110,
      speed: 21, range: 52, cooldown: 1.55, size: 86, recharge: 14, kind: "titan",
      unlockable: true, sprite: 3, cleave: 96, guard: true,
      info: "느리고 단단한 최전선 거인",
    },
    {
      id: "drummer", name: "진군북", cost: 280, hp: 580, damage: 52,
      speed: 38, range: 48, cooldown: 0.95, size: 66, recharge: 6.8, kind: "drummer",
      unlockable: true, sprite: 1, aura: 1.32,
      info: "북소리로 주변 아군 공격·공속·이동을 강화한다",
    },
    {
      id: "scout", name: "정찰냥", cost: 70, hp: 95, damage: 14,
      speed: 84, range: 34, cooldown: 0.48, size: 48, recharge: 1.6, kind: "scout",
      unlockable: true, sprite: 0,
      info: "값싸고 빠른 정찰 돌격대",
    },
    {
      id: "moon_cleric", name: "달토끼 사제", cost: 410, hp: 340, damage: 42,
      speed: 33, range: 220, cooldown: 1.65, size: 62, recharge: 9.2, kind: "healer",
      projectile: true, heal: 145, unlockable: true, shot: "#92efd1",
      info: "달빛 기도로 전열의 아군을 크게 회복",
    },
    {
      id: "night_fox", name: "밤칼여우", cost: 310, hp: 265, damage: 112, tint: "brightness(1.22) contrast(1.06)",
      speed: 75, range: 42, cooldown: 0.68, size: 48, recharge: 7.4, kind: "assassin",
      critChance: 0.34, critPower: 2.15, unlockable: true,
      info: "그림자 속에서 파고드는 치명타 암살자",
    },
    {
      id: "frost_owl", name: "설빛부엉", cost: 340, hp: 235, damage: 66,
      speed: 35, range: 255, cooldown: 1.3, size: 59, recharge: 8.1, kind: "frost",
      projectile: true, slow: 3.7, unlockable: true, shot: "#9ce7ff",
      info: "얼음 깃털로 적 무리의 진격을 늦춘다",
    },
    {
      id: "sun_lion", name: "태양갈기", cost: 500, hp: 920, damage: 72,
      speed: 29, range: 50, cooldown: 1.02, size: 74, recharge: 11, kind: "knight",
      unlockable: true, guard: true, cleave: 58,
      info: "검과 방패로 버티며 전방을 넓게 베는 기사",
    },
    {
      id: "raccoon_bomber", name: "화약너굴", cost: 440, hp: 285, damage: 104,
      speed: 34, range: 195, cooldown: 1.75, size: 63, recharge: 10.8, kind: "bomber",
      projectile: true, splash: 132, unlockable: true, shot: "#ff9b52",
      info: "큰 폭탄으로 넓은 범위를 한꺼번에 공격",
    },
    {
      id: "lynx_sniper", name: "석궁스라소니", cost: 590, hp: 185, damage: 245,
      speed: 27, range: 365, cooldown: 2.45, size: 58, recharge: 14.2, kind: "sniper",
      projectile: true, critChance: 0.26, critPower: 2, unlockable: true, shot: "#dcecff",
      info: "최장 거리에서 강력한 석궁 한 발을 날린다",
    },
    {
      id: "wolverine", name: "강철발톱", cost: 300, hp: 330, damage: 78,
      speed: 63, range: 42, cooldown: 0.55, size: 61, recharge: 7.2, kind: "berserker",
      unlockable: true, cleave: 38,
      info: "체력이 줄수록 공격력이 폭발하는 난전 전문가",
    },
    {
      id: "armadillo", name: "철갑아르마", cost: 650, hp: 1480, damage: 124,
      speed: 20, range: 54, cooldown: 1.5, size: 84, recharge: 15.5, kind: "titan",
      unlockable: true, cleave: 108, guard: true,
      info: "등껍질과 대형 방패로 길목을 완전히 막는다",
    },
    {
      id: "monkey_drummer", name: "전쟁북원숭", cost: 340, hp: 680, damage: 64,
      speed: 39, range: 50, cooldown: 0.9, size: 65, recharge: 7.4, kind: "drummer",
      unlockable: true, aura: 1.42,
      info: "북소리로 주변 아군 공격·공속·이동을 크게 높인다",
    },
    {
      id: "squirrel_scout", name: "창다람", cost: 95, hp: 120, damage: 22,
      speed: 88, range: 38, cooldown: 0.45, size: 50, recharge: 2, kind: "scout",
      unlockable: true,
      info: "빠른 발과 긴 창으로 빈틈을 찌르는 정찰대",
    },
    {
      id: "lightning_otter", name: "번개수달", cost: 400, hp: 360, damage: 118,
      speed: 38, range: 265, cooldown: 1.05, size: 61, recharge: 7.2, kind: "chain",
      projectile: true, chain: 4, chainRange: 190, unlockable: true, shot: "#59c9ff",
      info: "번개가 가까운 적 넷에게 강하게 연쇄된다",
    },
    {
      id: "gale_hawk", name: "돌풍매", cost: 390, hp: 245, damage: 96,
      speed: 47, range: 285, cooldown: 1.55, size: 60, recharge: 9.1, kind: "knockback",
      projectile: true, knockback: 48, unlockable: true, shot: "#d9f6a5",
      info: "돌풍 화살로 적의 전진을 밀어낸다",
    },
    {
      id: "herb_hedgehog", name: "약초고슴", cost: 420, hp: 355, damage: 52,
      speed: 30, range: 195, cooldown: 1.7, size: 64, recharge: 10.4, kind: "poisoner",
      projectile: true, splash: 76, poison: 5, poisonDamage: 16, unlockable: true, shot: "#b77cff",
      info: "독 물약으로 범위 피해와 지속 피해를 준다",
    },
    {
      id: "miku", name: "하츠네 미쿠", cost: 620, hp: 720, damage: 128,
      speed: 36, range: 285, cooldown: 1.08, size: 66, recharge: 12.5, kind: "miku_ally",
      projectile: true, chain: 3, chainRange: 150, splash: 58, mikuSkill: "song",
      unlockable: true, specialUnlock: "miku_final", shot: "#48eadc",
      info: "미쿠 라이브 최종 스테이지 보상 · 음표 연쇄 공격",
    },
  ];

  const ENEMY_TYPES = {
    sprout: {
      id: "sprout", name: "새싹 멧돼지", hp: 210, damage: 19, speed: 37,
      range: 42, cooldown: 0.85, size: 56, reward: 34, kind: "sprout", sprite: 0,
    },
    swarm: {
      id: "swarm", name: "잔챙이 멧돼지", hp: 95, damage: 11, speed: 58,
      range: 34, cooldown: 0.55, size: 42, reward: 16, kind: "swarm", sprite: 0,
      tint: "hue-rotate(88deg) saturate(1.2) brightness(1.15)",
    },
    fang: {
      id: "fang", name: "붉은 송곳니", hp: 390, damage: 38, speed: 55,
      range: 46, cooldown: 1.05, size: 64, reward: 58, kind: "fang", sprite: 1,
      tint: "hue-rotate(-25deg) saturate(1.35) brightness(1.05)",
    },
    wolf: {
      id: "wolf", name: "달빛늑대", hp: 320, damage: 46, speed: 72,
      range: 42, cooldown: 0.78, size: 60, reward: 64, kind: "wolf", sprite: 1,
      tint: "saturate(1.15) brightness(1.08)",
    },
    brute: {
      id: "brute", name: "골렘", hp: 860, damage: 84, speed: 25,
      range: 58, cooldown: 1.4, size: 84, reward: 145, kind: "brute", sprite: 2, cleave: 72,
    },
    shell: {
      id: "shell", name: "등껍질 두꺼비", hp: 980, damage: 52, speed: 16,
      range: 52, cooldown: 1.7, size: 90, reward: 160, kind: "shell", sprite: 2,
      tint: "hue-rotate(80deg) saturate(.9) brightness(.85)",
    },
    spitter: {
      id: "spitter", name: "독침 두더지", hp: 430, damage: 48, speed: 30,
      range: 235, cooldown: 1.5, size: 61, reward: 72, kind: "spitter", sprite: 0,
      projectile: true, slow: 1.4, shot: "#8ad84d",
      tint: "hue-rotate(40deg) saturate(1.4) brightness(.88)",
    },
    toxic: {
      id: "toxic", name: "맹독 두더지", hp: 520, damage: 68, speed: 27,
      range: 250, cooldown: 1.35, size: 63, reward: 92, kind: "toxic", sprite: 0,
      projectile: true, slow: 2.1, splash: 54, shot: "#c6ff4a",
      tint: "hue-rotate(70deg) saturate(1.7) brightness(.8)",
    },
    shaman: {
      id: "shaman", name: "가시 주술사", hp: 690, damage: 32, speed: 24,
      range: 205, cooldown: 1.8, size: 70, reward: 110, kind: "shaman", sprite: 1,
      projectile: true, heal: 72, shot: "#d483f0",
      tint: "hue-rotate(245deg) saturate(1.2) brightness(.9)",
    },
    priest: {
      id: "priest", name: "가시 사제", hp: 720, damage: 40, speed: 22,
      range: 220, cooldown: 1.65, size: 72, reward: 138, kind: "priest", sprite: 1,
      projectile: true, heal: 95, shot: "#f0a0ff",
      tint: "hue-rotate(270deg) saturate(1.35) brightness(.95)",
    },
    jugger: {
      id: "jugger", name: "철갑 거인", hp: 1320, damage: 108, speed: 18,
      range: 64, cooldown: 1.55, size: 98, reward: 220, kind: "jugger", sprite: 2, cleave: 96,
      tint: "hue-rotate(-20deg) saturate(.7) brightness(.75)",
    },
    wraith: {
      id: "wraith", name: "안개여우", hp: 480, damage: 72, speed: 66,
      range: 44, cooldown: 0.7, size: 58, reward: 96, kind: "wraith", sprite: 1,
      critChance: 0.22, critPower: 1.8,
      tint: "hue-rotate(200deg) saturate(.7) brightness(1.1)",
    },
    boss: {
      id: "boss", name: "가시왕", hp: 2400, damage: 132, speed: 17,
      range: 74, cooldown: 1.65, size: 112, reward: 600, kind: "boss", sprite: 3, cleave: 118, raid: true,
    },
    king: {
      id: "king", name: "가시대왕", hp: 3100, damage: 158, speed: 16,
      range: 80, cooldown: 1.5, size: 122, reward: 820, kind: "king", sprite: 3, cleave: 140, raid: true,
      tint: "hue-rotate(-25deg) saturate(1.35) brightness(1.05)",
    },
    nightlord: {
      id: "nightlord", name: "달그림자 군주", hp: 3800, damage: 175, speed: 19,
      range: 86, cooldown: 1.42, size: 128, reward: 1100, kind: "nightlord", sprite: 3, cleave: 160, raid: true,
      tint: "hue-rotate(210deg) saturate(1.2) brightness(.78)",
    },
    bloodwing_bat: {
      id: "bloodwing_bat", name: "흡혈박쥐", hp: 175, damage: 31, speed: 92,
      range: 36, cooldown: 0.5, size: 52, reward: 42, kind: "bat",
      critChance: 0.2, critPower: 1.65,
    },
    bone_raven: {
      id: "bone_raven", name: "뼈까마귀", hp: 455, damage: 64, speed: 34,
      range: 270, cooldown: 1.55, size: 63, reward: 84, kind: "raven",
      projectile: true, shot: "#d6b9ff",
    },
    siege_rhino: {
      id: "siege_rhino", name: "공성코뿔소", hp: 1280, damage: 92, speed: 20,
      range: 60, cooldown: 1.48, size: 96, reward: 195, kind: "rhino", cleave: 88, siege: 2.05,
    },
    mooncap_witch: {
      id: "mooncap_witch", name: "달버섯마녀", hp: 620, damage: 45, speed: 24,
      range: 225, cooldown: 1.72, size: 70, reward: 126, kind: "witch",
      projectile: true, heal: 80, slow: 1.6, shot: "#a8ef55",
    },
    moon_wolf: {
      id: "moon_wolf", name: "월하늑대", hp: 340, damage: 50, speed: 70,
      range: 44, cooldown: 0.76, size: 58, reward: 72, kind: "wolf",
      tint: "hue-rotate(8deg) saturate(1.15) brightness(1.05)",
    },
    moss_toad: {
      id: "moss_toad", name: "습지두꺼비", hp: 1040, damage: 56, speed: 15,
      range: 54, cooldown: 1.72, size: 92, reward: 172, kind: "shell",
    },
    burrow_mole: {
      id: "burrow_mole", name: "땅굴두더지", hp: 450, damage: 52, speed: 29,
      range: 240, cooldown: 1.48, size: 62, reward: 78, kind: "spitter",
      projectile: true, slow: 1.5, shot: "#8ad84d",
    },
    gloom_mole: {
      id: "gloom_mole", name: "안개두더지", hp: 540, damage: 72, speed: 26,
      range: 255, cooldown: 1.32, size: 64, reward: 98, kind: "toxic",
      projectile: true, slow: 2.2, splash: 56, shot: "#c6ff4a",
    },
    thorn_elder: {
      id: "thorn_elder", name: "가시장로", hp: 720, damage: 36, speed: 23,
      range: 210, cooldown: 1.76, size: 72, reward: 118, kind: "shaman",
      projectile: true, heal: 78, shot: "#d483f0",
    },
    thorn_bishop: {
      id: "thorn_bishop", name: "가시주교", hp: 760, damage: 44, speed: 21,
      range: 226, cooldown: 1.6, size: 74, reward: 146, kind: "priest",
      projectile: true, heal: 102, shot: "#f0a0ff",
    },
    iron_colossus: {
      id: "iron_colossus", name: "무쇠거신", hp: 1480, damage: 116, speed: 17,
      range: 66, cooldown: 1.58, size: 102, reward: 240, kind: "jugger", cleave: 102,
    },
    mist_fox: {
      id: "mist_fox", name: "안개별", hp: 500, damage: 76, speed: 68,
      range: 46, cooldown: 0.68, size: 60, reward: 104, kind: "wraith",
      critChance: 0.24, critPower: 1.85,
    },
    thorn_king: {
      id: "thorn_king", name: "가시왕자", hp: 2680, damage: 148, speed: 16,
      range: 78, cooldown: 1.52, size: 118, reward: 700, kind: "king", cleave: 128,
    },
    dusk_lord: {
      id: "dusk_lord", name: "달그림자 대군주", hp: 3400, damage: 168, speed: 18,
      range: 84, cooldown: 1.44, size: 124, reward: 920, kind: "nightlord", cleave: 150,
    },
  };

  Object.assign(ENEMY_TYPES, {
    miku_song: {
      id: "miku_song", name: "싱어 미쿠", hp: 1850, damage: 118, speed: 34,
      range: 280, cooldown: 1.02, size: 74, reward: 210, kind: "miku_song",
      projectile: true, mikuSkill: "song", shot: "#48eadc",
    },
    miku_leek: {
      id: "miku_leek", name: "대파 미쿠", hp: 2450, damage: 176, speed: 50,
      range: 54, cooldown: 0.82, size: 76, reward: 250, kind: "miku_leek",
      mikuSkill: "leek", cleave: 120,
    },
    miku_guard: {
      id: "miku_guard", name: "스피커 미쿠", hp: 4300, damage: 96, speed: 22,
      range: 235, cooldown: 1.58, size: 82, reward: 310, kind: "miku_guard",
      projectile: true, mikuSkill: "guard", splash: 62, shot: "#ff55b8",
    },
    miku_cannon: {
      id: "miku_cannon", name: "캐논 미쿠", hp: 3100, damage: 245, speed: 18,
      range: 355, cooldown: 2.28, size: 86, reward: 360, kind: "miku_cannon",
      projectile: true, mikuSkill: "cannon", splash: 190, shot: "#ff4faf",
    },
  });

  const RIFT = window.FurRiftRoster || {
    ALLIES: [], ENEMIES: {}, STAGES: [], CHAPTERS: {}, ALLY_SHEETS: [], ENEMY_SHEETS: [],
  };
  for (const unit of RIFT.ALLIES) UNIT_TYPES.push(unit);
  Object.assign(ENEMY_TYPES, RIFT.ENEMIES);
  const RIFT_STAGES = RIFT.STAGES;
  const RIFT_CHAPTERS = RIFT.CHAPTERS;

  const CHAPTERS = {
    1: "1장 · 초원 전선",
    2: "2장 · 소나무 숲",
    3: "3장 · 독안개 습지",
    4: "4장 · 폐허 능선",
    5: "5장 · 외성 공성",
    6: "6장 · 달그림자 성",
    7: "7장 · 내부 성곽",
    8: "8장 · 가시왕 옥좌",
  };

  function S(id, name, stars, playerHp, enemyHp, money, count, pace, pool, boss, scale, waves = 3) {
    return { id, name, stars, playerHp, enemyHp, money, count, pace, pool, boss, scale, waves };
  }

  const STAGES = [
    S("1-1", "어둠이 내린 초원", "★☆☆", 2800, 1500, 230, 10, 2.55, [["sprout", 1]], null, 0.78),
    S("1-2", "이슬 풀밭", "★☆☆", 2900, 1700, 220, 12, 2.4, [["sprout", 0.7], ["swarm", 0.3]], null, 0.86),
    S("1-3", "소나무 길목", "★☆☆", 3000, 2000, 210, 14, 2.2, [["sprout", 0.62], ["fang", 0.38]], null, 0.94),
    S("1-4", "반딧불 언덕", "★★☆", 3100, 2300, 200, 16, 2.05, [["sprout", 0.4], ["swarm", 0.25], ["fang", 0.35]], null, 1.02),
    S("1-5", "달빛 계곡", "★★☆", 3300, 2700, 190, 16, 1.9, [["fang", 0.7], ["sprout", 0.3]], "fang", 1.1),
    S("2-1", "안개 숲길", "★★☆", 3400, 3000, 220, 17, 2.15, [["sprout", 0.25], ["fang", 0.55], ["wolf", 0.2]], null, 1.06),
    S("2-2", "울창한 침엽수", "★★☆", 3500, 3300, 215, 18, 2.08, [["fang", 0.45], ["wolf", 0.35], ["brute", 0.2]], null, 1.1),
    S("2-3", "가시 능선", "★★★", 3600, 3600, 235, 18, 2.02, [["fang", 0.34], ["wolf", 0.36], ["brute", 0.3]], null, 1.15),
    S("2-4", "폐허가 된 초소", "★★★", 3700, 3900, 230, 19, 1.94, [["wolf", 0.4], ["brute", 0.4], ["spitter", 0.2]], null, 1.22),
    S("2-5", "외성 앞마당", "★★★", 3800, 4300, 225, 17, 1.88, [["fang", 0.35], ["brute", 0.65]], "brute", 1.3),
    S("3-1", "밤의 습지", "★★★", 3900, 4500, 220, 20, 1.82, [["wolf", 0.35], ["spitter", 0.4], ["brute", 0.25]], null, 1.36, 4),
    S("3-2", "독안개 초소", "★★★", 4000, 4900, 215, 21, 1.74, [["spitter", 0.5], ["fang", 0.25], ["shell", 0.25]], null, 1.42, 4),
    S("3-3", "주술사의 늪", "★★★★", 4100, 5300, 210, 22, 1.68, [["spitter", 0.4], ["shaman", 0.35], ["shell", 0.25]], null, 1.48, 4),
    S("3-4", "떠다니는 이끼", "★★★★", 4200, 5700, 205, 23, 1.6, [["toxic", 0.35], ["shaman", 0.35], ["wolf", 0.3]], null, 1.54, 4),
    S("3-5", "습지 제단", "★★★★", 4300, 6200, 200, 21, 1.55, [["shaman", 0.4], ["shell", 0.35], ["toxic", 0.25]], "shaman", 1.62, 4),
    S("4-1", "무너진 돌다리", "★★★★", 4400, 6400, 142, 25, 1.22, [["brute", 0.35], ["shell", 0.3], ["wraith", 0.35]], null, 1.78, 4),
    S("4-2", "달그림자 숲", "★★★★", 4500, 6800, 140, 26, 1.16, [["wraith", 0.4], ["wolf", 0.3], ["spitter", 0.3]], null, 1.84, 4),
    S("4-3", "고대 석주", "★★★★", 4600, 7200, 138, 26, 1.12, [["jugger", 0.25], ["wraith", 0.35], ["shaman", 0.4]], null, 1.9, 4),
    S("4-4", "메아리 협곡", "★★★★", 4700, 7600, 135, 27, 1.08, [["jugger", 0.35], ["toxic", 0.35], ["wolf", 0.3]], null, 1.96, 4),
    S("4-5", "폐허의 왕", "★★★★★", 4800, 8200, 132, 24, 1.04, [["jugger", 0.45], ["wraith", 0.3], ["priest", 0.25]], "jugger", 2.04, 4),
    S("5-1", "공성 진지", "★★★★★", 5200, 6200, 200, 22, 1.28, [["brute", 0.34], ["spitter", 0.38], ["priest", 0.28]], null, 1.58, 4),
    S("5-2", "외성 해자", "★★★★★", 5300, 6500, 205, 22, 1.24, [["shell", 0.34], ["toxic", 0.38], ["jugger", 0.28]], null, 1.62, 4),
    S("5-3", "가시왕 외성", "★★★★★", 5400, 6800, 210, 23, 1.2, [["jugger", 0.34], ["priest", 0.3], ["wraith", 0.36]], null, 1.66, 4),
    S("5-4", "성벽 아래", "★★★★★", 5500, 7100, 215, 23, 1.16, [["jugger", 0.36], ["toxic", 0.28], ["wolf", 0.36]], "brute", 1.7, 4),
    S("5-5", "외성 성문", "★★★★★", 5700, 7600, 220, 21, 1.12, [["jugger", 0.42], ["priest", 0.38], ["wraith", 0.2]], "boss", 1.76, 4),
    S("6-1", "달빛 회랑", "★★★★★", 5800, 7900, 225, 24, 1.18, [["wraith", 0.45], ["priest", 0.28], ["toxic", 0.27]], null, 1.8, 4),
    S("6-2", "유리 정원", "★★★★★", 5900, 8200, 230, 24, 1.14, [["wraith", 0.4], ["shaman", 0.3], ["jugger", 0.3]], null, 1.84, 4),
    S("6-3", "침묵의 예배당", "★★★★★", 6000, 8600, 235, 25, 1.1, [["priest", 0.4], ["shell", 0.25], ["wraith", 0.35]], null, 1.88, 4),
    S("6-4", "달그림자 탑", "★★★★★", 6100, 9000, 240, 25, 1.08, [["wraith", 0.38], ["toxic", 0.3], ["jugger", 0.32]], "priest", 1.92, 4),
    S("6-5", "달의 알현실", "★★★★★", 6300, 9600, 245, 23, 1.04, [["wraith", 0.4], ["priest", 0.35], ["jugger", 0.25]], "king", 1.98, 4),
    S("7-1", "내부 성곽", "★★★★★", 6400, 9900, 250, 26, 1.08, [["jugger", 0.34], ["wolf", 0.36], ["toxic", 0.3]], null, 2.02, 4),
    S("7-2", "왕실 무기고", "★★★★★", 6500, 10300, 255, 26, 1.04, [["jugger", 0.38], ["priest", 0.32], ["shell", 0.3]], null, 2.06, 4),
    S("7-3", "피의 연회장", "★★★★★", 6600, 10700, 260, 27, 1.02, [["wraith", 0.42], ["wolf", 0.3], ["jugger", 0.28]], null, 2.1, 4),
    S("7-4", "왕좌의 복도", "★★★★★", 6700, 11100, 265, 27, 1.0, [["jugger", 0.36], ["priest", 0.32], ["wraith", 0.32]], "jugger", 2.14, 4),
    S("7-5", "가시왕 성문", "★★★★★", 6900, 11800, 270, 24, 0.96, [["jugger", 0.36], ["priest", 0.36], ["toxic", 0.28]], "king", 2.18, 4),
    S("8-1", "옥좌 앞뜰", "★★★★★", 7100, 12200, 275, 27, 1.0, [["wraith", 0.38], ["jugger", 0.32], ["priest", 0.3]], null, 2.22, 4),
    S("8-2", "검은 알현실", "★★★★★", 7300, 12600, 280, 28, 0.98, [["jugger", 0.38], ["wraith", 0.36], ["priest", 0.26]], null, 2.26, 4),
    S("8-3", "달의 심연", "★★★★★", 7500, 13000, 285, 28, 0.96, [["priest", 0.36], ["toxic", 0.28], ["wraith", 0.36]], null, 2.3, 4),
    S("8-4", "마지막 보루", "★★★★★", 7700, 13600, 290, 29, 0.94, [["jugger", 0.36], ["priest", 0.3], ["wraith", 0.34]], "king", 2.36, 4),
    S("8-5", "가시왕 옥좌", "★★★★★", 8000, 14500, 300, 26, 0.9, [["jugger", 0.32], ["priest", 0.34], ["wraith", 0.34]], "nightlord", 2.42, 4),
  ];

  const MIKU_CHAPTERS = {
    M1: "고난도 특별 무대 · 네온 라이브 침공",
  };
  const MIKU_STAGES = [
    Object.assign(S("M1-1", "싱어의 사운드 체크", "★★★★", 4000, 5200, 260, 18, 1.7, [["sprout", 0.38], ["spitter", 0.25], ["miku_song", 0.37]], null, 1.25, 4), { mikuFinale: ["miku_song"] }),
    Object.assign(S("M1-2", "대파 비트 러시", "★★★★", 4200, 6500, 255, 21, 1.5, [["fang", 0.28], ["spitter", 0.2], ["miku_song", 0.2], ["miku_leek", 0.32]], null, 1.45, 4), { mikuFinale: ["miku_song", "miku_leek"] }),
    Object.assign(S("M1-3", "스피커 방벽 합주", "★★★★★", 4400, 8000, 250, 24, 1.35, [["shell", 0.22], ["shaman", 0.18], ["miku_leek", 0.25], ["miku_guard", 0.35]], null, 1.65, 5), { mikuFinale: ["miku_leek", "miku_guard"] }),
    Object.assign(S("M1-4", "네온 캐논 앙코르", "★★★★★", 4650, 9800, 245, 27, 1.2, [["wraith", 0.18], ["jugger", 0.18], ["miku_song", 0.16], ["miku_guard", 0.2], ["miku_cannon", 0.28]], null, 1.86, 5), { mikuFinale: ["miku_song", "miku_guard", "miku_cannon"] }),
    Object.assign(S("M1-5", "라스트 라이브 · 미쿠 영입전", "★★★★★", 5000, 12500, 260, 30, 1.05, [["miku_song", 0.2], ["miku_leek", 0.22], ["miku_guard", 0.2], ["miku_cannon", 0.18], ["nightlord", 0.2]], null, 2.1, 6), { mikuFinale: ["miku_song", "miku_leek", "miku_guard", "miku_cannon"], rewardUnit: "miku" }),
  ];

  const SAVE_KEY = "fur-front-unlock";
  const RIFT_SAVE_KEY = "fur-front-rift-unlock";
  const MIKU_SAVE_KEY = "fur-front-miku-unlock";
  const PROFILE_KEY = "fur-front-profile-v2";
  const LOCAL_UPDATED_KEY = "fur-front-local-updated-v1";
  const MAX_DECK_SIZE = 10;
  const MAX_UNIT_LEVEL = 20;
  const ALLY_POWER = 1.14;
  const ALLY_RECHARGE = 0.8;
  const STONE_SELL_GOLD = 50;
  const STONE_BUY_GOLD = 70;
  const STARTER_UNITS = UNIT_TYPES.filter((unit) => !unit.unlockable && !unit.rift).map((unit) => unit.id);
  // 신월 전선은 본편과 완전히 분리하되, 첫 상자를 얻기 전에도 전투와
  // 덱 편성이 가능하도록 전용 스타터 3명을 지급한다.
  const RIFT_STARTER_UNITS = ["breeze_squirrel", "crystal_raccoon", "flame_fox"];
  const CAMPAIGN_UNIT_IDS = new Set(UNIT_TYPES.filter((unit) => !unit.rift).map((unit) => unit.id));
  const RIFT_UNIT_IDS = new Set(UNIT_TYPES.filter((unit) => unit.rift).map((unit) => unit.id));
  const LEGACY_UNIT_MIGRATIONS = {
    healer: "moon_cleric",
    assassin: "night_fox",
    frost: "frost_owl",
    knight: "sun_lion",
    berserker: "wolverine",
  };

  function migrateUnitIds(ids) {
    return ids.map((id) => LEGACY_UNIT_MIGRATIONS[id] || id);
  }

  function normalizeProfile(saved = {}) {
      const savedUnits = migrateUnitIds(Array.isArray(saved.units) ? saved.units : [])
        .filter((id) => CAMPAIGN_UNIT_IDS.has(id));
      const units = [...new Set([...STARTER_UNITS, ...savedUnits])];
      const savedRiftUnits = migrateUnitIds(Array.isArray(saved.riftUnits) ? saved.riftUnits : [])
        .filter((id) => RIFT_UNIT_IDS.has(id));
      const riftUnits = [...new Set([...RIFT_STARTER_UNITS, ...savedRiftUnits])];
      const ownedCampaign = new Set(units);
      const ownedRift = new Set(riftUnits);
      const ownedAll = new Set([...ownedCampaign, ...ownedRift]);
      const requestedDeck = Array.isArray(saved.deck) ? migrateUnitIds(saved.deck) : units;
      const deck = [...new Set(requestedDeck)]
        .filter((id) => ownedAll.has(id))
        .slice(0, MAX_DECK_SIZE);
      const requestedRiftDeck = Array.isArray(saved.riftDeck) ? migrateUnitIds(saved.riftDeck) : riftUnits.slice(0, 5);
      const riftDeck = [...new Set(requestedRiftDeck)]
        .filter((id) => ownedAll.has(id))
        .slice(0, MAX_DECK_SIZE);
      const savedLevels = saved.levels && typeof saved.levels === "object" ? saved.levels : {};
      const allOwned = [...ownedAll];
      const levels = Object.fromEntries(allOwned.map((id) => [
        id,
        Math.max(1, Math.min(MAX_UNIT_LEVEL, Math.floor(Number(savedLevels[id]) || 1))),
      ]));
      return {
        chests: Math.max(0, Number(saved.chests) || 0),
        riftChests: Math.max(0, Number(saved.riftChests) || 0),
        gold: saved.gold === undefined ? 300 : Math.max(0, Math.floor(Number(saved.gold) || 0)),
        materials: saved.materials === undefined ? 8 : Math.max(0, Math.floor(Number(saved.materials) || 0)),
        units,
        riftUnits,
        deck: deck.length ? deck : [units[0]],
        riftDeck,
        levels,
        duplicates: saved.duplicates && typeof saved.duplicates === "object" ? saved.duplicates : {},
        claimedStages: Array.isArray(saved.claimedStages) ? saved.claimedStages : [],
        riftClaimedStages: Array.isArray(saved.riftClaimedStages) ? saved.riftClaimedStages : [],
        riftGrantRevoked: true,
      };
  }

  function loadProfile() {
    try {
      return normalizeProfile(JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"));
    } catch (_) {
      return normalizeProfile({});
    }
  }

  function localUpdatedAt() {
    return Math.max(0, Number(localStorage.getItem(LOCAL_UPDATED_KEY)) || 0);
  }

  function cloudSnapshot(updatedAt = Date.now()) {
    return {
      profile: JSON.parse(JSON.stringify(state.profile)),
      unlocked: state.unlocked,
      unlockedRift: state.unlockedRift,
      unlockedMiku: state.unlockedMiku,
      updatedAt,
    };
  }

  function queueCloudSave(updatedAt) {
    window.FurCloudSave?.queueSave?.(cloudSnapshot(updatedAt));
  }

  function saveProfile() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
    const updatedAt = Date.now();
    localStorage.setItem(LOCAL_UPDATED_KEY, String(updatedAt));
    queueCloudSave(updatedAt);
  }

  function ownsUnit(id) {
    const unit = UNIT_TYPES.find((entry) => entry.id === id);
    if (!unit) return false;
    if (unit.rift) return state.profile.riftUnits.includes(id);
    return state.profile.units.includes(id);
  }

  function isRiftMode() {
    return state.battleMode === "rift";
  }

  function isMikuMode() {
    return state.battleMode === "miku";
  }

  function activeStages() {
    if (isMikuMode()) return MIKU_STAGES;
    return isRiftMode() ? RIFT_STAGES : STAGES;
  }

  function activeChapters() {
    if (isMikuMode()) return MIKU_CHAPTERS;
    return isRiftMode() ? RIFT_CHAPTERS : CHAPTERS;
  }

  function activeUnlocked() {
    if (isMikuMode()) return state.unlockedMiku;
    return isRiftMode() ? state.unlockedRift : state.unlocked;
  }

  function activeDeckIds() {
    return isRiftMode() ? state.profile.riftDeck : state.profile.deck;
  }

  function activeOwnedIds() {
    return [...new Set([...state.profile.units, ...state.profile.riftUnits])];
  }

  function activeChestCount() {
    return isRiftMode() ? state.profile.riftChests : state.profile.chests;
  }

  function setActiveChestCount(value) {
    if (isRiftMode()) state.profile.riftChests = value;
    else state.profile.chests = value;
  }

  function modeUnits() {
    return UNIT_TYPES;
  }

  function unlockablePool() {
    // 상자는 모드별로 분리 (신월 상자는 신규만, 본편 상자는 본편만)
    if (isRiftMode()) return UNIT_TYPES.filter((unit) => unit.rift && unit.unlockable);
    return UNIT_TYPES.filter((unit) => !unit.rift && unit.unlockable && !unit.specialUnlock);
  }

  function unitLevel(id) {
    return Math.max(1, Math.min(MAX_UNIT_LEVEL, Number(state.profile.levels[id]) || 1));
  }

  function summonRecharge(type) {
    const level = unitLevel(type.id);
    return type.recharge * ALLY_RECHARGE * Math.max(0.42, 1 - (level - 1) * 0.02);
  }

  function upgradeCost(id) {
    const level = unitLevel(id);
    return {
      gold: 70 + level * 55,
      materials: 2 + Math.ceil(level * 1.5),
    };
  }

  function availableUnits() {
    return activeDeckIds()
      .map((id) => UNIT_TYPES.find((unit) => unit.id === id))
      .filter(Boolean)
      .slice(0, MAX_DECK_SIZE);
  }

  function loadUnlock() {
    const n = Number(localStorage.getItem(SAVE_KEY) || 0);
    return Number.isFinite(n) ? Math.max(0, Math.min(STAGES.length - 1, n)) : 0;
  }

  function loadRiftUnlock() {
    const n = Number(localStorage.getItem(RIFT_SAVE_KEY) || 0);
    return Number.isFinite(n) ? Math.max(0, Math.min(Math.max(RIFT_STAGES.length - 1, 0), n)) : 0;
  }

  function loadMikuUnlock() {
    const n = Number(localStorage.getItem(MIKU_SAVE_KEY) || 0);
    return Number.isFinite(n) ? Math.max(0, Math.min(Math.max(MIKU_STAGES.length - 1, 0), n)) : 0;
  }

  function saveUnlock(index) {
    localStorage.setItem(SAVE_KEY, String(index));
    const updatedAt = Date.now();
    localStorage.setItem(LOCAL_UPDATED_KEY, String(updatedAt));
    queueCloudSave(updatedAt);
  }

  function saveRiftUnlock(index) {
    localStorage.setItem(RIFT_SAVE_KEY, String(index));
    const updatedAt = Date.now();
    localStorage.setItem(LOCAL_UPDATED_KEY, String(updatedAt));
    queueCloudSave(updatedAt);
  }

  function saveMikuUnlock(index) {
    localStorage.setItem(MIKU_SAVE_KEY, String(index));
    const updatedAt = Date.now();
    localStorage.setItem(LOCAL_UPDATED_KEY, String(updatedAt));
    queueCloudSave(updatedAt);
  }

  function currentStage() {
    const stages = activeStages();
    return stages[state.stageIndex] || stages[0];
  }

  function pickFromPool(pool) {
    const total = pool.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = Math.random() * total;
    for (const [kind, weight] of pool) {
      roll -= weight;
      if (roll <= 0) return kind;
    }
    return pool[0][0];
  }

  function stageEnemyPool(stage) {
    if (isMikuMode()) return stage.pool;
    if (stage.rift || isRiftMode()) {
      const [chapterText] = String(stage.id).replace(/^R/, "").split("-");
      const chapter = Number(chapterText) || 1;
      const classic = {
        // 신월: 초반은 멧돼지/잔챙이 위주, 늑대·박쥐 비중 낮춤
        1: [["sprout", 0.38], ["swarm", 0.28], ["spike_boar", 0.2], ["spore_rat", 0.14]],
        2: [["brute", 0.22], ["spike_boar", 0.2], ["spitter", 0.18], ["bone_raven", 0.14], ["fang", 0.12]],
        3: [["spitter", 0.2], ["shell", 0.16], ["brute", 0.14], ["bone_raven", 0.12], ["moss_toad", 0.1]],
        4: [["spitter", 0.16], ["mist_fox", 0.14], ["burrow_mole", 0.14], ["wraith", 0.12], ["brute", 0.1]],
        5: [["jugger", 0.16], ["toxic", 0.14], ["siege_rhino", 0.12], ["iron_colossus", 0.1], ["iron_boar", 0.12]],
        6: [["shaman", 0.14], ["priest", 0.12], ["mooncap_witch", 0.12], ["thorn_elder", 0.1], ["wraith", 0.1]],
        7: [["jugger", 0.14], ["wraith", 0.12], ["thorn_bishop", 0.1], ["nightlord", 0.06], ["dusk_lord", 0.05]],
      }[Math.min(chapter, 7)] || [];
      return [...stage.pool, ...classic];
    }
    const [chapterText, partText] = stage.id.split("-");
    const chapter = Number(chapterText) || 1;
    const part = Number(partText) || 1;
    const extraWeight = 0.1 + part * 0.018;
    const reinforcements = {
      2: [["bone_raven", extraWeight], ["bloodwing_bat", extraWeight * 0.8], ["moss_toad", extraWeight * 0.55]],
      3: [["bone_raven", extraWeight], ["moss_toad", extraWeight * 0.7], ["burrow_mole", extraWeight * 0.65]],
      4: [["mist_fox", extraWeight * 0.8], ["bone_raven", extraWeight * 0.75], ["burrow_mole", extraWeight * 0.65]],
      5: [["siege_rhino", extraWeight], ["iron_colossus", extraWeight * 0.7], ["gloom_mole", extraWeight * 0.55]],
      6: [["mooncap_witch", extraWeight], ["bone_raven", extraWeight * 0.55], ["thorn_elder", extraWeight * 0.7]],
      7: [["siege_rhino", extraWeight * 0.75], ["mooncap_witch", extraWeight * 0.8], ["thorn_bishop", extraWeight * 0.65], ["iron_colossus", extraWeight * 0.5]],
      8: [["siege_rhino", extraWeight * 0.7], ["mooncap_witch", extraWeight], ["thorn_king", extraWeight * 0.35], ["dusk_lord", extraWeight * 0.28]],
    }[chapter] || [];
    return [...stage.pool, ...reinforcements];
  }

  const INITIAL_PREP_TIME = 8;

  function buildEndlessWave(stage, waveNumber) {
    const baseCount = Math.max(3, Math.ceil(stage.count / (stage.waves || 3)));
    const count = Math.min(baseCount + Math.floor((waveNumber - 1) / 2), baseCount + 8);
    const pool = stageEnemyPool(stage);
    const queue = [];
    for (let i = 0; i < count; i++) queue.push(pickFromPool(pool));
    if (stage.boss && waveNumber % 5 === 0) queue.push(stage.boss);
    return queue;
  }

  const state = {
    mode: "menu",
    paused: false,
    sound: true,
    time: 0,
    battleTime: 0,
    money: 180,
    maxMoney: 1200,
    worker: 1,
    playerHp: 3500,
    playerMaxHp: 3500,
    enemyHp: 3200,
    enemyMaxHp: 3200,
    units: [],
    enemies: [],
    projectiles: [],
    particles: [],
    texts: [],
    cooldowns: Object.fromEntries(UNIT_TYPES.map((u) => [u.id, 0])),
    cannon: 0,
    cannonMax: 28,
    command: 0,
    commandMax: 100,
    commandBuff: 0,
    spawnTimer: 1.8,
    spawnIndex: 0,
    bossSpawned: false,
    shake: 0,
    flash: 0,
    messageTimer: 0,
    nextId: 1,
    stageIndex: 0,
    unlocked: 0,
    unlockedRift: 0,
    unlockedMiku: 0,
    battleMode: "campaign",
    chestBusy: false,
    spawnQueue: [],
    waveQueues: [],
    waveIndex: 1,
    waveTotal: 3,
    waveBreak: 0,
    waveWaiting: false,
    totalEnemies: 0,
    spawnedCount: 0,
    kills: 0,
    combo: 0,
    comboTimer: 0,
    bestCombo: 0,
    dangerLevel: 0,
    castleHint: false,
    mikuTowerBroken: false,
    mikuBossUids: [],
    mikuFinaleDefeated: false,
    profile: loadProfile(),
  };

  state.unlocked = loadUnlock();
  state.unlockedRift = loadRiftUnlock();
  state.unlockedMiku = loadMikuUnlock();
  state.stageIndex = state.unlocked;
  spriteUiReady = true;

  let audioCtx = null;
  function sound(type) {
    if (!state.sound) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      const preset = {
        deploy: [340, 520, 0.08, "triangle", 0.045],
        hit: [120, 65, 0.06, "square", 0.025],
        shoot: [620, 340, 0.09, "sine", 0.03],
        upgrade: [420, 880, 0.22, "triangle", 0.05],
        cannon: [90, 34, 0.5, "sawtooth", 0.08],
        win: [440, 880, 0.6, "triangle", 0.05],
        lose: [190, 65, 0.7, "sawtooth", 0.04],
      }[type] || [220, 110, 0.08, "square", 0.02];
      osc.type = preset[3];
      osc.frequency.setValueAtTime(preset[0], now);
      osc.frequency.exponentialRampToValueAtTime(preset[1], now + preset[2]);
      gain.gain.setValueAtTime(preset[4], now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + preset[2]);
      osc.start(now);
      osc.stop(now + preset[2]);
    } catch (_) {
      // Audio is optional.
    }
  }

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);

  function workerCost() {
    return Math.round(130 * Math.pow(1.43, state.worker));
  }

  function rescaleBattleEntities(previous) {
    if (!state?.units || !state?.enemies) return;
    const oldSpan = Math.max(1, previous.enemyBaseX - previous.playerBaseX);
    const newSpan = Math.max(1, ENEMY_BASE_X - PLAYER_BASE_X);
    const oldBattleSpan = Math.max(1, previous.battleEnd - previous.battleStart);
    const newBattleSpan = Math.max(1, BATTLE_END - BATTLE_START);
    const worldRatio = VIEW_SCALE / Math.max(0.001, previous.viewScale);
    const fighterRatio = FIGHTER_VIEW_SCALE / Math.max(0.001, previous.fighterViewScale);
    const mapX = (x) => PLAYER_BASE_X + ((x - previous.playerBaseX) / oldSpan) * newSpan;
    const mapBattleX = (x) => BATTLE_START + ((x - previous.battleStart) / oldBattleSpan) * newBattleSpan;

    for (const actor of [...state.units, ...state.enemies]) {
      actor.x = mapBattleX(actor.x);
      actor.y = GROUND + actor.lane * Math.round(10 * VIEW_SCALE);
      actor.size = Math.max(1, Math.round(actor.size * fighterRatio));
      actor.range *= worldRatio;
      actor.speed *= worldRatio;
      actor.cleave *= worldRatio;
      actor.splash *= worldRatio;
    }

    for (const projectile of state.projectiles || []) {
      projectile.x = mapX(projectile.x);
      projectile.y = GROUND + (projectile.y - previous.ground) * fighterRatio;
      if (Number.isFinite(projectile.targetX)) projectile.targetX = mapX(projectile.targetX);
      if (Number.isFinite(projectile.targetY)) {
        projectile.targetY = GROUND + (projectile.targetY - previous.ground) * fighterRatio;
      }
      projectile.speed *= worldRatio;
      projectile.splash *= worldRatio;
      projectile.chainRange *= worldRatio;
      projectile.knockback *= worldRatio;
    }
  }

  function incomeRate() {
    return 18 + state.worker * 7;
  }

  function makeFighter(type, team) {
    const dir = team === "ally" ? 1 : -1;
    const x = team === "ally" ? BATTLE_START : BATTLE_END;
    const uid = state.nextId++;
    const lane = type.raid || type.kind === "boss" ? 0 : ((uid + (team === "ally" ? 0 : 1)) % 3) - 1;
    const level = team === "ally" ? unitLevel(type.id) : 1;
    const statPower = (1 + (level - 1) * 0.18) * ALLY_POWER;
    const supportPower = (1 + (level - 1) * 0.15) * ALLY_POWER;
    const maxHp = Math.round(type.hp * statPower);
    return {
      ...type,
      uid,
      level,
      team,
      dir,
      x,
      // A shallow lane offset preserves depth without making fighters look as
      // if they are hovering far above or below the battlefield.
      y: GROUND + lane * Math.round(10 * VIEW_SCALE),
      lane,
      hp: maxHp,
      maxHp,
      damage: Math.round(type.damage * statPower),
      heal: type.heal ? Math.round(type.heal * supportPower) : type.heal,
      aura: type.aura ? type.aura + (level - 1) * 0.04 : type.aura,
      recharge: summonRecharge(type),
      size: Math.round(type.size * FIGHTER_VIEW_SCALE * FIGHTER_SCALE),
      range: type.range * VIEW_SCALE,
      speed: type.speed * VIEW_SCALE,
      cleave: (type.cleave || 0) * VIEW_SCALE,
      splash: (type.splash || 0) * VIEW_SCALE,
      attackTimer: rand(0, 0.2),
      attackAnim: 0,
      attackDuration: type.projectile ? 0.48 : 0.4,
      hitFlash: 0,
      recoil: 0,
      slow: 0,
      poisonTimer: 0,
      poisonTick: 0,
      poisonDamage: 0,
      charge: 0,
      moving: false,
      spawnAnim: 0,
      dustTimer: rand(0.05, 0.2),
      age: 0,
      dead: false,
      death: 0,
      seed: Math.random() * 10,
    };
  }

  function deploy(index) {
    if (state.mode !== "playing" || state.paused) return;
    const type = UNIT_TYPES[index];
    if (!type || !ownsUnit(type.id) || state.money < type.cost || state.cooldowns[type.id] > 0) return;
    state.money -= type.cost;
    state.cooldowns[type.id] = summonRecharge(type);
    const unit = makeFighter(type, "ally");
    state.units.push(unit);
    burst(BATTLE_START, unit.y - 18, "#8fdcf0", 16, 110);
    spawnRing(BATTLE_START, unit.y - unit.size * 0.45, "#7ad9ea");
    floating(BATTLE_START + 5, unit.y - 75, type.name, "#fff");
    sound("deploy");
    updateUI();
  }

  function spawnEnemy(kind) {
    const base = ENEMY_TYPES[kind];
    if (!base) return;
    const scale = currentStage().scale;
    const hpScale = scale <= 1.55 ? scale : 1.55 + (scale - 1.55) * 0.32;
    const dmgScale = 1 + Math.max(0, scale - 1) * 0.12;
    const pressure = 1 + state.dangerLevel * 0.04;
    const late = clamp((scale - 1.15) / 1.27, 0, 1);
    const riftBoost = isRiftMode() ? 1.22 : 1;
    const hpMult = 1.08 * (1 + late * 0.39) * riftBoost;
    const dmgMult = 1.06 * (1 + late * 0.132) * (isRiftMode() ? 1.16 : 1);
    const type = {
      ...base,
      hp: Math.round(base.hp * hpScale * pressure * hpMult),
      damage: Math.round(base.damage * dmgScale * pressure * dmgMult),
      speed: base.speed * (1 + state.dangerLevel * 0.03),
    };
    const enemy = makeFighter(type, "enemy");
    enemy.hp = type.hp;
    enemy.maxHp = type.hp;
    state.enemies.push(enemy);
    burst(BATTLE_END, enemy.y - 20, "#ab7bbd", 14, 85);
    spawnRing(BATTLE_END, enemy.y - enemy.size * 0.45, "#a568bd");
    if (base.raid) {
      showMessage(`⚠ ${base.name} 등장! ⚠`, 3);
      state.shake = 1.2;
    }
  }

  function updateSpawning(dt) {
    if (isMikuMode() && state.mikuTowerBroken) return;
    if (!state.spawnQueue.length) {
      if (!state.waveWaiting) {
        state.waveWaiting = true;
        const earlyRest = state.stageIndex < 10 ? 2.2 : (state.stageIndex < 20 ? 1 : 0);
        state.waveBreak = Math.max(3.2, 4.2 + earlyRest - state.stageIndex * 0.045);
        if (state.waveIndex > 0) {
          const supply = 55 + state.waveIndex * 20;
          state.money = Math.min(state.maxMoney, state.money + supply);
          showMessage(`다음 공세 접근 · 긴급 보급 +${supply}G`, 1.8);
          sound("upgrade");
        }
      }
      state.waveBreak -= dt;
      if (state.waveBreak <= 0) {
        state.waveWaiting = false;
        state.waveIndex += 1;
        state.spawnQueue = buildEndlessWave(currentStage(), state.waveIndex);
        state.spawnTimer = 0.45;
        showMessage(`WAVE ${state.waveIndex} 시작!`, 1.6);
      }
      return;
    }
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      const kind = state.spawnQueue.shift();
      spawnEnemy(kind);
      state.spawnedCount += 1;
      const rushStep = state.stageIndex < 10 ? 0.04 : 0.065;
      const waveRush = Math.max(0.78, 1 - (state.waveIndex - 1) * rushStep);
      state.spawnTimer = currentStage().pace * waveRush * rand(0.72, 1.04);
    }
  }

  function upgradeWorker() {
    if (state.mode !== "playing" || state.paused || state.worker >= 8) return;
    const cost = workerCost();
    if (state.money < cost) return;
    state.money -= cost;
    state.worker += 1;
    state.maxMoney += 260;
    state.money = Math.min(state.maxMoney, state.money + 30);
    showMessage(`골드 생산소 Lv.${state.worker}`, 1.4);
    sound("upgrade");
    updateUI();
  }

  function fireCannon() {
    if (state.mode !== "playing" || state.paused || state.cannon < state.cannonMax) return;
    state.cannon = 0;
    state.shake = 1.4;
    state.flash = 0.35;
    sound("cannon");
    beamParticles();
    let hits = 0;
    for (const enemy of state.enemies) {
      if (enemy.dead) continue;
      damage(enemy, 330 + state.worker * 22, enemy.x, enemy.y - enemy.size * 0.6, true);
      enemy.x += 65;
      hits += 1;
    }
    showMessage(`성채 대포! ${hits}명 타격`, 1.4);
  }

  function fireCommand() {
    if (state.mode !== "playing" || state.paused || state.command < state.commandMax) return;
    state.command = 0;
    state.commandBuff = 8;
    state.playerHp = Math.min(state.playerMaxHp, state.playerHp + 260);
    for (const unit of state.units) {
      if (unit.dead) continue;
      const heal = Math.round(unit.maxHp * 0.24);
      unit.hp = Math.min(unit.maxHp, unit.hp + heal);
      floating(unit.x, unit.y - unit.size, `+${heal}`, "#9df3d0", 16);
      spawnRing(unit.x, unit.y - unit.size * 0.45, "#d78cff");
    }
    state.flash = 0.18;
    burst(PLAYER_BASE_X + 50, GROUND - 100, "#d78cff", 32, 210);
    showMessage("달빛 지휘! 8초간 진군 강화", 2);
    sound("upgrade");
  }

  function findTarget(actor) {
    const foes = actor.team === "ally" ? state.enemies : state.units;
    let best = null;
    let bestDist = Infinity;
    for (const foe of foes) {
      if (foe.dead) continue;
      const horizontal = Math.abs(foe.x - actor.x) - (actor.size + foe.size) * 0.32;
      const lanePenalty = Math.abs(foe.y - actor.y) * 0.22;
      const d = horizontal + lanePenalty;
      const ahead = (foe.x - actor.x) * actor.dir >= -46;
      if (ahead && d < bestDist) {
        bestDist = d;
        best = foe;
      }
    }
    return { target: best, distance: bestDist };
  }

  function baseDistance(actor) {
    if (isMikuMode() && state.mikuTowerBroken && actor.team === "ally") return Infinity;
    const baseX = actor.team === "ally" ? ENEMY_BASE_X : PLAYER_BASE_X;
    return Math.abs(baseX - actor.x) - actor.size * 0.4 - 58;
  }

  function allyDrumBuff(actor) {
    if (actor.team !== "ally") return { damage: 1, haste: 1, speed: 1 };
    let damage = 1;
    const auraRange = 280;
    for (const unit of state.units) {
      if (unit.dead || unit.kind !== "drummer") continue;
      if (Math.abs(unit.x - actor.x) <= auraRange) {
        damage = Math.max(damage, unit.aura || 1.28);
      }
    }
    if (damage <= 1) return { damage: 1, haste: 1, speed: 1 };
    return { damage, haste: 0.78, speed: 1.22 };
  }

  function attackDelay(actor) {
    let scale = 1;
    if (actor.team === "ally" && state.commandBuff > 0) scale *= 0.66;
    scale *= allyDrumBuff(actor).haste;
    return actor.cooldown * scale;
  }

  function rollAttackDamage(actor) {
    let amount = actor.damage;
    if (actor.kind === "moco") {
      const pack = state.units.filter((unit) => !unit.dead && unit.kind === "moco" && Math.abs(unit.x - actor.x) < 125).length;
      amount *= 1 + Math.min(3, Math.max(0, pack - 1)) * 0.12;
    }
    if ((actor.kind === "ram" || actor.kind === "titan") && actor.charge > 75) {
      amount *= actor.kind === "titan" ? 1.85 : 1.65;
      actor.charge = 0;
      floating(actor.x, actor.y - actor.size, "돌진!", "#ffd36c", 17);
    }
    if (actor.kind === "berserker" && actor.hp < actor.maxHp * 0.42) {
      amount *= 1.55;
    }
    amount *= allyDrumBuff(actor).damage;
    const critChance = actor.critChance || (actor.kind === "archer" ? 0.18 : 0);
    if (critChance && Math.random() < critChance) {
      amount *= actor.critPower || 1.75;
      floating(actor.x, actor.y - actor.size, "CRIT!", "#ff8fc7", 18);
    }
    return Math.round(amount);
  }

  function queueMikuProjectile(actor, target, baseHit, options) {
    const color = options.color || "#48eadc";
    burst(actor.x + actor.dir * actor.size * 0.32, actor.y - actor.size * 0.7, color, options.burst || 9, 70);
    state.projectiles.push({
      x: actor.x + actor.dir * actor.size * 0.38,
      y: actor.y - actor.size * 0.7,
      target: baseHit ? null : target,
      baseTeam: baseHit ? (actor.team === "ally" ? "enemy" : "ally") : null,
      targetX: baseHit ? (actor.team === "ally" ? ENEMY_BASE_X : PLAYER_BASE_X) : null,
      targetY: baseHit ? GROUND - 82 : null,
      team: actor.team,
      dir: actor.dir,
      speed: options.speed || 470,
      damage: Math.round(options.damage),
      splash: options.splash || 0,
      slow: options.slow || 0,
      chain: options.chain || 0,
      chainRange: options.chainRange || 0,
      knockback: options.knockback || 0,
      poison: 0,
      poisonDamage: 0,
      siege: options.siege || 0,
      color,
      kind: options.kind || "miku_song",
      dead: false,
      age: 0,
    });
    sound("shoot");
  }

  function attackMikuFighter(actor, target, baseHit) {
    const skill = actor.mikuSkill || "song";
    actor.attackTimer = attackDelay(actor);
    actor.attackDuration = { song: 0.62, leek: 0.56, guard: 0.74, cannon: 0.92 }[skill];
    actor.attackAnim = actor.attackDuration;
    actor.moving = false;
    const amount = rollAttackDamage(actor);

    if (skill === "leek") {
      if (!baseHit && target) {
        const desiredX = target.x - actor.dir * actor.size * 0.72;
        actor.x += clamp(desiredX - actor.x, -105 * VIEW_SCALE, 105 * VIEW_SCALE);
      }
      slashEffect(actor);
      actor.pendingHit = {
        timer: 0.14,
        target,
        baseHit,
        damage: amount * 1.3,
        cleave: 120 * VIEW_SCALE,
      };
      return;
    }

    if (skill === "guard") {
      actor.mikuGuardTimer = Math.max(actor.mikuGuardTimer || 0, 3.2);
      actor.attackTimer *= 1.22;
      floating(actor.x, actor.y - actor.size * 1.05, "SPEAKER GUARD", "#62f2e5", 16);
      spawnRing(actor.x, actor.y - actor.size * 0.5, "#ff55b8");
      queueMikuProjectile(actor, target, baseHit, {
        damage: amount * 0.72, color: "#ff55b8", speed: 410,
        splash: 54 * VIEW_SCALE, slow: 1.1, kind: "miku_song",
      });
      return;
    }

    if (skill === "cannon") {
      actor.attackTimer *= 1.72;
      floating(actor.x, actor.y - actor.size * 1.08, "FINAL BEAT", "#ff69c5", 19);
      state.shake = Math.max(state.shake, 0.35);
      queueMikuProjectile(actor, target, baseHit, {
        damage: amount * 2.05, color: "#ff4faf", speed: 360,
        splash: 185 * VIEW_SCALE, knockback: 58 * VIEW_SCALE,
        siege: 1.75, burst: 18, kind: "miku_cannon",
      });
      return;
    }

    queueMikuProjectile(actor, target, baseHit, {
      damage: amount, color: "#48eadc", speed: 500,
      slow: 0.7, chain: 3,
      chainRange: 135 * VIEW_SCALE, kind: "miku_song",
    });
  }

  function attack(actor, target, baseHit) {
    if (actor.mikuSkill) {
      attackMikuFighter(actor, target, baseHit);
      return;
    }
    actor.attackTimer = attackDelay(actor);
    actor.attackAnim = actor.attackDuration;
    actor.moving = false;
    const attackDamage = rollAttackDamage(actor);
    const projectileColor = actor.shot || {
      mage: "#ffd658", healer: "#7ce5c0", spitter: "#8ad84d", shaman: "#d483f0",
      frost: "#8fd8ff", bomber: "#ff8a4a", sniper: "#d7e7ff", toxic: "#c6ff4a", priest: "#f0a0ff",
    }[actor.kind] || "#79d55f";
    if (actor.projectile) {
      burst(
        actor.x + actor.dir * actor.size * 0.3,
        actor.y - actor.size * 0.72,
        projectileColor,
        actor.splash ? 9 : 4,
        45
      );
      state.projectiles.push({
        x: actor.x + actor.dir * actor.size * 0.35,
        y: actor.y - actor.size * 0.72,
        target: baseHit ? null : target,
        baseTeam: baseHit ? (actor.team === "ally" ? "enemy" : "ally") : null,
        targetX: baseHit ? (actor.team === "ally" ? ENEMY_BASE_X : PLAYER_BASE_X) : null,
        targetY: baseHit ? GROUND - 82 : null,
        team: actor.team,
        dir: actor.dir,
        speed: actor.kind === "sniper" ? 620 : (actor.kind === "mage" || actor.kind === "bomber" ? 340 : 480),
        damage: attackDamage,
        splash: actor.splash || 0,
        slow: actor.slow || 0,
        chain: actor.chain || 0,
        chainRange: actor.chainRange || 0,
        knockback: actor.knockback || 0,
        poison: actor.poison || 0,
        poisonDamage: actor.poisonDamage || 0,
        siege: actor.siege || 0,
        color: projectileColor,
        kind: actor.kind,
        dead: false,
        age: 0,
      });
      sound("shoot");
      return;
    }

    const hitDelay = actor.kind === "ram" || actor.kind === "titan" || actor.kind === "brute" || actor.kind === "jugger" || actor.id === "iron_colossus" || actor.raid ? 0.12 : 0.05;
    slashEffect(actor);
    actor.pendingHit = {
      timer: hitDelay,
      target,
      baseHit,
      damage: attackDamage,
      cleave: actor.cleave || 0,
    };
  }

  function updateFighters(dt) {
    const all = [...state.units, ...state.enemies];
    for (const actor of all) {
      actor.age += dt;
      actor.attackTimer -= dt;
      actor.attackAnim = Math.max(0, actor.attackAnim - dt);
      actor.mikuGuardTimer = Math.max(0, (actor.mikuGuardTimer || 0) - dt);
      actor.hitFlash = Math.max(0, actor.hitFlash - dt);
      actor.recoil = Math.max(0, actor.recoil - dt * 4.5);
      actor.slow = Math.max(0, actor.slow - dt);
      actor.spawnAnim = Math.min(1, actor.spawnAnim + dt * 4.8);
      actor.moving = false;

      if (actor.dead) {
        actor.death += dt;
        continue;
      }

      if (actor.poisonTimer > 0) {
        actor.poisonTimer = Math.max(0, actor.poisonTimer - dt);
        actor.poisonTick -= dt;
        if (actor.poisonTick <= 0) {
          actor.poisonTick = 1;
          damage(actor, actor.poisonDamage, actor.x, actor.y - actor.size * 0.55, false, true);
          if (actor.dead) continue;
        }
      }

      if (actor.pendingHit) {
        actor.pendingHit.timer -= dt;
        if (actor.pendingHit.timer <= 0) {
          const hit = actor.pendingHit;
          if (hit.baseHit) {
            const siegeDamage = actor.team === "enemy" ? hit.damage * (actor.siege || 1.55) : hit.damage;
            damageBase(actor.team === "ally" ? "enemy" : "ally", siegeDamage);
          } else if (hit.target && !hit.target.dead && Math.abs(hit.target.x - actor.x) < actor.range + 90) {
            damage(hit.target, hit.damage, hit.target.x, hit.target.y - hit.target.size * 0.45);
            if (hit.cleave) {
              const foes = actor.team === "ally" ? state.enemies : state.units;
              let cleaved = 0;
              for (const foe of foes) {
                if (foe === hit.target || foe.dead) continue;
                if (Math.abs(foe.x - hit.target.x) <= hit.cleave && Math.abs(foe.y - hit.target.y) <= 46) {
                  damage(foe, hit.damage * 0.52, foe.x, foe.y - foe.size * 0.42);
                  cleaved += 1;
                  if (cleaved >= 2) break;
                }
              }
              if (cleaved) shockwave(hit.target.x, hit.target.y - 18, actor.dir);
            }
          }
          actor.pendingHit = null;
        }
      }

      if (actor.heal && actor.attackTimer <= 0) {
        const friends = actor.team === "ally" ? state.units : state.enemies;
        let patient = null;
        let missing = 0;
        for (const friend of friends) {
          if (friend.dead || Math.abs(friend.x - actor.x) > actor.range) continue;
          const lost = friend.maxHp - friend.hp;
          if (lost > missing) {
            patient = friend;
            missing = lost;
          }
        }
        if (patient && missing > patient.maxHp * 0.08) {
          const amount = Math.min(missing, actor.heal);
          patient.hp += amount;
          actor.attackTimer = attackDelay(actor);
          actor.attackAnim = actor.attackDuration;
          floating(patient.x, patient.y - patient.size, `+${Math.round(amount)}`, "#91efbd", 15);
          spawnRing(patient.x, patient.y - patient.size * 0.45, actor.team === "ally" ? "#8fe9d0" : "#c987de");
          continue;
        }
      }

      const { target, distance } = findTarget(actor);
      const atBase = baseDistance(actor) <= actor.range;
      const meleeAssist = actor.projectile ? 0 : 24;
      const inRange = target && distance <= actor.range + meleeAssist;

      if ((inRange || atBase) && actor.attackTimer <= 0) {
        attack(actor, target, atBase && !inRange);
      } else if (!inRange && !atBase && actor.attackAnim <= 0.08) {
        let speedScale = 1;
        if (actor.slow > 0) speedScale *= 0.58;
        if (actor.team === "ally" && state.commandBuff > 0) speedScale *= 1.32;
        speedScale *= allyDrumBuff(actor).speed;
        const friends = actor.team === "ally" ? state.units : state.enemies;
        for (const friend of friends) {
          if (friend === actor || friend.dead || friend.lane !== actor.lane) continue;
          const ahead = (friend.x - actor.x) * actor.dir;
          const minGap = Math.max(12, (friend.size + actor.size) * 0.2);
          if (ahead > 0 && ahead < minGap) {
            speedScale = Math.min(speedScale, clamp(ahead / minGap, 0.2, 1));
          }
        }
        actor.x += actor.dir * actor.speed * speedScale * dt;
        actor.charge += actor.speed * speedScale * dt;
        actor.moving = true;
        actor.dustTimer -= dt;
        if (actor.dustTimer <= 0) {
          dustPuff(actor.x - actor.dir * actor.size * 0.25, actor.y + 1);
          actor.dustTimer = rand(0.16, 0.28);
        }
      }
    }

    state.units = state.units.filter((u) => !u.dead || u.death < 0.7);
    state.enemies = state.enemies.filter((u) => !u.dead || u.death < 0.7);
  }

  function updateProjectiles(dt) {
    for (const p of state.projectiles) {
      p.age += dt;
      if (!p.baseTeam && (!p.target || p.target.dead)) {
        p.dead = true;
        continue;
      }
      const tx = p.baseTeam ? p.targetX : p.target.x;
      const ty = p.baseTeam ? p.targetY : p.target.y - p.target.size * 0.45;
      const dx = tx - p.x;
      const dy = ty - p.y;
      const d = Math.hypot(dx, dy) || 1;
      const step = p.speed * dt;
      if (step >= d) {
        if (p.baseTeam) {
          damageBase(p.baseTeam, p.damage * (p.team === "enemy" ? (p.siege || 1.45) : 1));
          burst(tx, ty, p.color, p.splash ? 18 : 7, p.splash ? 150 : 80);
          p.dead = true;
          continue;
        }
        if (p.splash) {
          const foes = p.team === "ally" ? state.enemies : state.units;
          for (const foe of foes) {
            if (!foe.dead && Math.abs(foe.x - p.target.x) < p.splash) {
              damage(foe, p.damage, foe.x, foe.y - foe.size * 0.5);
              if (p.slow) foe.slow = Math.max(foe.slow, p.slow);
              if (p.poison) {
                foe.poisonTimer = Math.max(foe.poisonTimer, p.poison);
                foe.poisonDamage = Math.max(foe.poisonDamage, p.poisonDamage);
                foe.poisonTick = Math.min(foe.poisonTick || 0.35, 0.35);
              }
            }
          }
          burst(tx, ty, p.color, 26, 190);
          state.shake = Math.max(state.shake, 0.22);
        } else {
          damage(p.target, p.damage, tx, ty);
          if (p.slow) p.target.slow = Math.max(p.target.slow, p.slow);
          if (p.knockback && !p.target.dead) {
            p.target.x += (p.team === "ally" ? 1 : -1) * p.knockback;
            floating(p.target.x, p.target.y - p.target.size, "밀려남!", "#d9f6a5", 14);
          }
          if (p.poison && !p.target.dead) {
            p.target.poisonTimer = Math.max(p.target.poisonTimer, p.poison);
            p.target.poisonDamage = Math.max(p.target.poisonDamage, p.poisonDamage);
            p.target.poisonTick = Math.min(p.target.poisonTick || 0.35, 0.35);
          }
          if (p.chain) {
            const originX = p.target ? p.target.x : tx;
            const foes = p.team === "ally" ? state.enemies : state.units;
            const nearby = foes
              .filter((foe) => foe !== p.target && !foe.dead && Math.abs(foe.x - originX) <= p.chainRange)
              .sort((a, b) => Math.abs(a.x - originX) - Math.abs(b.x - originX))
              .slice(0, Math.max(0, p.chain - 1));
            nearby.forEach((foe, index) => {
              damage(foe, p.damage * (0.88 - index * 0.12), foe.x, foe.y - foe.size * 0.52);
              burst(foe.x, foe.y - foe.size * 0.5, p.color, 10, 105);
            });
            if (nearby.length) floating(originX, (p.target ? p.target.y - p.target.size : ty) - 18, `연쇄 ${nearby.length + 1}`, "#75ddff", 15);
          }
          burst(tx, ty, p.color, 7, 80);
        }
        p.dead = true;
      } else {
        p.x += dx / d * step;
        p.y += dy / d * step;
      }
    }
    state.projectiles = state.projectiles.filter((p) => !p.dead);
  }

  function damage(target, amount, x, y, heavy = false, dot = false) {
    if (!target || target.dead) return;
    if (target.mikuGuardTimer > 0) amount *= 0.46;
    if (target.team === "ally") {
      const guarded = state.units.some((unit) => !unit.dead && unit.guard && Math.abs(unit.x - target.x) < 135);
      if (guarded) amount *= 0.72;
    }
    amount = Math.round(amount);
    target.hp -= amount;
    target.hitFlash = dot ? 0.04 : 0.12;
    target.recoil = dot ? target.recoil : (heavy ? 0.32 : 0.16);
    if (!dot) target.x += (target.team === "ally" ? -1 : 1) * (heavy ? 22 : 1.5);
    floating(x, y - 16, Math.round(amount), dot ? "#c58cff" : (heavy ? "#5ee7ff" : "#fff5b5"), dot ? 12 : (heavy ? 22 : 14));
    if (dot) {
      burst(x, y, "#9860c7", 3, 38);
    } else if (!heavy) {
      burst(x, y, target.team === "ally" ? "#ffe8d2" : "#b4ec8b", 6, 75);
      impactEffect(x, y, target.team === "ally" ? -1 : 1);
      sound("hit");
    } else {
      shockwave(x, y, target.team === "ally" ? -1 : 1);
      state.shake = Math.max(state.shake, 0.28);
    }
    if (target.hp <= 0) {
      target.dead = true;
      target.death = 0;
      target.pendingHit = null;
      burst(target.x, target.y - target.size * 0.5, "#ffffff", 18, 160);
      if (target.team === "enemy") {
        state.combo = state.comboTimer > 0 ? state.combo + 1 : 1;
        state.comboTimer = 3.6;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        state.kills += 1;
        const bonus = 1 + Math.min(10, state.combo - 1) * 0.06;
        const reward = Math.round(target.reward * bonus);
        state.money = Math.min(state.maxMoney, state.money + reward);
        state.command = Math.min(state.commandMax, state.command + 7 + Math.min(8, state.combo));
        floating(target.x, target.y - target.size, `+${reward}G`, "#ffe253", 17);
        if (state.combo >= 3) floating(target.x, target.y - target.size - 25, `${state.combo} COMBO`, "#ff9ee5", 16);
        if (isMikuMode() && state.mikuBossUids.includes(target.uid)) {
          const remaining = state.mikuBossUids.some((uid) => {
            const fighter = state.enemies.find((enemy) => enemy.uid === uid);
            return fighter && !fighter.dead && fighter.uid !== target.uid;
          });
          burst(target.x, target.y - target.size * 0.55, "#55f4e6", 42, 230);
          state.flash = Math.max(state.flash, 0.32);
          if (!remaining) {
            state.mikuFinaleDefeated = true;
            showMessage("FINAL ENCORE CLEAR · 미쿠 팀 격파!", 3);
            state.flash = Math.max(state.flash, 0.58);
          }
        }
      }
    }
  }

  function releaseMikuFinale() {
    if (!isMikuMode() || state.mikuTowerBroken) return;
    state.mikuTowerBroken = true;
    state.enemyHp = 0;
    state.spawnQueue = [];
    state.waveQueues = [];
    state.waveWaiting = false;
    state.castleHint = false;
    burst(ENEMY_BASE_X, GROUND - 100, "#ff4faf", 46, 235);
    burst(ENEMY_BASE_X, GROUND - 135, "#48eadc", 38, 210);
    state.shake = 1.35;
    state.flash = 0.34;
    const finale = currentStage().mikuFinale || ["miku_song"];
    state.mikuBossUids = [];
    finale.forEach((kind, index) => {
      spawnEnemy(kind);
      const boss = state.enemies[state.enemies.length - 1];
      if (!boss || boss.id !== kind) return;
      boss.x = BATTLE_END - Math.round((20 + index * 58) * VIEW_SCALE);
      boss.y = GROUND + ((index % 3) - 1) * Math.round(11 * VIEW_SCALE);
      boss.lane = (index % 3) - 1;
      state.mikuBossUids.push(boss.uid);
    });
    showMessage(`성채 파괴! FINAL ENCORE · 공격별 미쿠 ${state.mikuBossUids.length}명 등장!`, 3.2);
  }

  function damageBase(team, amount) {
    if (team === "ally") {
      state.playerHp = Math.max(0, state.playerHp - amount);
      burst(PLAYER_BASE_X + 20, GROUND - 95, "#ffbd73", 12, 145);
    } else {
      if (isMikuMode() && state.mikuTowerBroken) return;
      state.enemyHp = Math.max(0, state.enemyHp - amount);
      burst(ENEMY_BASE_X - 20, GROUND - 95, "#b5dbff", 12, 145);
      if (isMikuMode() && state.enemyHp <= 0) releaseMikuFinale();
    }
    state.shake = Math.max(state.shake, 0.18);
    sound("hit");
  }

  function burst(x, y, color, count = 10, power = 100) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const speed = rand(power * 0.25, power);
      state.particles.push({
        kind: Math.random() < 0.25 ? "star" : "dot",
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - power * 0.18,
        color,
        size: rand(3, 8),
        life: rand(0.3, 0.75),
        maxLife: 0.75,
        spin: rand(-8, 8),
        angle: rand(0, 6.28),
      });
    }
  }

  function spawnRing(x, y, color) {
    state.particles.push({
      kind: "ring", x, y, vx: 0, vy: 0, color,
      size: 42, life: 0.42, maxLife: 0.42, spin: 0, angle: 0,
    });
  }

  function slashEffect(actor) {
    if (actor.projectile) return;
    state.particles.push({
      kind: "slash",
      x: actor.x + actor.dir * actor.size * 0.7,
      y: actor.y - actor.size * 0.48,
      vx: actor.dir * 26,
      vy: 0,
      dir: actor.dir,
      color: actor.team === "ally" ? "#d9f4ff" : "#ffb0b7",
      size: actor.size * 0.9,
      life: 0.2,
      maxLife: 0.2,
      spin: 0,
      angle: 0,
    });
  }

  function shockwave(x, y, dir) {
    state.particles.push({
      kind: "shock", x, y, vx: dir * 35, vy: 0, dir,
      color: "#ffe6a1", size: 55, life: 0.28, maxLife: 0.28, spin: 0, angle: 0,
    });
  }

  function impactEffect(x, y, dir) {
    state.particles.push({
      kind: "impact", x, y, vx: dir * 12, vy: 0, dir,
      color: "#fff4bb", size: 22, life: 0.16, maxLife: 0.16, spin: 0, angle: 0,
    });
  }

  function dustPuff(x, y) {
    for (let i = 0; i < 3; i++) {
      state.particles.push({
        kind: "dust",
        x: x + rand(-5, 5), y: y + rand(-3, 2),
        vx: rand(-18, 18), vy: rand(-28, -10),
        color: Math.random() < 0.5 ? "#71816a" : "#9b9872",
        size: rand(3, 7), life: rand(0.24, 0.42), maxLife: 0.42,
        spin: 0, angle: 0,
      });
    }
  }

  function beamParticles() {
    for (let i = 0; i < 80; i++) {
      state.particles.push({
        kind: "beam",
        x: rand(PLAYER_BASE_X + 50, BATTLE_END),
        y: rand(GROUND - 155, GROUND - 5),
        vx: rand(400, 900),
        vy: rand(-20, 20),
        color: Math.random() < 0.5 ? "#64ddff" : "#ffffff",
        size: rand(8, 26),
        life: rand(0.18, 0.45),
        maxLife: 0.45,
        spin: 0,
        angle: 0,
      });
    }
  }

  function floating(x, y, text, color = "#fff", size = 15) {
    state.texts.push({ x, y, text: String(text), color, size, life: 0.85, maxLife: 0.85 });
  }

  function updateEffects(dt) {
    for (const p of state.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === "dot" || p.kind === "star" || p.kind === "dust") p.vy += 180 * dt;
      p.angle += p.spin * dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);
    for (const t of state.texts) {
      t.life -= dt;
      t.y -= 38 * dt;
    }
    state.texts = state.texts.filter((t) => t.life > 0);
    state.shake = Math.max(0, state.shake - dt * 2.5);
    state.flash = Math.max(0, state.flash - dt);
    state.messageTimer -= dt;
    if (state.messageTimer <= 0) ui.message.classList.add("hidden");
  }

  function showMessage(text, time = 1.5) {
    ui.message.textContent = text;
    ui.message.classList.remove("hidden");
    state.messageTimer = time;
  }

  function checkEnd() {
    if (isMikuMode()) {
      if (state.mikuFinaleDefeated && state.mode === "playing") endGame(true);
    } else if (state.enemyHp <= 0 && state.mode === "playing") {
      endGame(true);
    }
    if (state.playerHp <= 0 && state.mode === "playing") endGame(false);
  }

  function endGame(win) {
    state.mode = win ? "win" : "lose";
    state.paused = false;
    const stage = currentStage();
    const stages = activeStages();
    const hasNext = state.stageIndex < stages.length - 1;
    if (win && hasNext) {
      if (isMikuMode()) {
        state.unlockedMiku = Math.max(state.unlockedMiku, state.stageIndex + 1);
        saveMikuUnlock(state.unlockedMiku);
      } else if (isRiftMode()) {
        state.unlockedRift = Math.max(state.unlockedRift, state.stageIndex + 1);
        saveRiftUnlock(state.unlockedRift);
      } else {
        state.unlocked = Math.max(state.unlocked, state.stageIndex + 1);
        saveUnlock(state.unlocked);
      }
    }
    let chestsGained = 0;
    const chestLabel = isMikuMode() ? "네온 보급 상자" : (isRiftMode() ? "신월 보급 상자" : "달빛 보급 상자");
    if (win) {
      chestsGained = 1;
      const claimed = isRiftMode() ? state.profile.riftClaimedStages : state.profile.claimedStages;
      if (!claimed.includes(stage.id)) {
        claimed.push(stage.id);
        chestsGained += 1;
      }
      if (stage.boss) chestsGained += 1;
      if (isRiftMode()) state.profile.riftChests += chestsGained;
      else state.profile.chests += chestsGained;
    }
    let progressionReward = "";
    if (win) {
      const clearGold = 70 + state.stageIndex * 12;
      const clearMaterials = chestsGained >= 2 ? 2 : 1;
      state.profile.gold += clearGold;
      state.profile.materials += clearMaterials;
      let recruitText = "";
      if (stage.rewardUnit) {
        const recruit = UNIT_TYPES.find((unit) => unit.id === stage.rewardUnit);
        if (recruit && !ownsUnit(recruit.id)) {
          const owned = recruit.rift ? state.profile.riftUnits : state.profile.units;
          owned.push(recruit.id);
          state.profile.levels[recruit.id] = 1;
          const deck = activeDeckIds();
          if (deck.length < MAX_DECK_SIZE) deck.push(recruit.id);
          recruitText = `<br /><b>특별 대원 ${recruit.name} 영입!</b>`;
        } else if (recruit) {
          state.profile.gold += 300;
          state.profile.materials += 12;
          recruitText = `<br />${recruit.name} 중복 보상 · <b>300G + 강화석 12개</b>`;
        }
      }
      progressionReward = `<br />보급 골드 <b>${clearGold}G</b> · 강화석 <b>${clearMaterials}개</b>${recruitText}`;
      saveProfile();
      buildCards();
      renderDeckBuilder();
    }
    const finaleLabel = isMikuMode() ? "FINAL LIVE 완전 돌파!" : (isRiftMode() ? "신월 전선 완전 돌파!" : "전선 완전 돌파!");
    ui.overlayTitle.textContent = win
      ? (hasNext ? `${stage.id} 클리어!` : finaleLabel)
      : "성채 함락";
    ui.overlayDesc.innerHTML = win
      ? (hasNext
        ? `<b>${stage.name}</b>을 지켜냈습니다.<br />${state.kills}명 처치 · 최고 ${state.bestCombo} 콤보${progressionReward}${chestsGained ? `<br /><b>${chestLabel} ${chestsGained}개 획득!</b>` : ""}`
        : `${isMikuMode() ? "미쿠 라이브" : (isRiftMode() ? "신월 전선" : "8장")} 끝까지 전선을 지켜냈습니다.<br /><b>${Math.floor(state.battleTime)}초</b> · 최고 ${state.bestCombo} 콤보${progressionReward}${chestsGained ? `<br /><b>${chestLabel} ${chestsGained}개 획득!</b>` : ""}`)
      : `${stage.id} ${stage.name}<br />적의 공세를 막지 못했습니다.`;
    ui.overlayBtn.textContent = win
      ? (hasNext ? "다음 스테이지" : "스테이지 선택")
      : "다시 도전";
    ui.overlayBtn.dataset.action = win
      ? (hasNext ? "next" : "menu")
      : "retry";
    ui.overlayMenuBtn.classList.toggle("hidden", !win && false);
    ui.overlay.classList.remove("hidden");
    sound(win ? "win" : "lose");
  }

  function reset() {
    const stage = currentStage();
    Object.assign(state, {
      mode: "playing",
      paused: false,
      time: 0,
      battleTime: 0,
      money: stage.money,
      maxMoney: 1200,
      worker: 1,
      playerHp: stage.playerHp,
      playerMaxHp: stage.playerHp,
      enemyHp: stage.enemyHp,
      enemyMaxHp: stage.enemyHp,
      units: [],
      enemies: [],
      projectiles: [],
      particles: [],
      texts: [],
      cooldowns: Object.fromEntries(UNIT_TYPES.map((u) => [u.id, 0])),
      cannon: 0,
      command: 0,
      commandBuff: 0,
      spawnTimer: 0,
      spawnIndex: 0,
      spawnQueue: [],
      waveQueues: [],
      waveIndex: 0,
      waveTotal: 0,
      waveBreak: INITIAL_PREP_TIME,
      waveWaiting: true,
      totalEnemies: Infinity,
      spawnedCount: 0,
      kills: 0,
      combo: 0,
      comboTimer: 0,
      bestCombo: 0,
      dangerLevel: 0,
      bossSpawned: false,
      shake: 0,
      flash: 0,
      messageTimer: 0,
      nextId: 1,
      castleHint: false,
      mikuTowerBroken: false,
      mikuBossUids: [],
      mikuFinaleDefeated: false,
    });
    ui.overlay.classList.add("hidden");
    ui.pauseLayer.classList.add("hidden");
    ui.pauseBtn.textContent = "Ⅱ";
    updateUI();
    setTimeout(() => showMessage(`${stage.id}  ${stage.name} · 준비 ${INITIAL_PREP_TIME}초`, 2.2), 80);
  }

  function update(dt) {
    state.time += dt;
    if (state.mode !== "playing" || state.paused) {
      updateEffects(dt);
      return;
    }
    state.battleTime += dt;
    const dangerInterval = state.stageIndex < 10 ? 60 : (state.stageIndex < 20 ? 46 : 36);
    const nextDanger = Math.min(3, Math.floor(state.battleTime / dangerInterval));
    if (nextDanger > state.dangerLevel) {
      state.dangerLevel = nextDanger;
      showMessage(`⚠ 적 공세 강화 ${"▲".repeat(state.dangerLevel)}`, 2);
      state.shake = Math.max(state.shake, 0.45);
    }
    state.comboTimer = Math.max(0, state.comboTimer - dt);
    if (state.comboTimer <= 0) state.combo = 0;
    state.commandBuff = Math.max(0, state.commandBuff - dt);
    state.money = Math.min(state.maxMoney, state.money + incomeRate() * dt);
    state.cannon = Math.min(state.cannonMax, state.cannon + dt);
    for (const key of Object.keys(state.cooldowns)) {
      state.cooldowns[key] = Math.max(0, state.cooldowns[key] - dt);
    }
    updateSpawning(dt);
    updateFighters(dt);
    updateProjectiles(dt);
    updateEffects(dt);
    if (Number.isFinite(state.totalEnemies) && !state.spawnQueue.length && !state.waveQueues.length && !state.waveWaiting && !state.enemies.some((e) => !e.dead) && state.enemyHp > 0 && !state.castleHint) {
      state.castleHint = true;
      showMessage("남은 적은 없습니다. 성채를 부수세요!", 2.2);
    }
    checkEnd();
    updateUI();
  }

  function updateUI() {
    const mikuBosses = isMikuMode() && state.mikuBossUids.length
      ? state.mikuBossUids
        .map((uid) => state.enemies.find((enemy) => enemy.uid === uid))
        .filter(Boolean)
      : [];
    const displayEnemyHp = mikuBosses.length
      ? mikuBosses.reduce((sum, enemy) => sum + Math.max(0, enemy.hp), 0)
      : state.enemyHp;
    const displayEnemyMaxHp = mikuBosses.length
      ? mikuBosses.reduce((sum, enemy) => sum + enemy.maxHp, 0)
      : state.enemyMaxHp;
    ui.playerHp.textContent = `${Math.ceil(state.playerHp)} / ${state.playerMaxHp}`;
    ui.enemyHp.textContent = `${Math.ceil(displayEnemyHp)} / ${displayEnemyMaxHp}`;
    ui.playerHpBar.style.width = `${state.playerHp / state.playerMaxHp * 100}%`;
    ui.enemyHpBar.style.width = `${displayEnemyMaxHp ? displayEnemyHp / displayEnemyMaxHp * 100 : 0}%`;
    if (ui.enemyBaseName) {
      ui.enemyBaseName.textContent = isMikuMode()
        ? (state.mikuTowerBroken ? `공격별 미쿠 팀 ×${state.mikuBossUids.length}` : "미쿠 라이브 성채")
        : "가시왕 성채";
    }
    ui.money.textContent = Math.floor(state.money);
    ui.moneyMax.textContent = state.maxMoney;
    ui.income.textContent = `${incomeRate().toFixed(0)} G/s`;
    const stage = currentStage();
    ui.stageLabel.textContent = stage.id;
    ui.stageName.textContent = stage.name;
    ui.stageProgress.textContent = `처치 ${state.kills}`;
    ui.waveLabel.textContent = state.waveWaiting
      ? `${state.waveIndex === 0 ? "준비" : "대기"} ${Math.max(0, Math.ceil(state.waveBreak))}초`
      : `WAVE ${state.waveIndex} · 무한`;
    ui.workerLevel.textContent = `Lv.${state.worker}`;
    ui.workerCost.textContent = state.worker >= 8 ? "MAX" : `${workerCost()} G`;
    ui.workerBtn.disabled = state.worker >= 8 || state.money < workerCost() || state.mode !== "playing";
    const cannonPct = clamp(state.cannon / state.cannonMax * 100, 0, 100);
    ui.cannonGauge.style.setProperty("--charge", `${cannonPct}%`);
    ui.cannonState.textContent = cannonPct >= 100 ? "발사 가능!" : `${Math.floor(cannonPct)}%`;
    ui.cannonBtn.classList.toggle("ready", cannonPct >= 100);
    const commandPct = clamp(state.command / state.commandMax * 100, 0, 100);
    ui.commandGauge.style.setProperty("--charge", `${commandPct}%`);
    ui.commandState.textContent = state.commandBuff > 0
      ? `${state.commandBuff.toFixed(1)}초`
      : (commandPct >= 100 ? "발동 가능!" : `${Math.floor(commandPct)}%`);
    ui.commandBtn.classList.toggle("ready", commandPct >= 100);
    ui.commandBtn.disabled = commandPct < 100 || state.mode !== "playing";
    ui.comboBadge.classList.toggle("hidden", state.combo < 2 || state.comboTimer <= 0);
    ui.comboCount.textContent = state.combo;
    for (const btn of ui.unitList.children) {
      const type = UNIT_TYPES.find((unit) => unit.id === btn.dataset.unitId);
      if (!type) continue;
      const cd = state.cooldowns[type.id];
      btn.disabled = state.money < type.cost || cd > 0 || state.mode !== "playing";
      const price = btn.querySelector(".price");
      if (price) price.textContent = `${type.cost} G`;
      const mask = btn.querySelector(".cooldown-mask");
      mask.style.height = `${clamp(cd / summonRecharge(type) * 100, 0, 100)}%`;
      btn.title = `${type.name}: ${type.info}`;
    }
  }

  function buildCards() {
    ui.unitList.innerHTML = "";
    const visibleUnits = availableUnits();
    ui.unitList.style.setProperty("--unit-count", visibleUnits.length);
    visibleUnits.forEach((type, hotkeyIndex) => {
      const unitIndex = UNIT_TYPES.indexOf(type);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "unit-card";
      btn.dataset.unitId = type.id;
      const hotkey = hotkeyIndex < 9 ? String(hotkeyIndex + 1) : (hotkeyIndex === 9 ? "0" : "");
      btn.innerHTML = `
        ${hotkey ? `<span class="hotkey">${hotkey}</span>` : ""}
        <span class="unit-level">Lv.${unitLevel(type.id)}</span>
        <canvas class="portrait" data-unit-id="${type.id}" width="96" height="110" aria-hidden="true"></canvas>
        <span class="unit-name">${type.name}</span>
        <span class="price">${type.cost} G</span>
        <i class="cooldown-mask"></i>`;
      btn.addEventListener("click", () => deploy(unitIndex));
      ui.unitList.appendChild(btn);
    });
    renderCardPortraits();
  }

  function unitSprite(type) {
    const extraSprite = type.rift ? RIFT_ALLY_SPRITES[type.id] : EXTRA_ALLY_SPRITES[type.id];
    if (extraSprite?.sheet) {
      return { sheet: extraSprite.sheet, crop: extraSprite.crop, unique: true };
    }
    if (type.id === "titan") {
      return rockShieldPixels
        ? { sheet: rockShieldPixels, crop: ROCK_SHIELD_CROP, unique: true }
        : null;
    }
    const unlockIndex = UNLOCKABLE_SPRITE_INDEX[type.id];
    if (unlockIndex !== undefined) {
      return unlockablePixels
        ? { sheet: unlockablePixels, crop: UNLOCKABLE_CROPS[unlockIndex], unique: true }
        : null;
    }
    if (!allyPixels) return null;
    return { sheet: allyPixels, crop: ALLY_CROPS[type.sprite ?? 0], unique: false };
  }

  function drawUnitPortrait(card, type) {
    const source = unitSprite(type);
    if (!source) return;
    const cardCtx = card.getContext("2d");
    cardCtx.clearRect(0, 0, card.width, card.height);
    cardCtx.imageSmoothingEnabled = false;
    const [x1, y1, x2, y2] = source.crop;
      const sourceW = x2 - x1;
      const sourceH = y2 - y1;
      const scale = Math.min((card.width - 16) / sourceW, (card.height - 4) / sourceH);
      const drawW = Math.round(sourceW * scale);
      const drawH = Math.round(sourceH * scale);
      const extraSprite = type.rift ? RIFT_ALLY_SPRITES[type.id] : EXTRA_ALLY_SPRITES[type.id];
      if (type.tint && !extraSprite?.sheet) {
        cardCtx.filter = type.tint;
      }
      cardCtx.drawImage(
        source.sheet,
        x1, y1, sourceW, sourceH,
        Math.round((card.width - drawW) / 2), card.height - drawH, drawW, drawH
      );
      cardCtx.filter = "none";
      if (type.overlay && !source.unique) {
        cardCtx.globalCompositeOperation = "source-atop";
        cardCtx.fillStyle = type.overlay;
        cardCtx.fillRect(0, 0, card.width, card.height);
        cardCtx.globalCompositeOperation = "source-over";
      }
  }

  function renderCardPortraits() {
    ui.unitList.querySelectorAll(".portrait").forEach((card) => {
      const type = UNIT_TYPES.find((unit) => unit.id === card.dataset.unitId);
      if (type) drawUnitPortrait(card, type);
    });
  }

  function renderDeckBuilder() {
    if (!ui.deckList || !state.profile) return;
    ui.deckList.innerHTML = "";
    const owned = modeUnits().filter((unit) => ownsUnit(unit.id));
    const deck = activeDeckIds();
    owned.forEach((type) => {
      const selectedIndex = deck.indexOf(type.id);
      const level = unitLevel(type.id);
      const cost = upgradeCost(type.id);
      const card = document.createElement("article");
      card.className = `deck-unit${selectedIndex >= 0 ? " selected" : ""}`;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `${type.name} 덱 ${selectedIndex >= 0 ? "해제" : "선택"}`);
      card.innerHTML = `
        <span class="deck-order">${selectedIndex >= 0 ? "1234567890"[selectedIndex] : "+"}</span>
        <span class="deck-level">Lv.${level}</span>
        <canvas class="deck-portrait" data-unit-id="${type.id}" width="128" height="110" aria-hidden="true"></canvas>
        <strong>${type.name}</strong>
        <small>${type.cost} G · ${type.info}</small>
        <div class="deck-upgrade-row">
          <span>${level >= MAX_UNIT_LEVEL ? "최대 강화" : `능력치 +${Math.round((level - 1) * 18 + (ALLY_POWER - 1) * 100)}%`}</span>
          <button class="unit-upgrade-btn" type="button" ${level >= MAX_UNIT_LEVEL ? "disabled" : ""}>
            ${level >= MAX_UNIT_LEVEL ? "MAX" : `${cost.gold}G · ◆${cost.materials}`}
          </button>
        </div>`;
      card.addEventListener("click", (event) => {
        if (!event.target.closest(".unit-upgrade-btn")) toggleDeckUnit(type.id);
      });
      card.addEventListener("keydown", (event) => {
        if ((event.key === "Enter" || event.key === " ") && !event.target.closest(".unit-upgrade-btn")) {
          event.preventDefault();
          toggleDeckUnit(type.id);
        }
      });
      card.querySelector(".unit-upgrade-btn").addEventListener("click", (event) => {
        event.stopPropagation();
        upgradeUnit(type.id);
      });
      ui.deckList.appendChild(card);
      drawUnitPortrait(card.querySelector("canvas"), type);
    });
    const countText = `${deck.length} / ${MAX_DECK_SIZE}`;
    ui.deckCount.textContent = countText;
    ui.deckSummary.textContent = countText;
    ui.profileGold.textContent = state.profile.gold;
    ui.materialCount.textContent = state.profile.materials;
    if (ui.deckKicker) ui.deckKicker.textContent = isRiftMode() ? "NEW MOON MIXED SQUAD" : (isMikuMode() ? "MIKU LIVE MIXED SQUAD" : "MOONLIGHT MIXED SQUAD");
    if (ui.deckTitle) ui.deckTitle.textContent = isRiftMode() ? "신월 혼합 덱 편성" : (isMikuMode() ? "미쿠 라이브 덱 편성" : "본편 혼합 덱 편성");
    if (ui.deckSubtitle) {
      ui.deckSubtitle.textContent = "본편·신월에서 보유한 모든 대원을 함께 편성할 수 있습니다.";
    }
    if (ui.deckBtnLabel) ui.deckBtnLabel.textContent = isRiftMode() ? "신월 혼합 덱" : "혼합 덱 편성";
  }

  function convertStoneToGold() {
    if (state.profile.materials < 1) {
      ui.deckCount.textContent = "강화석 부족";
      return;
    }
    state.profile.materials -= 1;
    state.profile.gold += STONE_SELL_GOLD;
    saveProfile();
    renderDeckBuilder();
    updateCollectionUI();
    sound("upgrade");
  }

  function convertGoldToStone() {
    if (state.profile.gold < STONE_BUY_GOLD) {
      ui.deckCount.textContent = "보급 G 부족";
      return;
    }
    state.profile.gold -= STONE_BUY_GOLD;
    state.profile.materials += 1;
    saveProfile();
    renderDeckBuilder();
    updateCollectionUI();
    sound("upgrade");
  }
  function upgradeUnit(id) {
    if (!ownsUnit(id)) return;
    const level = unitLevel(id);
    if (level >= MAX_UNIT_LEVEL) return;
    const cost = upgradeCost(id);
    if (state.profile.gold < cost.gold || state.profile.materials < cost.materials) {
      ui.deckCount.textContent = state.profile.gold < cost.gold ? "보급 G 부족" : "강화석 부족";
      return;
    }
    state.profile.gold -= cost.gold;
    state.profile.materials -= cost.materials;
    state.profile.levels[id] = level + 1;
    saveProfile();
    renderDeckBuilder();
    updateCollectionUI();
    sound("upgrade");
  }

  function toggleDeckUnit(id) {
    const deck = activeDeckIds();
    const index = deck.indexOf(id);
    if (index >= 0) {
      if (deck.length <= 1) return;
      deck.splice(index, 1);
    } else {
      if (!ownsUnit(id) || deck.length >= MAX_DECK_SIZE) {
        ui.deckCount.textContent = "10 / 10 MAX";
        return;
      }
      deck.push(id);
    }
    saveProfile();
    buildCards();
    renderDeckBuilder();
  }

  function togglePause() {
    if (state.mode !== "playing") return;
    state.paused = !state.paused;
    ui.pauseLayer.classList.toggle("hidden", !state.paused);
    ui.pauseBtn.textContent = state.paused ? "▶" : "Ⅱ";
  }

  function startGame() {
    ui.howPanel.classList.add("hidden");
    ui.chestPanel.classList.add("hidden");
    ui.deckPanel.classList.add("hidden");
    ui.titleScreen.classList.add("hidden");
    requestAnimationFrame(() => {
      layoutBattle();
      reset();
      sound("deploy");
    });
  }

  function goToMenu() {
    state.mode = "menu";
    state.paused = false;
    ui.overlay.classList.add("hidden");
    ui.pauseLayer.classList.add("hidden");
    ui.titleScreen.classList.remove("hidden");
    renderStageList();
    updateCollectionUI();
    buildCards();
    renderDeckBuilder();
  }

  function updateCollectionUI() {
    const locked = unlockablePool().filter((unit) => !ownsUnit(unit.id));
    const ownedCount = activeOwnedIds().length;
    const totalCount = modeUnits().length;
    ui.chestCount.textContent = activeChestCount();
    ui.collectionCount.textContent = `${ownedCount} / ${totalCount} 보유`;
    ui.deckSummary.textContent = `${activeDeckIds().length} / ${MAX_DECK_SIZE}`;
    ui.profileGold.textContent = state.profile.gold;
    ui.materialCount.textContent = state.profile.materials;
    ui.chestOpenBtn.disabled = activeChestCount() <= 0 || state.chestBusy;
    ui.chestOpenBtn.textContent = state.chestBusy
      ? "여는 중…"
      : (activeChestCount() > 0 ? "상자 열기" : "상자 없음");
    if (ui.chestBtnLabel) ui.chestBtnLabel.textContent = isRiftMode() ? "신월 상자" : "보급 상자";
    if (ui.chestTitle) ui.chestTitle.textContent = isRiftMode() ? "신월 보급 상자" : "달빛 보급 상자";
    if (ui.chestModeNote) {
      ui.chestModeNote.textContent = isRiftMode()
        ? "신월 전선에서만 획득 · 신규 대원만 등장 · 본편 상자는 주지 않음"
        : "본편 전투에서만 획득 · 본편 대원 전용";
    }
    ui.chestPanel?.classList.toggle("is-rift", isRiftMode());
    if (!state.chestBusy) {
      ui.chestDesc.innerHTML = activeChestCount() <= 0
        ? (isRiftMode()
          ? "신월 전선에서 이기면 신월 상자를 얻습니다.<br />본편 달빛 상자는 여기서 나오지 않습니다."
          : "전투에서 이기면 상자를 얻습니다.<br />첫 클리어와 보스전은 상자를 더 줍니다.")
        : `상자 ${activeChestCount()}개 · 미보유 대원 ${locked.length}명<br />캐릭터 중복 시 <b>강화석 8개 + 보급 골드 180G</b>로 자동 전환됩니다.`;
    }
  }

  function resetChestVisual() {
    if (!ui.chestVisual) return;
    ui.chestVisual.classList.remove("is-shake", "is-open", "is-burst", "hidden");
    ui.chestReveal?.classList.add("hidden");
    ui.chestReveal?.classList.remove("is-dupe", "is-mat", "is-gold", "is-book");
  }

  function paintChestFx(color, burst = false) {
    const canvasEl = ui.chestFx;
    if (!canvasEl) return;
    const fx = canvasEl.getContext("2d");
    if (!fx) return;
    const w = canvasEl.width;
    const h = canvasEl.height;
    fx.clearRect(0, 0, w, h);
    if (!burst) return;
    for (let i = 0; i < 36; i++) {
      const ang = (Math.PI * 2 * i) / 36 + Math.random() * 0.2;
      const dist = 28 + Math.random() * 70;
      const x = w * 0.5 + Math.cos(ang) * dist;
      const y = h * 0.48 + Math.sin(ang) * dist * 0.7;
      const size = 2 + Math.random() * 4;
      fx.fillStyle = color;
      fx.globalAlpha = 0.35 + Math.random() * 0.55;
      fx.fillRect(Math.round(x), Math.round(y), size, size);
    }
    fx.globalAlpha = 1;
  }

  function showChestReveal(payload) {
    if (!ui.chestReveal) {
      ui.chestDesc.innerHTML = payload.html;
      return;
    }
    ui.chestVisual?.classList.add("hidden");
    ui.chestReveal.classList.remove("hidden", "is-dupe", "is-mat", "is-gold", "is-book");
    if (payload.tone) ui.chestReveal.classList.add(payload.tone);
    ui.chestRewardTitle.textContent = payload.title;
    ui.chestRewardTag.textContent = payload.tag;
    ui.chestRewardSub.textContent = payload.sub;
    ui.chestDesc.innerHTML = payload.html;
    if (payload.unit && ui.chestRewardPortrait) {
      drawUnitPortrait(ui.chestRewardPortrait, payload.unit);
    } else if (ui.chestRewardPortrait) {
      const c = ui.chestRewardPortrait.getContext("2d");
      c.clearRect(0, 0, ui.chestRewardPortrait.width, ui.chestRewardPortrait.height);
      c.fillStyle = payload.color || "#ffe17b";
      c.fillRect(36, 28, 56, 56);
      c.fillStyle = "#1a1730";
      c.font = "28px monospace";
      c.textAlign = "center";
      c.fillText(payload.icon || "★", 64, 68);
    }
  }

  function openChest() {
    if (state.chestBusy || activeChestCount() <= 0) return;
    state.chestBusy = true;
    setActiveChestCount(activeChestCount() - 1);
    resetChestVisual();
    paintChestFx("#fff", false);
    ui.chestVisual?.classList.add("is-shake");
    ui.chestOpenBtn.disabled = true;
    ui.chestOpenBtn.textContent = "여는 중…";

    const roll = Math.random();
    let payload = {
      title: "보상",
      tag: "획득",
      sub: "",
      html: "",
      color: "#d58cff",
      tone: "",
      icon: "✦",
      unit: null,
    };

    if (roll < 0.55) {
      const pool = unlockablePool();
      const locked = pool.filter((unit) => !ownsUnit(unit.id));
      const pickFrom = locked.length ? locked : pool;
      if (!pickFrom.length) {
        state.profile.materials += 8;
        state.profile.gold += 180;
        payload = {
          title: "강화석 + 골드",
          tag: "대체 보상",
          sub: "열 수 있는 대원이 없어 재료로 전환",
          html: "<b>대체 보상</b><br />강화석 8개와 보급 골드 180G",
          color: "#8fe9d2",
          tone: "is-mat",
          icon: "◆",
          unit: null,
        };
      } else {
        const unit = pickFrom[Math.floor(Math.random() * pickFrom.length)];
        payload.color = unit.shot || "#d58cff";
        payload.unit = unit;
        if (ownsUnit(unit.id)) {
          state.profile.duplicates[unit.id] = (Number(state.profile.duplicates[unit.id]) || 0) + 1;
          state.profile.materials += 8;
          state.profile.gold += 180;
          payload.title = unit.name;
          payload.tag = "중복 전환";
          payload.sub = "강화석 8개 + 보급 골드 180G";
          payload.tone = "is-dupe";
          payload.html = `<b>${unit.name} 중복!</b><br />강화석 8개와 보급 골드 180G로 전환했습니다.`;
        } else {
          if (isRiftMode()) {
            state.profile.riftUnits.push(unit.id);
            if (state.profile.riftDeck.length < MAX_DECK_SIZE) state.profile.riftDeck.push(unit.id);
          } else {
            state.profile.units.push(unit.id);
            if (state.profile.deck.length < MAX_DECK_SIZE) state.profile.deck.push(unit.id);
          }
          state.profile.levels[unit.id] = 1;
          payload.title = unit.name;
          payload.tag = "신규 영입";
          payload.sub = unit.info;
          payload.html = `<b>${unit.name}</b> 신규 영입!<br />${unit.info}`;
        }
      }
    } else if (roll < 0.80) {
      const amount = 5 + Math.floor(Math.random() * 6);
      state.profile.materials += amount;
      payload = {
        title: `강화석 ${amount}개`,
        tag: "재료",
        sub: "덱 편성에서 대원을 강화할 수 있습니다",
        html: `<b>강화석 ${amount}개</b> 획득!<br />덱 편성 화면에서 대원을 강화할 수 있습니다.`,
        color: "#8fe9d2",
        tone: "is-mat",
        icon: "◆",
        unit: null,
      };
    } else if (roll < 0.95) {
      const amount = 180 + Math.floor(Math.random() * 181);
      state.profile.gold += amount;
      payload = {
        title: `보급 골드 ${amount}G`,
        tag: "골드",
        sub: "대원 강화 비용으로 사용",
        html: `<b>보급 골드 ${amount}G</b> 획득!<br />대원 강화 비용으로 사용할 수 있습니다.`,
        color: "#f3c45d",
        tone: "is-gold",
        icon: "G",
        unit: null,
      };
    } else {
      const candidates = activeOwnedIds().filter((id) => unitLevel(id) < MAX_UNIT_LEVEL);
      if (candidates.length) {
        const id = candidates[Math.floor(Math.random() * candidates.length)];
        const unit = UNIT_TYPES.find((entry) => entry.id === id);
        state.profile.levels[id] = unitLevel(id) + 1;
        payload = {
          title: unit.name,
          tag: "특급 훈련서",
          sub: `비용 없이 Lv.${state.profile.levels[id]}`,
          html: `<b>특급 훈련서!</b><br />${unit.name}이 비용 없이 Lv.${state.profile.levels[id]}로 강화됐습니다.`,
          color: "#fff099",
          tone: "is-book",
          icon: "★",
          unit,
        };
      } else {
        state.profile.materials += 10;
        payload = {
          title: "강화석 10개",
          tag: "훈련서 중복",
          sub: "모든 대원이 최대 레벨",
          html: "<b>특급 훈련서 중복!</b><br />모든 대원이 최대 레벨이라 강화석 10개로 전환했습니다.",
          color: "#fff099",
          tone: "is-book",
          icon: "★",
          unit: null,
        };
      }
    }

    window.setTimeout(() => {
      ui.chestVisual?.classList.remove("is-shake");
      ui.chestVisual?.classList.add("is-open", "is-burst");
      paintChestFx(payload.color, true);
      sound("upgrade");
    }, 420);

    window.setTimeout(() => {
      showChestReveal(payload);
      sound("win");
      saveProfile();
      buildCards();
      renderDeckBuilder();
      state.chestBusy = false;
      updateCollectionUI();
      window.setTimeout(() => paintChestFx(payload.color, false), 700);
    }, 900);
  }

  function setBattleMode(mode) {
    const next = mode === "rift" ? "rift" : (mode === "miku" ? "miku" : "campaign");
    if (state.battleMode === next) return;
    state.battleMode = next;
    state.stageIndex = activeUnlocked();
    ui.modeCampaignBtn?.classList.toggle("active", !isRiftMode() && !isMikuMode());
    ui.modeRiftBtn?.classList.toggle("active", isRiftMode());
    ui.modeMikuBtn?.classList.toggle("active", isMikuMode());
    ui.modeCampaignBtn?.setAttribute("aria-selected", String(!isRiftMode() && !isMikuMode()));
    ui.modeRiftBtn?.setAttribute("aria-selected", String(isRiftMode()));
    ui.modeMikuBtn?.setAttribute("aria-selected", String(isMikuMode()));
    if (ui.stageBoardLabel) {
      ui.stageBoardLabel.textContent = isMikuMode()
        ? "스테이지 선택 · 미쿠 라이브"
        : (isRiftMode() ? "스테이지 선택 · 신월 전선" : "스테이지 선택 · 본편");
    }
    resetChestVisual();
    ui.chestPanel?.classList.add("hidden");
    ui.deckPanel?.classList.add("hidden");
    renderStageList();
    updateCollectionUI();
    buildCards();
    renderDeckBuilder();
  }

  function handleOverlayAction() {
    const action = ui.overlayBtn.dataset.action || "retry";
    if (action === "next") {
      state.stageIndex += 1;
      startGame();
    } else if (action === "menu") {
      goToMenu();
    } else {
      reset();
    }
  }

  function renderStageList() {
    ui.stageList.innerHTML = "";
    let lastChapter = "";
    const stages = activeStages();
    const chapters = activeChapters();
    const unlocked = activeUnlocked();
    stages.forEach((stage, index) => {
      const chapter = stage.id.split("-")[0];
      if (chapter !== lastChapter) {
        const label = document.createElement("div");
        label.className = "stage-chapter";
        label.textContent = chapters[chapter] || `${chapter}장`;
        ui.stageList.appendChild(label);
        lastChapter = chapter;
      }
      const locked = index > unlocked;
      const rewardUnit = stage.rewardUnit
        ? UNIT_TYPES.find((unit) => unit.id === stage.rewardUnit)
        : null;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "stage-pick";
      if (index === state.stageIndex) btn.classList.add("selected");
      if (index < unlocked) btn.classList.add("cleared");
      btn.disabled = locked;
      btn.innerHTML = `
        <span class="code">${stage.id}</span>
        <span><strong>${locked ? "잠김" : stage.name}</strong><small>${locked ? "이전 스테이지 클리어 필요" : `${stage.stars}${rewardUnit ? ` · 보상: ${rewardUnit.name}` : ""}`}</small></span>
        <span class="mark">${index === state.stageIndex ? "▶" : (index < unlocked ? "OK" : "LOCK")}</span>`;
      btn.addEventListener("click", () => {
        if (locked) return;
        state.stageIndex = index;
        renderStageList();
      });
      ui.stageList.appendChild(btn);
    });
  }

  ui.modeCampaignBtn?.addEventListener("click", () => setBattleMode("campaign"));
  ui.modeRiftBtn?.addEventListener("click", () => setBattleMode("rift"));
  ui.modeMikuBtn?.addEventListener("click", () => setBattleMode("miku"));
  ui.gameStartBtn.addEventListener("click", startGame);
  ui.howBtn.addEventListener("click", () => {
    ui.chestPanel.classList.add("hidden");
    ui.deckPanel.classList.add("hidden");
    ui.howPanel.classList.remove("hidden");
  });
  ui.howCloseBtn.addEventListener("click", () => ui.howPanel.classList.add("hidden"));
  ui.deckBtn.addEventListener("click", () => {
    ui.howPanel.classList.add("hidden");
    ui.chestPanel.classList.add("hidden");
    renderDeckBuilder();
    ui.deckPanel.classList.remove("hidden");
  });
  ui.deckCloseBtn.addEventListener("click", () => ui.deckPanel.classList.add("hidden"));
  ui.deckDoneBtn.addEventListener("click", () => ui.deckPanel.classList.add("hidden"));
  ui.convertStoneBtn.addEventListener("click", convertStoneToGold);
  ui.convertGoldBtn.addEventListener("click", convertGoldToStone);
  ui.chestBtn.addEventListener("click", () => {
    ui.howPanel.classList.add("hidden");
    ui.deckPanel.classList.add("hidden");
    resetChestVisual();
    paintChestFx("#fff", false);
    ui.chestPanel.classList.remove("hidden");
    updateCollectionUI();
  });
  ui.chestCloseBtn.addEventListener("click", () => ui.chestPanel.classList.add("hidden"));
  ui.chestOpenBtn.addEventListener("click", openChest);
  ui.overlayBtn.addEventListener("click", handleOverlayAction);
  ui.overlayMenuBtn.addEventListener("click", goToMenu);
  ui.workerBtn.addEventListener("click", upgradeWorker);
  ui.cannonBtn.addEventListener("click", fireCannon);
  ui.commandBtn.addEventListener("click", fireCommand);
  ui.homeBtn.addEventListener("click", goToMenu);
  ui.pauseBtn.addEventListener("click", togglePause);
  ui.soundBtn.addEventListener("click", () => {
    state.sound = !state.sound;
    ui.soundBtn.textContent = state.sound ? "SFX" : "OFF";
  });

  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    if (state.mode === "menu") {
      if (e.key === "Enter") startGame();
      if (e.key === "Escape") {
        ui.howPanel.classList.add("hidden");
        ui.chestPanel.classList.add("hidden");
        ui.deckPanel.classList.add("hidden");
      }
      return;
    }
    const slot = "1234567890".indexOf(e.key);
    if (slot >= 0) {
      const type = availableUnits()[slot];
      if (type) deploy(UNIT_TYPES.indexOf(type));
    }
    if (e.key.toLowerCase() === "w") upgradeWorker();
    if (e.key.toLowerCase() === "q") fireCommand();
    if (e.key.toLowerCase() === "h") {
      goToMenu();
      return;
    }
    if (e.code === "Space") {
      e.preventDefault();
      fireCannon();
    }
    if (e.key.toLowerCase() === "p" || e.key === "Escape") togglePause();
  });

  function roundedRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, rr);
  }

  function ellipse(x, y, rx, ry, color, stroke = "#272638", line = 4) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = line;
      ctx.stroke();
    }
  }

  function circle(x, y, r, color, stroke = "#272638", line = 4) {
    ellipse(x, y, r, r, color, stroke, line);
  }

  function line(x1, y1, x2, y2, color = "#272638", width = 5) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  const STAGE_PALETTES = [
    ["rgba(35, 58, 92, .08)", "firefly"], ["rgba(30, 72, 78, .15)", "mist"],
    ["rgba(47, 77, 48, .2)", "toxic"], ["rgba(42, 48, 92, .18)", "rain"],
    ["rgba(103, 52, 36, .2)", "ember"], ["rgba(78, 94, 123, .17)", "snow"],
    ["rgba(42, 34, 66, .24)", "storm"], ["rgba(74, 25, 45, .28)", "eclipse"],
  ];
  const STAGE_VARIANTS = [
    { filter: "brightness(.84) saturate(.9)", veil: "rgba(8, 18, 38, .12)" },
    { filter: "brightness(.93) saturate(1.02)", veil: "rgba(87, 126, 158, .035)" },
    { filter: "brightness(1.01) saturate(1.08)", veil: "rgba(116, 96, 152, .035)" },
    { filter: "brightness(.9) contrast(1.08) saturate(1.12)", veil: "rgba(22, 38, 64, .08)" },
    { filter: "brightness(.78) contrast(1.16) saturate(1.2)", veil: "rgba(80, 20, 35, .1)" },
  ];

  function stageChapterPart(stage = currentStage()) {
    const raw = String(stage?.id || "1-1");
    const cleaned = raw.startsWith("R") || raw.startsWith("M") ? raw.slice(1) : raw;
    const [chapterText, partText] = cleaned.split("-");
    return {
      chapter: clamp(Number(chapterText) || 1, 1, 8),
      part: clamp(Number(partText) || 1, 1, 5),
    };
  }

  function drawStageAtmosphere() {
    const { chapter, part } = stageChapterPart();
    const [tint, weather] = STAGE_PALETTES[chapter - 1];
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";

    if (weather === "mist" || weather === "toxic") {
      ctx.fillStyle = weather === "toxic" ? `rgba(145, 198, 76, ${0.045 + part * 0.012})` : `rgba(170, 202, 209, ${0.04 + part * 0.01})`;
      for (let i = 0; i < 7; i++) {
        const x = ((i * 250 + state.time * (8 + part)) % (W + 320)) - 160;
        const y = GROUND - 80 - (i % 3) * 48;
        ctx.fillRect(Math.round(x), y, 230 + part * 16, 8 + (i % 2) * 5);
      }
    } else if (weather === "rain" || weather === "storm") {
      ctx.strokeStyle = weather === "storm" ? "rgba(197, 178, 255, .26)" : "rgba(163, 207, 237, .2)";
      ctx.lineWidth = 2;
      const drops = 32 + part * 9;
      for (let i = 0; i < drops; i++) {
        const x = (i * 83 + state.time * (180 + part * 18)) % (W + 80) - 40;
        const y = (i * 47 + state.time * 260) % Math.max(1, GROUND - 70);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 9 - part, y + 22 + part * 2);
        ctx.stroke();
      }
      if (weather === "storm" && Math.floor(state.time * 0.42 + part) % 11 === 0) {
        ctx.fillStyle = "rgba(185, 183, 255, .055)";
        ctx.fillRect(0, 0, W, GROUND);
      }
    } else if (weather === "snow") {
      ctx.fillStyle = "rgba(225, 241, 255, .55)";
      for (let i = 0; i < 26 + part * 5; i++) {
        const x = (i * 101 + state.time * (15 + i % 5)) % W;
        const y = (i * 59 + state.time * (28 + i % 7)) % Math.max(1, GROUND - 60);
        const size = 2 + (i + part) % 4;
        ctx.fillRect(Math.round(x), Math.round(y), size, size);
      }
    } else if (weather === "ember" || weather === "eclipse") {
      ctx.fillStyle = weather === "eclipse" ? "rgba(255, 77, 98, .6)" : "rgba(255, 151, 68, .66)";
      for (let i = 0; i < 18 + part * 5; i++) {
        const x = (i * 137 + state.time * (10 + i % 4)) % W;
        const y = GROUND - ((i * 73 + state.time * (35 + i % 6)) % Math.max(1, GROUND - 100));
        ctx.fillRect(Math.round(x), Math.round(y), 3 + i % 3, 3 + i % 3);
      }
    } else {
      ctx.fillStyle = `rgba(245, 222, 109, ${0.18 + part * 0.025})`;
      for (let i = 0; i < 8 + part * 2; i++) {
        const x = (i * 173 + state.time * (4 + i % 3)) % W;
        const y = GROUND - 120 - (i * 41 % 210);
        ctx.fillRect(Math.round(x), Math.round(y), 3, 3);
      }
    }
    ctx.restore();
  }

  function drawBackground() {
    ctx.fillStyle = "#0b1220";
    ctx.fillRect(0, 0, W, H);
    const { chapter, part } = stageChapterPart();
    const scene = stageBackgrounds[chapter - 1] || bg;
    const variant = STAGE_VARIANTS[part - 1];
    if (scene.complete && scene.naturalWidth) {
      const zoom = 1 + (part - 1) * 0.012;
      const scale = Math.max(W / scene.naturalWidth, H / scene.naturalHeight) * zoom;
      const dw = scene.naturalWidth * scale;
      const dh = scene.naturalHeight * scale;
      const shiftX = (part - 3) * W * 0.009;
      ctx.imageSmoothingEnabled = false;
      ctx.save();
      ctx.filter = variant.filter;
      ctx.drawImage(scene, Math.round((W - dw) / 2 + shiftX), Math.round(H - dh), Math.round(dw), Math.round(dh));
      ctx.restore();
      ctx.fillStyle = variant.veil;
      ctx.fillRect(0, 0, W, H);
    }
    drawStageAtmosphere();
  }

  function drawBase(team) {
    const ally = team === "ally";
    const x = ally ? PLAYER_BASE_X : ENEMY_BASE_X;
    const hp = ally ? state.playerHp : state.enemyHp;
    const bob = hp <= 0 ? 6 : Math.sin(state.time * 1.8 + (ally ? 0 : 2)) * 1.4;
    ctx.save();
    ctx.translate(x, GROUND + bob);
    if (!ally) ctx.scale(-1, 1);

    ctx.globalAlpha = hp <= 0 ? 0.65 : 1;
    ctx.fillStyle = "rgba(20,30,20,.24)";
    ctx.beginPath();
    ctx.ellipse(0, 15, 78, 17, 0, 0, 6.28);
    ctx.fill();

    // Rock foundation
    roundedRect(-65, -38, 125, 49, 12);
    ctx.fillStyle = ally ? "#a9b7c4" : "#6b6573";
    ctx.fill();
    ctx.strokeStyle = "#292738";
    ctx.lineWidth = 5;
    ctx.stroke();
    line(-40, -13, -25, -34, "#7a8997", 3);
    line(20, -12, 35, -35, "#7a8997", 3);

    // Main tower
    roundedRect(-48, -135, 92, 102, 15);
    ctx.fillStyle = ally ? "#f6e8c0" : "#63566d";
    ctx.fill();
    ctx.strokeStyle = "#292738";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Roof / horns
    ctx.beginPath();
    if (ally) {
      ctx.moveTo(-58, -130);
      ctx.quadraticCurveTo(0, -196, 56, -130);
      ctx.lineTo(45, -111);
      ctx.lineTo(-48, -111);
    } else {
      ctx.moveTo(-54, -128);
      ctx.lineTo(-42, -182);
      ctx.lineTo(-14, -151);
      ctx.lineTo(12, -192);
      ctx.lineTo(31, -150);
      ctx.lineTo(58, -172);
      ctx.lineTo(48, -111);
      ctx.lineTo(-47, -111);
    }
    ctx.closePath();
    ctx.fillStyle = ally ? "#f2b54b" : "#b9475e";
    ctx.fill();
    ctx.strokeStyle = "#292738";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Face / door
    circle(-16, -88, 8, ally ? "#323443" : "#f0da63", null);
    circle(17, -88, 8, ally ? "#323443" : "#f0da63", null);
    if (ally) {
      ctx.beginPath();
      ctx.arc(0, -78, 24, 0.2, Math.PI - 0.2);
      ctx.strokeStyle = "#323443";
      ctx.lineWidth = 5;
      ctx.stroke();
      circle(-34, -70, 7, "#ef9c8f", null);
      circle(34, -70, 7, "#ef9c8f", null);
    } else {
      line(-22, -102, -8, -94, "#292738", 4);
      line(22, -102, 8, -94, "#292738", 4);
      ctx.beginPath();
      ctx.moveTo(-18, -68);
      ctx.lineTo(-8, -56);
      ctx.lineTo(0, -68);
      ctx.lineTo(9, -56);
      ctx.lineTo(19, -70);
      ctx.strokeStyle = "#292738";
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    // Cannon
    ctx.save();
    ctx.translate(ally ? 28 : 25, -122);
    ctx.rotate(ally ? -0.05 : 0.02);
    roundedRect(0, -9, 54, 18, 8);
    ctx.fillStyle = ally ? "#5e7182" : "#3c3445";
    ctx.fill();
    ctx.strokeStyle = "#292738";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();

    // Flag
    line(-36, -148, -36, -211, "#383747", 5);
    ctx.beginPath();
    ctx.moveTo(-34, -207);
    ctx.quadraticCurveTo(10, -197, 31, -208);
    ctx.lineTo(27, -170);
    ctx.quadraticCurveTo(0, -162, -34, -177);
    ctx.closePath();
    ctx.fillStyle = ally ? "#63cdeb" : "#d85463";
    ctx.fill();
    ctx.strokeStyle = "#292738";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(ally ? "✦" : "♛", -2, -180);

    ctx.restore();
  }

  function drawHealth(actor) {
    if (actor.hp >= actor.maxHp || actor.dead) return;
    const w = actor.size * 1.05;
    const y = -actor.size - 17;
    roundedRect(-w / 2, y, w, 8, 4);
    ctx.fillStyle = "#343441";
    ctx.fill();
    roundedRect(-w / 2 + 1, y + 1, Math.max(0, (w - 2) * actor.hp / actor.maxHp), 6, 3);
    ctx.fillStyle = actor.team === "ally" ? "#52d67c" : "#f06064";
    ctx.fill();
  }

  function drawFighter(actor) {
    const walk = Math.sin(actor.age * actor.speed * 0.13 + actor.seed);
    const attack = actor.attackAnim > 0 ? Math.sin(actor.attackAnim / 0.34 * Math.PI) : 0;
    const deathT = clamp(actor.death / 0.7, 0, 1);
    const squash = actor.dead ? 1 - deathT * 0.75 : 1 + Math.abs(walk) * 0.025;
    const leap = actor.dead ? 0 : Math.abs(walk) * 3 + attack * 4;
    const lunge = attack * 10 * actor.dir;

    ctx.save();
    ctx.translate(actor.x + lunge, actor.y - leap);
    if (actor.dir < 0) ctx.scale(-1, 1);
    ctx.scale(1 + (1 - squash) * 0.35, squash);
    ctx.globalAlpha = actor.dead ? 1 - deathT : 1;
    if (actor.hitFlash > 0) {
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 22;
    }

    ctx.fillStyle = "rgba(20,30,25,.22)";
    ctx.beginPath();
    ctx.ellipse(-lunge, 8 + leap, actor.size * 0.52, actor.size * 0.15, 0, 0, 6.28);
    ctx.fill();

    if (actor.team === "ally") drawAlly(actor, walk, attack);
    else drawEnemy(actor, walk, attack);
    drawHealth(actor);
    ctx.restore();
  }

  function drawAlly(a, walk, attack) {
    const s = a.size;
    if (a.kind === "moco") {
      // Tail and ears
      ctx.beginPath();
      ctx.moveTo(-s * .42, -s * .52);
      ctx.quadraticCurveTo(-s * .65, -s * .76, -s * .55, -s * .95);
      ctx.quadraticCurveTo(-s * .35, -s * .84, -s * .24, -s * .64);
      ctx.fillStyle = "#f6a95d";
      ctx.fill();
      ctx.strokeStyle = "#292738"; ctx.lineWidth = 4; ctx.stroke();
      circle(0, -s * .48, s * .42, "#fff6dc", "#292738", 5);
      ctx.beginPath();
      ctx.moveTo(-s * .27, -s * .75); ctx.lineTo(-s * .1, -s * 1.02); ctx.lineTo(s * .02, -s * .72);
      ctx.moveTo(s * .12, -s * .72); ctx.lineTo(s * .32, -s * .98); ctx.lineTo(s * .36, -s * .64);
      ctx.fillStyle = "#fff6dc"; ctx.fill(); ctx.stroke();
      circle(-s * .13, -s * .5, 3.5, "#292738", null);
      circle(s * .15, -s * .5, 3.5, "#292738", null);
      ctx.beginPath(); ctx.moveTo(2, -s * .41); ctx.lineTo(7, -s * .36); ctx.lineTo(-3, -s * .36); ctx.closePath();
      ctx.fillStyle = "#ec7f75"; ctx.fill();
      line(-s * .2, -s * .14, -s * .24 + walk * 3, 2, "#292738", 5);
      line(s * .16, -s * .14, s * .2 - walk * 3, 2, "#292738", 5);
    } else if (a.kind === "shield") {
      circle(-5, -s * .48, s * .39, "#d8eff1", "#292738", 5);
      ctx.beginPath();
      ctx.moveTo(-s * .28, -s * .73); ctx.lineTo(-s * .1, -s * .98); ctx.lineTo(0, -s * .72);
      ctx.moveTo(s * .06, -s * .72); ctx.lineTo(s * .24, -s * .96); ctx.lineTo(s * .3, -s * .63);
      ctx.fillStyle = "#d8eff1"; ctx.fill(); ctx.stroke();
      circle(-s * .13, -s * .5, 3.5, "#292738", null);
      circle(s * .1, -s * .5, 3.5, "#292738", null);
      ctx.save();
      ctx.translate(s * .28 + attack * 8, -s * .35);
      ctx.beginPath(); ctx.moveTo(0, -s * .42); ctx.lineTo(s * .38, -s * .28); ctx.lineTo(s * .33, s * .25);
      ctx.quadraticCurveTo(0, s * .52, -s * .18, s * .16); ctx.lineTo(-s * .18, -s * .27); ctx.closePath();
      ctx.fillStyle = "#68b9d5"; ctx.fill(); ctx.strokeStyle = "#292738"; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = "#fff6c4"; ctx.font = `bold ${s * .42}px sans-serif`; ctx.textAlign = "center"; ctx.fillText("✦", s * .08, s * .04);
      ctx.restore();
    } else if (a.kind === "archer") {
      circle(-8, -s * .48, s * .38, "#fff0c9", "#292738", 5);
      ctx.beginPath();
      ctx.moveTo(-s * .3, -s * .72); ctx.lineTo(-s * .14, -s * 1.02); ctx.lineTo(0, -s * .7);
      ctx.moveTo(s * .04, -s * .7); ctx.lineTo(s * .22, -s * .96); ctx.lineTo(s * .29, -s * .61);
      ctx.fillStyle = "#fff0c9"; ctx.fill(); ctx.stroke();
      circle(-s * .16, -s * .5, 3.3, "#292738", null);
      circle(s * .08, -s * .5, 3.3, "#292738", null);
      ctx.beginPath(); ctx.arc(s * .17, -s * .38, s * .43, -1.2, 1.15);
      ctx.strokeStyle = "#8d5d3c"; ctx.lineWidth = 5; ctx.stroke();
      line(s * .32, -s * .78, s * .32, -s * .04, "#efe6cc", 2);
      line(s * .02, -s * .4, s * .52 + attack * 10, -s * .4, "#292738", 3);
      ctx.beginPath(); ctx.moveTo(s * .56 + attack * 10, -s * .4); ctx.lineTo(s * .43 + attack * 10, -s * .48); ctx.lineTo(s * .43 + attack * 10, -s * .32); ctx.closePath();
      ctx.fillStyle = "#65b95d"; ctx.fill();
    } else if (a.kind === "ram") {
      ellipse(0, -s * .42, s * .48, s * .4, "#ddd5c0", "#292738", 6);
      // Curled horns
      circle(-s * .28, -s * .68, s * .24, "#d79545", "#292738", 5);
      circle(s * .28, -s * .68, s * .24, "#d79545", "#292738", 5);
      circle(-s * .28, -s * .68, s * .1, "#fff0c9", "#292738", 4);
      circle(s * .28, -s * .68, s * .1, "#fff0c9", "#292738", 4);
      ellipse(0, -s * .48, s * .26, s * .3, "#fff1cf", "#292738", 4);
      line(-s * .14, -s * .54, -s * .06, -s * .51, "#292738", 5);
      line(s * .14, -s * .54, s * .06, -s * .51, "#292738", 5);
      circle(0, -s * .39, 5, "#8a5b55", null);
      line(-s * .22, -s * .08, -s * .26 + walk * 4, 2, "#292738", 6);
      line(s * .22, -s * .08, s * .27 - walk * 4, 2, "#292738", 6);
    } else {
      // Star mage
      ellipse(0, -s * .4, s * .37, s * .35, "#e9e1ff", "#292738", 5);
      ctx.beginPath();
      ctx.moveTo(-s * .4, -s * .6); ctx.quadraticCurveTo(-s * .15, -s * 1.15, s * .33, -s * .76);
      ctx.lineTo(s * .18, -s * .58); ctx.closePath();
      ctx.fillStyle = "#735db7"; ctx.fill(); ctx.strokeStyle = "#292738"; ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = "#ffe566"; ctx.font = `bold ${s * .3}px sans-serif`; ctx.textAlign = "center"; ctx.fillText("★", -s * .05, -s * .8);
      circle(-s * .13, -s * .43, 3.5, "#292738", null);
      circle(s * .13, -s * .43, 3.5, "#292738", null);
      line(s * .25, -s * .55, s * .55, -s * .9, "#6e4936", 5);
      ctx.save(); ctx.translate(s * .58, -s * .94); ctx.rotate(state.time * 1.2);
      ctx.fillStyle = "#ffd84e"; ctx.font = `bold ${s * .38}px sans-serif`; ctx.fillText("✦", 0, 0); ctx.restore();
    }
  }

  function drawEnemy(a, walk, attack) {
    const s = a.size;
    if (a.kind === "sprout") {
      ellipse(0, -s * .42, s * .46, s * .36, "#83c96c", "#312a38", 5);
      ctx.beginPath(); ctx.moveTo(-3, -s * .76); ctx.quadraticCurveTo(-s * .34, -s * 1.08, -s * .46, -s * .77);
      ctx.quadraticCurveTo(-s * .22, -s * .65, -2, -s * .76);
      ctx.fillStyle = "#4caa51"; ctx.fill(); ctx.strokeStyle = "#312a38"; ctx.lineWidth = 4; ctx.stroke();
      circle(-s * .17, -s * .49, 4, "#312a38", null);
      circle(s * .14, -s * .49, 4, "#312a38", null);
      ellipse(s * .34, -s * .34, s * .18, s * .14, "#b9df85", "#312a38", 4);
      circle(s * .39, -s * .36, 2.5, "#312a38", null);
      line(-s * .22, -s * .1, -s * .26 + walk * 3, 1, "#312a38", 5);
      line(s * .18, -s * .09, s * .22 - walk * 3, 1, "#312a38", 5);
    } else if (a.kind === "fang") {
      ellipse(0, -s * .44, s * .46, s * .38, "#df655b", "#312a38", 6);
      ctx.beginPath();
      ctx.moveTo(-s * .35, -s * .65); ctx.lineTo(-s * .35, -s * 1.02); ctx.lineTo(-s * .05, -s * .72);
      ctx.moveTo(s * .15, -s * .7); ctx.lineTo(s * .38, -s * .98); ctx.lineTo(s * .37, -s * .58);
      ctx.fillStyle = "#b63e4d"; ctx.fill(); ctx.strokeStyle = "#312a38"; ctx.lineWidth = 5; ctx.stroke();
      line(-s * .22, -s * .58, -s * .08, -s * .5, "#312a38", 5);
      line(s * .22, -s * .58, s * .08, -s * .5, "#312a38", 5);
      ctx.beginPath(); ctx.moveTo(-s * .15, -s * .32); ctx.lineTo(-s * .03, -s * .16); ctx.lineTo(s * .08, -s * .33);
      ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = "#312a38"; ctx.lineWidth = 3; ctx.stroke();
      line(-s * .25, -s * .1, -s * .3 + walk * 4, 2, "#312a38", 6);
      line(s * .2, -s * .1, s * .25 - walk * 4, 2, "#312a38", 6);
    } else if (a.kind === "brute") {
      ellipse(0, -s * .42, s * .5, s * .39, "#777a82", "#272733", 7);
      for (const side of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(side * s * .2, -s * .7); ctx.lineTo(side * s * .38, -s * .98); ctx.lineTo(side * s * .43, -s * .61);
        ctx.fillStyle = "#b9b0a2"; ctx.fill(); ctx.strokeStyle = "#272733"; ctx.lineWidth = 5; ctx.stroke();
      }
      roundedRect(-s * .31, -s * .7, s * .62, s * .34, 8);
      ctx.fillStyle = "#4e5260"; ctx.fill(); ctx.strokeStyle = "#272733"; ctx.lineWidth = 5; ctx.stroke();
      line(-s * .2, -s * .55, -s * .07, -s * .49, "#ffdc54", 6);
      line(s * .2, -s * .55, s * .07, -s * .49, "#ffdc54", 6);
      line(-s * .31, -s * .12, -s * .33 + walk * 4, 3, "#272733", 8);
      line(s * .28, -s * .12, s * .31 - walk * 4, 3, "#272733", 8);
    } else {
      // Boss
      ellipse(0, -s * .43, s * .53, s * .43, "#5f536f", "#242332", 8);
      ctx.beginPath();
      for (let i = 0; i < 9; i++) {
        const x = -s * .45 + i * s * .112;
        ctx.lineTo(x, -s * (.73 + (i % 2 ? .28 : .05)));
      }
      ctx.lineTo(s * .48, -s * .55); ctx.lineTo(-s * .48, -s * .55); ctx.closePath();
      ctx.fillStyle = "#c6465e"; ctx.fill(); ctx.strokeStyle = "#242332"; ctx.lineWidth = 7; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s * .37, -s * .63); ctx.lineTo(-s * .48, -s * .97); ctx.lineTo(-s * .17, -s * .72);
      ctx.moveTo(s * .2, -s * .7); ctx.lineTo(s * .48, -s * 1.01); ctx.lineTo(s * .4, -s * .58);
      ctx.fillStyle = "#877892"; ctx.fill(); ctx.stroke();
      line(-s * .24, -s * .55, -s * .07, -s * .46, "#ffd84f", 8);
      line(s * .24, -s * .55, s * .07, -s * .46, "#ffd84f", 8);
      ctx.beginPath(); ctx.arc(0, -s * .27, s * .19, 0.15, Math.PI - .15);
      ctx.strokeStyle = "#242332"; ctx.lineWidth = 7; ctx.stroke();
      line(-s * .32, -s * .08, -s * .36 + walk * 4, 3, "#242332", 10);
      line(s * .3, -s * .08, s * .34 - walk * 4, 3, "#242332", 10);
    }
  }

  const ALLY_SPRITE_INDEX = {
    moco: 0, shield: 1, archer: 2, ram: 3, mage: 4,
    healer: 4, assassin: 0, frost: 2, knight: 1, bomber: 4,
    sniper: 2, berserker: 0, titan: 3, drummer: 1, scout: 0,
  };
  const ENEMY_SPRITE_INDEX = {
    sprout: 0, swarm: 0, fang: 1, wolf: 1, brute: 2, shell: 2,
    boss: 3, king: 3, nightlord: 3, spitter: 0, toxic: 0,
    shaman: 1, priest: 1, jugger: 2, wraith: 1,
  };

  function pixelRect(x, y, w, h, color, outline = null, thickness = 4) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    if (outline) {
      ctx.fillStyle = outline;
      ctx.fillRect(x - thickness, y - thickness, w + thickness * 2, h + thickness * 2);
    }
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function drawPixelBase(team) {
    if (isMikuMode() && drawMikuPixelBase(team)) return;
    const ally = team === "ally";
    const x = ally ? PLAYER_BASE_X : ENEMY_BASE_X;
    const hp = ally ? state.playerHp : state.enemyHp;
    const dir = ally ? 1 : -1;
    const stone = ally ? "#d7cba3" : "#66596f";
    const darkStone = ally ? "#8f8c78" : "#40394d";
    const roof = ally ? "#d9903d" : "#a63e59";
    const accent = ally ? "#4aa7c6" : "#d45865";
    const outline = "#202231";
    const dead = hp <= 0;

    ctx.save();
    ctx.globalAlpha = dead ? 0.55 : 1;
    ctx.translate(Math.round(x), Math.round(GROUND));
    ctx.scale(dir * VIEW_SCALE, VIEW_SCALE);

    pixelRect(-72, 5, 144, 16, "rgba(20,31,25,.25)");
    pixelRect(-64, -28, 128, 32, darkStone, outline, 5);
    pixelRect(-56, -134, 104, 106, stone, outline, 6);

    // Pixel stonework.
    pixelRect(-48, -116, 38, 22, ally ? "#eee1bc" : "#796780");
    pixelRect(-2, -116, 42, 22, ally ? "#c3b891" : "#51465c");
    pixelRect(-48, -86, 30, 22, ally ? "#b7ad8e" : "#51465c");
    pixelRect(-10, -86, 50, 22, ally ? "#e8dbb5" : "#796780");
    pixelRect(-48, -56, 43, 20, ally ? "#e8dbb5" : "#796780");
    pixelRect(3, -56, 37, 20, ally ? "#b7ad8e" : "#51465c");

    // Battlements and roof.
    for (let i = 0; i < 4; i++) {
      pixelRect(-58 + i * 31, -154, 22, 26, roof, outline, 5);
    }
    pixelRect(-59, -136, 116, 18, roof, outline, 5);

    // Door and windows.
    pixelRect(-17, -63, 34, 35, "#2f3141", outline, 4);
    pixelRect(-35, -105, 16, 20, ally ? "#6ad1e4" : "#e7b64d", outline, 4);
    pixelRect(16, -105, 16, 20, ally ? "#6ad1e4" : "#e7b64d", outline, 4);
    pixelRect(-29, -101, 4, 12, "#e7f7e9");
    pixelRect(22, -101, 4, 12, "#fff1a6");

    // Flag and cannon.
    pixelRect(-43, -217, 6, 64, "#282a38");
    pixelRect(-37, -211, 58, 34, accent, outline, 4);
    pixelRect(-29, -201, 20, 14, ally ? "#f7df71" : "#312d3d");
    pixelRect(33, -139, 58, 18, darkStone, outline, 5);
    pixelRect(82, -143, 17, 26, darkStone, outline, 4);

    // Damage pixels.
    if (hp < (ally ? state.playerMaxHp : state.enemyMaxHp) * 0.5) {
      pixelRect(-5, -126, 7, 18, outline);
      pixelRect(1, -115, 15, 7, outline);
      pixelRect(-32, -73, 18, 7, outline);
    }
    ctx.restore();
  }

  function drawMikuPixelBase(team) {
    const image = mikuTowerPixels;
    if (!image || ("complete" in image && (!image.complete || !image.naturalWidth))) return false;
    const ally = team === "ally";
    const hp = ally ? state.playerHp : state.enemyHp;
    const maxHp = ally ? state.playerMaxHp : state.enemyMaxHp;
    const broken = !ally && state.mikuTowerBroken;
    const damaged = broken || hp < maxHp * 0.5;
    const sourceW = Math.floor((image.naturalWidth || image.width) / 2);
    const sourceH = Math.floor((image.naturalHeight || image.height) / 2);
    const sourceX = damaged ? sourceW : 0;
    const sourceY = ally ? 0 : sourceH;
    const drawSize = Math.round(238 * VIEW_SCALE);
    const x = ally ? PLAYER_BASE_X : ENEMY_BASE_X;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = broken ? 0.48 : 1;
    ctx.translate(Math.round(x), Math.round(GROUND + 10 * VIEW_SCALE));
    ctx.drawImage(
      image,
      sourceX, sourceY, sourceW, sourceH,
      Math.round(-drawSize / 2), -drawSize, drawSize, drawSize
    );
    ctx.restore();
    return true;
  }

  function mikuFighterFrame(actor) {
    if (actor.team === "ally") {
      return actor.attackAnim > 0 && MIKU_ALLY_ATTACK_FRAME.sheet
        ? MIKU_ALLY_ATTACK_FRAME
        : EXTRA_ALLY_SPRITES.miku;
    }
    return MIKU_ENEMY_FRAMES[actor.mikuSkill] || MIKU_ENEMY_FRAMES.song;
  }

  function fighterMotion(actor) {
    const kind = actor.kind;
    const id = actor.id;
    const fly = kind === "bat" || kind === "raven" || kind === "frost" || kind === "knockback"
      || id === "gale_hawk" || id === "frost_owl" || id === "bloodwing_bat" || id === "bone_raven";
    const heavy = Boolean(actor.raid)
      || ["titan", "brute", "jugger", "rhino", "shield", "shell", "boss", "king", "nightlord"].includes(kind);
    const hoppy = ["scout", "moco", "assassin", "berserker", "swarm", "wolf", "wraith"].includes(kind);
    const drummer = kind === "drummer";
    const ranger = actor.mikuSkill ? actor.mikuSkill !== "leek" : Boolean(actor.projectile);
    const t = actor.age + actor.seed;
    const speedRatio = Math.max(0.55, Math.min(1.7, (actor.speed || 40) / Math.max(1, 40 * VIEW_SCALE)));
    const frequency = (fly ? 7.4 : hoppy ? 14.2 : heavy ? 5.1 : drummer ? 8.4 : 9.6) * speedRatio;
    const walk = actor.moving && !actor.dead ? Math.sin(t * frequency) : 0;
    const idle = Math.sin(t * (fly ? 3.6 : drummer ? 6.2 : 2.7));
    const attackProgress = actor.attackAnim > 0 ? 1 - actor.attackAnim / actor.attackDuration : 0;
    const attack = actor.attackAnim > 0 ? Math.sin(attackProgress * Math.PI) : 0;
    const hop = actor.dead
      ? 0
      : (fly
        ? 11 + idle * 5.5 + Math.abs(walk) * 3
        : actor.moving
          ? Math.abs(walk) * (hoppy ? 9 : heavy ? 3.5 : drummer ? 6.5 : 5.5)
          : (idle + 1) * (drummer ? 1.4 : 0.75));
    const squashX = (actor.moving
      ? 1 + Math.abs(walk) * (heavy ? 0.045 : 0.03) - (walk > 0.55 ? 0.05 : 0)
      : 1 + idle * 0.012) * (1 + attack * (ranger ? 0.03 : 0.08));
    const squashY = (actor.moving
      ? 1 - Math.abs(walk) * (heavy ? 0.04 : fly ? 0.06 : 0.025) + (walk > 0.55 ? 0.05 : 0)
      : fly ? 1 + Math.sin(t * 8.5) * 0.035 : 1 - idle * 0.01) * (1 + attack * (ranger ? -0.06 : -0.05));
    const tilt = fly
      ? walk * 0.05 + idle * 0.01
      : actor.moving
        ? walk * (heavy ? 0.012 : hoppy ? 0.038 : 0.024)
        : idle * 0.006;
    const lunge = attack * (ranger ? -9 : heavy ? 18 : hoppy ? 16 : 13) * actor.dir;
    return { attackProgress, hop, squashX, squashY, tilt, lunge };
  }

  function drawPixelFighter(actor) {
    const ally = actor.team === "ally";
    const extraAllySprite = ally
      ? (actor.id === "miku" ? mikuFighterFrame(actor) : (actor.rift ? RIFT_ALLY_SPRITES[actor.id] : EXTRA_ALLY_SPRITES[actor.id]))
      : null;
    const extraEnemySprite = ally
      ? null
      : (actor.mikuSkill
        ? mikuFighterFrame(actor)
        : (actor.rift ? RIFT_ENEMY_SPRITES[actor.id] : EXTRA_ENEMY_SPRITES[actor.id]));
    // Extra sprite registered but not loaded yet → fall through to atlas instead of skipping draw.
    const extraReady = (extraAllySprite && extraAllySprite.sheet) || (extraEnemySprite && extraEnemySprite.sheet);
    const extraSheet = extraReady ? (extraAllySprite?.sheet || extraEnemySprite?.sheet) : null;
    const isRockShield = ally && actor.id === "titan";
    const unlockIndex = ally ? UNLOCKABLE_SPRITE_INDEX[actor.id] : undefined;
    const hasUnlockableSprite = ally && unlockIndex !== undefined && !extraSheet;
    const hasUniqueSprite = Boolean(extraSheet) || isRockShield || hasUnlockableSprite;
    const sheet = extraSheet
      || (isRockShield
        ? rockShieldPixels
        : (hasUnlockableSprite ? unlockablePixels : (ally ? allyPixels : enemyPixels)));
    const uniqueAlly = hasUniqueSprite && Boolean(sheet);
    const index = ally
      ? (ALLY_SPRITE_INDEX[actor.kind] ?? actor.sprite ?? 0)
      : (ENEMY_SPRITE_INDEX[actor.kind] ?? actor.sprite ?? 0);
    const crop = (extraReady && extraAllySprite)
      ? extraAllySprite.crop
      : ((extraReady && extraEnemySprite)
        ? extraEnemySprite.crop
        : (isRockShield
          ? ROCK_SHIELD_CROP
          : (hasUnlockableSprite ? UNLOCKABLE_CROPS[unlockIndex] : (ally ? ALLY_CROPS[index] : ENEMY_CROPS[index]))));
    if (!sheet || !crop || ("complete" in sheet && (!sheet.complete || !sheet.naturalWidth))) return;

    const sourceX = crop[0];
    const sourceY = crop[1];
    const sourceW = crop[2] - crop[0];
    const sourceH = crop[3] - crop[1];
    const motion = fighterMotion(actor);
    const deathT = clamp(actor.death / 0.7, 0, 1);
    const drawScale = (extraAllySprite?.fitScale || extraEnemySprite?.fitScale || 1);
    const drawH = Math.round(actor.size * (ally ? 3.45 : 3.35) * drawScale);
    const drawW = Math.round(drawH * sourceW / sourceH);
    const jump = Math.round(motion.hop);
    const lunge = Math.round(motion.lunge);
    const recoilDir = actor.team === "ally" ? -1 : 1;
    const recoilOffset = Math.round(recoilDir * actor.recoil * 38);
    // Quantized spawn scaling keeps square sprite pixels from shimmering.
    const rawSpawnScale = easeOut(actor.spawnAnim);
    const spawnScale = actor.spawnAnim >= 0.999
      ? 1
      : Math.max(0.25, Math.round(rawSpawnScale * 8) / 8);
    const flipSpriteX = Boolean(extraAllySprite?.flipX || extraEnemySprite?.flipX);
    const verticalBounds = extraAllySprite?.verticalBounds || extraEnemySprite?.verticalBounds || [0, 1];
    const groundOffset = Math.round(drawH * Math.max(0, 1 - verticalBounds[1]));
    const visibleTop = Math.round(-drawH + drawH * verticalBounds[0] + groundOffset);

    ctx.save();
    ctx.translate(Math.round(actor.x + lunge + recoilOffset), Math.round(actor.y - jump));
    ctx.scale(spawnScale * motion.squashX, spawnScale * motion.squashY);
    ctx.rotate(motion.tilt);
    if (flipSpriteX) ctx.scale(-1, 1);
    ctx.globalAlpha = actor.dead ? 1 - deathT : 1;
    if (actor.dead) {
      ctx.translate(0, -drawH * 0.3);
      ctx.rotate(deathT * Math.PI * 0.45);
    }

    pixelRect(-drawW * 0.38, 2 + jump, drawW * 0.76, 8, "rgba(21,30,24,.28)");
    if (actor.hitFlash > 0) {
      ctx.filter = "brightness(2.4) saturate(.2)";
    } else if (actor.tint && (!extraSheet || extraAllySprite?.allowTint || extraEnemySprite?.allowTint)) {
      // 솔리드 월울프 등은 tint로 색만 바꾸고, 일반 EXTRA는 원본 색 유지.
      ctx.filter = actor.tint;
    }
    ctx.drawImage(
      sheet,
      sourceX, sourceY, sourceW, sourceH,
      Math.round(-drawW / 2), Math.round(-drawH + groundOffset), drawW, drawH
    );
    ctx.filter = "none";

    if (actor.attackAnim > 0 && actor.projectile) {
      const charge = Math.sin(motion.attackProgress * Math.PI);
      const front = drawW * 0.47;
      pixelRect(front - 4, -drawH * 0.63 - 4, 8, 8, actor.shot || (actor.kind === "mage" ? "#ffe26a" : "#a8ec73"));
      if (charge > 0.45) {
        pixelRect(front - 9, -drawH * 0.63 - 2, 18, 4, "rgba(255,245,181,.8)");
        pixelRect(front - 2, -drawH * 0.63 - 9, 4, 18, "rgba(255,245,181,.8)");
      }
    }

    if (actor.hp < actor.maxHp && !actor.dead) {
      const barW = Math.max(30, drawW);
      pixelRect(-barW / 2, visibleTop - 12, barW, 7, "#242634");
      pixelRect(
        -barW / 2 + 2, visibleTop - 10,
        Math.max(0, (barW - 4) * actor.hp / actor.maxHp), 3,
        ally ? "#50d47b" : "#ef5b62"
      );
    }
    ctx.restore();
  }

  function drawProjectiles() {
    for (const p of state.projectiles) {
      ctx.save();
      ctx.translate(Math.round(p.x), Math.round(p.y));
      if (p.kind === "miku_song") {
        const pulse = Math.floor(p.age * 12) % 2 ? 2 : 0;
        pixelRect(-3, -14 - pulse, 7, 23, "#72fff0", "#173f4d", 2);
        pixelRect(2, -15 - pulse, 13, 5, "#ff63bd", "#173f4d", 2);
        pixelRect(-10, 5, 12, 12, "#48eadc", "#173f4d", 3);
      } else if (p.kind === "miku_cannon") {
        const glow = Math.floor(p.age * 16) % 2 ? "#fff0fc" : "#74fff2";
        pixelRect(-18, -10, 35, 21, "#ff4faf", "#25233c", 4);
        pixelRect(-10, -17, 20, 35, "#48eadc", "#25233c", 3);
        pixelRect(-5, -6, 11, 13, glow);
      } else if (p.kind === "mage") {
        const pulse = Math.floor(p.age * 10) % 2 ? 3 : 0;
        pixelRect(-5, -17 - pulse, 10, 34 + pulse * 2, "#fff4a0", "#a76331", 3);
        pixelRect(-17 - pulse, -5, 34 + pulse * 2, 10, "#ffe04d", "#a76331", 3);
        pixelRect(-9, -9, 18, 18, "#fff8c7");
      } else if (p.kind === "bomber") {
        pixelRect(-12, -12, 24, 24, "#ff8a4a", "#6a2a16", 3);
        pixelRect(-5, -18, 10, 10, "#ffe08a");
      } else if (p.kind === "frost" || p.kind === "sniper") {
        pixelRect(-11, -4, 22, 8, p.color, "#27445c", 3);
        pixelRect(-4, -11, 8, 22, "#e7f6ff", "#27445c", 2);
      } else if (p.kind === "spitter" || p.kind === "toxic") {
        pixelRect(-10, -10, 20, 20, p.color, "#28452d", 3);
        pixelRect(-4, -16, 8, 8, "#d5ff72");
      } else if (p.kind === "shaman" || p.kind === "priest") {
        pixelRect(-12, -4, 24, 8, p.color, "#432750", 3);
        pixelRect(-4, -12, 8, 24, "#f2b5ff", "#432750", 2);
      } else if (p.kind === "healer") {
        pixelRect(-10, -4, 20, 8, "#7ce5c0", "#27584e", 3);
        pixelRect(-4, -10, 8, 20, "#c6ffe9", "#27584e", 2);
      } else {
        pixelRect(-14, -2, 25, 5, "#67422e");
        pixelRect(8, -7, 13, 14, p.color || "#74c94e", "#274b2c", 3);
      }
      ctx.restore();
    }
  }

  function drawEffects() {
    for (const p of state.particles) {
      ctx.save();
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      const progress = 1 - p.life / p.maxLife;
      if (p.kind === "ring") {
        const radius = Math.round(p.size * (0.35 + progress * 0.9));
        const thick = Math.max(2, Math.round(5 * (1 - progress)));
        pixelRect(-radius, -radius, radius * 2, thick, p.color);
        pixelRect(-radius, radius - thick, radius * 2, thick, p.color);
        pixelRect(-radius, -radius, thick, radius * 2, p.color);
        pixelRect(radius - thick, -radius, thick, radius * 2, p.color);
      } else if (p.kind === "slash") {
        const length = p.size * (0.6 + progress * 0.65);
        for (let i = 0; i < 6; i++) {
          const px = p.dir * (i * length / 6);
          const py = -length * 0.45 + i * length * 0.16;
          pixelRect(px - 4, py - 4, 9, 9, i < 2 ? "#ffffff" : p.color);
        }
      } else if (p.kind === "shock") {
        const width = p.size * (0.5 + progress * 1.5);
        pixelRect(-width / 2, -3, width, 7, p.color);
        pixelRect(-width * 0.32, -10, width * 0.64, 5, "#fff8d4");
      } else if (p.kind === "impact") {
        const radius = p.size * (0.5 + progress);
        pixelRect(-radius, -3, radius * 2, 7, p.color);
        pixelRect(-3, -radius, 7, radius * 2, p.color);
        pixelRect(-radius * .55, -radius * .55, 7, 7, "#ffffff");
        pixelRect(radius * .45, radius * .35, 6, 6, "#ffffff");
      } else if (p.kind === "star") {
        pixelRect(-p.size / 3, -p.size, p.size * .66, p.size * 2, p.color);
        pixelRect(-p.size, -p.size / 3, p.size * 2, p.size * .66, p.color);
      } else if (p.kind === "beam") {
        pixelRect(-p.size * 2, -p.size / 2, p.size * 4, p.size, p.color);
      } else {
        pixelRect(-p.size / 2, -p.size / 2, p.size, p.size, p.color);
      }
      ctx.restore();
    }
    for (const t of state.texts) {
      ctx.save();
      ctx.globalAlpha = clamp(t.life / t.maxLife, 0, 1);
      ctx.font = `900 ${t.size}px "Gowun Dodum", sans-serif`;
      ctx.textAlign = "center";
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(35,35,48,.8)";
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }

  function drawAmbience() {
    // Pixel fireflies and drifting ground mist keep the battlefield alive.
    for (let i = 0; i < 15; i++) {
      const baseX = (i * 97 + 41) % W;
      const x = (baseX + state.time * (3 + i % 4)) % W;
      const y = GROUND - 270 + (i * 37 % 175) + Math.sin(state.time * 1.4 + i * 2.1) * 9;
      const glow = 0.25 + (Math.sin(state.time * 3 + i) + 1) * 0.22;
      ctx.fillStyle = `rgba(236, 213, 94, ${glow})`;
      ctx.fillRect(Math.round(x), Math.round(y), i % 3 === 0 ? 4 : 3, i % 3 === 0 ? 4 : 3);
    }

    const mistOffset = (state.time * 9) % 220;
    ctx.fillStyle = "rgba(137, 166, 178, .055)";
    for (let i = -1; i < 7; i++) {
      const x = i * 220 + mistOffset;
      ctx.fillRect(Math.round(x), GROUND - 52 + (i % 2) * 13, 145, 10);
      ctx.fillRect(Math.round(x + 28), GROUND - 42 + (i % 2) * 13, 185, 7);
    }

    const vignette = ctx.createLinearGradient(0, 0, 0, H);
    vignette.addColorStop(0, "rgba(2, 6, 18, .18)");
    vignette.addColorStop(0.55, "rgba(2, 6, 18, 0)");
    vignette.addColorStop(1, "rgba(2, 6, 18, .2)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
  }

  function draw() {
    ctx.setTransform(outputScale, 0, 0, outputScale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    const shakePower = state.shake * 8;
    const sx = Math.round(rand(-shakePower, shakePower));
    const sy = Math.round(rand(-shakePower * .5, shakePower * .5));
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(sx, sy);
    drawBackground();
    drawAmbience();
    drawPixelBase("ally");
    drawPixelBase("enemy");

    const fighters = [...state.units, ...state.enemies].sort((a, b) => {
      const laneSort = a.y - b.y;
      // Spawn order is stable even after two fighters cross, so their visual
      // layer no longer pops back and forth during a crowded clash.
      return laneSort || a.uid - b.uid;
    });
    for (const fighter of fighters) drawPixelFighter(fighter);
    drawProjectiles();
    drawEffects();
    ctx.restore();

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(180,240,255,${state.flash * 1.5})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  let last = performance.now();
  function loop(now) {
    const wrap = canvas.parentElement;
    if (Math.abs(wrap.clientWidth - W) > 1 || Math.abs(wrap.clientHeight - H) > 1) {
      layoutBattle();
    }
    const dt = clamp((now - last) / 1000, 0, 0.04);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function setCloudStatus(stateName, text) {
    if (!ui.cloudSaveStatus) return;
    ui.cloudSaveStatus.dataset.state = stateName;
    ui.cloudSaveStatus.textContent = text;
  }

  async function syncCloudSave() {
    const cloud = window.FurCloudSave;
    if (!cloud?.configured || !cloud.currentUser) return;
    setCloudStatus("saving", "동기화 중…");
    try {
      const remote = await cloud.loadCurrent();
      const localTime = localUpdatedAt();
      if (remote?.profile && remote.updatedAt > localTime) {
        state.profile = normalizeProfile(remote.profile);
        state.unlocked = Math.max(0, Math.min(STAGES.length - 1, Number(remote.unlocked) || 0));
        state.unlockedRift = Math.max(0, Math.min(Math.max(RIFT_STAGES.length - 1, 0), Number(remote.unlockedRift) || 0));
        state.unlockedMiku = Math.max(0, Math.min(Math.max(MIKU_STAGES.length - 1, 0), Number(remote.unlockedMiku) || 0));
        localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
        localStorage.setItem(SAVE_KEY, String(state.unlocked));
        localStorage.setItem(RIFT_SAVE_KEY, String(state.unlockedRift));
        localStorage.setItem(MIKU_SAVE_KEY, String(state.unlockedMiku));
        localStorage.setItem(LOCAL_UPDATED_KEY, String(remote.updatedAt));
        state.stageIndex = Math.min(state.stageIndex, activeUnlocked());
        buildCards();
        renderStageList();
        updateCollectionUI();
        renderDeckBuilder();
        updateUI();
        setCloudStatus("online", "클라우드 불러옴");
        return;
      }

      const updatedAt = localTime || Date.now();
      localStorage.setItem(LOCAL_UPDATED_KEY, String(updatedAt));
      await cloud.saveNow(cloudSnapshot(updatedAt));
      setCloudStatus("saved", "클라우드 저장됨");
    } catch (error) {
      console.warn("Cloud sync failed", error);
      setCloudStatus("error", "로컬 저장 중");
    }
  }

  window.addEventListener("fur-cloud-status", (event) => {
    setCloudStatus(event.detail?.state || "offline", event.detail?.text || "로컬 저장 중");
  });
  window.addEventListener("fur-cloud-ready", syncCloudSave);
  ui.cloudSaveBtn?.addEventListener("click", async () => {
    const cloud = window.FurCloudSave;
    if (!cloud?.configured) {
      setCloudStatus("setup", "설정값 필요");
      return;
    }
    try {
      if (cloud.currentUser) {
        const updatedAt = Date.now();
        localStorage.setItem(LOCAL_UPDATED_KEY, String(updatedAt));
        await cloud.saveNow(cloudSnapshot(updatedAt));
      } else {
        await cloud.signIn();
      }
    } catch (error) {
      console.warn("Cloud login failed", error);
      setCloudStatus("error", "로그인 취소/실패");
    }
  });

  if (allySheet.complete && allySheet.naturalWidth) allyPixels = allySheet;
  if (enemySheet.complete && enemySheet.naturalWidth) enemyPixels = enemySheet;
  if (unlockableSheet.complete && unlockableSheet.naturalWidth) {
    unlockablePixels = unlockableSheet;
  }
  if (rockShieldSheet.complete && rockShieldSheet.naturalWidth) {
    rockShieldPixels = rockShieldSheet;
  }
  layoutBattle();
  window.addEventListener("resize", layoutBattle);
  if (window.ResizeObserver) {
    new ResizeObserver(layoutBattle).observe(canvas.parentElement);
  }
  buildCards();
  renderStageList();
  updateCollectionUI();
  renderDeckBuilder();
  updateUI();
  requestAnimationFrame(loop);
})();
