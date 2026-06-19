/**
 * コヴナント事件 #11 — 共同親（コモン・ガーデン）
 */

const CLAUSES = [
  {
    key: "multiParent",
    label: "親は2名以上の共同契約で構成できる",
    desc: "血縁・婚姻を前提としない",
  },
  {
    key: "childExitFamily",
    label: "子どもは14歳から親共同体を無罰で退出できる",
    desc: "義務で縛らない",
  },
  {
    key: "noBloodPriority",
    label: "血縁だけでは親権・継承を優先しない",
    desc: "選んだ関係が優先",
  },
  {
    key: "renewContract",
    label: "親契約は5年ごとに全員の再同意が必要",
    desc: "固定された家族を作らない",
  },
  {
    key: "childRecordChoice",
    label: "退出した子は共同体記録の削除を請求できる",
    desc: "残る記録も子の自律",
  },
];

const OUTCOMES = {
  multiParent: {
    stat: "共同親契約が127組——うち血縁なしが61%",
    detail: "家族の形が増えた。古い共同体は「本当の家族は一組だけ」と反発した。",
    npc: "child",
    quote: "家族は一つじゃない。選べる数が、未来の数だ。",
  },
  childExitFamily: {
    stat: "第2年に19%の子どもが親共同体を退出——非難は記録されなかった",
    detail: "退出は失敗と呼ばれなくなった。残った子どもは、選んで残ったと言える。",
    npc: "child",
    quote: "去ることも、親との関係の一形だ。消さないで。",
  },
  noBloodPriority: {
    stat: "血縁優先の遺産争いが8件→0件——代わりに契約争いが3件",
    detail: "血縁の特権は消えた。ただし、契約の解釈争いは新しい摩擦になった。",
    npc: "sen",
    quote: "血縁を拒むなら、記録も血縁で並べるな——選んだ関係を残そう。",
  },
  renewContract: {
    stat: "5年再同意で34組が解散——再編成は22組",
    detail: "家族は固定されなくなった。別れも、再び組むことも、失敗ではない。",
    npc: "haru",
    quote: "庭と同じだ。去る人の道も、共同体に含める。",
  },
  childRecordChoice: {
    stat: "退出子の42%が記録削除を請求——共同体は半分だけ応じた",
    detail: "削除と匿名化のあいだで、また新しい抜け道が生まれた。",
    npc: "lin",
    quote: "年表に穴が開く——それでも、子どもの声を消すよりは正直だ。",
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

export function simulateEvent11(state) {
  const active = CLAUSES.map((c) => c.key).filter((k) => state.flags[`ev11_${k}`]);
  const outcomes = active.map((k) => OUTCOMES[k]).filter(Boolean);
  const weave = state.coParentWeaveResult;

  let tension = "medium";
  if (state.flags.ev11_childExitFamily && state.flags.ev11_renewContract) tension = "low";
  if (!state.flags.ev11_childExitFamily && !state.flags.ev11_noBloodPriority) tension = "high";

  let summary =
    "五年。コモン・ガーデンで、家族の再定義と子どもの退出が試された。";
  if (weave?.profile === "shared") {
    summary += " あなたが組んだ親の輪は、責任を分かち合う形だった——模範例として引用された。";
  } else if (weave?.profile === "focused") {
    summary += " 一極集中型の親の輪が問題視され、「選ばれた養育者」という新しい特権が生まれた。";
  }
  if (state.refusal === "family") {
    summary += " 家族を拒んだあなたに、子ども代表は「選べる家族の数」を見せた。";
  }
  if (tension === "high") {
    summary += " 血縁共同体が反発し、退出した子どもを「裏切者」と呼ぶ声も記録された。";
  } else {
    summary += " 摩擦はあるが、強制の親続は至っていない。";
  }

  return { summary, outcomes, tension };
}

export function renderOutcomeCards(outcomes) {
  if (!outcomes.length) {
    return `<p class="sim-empty">条項が少なく、ガーデンは従来の血縁家族モデルのままだった。</p>`;
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
  return sim.outcomes.find((o) => o.npc === "child") || sim.outcomes[0];
}

export function getDeliberationReason() {
  return {
    id: "childGarden",
    speaker: "子ども代表",
    text: "ガーデンで学んだ。家族は血縁ではない——退出できる親こそ、選べる親だ。出発憲章に、再選択の権利を書いて。",
    context: "失うもの: 固定された家族 / 状況: 事件#11の再訪後",
  };
}
