/**
 * 2D ドット絵探索 — Canvas ピクセル版
 */
import { WORLD_CONFIG } from "./world-config.js";
import { mapSceneToWorld } from "./world3d.js";
import {
  WORLD_LANDMARKS,
  WORLD_SPAWN,
  WORLD_PROPS,
  getNpcColor,
  facingFromDir,
  isOnPath,
  drawWitnessSprite,
  drawProp,
  drawLandmarkArt,
  drawParallaxHills,
  spawnParticle,
  drawParticle,
} from "./world2d-art.js";

const INTERNAL_W = 320;
const INTERNAL_H = 180;
const WORLD_BOUNDS = 24;
const MOVE_SPEED = 9.2;
const PX_PER_UNIT = 7;
const DEFAULT_HINT = "WASD / 矢印 — 移動 · E — 調べる";
const TOUCH_HINT = "左スティック — 移動 · 調べる";
const SYSTEM_HINT = "条項を選んでください（移動は一時停止）";

const NPC_LABELS = {
  aster: "アスター",
  sen: "セン",
  soli: "ソリ",
  child: "子ども代表",
  lin: "リン",
  kaede: "カエデ",
  haru: "ハル",
  io: "イオ",
  nagi: "ナギ",
};

const WORLD_DISCOVERIES = {
  garden: {
    id: "garden_festival",
    text: "百年祭の光の糸。記録も再生もない——ただ、その場にいた者だけが知っている。",
  },
  horizon: {
    id: "horizon_gate",
    text: "門は約90年後に閉じる。不可逆だが、避難命令ではない。選べる驚異。",
  },
  chorus: {
    id: "chorus_share",
    text: "感覚は分かち合える。ただし、境界線は消えない——切れる共有。",
  },
  palimpsest: {
    id: "palimpsest_ring",
    text: "記録の環。削除と匿名化のあいだに、まだ名前のない記憶がある。",
  },
  atelier: {
    id: "atelier_stage",
    text: "一度きりの舞台。完成するが、再演しない——約束が作品になる。",
  },
  council: {
    id: "council_mosaic",
    text: "命令しない神の座。暴走ではなく、自発的服従が問題だ。",
  },
  abyss: {
    id: "abyss_trench",
    text: "未命名の深層。ここでは、驚異に急いで名を付けない——仮名期間が保護になる。",
  },
  forge: {
    id: "forge_chamber",
    text: "試着室。14日で戻れる身体——不可逆変更は、別の契約で。",
  },
};

let canvas;
let ctx;
let rafId = null;
let visible = false;
let explorationEnabled = false;
let currentWorldId = "garden";
let elapsed = 0;
let lastTime = 0;
let worldTransition = 0;

const keys = new Set();
const touchInput = { x: 0, y: 0, active: false };
const player = { x: 0, y: 7, vx: 0, vy: 0, dir: 0, walk: 0 };
const camera = { x: 0, y: 7 };
let currentSpeaker = null;
let npcPos = null;
let nearestInteract = null;
let onDiscover = null;
const discoveredIds = new Set();
let decorSeed = 0;
let particles = [];

function readAccent() {
  return getComputedStyle(document.documentElement).getPropertyValue("--mood-accent").trim() || "#6ec8e8";
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mix(c1, c2, t) {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
}

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function worldToScreen(wx, wy, camX, camY) {
  const sx = (wx - camX) * PX_PER_UNIT + INTERNAL_W / 2;
  const sy = (wy - camY) * PX_PER_UNIT + INTERNAL_H / 2;
  return { x: sx, y: sy };
}

function getDefaultHint() {
  return "ontouchstart" in window ? TOUCH_HINT : DEFAULT_HINT;
}

function showDiscoveryToast(text, title) {
  const toast = document.getElementById("world3d-toast");
  if (!toast) return;
  toast.hidden = false;
  toast.innerHTML = title
    ? `<strong>${title}</strong><p>${text}</p>`
    : `<p>${text}</p>`;
  toast.classList.remove("fade-out");
  clearTimeout(showDiscoveryToast._timer);
  showDiscoveryToast._timer = setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => {
      toast.hidden = true;
    }, 400);
  }, 4200);
}

