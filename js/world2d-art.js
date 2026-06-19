/**
 * 2D探索 — ドット絵スプライト・タイル・ランドマーク定義
 */
import { NPCS } from "./portraits.js";

export const WORLD_LANDMARKS = {
  garden: { label: "祭りの広場", x: 0, y: -8 },
  horizon: { label: "地平門", x: 0, y: -10 },
  chorus: { label: "共有室", x: 0, y: 0 },
  palimpsest: { label: "記録の環", x: 0, y: 0 },
  atelier: { label: "初演の舞台", x: 0, y: -4 },
  council: { label: "公共議会", x: 0, y: 0 },
  abyss: { label: "深層クレバス", x: 0, y: -6 },
  forge: { label: "試着室", x: 0, y: -5 },
};

/** スポーン地点（各地域） */
export const WORLD_SPAWN = {
  garden: { x: 0, y: 7 },
  horizon: { x: 0, y: 8 },
  chorus: { x: 0, y: 9 },
  palimpsest: { x: 0, y: 9 },
  atelier: { x: 0, y: 7 },
  council: { x: 0, y: 8 },
  abyss: { x: 0, y: 8 },
  forge: { x: 0, y: 7 },
};

/** 固定オブジェクト（ワールド座標） */
export const WORLD_PROPS = {
  garden: [
    { type: "tree", x: -14, y: -2 },
    { type: "tree", x: 12, y: 4 },
    { type: "tree", x: -8, y: 10 },
    { type: "lantern", x: -5, y: -5 },
    { type: "lantern", x: 5, y: -5 },
    { type: "bush", x: 9, y: -10 },
    { type: "bush", x: -10, y: -12 },
  ],
  horizon: [
    { type: "pillar", x: -11, y: -3 },
    { type: "pillar", x: 11, y: -3 },
    { type: "crystal", x: -7, y: 5 },
    { type: "crystal", x: 8, y: 2 },
    { type: "crystal", x: -4, y: -14 },
  ],
  chorus: [
    { type: "ribbon", x: -10, y: -6 },
    { type: "ribbon", x: 10, y: -4 },
    { type: "pool", x: 0, y: 2 },
    { type: "crystal", x: -6, y: 6 },
    { type: "crystal", x: 7, y: 5 },
  ],
  palimpsest: [
    { type: "archive", x: -9, y: -7 },
    { type: "archive", x: 9, y: -6 },
    { type: "ring", x: 0, y: -2 },
    { type: "lantern", x: -5, y: 8 },
    { type: "lantern", x: 5, y: 8 },
  ],
  atelier: [
    { type: "stage", x: 0, y: -6 },
    { type: "speaker", x: -8, y: 2 },
    { type: "speaker", x: 8, y: 2 },
    { type: "lantern", x: -4, y: -8 },
    { type: "lantern", x: 4, y: -8 },
  ],
  council: [
    { type: "bench", x: -10, y: 4 },
    { type: "bench", x: 10, y: 4 },
    { type: "mosaic", x: 0, y: -3 },
    { type: "pillar", x: -8, y: -8 },
    { type: "pillar", x: 8, y: -8 },
  ],
  abyss: [
    { type: "trench", x: 0, y: -4 },
    { type: "crystal", x: -9, y: 2 },
    { type: "crystal", x: 9, y: -2 },
    { type: "buoy", x: -5, y: 8 },
    { type: "buoy", x: 5, y: 8 },
  ],
  forge: [
    { type: "forge", x: 0, y: -7 },
    { type: "anvil", x: -6, y: 2 },
    { type: "crate", x: 7, y: 3 },
    { type: "crate", x: -8, y: -4 },
    { type: "lantern", x: 4, y: -9 },
  ],
};

export function getNpcColor(speakerId) {
  return NPCS[speakerId]?.color || "#6ec8e8";
}

