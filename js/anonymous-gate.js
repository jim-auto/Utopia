/**
 * SYS-07 — 匿名の境界（村の門）
 * 12ヶ月を匿名・透明・外部関係に配分する
 */

const TOTAL_MONTHS = 12;
const AXES = [
  { key: "anon", label: "匿名", desc: "名前と記録から守る時間" },
  { key: "open", label: "透明", desc: "内部の相互可視・共有" },
  { key: "border", label: "外部", desc: "訪問・接触・外界との関係" },
];

export function mountAnonymousGate(root, { onComplete, onSkip }) {
  if (!root) return { destroy() {} };

  const months = { anon: 6, open: 3, border: 3 };

  function remaining() {
    return TOTAL_MONTHS - (months.anon + months.open + months.border);
  }

  function describeProfile() {
    if (months.anon >= 7) {
      return {
        profile: "anonLead",
        lead: "匿名偏重——外部の視線を遮る設計。共同体は「見えない安心」を記録した。",
      };
    }
    if (months.open >= 6) {
      return {
        profile: "openLead",
        lead: "透明偏重——内部の相互可視が高い。匿名の緊張は和らいだが、漏洩も増えた。",
      };
    }
    if (months.border >= 6) {
      return {
        profile: "borderLead",
        lead: "外部偏重——訪問と接触の儀式が厚い。境界は porous になった。",
      };
    }
    return {
      profile: "gateBalanced",
      lead: "均衡型——三つの境界が混ざった。正解ではないが、続けられた。",
    };
  }

  function render() {
    const rem = remaining();
    root.innerHTML = `
      <div class="anon-gate">
        <p class="anon-lead">匿名の村——12ヶ月の試行を、匿名・透明・外部関係に配分せよ。</p>
        <div class="anon-bar" aria-hidden="true">
          ${AXES.map((a) => {
            const pct = (months[a.key] / TOTAL_MONTHS) * 100;
            return `<div class="anon-seg anon-seg-${a.key}" style="width:${pct}%"></div>`;
          }).join("")}
        </div>
        <div class="anon-axes">
          ${AXES.map(
            (a) => `
            <div class="anon-axis">
              <div class="anon-axis-head">
                <span class="anon-axis-label">${a.label}</span>
                <span class="anon-axis-val">${months[a.key]}ヶ月</span>
              </div>
              <p class="anon-axis-desc">${a.desc}</p>
              <div class="anon-stepper">
                <button type="button" class="anon-btn" data-action="dec" data-key="${a.key}">−1</button>
                <button type="button" class="anon-btn" data-action="inc" data-key="${a.key}">＋1</button>
              </div>
            </div>`
          ).join("")}
        </div>
        <p class="anon-remaining ${rem === 0 ? "anon-remaining-ok" : "anon-remaining-warn"}">
          残り: <b>${rem}</b> ヶ月 / ${TOTAL_MONTHS}ヶ月
        </p>
        <button type="button" class="btn btn-primary" id="anon-finish" ${rem !== 0 ? "disabled" : ""}>この境界で試行を始める</button>
        <button type="button" class="btn btn-choice anon-skip-btn" id="anon-skip">境界を設計せず条項だけ見届ける</button>
      </div>
    `;

    root.querySelectorAll(".anon-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.key;
        const rem = remaining();
        if (btn.dataset.action === "inc" && rem >= 1 && months[key] < 10) {
          months[key] += 1;
          render();
        } else if (btn.dataset.action === "dec" && months[key] >= 1) {
          months[key] -= 1;
          render();
        }
      });
    });

    root.querySelector("#anon-finish")?.addEventListener("click", () => {
      if (remaining() !== 0) return;
      const meta = describeProfile();
      onComplete?.({
        months: { ...months },
        ...meta,
        signature: `AN-${months.anon}${months.open}${months.border}`,
      });
    });

    root.querySelector("#anon-skip")?.addEventListener("click", () => onSkip?.());
  }

  render();
  return { destroy() {} };
}
