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
