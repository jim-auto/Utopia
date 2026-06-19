/**
 * 伝統画 — 掛軸・水墨・金泥を意識した SVG シーンアート
 */

let artUid = 0;

function uid() {
  artUid += 1;
  return `ta${artUid}`;
}

function wrapArt(id, inner) {
  return `
    <svg viewBox="0 0 400 240" class="scene-svg scene-svg-traditional" aria-hidden="true" data-art="${id}">
      <defs>
        <filter id="ink-${id}" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <linearGradient id="paper-${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f4ecd8" stop-opacity="0.07"/>
          <stop offset="50%" stop-color="#e8dcc4" stop-opacity="0.04"/>
          <stop offset="100%" stop-color="#d8c8a8" stop-opacity="0.06"/>
        </linearGradient>
        <linearGradient id="ink-${id}-wash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--mood-accent)" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="var(--mood-accent)" stop-opacity="0.05"/>
        </linearGradient>
        <linearGradient id="gold-${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f0e6c8"/>
          <stop offset="45%" stop-color="#e8c068"/>
          <stop offset="100%" stop-color="#c8a040"/>
        </linearGradient>
        <radialGradient id="mist-${id}" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stop-color="var(--mood-accent)" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="var(--mood-accent)" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect x="8" y="12" width="384" height="216" rx="4" fill="url(#paper-${id})" stroke="rgba(240,230,200,0.08)" stroke-width="1"/>
      <rect x="8" y="8" width="384" height="6" rx="2" fill="url(#gold-${id})" opacity="0.35"/>
      <rect x="8" y="226" width="384" height="6" rx="2" fill="url(#gold-${id})" opacity="0.28"/>
      <ellipse cx="200" cy="210" rx="150" ry="40" fill="url(#mist-${id})"/>
      <g filter="url(#ink-${id})" opacity="0.92">${inner}</g>
      <g opacity="0.15" stroke="rgba(240,230,200,0.5)" stroke-width="0.5">
        <line x1="24" y1="28" x2="376" y2="28"/>
        <line x1="24" y1="212" x2="376" y2="212"/>
      </g>
    </svg>`;
}

function clouds(id, y = 55) {
  return [60, 160, 280]
    .map(
      (x, i) => `
      <path d="M${x - 22} ${y + 8} Q${x - 10} ${y - 6} ${x} ${y} Q${x + 12} ${y - 8} ${x + 24} ${y + 6} Q${x + 18} ${y + 14} ${x} ${y + 12} Q${x - 16} ${y + 16} ${x - 22} ${y + 8} Z"
        fill="none" stroke="var(--mood-accent)" stroke-width="1.2" stroke-opacity="${0.18 + i * 0.06}" class="float${i ? " delay" : ""}"/>`
    )
    .join("");
}

function mountains(id, baseY = 155) {
  return `
    <path d="M0 ${baseY} L70 ${baseY - 45} L130 ${baseY} L200 ${baseY - 62} L270 ${baseY - 28} L340 ${baseY - 50} L400 ${baseY - 18} L400 ${baseY + 40} L0 ${baseY + 40} Z"
      fill="url(#ink-${id}-wash)" opacity="0.35"/>
    <path d="M0 ${baseY + 8} L90 ${baseY - 22} L180 ${baseY + 5} L260 ${baseY - 35} L400 ${baseY - 5} L400 ${baseY + 40} L0 ${baseY + 40} Z"
      fill="var(--mood-accent)" fill-opacity="0.08" stroke="var(--mood-accent)" stroke-width="0.8" stroke-opacity="0.2"/>`;
}

function artHorizonGate(isTitle) {
  const id = uid();
  return wrapArt(
    "gate",
    `
    ${clouds(id, 48)}
    ${mountains(id, 148)}
    <ellipse cx="200" cy="108" rx="72" ry="72" fill="var(--mood-accent)" fill-opacity="0.08"/>
    <ellipse cx="200" cy="108" rx="58" ry="58" fill="none" stroke="url(#gold-${id})" stroke-width="2" class="spin-slow"/>
    <ellipse cx="200" cy="108" rx="38" ry="38" fill="none" stroke="var(--mood-accent)" stroke-width="1.5" stroke-opacity="0.65"/>
    <circle cx="200" cy="108" r="5" fill="#fff" fill-opacity="0.92"/>
    <path d="M200 36 L200 52 M200 164 L200 180 M124 108 L108 108 M276 108 L292 108" stroke="url(#gold-${id})" stroke-width="1" opacity="0.45"/>
    ${isTitle ? `<text x="200" y="200" text-anchor="middle" fill="url(#gold-${id})" font-size="10" letter-spacing="5" opacity="0.75" font-family="serif">HORIZON GATE</text>` : ""}`
  );
}

