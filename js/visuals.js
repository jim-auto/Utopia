import { getTraditionalArt } from "./traditional-art.js";

const MOODS = {
  cosmos: {
    accent: "#6ec8e8",
    glow: "rgba(110, 200, 232, 0.35)",
    gradient: ["#050810", "#0a1628", "#122a45"],
  },
  dawn: {
    accent: "#e8b86d",
    glow: "rgba(232, 184, 109, 0.35)",
    gradient: ["#0a0c12", "#1a1420", "#2a2218"],
  },
  garden: {
    accent: "#7ecf9a",
    glow: "rgba(126, 207, 154, 0.32)",
    gradient: ["#060c0a", "#0e1a14", "#142818"],
  },
  mars: {
    accent: "#e8926a",
    glow: "rgba(232, 146, 106, 0.32)",
    gradient: ["#100808", "#201018", "#301820"],
  },
  memory: {
    accent: "#a8a0e8",
    glow: "rgba(168, 160, 232, 0.32)",
    gradient: ["#080810", "#12101e", "#1a1830"],
  },
  vow: {
    accent: "#d4849a",
    glow: "rgba(212, 132, 154, 0.32)",
    gradient: ["#0c080a", "#180e14", "#241420"],
  },
  law: {
    accent: "#d4b05a",
    glow: "rgba(212, 176, 90, 0.32)",
    gradient: ["#0a0a08", "#181610", "#242018"],
  },
  council: {
    accent: "#88b8e8",
    glow: "rgba(136, 184, 232, 0.32)",
    gradient: ["#080a10", "#101820", "#182030"],
  },
  finale: {
    accent: "#f0c878",
    glow: "rgba(240, 200, 120, 0.4)",
    gradient: ["#0a0810", "#181028", "#281838"],
  },
  chorus: {
    accent: "#e8a8c8",
    glow: "rgba(232, 168, 200, 0.35)",
    gradient: ["#100810", "#201018", "#301828"],
  },
  abyss: {
    accent: "#5ec8d8",
    glow: "rgba(94, 200, 216, 0.35)",
    gradient: ["#040810", "#081820", "#0c2830"],
  },
  forge: {
    accent: "#e8c878",
    glow: "rgba(232, 200, 120, 0.35)",
    gradient: ["#0c0804", "#181008", "#282010"],
  },
};

const SYSTEM_META = {
  presence: { badge: "プレゼンス", mood: "cosmos", art: "gate" },
  embodied: { badge: "身体的実践", mood: "mars", art: "atelier" },
  forgeBody: { badge: "身体的実践", mood: "forge", art: "forge" },
  coParent: { badge: "関係の実践", mood: "garden", art: "garden" },
  arenaLife: { badge: "身体的実践", mood: "mars", art: "atelier" },
  apologyRite: { badge: "見届けの設計", mood: "memory", art: "palimpsest" },
  vows: { badge: "誓約", mood: "vow", art: "atelier" },
  covenant: { badge: "コヴナント", mood: "law", art: "covenant" },
  reasons: { badge: "理由の地図", mood: "council", art: "deliberation" },
  charter: { badge: "出発憲章", mood: "finale", art: "ending" },
};

const MOTE_PRESETS = {
  cosmos: { count: 0, drift: 0.0002 },
  garden: { count: 18, drift: 0.00012 },
  mars: { count: 10, drift: 0.00015 },
  memory: { count: 14, drift: 0.00008 },
  vow: { count: 8, drift: 0.0001 },
  law: { count: 6, drift: 0.00008 },
  council: { count: 12, drift: 0.0001 },
  finale: { count: 16, drift: 0.00014 },
  chorus: { count: 20, drift: 0.00011 },
  abyss: { count: 14, drift: 0.00018 },
  forge: { count: 12, drift: 0.00014 },
  dawn: { count: 10, drift: 0.0001 },
};

let canvas, ctx, stars = [], motes = [], rafId = null;
let currentMoodId = "cosmos";

function seedMotes(moodId) {
  const preset = MOTE_PRESETS[moodId] || MOTE_PRESETS.cosmos;
  motes = Array.from({ length: preset.count }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 2.2 + 0.8,
    a: Math.random() * 0.25 + 0.08,
    s: preset.drift * (0.6 + Math.random() * 0.8),
    w: Math.random() * Math.PI * 2,
  }));
}

export function initAmbience() {
  canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;
  ctx = canvas.getContext("2d");
  resizeCanvas();
  stars = Array.from({ length: 160 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.6 + 0.15,
    a: Math.random() * 0.55 + 0.1,
    s: Math.random() * 0.00035 + 0.00004,
    layer: Math.random() > 0.75 ? 1 : 0,
  }));
  seedMotes(currentMoodId);
  window.addEventListener("resize", resizeCanvas);
  if (!rafId) tick();
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
}