export function facingFromDir(dir) {
  const a = dir;
  if (a >= -Math.PI / 4 && a < Math.PI / 4) return "down";
  if (a >= Math.PI / 4 && a < (3 * Math.PI) / 4) return "right";
  if (a >= (-3 * Math.PI) / 4 && a < -Math.PI / 4) return "left";
  return "up";
}

/** スポーンからランドマークへの道 */
export function isOnPath(wx, wy, worldId) {
  const spawn = WORLD_SPAWN[worldId] || { x: 0, y: 7 };
  const lm = WORLD_LANDMARKS[worldId];
  if (!lm) return false;
  const dx = lm.x - spawn.x;
  const dy = lm.y - spawn.y;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1) return false;
  const t = ((wx - spawn.x) * dx + (wy - spawn.y) * dy) / len2;
  if (t < 0.02 || t > 0.98) return false;
  const px = spawn.x + t * dx;
  const py = spawn.y + t * dy;
  return Math.hypot(wx - px, wy - py) < 1.35;
}

function px(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
}

/** 証人キャラ — フード + 宝石（12×14 付近） */
export function drawWitnessSprite(ctx, sx, sy, facing, frame, accent, isPlayer) {
  const hood = isPlayer ? "#1a2030" : "#2a3040";
  const coat = isPlayer ? "#243040" : "#3a4050";
  const leg = "#141820";
  const f = frame % 2;
  const bob = f ? 0 : -1;
  const ix = Math.floor(sx);
  const iy = Math.floor(sy) + bob;

  const legSwing = f ? 1 : -1;

  if (facing === "down") {
    px(ctx, ix - 2, iy - 1 + legSwing, leg);
    px(ctx, ix + 1, iy - 1 - legSwing, leg);
    px(ctx, ix - 3, iy - 4, coat);
    px(ctx, ix - 2, iy - 5, coat);
    px(ctx, ix - 1, iy - 5, coat);
    px(ctx, ix, iy - 5, coat);
    px(ctx, ix + 1, iy - 5, coat);
    px(ctx, ix + 2, iy - 4, coat);
    px(ctx, ix - 2, iy - 7, hood);
    px(ctx, ix - 1, iy - 7, hood);
    px(ctx, ix, iy - 7, hood);
    px(ctx, ix + 1, iy - 7, hood);
    px(ctx, ix, iy - 6, accent);
    px(ctx, ix - 1, iy - 8, hood);
    px(ctx, ix, iy - 8, hood);
    px(ctx, ix + 1, iy - 8, hood);
  } else if (facing === "up") {
    px(ctx, ix - 2, iy - 1 + legSwing, leg);
    px(ctx, ix + 1, iy - 1 - legSwing, leg);
    px(ctx, ix - 2, iy - 4, coat);
    px(ctx, ix - 1, iy - 5, coat);
    px(ctx, ix, iy - 5, coat);
    px(ctx, ix + 1, iy - 4, coat);
    px(ctx, ix - 1, iy - 7, hood);
    px(ctx, ix, iy - 7, hood);
    px(ctx, ix, iy - 6, accent);
    px(ctx, ix - 2, iy - 8, hood);
    px(ctx, ix - 1, iy - 8, hood);
    px(ctx, ix, iy - 8, hood);
    px(ctx, ix + 1, iy - 8, hood);
    px(ctx, ix + 2, iy - 8, hood);
  } else if (facing === "right") {
    px(ctx, ix - 1 + legSwing, iy - 1, leg);
    px(ctx, ix - 1 - legSwing, iy, leg);
    px(ctx, ix - 2, iy - 4, coat);
    px(ctx, ix - 1, iy - 5, coat);
    px(ctx, ix, iy - 5, coat);
    px(ctx, ix + 1, iy - 4, coat);
    px(ctx, ix, iy - 6, hood);
    px(ctx, ix + 1, iy - 6, hood);
    px(ctx, ix + 2, iy - 7, hood);
    px(ctx, ix + 1, iy - 5, accent);
    px(ctx, ix + 2, iy - 8, hood);
    px(ctx, ix + 3, iy - 7, hood);
  } else {
    px(ctx, ix + legSwing, iy - 1, leg);
    px(ctx, ix - legSwing, iy, leg);
    px(ctx, ix - 2, iy - 4, coat);
    px(ctx, ix - 1, iy - 5, coat);
    px(ctx, ix, iy - 5, coat);
    px(ctx, ix + 1, iy - 4, coat);
    px(ctx, ix - 1, iy - 6, hood);
    px(ctx, ix - 2, iy - 6, hood);
    px(ctx, ix - 3, iy - 7, hood);
    px(ctx, ix - 2, iy - 5, accent);
    px(ctx, ix - 3, iy - 8, hood);
    px(ctx, ix - 4, iy - 7, hood);
  }
}

