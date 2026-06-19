/**
 * SYS-07 — 共同親の輪（身体的・関係的実践）
 * 4つの養育責任を3つの共同親スロットに配分する
 */

const ROLES = [
  { key: "care", label: "養育", desc: "日常・情緒・安全" },
  { key: "time", label: "時間", desc: "プレゼンス・同行" },
  { key: "boundary", label: "境界", desc: "退出・自律の保障" },
  { key: "record", label: "記録", desc: "記憶・共同体との接続" },
];

const SLOTS = [
  { key: "self", label: "あなた" },
  { key: "sen", label: "セン" },
  { key: "haru", label: "ハル" },
];

export function mountCoParentWeave(root, { onComplete, onSkip }) {
  if (!root) return { destroy() {} };

  const assignments = {};
  let activeRole = ROLES[0].key;

  function countBySlot() {
    const counts = { self: 0, sen: 0, haru: 0 };
    Object.values(assignments).forEach((slot) => {
      if (counts[slot] !== undefined) counts[slot] += 1;
    });
    return counts;
  }

  function describeProfile() {
    const counts = Object.values(countBySlot());
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    if (max >= 3) {
      return {
        profile: "focused",
        lead: "一極集中型——一つの親に責任が集まった。共同体は「新しい特権」として記録した。",
      };
    }
    if (min >= 1 && max <= 2) {
      return {
        profile: "shared",
        lead: "分担型——責任が三つの親に分散した。血縁の代わりに、選んだ関係が機能した。",
      };
    }
    return {
      profile: "dispersed",
      lead: "分散型——誰も中心にならない輪。子ども代表は「それも一つの家族」と言った。",
    };
  }

  function render() {
    const done = ROLES.every((r) => assignments[r.key]);
    root.innerHTML = `
      <div class="coparent-weave">
        <p class="coparent-lead">共同親の輪——血縁ではなく、選んだ責任で家族を組む。4つの役割を3人に配分せよ。</p>
        <div class="coparent-ring" aria-hidden="true">
          ${SLOTS.map(
            (s, i) => `
            <div class="coparent-slot" data-slot="${s.key}" style="--i:${i}">
              <span class="coparent-slot-name">${s.label}</span>
              <span class="coparent-slot-count">${countBySlot()[s.key]}</span>
            </div>`
          ).join("")}
          <div class="coparent-ring-center">親の輪</div>
        </div>
        <div class="coparent-roles">
          ${ROLES.map(
            (r) => `
            <div class="coparent-role ${activeRole === r.key ? "active" : ""} ${assignments[r.key] ? "assigned" : ""}" data-role="${r.key}">
              <button type="button" class="coparent-role-btn">
                <span class="coparent-role-label">${r.label}</span>
                <span class="coparent-role-desc">${r.desc}</span>
                ${assignments[r.key] ? `<span class="coparent-assigned">→ ${SLOTS.find((s) => s.key === assignments[r.key])?.label}</span>` : ""}
              </button>
            </div>`
          ).join("")}
        </div>
        <p class="coparent-hint">役割を選び、共同親スロットへ配分する</p>
        <div class="coparent-slots-row">
          ${SLOTS.map(
            (s) => `
            <button type="button" class="btn btn-choice coparent-pick" data-slot="${s.key}">${s.label}へ</button>`
          ).join("")}
        </div>
        <button type="button" class="btn btn-primary" id="coparent-finish" ${done ? "" : "disabled"}>この輪で試行を始める</button>
        <button type="button" class="btn btn-choice coparent-skip-btn" id="coparent-skip">輪を組まず条項だけ見届ける</button>
      </div>
    `;

    root.querySelectorAll(".coparent-role-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        activeRole = e.currentTarget.closest(".coparent-role").dataset.role;
        render();
      });
    });

    root.querySelectorAll(".coparent-pick").forEach((btn) => {
      btn.addEventListener("click", () => {
        assignments[activeRole] = btn.dataset.slot;
        const next = ROLES.find((r) => !assignments[r.key]);
        activeRole = next?.key || activeRole;
        render();
      });
    });

    root.querySelector("#coparent-finish")?.addEventListener("click", () => {
      if (!ROLES.every((r) => assignments[r.key])) return;
      const meta = describeProfile();
      onComplete?.({
        assignments: { ...assignments },
        ...meta,
        signature: `CP-${Object.values(assignments).join("")}`,
      });
    });

    root.querySelector("#coparent-skip")?.addEventListener("click", () => onSkip?.());
  }

  render();
  return { destroy() {} };
}