function tick() {
  if (!ctx || !canvas) return;
  const w = canvas.width;
  const h = canvas.height;
  const t = Date.now() * 0.001;
  ctx.clearRect(0, 0, w, h);

  const accent = getComputedStyle(document.body).getPropertyValue("--mood-accent").trim() || "#6ec8e8";
  const dpr = devicePixelRatio;

  ctx.globalAlpha = 0.045;
  ctx.fillStyle = accent;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  ctx.globalAlpha = 1;

  stars.forEach((star) => {
    star.y -= star.s * (star.layer ? 0.5 : 1);
    if (star.y < 0) star.y = 1;
    ctx.beginPath();
    ctx.fillStyle = accent;
    const twinkle = 0.55 + Math.sin(t * (1.2 + star.layer) + star.x * 12) * 0.45;
    ctx.globalAlpha = star.a * twinkle * (star.layer ? 0.45 : 1);
    ctx.arc(star.x * w, star.y * h, star.r * dpr * (star.layer ? 1.4 : 1), 0, Math.PI * 2);
    ctx.fill();
  });

  motes.forEach((mote) => {
    mote.y -= mote.s;
    mote.x += Math.sin(t * 0.4 + mote.w) * 0.00008;
    if (mote.y < 0) {
      mote.y = 1;
      mote.x = Math.random();
    }
    ctx.beginPath();
    ctx.fillStyle = accent;
    ctx.globalAlpha = mote.a * (0.7 + Math.sin(t + mote.w) * 0.3);
    ctx.arc(mote.x * w, mote.y * h, mote.r * dpr, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
  rafId = requestAnimationFrame(tick);
}

export function setMood(moodId = "cosmos") {
  const mood = MOODS[moodId] || MOODS.cosmos;
  if (moodId !== currentMoodId) {
    currentMoodId = moodId;
    seedMotes(moodId);
  }
  document.body.dataset.mood = moodId;
  document.documentElement.style.setProperty("--mood-accent", mood.accent);
  document.documentElement.style.setProperty("--mood-glow", mood.glow);
  document.documentElement.style.setProperty("--grad-a", mood.gradient[0]);
  document.documentElement.style.setProperty("--grad-b", mood.gradient[1]);
  document.documentElement.style.setProperty("--grad-c", mood.gradient[2]);
}

export function moodFromLocation(location = "") {
  if (location.includes("火星") || location.includes("アトリエ")) return "mars";
  if (location.includes("月") || location.includes("パリンプセスト")) return "memory";
  if (location.includes("ホライズン") || location.includes("土星")) return "council";
  if (location.includes("コモン") || location.includes("地球")) return "garden";
  if (location.includes("コーラス") || location.includes("金星")) return "chorus";
  if (location.includes("アビス") || location.includes("エウロパ")) return "abyss";
  if (location.includes("水星") || location.includes("フォージ") || location.includes("ジェネシス")) return "forge";
  return "cosmos";
}

export function getSceneArtHtml(artId = "title") {
  return getTraditionalArt(artId);
}

export function renderSceneHero(artId = "title") {
  const el = document.getElementById("scene-hero");
  if (!el) return;
  if (!artId) {
    el.innerHTML = "";
    el.dataset.art = "";
    return;
  }
  el.innerHTML = getSceneArtHtml(artId);
  el.dataset.art = artId;
}

export function renderSystemHero(artId) {
  const el = document.getElementById("system-hero");
  if (!el) return;
  if (!artId) {
    el.innerHTML = "";
    el.dataset.art = "";
    return;
  }
  el.innerHTML = getSceneArtHtml(artId);
  el.dataset.art = artId;
}

export function getSystemMeta(systemId) {
  return SYSTEM_META[systemId] || SYSTEM_META.presence;
}

export function animateSceneText() {
  const body = document.getElementById("scene-body");
  if (!body) return;
  const nodes = body.querySelectorAll("p, blockquote, li, .ending-card, .dialogue-block");
  nodes.forEach((node, i) => {
    node.classList.add("reveal");
    node.style.animationDelay = `${0.08 + i * 0.12}s`;
  });
}

export function updatePeriodProgress(period) {
  const bar = document.getElementById("period-progress");
  if (!bar) return;
  bar.querySelectorAll(".period-dot").forEach((dot) => {
    const p = Number(dot.dataset.period);
    dot.classList.toggle("active", p === period);
    dot.classList.toggle("past", p < period);
  });
}