export function drawProp(ctx, type, sx, sy, accent, cfg, mix, elapsed) {
  const ix = Math.floor(sx);
  const iy = Math.floor(sy);
  const pulse = 0.6 + Math.sin(elapsed * 2.5 + ix) * 0.4;

  switch (type) {
    case "tree":
      ctx.fillStyle = mix(cfg.horizon, "#1a3020", 0.5);
      ctx.fillRect(ix - 1, iy - 5, 2, 5);
      ctx.fillStyle = mix(cfg.horizon, "#3a6848", 0.25);
      ctx.fillRect(ix - 4, iy - 8, 8, 4);
      ctx.fillRect(ix - 2, iy - 10, 4, 3);
      break;
    case "bush":
      ctx.fillStyle = mix(cfg.horizon, "#2a5038", 0.35);
      ctx.fillRect(ix - 3, iy - 3, 6, 3);
      ctx.fillRect(ix - 2, iy - 5, 4, 2);
      break;
    case "lantern":
      ctx.fillStyle = mix(accent, "#ffe8c8", 0.35);
      ctx.globalAlpha = 0.5 + pulse * 0.3;
      ctx.fillRect(ix - 2, iy - 6, 4, 5);
      ctx.fillStyle = accent;
      ctx.fillRect(ix - 1, iy - 5, 2, 3);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#1a1410";
      ctx.fillRect(ix, iy - 1, 1, 2);
      break;
    case "pillar":
      ctx.fillStyle = mix(accent, cfg.skyTop, 0.4);
      ctx.fillRect(ix - 2, iy - 10, 4, 10);
      ctx.fillStyle = mix(accent, "#fff", 0.3);
      ctx.fillRect(ix - 3, iy - 11, 6, 2);
      break;
    case "crystal":
      ctx.fillStyle = mix(accent, "#fff", 0.2);
      ctx.globalAlpha = 0.7 + pulse * 0.2;
      ctx.fillRect(ix, iy - 5, 2, 4);
      ctx.fillRect(ix - 2, iy - 3, 6, 2);
      ctx.fillRect(ix - 1, iy - 7, 4, 2);
      ctx.globalAlpha = 1;
      break;
    case "ribbon":
      ctx.strokeStyle = mix(accent, "#fff", 0.2);
      ctx.globalAlpha = 0.5 + pulse * 0.3;
      ctx.beginPath();
      ctx.moveTo(ix - 4, iy);
      ctx.quadraticCurveTo(ix, iy - 8 - pulse * 2, ix + 4, iy);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    case "pool":
      ctx.fillStyle = mix(accent, cfg.skyBottom, 0.3);
      ctx.globalAlpha = 0.45;
      ctx.fillRect(ix - 6, iy - 2, 12, 5);
      ctx.globalAlpha = 1;
      break;
    case "archive":
      ctx.fillStyle = mix(cfg.horizon, "#2a2848", 0.4);
      ctx.fillRect(ix - 4, iy - 7, 8, 7);
      ctx.fillStyle = mix(accent, "#fff", 0.15);
      ctx.fillRect(ix - 3, iy - 6, 6, 1);
      ctx.fillRect(ix - 3, iy - 4, 6, 1);
      break;
    case "ring":
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.5 + pulse * 0.3;
      ctx.strokeRect(ix - 5, iy - 5, 10, 8);
      ctx.globalAlpha = 1;
      break;
    case "stage":
      ctx.fillStyle = mix("#e8926a", cfg.horizon, 0.3);
      ctx.fillRect(ix - 8, iy - 2, 16, 3);
      ctx.fillStyle = mix(accent, "#fff", 0.2);
      ctx.fillRect(ix - 6, iy - 6, 12, 4);
      break;
    case "speaker":
      ctx.fillStyle = mix(cfg.horizon, "#302018", 0.5);
      ctx.fillRect(ix - 2, iy - 4, 4, 4);
      ctx.fillStyle = accent;
      ctx.fillRect(ix - 1, iy - 3, 2, 2);
      break;
    case "bench":
      ctx.fillStyle = mix(cfg.horizon, "#283040", 0.5);
      ctx.fillRect(ix - 4, iy - 2, 8, 2);
      ctx.fillRect(ix - 3, iy - 4, 1, 2);
      ctx.fillRect(ix + 2, iy - 4, 1, 2);
      break;
    case "mosaic":
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.fillStyle = mix(accent, cfg.horizon, (r + c) % 3 * 0.15);
          ctx.fillRect(ix - 6 + c * 3, iy - 6 + r * 3, 2, 2);
        }
      }
      break;
    case "trench":
      ctx.fillStyle = mix(accent, "#020408", 0.15);
      ctx.fillRect(ix - 12, iy, 24, 4);
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.4 + pulse * 0.3;
      ctx.fillRect(ix - 10, iy + 1, 20, 1);
      ctx.globalAlpha = 1;
      break;
    case "buoy":
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.6 + pulse * 0.3;
      ctx.fillRect(ix - 1, iy - 5, 2, 4);
      ctx.fillRect(ix - 2, iy - 6, 4, 2);
      ctx.globalAlpha = 1;
      break;
    case "forge":
      ctx.fillStyle = mix("#e8c878", cfg.horizon, 0.3);
      ctx.fillRect(ix - 6, iy - 4, 12, 5);
      ctx.fillStyle = mix(accent, "#ff9040", 0.3);
      ctx.globalAlpha = 0.5 + pulse * 0.4;
      ctx.fillRect(ix - 2, iy - 7, 4, 3);
      ctx.globalAlpha = 1;
      break;
    case "anvil":
      ctx.fillStyle = mix(cfg.horizon, "#404050", 0.5);
      ctx.fillRect(ix - 3, iy - 3, 6, 3);
      ctx.fillRect(ix - 2, iy - 5, 4, 2);
      break;
    case "crate":
      ctx.fillStyle = mix(cfg.horizon, "#382818", 0.45);
      ctx.fillRect(ix - 3, iy - 4, 6, 4);
      ctx.strokeStyle = mix(accent, "#fff", 0.1);
      ctx.strokeRect(ix - 3, iy - 4, 6, 4);
      break;
    default:
      break;
  }
}

