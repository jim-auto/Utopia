/**
 * コヴナント事件 #02 — 匿名の村（コモン・ガーデン）
 */

const CLAUSES = [
  {
    key: "exitAnytime",
    label: "退出は理由を問わない",
    desc: "透明性より退出権を優先",
  },
  {
    key: "noRealNameRecord",
    label: "共同体内部も実名档を作らない",
    desc: "匿名は外だけでなく内側にも及ぶ",
  },
  {
    key: "externalSilence",
    label: "試行期間中、外部への言及を禁止",
    desc: "村の存在そのものを守る",
  },
  {
    key: "leakForgiveness",
    label: "匿名漏洩は一度だけ赦免——再犯は退出勧告",
    desc: "完璧な秘密は求めない",
  },
  {
    key: "visitorVeil",
    label: "訪問者は記憶封印を受けてから入村",
    desc: "外部との関係を儀式で管理",
  },
];

const OUTCOMES = {
  exitAnytime: {
    stat: "第2年に41%が退出——非難は記録されなかった",
    detail: "去る自由が機能した。残った者は、選んで残ったと言える。",
    npc: "haru",
    quote: "匿名で入った者も、匿名で去れる。それが、この村の礼儀だ。",
  },
  noRealNameRecord: {
    stat: "内部実名档ゼロ——代わりに「呼び方の月替わり」が儀式化",
    detail: "名前のない関係は続いた。紛争の際、誰が誰かわからない friction も生まれた。",
    npc: "sen",
    quote: "記録がない関係は、美しい。ただし、責任の所在も曖昧になる。",
  },
  externalSilence: {
    stat: "外部言及の違反12件——すべて「比喩的言及」として争点化",
    detail: "村は外から見えにくくなった。比喩という抜け道が invent された。",
    npc: "haru",
    quote: "外に語ると、匿名は終わる。比喩で語る者も、結局は語っている。",
  },
  leakForgiveness: {
    stat: "一度限りの赦免が7件適用——2件目の再犯者は自発退出",
    detail: "完璧な秘密は求めなかった。再犯の線引きは、新しい摩擦になった。",
    npc: "sen",
    quote: "一度の漏洩を許すなら、それも条文に。二度目は、関係の終わりだ。",
  },
  visitorVeil: {
    stat: "訪問者100%が封印儀式を受けた——3%が「封印後の空虚」を訴えた",
    detail: "外部との接触は管理された。訪問者の記憶まで触れる設計は、争いも生んだ。",
    npc: "haru",
    quote: "来た者の記憶も、村の境界の一部だ。それを厳しくしすぎないで。",
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

export function simulateEvent02(state) {
  const active = CLAUSES.map((c) => c.key).filter((k) => state.flags[`ev02_${k}`]);
  const outcomes = active.map((k) => OUTCOMES[k]).filter(Boolean);
  const gate = state.anonymousGateResult;

  let tension = "medium";
  if (state.flags.ev02_exitAnytime && state.flags.ev02_leakForgiveness) tension = "low";
  if (!state.flags.ev02_exitAnytime && state.flags.ev02_externalSilence) tension = "high";

  let summary = "三年。コモン・ガーデンで、匿名共同体の試行が続いた。";
  if (state.flags.joinedAnonymous) {
    summary += " あなたは試験期間に、無名の集団の時間を預けた。";
  }
  if (gate?.profile === "anonLead") {
    summary += " 設計した境界は匿名偏重——外部からの視線を徹底的に遮った。";
  } else if (gate?.profile === "openLead") {
    summary += " 透明偏重——内部の相互可視性が高く、匿名の緊張は和らいだ。";
  } else if (gate?.profile === "borderLead") {
    summary += " 外部偏重——訪問と接触の儀式が厚く、漏洩リスクも増えた。";
  }
  if (state.refusal === "fame") {
    summary += " 名声を拒んだあなたに、名前のない共同体が問われた。";
  }
  if (tension === "high") {
    summary += " 秘密保持と退出の自由が衝突し、共同体は二つに割れた。";
  } else {
    summary += " 摩擦はあるが、強制の監視や暴力には至っていない。";
  }

  return { summary, outcomes, tension };
}

export function renderOutcomeCards(outcomes) {
  if (!outcomes.length) {
    return `<p class="sim-empty">条項が少なく、村は従来の透明共同体のままだった。</p>`;
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
    id: "haruAnon",
    speaker: "ハル",
    text: "匿名の村で学んだ。退出できる透明性だけが、関係を続けられる——名前のない者も、去る権利を持て。出発憲章に、匿名共同体の退出を書いて。",
    context: "失うもの: 完全な透明性 / 状況: 事件#02の再訪後",
  };
}
