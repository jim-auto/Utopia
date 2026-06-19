/**
 * SYS-07 — 記録しない謝罪の儀式（見届けの設計）
 * 12ヶ月を贖罪・封印・被害者留保に配分する
 */

const TOTAL_MONTHS = 12;
const AXES = [
  { key: "repair", label: "贖罪", desc: "身体の労働・同行・修復" },
  { key: "seal", label: "封印", desc: "公共記録から外す時間" },
  { key: "reserve", label: "留保", desc: "被害者の記憶と終了権" },
];

export function mountApologyRite(root, { onComplete, onSkip }) {
  if (!root) return { destroy() {} };

  const months = { repair: 5, seal: 4, reserve: 3 };

  function remaining() {
    return TOTAL_MONTHS - (months.repair + months.seal + months.reserve);
  }

  function describeProfile() {
    if (months.repair >= 7) {
      return {
        profile: "repairLead",
        lead: "贖罪偏重——先に身体で向き合う儀式。共同体は「遅い忘却」と呼んだ。",
      };
    }
    if (months.seal >= 6) {
      return {
        profile: "forgetLead",
        lead: "封印偏重——記録を拒む時間が長い。透明性派は不安を募らせた。",
      };
    }
    if (months.reserve >= 6) {
      return {
        profile: "victimLead",
        lead: "留保偏重——被害者のペースと記憶が最優先。加害側は待つことを学んだ。",
      };
    }
    return {
      profile: "riteBalanced",
      lead: "均衡型——三つの時間が混ざった儀式。正解ではないが、続けられた。",
    };
  }

  function render() {
    const rem = remaining();
    root.innerHTML = `
      <div class="apology-rite">
        <p class="apology-lead">記録しない謝罪——12ヶ月の試行儀式を、贖罪・封印・被害者留保に配分せよ。</p>
        <div class="apology-bar" aria-hidden="true">
          ${AXES.map((a) => {
            const pct = (months[a.key] / TOTAL_MONTHS) * 100;
            return `<div class="apology-seg apology-seg-${a.key}" style="width:${pct}%"></div>`;
          }).join("")}
        </div>
        <div class="apology-axes">
          ${AXES.map(
            (a) => `
            <div class="apology-axis">
              <div class="apology-axis-head">
                <span class="apology-axis-label">${a.label}</span>
                <span class="apology-axis-val">${months[a.key]}ヶ月</span>
              </div>
              <p class="apology-axis-desc">${a.desc}</p>
              <div class="apology-stepper">
                <button type="button" class="apology-btn" data-action="dec" data-key="${a.key}">−1</button>
                <button type="button" class="apology-btn" data-action="inc" data-key="${a.key}">＋1</button>
              </div>
            </div>`
          ).join("")}
        </div>
        <p class="apology-remaining ${rem === 0 ? "apology-remaining-ok" : "apology-remaining-warn"}">
          残り: <b>${rem}</b> ヶ月 / ${TOTAL_MONTHS}ヶ月
        </p>
        <button type="button" class="btn btn-primary" id="apology-finish" ${rem !== 0 ? "disabled" : ""}>この儀式で試行を始める</button>
        <button type="button" class="btn btn-choice apology-skip-btn" id="apology-skip">儀式を設計せず条項だけ見届ける</button>
      </div>
    `;

    root.querySelectorAll(".apology-btn").forEach((btn) => {
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

    root.querySelector("#apology-finish")?.addEventListener("click", () => {
      if (remaining() !== 0) return;
      const meta = describeProfile();
      onComplete?.({
        months: { ...months },
        ...meta,
        signature: `AP-${months.repair}${months.seal}${months.reserve}`,
      });
    });

    root.querySelector("#apology-skip")?.addEventListener("click", () => onSkip?.());
  }

  render();
  return { destroy() {} };
}
