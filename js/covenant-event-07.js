/**
 * コヴナント事件 #07 — 深層の命名（アビス）
 */

const CLAUSES = [
  {
    key: "nameProtection",
    label: "未命名の深層生物には仮名のみ——実名公開は100年後",
    desc: "驚異の保護を最優先する",
  },
  {
    key: "openSurvey",
    label: "調査データは5年以内に公開",
    desc: "知の独占を防ぐ",
  },
  {
    key: "riskConsent",
    label: "探査者は不可逆リスクを個人で引き受ける",
    desc: "共同体が英雄を作らない",
  },
  {
    key: "noHeroArchive",
    label: "発見者の名声記録を禁止",
    desc: "驚異そのものを記録の主役にする",
  },
  {
    key: "exitRecall",
    label: "探査隊員はいつでも引き上げを請求できる",
    desc: "探索のリスクに退出権を接続",
  },
];

const OUTCOMES = {
  nameProtection: {
    stat: "47種の未命名生物が「仮名期間」に入った",
    detail: "科学共同体は不満。ただし、急いで名を付けた過去の丑闻が再発していない。",
    npc: "nagi",
    quote: "名前は、捕まえることでもある。急ぐ名前は、所有の始まりだ。",
  },
  openSurvey: {
    stat: "公開義務の5年期限——第3年に「要約版」という抜け道が生まれた",
    detail: "データは出た。ただし、読める者が限られた。それも、公開の一形として記録された。",
    npc: "lin",
    quote: "要約は削除ではない。ただし、驚異は要約できないものもある。",
  },
  riskConsent: {
    stat: "探査事故の責任追及はゼロ——個人の誓約のみ",
    detail: "英雄も悪人も生まれなかった。退出を選んだ者は、静かに上がった。",
    npc: "nagi",
    quote: "引き上げを請求した者を、逃げたと呼ばない。それが、この海の礼儀だ。",
  },
  noHeroArchive: {
    stat: "発見の記録から個人名が消えた——年表には「深層第12層」だけ",
    detail: "名声を拒む設計は、一部の探査者を遠ざけた。残った者は、驚異のためにいた。",
    npc: "aster",
    quote: "記録されない冒険に、意味はあるか。ある——ただし、それは私たちだけの意味だ。",
  },
  exitRecall: {
    stat: "第1年に22%が引き上げ。残った隊は自発的再編成",
    detail: "退出が恥ではなくなった。共同体は小さくなったが、暴力はなかった。",
    npc: "nagi",
    quote: "去る者のデータも、探査の一部として残す。消さない。",
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

export function simulateEvent07(state) {
  const active = CLAUSES.map((c) => c.key).filter((k) => state.flags[`ev07_${k}`]);
  const outcomes = active.map((k) => OUTCOMES[k]).filter(Boolean);

  let tension = "medium";
  if (state.flags.ev07_exitRecall && state.flags.ev07_nameProtection) tension = "low";
  if (!state.flags.ev07_openSurvey && !state.flags.ev07_exitRecall) tension = "high";

  let summary =
    "五年。エウロパ・アビスの深層で、命名と公開と退出が試された。";
  if (state.refusal === "fame") {
    summary += " 名声を拒んだあなたに、ナギは「発見者なき記録」を見せた。";
  }
  if (state.refusal === "immortality") {
    summary += " 永遠の生命を拒んだあなたに、不可逆な深層リスクが問われた。";
  }
  if (tension === "high") {
    summary += " 知の独占と英雄化の圧力が、探査共同体を割った。";
  } else {
    summary += " 摩擦はあるが、強制の探査には至っていない。";
  }

  return { summary, outcomes, tension };
}

export function renderOutcomeCards(outcomes) {
  if (!outcomes.length) {
    return `<p class="sim-empty">条項が少なく、深層探査は従来の「最初の命名者」競争のままだった。</p>`;
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
  return sim.outcomes.find((o) => o.npc === "nagi") || sim.outcomes[0];
}

export function getDeliberationReason() {
  return {
    id: "nagi",
    speaker: "ナギ（深層探査）",
    text: "アビスで学んだ。驚異に急いで名を付けるな——退出できる探査だけが、未来に渡せる。出発憲章にも、未命名の余地を残してほしい。",
    context: "失うもの: 知の公開速度 / 状況: 事件#07の再訪後",
  };
}
