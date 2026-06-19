const NPCS = {
  aster: {
    name: "アスター",
    role: "出発派・哲学者 / ホライズン",
    color: "#6ec8e8",
  },
  sen: {
    name: "セン",
    role: "記憶管理者 / パリンプセスト",
    color: "#a8a0e8",
  },
  soli: {
    name: "ソリ",
    role: "音楽家 / アトリエ",
    color: "#e8926a",
  },
  child: {
    name: "子ども代表",
    role: "未来人の声",
    color: "#7ecf9a",
  },
  lin: {
    name: "リン",
    role: "記録職 / パリンプセスト",
    color: "#8ab4d4",
  },
  kaede: {
    name: "カエデ",
    role: "モザイク設計者 / 全域",
    color: "#c4a0e8",
  },
  haru: {
    name: "ハル",
    role: "庭師 / コモン・ガーデン",
    color: "#7ecf9a",
  },
  io: {
    name: "イオ",
    role: "案内人 / コーラス",
    color: "#e8a8c8",
  },
  nagi: {
    name: "ナギ",
    role: "深層探査 / アビス",
    color: "#5ec8d8",
  },
};

function portraitSvg(id) {
  const npc = NPCS[id];
  if (!npc) return "";

  const art = {
    aster: `
      <circle cx="50" cy="38" r="18" fill="${npc.color}" opacity="0.15"/>
      <ellipse cx="50" cy="36" rx="14" ry="16" fill="none" stroke="${npc.color}" stroke-width="1.5"/>
      <path d="M35 58 Q50 48 65 58" fill="none" stroke="${npc.color}" stroke-width="1.2" opacity="0.7"/>
      <line x1="50" y1="54" x2="50" y2="78" stroke="${npc.color}" stroke-width="1.5"/>
      <path d="M50 78 L38 95 M50 78 L62 95" stroke="${npc.color}" stroke-width="1.5" fill="none"/>
      <circle cx="44" cy="34" r="1.5" fill="${npc.color}"/>
      <circle cx="56" cy="34" r="1.5" fill="${npc.color}"/>
    `,
    sen: `
      <rect x="34" y="28" width="32" height="40" rx="4" fill="none" stroke="${npc.color}" stroke-width="1.2" opacity="0.5"/>
      <rect x="38" y="32" width="24" height="32" rx="2" fill="${npc.color}" opacity="0.08"/>
      <line x1="42" y1="40" x2="58" y2="40" stroke="${npc.color}" stroke-width="1" opacity="0.4"/>
      <line x1="42" y1="48" x2="56" y2="48" stroke="${npc.color}" stroke-width="1" opacity="0.3"/>
      <line x1="42" y1="56" x2="54" y2="56" stroke="${npc.color}" stroke-width="1" opacity="0.2"/>
      <circle cx="50" cy="22" r="10" fill="none" stroke="${npc.color}" stroke-width="1.2"/>
    `,
    soli: `
      <circle cx="50" cy="35" r="13" fill="none" stroke="${npc.color}" stroke-width="1.5"/>
      <path d="M28 88 Q50 60 72 88" fill="none" stroke="${npc.color}" stroke-width="1.5"/>
      <path d="M22 70 Q34 62 40 75" fill="none" stroke="${npc.color}" stroke-width="1.2" opacity="0.6"/>
      <path d="M78 70 Q66 62 60 75" fill="none" stroke="${npc.color}" stroke-width="1.2" opacity="0.6"/>
      <line x1="50" y1="48" x2="50" y2="68" stroke="${npc.color}" stroke-width="1.2"/>
    `,
    child: `
      <circle cx="50" cy="40" r="12" fill="none" stroke="${npc.color}" stroke-width="1.5"/>
      <circle cx="50" cy="72" r="16" fill="none" stroke="${npc.color}" stroke-width="1.2" opacity="0.6"/>
      <circle cx="38" cy="38" r="2" fill="${npc.color}" opacity="0.8"/>
      <circle cx="62" cy="38" r="2" fill="${npc.color}" opacity="0.8"/>
    `,
    lin: `
      <rect x="38" y="30" width="24" height="32" rx="2" fill="none" stroke="${npc.color}" stroke-width="1.2"/>
      <line x1="42" y1="38" x2="58" y2="38" stroke="${npc.color}" stroke-width="1" opacity="0.5"/>
      <line x1="42" y1="46" x2="55" y2="46" stroke="${npc.color}" stroke-width="1" opacity="0.35"/>
      <circle cx="50" cy="24" r="9" fill="none" stroke="${npc.color}" stroke-width="1.2"/>
      <path d="M30 75 L50 58 L70 75" fill="none" stroke="${npc.color}" stroke-width="1" opacity="0.4"/>
    `,
    kaede: `
      <circle cx="50" cy="50" r="28" fill="none" stroke="${npc.color}" stroke-width="1" opacity="0.35"/>
      <circle cx="35" cy="40" r="5" fill="${npc.color}" opacity="0.4"/>
      <circle cx="65" cy="40" r="5" fill="${npc.color}" opacity="0.4"/>
      <circle cx="50" cy="65" r="5" fill="${npc.color}" opacity="0.4"/>
      <circle cx="50" cy="50" r="4" fill="${npc.color}" opacity="0.8"/>
      <line x1="35" y1="40" x2="50" y2="50" stroke="${npc.color}" stroke-width="0.8" opacity="0.5"/>
      <line x1="65" y1="40" x2="50" y2="50" stroke="${npc.color}" stroke-width="0.8" opacity="0.5"/>
      <line x1="50" y1="65" x2="50" y2="50" stroke="${npc.color}" stroke-width="0.8" opacity="0.5"/>
    `,
    haru: `
      <path d="M30 85 Q50 45 70 85" fill="none" stroke="${npc.color}" stroke-width="1.5"/>
      <path d="M42 85 L42 55 Q50 48 58 55 L58 85" fill="none" stroke="${npc.color}" stroke-width="1.2"/>
      <circle cx="50" cy="38" r="10" fill="none" stroke="${npc.color}" stroke-width="1.2"/>
      <path d="M25 70 Q35 60 45 70" fill="none" stroke="${npc.color}" stroke-width="0.8" opacity="0.5"/>
      <path d="M55 70 Q65 60 75 70" fill="none" stroke="${npc.color}" stroke-width="0.8" opacity="0.5"/>
    `,
    io: `
      <circle cx="38" cy="42" r="14" fill="none" stroke="${npc.color}" stroke-width="1" opacity="0.45"/>
      <circle cx="62" cy="42" r="14" fill="none" stroke="${npc.color}" stroke-width="1" opacity="0.45"/>
      <circle cx="50" cy="58" r="14" fill="none" stroke="${npc.color}" stroke-width="1" opacity="0.45"/>
      <circle cx="50" cy="50" r="6" fill="${npc.color}" opacity="0.35"/>
      <path d="M38 42 Q44 46 50 50 Q56 46 62 42" fill="none" stroke="${npc.color}" stroke-width="0.8" opacity="0.5"/>
      <path d="M38 42 Q44 54 50 58 Q56 54 62 42" fill="none" stroke="${npc.color}" stroke-width="0.8" opacity="0.5"/>
    `,
    nagi: `
      <path d="M20 75 Q50 20 80 75" fill="none" stroke="${npc.color}" stroke-width="1.2"/>
      <path d="M35 75 L35 45 L50 30 L65 45 L65 75" fill="none" stroke="${npc.color}" stroke-width="1.2"/>
      <circle cx="50" cy="28" r="8" fill="none" stroke="${npc.color}" stroke-width="1.2"/>
      <path d="M42 55 L58 55" stroke="${npc.color}" stroke-width="0.8" opacity="0.5"/>
    `,
  };

  return `
    <svg viewBox="0 0 100 100" class="portrait-svg" aria-hidden="true">
      ${art[id] || ""}
    </svg>`;
}