export function setDiscoverHandler(fn) {
  onDiscover = fn;
}

export function tryInteract() {
  if (!explorationEnabled || !nearestInteract || nearestInteract.dist >= 3.2) return;

  const discovery = WORLD_DISCOVERIES[currentWorldId];
  if (discovery && !discoveredIds.has(discovery.id)) {
    discoveredIds.add(discovery.id);
    showDiscoveryToast(discovery.text, nearestInteract.label);
    if (onDiscover) onDiscover(discovery);
    return;
  }

  if (nearestInteract.kind === "npc" && currentSpeaker) {
    showDiscoveryToast("パネルの選択が、この場所でのあなたの関与だ。", nearestInteract.label);
    return;
  }

  showDiscoveryToast("ここには、まだ名前のないものがある。", nearestInteract.label);
}

function updateInteractButton() {
  const btn = document.getElementById("btn-interact");
  if (!btn) return;
  const can = explorationEnabled && nearestInteract && nearestInteract.dist < 3.2;
  btn.hidden = !can;
}

function updateProximityHint() {
  const hint = document.getElementById("world3d-hint");
  if (!hint || !explorationEnabled) return;

  let nearest = null;
  let nearestDist = Infinity;

  const lm = WORLD_LANDMARKS[currentWorldId];
  if (lm) {
    const d = Math.hypot(player.x - lm.x, player.y - lm.y);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = { label: lm.label, dist: d, kind: "landmark" };
    }
  }

  if (npcPos) {
    const d = Math.hypot(player.x - npcPos.x, player.y - npcPos.y);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = {
        label: currentSpeaker ? NPC_LABELS[currentSpeaker] : "誰か",
        dist: d,
        kind: "npc",
      };
    }
  }

  if (nearest && nearest.dist < 6) {
    nearestInteract = nearest;
    hint.classList.add("world3d-hint-near");
    if (nearest.dist < 3.2) {
      const action = "ontouchstart" in window ? "調べる" : "E — 調べる";
      hint.textContent =
        nearest.kind === "npc"
          ? `${nearest.label} のそば — ${action}`
          : `${nearest.label} — ${action}`;
    } else {
      hint.textContent = `${nearest.label} へ近づいている…`;
    }
  } else {
    nearestInteract = null;
    hint.classList.remove("world3d-hint-near");
    hint.textContent = getDefaultHint();
  }
  updateInteractButton();
}

function setNpcBeacon(worldId, speaker) {
  npcPos = null;
  if (!speaker || !NPC_LABELS[speaker]) return;
  const lm = WORLD_LANDMARKS[worldId];
  if (!lm) return;
  npcPos = { x: lm.x + 3.5, y: lm.y + 1.5 };
}

function resetParticles() {
  particles = [];
  const rng = seededRandom(decorSeed + 42);
  const count = 12 + (decorSeed % 8);
  for (let i = 0; i < count; i++) {
    particles.push(spawnParticle(currentWorldId, rng));
  }
}

function loadWorld(worldId, force = false) {
  const id = WORLD_CONFIG[worldId] ? worldId : "garden";
  if (id === currentWorldId && !force) return;

  currentWorldId = id;
  decorSeed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const spawn = WORLD_SPAWN[id] || { x: 0, y: 7 };
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  camera.x = spawn.x;
  camera.y = spawn.y;
  worldTransition = 1;
  resetParticles();
}