export function drawLandmarkArt(ctx, worldId, sx, sy, accent, cfg, mix, elapsed, discovered) {
  const ix = Math.floor(sx);
  const iy = Math.floor(sy);
  const pulse = 0.7 + Math.sin(elapsed * 3) * 0.3;

  ctx.fillStyle = mix(accent, "#fff", 0.12);
  ctx.globalAlpha = (discovered ? 0.12 : 0.22) * pulse;
  ctx.beginPath();
  ctx.arc(ix, iy, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  switch (worldId) {
    case "horizon":
      ctx.fillStyle = mix(accent, "#fff", 0.25);
      ctx.fillRect(ix - 10, iy - 12, 20, 14);
      ctx.fillStyle = accent;
      ctx.fillRect(ix - 8, iy - 10, 16, 10);
      ctx.fillStyle = mix(accent, "#fff", 0.5);
      ctx.fillRect(ix - 6, iy - 8, 12, 8);
      ctx.fillStyle = "#fff";
      ctx.fillRect(ix - 1, iy - 6, 2, 5);
      ctx.strokeStyle = mix(accent, "#fff", 0.4);
      ctx.strokeRect(ix - 10, iy - 12, 20, 14);
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + elapsed * 0.4;
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.4 + pulse * 0.3;
        ctx.fillRect(Math.floor(ix + Math.cos(a) * 14) - 1, Math.floor(iy + Math.sin(a) * 10) - 1, 2, 2);
      }
      ctx.globalAlpha = 1;
      break;

    case "garden":
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + elapsed * 0.6;
        ctx.fillStyle = mix(accent, "#7ecf9a", 0.35 + (i % 3) * 0.1);
        ctx.fillRect(Math.floor(ix + Math.cos(a) * 9) - 1, Math.floor(iy + Math.sin(a) * 6) - 1, 2, 2);
      }
      ctx.fillStyle = mix(accent, "#7ecf9a", 0.3);
      ctx.fillRect(ix - 4, iy - 2, 8, 4);
      ctx.fillStyle = accent;
      ctx.fillRect(ix - 2, iy - 4, 4, 4);
      break;

    case "chorus":
      ctx.fillStyle = mix(accent, "#e8a8c8", 0.3);
      ctx.fillRect(ix - 8, iy - 6, 16, 8);
      for (let i = 0; i < 5; i++) {
        const wave = Math.sin(elapsed * 3 + i) * 2;
        ctx.fillStyle = mix(accent, "#fff", i * 0.08);
        ctx.fillRect(ix - 6 + i * 3, iy - 4 + wave, 2, 4);
      }
      break;

    case "palimpsest":
      ctx.strokeStyle = accent;
      ctx.strokeRect(ix - 9, iy - 8, 18, 12);
      ctx.strokeRect(ix - 7, iy - 6, 14, 8);
      ctx.fillStyle = mix(accent, cfg.horizon, 0.3);
      ctx.fillRect(ix - 5, iy - 4, 10, 1);
      ctx.fillRect(ix - 4, iy - 2, 8, 1);
      ctx.fillRect(ix - 3, iy, 6, 1);
      break;

    case "atelier":
      ctx.fillStyle = mix("#e8926a", cfg.horizon, 0.2);
      ctx.fillRect(ix - 10, iy, 20, 4);
      ctx.fillStyle = mix(accent, "#fff", 0.2);
      ctx.fillRect(ix - 8, iy - 10, 16, 10);
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.5 + pulse * 0.3;
      ctx.fillRect(ix - 2, iy - 8, 4, 4);
      ctx.globalAlpha = 1;
      break;

    case "council":
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 5; c++) {
          ctx.fillStyle = mix(accent, cfg.horizon, ((r + c + Math.floor(elapsed)) % 4) * 0.12);
          ctx.fillRect(ix - 8 + c * 3, iy - 8 + r * 3, 2, 2);
        }
      }
      ctx.fillStyle = mix(accent, "#fff", 0.2);
      ctx.fillRect(ix - 3, iy - 2, 6, 4);
      break;

    case "abyss":
      ctx.fillStyle = mix(accent, "#020408", 0.1);
      ctx.fillRect(ix - 14, iy - 2, 28, 8);
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.5 + pulse * 0.4;
      ctx.fillRect(ix - 12, iy + 2, 24, 2);
      ctx.fillRect(ix - 4, iy - 6, 8, 4);
      ctx.globalAlpha = 1;
      break;

    case "forge":
      ctx.fillStyle = mix("#e8c878", cfg.horizon, 0.25);
      ctx.fillRect(ix - 8, iy - 2, 16, 5);
      ctx.fillStyle = mix(accent, "#ff8040", 0.35);
      ctx.globalAlpha = 0.6 + pulse * 0.35;
      ctx.fillRect(ix - 4, iy - 8, 8, 6);
      ctx.globalAlpha = 1;
      ctx.fillStyle = mix("#ffe8b0", accent, 0.3);
      ctx.fillRect(ix - 2, iy - 6, 4, 3);
      break;

    default:
      ctx.fillStyle = accent;
      ctx.fillRect(ix - 5, iy - 6, 10, 8);
      break;
  }

  if (discovered) {
    ctx.fillStyle = mix(accent, "#7ecf9a", 0.4);
    ctx.fillRect(ix + 8, iy - 12, 4, 4);
    ctx.fillRect(ix + 9, iy - 11, 2, 2);
  }
}