export function getPortraitHtml(id, size = "md") {
  const npc = NPCS[id];
  if (!npc) return "";
  return `
    <div class="portrait portrait-${size}" style="--npc-color:${npc.color}">
      <div class="portrait-frame">${portraitSvg(id)}</div>
    </div>`;
}

export function say(npcId, text) {
  const npc = NPCS[npcId];
  if (!npc) return `<blockquote>${text}</blockquote>`;
  return `
    <div class="dialogue-block" style="--npc-color:${npc.color}">
      ${getPortraitHtml(npcId, "sm")}
      <div class="dialogue-content">
        <div class="dialogue-meta">
          <span class="dialogue-name">${npc.name}</span>
          <span class="dialogue-role">${npc.role}</span>
        </div>
        <blockquote>${text}</blockquote>
      </div>
    </div>`;
}

export function renderSpeakerStrip(npcId) {
  const el = document.getElementById("speaker-strip");
  if (!el) return;
  if (!npcId || !NPCS[npcId]) {
    el.hidden = true;
    el.innerHTML = "";
    return;
  }
  const npc = NPCS[npcId];
  el.hidden = false;
  el.innerHTML = `
    ${getPortraitHtml(npcId, "lg")}
    <div class="speaker-info">
      <span class="speaker-name">${npc.name}</span>
      <span class="speaker-role">${npc.role}</span>
    </div>`;
  el.style.setProperty("--npc-color", npc.color);
}

export function miniPortrait(id) {
  return getPortraitHtml(id, "xs");
}

export { NPCS };
