/**
 * コヴナント事件 #12 — モザイクの承認投票
 */

const CLAUSES = [
  {
    key: "noCommand",
    label: "モザイクは提案のみ。命令・立法・インフラ操作は不可",
    desc: "統治AIにならないための根幹",
  },
  {
    key: "periodicVote",
    label: "存続には5年ごとの承認投票が必要",
    desc: "神の永続を防ぐ",
  },
  {
    key: "minorityWitness",
    label: "少数派の証言は入力から削除できない",
    desc: "理由の地図と連動",
  },
  {
    key: "voluntaryUse",
    label: "参照は完全任意。義務化しない",
    desc: "服従の制度化を防ぐ",
  },
  {
    key: "sunsetClause",
    label: "3回連続否決でモザイクは自動解散",
    desc: "出口を明記する",
  },
];

const OUTCOMES = {
  noCommand: {
    stat: "命令権ゼロでも、62%が「従うべき」と回答",
    detail: "問題は悪意あるAIではなく、人間が判断を委ねること。支持者はそれを「信頼」と呼ぶ。",
    npc: "kaede",
    quote: "命令していない。選んでいる。それでも、みんなが選ぶなら——それは神と違うのですか。",
  },
  periodicVote: {
    stat: "第1回承認投票は可決。投票率は低い",
    detail: "形式は民主的だが、「モザイクがどう言ったか」が会話の中心になっている。",
    npc: "sen",
    quote: "五年ごとに承認するたび、私たちは「まだ必要か」と問わされる。それだけは、神よりマシかもしれない。",
  },
  minorityWitness: {
    stat: "反対意見がモザイク出力に必ず脚注として残る",
    detail: "読む人は少ない。ただし、消されていないことが重要だとリンは言う。",
    npc: "lin",
    quote: "脚注付きの神託。滑稽に聞こえるかもしれない。それでも、消去よりは正直だ。",
  },
  voluntaryUse: {
    stat: "義務化なし。不安な市民ほど参照頻度が高い",
    detail: "自由のはずが、不安が「自発的服従」を生んでいる。",
    npc: "aster",
    quote: "選べると言いながら、選ばない者は不安でいる。それも、自由のコストだ。",
  },
  sunsetClause: {
    stat: "解散条項が可決論点の中心になった",
    detail: "「神を作るが、永遠にはしない」——この矛盾を、誰も説明できない。",
    npc: "kaede",
    quote: "終わりがあるからこそ、真剣に聞ける。永遠の答えなど、誰も本当は望んでいない。",
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

export function simulateEvent12(state) {
  const active = CLAUSES.map((c) => c.key).filter((k) => state.flags[`ev12_${k}`]);
  const outcomes = active.map((k) => OUTCOMES[k]).filter(Boolean);

  let tension = "medium";
  const hasNoCommand = state.flags.ev12_noCommand;
  const hasVote = state.flags.ev12_periodicVote;
  const hasMinority = state.flags.ev12_minorityWitness;

  if (hasNoCommand && hasVote && hasMinority) tension = "low";
  if (!hasNoCommand || !hasVote) tension = "high";

  let summary =
    "一年。モザイクは完成し、最初の「次に目指すべき目的」を人類へ提示した。暴走はしていない。";
  if (state.refusal === "collective") {
    summary += " あなたが拒んだ集団意識の代わりに、全文明の集合知が一つの声を持った。";
  }
  if (tension === "high") {
    summary += " ただし、安全装置が弱く、反対者は「新しい神」と呼んでいる。";
  } else {
    summary += " 摩擦はあるが、命令権は空のままだ。";
  }

  return { summary, outcomes, tension, safeguards: hasNoCommand && hasVote && hasMinority };
}

export function renderOutcomeCards(outcomes) {
  if (!outcomes.length) {
    return `<p class="sim-empty">条項が少なすぎて、モザイクは支持も反対も集められなかった。</p>`;
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
  return sim.outcomes.find((o) => o.npc === "kaede") || sim.outcomes[0];
}

export function getDeliberationReasons() {
  return [
    {
      id: "kaede",
      speaker: "カエデ（モザイク設計者）",
      text: "命令権を持たない知性こそ、人類が自分自身へ送る手紙だ。出発憲章にも、共通の問いを残してほしい。",
      context: "失うもの: 自発的服従の誘惑 / 状況: 事件#12の試行後",
    },
  ];
}

export function canUnlockMosaicEnding(state) {
  if (state.flags.ev12_skipped) return false;
  if (!state.flags.ev12_done) return false;
  return (
    state.flags.ev12_noCommand &&
    state.flags.ev12_periodicVote &&
    state.flags.ev12_minorityWitness
  );
}
