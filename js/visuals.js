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
};

const SCENE_ART = {
  title: () => artHorizonGate(true),
  garden: () => artGarden(),
  festival: () => artFestival(),
  gate: () => artHorizonGate(false),
  horizon: () => artShipyard(),
  palimpsest: () => artPalimpsest(),
  atelier: () => artAtelier(),
  covenant: () => artCovenant(),
  deliberation: () => artCouncil(),
  ending: () => artEnding(),
  refusal: () => artPaths(),
  mosaic: () => artMosaic(),
  chorus: () => artChorus(),
};

const SYSTEM_META = {
  presence: { badge: "プレゼンス", mood: "cosmos", art: "gate" },
  embodied: { badge: "身体的実践", mood: "mars", art: "atelier" },
  vows: { badge: "誓約", mood: "vow", art: "atelier" },
  covenant: { badge: "コヴナント", mood: "law", art: "covenant" },
  reasons: { badge: "理由の地図", mood: "council", art: "deliberation" },
  charter: { badge: "出発憲章", mood: "finale", art: "ending" },
};

let canvas, ctx, stars = [], rafId = null;

export function initAmbience() {
  canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;
  ctx = canvas.getContext("2d");
  resizeCanvas();
  stars = Array.from({ length: 120 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.4 + 0.2,
    a: Math.random() * 0.5 + 0.15,
    s: Math.random() * 0.0003 + 0.00005,
  }));
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
  ctx.clearRect(0, 0, w, h);
  const accent = getComputedStyle(document.body).getPropertyValue("--mood-accent").trim() || "#6ec8e8";

  stars.forEach((star) => {
    star.y -= star.s;
    if (star.y < 0) star.y = 1;
    ctx.beginPath();
    ctx.fillStyle = accent;
    ctx.globalAlpha = star.a * (0.6 + Math.sin(Date.now() * 0.001 + star.x * 10) * 0.4);
    ctx.arc(star.x * w, star.y * h, star.r * devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  rafId = requestAnimationFrame(tick);
}

export function setMood(moodId = "cosmos") {
  const mood = MOODS[moodId] || MOODS.cosmos;
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
  return "cosmos";
}

export function getSceneArtHtml(artId = "title") {
  const fn = SCENE_ART[artId] || SCENE_ART.title;
  return fn();
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

function artHorizonGate(isTitle) {
  return `
    <svg viewBox="0 0 400 220" class="scene-svg" aria-hidden="true">
      <defs>
        <radialGradient id="gateGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="var(--mood-accent)" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="var(--mood-accent)" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="var(--mood-accent)" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#f0e6c8" stop-opacity="0.4"/>
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="110" rx="90" ry="90" fill="url(#gateGlow)" class="pulse"/>
      <ellipse cx="200" cy="110" rx="58" ry="58" fill="none" stroke="url(#ringGrad)" stroke-width="2.5" class="spin-slow"/>
      <ellipse cx="200" cy="110" rx="38" ry="38" fill="none" stroke="var(--mood-accent)" stroke-width="1.5" stroke-opacity="0.6"/>
      <circle cx="200" cy="110" r="6" fill="#fff" fill-opacity="0.9"/>
      ${isTitle ? `<text x="200" y="198" text-anchor="middle" fill="var(--mood-accent)" font-size="11" letter-spacing="6" opacity="0.7">HORIZON GATE</text>` : ""}
    </svg>`;
}

function artGarden() {
  return `
    <svg viewBox="0 0 400 220" class="scene-svg" aria-hidden="true">
      <defs>
        <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--mood-accent)" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="var(--mood-accent)" stop-opacity="0.45"/>
        </linearGradient>
      </defs>
      <path d="M0 140 Q100 120 200 130 T400 125 L400 220 L0 220 Z" fill="url(#seaGrad)"/>
      <path d="M0 155 Q80 145 160 150 T320 148 T400 152 L400 220 L0 220 Z" fill="var(--mood-accent)" fill-opacity="0.12"/>
      <circle cx="80" cy="90" r="28" fill="var(--mood-accent)" fill-opacity="0.2"/>
      <circle cx="320" cy="70" r="18" fill="#f0e6c8" fill-opacity="0.15"/>
      <path d="M60 140 Q65 90 80 110 Q95 90 100 140" stroke="var(--mood-accent)" stroke-width="2" fill="none" opacity="0.5"/>
      <path d="M300 145 Q305 95 318 115 Q331 95 336 145" stroke="var(--mood-accent)" stroke-width="2" fill="none" opacity="0.5"/>
    </svg>`;
}

function artFestival() {
  return `
    <svg viewBox="0 0 400 220" class="scene-svg" aria-hidden="true">
      <line x1="50" y1="30" x2="350" y2="160" stroke="var(--mood-accent)" stroke-width="1" opacity="0.25" class="float"/>
      <line x1="120" y1="20" x2="280" y2="180" stroke="#f0e6c8" stroke-width="1" opacity="0.2" class="float delay"/>
      <line x1="200" y1="10" x2="200" y2="190" stroke="var(--mood-accent)" stroke-width="1" opacity="0.15"/>
      <circle cx="100" cy="80" r="4" fill="var(--mood-accent)" class="pulse"/>
      <circle cx="200" cy="55" r="5" fill="#f0e6c8" class="pulse delay"/>
      <circle cx="300" cy="90" r="4" fill="var(--mood-accent)" class="pulse"/>
      <path d="M0 170 Q200 140 400 165 L400 220 L0 220 Z" fill="var(--mood-accent)" fill-opacity="0.1"/>
    </svg>`;
}

function artShipyard() {
  return `
    <svg viewBox="0 0 400 220" class="scene-svg" aria-hidden="true">
      <ellipse cx="200" cy="180" rx="160" ry="18" fill="none" stroke="var(--mood-accent)" stroke-opacity="0.25" stroke-width="1"/>
      <path d="M140 170 L200 60 L260 170 Z" fill="none" stroke="var(--mood-accent)" stroke-width="1.5" opacity="0.6"/>
      <rect x="188" y="55" width="24" height="115" fill="var(--mood-accent)" fill-opacity="0.15" stroke="var(--mood-accent)" stroke-width="1"/>
      <circle cx="200" cy="110" r="22" fill="none" stroke="#f0e6c8" stroke-width="1" stroke-opacity="0.5" class="spin-slow"/>
    </svg>`;
}

function artPalimpsest() {
  return `
    <svg viewBox="0 0 400 220" class="scene-svg" aria-hidden="true">
      ${[0, 1, 2, 3].map((i) => `
        <rect x="${120 + i * 14}" y="${50 + i * 8}" width="120" height="140" rx="4"
          fill="none" stroke="var(--mood-accent)" stroke-opacity="${0.2 + i * 0.12}" stroke-width="1"
          transform="rotate(${-6 + i * 4} 180 120)"/>`).join("")}
      <line x1="150" y1="90" x2="250" y2="90" stroke="var(--mood-accent)" stroke-opacity="0.3"/>
      <line x1="145" y1="110" x2="255" y2="110" stroke="var(--mood-accent)" stroke-opacity="0.2"/>
      <line x1="155" y1="130" x2="240" y2="130" stroke="var(--mood-accent)" stroke-opacity="0.15"/>
    </svg>`;
}

function artAtelier() {
  return `
    <svg viewBox="0 0 400 220" class="scene-svg" aria-hidden="true">
      <rect x="60" y="40" width="280" height="160" fill="none" stroke="var(--mood-accent)" stroke-opacity="0.25"/>
      <path d="M60 120 H340" stroke="var(--mood-accent)" stroke-opacity="0.15"/>
      <path d="M200 40 V200" stroke="var(--mood-accent)" stroke-opacity="0.15"/>
      <circle cx="130" cy="85" r="22" fill="var(--mood-accent)" fill-opacity="0.12" stroke="var(--mood-accent)" stroke-opacity="0.4"/>
      <path d="M250 150 L270 110 L290 150 L310 95 L330 150" fill="none" stroke="#f0e6c8" stroke-width="2" opacity="0.5"/>
    </svg>`;
}

function artCovenant() {
  return `
    <svg viewBox="0 0 400 220" class="scene-svg" aria-hidden="true">
      <rect x="110" y="35" width="180" height="150" rx="6" fill="none" stroke="var(--mood-accent)" stroke-opacity="0.35"/>
      ${[0, 1, 2, 3, 4].map((i) => `
        <line x1="130" y1="${65 + i * 22}" x2="270" y2="${65 + i * 22}" stroke="var(--mood-accent)" stroke-opacity="${0.15 + (i % 2) * 0.1}"/>`).join("")}
      <path d="M290 170 L310 150 L330 170 L350 145" fill="none" stroke="#f0e6c8" stroke-width="1.5" opacity="0.45"/>
    </svg>`;
}

function artCouncil() {
  return `
    <svg viewBox="0 0 400 220" class="scene-svg" aria-hidden="true">
      <ellipse cx="200" cy="165" rx="130" ry="28" fill="none" stroke="var(--mood-accent)" stroke-opacity="0.2"/>
      ${[-60, -20, 20, 60].map((x) => `
        <circle cx="${200 + x}" cy="130" r="14" fill="var(--mood-accent)" fill-opacity="0.12" stroke="var(--mood-accent)" stroke-opacity="0.35"/>`).join("")}
      <circle cx="200" cy="95" r="18" fill="var(--mood-accent)" fill-opacity="0.2" stroke="#f0e6c8" stroke-opacity="0.5"/>
    </svg>`;
}

function artEnding() {
  return `
    <svg viewBox="0 0 400 220" class="scene-svg" aria-hidden="true">
      <defs>
        <radialGradient id="endingGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="var(--mood-accent)" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="var(--mood-accent)" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <path d="M0 180 Q200 120 400 160" fill="none" stroke="var(--mood-accent)" stroke-width="2" opacity="0.35"/>
      <circle cx="200" cy="100" r="40" fill="url(#endingGlow)" class="pulse"/>
      <path d="M200 60 L200 140 M160 100 L240 100" stroke="#f0e6c8" stroke-width="1" opacity="0.35"/>
      ${[0, 1, 2, 3, 4].map((i) => `
        <circle cx="${80 + i * 60}" cy="${150 - (i % 2) * 20}" r="2.5" fill="var(--mood-accent)" opacity="0.5"/>`).join("")}
    </svg>`;
}

function artPaths() {
  return `
    <svg viewBox="0 0 400 220" class="scene-svg" aria-hidden="true">
      <path d="M60 170 Q140 80 200 120 T340 70" fill="none" stroke="var(--mood-accent)" stroke-width="1.5" opacity="0.35" stroke-dasharray="6 8"/>
      <path d="M60 170 Q160 140 200 120 T320 150" fill="none" stroke="#f0e6c8" stroke-width="1" opacity="0.25" stroke-dasharray="4 10"/>
      <circle cx="200" cy="120" r="8" fill="var(--mood-accent)" fill-opacity="0.5"/>
    </svg>`;
}

function artMosaic() {
  return `
    <svg viewBox="0 0 400 220" class="scene-svg" aria-hidden="true">
      <circle cx="200" cy="110" r="55" fill="none" stroke="var(--mood-accent)" stroke-width="1" opacity="0.25"/>
      ${[[140,80],[260,80],[200,160],[120,130],[280,130]].map(([x,y]) => `
        <circle cx="${x}" cy="${y}" r="8" fill="var(--mood-accent)" fill-opacity="0.35"/>
        <line x1="${x}" y1="${y}" x2="200" y2="110" stroke="var(--mood-accent)" stroke-width="0.8" opacity="0.3"/>
      `).join("")}
      <circle cx="200" cy="110" r="12" fill="var(--mood-accent)" fill-opacity="0.5" class="pulse"/>
    </svg>`;
}

function artChorus() {
  return `
    <svg viewBox="0 0 400 220" class="scene-svg" aria-hidden="true">
      <ellipse cx="200" cy="120" rx="120" ry="60" fill="none" stroke="var(--mood-accent)" stroke-width="1" opacity="0.2"/>
      <circle cx="140" cy="100" r="28" fill="none" stroke="var(--mood-accent)" stroke-width="1.2" opacity="0.45" class="float"/>
      <circle cx="260" cy="100" r="28" fill="none" stroke="var(--mood-accent)" stroke-width="1.2" opacity="0.45" class="float delay"/>
      <circle cx="200" cy="130" r="28" fill="none" stroke="var(--mood-accent)" stroke-width="1.2" opacity="0.45" class="pulse"/>
      <path d="M140 100 Q170 115 200 130 Q230 115 260 100" fill="none" stroke="var(--mood-accent)" stroke-width="0.8" opacity="0.35"/>
    </svg>`;
}
