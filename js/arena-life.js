/**
 * SYS-07 — 競技の一生（人生配分）
 * 40年を熟達・他者・引退に配分する
 */

const TOTAL_YEARS = 40;
const AXES = [
  { key: "mastery", label: "熟達", desc: "練習・競技・極限" },
  { key: "others", label: "他者", desc: "教える・同行・別の生活" },
  { key: "retire", label: "引退", desc: "休息・転向・去る準備" },
];

export function mountArenaLife(root, { onComplete, onSkip }) {
  if (!root) return { destroy() {} };

  const years = { mastery: 28, others: 8, retire: 4 };

  function remaining() {
    return TOTAL_YEARS - (years.mastery + years.others + years.retire);
  }

  function describeProfile() {
    if (years.retire >= 10) {
      return {
        profile: "earlyRest",
        lead: "引退偏重——早く去る人生。共同体は「引退権の実効性」を記録した。",
      };
    }
    if (years.others >= 12) {
      return {
        profile: "relational",
        lead: "他者偏重——競技以外の時間を厚く取った。熟達共同体は複雑な顔を見せた。",
      };
    }
    if (years.mastery >= 32) {
      return {
        profile: "dedicated",
        lead: "熟達偏重——一生に近い競技。賛美と警告が同時に記録された。",
      };
    }
    return {
      profile: "balanced",
      lead: "均衡型——三つの時間が混ざった。正解ではないが、生きられる形だった。",
    };
  }

  function render() {
    const rem = remaining();
    root.innerHTML = `
      <div class="arena-life">
        <p class="arena-lead">競技者の40年——生涯専念か、引退か、他者への時間か。合計40年を配分せよ。</p>
        <div class="arena-bar" aria-hidden="true">
          ${AXES.map((a) => {
            const pct = (years[a.key] / TOTAL_YEARS) * 100;
            return `<div class="arena-seg arena-seg-${a.key}" style="width:${pct}%"></div>`;
          }).join("")}
        </div>
        <div class="arena-axes">
          ${AXES.map(
            (a) => `
            <div class="arena-axis">
              <div class="arena-axis-head">
                <span class="arena-axis-label">${a.label}</span>
                <span class="arena-axis-val">${years[a.key]}年</span>
              </div>
              <p class="arena-axis-desc">${a.desc}</p>
              <div class="arena-stepper">
                <button type="button" class="arena-btn" data-action="dec" data-key="${a.key}">−2年</button>
                <button type="button" class="arena-btn" data-action="inc" data-key="${a.key}">＋2年</button>
              </div>
            </div>`
          ).join("")}
        </div>
        <p class="arena-remaining ${rem === 0 ? "arena-remaining-ok" : "arena-remaining-warn"}">
          残り: <b>${rem}</b> 年 / ${TOTAL_YEARS}年
        </p>
        <button type="button" class="btn btn-primary" id="arena-finish" ${rem !== 0 ? "disabled" : ""}>この人生で試行を始める</button>
        <button type="button" class="btn btn-choice arena-skip-btn" id="arena-skip">配分せず条項だけ見届ける</button>
      </div>
    `;

    root.querySelectorAll(".arena-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.key;
        const rem = remaining();
        if (btn.dataset.action === "inc" && rem >= 2 && years[key] < 36) {
          years[key] += 2;
          render();
        } else if (btn.dataset.action === "dec" && years[key] >= 2) {
          years[key] -= 2;
          render();
        }
      });
    });

    root.querySelector("#arena-finish")?.addEventListener("click", () => {
      if (remaining() !== 0) return;
      const meta = describeProfile();
      onComplete?.({
        years: { ...years },
        ...meta,
        signature: `AR-${years.mastery}${years.others}${years.retire}`,
      });
    });

    root.querySelector("#arena-skip")?.addEventListener("click", () => onSkip?.());
  }

  render();
  return { destroy() {} };
}