function artGarden() {
  const id = uid();
  return wrapArt(
    "garden",
    `
    ${clouds(id, 42)}
    ${mountains(id, 152)}
    <path d="M0 168 Q120 148 200 158 T400 152 L400 240 L0 240 Z" fill="var(--mood-accent)" fill-opacity="0.14"/>
    <path d="M168 168 L176 118 L184 168 Z" fill="var(--mood-accent)" fill-opacity="0.25"/>
    <path d="M176 118 L200 92 L224 118 Z" fill="none" stroke="var(--mood-accent)" stroke-width="1.5" opacity="0.5"/>
    <path d="M52 168 Q58 108 72 128 Q86 100 96 168" stroke="var(--mood-accent)" stroke-width="2" fill="none" opacity="0.45"/>
    <path d="M310 168 Q318 98 332 118 Q346 88 352 168" stroke="var(--mood-accent)" stroke-width="2" fill="none" opacity="0.45"/>
    <circle cx="320" cy="72" r="16" fill="url(#gold-${id})" fill-opacity="0.35"/>
    <path d="M140 168 L140 138 L160 168 M140 148 L120 148" stroke="url(#gold-${id})" stroke-width="1.2" opacity="0.5"/>`
  );
}

function artFestival() {
  const id = uid();
  return wrapArt(
    "festival",
    `
    ${clouds(id, 38)}
    <path d="M0 178 Q200 148 400 172 L400 240 L0 240 Z" fill="var(--mood-accent)" fill-opacity="0.1"/>
    ${[80, 160, 240, 320].map(
      (x, i) => `
      <line x1="${x}" y1="175" x2="${x}" y2="${118 - (i % 2) * 12}" stroke="var(--mood-accent)" stroke-width="1" opacity="0.35"/>
      <path d="M${x - 14} ${118 - (i % 2) * 12} Q${x} ${100 - (i % 2) * 8} ${x + 14} ${118 - (i % 2) * 12}" fill="var(--mood-accent)" fill-opacity="0.2" stroke="url(#gold-${id})" stroke-width="0.8" opacity="0.6" class="float${i % 2 ? " delay" : ""}"/>`
    ).join("")}
    ${[100, 200, 300].map(
      (x, i) => `<circle cx="${x}" cy="${72 + i * 8}" r="3.5" fill="url(#gold-${id})" class="pulse${i ? " delay" : ""}"/>`
    ).join("")}`
  );
}

function artShipyard() {
  const id = uid();
  return wrapArt(
    "horizon",
    `
    ${clouds(id, 50)}
    ${mountains(id, 150)}
    <ellipse cx="200" cy="178" rx="150" ry="16" fill="none" stroke="var(--mood-accent)" stroke-opacity="0.22" stroke-width="1"/>
    <path d="M148 172 L200 58 L252 172 Z" fill="none" stroke="url(#gold-${id})" stroke-width="1.6" opacity="0.65"/>
    <rect x="188" y="52" width="24" height="118" fill="var(--mood-accent)" fill-opacity="0.12" stroke="var(--mood-accent)" stroke-width="1"/>
    <circle cx="200" cy="108" r="20" fill="none" stroke="url(#gold-${id})" stroke-width="1.2" stroke-opacity="0.55" class="spin-slow"/>
    <path d="M120 172 L280 172" stroke="var(--mood-accent)" stroke-width="0.8" stroke-dasharray="4 6" opacity="0.3"/>`
  );
}

function artPalimpsest() {
  const id = uid();
  return wrapArt(
    "palimpsest",
    `
    ${[0, 1, 2, 3].map(
      (i) => `
      <rect x="${118 + i * 14}" y="${46 + i * 8}" width="124" height="148" rx="3"
        fill="rgba(255,255,255,0.02)" stroke="var(--mood-accent)" stroke-opacity="${0.22 + i * 0.1}" stroke-width="1"
        transform="rotate(${-8 + i * 5} 180 120)"/>
      ${[0, 1, 2].map(
        (j) =>
          `<line x1="${138 + i * 14}" y1="${78 + j * 28 + i * 4}" x2="${248 + i * 4}" y2="${78 + j * 28 + i * 4}" stroke="var(--mood-accent)" stroke-opacity="${0.12 + j * 0.06}"/>`
      ).join("")}`
    ).join("")}
    <circle cx="200" cy="118" r="22" fill="none" stroke="url(#gold-${id})" stroke-width="1" opacity="0.45" class="pulse"/>`
  );
}