function drawSky(cfg) {
  const grad = ctx.createLinearGradient(0, 0, 0, INTERNAL_H * 0.55);
  grad.addColorStop(0, cfg.skyTop);
  grad.addColorStop(1, cfg.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, INTERNAL_W, INTERNAL_H * 0.55);

  const horizonY = INTERNAL_H * 0.42;
  const hg = ctx.createLinearGradient(0, horizonY - 12, 0, horizonY + 8);
  hg.addColorStop(0, "transparent");
  hg.addColorStop(0.5, mix(cfg.horizon, cfg.skyTop, 0.3));
  hg.addColorStop(1, "transparent");
  ctx.fillStyle = hg;
  ctx.fillRect(0, horizonY - 12, INTERNAL_W, 20);

  if (cfg.stars > 0.2) {
    const rng = seededRandom(decorSeed + 99);
    ctx.fillStyle = "#fff";
    for (let i = 0; i < Math.floor(cfg.stars * 48); i++) {
      const sx = rng() * INTERNAL_W;
      const sy = rng() * INTERNAL_H * 0.38;
      const blink = 0.3 + Math.sin(elapsed * 2 + i) * 0.2;
      ctx.globalAlpha = blink * cfg.stars;
      const sz = rng() > 0.85 ? 2 : 1;
      ctx.fillRect(Math.floor(sx), Math.floor(sy), sz, sz);
    }
    ctx.globalAlpha = 1;
  }
}

function drawGround(cfg, camX, camY) {
  const groundTop = INTERNAL_H * 0.42;
  const grad = ctx.createLinearGradient(0, groundTop, 0, INTERNAL_H);
  grad.addColorStop(0, mix(cfg.horizon, cfg.skyBottom, 0.5));
  grad.addColorStop(1, cfg.fogColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, groundTop, INTERNAL_W, INTERNAL_H - groundTop);

  const tileW = PX_PER_UNIT;
  const startTx = Math.floor(camX - INTERNAL_W / PX_PER_UNIT / 2) - 1;
  const endTx = Math.ceil(camX + INTERNAL_W / PX_PER_UNIT / 2) + 1;
  const startTy = Math.floor(camY - INTERNAL_H / PX_PER_UNIT / 2) - 1;
  const endTy = Math.ceil(camY + INTERNAL_H / PX_PER_UNIT / 2) + 1;
  const accent = readAccent();

  for (let ty = startTy; ty <= endTy; ty++) {
    for (let tx = startTx; tx <= endTx; tx++) {
      const wx = tx;
      const wy = ty;
      if (Math.abs(wx) > WORLD_BOUNDS || Math.abs(wy) > WORLD_BOUNDS) continue;

      const { x: sx, y: sy } = worldToScreen(wx, wy, camX, camY);
      const hash = (tx * 73856093 ^ ty * 19349663 ^ decorSeed) >>> 0;
      const onPath = isOnPath(wx, wy, currentWorldId);
      const v = (hash % 5) / 10;

      if (onPath) {
        ctx.fillStyle = mix(cfg.horizon, accent, 0.12 + v * 0.05);
      } else {
        ctx.fillStyle = mix(cfg.horizon, cfg.fogColor, 0.35 + v);
      }
      ctx.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(tileW), Math.ceil(tileW));

      if (!onPath && hash % 21 === 0) {
        ctx.fillStyle = mix(cfg.horizon, accent, 0.12);
        ctx.fillRect(Math.floor(sx) + 2, Math.floor(sy) + 2, 2, 2);
      }
      if (onPath && hash % 9 === 0) {
        ctx.fillStyle = mix(accent, "#fff", 0.15);
        ctx.globalAlpha = 0.35;
        ctx.fillRect(Math.floor(sx) + 3, Math.floor(sy) + 3, 1, 1);
        ctx.globalAlpha = 1;
      }
    }
  }

  ctx.strokeStyle = mix(accent, cfg.fogColor, 0.5);
  ctx.globalAlpha = 0.25;
  const bounds = WORLD_BOUNDS;
  const corners = [
    worldToScreen(-bounds, -bounds, camX, camY),
    worldToScreen(bounds, -bounds, camX, camY),
    worldToScreen(bounds, bounds, camX, camY),
    worldToScreen(-bounds, bounds, camX, camY),
  ];
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < corners.length; i++) ctx.lineTo(corners[i].x, corners[i].y);
  ctx.closePath();
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawProps(cfg, camX, camY) {
  const accent = readAccent();
  const props = WORLD_PROPS[currentWorldId] || [];
  for (const prop of props) {
    const { x: sx, y: sy } = worldToScreen(prop.x, prop.y, camX, camY);
    if (sx < -24 || sx > INTERNAL_W + 24 || sy < -24 || sy > INTERNAL_H + 24) continue;
    drawProp(ctx, prop.type, sx, sy, accent, cfg, mix, elapsed);
  }
}

