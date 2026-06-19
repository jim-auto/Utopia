/**
 * コヴナント事件 #05 — 百年庭園（コモン・ガーデン）
 */

const CLAUSES = [
  {
    key: "noDeadline",
    label: "百年は目標であり、期限ではない",
    desc: "完成の遅延を失敗と呼ばない",
  },
  {
    key: "abandonFree",
    label: "参加者はいつでも退出・放棄できる",
    desc: "熟達の放棄も尊厳ある選択",
  },
  {
    key: "generationHandoff",
    label: "50年で設計権を次世代に完全移譲",
    desc: "創設者の威信を固定しない",
  },
  {
    key: "incompleteBeauty",
    label: "未完成の状態を公式に「完成の一形」と認める",
    desc: "回廊の途切れを美として儀式化",
  },
  {
    key: "noInheritance",
    label: "子どもに未完成の義務を継承させない",
    desc: "未来人の同意と連動",
  },
];

const OUTCOMES = {
  noDeadline: {
    stat: "10年後も完成率42%。来園者は増え続けた",
    detail: "「いつか」が「いつまでも」になった。急ぐ者は去り、残る者は別の時間を持つ。",
    npc: "haru",
    quote: "庭園は遅れていません。私たちの期待だけが急いでいた。",
  },
  abandonFree: {
    stat: "第3年に38%が退出。誰も非難されなかった",
    detail: "退出の自由が機能した。残った者は、選んで残ったと言える。",
    npc: "haru",
    quote: "去った人の道も、庭に含める。彼らが耕した部分は、消さない。",
  },
  generationHandoff: {
    stat: "50年未満の試験移譲。次世代が中心を再設計",
    detail: "創設者の半分が不満。ただし暴力は起きず、異議は記録された。",
    npc: "child",
    quote: "前の世代の夢を、私たちは引き継ぐ義務はない。選べばいい。",
  },
  incompleteBeauty: {
    stat: "「途切れ祭」が始まった——未完成の回廊だけを歩く日",
    detail: "完成を目指さない美が、新しい来園理由になった。",
    npc: "haru",
    quote: "終わらない庭こそ、生きている庭だ。",
  },
  noInheritance: {
    stat: "子ども世代の80%が「関与しない」を選んだ",
    detail: "義務がなければ、一部だけが自由に続けた。それでよいとハルは言う。",
    npc: "sen",
    quote: "継承しない選択も、歴史の一部だ。記録に残そう。",
  },
};

export function buildClauseForm(selected) {
  return CLAUSES.map(
    (c) => `
    <label class="covenant-clause">
      <input type="checkbox" data-key="${c.key}" ${selected.has(c.key) ? "checked" : ""} />
      <div>
        <div class="card-title">${c.label}</div>
        <div class="card-desc">${c.desc}</div>
      </div>
    </label>`
  ).join("");
}

export function simulateEvent05(state) {
  const active = CLAUSES.map((c) => c.key).filter((k) => state.flags[`ev05_${k}`]);
  const outcomes = active.map((k) => OUTCOMES[k]).filter(Boolean);

  let tension = "medium";
  if (state.flags.ev05_abandonFree && state.flags.ev05_noInheritance) tension = "low";
  if (!state.flags.ev05_abandonFree) tension = "high";

  let summary =
    "十年。百年庭園は、まだ——おそらく永遠に——完成していない。";
  if (state.refusal === "art") {
    summary += " 完成を拒んだあなたに、ハルは初めて設計図を見せた。";
  }
  if (tension === "high") {
    summary += " 退出が難しく、『百年を背負う者』という無言のプレッシャーがある。";
  } else {
    summary += " 遅延は失敗と呼ばれなくなった。";
  }

  return { summary, outcomes, tension };
}

export function renderOutcomeCards(outcomes) {
  if (!outcomes.length) {
    return `<p class="sim-empty">条項が少なく、庭園は従来の「いつか完成する」物語のままだった。</p>`;
  }
  return `
    <div class="sim-grid">
      ${outcomes
        .map(
          (o) => `
        <div class="sim-card">
          <div class="sim-stat">${o.stat}</div>
          <p class="sim-detail">${o.detail}</p>
        </div>`
        )
        .join("")}
    </div>`;
}

export function getFeaturedQuote(sim) {
  if (!sim.outcomes.length) return null;
  return sim.outcomes.find((o) => o.npc === "haru") || sim.outcomes[0];
}

export function getDeliberationReason() {
  return {
    id: "haru",
    speaker: "ハル（庭師）",
    text: "百年庭園で学んだ。完成しなくても共同体は続けられる。出発憲章にも、『終わらない目的』を恐れすぎないでほしい。",
    context: "失うもの: 共通の物語 / 状況: 事件#05の再訪後",
  };
}