function artAtelier() {
  const id = uid();
  return wrapArt(
    "atelier",
    `
    ${mountains(id, 156)}
    <path d="M48 188 Q200 48 352 188" fill="none" stroke="var(--mood-accent)" stroke-width="1.2" stroke-opacity="0.35"/>
    <path d="M72 188 Q200 72 328 188" fill="var(--mood-accent)" fill-opacity="0.06" stroke="var(--mood-accent)" stroke-width="0.8" stroke-opacity="0.25"/>
    <rect x="88" y="118" width="224" height="70" fill="none" stroke="url(#gold-${id})" stroke-width="1" opacity="0.4"/>
    <path d="M248 158 L268 118 L288 158 L308 102 L328 158" fill="none" stroke="url(#gold-${id})" stroke-width="2" opacity="0.55"/>
    <circle cx="132" cy="92" r="20" fill="var(--mood-accent)" fill-opacity="0.1" stroke="var(--mood-accent)" stroke-opacity="0.4"/>
    <path d="M88 118 Q200 98 312 118" stroke="var(--mood-accent)" stroke-width="0.8" opacity="0.2"/>`
  );
}

function artCovenant() {
  const id = uid();
  return wrapArt(
    "covenant",
    `
    <rect x="108" y="42" width="184" height="156" rx="4" fill="rgba(255,255,255,0.02)" stroke="url(#gold-${id})" stroke-width="1.2" stroke-opacity="0.45"/>
    ${[0, 1, 2, 3, 4, 5].map(
      (i) =>
        `<line x1="128" y1="${68 + i * 20}" x2="272" y2="${68 + i * 20}" stroke="var(--mood-accent)" stroke-opacity="${0.14 + (i % 2) * 0.08}"/>`
    ).join("")}
    <path d="M288 172 L308 152 L328 172 L348 138" fill="none" stroke="url(#gold-${id})" stroke-width="1.5" opacity="0.5"/>
    <circle cx="200" cy="118" r="8" fill="var(--mood-accent)" fill-opacity="0.25" stroke="url(#gold-${id})" stroke-width="0.8"/>`
  );
}

function artCouncil() {
  const id = uid();
  return wrapArt(
    "council",
    `
    ${clouds(id, 44)}
    <ellipse cx="200" cy="168" rx="128" ry="26" fill="none" stroke="url(#gold-${id})" stroke-width="1" stroke-opacity="0.35"/>
    ${[-72, -24, 24, 72].map(
      (x) => `
      <circle cx="${200 + x}" cy="128" r="13" fill="var(--mood-accent)" fill-opacity="0.1" stroke="var(--mood-accent)" stroke-opacity="0.35"/>
      <line x1="${200 + x}" y1="141" x2="200" y2="158" stroke="var(--mood-accent)" stroke-width="0.6" opacity="0.2"/>`
    ).join("")}
    <circle cx="200" cy="92" r="16" fill="var(--mood-accent)" fill-opacity="0.18" stroke="url(#gold-${id})" stroke-width="1.2" stroke-opacity="0.55"/>`
  );
}

function artEnding() {
  const id = uid();
  return wrapArt(
    "ending",
    `
    ${clouds(id, 40)}
    ${mountains(id, 154)}
    <path d="M0 182 Q200 118 400 158" fill="none" stroke="url(#gold-${id})" stroke-width="2" opacity="0.4"/>
    <circle cx="200" cy="98" r="36" fill="var(--mood-accent)" fill-opacity="0.12" stroke="url(#gold-${id})" stroke-width="1.2" class="pulse"/>
    <path d="M200 62 L200 134 M162 98 L238 98" stroke="url(#gold-${id})" stroke-width="1" opacity="0.4"/>
    ${[0, 1, 2, 3, 4].map(
      (i) =>
        `<circle cx="${72 + i * 64}" cy="${148 - (i % 2) * 18}" r="2.5" fill="url(#gold-${id})" opacity="0.55"/>`
    ).join("")}`
  );
}

