/**
 * コヴナント事件 #04 — 忘れられる権利（パリンプセスト）
 */

const CLAUSES = [
  {
    key: "personalErase",
    label: "本人は自分の記憶を公共档から削除できる",
    desc: "忘れる権利を最優先する",
  },
  {
    key: "anonymousOnly",
    label: "歴史的事件は匿名化のみ。完全削除は不可",
    desc: "歴史の連続性を守る",
  },
  {
    key: "thirdPartyBan",
    label: "第三者は他人の記憶削除を申請できない",
    desc: "代理削除による abuse を防ぐ",
  },
  {
    key: "gapPeriod",
    label: "削除後10年間、同一内容の再記録を禁止",
    desc: "すぐに復活する「消したふり」を防ぐ",
  },
];

const OUTCOMES = {
  personalErase: {
    stat: "3年間に47件の削除が受理された",
    detail: "12%が「消してから空虚だった」と撤回を求めたが、復元はできなかった。",
    npc: "sen",
    quote: "忘れることを選んだのに、選んだこと自体は残る。それが公平かどうか、私にはまだわからない。",
  },
  anonymousOnly: {
    stat: "完全削除の申請はすべて匿名化に置換",
    detail: "年表の連続性は保たれた。被害者の一部は「消された」と感じている。",
    npc: "lin",
    quote: "匿名化も、削除の一種だ。ただし、未来の研究者には、何かが起きたことだけは伝わる。",
  },
  thirdPartyBan: {
    stat: "家族間の「消してほしい」請求はすべて却下",
    detail: "本人の自律は守られた。関係の断絶が記録に残る事例が増えた。",
    npc: "sen",
    quote: "記憶を消せないなら、関係を終えるしかない人もいる。それは記録のせいか、関係のせいか。",
  },
  gapPeriod: {
    stat: "「削除回避記録」という新ジャンルが生まれた",
    detail: "事実は残しつつ個人名を伏せる技法が儀式化。抜け道として機能している。",
    npc: "lin",
    quote: "禁止は創意を生む。私たちは今、記録の形而上学を勉強している。",
  },
};

export function getEvent04Clauses() {
  return CLAUSES;
}

export function simulateEvent04(state) {
  const active = CLAUSES.map((c) => c.key).filter((k) => state.flags[`ev04_${k}`]);
  const outcomes = active.map((k) => OUTCOMES[k]).filter(Boolean);

  const hasErase = state.flags.ev04_personalErase;
  const hasAnon = state.flags.ev04_anonymousOnly;
  let tension = "medium";

  if (hasErase && !hasAnon) tension = "high";
  if (hasErase && hasAnon && state.flags.ev04_gapPeriod) tension = "low";

  let summary = "三年。パリンプセストの記憶特区で、忘れと保存の境界が試された。";
  if (state.refusal === "memory") {
    summary += " あなたがかつて拒んだ「記憶の編集」が、今度は他者のために設計されている。";
  }
  if (tension === "high") {
    summary += " 完全削除派と歴史保存派の亀裂が、記録庫の職員を二つに割った。";
  } else if (tension === "low") {
    summary += " 摩擦はあるが、暴力や秘密抹殺には至っていない。";
  }

  return { summary, outcomes, tension };
}

export function renderOutcomeCards(outcomes) {
  if (!outcomes.length) {
    return `<p class="sim-empty">条項が少なすぎて、特区はほとんど変わらなかった。</p>`;
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
  return sim.outcomes[sim.outcomes.length - 1];
}

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

export function getDeliberationExtraReason() {
  return {
    id: "lin",
    speaker: "リン（記録職）",
    text: "パリンプセストの試験で、削除と匿名化のあいだに置き去りにされた記憶がある。出発憲章にも、同じ隙間を残さないでほしい。",
    context: "失うもの: 記録の完全性 / 状況: 事件#04の再訪後",
  };
}