function drawLandmark(lm, camX, camY) {
  const { x: sx, y: sy } = worldToScreen(lm.x, lm.y, camX, camY);
  const accent = readAccent();
  const cfg = WORLD_CONFIG[currentWorldId] || WORLD_CONFIG.garden;
  const discovery = WORLD_DISCOVERIES[currentWorldId];
  const discovered = discovery ? discoveredIds.has(discovery.id) : false;

  drawLandmarkArt(ctx, currentWorldId, sx, sy, accent, cfg, mix, elapsed, discovered);

  ctx.fillStyle = "rgba(10,16,28,0.88)";
  ctx.font = "6px monospace";
  const label = lm.label;
  const tw = ctx.measureText(label).width;
  ctx.fillRect(Math.floor(sx - tw / 2 - 3), Math.floor(sy - 20), tw + 6, 8);
  ctx.fillStyle = accent;
  ctx.fillText(label, Math.floor(sx - tw / 2), Math.floor(sy - 14));
}

function drawNpc(camX, camY) {
  if (!npcPos || !currentSpeaker) return;
  const { x: sx, y: sy } = worldToScreen(npcPos.x, npcPos.y, camX, camY);
  const npcColor = getNpcColor(currentSpeaker);
  const bob = Math.sin(elapsed * 4) * 1.5;
  const facing = facingFromDir(Math.atan2(player.x - npcPos.x, player.y - npcPos.y));

  ctx.fillStyle = npcColor;
  ctx.globalAlpha = 0.25 + Math.sin(elapsed * 3) * 0.1;
  ctx.beginPath();
  ctx.arc(Math.floor(sx), Math.floor(sy + bob) - 4, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  drawWitnessSprite(
    ctx,
    sx,
    sy + bob,
    facing,
    Math.floor(elapsed * 6) % 2,
    npcColor,
    false
  );

  const name = NPC_LABELS[currentSpeaker];
  ctx.fillStyle = "rgba(10,16,28,0.88)";
  ctx.font = "6px monospace";
  const tw = ctx.measureText(name).width;
  ctx.fillRect(Math.floor(sx - tw / 2 - 3), Math.floor(sy - 22 + bob), tw + 6, 8);
  ctx.fillStyle = npcColor;
  ctx.fillText(name, Math.floor(sx - tw / 2), Math.floor(sy - 16 + bob));
}

function drawPlayer(camX, camY) {
  const { x: sx, y: sy } = worldToScreen(player.x, player.y, camX, camY);
  const accent = readAccent();
  const facing = facingFromDir(player.dir);
  const frame = Math.floor(player.walk) % 2;
  const speed = Math.hypot(player.vx, player.vy);

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(Math.floor(sx), Math.floor(sy) + 2, 5 + speed * 0.1, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  drawWitnessSprite(ctx, sx, sy, facing, frame, accent, true);
}

function updateParticles(dt, camX, camY) {
  const accent = readAccent();
  const rng = seededRandom(decorSeed + Math.floor(elapsed * 10));

  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    p.vx += Math.sin(elapsed + p.phase) * 0.02 * dt;
    p.vy += Math.cos(elapsed * 0.8 + p.phase) * 0.02 * dt;

    const { x: sx, y: sy } = worldToScreen(p.x, p.y, camX, camY);
    if (sx > -4 && sx < INTERNAL_W + 4 && sy > -4 && sy < INTERNAL_H + 4) {
      drawParticle(ctx, p, sx, sy, accent, mix, elapsed);
    }
  }

  particles = particles.filter((p) => p.life > 0);
  while (particles.length < 14) {
    particles.push(spawnParticle(currentWorldId, rng));
  }
}

function drawMinimap() {
  const size = 36;
  const margin = 6;
  const mx = margin;
  const my = margin;
  const scale = size / (WORLD_BOUNDS * 2.2);

  ctx.fillStyle = "rgba(10,16,28,0.75)";
  ctx.fillRect(mx, my, size, size);
  ctx.strokeStyle = mix(readAccent(), "#fff", 0.15);
  ctx.strokeRect(mx, my, size, size);

  const cx = mx + size / 2;
  const cy = my + size / 2;

  const lm = WORLD_LANDMARKS[currentWorldId];
  if (lm) {
    ctx.fillStyle = mix(readAccent(), "#fff", 0.2);
    ctx.fillRect(
      Math.floor(cx + lm.x * scale) - 1,
      Math.floor(cy + lm.y * scale) - 1,
      3,
      3
    );
  }

  if (npcPos) {
    ctx.fillStyle = getNpcColor(currentSpeaker);
    ctx.fillRect(
      Math.floor(cx + npcPos.x * scale) - 1,
      Math.floor(cy + npcPos.y * scale) - 1,
      2,
      2
    );
  }

  ctx.fillStyle = readAccent();
  ctx.fillRect(Math.floor(cx + player.x * scale) - 1, Math.floor(cy + player.y * scale) - 1, 2, 2);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "5px monospace";
  ctx.fillText("MAP", mx + 2, my + 6);
}

function render() {
  if (!ctx) return;
  const cfg = WORLD_CONFIG[currentWorldId] || WORLD_CONFIG.garden;
  const camX = camera.x;
  const camY = camera.y;

  ctx.imageSmoothingEnabled = false;
  drawSky(cfg);
  drawParallaxHills(ctx, cfg, mix, camX, camY, elapsed, INTERNAL_W, INTERNAL_H);
  drawGround(cfg, camX, camY);
  drawProps(cfg, camX, camY);
  updateParticles(1 / 60, camX, camY);

  const lm = WORLD_LANDMARKS[currentWorldId];
  if (lm) drawLandmark(lm, camX, camY);
  drawNpc(camX, camY);
  drawPlayer(camX, camY);
  drawMinimap();

  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.fillRect(0, 0, INTERNAL_W, 6);
  ctx.fillRect(0, INTERNAL_H - 6, INTERNAL_W, 6);

  if (worldTransition > 0) {
    ctx.fillStyle = `rgba(4,8,14,${worldTransition * 0.85})`;
    ctx.fillRect(0, 0, INTERNAL_W, INTERNAL_H);
  }
}

function updateCamera(dt) {
  const ease = 1 - Math.pow(0.0008, dt);
  camera.x += (player.x - camera.x) * ease;
  camera.y += (player.y - camera.y) * ease;
}

function updatePlayer(dt) {
  if (!explorationEnabled) return;

  let mx = 0;
  let my = 0;
  if (keys.has("w") || keys.has("arrowup")) my -= 1;
  if (keys.has("s") || keys.has("arrowdown")) my += 1;
  if (keys.has("d") || keys.has("arrowright")) mx += 1;
  if (keys.has("a") || keys.has("arrowleft")) mx -= 1;

  if (touchInput.active && (touchInput.x !== 0 || touchInput.y !== 0)) {
    mx += touchInput.x;
    my += touchInput.y;
  }

  if (mx !== 0 || my !== 0) {
    const len = Math.hypot(mx, my);
    mx /= len;
    my /= len;
    player.vx += mx * MOVE_SPEED * dt * 8;
    player.vy += my * MOVE_SPEED * dt * 8;
    player.dir = Math.atan2(mx, my);
    player.walk += dt * 10;
  } else {
    player.vx *= Math.pow(0.02, dt);
    player.vy *= Math.pow(0.02, dt);
  }

  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.x = Math.max(-WORLD_BOUNDS, Math.min(WORLD_BOUNDS, player.x));
  player.y = Math.max(-WORLD_BOUNDS, Math.min(WORLD_BOUNDS, player.y));

  const speed = Math.hypot(player.vx, player.vy);
  if (speed < 0.1) player.walk = 0;
}

function tick(now) {
  rafId = requestAnimationFrame(tick);
  if (!visible) return;

  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
  lastTime = now;
  elapsed += dt;

  if (worldTransition > 0) {
    worldTransition = Math.max(0, worldTransition - dt * 2.2);
  }

  updatePlayer(dt);
  updateCamera(dt);
  updateProximityHint();
  render();
}

function bindInput() {
  window.addEventListener("keydown", (e) => {
    if (!visible) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
      keys.add(e.key.toLowerCase());
      e.preventDefault();
    }
    if (e.key === "e" || e.key === "E") {
      if (explorationEnabled) {
        e.preventDefault();
        tryInteract();
      }
    }
  });
  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
}

