/**
 * SYS-07 — ジェネシス・フォージ身体試着
 * 感覚3軸への配点で「試す」身体を設計する（不可逆ではない）
 */

const CHANNELS = [
  { key: "sight", label: "視覚", desc: "色域・距離・暗視" },
  { key: "touch", label: "触覚", desc: "圧力・温度・痛みの閾値" },
  { key: "balance", label: "平衡", desc: "重力感・内耳・空間認識" },
];

const TOTAL_POINTS = 5;

export function mountForgeTryon(root, { onComplete, onSkip }) {
  if (!root) return { destroy() {} };

  const points = { sight: 1, touch: 2, balance: 2 };

  function recalcRemaining() {
    return TOTAL_POINTS - (points.sight + points.touch + points.balance);
  }

  function render() {
    const remaining = recalcRemaining();
    root.innerHTML = `
      <div class="forge-tryon">
        <p class="forge-lead">プロトタイプ身体——14日で元に戻せる。不可逆ではない。感覚5点を配分せよ。</p>
        <div class="forge-silhouette" aria-hidden="true">
          <svg viewBox="0 0 120 160" class="forge-body-svg">
            <ellipse cx="60" cy="28" rx="18" ry="22" fill="none" stroke="var(--mood-accent)" stroke-width="1.2" opacity="0.5"/>
            <path d="M60 50 L60 95" stroke="var(--mood-accent)" stroke-width="1.5" opacity="0.45"/>
            <path d="M60 65 L38 88 M60 65 L82 88" stroke="var(--mood-accent)" stroke-width="1.2" opacity="0.4"/>
            <path d="M60 95 L42 130 M60 95 L78 130" stroke="var(--mood-accent)" stroke-width="1.2" opacity="0.4"/>
            <circle cx="52" cy="24" r="3" fill="var(--mood-accent)" opacity="${0.2 + points.sight * 0.12}"/>
            <circle cx="68" cy="24" r="3" fill="var(--mood-accent)" opacity="${0.2 + points.sight * 0.12}"/>
            <ellipse cx="60" cy="70" rx="${12 + points.touch * 2}" ry="8" fill="var(--mood-accent)" fill-opacity="${0.04 + points.touch * 0.03}"/>
            <ellipse cx="60" cy="110" rx="${10 + points.balance * 2}" ry="6" fill="var(--mood-accent)" fill-opacity="${0.04 + points.balance * 0.03}"/>
          </svg>
        </div>
        <div class="forge-sliders">
          ${CHANNELS.map(
            (ch) => `
            <div class="forge-channel" data-key="${ch.key}">
              <div class="forge-channel-head">
                <span class="forge-channel-label">${ch.label}</span>
                <span class="forge-channel-val">${points[ch.key]}</span>
              </div>
              <p class="forge-channel-desc">${ch.desc}</p>
              <div class="forge-stepper">
                <button type="button" class="forge-btn" data-action="dec" data-key="${ch.key}" aria-label="${ch.label}を減らす">−</button>
                <button type="button" class="forge-btn" data-action="inc" data-key="${ch.key}" aria-label="${ch.label}を増やす">＋</button>
              </div>
            </div>`
          ).join("")}
        </div>
        <p class="forge-remaining ${remaining === 0 ? "forge-remaining-ok" : "forge-remaining-warn"}">
          残り配点: <b>${remaining}</b> / ${TOTAL_POINTS}
        </p>
        <button type="button" class="btn btn-primary" id="forge-apply" ${remaining !== 0 ? "disabled" : ""}>試着を開始する（14日）</button>
        <button type="button" class="btn btn-choice forge-skip-btn" id="forge-skip">試着せず条項だけ見届ける</button>
      </div>
    `;

    root.querySelectorAll(".forge-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.key;
        const rem = recalcRemaining();
        if (btn.dataset.action === "inc" && rem > 0 && points[key] < 4) {
          points[key] += 1;
          render();
        } else if (btn.dataset.action === "dec" && points[key] > 0) {
          points[key] -= 1;
          render();
        }
      });
    });

    root.querySelector("#forge-apply")?.addEventListener("click", () => {
      if (recalcRemaining() !== 0) return;
      const max = Math.max(points.sight, points.touch, points.balance);
      const min = Math.min(points.sight, points.touch, points.balance);
      let profile = "balanced";
      if (max >= 3 && max - min >= 2) profile = "extreme";
      if (max <= 2 && min >= 1) profile = "cautious";

      const labels = {
        balanced: "均衡型——三感覚を均等に試した。共同体は、慎重な模範例として記録した。",
        extreme: "偏重型——一つの感覚を極端に増幅した。賛否が割れ、試着ログが公開された。",
        cautious: "控え型——すべて低めの配分。「試さない選択」も試着の一形として残った。",
      };

      onComplete?.({
        points: { ...points },
        profile,
        lead: labels[profile],
        signature: `FG-${(points.sight * 100 + points.touch * 10 + points.balance).toString(16).toUpperCase()}`,
      });
    });

    root.querySelector("#forge-skip")?.addEventListener("click", () => onSkip?.());
  }

  render();
  return { destroy() {} };
}

export function getForgeTryonDeliberationReason(result) {
  const profile = result?.profile || "balanced";
  const texts = {
    balanced: "身体を試す権利は、戻る権利とセットだ。不可逆変更は、別の契約で。",
    extreme: "極端な感覚設計は、驚異でもある。ただし、未来人の同意なしには固定しないで。",
    cautious: "試さない選択も、身体の自律だ。押し付けないフォージこそ、楽園の条件。",
  };
  return {
    id: "child",
    speaker: "子ども代表",
    text: texts[profile] || texts.balanced,
    context: "失うもの: 設計の自由 / 状況: フォージ試着",
  };
}
