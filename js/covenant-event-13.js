/**
 * コヴナント事件 #13 — 老化を選ぶ村（コモン・ガーデン）
 */

const CLAUSES = [
  {
    key: "optInAging",
    label: "老化は任意——共同体は強制しない",
    desc: "一回性を選ぶ自由を最優先",
  },
  {
    key: "noYouthNorm",
    label: "若者に「老化を選べ」という規範を作らない",
    desc: "驚異の強要を防ぐ",
  },
  {
    key: "sharedMedicalCost",
    label: "老化試行の医療コストを共同体全体で負担",
    desc: "世代間の公平——若者だけが支払わない",
  },
  {
    key: "thirtyYearCap",
    label: "一度選んだ老化期間は30年上限——期間後は撤回可能",
    desc: "不可逆を完全には求めない",
  },
  {
    key: "anonFinityRecord",
    label: "老化を選んだ者の終わりを、年表に匿名で残す",
    desc: "一回性を歴史に——個人名は伏せる",
  },
];

const OUTCOMES = {
  optInAging: {
    stat: "強制老化ゼロ——選んだ者だけが12%の人口",
    detail: "共同体は「永遠の若さ」を前提にしなくなった。選ばない者も、正当だった。",
    npc: "child",
    quote: "終わりを選べるから、始められる——老化も、そうだ。",
  },
  noYouthNorm: {
    stat: "「老化を選べ」キャンペーンゼロ——代わりに「聞く会」が儀式化",
    detail: "規範は生まれなかった。ただし、沈黙の圧力は完全には消えなかった。",
    npc: "aster",
    quote: "驚異を強要するな。聞くことだけは、共同体の仕事だ。",
  },
  sharedMedicalCost: {
    stat: "医療コストの共同体負担100%——若者世代の反発は記録された",
    detail: "公平は機能した。負担の感じ方は、世代で割れた。",
    npc: "sen",
    quote: "若者だけが未来を払うな。老化を選ぶ者のリスクも、共同体の物語だ。",
  },
  thirtyYearCap: {
    stat: "30年上限到達者の68%が撤回——32%が「もう一度」を選んだ",
    detail: "不可逆は完全ではなかった。二度目の老化選択という新語が生まれた。",
    npc: "haru",
    quote: "一度選んだから終わり、ではない。去るように、戻る自由も。",
  },
  anonFinityRecord: {
    stat: "年表に「有限を選んだ者」匿名マーク——個人名は伏せられた",
    detail: "一回性は歴史に残った。匿名のせいで、英雄化もしなかった。",
    npc: "lin",
    quote: "終わりを記録する——ただし、個人を商品にしない。",
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

export function simulateEvent13(state) {
  const active = CLAUSES.map((c) => c.key).filter((k) => state.flags[`ev13_${k}`]);
  const outcomes = active.map((k) => OUTCOMES[k]).filter(Boolean);
  const season = state.agingSeasonResult;

  let tension = "medium";
  if (state.flags.ev13_optInAging && state.flags.ev13_noYouthNorm) tension = "low";
  if (!state.flags.ev13_optInAging && !state.flags.ev13_sharedMedicalCost) tension = "high";

  let summary = "七年。コモン・ガーデンで、老化を選ぶ共同体の試行が続いた。";
  if (season?.profile === "finiteLead") {
    summary += " あなたが配分した試行は有限偏重——身体の終わりを厚く取った。";
  } else if (season?.profile === "safetyLead") {
    summary += " 安全技術偏重——介入と監視が厚く、驚異は和らいだが自由も狭まった。";
  } else if (season?.profile === "fairLead") {
    summary += " 世代公平偏重——コストと負担の分担が先に立った。";
  }
  if (state.refusal === "immortality") {
    summary += " 永遠の生命を拒んだあなたに、有限の身体が問われた。";
  }
  if (tension === "high") {
    summary += " 「老化を選べない者は未来を盗む」という無言の圧力が、共同体を割った。";
  } else {
    summary += " 摩擦はあるが、強制の老化や医療拒否には至っていない。";
  }

  return { summary, outcomes, tension };
}

export function renderOutcomeCards(outcomes) {
  if (!outcomes.length) {
    return `<p class="sim-empty">条項が少なく、村は従来の「安全な永遠」のままだった。</p>`;
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
    id: "childAging",
    speaker: "子ども代表",
    text: "老化を選ぶ村で学んだ。終わりを選べるから、始められる——永遠を前提にしないで。出発憲章に、有限の身体と世代の公平を書いて。",
    context: "失うもの: 安全な永遠 / 状況: 事件#13の再訪後",
  };
}