function bindTouchStick() {
  const stick = document.getElementById("touch-stick");
  const knob = document.getElementById("touch-stick-knob");
  if (!stick || !knob) return;

  const maxRadius = 42;
  let pointerId = null;
  let centerX = 0;
  let centerY = 0;

  stick.addEventListener("pointerdown", (e) => {
    if (!explorationEnabled || !visible) return;
    pointerId = e.pointerId;
    const rect = stick.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
    touchInput.active = true;
    stick.setPointerCapture(e.pointerId);
    moveKnob(e.clientX, e.clientY);
    e.preventDefault();
  });

  stick.addEventListener("pointermove", (e) => {
    if (e.pointerId !== pointerId) return;
    moveKnob(e.clientX, e.clientY);
    e.preventDefault();
  });

  function release(e) {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    touchInput.active = false;
    touchInput.x = 0;
    touchInput.y = 0;
    knob.style.transform = "translate(-50%, -50%)";
  }

  stick.addEventListener("pointerup", release);
  stick.addEventListener("pointercancel", release);

  function moveKnob(clientX, clientY) {
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const len = Math.hypot(dx, dy);
    if (len > maxRadius) {
      dx = (dx / len) * maxRadius;
      dy = (dy / len) * maxRadius;
    }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    touchInput.x = dx / maxRadius;
    touchInput.y = dy / maxRadius;
  }
}

