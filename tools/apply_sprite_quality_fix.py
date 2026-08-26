from pathlib import Path
import re

GAME = Path("game.js")
SW = Path("sw.js")

text = GAME.read_text(encoding="utf-8")
original = text

# 1) Candidate/unified sprites: safely remove only border-connected keyed backdrop
#    and auto-crop to the visible alpha silhouette with a small safety margin.
old_bind = '''  let spriteUiReady = false;\n  const bindExtraSprite = (sprite, refreshUi) => {\n    sprite.image.addEventListener("load", () => {\n      // PNGs are pre-keyed. Never strip interiors or dark fur/armor at runtime.\n      sprite.sheet = sprite.image;\n      if (!sprite.crop || sprite.crop[2] <= sprite.crop[0]) {\n        sprite.crop = [0, 0, sprite.image.naturalWidth || 320, sprite.image.naturalHeight || 360];\n      }\n      if (refreshUi && spriteUiReady) {\n        renderCardPortraits();\n        renderDeckBuilder();\n      }\n    });\n    sprite.image.src = sprite.src;\n    if (sprite.image.complete && sprite.image.naturalWidth) {\n      sprite.sheet = sprite.image;\n      if (!sprite.crop || sprite.crop[2] <= sprite.crop[0]) {\n        sprite.crop = [0, 0, sprite.image.naturalWidth, sprite.image.naturalHeight];\n      }\n    }\n  };\n'''
new_bind = '''  let spriteUiReady = false;\n\n  function prepareCandidateSprite(sprite) {\n    const image = sprite.image;\n    if (!image?.naturalWidth || !image?.naturalHeight) return;\n    try {\n      const sheet = stripSpriteBackdrop(image);\n      const probe = document.createElement("canvas");\n      probe.width = sheet.width || image.naturalWidth;\n      probe.height = sheet.height || image.naturalHeight;\n      const probeCtx = probe.getContext("2d", { willReadFrequently: true });\n      probeCtx.drawImage(sheet, 0, 0);\n      const rgba = probeCtx.getImageData(0, 0, probe.width, probe.height).data;\n      let minX = probe.width;\n      let minY = probe.height;\n      let maxX = -1;\n      let maxY = -1;\n      for (let y = 0; y < probe.height; y++) {\n        for (let x = 0; x < probe.width; x++) {\n          const alpha = rgba[(y * probe.width + x) * 4 + 3];\n          if (alpha < 18) continue;\n          if (x < minX) minX = x;\n          if (y < minY) minY = y;\n          if (x > maxX) maxX = x;\n          if (y > maxY) maxY = y;\n        }\n      }\n      if (maxX >= minX && maxY >= minY) {\n        const padX = Math.max(6, Math.round((maxX - minX + 1) * 0.035));\n        const padY = Math.max(6, Math.round((maxY - minY + 1) * 0.035));\n        sprite.crop = [\n          Math.max(0, minX - padX),\n          Math.max(0, minY - padY),\n          Math.min(probe.width, maxX + 1 + padX),\n          Math.min(probe.height, maxY + 1 + padY),\n        ];\n      } else {\n        sprite.crop = [0, 0, image.naturalWidth, image.naturalHeight];\n      }\n      sprite.sheet = sheet;\n      // Auto-crop already describes the visible silhouette, so old per-file\n      // vertical compensation would double-offset the character.\n      sprite.verticalBounds = [0, 1];\n    } catch (error) {\n      sprite.sheet = image;\n      sprite.crop = [0, 0, image.naturalWidth, image.naturalHeight];\n      sprite.verticalBounds = [0, 1];\n    }\n  }\n\n  const bindExtraSprite = (sprite, refreshUi) => {\n    const apply = () => {\n      prepareCandidateSprite(sprite);\n      if (refreshUi && spriteUiReady) {\n        renderCardPortraits();\n        renderDeckBuilder();\n      }\n    };\n    sprite.image.addEventListener("load", apply);\n    sprite.image.src = sprite.src;\n    if (sprite.image.complete && sprite.image.naturalWidth) apply();\n  };\n'''
if old_bind not in text:
    raise SystemExit("bindExtraSprite block not found; refusing unsafe patch")
text = text.replace(old_bind, new_bind, 1)

# Rift sprites use the same preprocessing path instead of displaying the entire
# generated canvas including transparent/checkerboard margins.
old_rift_apply = '''      const apply = () => {\n        entry.sheet = entry.image;\n        entry.crop = [0, 0, entry.image.naturalWidth, entry.image.naturalHeight];\n        if (refreshUi && spriteUiReady) {\n'''
new_rift_apply = '''      const apply = () => {\n        prepareCandidateSprite(entry);\n        if (refreshUi && spriteUiReady) {\n'''
if old_rift_apply not in text:
    raise SystemExit("rift sprite apply block not found")