export function drawParallaxHills(ctx, cfg, mix, camX, camY, elapsed, w, h) {
  const layers = [
    { parallax: 0.15, height: 18, color: mix(cfg.skyTop, cfg.skyBottom, 0.3) },
    { parallax: 0.28, height: 14, color: mix(cfg.horizon, cfg.skyBottom, 0.45) },
    { parallax: 0.42, height: 10, color: mix(cfg.horizon, cfg.fogColor, 0.35) },
  ];

  const groundY = h * 0.42;
  layers.forEach((layer, li) => {
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= w; x += 4) {
      const wx = camX + (x - w / 2) / 7 / layer.parallax;
      const ridge =
        Math.sin(wx * 0.25 + li * 1.2) * layer.height +
        Math.sin(wx * 0.08 + elapsed * 0.15) * (layer.height * 0.4);
      ctx.lineTo(x, groundY - ridge - li * 6);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  });
}

export function spawnParticle(worldId, rng) {
  const types = {
    garden: "firefly",
    horizon: "stardust",
    chorus: "note",
    palimpsest: "mote",
    atelier: "spark",
    council: "mote",
    abyss: "bubble",
    forge: "spark",
  };
  return {
    type: types[worldId] || "mote",
    x: (rng() * 2 - 1) * 22,
    y: (rng() * 2 - 1) * 22,
    vx: (rng() - 0.5) * 0.4,
    vy: (rng() - 0.5) * 0.4,
    life: 2 + rng() * 4,
    phase: rng() * Math.PI * 2,
    size: rng() > 0.7 ? 2 : 1,
  };
}