function onResize() {
  if (!canvas) return;
  const wrap = document.getElementById("world2d-wrap");
  if (!wrap) return;
  canvas.style.width = `${wrap.clientWidth}px`;
  canvas.style.height = `${wrap.clientHeight}px`;
}

export function initWorld2d() {
  const wrap = document.getElementById("world2d-wrap");
  if (!wrap) return;

  canvas = document.createElement("canvas");
  canvas.width = INTERNAL_W;
  canvas.height = INTERNAL_H;
  canvas.className = "world2d-canvas";
  wrap.appendChild(canvas);
  ctx = canvas.getContext("2d");

  bindInput();
  bindTouchStick();
  loadWorld("horizon", true);
  window.addEventListener("resize", onResize);
  onResize();
}

export function showWorld2d() {
  visible = true;
  document.body.classList.add("mode-3d");
  document.body.classList.add("mode-2d");

  const wrap3d = document.getElementById("world3d-wrap");
  const wrap2d = document.getElementById("world2d-wrap");
  const hint = document.getElementById("world3d-hint");
  const stick = document.getElementById("touch-stick");

  if (wrap3d) wrap3d.hidden = true;
  if (wrap2d) wrap2d.hidden = false;
  if (hint) hint.hidden = false;
  if (stick) stick.hidden = !("ontouchstart" in window);

  if (!rafId) {
    lastTime = performance.now();
    tick(lastTime);
  }
  onResize();
}

export function hideWorld2d() {
  visible = false;
  explorationEnabled = false;
  document.body.classList.remove("mode-2d");

  const wrap2d = document.getElementById("world2d-wrap");
  if (wrap2d) wrap2d.hidden = true;
}

export function setExplorationEnabled(enabled) {
  explorationEnabled = enabled && visible;
  const hint = document.getElementById("world3d-hint");
  if (hint) {
    hint.classList.remove("world3d-hint-near");
    hint.textContent = enabled ? getDefaultHint() : SYSTEM_HINT;
  }
  if (!enabled) {
    touchInput.active = false;
    touchInput.x = 0;
    touchInput.y = 0;
  }
}

export function setWorldFromScene(sceneMeta) {
  currentSpeaker = sceneMeta.speaker || null;
  const worldId = mapSceneToWorld(sceneMeta);
  const changed = worldId !== currentWorldId;
  loadWorld(worldId, changed);
  setNpcBeacon(worldId, sceneMeta.speaker);
}

export function isWorld2dActive() {
  return visible;
}
