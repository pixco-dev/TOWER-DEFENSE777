/* 신월 전선 전용 로스터 — 본편 UNIT_TYPES / 본편 상자와 분리 */
window.FurRiftRoster = (() => {
  const ally = (id, name, cost, hp, damage, speed, range, cooldown, size, recharge, kind, info, extras = {}) => ({
    id, name, cost, hp, damage, speed, range, cooldown, size, recharge, kind, info,
    unlockable: true, rift: true, ...extras,
  });

  const enemy = (id, name, hp, damage, speed, range, cooldown, size, reward, kind, extras = {}) => ({
    id, name, hp, damage, speed, range, cooldown, size, reward, kind, rift: true, ...extras,
  });

  const ALLIES = [
    ally("flame_fox", "불꽃여우", 480, 320, 128, 31, 255, 1.9, 62, 10.5, "mage", "불꽃 폭발로 무리를 태운다", { projectile: true, splash: 88, shot: "#ff8a4a" }),
    ally("crystal_raccoon", "수정너굴", 130, 560, 16, 28, 44, 0.95, 64, 5.2, "shield", "수정 방패로 전선을 지킨다", { guard: true }),
    ally("breeze_squirrel", "바람다람", 90, 125, 24, 86, 40, 0.46, 50, 1.9, "scout", "빠른 창으로 빈틈을 찌른다"),
    ally("gold_mole", "황금두더지", 580, 1180, 105, 22, 50, 1.45, 80, 13.5, "titan", "황금 곡괭이로 길을 막는다", { cleave: 92, guard: true }),
    ally("silver_fox", "은빛여우", 300, 270, 118, 74, 42, 0.66, 56, 7.2, "assassin", "쌍검으로 치명타를 노린다", { critChance: 0.32, critPower: 2.1 }),
    ally("bloom_deer", "꽃사슴", 420, 350, 46, 32, 225, 1.6, 62, 9.4, "healer", "꽃빛으로 아군을 회복한다", { projectile: true, heal: 150, shot: "#f4b8d8" }),
    ally("frost_bear", "얼음곰", 620, 1360, 118, 20, 54, 1.5, 86, 15, "titan", "얼음 방패로 최전선을 버틴다", { cleave: 100, guard: true }),
    ally("thunder_lion", "천둥사자", 510, 900, 78, 30, 52, 1.0, 74, 11.2, "knight", "번개 검으로 전방을 벤다", { cleave: 62, guard: true }),
    ally("poison_quill", "독침고슴", 400, 340, 58, 31, 200, 1.65, 62, 9.8, "poisoner", "독침으로 지속 피해를 준다", { projectile: true, splash: 72, poison: 5, poisonDamage: 18, shot: "#b77cff" }),
    ally("ember_otter", "불꽃수달", 430, 300, 110, 34, 200, 1.7, 62, 10.2, "bomber", "불꽃 항아리로 넓은 폭발을 낸다", { projectile: true, splash: 124, shot: "#ff9b52" }),
    ally("shade_raccoon", "그림자너굴", 320, 255, 120, 78, 40, 0.64, 55, 7.0, "assassin", "단검으로 그림자 암살", { critChance: 0.36, critPower: 2.2 }),
    ally("star_owl", "별부엉", 360, 250, 70, 34, 260, 1.35, 60, 8.4, "frost", "별빛으로 적을 늦춘다", { projectile: true, slow: 3.5, shot: "#c9b6ff" }),
    ally("iron_turtle", "철갑거북", 700, 1600, 130, 18, 56, 1.55, 88, 16, "titan", "철갑으로 길목을 봉쇄한다", { cleave: 112, guard: true }),
    ally("spark_mouse", "번개쥐", 80, 100, 18, 92, 34, 0.42, 46, 1.5, "scout", "전격 단검으로 재빠르게 친다"),
    ally("moon_fox", "달빛여우", 430, 360, 48, 33, 230, 1.55, 62, 9.0, "healer", "달빛으로 전열을 회복한다", { projectile: true, heal: 160, shot: "#92efd1" }),
    ally("pike_goat", "창산양", 280, 640, 95, 42, 50, 1.2, 70, 8.2, "ram", "긴 창으로 돌격한다", { cleave: 80 }),
    ally("wave_otter", "물결수달", 390, 350, 112, 37, 250, 1.1, 60, 7.5, "chain", "물결이 근처 적에게 연쇄된다", { projectile: true, chain: 4, chainRange: 185, shot: "#59c9ff" }),
    ally("storm_hawk", "폭풍매", 400, 250, 100, 46, 290, 1.5, 60, 9.0, "knockback", "폭풍 화살로 적을 밀어낸다", { projectile: true, knockback: 50, shot: "#d9f6a5" }),
    ally("crystal_rabbit", "수정토끼", 500, 310, 140, 30, 275, 2.1, 66, 12, "mage", "수정 폭발로 여럿을 공격", { projectile: true, splash: 90, slow: 2.4, shot: "#d58cff" }),
    ally("lava_bear", "용암곰", 340, 380, 88, 55, 44, 0.58, 64, 7.5, "berserker", "용암 망치로 난전을 지배한다", { cleave: 42 }),
    ally("holy_deer", "성광사슴", 450, 370, 50, 32, 235, 1.6, 64, 9.6, "healer", "성광으로 큰 회복을 준다", { projectile: true, heal: 175, shot: "#ffe8a0" }),
    ally("dusk_fox", "황혼여우", 470, 300, 130, 32, 265, 2.0, 62, 11, "mage", "황혼 오브로 범위를 공격", { projectile: true, splash: 96, shot: "#ff9ad4" }),
    ally("gold_eagle", "황금독수리", 560, 200, 230, 28, 350, 2.4, 58, 13.8, "sniper", "금빛 화살로 먼 적을 저격", { projectile: true, critChance: 0.24, critPower: 2.0, shot: "#ffe17b" }),
    ally("leaf_panda", "나뭇잎팬더", 360, 700, 60, 36, 48, 0.92, 68, 7.6, "drummer", "대나무 북으로 아군을 강화한다", { aura: 1.38 }),
  ];

  const ENEMIES = {
    // 멧돼지 계열 — 외형에 맞게 본편 새싹보다 훨씬 단단하게
    spike_boar: enemy("spike_boar", "가시멧돼지", 780, 68, 38, 46, 0.85, 90, 62, "sprout", { cleave: 48 }),
    moss_boar: enemy("moss_boar", "이끼멧돼지", 920, 74, 32, 48, 0.95, 94, 72, "sprout", { cleave: 56 }),
    bone_boar: enemy("bone_boar", "뼈멧돼지", 1280, 108, 34, 50, 0.95, 108, 98, "brute", { cleave: 72 }),
    frost_boar: enemy("frost_boar", "서리멧돼지", 1100, 96, 42, 48, 0.8, 103, 88, "fang", { cleave: 54, slow: 1.4 }),
    iron_boar: enemy("iron_boar", "철갑멧돼지", 2200, 145, 16, 56, 1.35, 128, 155, "jugger", { cleave: 96 }),
    ember_boar: enemy("ember_boar", "용암멧돼지", 1680, 132, 22, 52, 1.1, 118, 130, "jugger", { cleave: 88 }),

    ice_fang: enemy("ice_fang", "얼음송곳니", 520, 72, 70, 42, 0.62, 72, 58, "fang", { tint: "hue-rotate(160deg) saturate(1.15) brightness(1.15)" }),
    spore_rat: enemy("spore_rat", "독버섯쥐", 260, 38, 72, 38, 0.65, 64, 36, "swarm"),
    ember_wolf: enemy("ember_wolf", "불꽃늑대", 560, 78, 68, 42, 0.66, 78, 62, "wolf", { tint: "hue-rotate(-30deg) saturate(1.5) brightness(1.08)" }),
    venom_spider: enemy("venom_spider", "독거미", 420, 52, 48, 175, 1.25, 72, 52, "spitter", { projectile: true, poison: 5, poisonDamage: 18, shot: "#b77cff" }),
    shadow_bat: enemy("shadow_bat", "그림자박쥐", 220, 42, 98, 36, 0.5, 62, 34, "swarm", { raid: true, tint: "brightness(.78) saturate(.85)" }),
    thorn_fox: enemy("thorn_fox", "가시여우", 480, 66, 64, 42, 0.7, 74, 56, "fang", { tint: "hue-rotate(70deg) saturate(1.2) brightness(.95)" }),
    mud_golem: enemy("mud_golem", "진흙골렘", 1450, 110, 20, 52, 1.2, 110, 120, "brute", { cleave: 80 }),
    lava_toad: enemy("lava_toad", "용암두꺼비", 1600, 88, 15, 50, 1.05, 102, 115, "shell"),
    fog_crow: enemy("fog_crow", "안개까마귀", 620, 92, 38, 210, 1.45, 78, 74, "spitter", { projectile: true, shot: "#c9b6ff" }),
    thorn_rhino: enemy("thorn_rhino", "가시코뿔소", 1950, 135, 17, 56, 1.3, 118, 150, "jugger", { cleave: 110 }),
    rotwood: enemy("rotwood", "썩은나무정령", 1250, 98, 22, 54, 1.1, 104, 110, "brute", { cleave: 70 }),
    poison_frog: enemy("poison_frog", "독개구리", 380, 48, 54, 155, 1.1, 70, 46, "spitter", { projectile: true, poison: 6, poisonDamage: 20, shot: "#7dff8a" }),
    blackflame_fox: enemy("blackflame_fox", "흑염여우", 720, 105, 60, 230, 1.5, 78, 90, "wraith", { projectile: true, shot: "#ff5a7a", tint: "hue-rotate(-50deg) saturate(1.45) brightness(.75)" }),
    crystal_giant: enemy("crystal_giant", "수정거인", 3200, 185, 14, 64, 1.45, 142, 230, "boss", { raid: true, cleave: 130 }),
    night_moth: enemy("night_moth", "밤나방", 320, 55, 84, 44, 0.62, 78, 48, "swarm", { raid: true }),
    swamp_croc: enemy("swamp_croc", "늪지악어", 1750, 125, 18, 54, 1.1, 114, 140, "shell", { cleave: 90 }),
    briar_spider: enemy("briar_spider", "가시거미", 560, 70, 40, 195, 1.35, 76, 70, "spitter", { projectile: true, shot: "#9d7cff" }),
    dusk_quill: enemy("dusk_quill", "어둠고슴", 640, 78, 34, 185, 1.3, 78, 76, "spitter", { projectile: true, poison: 5, poisonDamage: 20, shot: "#6b5cff" }),
    shadow_wolf: enemy("shadow_wolf", "그림자늑대", 620, 90, 72, 42, 0.6, 80, 72, "wolf", { tint: "hue-rotate(210deg) saturate(.72) brightness(.92)" }),
    moon_hag: enemy("moon_hag", "달밤할멈", 1100, 78, 22, 250, 1.55, 92, 125, "shaman", { projectile: true, splash: 90, slow: 3.0, shot: "#d58cff", raid: true }),
  };

  const S = (id, name, stars, playerHp, enemyHp, money, count, pace, pool, boss, scale, waves = 3) =>
    ({ id, name, stars, playerHp, enemyHp, money, count, pace, pool, boss, scale, waves, rift: true });

  const STAGES = [
    // 1~4장: 기존 유닛(가시/뼈/철갑)만 — 추가 멧돼지는 후반
    S("R1-1", "신월 초입", "★☆☆", 2800, 1900, 220, 12, 2.2, [["sprout", 0.4], ["swarm", 0.3], ["spore_rat", 0.3]], null, 0.95),
    S("R1-2", "이슬 버섯밭", "★☆☆", 2900, 2200, 210, 13, 2.05, [["sprout", 0.3], ["swarm", 0.2], ["poison_frog", 0.25], ["spike_boar", 0.25]], null, 1.05),
    S("R1-3", "가시 덤불", "★★☆", 3000, 2500, 200, 15, 1.9, [["spike_boar", 0.35], ["sprout", 0.25], ["swarm", 0.2], ["poison_frog", 0.2]], null, 1.15),
    S("R1-4", "그림자 동굴", "★★☆", 3200, 2900, 195, 16, 1.75, [["spike_boar", 0.3], ["spore_rat", 0.25], ["bone_raven", 0.25], ["fang", 0.2]], null, 1.25),
    S("R1-5", "서리 송곳니", "★★★", 3400, 3400, 190, 17, 1.6, [["fang", 0.25], ["spike_boar", 0.3], ["poison_frog", 0.25], ["wolf", 0.2]], "ice_fang", 1.38),

    S("R2-1", "진흙 습지", "★★☆", 3600, 4000, 210, 15, 1.75, [["brute", 0.3], ["mud_golem", 0.25], ["shell", 0.25], ["lava_toad", 0.2]], null, 1.45),
    S("R2-2", "안개 둥지", "★★☆", 3800, 4500, 205, 16, 1.65, [["fog_crow", 0.3], ["bone_raven", 0.3], ["venom_spider", 0.25], ["spore_rat", 0.15]], null, 1.55),
    S("R2-3", "가시 협곡", "★★★", 4000, 5100, 200, 17, 1.55, [["thorn_fox", 0.25], ["briar_spider", 0.3], ["spike_boar", 0.25], ["wolf", 0.2]], null, 1.65),
    S("R2-4", "철갑 언덕", "★★★", 4300, 5800, 220, 18, 1.45, [["iron_boar", 0.3], ["jugger", 0.25], ["thorn_rhino", 0.25], ["brute", 0.2]], null, 1.78),
    S("R2-5", "용암 두꺼비굴", "★★★★", 4600, 6800, 230, 19, 1.35, [["lava_toad", 0.35], ["shell", 0.3], ["ember_wolf", 0.15], ["blackflame_fox", 0.2]], "lava_toad", 1.92),

    S("R3-1", "뼈의 길", "★★★", 4800, 7200, 230, 17, 1.4, [["bone_boar", 0.35], ["bone_raven", 0.25], ["dusk_quill", 0.25], ["spitter", 0.15]], null, 2.0),
    S("R3-2", "밤나방 숲", "★★★", 5000, 7800, 235, 18, 1.3, [["night_moth", 0.35], ["fog_crow", 0.25], ["venom_spider", 0.25], ["bloodwing_bat", 0.15]], null, 2.1),
    S("R3-3", "늪악어 강", "★★★★", 5300, 8600, 245, 19, 1.22, [["swamp_croc", 0.3], ["moss_toad", 0.25], ["rotwood", 0.25], ["shell", 0.2]], null, 2.22),
    S("R3-4", "흑염 초원", "★★★★", 5600, 9400, 255, 20, 1.14, [["blackflame_fox", 0.3], ["wraith", 0.25], ["spitter", 0.25], ["brute", 0.2]], null, 2.35),
    S("R3-5", "달밤 할멈의 제단", "★★★★★", 6000, 10800, 265, 21, 1.05, [["moon_hag", 0.3], ["mooncap_witch", 0.25], ["dusk_quill", 0.25], ["shadow_wolf", 0.2]], "moon_hag", 2.5),

    S("R4-1", "수정 회랑", "★★★★", 6300, 11600, 265, 19, 1.1, [["crystal_giant", 0.2], ["mud_golem", 0.25], ["brute", 0.25], ["briar_spider", 0.3]], null, 2.6),
    S("R4-2", "가시 공성로", "★★★★", 6600, 12600, 275, 20, 1.0, [["thorn_rhino", 0.3], ["siege_rhino", 0.25], ["iron_boar", 0.25], ["bone_boar", 0.2]], null, 2.72),
    S("R4-3", "그림자 군단", "★★★★★", 7000, 13800, 285, 21, 0.92, [["mist_fox", 0.3], ["blackflame_fox", 0.25], ["bone_raven", 0.25], ["shadow_bat", 0.2]], null, 2.85),
    S("R4-4", "신월 성벽", "★★★★★", 7400, 15200, 295, 23, 0.86, [["crystal_giant", 0.25], ["iron_colossus", 0.25], ["swamp_croc", 0.25], ["moon_hag", 0.25]], null, 2.98),
    S("R4-5", "가시 왕자의 그림자", "★★★★★", 7800, 16800, 300, 23, 0.82, [["thorn_king", 0.2], ["crystal_giant", 0.25], ["moon_hag", 0.3], ["thorn_rhino", 0.25]], "thorn_king", 3.1),

    // 5장~ : 추가 멧돼지(이끼/서리/용암) 등장
    S("R5-1", "독침 지하도", "★★★★", 8000, 14500, 290, 21, 0.96, [["burrow_mole", 0.25], ["gloom_mole", 0.2], ["dusk_quill", 0.25], ["venom_spider", 0.3]], null, 2.95),
    S("R5-2", "무쇠 교량", "★★★★", 8300, 15600, 300, 22, 0.9, [["iron_colossus", 0.25], ["iron_boar", 0.25], ["ember_boar", 0.25], ["thorn_rhino", 0.25]], null, 3.05),
    S("R5-3", "안개별 능선", "★★★★★", 8600, 16800, 310, 23, 0.84, [["mist_fox", 0.25], ["frost_boar", 0.25], ["shadow_wolf", 0.25], ["blackflame_fox", 0.25]], null, 3.15),
    S("R5-4", "공성 코뿔소 진영", "★★★★★", 8900, 18000, 320, 24, 0.8, [["siege_rhino", 0.25], ["thorn_rhino", 0.25], ["moss_boar", 0.25], ["rotwood", 0.25]], null, 3.25),
    S("R5-5", "무쇠거신의 관문", "★★★★★", 9300, 19500, 330, 25, 0.76, [["iron_colossus", 0.3], ["crystal_giant", 0.25], ["ember_boar", 0.25], ["moon_hag", 0.2]], "iron_colossus", 3.4, 4),

    S("R6-1", "가시 주술의 숲", "★★★★★", 9600, 20000, 330, 23, 0.78, [["thorn_elder", 0.25], ["moss_boar", 0.2], ["moon_hag", 0.25], ["briar_spider", 0.3]], null, 3.45),
    S("R6-2", "달버섯 정원", "★★★★★", 9900, 21200, 340, 24, 0.74, [["mooncap_witch", 0.3], ["moon_hag", 0.25], ["frost_boar", 0.2], ["dusk_quill", 0.25]], null, 3.55),
    S("R6-3", "가시주교의 행렬", "★★★★★", 10200, 22400, 350, 25, 0.7, [["thorn_bishop", 0.25], ["priest", 0.15], ["thorn_elder", 0.25], ["rotwood", 0.35]], null, 3.65),
    S("R6-4", "흑염과 안개", "★★★★★", 10600, 23600, 360, 26, 0.66, [["blackflame_fox", 0.25], ["mist_fox", 0.25], ["ember_boar", 0.25], ["shadow_wolf", 0.25]], null, 3.75),
    S("R6-5", "달그림자 군주의 밤", "★★★★★", 11000, 25500, 370, 27, 0.62, [["nightlord", 0.22], ["dusk_lord", 0.2], ["moon_hag", 0.3], ["crystal_giant", 0.28]], "nightlord", 3.9, 4),

    S("R7-1", "신월 외성", "★★★★★", 11400, 26500, 370, 25, 0.66, [["thorn_king", 0.2], ["siege_rhino", 0.2], ["iron_boar", 0.25], ["ember_boar", 0.35]], null, 4.0),
    S("R7-2", "왕좌의 복도", "★★★★★", 11800, 28000, 380, 26, 0.62, [["dusk_lord", 0.2], ["crystal_giant", 0.25], ["thorn_bishop", 0.25], ["frost_boar", 0.3]], null, 4.1),
    S("R7-3", "그림자 근위대", "★★★★★", 12200, 29500, 390, 27, 0.58, [["shadow_wolf", 0.25], ["moss_boar", 0.25], ["dusk_quill", 0.25], ["frost_boar", 0.25]], null, 4.2),
    S("R7-4", "신월의 성문", "★★★★★", 12600, 31200, 400, 28, 0.54, [["iron_colossus", 0.25], ["thorn_rhino", 0.25], ["moon_hag", 0.25], ["ember_boar", 0.25]], null, 4.3),
    S("R7-5", "신월의 왕좌", "★★★★★", 13300, 34000, 410, 30, 0.5, [["crystal_giant", 0.3], ["dusk_lord", 0.25], ["nightlord", 0.2], ["ember_boar", 0.25]], "crystal_giant", 4.5, 4),
  ];

  const CHAPTERS = {
    R1: "1장 · 신월 초원",
    R2: "2장 · 안개 습지",
    R3: "3장 · 달밤 숲",
    R4: "4장 · 가시 성벽",
    R5: "5장 · 무쇠 관문",
    R6: "6장 · 달그림자 밤",
    R7: "7장 · 신월 왕좌",
  };

  const ALLY_SHEETS = [
    "assets/_new-allies-1.png",
    "assets/_new-allies-2.png",
    "assets/_new-allies-3.png",
  ];
  const ENEMY_SHEETS = [
    "assets/_new-enemies-1.png",
    "assets/_new-enemies-2.png",
    "assets/_new-enemies-3.png",
  ];

  return { ALLIES, ENEMIES, STAGES, CHAPTERS, ALLY_SHEETS, ENEMY_SHEETS };
})();