text = text.replace(old_rift_apply, new_rift_apply, 1)

# Make border cleanup understand the common baked backgrounds seen in the
# generated sprite set (white/magenta/checker-gray/near-black). Flood fill means
# same-colored details inside the character are not deleted.
old_backdrop = '''        const magenta = r >= 180 && b >= 180 && g <= 90 && r - g >= 80 && b - g >= 80;\n        const nearWhite = min >= 232 && max - min < 14;\n        return magenta || nearWhite;\n'''
new_backdrop = '''        const magenta = r >= 170 && b >= 170 && g <= 105 && r - g >= 65 && b - g >= 65;\n        const neutral = max - min < 24;\n        const keyedNeutral = neutral && (min >= 164 || max <= 30);\n        return magenta || keyedNeutral;\n'''
if old_backdrop not in text:
    raise SystemExit("backdrop predicate not found")
text = text.replace(old_backdrop, new_backdrop, 1)

# 2) Restore the richer 2026-08-21 fighter animation model. Keep newer Miku and
#    Rift routing intact; only the sprite transform/motion layer is restored.
if "  function fighterMotion(actor) {" not in text:
    fighter_motion = '''  function fighterMotion(actor) {\n    const kind = actor.kind;\n    const id = actor.id;\n    const fly = kind === "bat" || kind === "raven" || kind === "frost" || kind === "knockback"\n      || id === "gale_hawk" || id === "frost_owl" || id === "bloodwing_bat" || id === "bone_raven";\n    const heavy = Boolean(actor.raid)\n      || ["titan", "brute", "jugger", "rhino", "shield", "shell", "boss", "king", "nightlord"].includes(kind);\n    const hoppy = ["scout", "moco", "assassin", "berserker", "swarm", "wolf", "wraith"].includes(kind);\n    const drummer = kind === "drummer";\n    const ranger = actor.id === "miku_diva" ? actor.mikuSkill !== "leek" : Boolean(actor.projectile);\n    const t = actor.age + actor.seed;\n    const spd = Math.max(16, actor.speed || 40);\n    const freq = fly ? 7.4 : hoppy ? 14.2 : heavy ? 5.1 : drummer ? 8.4 : 9.6;\n    const walk = actor.moving && !actor.dead ? Math.sin(t * freq * (spd / 48)) : 0;\n    const idle = Math.sin(t * (fly ? 3.6 : drummer ? 6.2 : 2.7));\n    const attackProgress = actor.attackAnim > 0 ? 1 - actor.attackAnim / actor.attackDuration : 0;\n    const attack = actor.attackAnim > 0 ? Math.sin(attackProgress * Math.PI) : 0;\n    const hop = actor.dead\n      ? 0\n      : (fly\n        ? 11 + idle * 5.5 + Math.abs(walk) * 3\n        : actor.moving\n          ? Math.abs(walk) * (hoppy ? 9 : heavy ? 3.5 : drummer ? 6.5 : 5.5)\n          : (idle + 1) * (drummer ? 1.4 : 0.75));\n    const squashX = (actor.moving\n      ? 1 + Math.abs(walk) * (heavy ? 0.045 : 0.03) - (walk > 0.55 ? 0.05 : 0)\n      : 1 + idle * 0.012) * (1 + attack * (ranger ? 0.03 : 0.08));\n    const squashY = (actor.moving\n      ? 1 - Math.abs(walk) * (heavy ? 0.04 : fly ? 0.06 : 0.025) + (walk > 0.55 ? 0.05 : 0)\n      : fly ? 1 + Math.sin(t * 8.5) * 0.035 : 1 - idle * 0.01) * (1 + attack * (ranger ? -0.06 : -0.05));\n    const tilt = fly\n      ? walk * 0.05 + idle * 0.01\n      : actor.moving\n        ? walk * (heavy ? 0.012 : hoppy ? 0.038 : 0.024)\n        : idle * 0.006;\n    const lunge = attack * (ranger ? -9 : heavy ? 18 : hoppy ? 16 : 13) * actor.dir;\n    const trail = fly || hoppy ? Math.abs(walk) > 0.32 : Math.abs(walk) > 0.68;\n    return { walk, idle, attackProgress, attack, hop, squashX, squashY, tilt, lunge, trail, fly };\n  }\n\n'''
    marker = "  function drawPixelFighter(actor) {"
    if marker not in text:
        raise SystemExit("drawPixelFighter marker not found")
    text = text.replace(marker, fighter_motion + marker, 1)

