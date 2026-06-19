/**
 * コヴナント事件 #06 — 感覚の共有期間（コーラス）
 */

const CLAUSES = [
  {
    key: "timedSession",
    label: "共有は最大7日間。延長は全員の再同意が必要",
    desc: "関係の深化を、時間で区切る",
  },
  {
    key: "exitAnytime",
    label: "期間中でも個人は即時に共有を切れる",
    desc: "境界の回復を最優先する",
  },
  {
    key: "noMemoryExport",
    label: "退出後、共有期間の感覚記憶は外部へ持ち出せない",
    desc: "親密さの漏洩を防ぐ",
  },
  {
    key: "soloBuffer",
    label: "毎日2時間の「境界回復時間」を義務化",
    desc: "自己の感覚を取り戻す猶予",
  },
  {
    key: "noRecruitment",
    label: "既存の親密関係外への勧誘を禁止",
    desc: "関係の強制深化を防ぐ",
  },
];

const OUTCOMES = {
  timedSession: {
    stat: "7日周期の共有が定着。延長申請の35%が却下された",
    detail: "終わりがあるから、始められた人もいる。終わらない延長を求めた人もいる。",
    npc: "io",
    quote: "期限は冷たくない。期限があるから、ここにいる時間が重くなる。",
  },
  exitAnytime: {
    stat: "第2年に19%が途中退出。共同体は存続した",
    detail: "切れることの保証が、入る勇気を生んだ。切った者は「裏切り」と呼ばれなかった。",
    npc: "io",
    quote: "去る人の感覚も、ここにいた証拠だ。消さない。",
  },
  noMemoryExport: {
    stat: "「共有の余韻」という非言語文化が生まれた",
    detail: "言葉にできない記憶は残るが、外部へ持ち出せない。記録職は困惑している。",
    npc: "sen",
    quote: "感覚を記録できないなら、歴史は半分しか残らない——それでも、本人の境界は守られた。",
  },
  soloBuffer: {
    stat: "境界回復時間の儀式化。共有と孤独のリズムが定着",
    detail: "毎日2時間、誰も触れ合わない。退屈だと言う者も、必要だと言う者もいる。",
    npc: "io",
    quote: "自分の皮膚を取り戻す時間。それも、関係の一部だ。",
  },
  noRecruitment: {
    stat: "勧誘は減った。代わりに「招待待ち」の長い列ができた",
    detail: "関係の外から入りたい者が増えた。拒否は、選ばれた親密さを強めた。",
    npc: "child",
    quote: "選ばれなかったから価値がない、とは限らない。でも、押し込まれた関係は違う。",
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

export function simulateEvent06(state) {
  const active = CLAUSES.map((c) => c.key).filter((k) => state.flags[`ev06_${k}`]);
  const outcomes = active.map((k) => OUTCOMES[k]).filter(Boolean);

  let tension = "medium";
  if (state.flags.ev06_exitAnytime && state.flags.ev06_soloBuffer) tension = "low";
  if (!state.flags.ev06_exitAnytime || !state.flags.ev06_timedSession) tension = "high";

  let summary =
    "三年。金星・コーラスで、感覚を一時的に分かち合う共同体が試行された。";
  if (state.refusal === "collective") {
    summary += " 境界の溶解を拒んだあなたに、イオは「切れる共有」を見せた。";
  }
  if (state.refusal === "family") {
    summary += " 家族を拒んだあなたに、選ばれた親密さの重さが問われた。";
  }
  if (tension === "high") {
    summary += " 退出が難しく、共有期間の終わりを恐れる者が増えた。";
  } else {
    summary += " 摩擦はあるが、強制の共有には至っていない。";
  }

  return { summary, outcomes, tension };
}

export function renderOutcomeCards(outcomes) {
  if (!outcomes.length) {
    return `<p class="sim-empty">条項が少なく、コーラスは従来の「触れ合いの共同体」のままだった。</p>`;
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
  return sim.outcomes.find((o) => o.npc === "io") || sim.outcomes[0];
}

export function getDeliberationReason() {
  return {
    id: "io",
    speaker: "イオ（コーラス）",
    text: "感覚の共有期間で学んだ。親密さは深めてもいいが、切れない共有は監獄になる。出発憲章にも、退出後の記憶の扱いを書いてほしい。",
    context: "失うもの: 関係の深度 / 状況: 事件#06の再訪後",
  };
}