function artPaths() {
  const id = uid();
  return wrapArt(
    "refusal",
    `
    ${clouds(id, 52)}
    <path d="M52 172 Q132 82 200 122 T348 72" fill="none" stroke="var(--mood-accent)" stroke-width="1.6" opacity="0.38" stroke-dasharray="6 8"/>
    <path d="M52 172 Q162 142 200 122 T324 152" fill="none" stroke="url(#gold-${id})" stroke-width="1" opacity="0.35" stroke-dasharray="4 10"/>
    <circle cx="200" cy="122" r="9" fill="var(--mood-accent)" fill-opacity="0.45" stroke="url(#gold-${id})" stroke-width="1"/>`
  );
}

function artMosaic() {
  const id = uid();
  return wrapArt(
    "mosaic",
    `
    <circle cx="200" cy="112" r="52" fill="none" stroke="url(#gold-${id})" stroke-width="1" stroke-opacity="0.35"/>
    ${[
      [138, 78],
      [262, 78],
      [200, 162],
      [118, 128],
      [282, 128],
    ]
      .map(
        ([x, y]) => `
      <circle cx="${x}" cy="${y}" r="7" fill="var(--mood-accent)" fill-opacity="0.35"/>
      <line x1="${x}" y1="${y}" x2="200" y2="112" stroke="var(--mood-accent)" stroke-width="0.8" opacity="0.28"/>`
      )
      .join("")}
    <circle cx="200" cy="112" r="11" fill="var(--mood-accent)" fill-opacity="0.45" stroke="url(#gold-${id})" stroke-width="1" class="pulse"/>`
  );
}

function artChorus() {
  const id = uid();
  return wrapArt(
    "chorus",
    `
    ${clouds(id, 46)}
    <ellipse cx="200" cy="118" rx="118" ry="58" fill="none" stroke="var(--mood-accent)" stroke-width="1" stroke-opacity="0.22"/>
    <circle cx="138" cy="98" r="26" fill="none" stroke="var(--mood-accent)" stroke-width="1.2" stroke-opacity="0.45" class="float"/>
    <circle cx="262" cy="98" r="26" fill="none" stroke="var(--mood-accent)" stroke-width="1.2" stroke-opacity="0.45" class="float delay"/>
    <circle cx="200" cy="128" r="26" fill="none" stroke="url(#gold-${id})" stroke-width="1.2" stroke-opacity="0.5" class="pulse"/>
    <path d="M138 98 Q168 112 200 128 Q232 112 262 98" fill="none" stroke="var(--mood-accent)" stroke-width="0.9" opacity="0.35"/>`
  );
}

function artAbyss() {
  const id = uid();
  return wrapArt(
    "abyss",
    `
    ${mountains(id, 148)}
    <path d="M148 178 Q200 88 252 178" fill="var(--mood-accent)" fill-opacity="0.08" stroke="var(--mood-accent)" stroke-width="1" stroke-opacity="0.35"/>
    <ellipse cx="200" cy="148" rx="48" ry="18" fill="#020608" fill-opacity="0.5" stroke="var(--mood-accent)" stroke-width="1" stroke-opacity="0.4"/>
    ${[0, 1, 2, 3, 4, 5].map(
      (i) => `
      <line x1="${160 + i * 14}" y1="148" x2="${160 + i * 14}" y2="${118 + (i % 2) * 8}" stroke="var(--mood-accent)" stroke-width="1.2" stroke-opacity="0.45" class="pulse" style="animation-delay:${i * 0.25}s"/>`
    ).join("")}
    <circle cx="200" cy="108" r="6" fill="url(#gold-${id})" fill-opacity="0.6"/>`
  );
}

const ART_MAP = {
  title: () => artHorizonGate(true),
  garden: artGarden,
  festival: artFestival,
  gate: () => artHorizonGate(false),
  horizon: artShipyard,
  palimpsest: artPalimpsest,
  atelier: artAtelier,
  covenant: artCovenant,
  deliberation: artCouncil,
  council: artCouncil,
  ending: artEnding,
  refusal: artPaths,
  mosaic: artMosaic,
  chorus: artChorus,
  abyss: artAbyss,
};

export function getTraditionalArt(artId = "title") {
  const fn = ART_MAP[artId] || ART_MAP.title;
  return fn();
}