motion_re = re.compile(r'''    const walk = actor\.moving \? Math\.sin\(actor\.age \* actor\.speed \* 0\.2 \+ actor\.seed\) : 0;\n    const idle = Math\.sin\(actor\.age \* 2\.8 \+ actor\.seed\);\n    const attackProgress = actor\.attackAnim > 0\n      \? 1 - actor\.attackAnim / actor\.attackDuration\n      : 0;\n    const attack = actor\.attackAnim > 0 \? Math\.sin\(attackProgress \* Math\.PI\) : 0;\n    const deathT = clamp\(actor\.death / 0\.7, 0, 1\);\n    const drawScale = \(extraAllySprite\?\.fitScale \|\| extraEnemySprite\?\.fitScale \|\| 1\);\n    const drawH = Math\.round\(actor\.size \* \(ally \? 3\.45 : 3\.35\) \* drawScale\);\n    const drawW = Math\.round\(drawH \* sourceW / sourceH\);\n    const jump = actor\.dead \? 0 : Math\.round\(\n      actor\.moving \? Math\.abs\(walk\) \* 5 : \(idle \+ 1\) \* 0\.7\n    \);\n    const rangedPose = actor\.id === "miku_diva" \? actor\.mikuSkill !== "leek" : actor\.projectile;\n    const lunge = Math\.round\(attack \* \(rangedPose \? -4 : 13\) \* actor\.dir\);''')
motion_new = '''    const motion = fighterMotion(actor);\n    const deathT = clamp(actor.death / 0.7, 0, 1);\n    const drawScale = (extraAllySprite?.fitScale || extraEnemySprite?.fitScale || 1);\n    const drawH = Math.round(actor.size * (ally ? 3.45 : 3.35) * drawScale);\n    const drawW = Math.round(drawH * sourceW / sourceH);\n    const jump = Math.round(motion.hop);\n    const lunge = Math.round(motion.lunge);'''
text, n = motion_re.subn(motion_new, text, count=1)
if n != 1:
    raise SystemExit(f"fighter motion block replacement count={n}")

old_transform = '''    ctx.translate(Math.round(actor.x + lunge + recoilOffset), Math.round(actor.y - jump));\n    ctx.scale(spawnScale, spawnScale);\n    if (flipSpriteX) ctx.scale(-1, 1);\n    ctx.globalAlpha = actor.dead ? 1 - deathT : 1;\n'''
new_transform = '''    ctx.translate(Math.round(actor.x + lunge + recoilOffset), Math.round(actor.y - jump));\n    ctx.scale(spawnScale * motion.squashX, spawnScale * motion.squashY);\n    ctx.rotate(motion.tilt);\n    if (flipSpriteX) ctx.scale(-1, 1);\n    ctx.globalAlpha = actor.dead ? 1 - deathT : 1;\n'''
if old_transform not in text:
    raise SystemExit("sprite transform block not found")
text = text.replace(old_transform, new_transform, 1)

shadow_line = '''    pixelRect(-drawW * 0.38, 2 + jump, drawW * 0.76, 8, "rgba(21,30,24,.28)");\n'''
trail_block = shadow_line + '''    if (actor.moving && motion.trail) {\n      ctx.save();\n      ctx.globalAlpha = motion.fly ? 0.18 : 0.12;\n      ctx.drawImage(\n        sheet,\n        sourceX, sourceY, sourceW, sourceH,\n        Math.round(-drawW / 2 - 7 * actor.dir),\n        Math.round(-drawH + groundOffset + (motion.fly ? 5 : 0)),\n        drawW, drawH\n      );\n      ctx.restore();\n    }\n'''
if shadow_line not in text:
    raise SystemExit("fighter shadow anchor not found")
text = text.replace(shadow_line, trail_block, 1)

old_charge = '      const charge = Math.sin(attackProgress * Math.PI);'
new_charge = '      const charge = Math.sin(motion.attackProgress * Math.PI);'
if old_charge not in text:
    raise SystemExit("attack charge line not found")
text = text.replace(old_charge, new_charge, 1)

if text == original:
    raise SystemExit("no game.js changes produced")
GAME.write_text(text, encoding="utf-8")

# Force the service worker to build a fresh cache so old game.js is not kept.
sw = SW.read_text(encoding="utf-8")
match = re.search(r'fur-frontline-offline-v(\d+)', sw)
if not match:
    raise SystemExit("service worker cache version not found")
version = int(match.group(1)) + 1
sw = sw[:match.start()] + f"fur-frontline-offline-v{version}" + sw[match.end():]
SW.write_text(sw, encoding="utf-8")

print(f"Applied sprite quality fix; service worker cache -> v{version}")