export function drawParticle(ctx, p, sx, sy, accent, mix, elapsed) {
  const blink = 0.4 + Math.sin(elapsed * 4 + p.phase) * 0.35;
  ctx.globalAlpha = blink * (p.life / 4);

  switch (p.type) {
    case "firefly":
      ctx.fillStyle = mix(accent, "#ffe8c8", 0.4);
      ctx.fillRect(Math.floor(sx) - 1, Math.floor(sy) - 1, p.size + 1, p.size + 1);
      break;
    case "stardust":
      ctx.fillStyle = "#fff";
      ctx.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
      break;
    case "note":
      ctx.fillStyle = mix(accent, "#fff", 0.3);
      ctx.fillRect(Math.floor(sx), Math.floor(sy) - 2, 2, 2);
      ctx.fillRect(Math.floor(sx) + 1, Math.floor(sy), 2, 1);
      break;
    case "bubble":
      ctx.strokeStyle = mix(accent, "#fff", 0.4);
      ctx.strokeRect(Math.floor(sx) - 1, Math.floor(sy) - 1, 3, 3);
      break;
    case "spark":
      ctx.fillStyle = mix(accent, "#ffe8b0", 0.5);
      ctx.fillRect(Math.floor(sx), Math.floor(sy), 2, 2);
      break;
    default:
      ctx.fillStyle = accent;
      ctx.fillRect(Math.floor(sx), Math.floor(sy), p.size, p.size);
  }
  ctx.globalAlpha = 1;
}
