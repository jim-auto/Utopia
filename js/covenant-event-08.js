/**
 * コヴナント事件 #08 — 新身体の試着（ジェネシス・フォージ）
 */

const CLAUSES = [
  {
    key: "reversibleTrial",
    label: "試着は14日で元の身体に戻せる",
    desc: "不可逆変更は別契約・別期間で",
  },
  {
    key: "minorConsent",
    label: "未成年の変更は本人＋独立評議会の両同意",
    desc: "親だけ、共同体だけでは決めない",
  },
  {
    key: "noInheritBody",
    label: "設計した身体を子どもに継承させない",
    desc: "未来人の身体は未来人が選ぶ",
  },
  {
    key: "openFork",
    label: "フォーク身体の設計図は共同体で公開",
    desc: "勝手な設計を隠さない",
  },
  {
    key: "exitDesign",
    label: "退出時は自分の試着データを持ち出せる",
    desc: "共同体への永久拘束を防ぐ",
  },
];

const OUTCOMES = {
  reversibleTrial: {
    stat: "試着の92%が14日以内に元に戻った——不可逆契約は3%のみ",
    detail: "「試す」ことと「変わる」ことが分離された。恐怖は減り、軽率な変更も減った。",
    npc: "child",
    quote: "身体を試す権利と、戻る権利——どちらも未来の私のものです。",
  },
  minorConsent: {
    stat: "独立評議会が12件中4件を否決——否決も記録された",
    detail: "親の同意だけでは通らない。ただし、評議会自体が「正しい判断者」かは争点のまま。",
    npc: "child",
    quote: "大人が設計した美しさより、自分で選んだ不格好さを——それを条文に書いて。",
  },
  noInheritBody: {
    stat: "親世代の82%が「身体の継承」を望んだが、制度は拒否",
    detail: "設計の熱意は、次世代への贈与に変換できなかった。一部は別共同体を設立した。",
    npc: "sen",
    quote: "記憶を継承しないのと同じだ。身体も、未来人の同意なしには渡せない。",
  },
  openFork: {
    stat: "公開された47フォークのうち、9件に「想定外の副作用」報告",
    detail: "隠蔽は減った。代わりに、誰も試さない設計も増えた——公開は、慎重さも生む。",
    npc: "lin",
    quote: "設計図は削除できない。ただし、読める者が限られる——それも、公開の一形だ。",
  },
  exitDesign: {
    stat: "退出者の68%がデータを持ち出し——共同体は小さくなった",
    detail: "持ち出しは裏切りと呼ばれなかった。残った者は、自発的再編成と言った。",
    npc: "child",
    quote: "去る人の試着ログも、歴史の一部。消さないで。",
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

export function simulateEvent08(state) {
  const active = CLAUSES.map((c) => c.key).filter((k) => state.flags[`ev08_${k}`]);
  const outcomes = active.map((k) => OUTCOMES[k]).filter(Boolean);
  const tryon = state.forgeTryonResult;

  let tension = "medium";
  if (state.flags.ev08_reversibleTrial && state.flags.ev08_minorConsent) tension = "low";
  if (!state.flags.ev08_reversibleTrial && !state.flags.ev08_exitDesign) tension = "high";

  let summary =
    "三年。ジェネシス・フォージで、試着と不可逆変更と未来人の同意が試された。";
  if (tryon?.profile === "balanced") {
    summary += " あなたの試着は均衡型だった——共同体は「控えめな設計」を模範とした。";
  } else if (tryon?.profile === "extreme") {
    summary += " 極端な感覚試着の噂が広がり、慎重派と冒険派が割れた。";
  }
  if (state.refusal === "immortality") {
    summary += " 永遠の生命を拒んだあなたに、不可逆変更の重さが問われた。";
  }
  if (state.refusal === "family") {
    summary += " 家族を拒んだあなたに、身体の継承をめぐる争いが届いた。";
  }
  if (tension === "high") {
    summary += " 試着が不可逆化し、退出できない設計者が「新しい elite」と呼ばれ始めた。";
  } else {
    summary += " 摩擦はあるが、強制の身体変更には至っていない。";
  }

  return { summary, outcomes, tension };
}

export function renderOutcomeCards(outcomes) {
  if (!outcomes.length) {
    return `<p class="sim-empty">条項が少なく、フォージは従来の「設計者の自由」が優先された。</p>`;
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
    id: "child",
    speaker: "子ども代表",
    text: "フォージで学んだ。身体を試す権利と、戻る権利——不可逆変更は、未来人の同意なしには。出発憲章にも、試着期間を書いてほしい。",
    context: "失うもの: 設計の自由 / 状況: 事件#08の再訪後",
  };
}
