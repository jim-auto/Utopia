/**
 * SYS-07 — 老化の季節（有限の配分）
 * 20年を有限・安全技術・世代公平に配分する
 */

const TOTAL_YEARS = 20;
const AXES = [
  { key: "finite", label: "有限", desc: "老化を受け入れる身体の時間" },
  { key: "safety", label: "安全", desc: "医療介入・監視・技術的保護" },
  { key: "fair", label: "公平", desc: "世代間のコストと負担の分担" },
];

export function mountAgingSeason(root, { onComplete, onSkip }) {
  if (!root) return { destroy() {} };

  const years = { finite: 12, safety: 4, fair: 4 };

  function remaining() {
    return TOTAL_YEARS - (years.finite + years.safety + years.fair);
  }

  function describeProfile() {
    if (years.finite >= 14) {
      return {
        profile: "finiteLead",
        lead: "有限偏重——身体の終わりを厚く取った。共同体は「驚異の実験」として記録した。",
      };
    }
    if (years.safety >= 8) {
      return {
        profile: "safetyLead",
        lead: "安全偏重——介入と監視が厚い。自由は狭まったが、事故は記録されなかった。",
      };
    }
    if (years.fair >= 8) {
      return {
        profile: "fairLead",
        lead: "公平偏重——世代間の負担分担が先。若者世代の反発も、異議として残った。",
      };
    }
    return {
      profile: "seasonBalanced",
      lead: "均衡型——三つの時間が混ざった。正解ではないが、続けられた。",
    };
  }

  function render() {
    const rem = remaining();
    root.innerHTML = `
      <div class="aging-season">
        <p class="aging-lead">老化を選ぶ村——20年の試行を、有限・安全技術・世代公平に配分せよ。</p>
        <div class="aging-bar" aria-hidden="true">
          ${AXES.map((a) => {
            const pct = (years[a.key] / TOTAL_YEARS) * 100;
            return `<div class="aging-seg aging-seg-${a.key}" style="width:${pct}%"></div>`;
          }).join("")}
        </div>
        <div class="aging-axes">
          ${AXES.map(
            (a) => `
            <div class="aging-axis">
              <div class="aging-axis-head">
                <span class="aging-axis-label">${a.label}</span>
                <span class="aging-axis-val">${years[a.key]}年</span>
              </div>
              <p class="aging-axis-desc">${a.desc}</p>
              <div class="aging-stepper">
                <button type="button" class="aging-btn" data-action="dec" data-key="${a.key}">−2年</button>
                <button type="button" class="aging-btn" data-action="inc" data-key="${a.key}">＋2年</button>
              </div>
            </div>`
          ).join("")}
        </div>
        <p class="aging-remaining ${rem === 0 ? "aging-remaining-ok" : "aging-remaining-warn"}">
          残り: <b>${rem}</b> 年 / ${TOTAL_YEARS}年
        </p>
        <button type="button" class="btn btn-primary" id="aging-finish" ${rem !== 0 ? "disabled" : ""}>この配分で試行を始める</button>
        <button type="button" class="btn btn-choice aging-skip-btn" id="aging-skip">配分せず条項だけ見届ける</button>
      </div>
    `;

    root.querySelectorAll(".aging-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.key;
        const rem = remaining();
        if (btn.dataset.action === "inc" && rem >= 2 && years[key] < 16) {
          years[key] += 2;
          render();
        } else if (btn.dataset.action === "dec" && years[key] >= 2) {
          years[key] -= 2;
          render();
        }
      });
    });

    root.querySelector("#aging-finish")?.addEventListener("click", () => {
      if (remaining() !== 0) return;
      const meta = describeProfile();
      onComplete?.({
        years: { ...years },
        ...meta,
        signature: `AG-${years.finite}${years.safety}${years.fair}`,
      });
    });

    root.querySelector("#aging-skip")?.addEventListener("click", () => onSkip?.());
  }

  render();
  return { destroy() {} };
}
