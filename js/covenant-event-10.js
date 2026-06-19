/**
 * コヴナント事件 #10 — 記録しない謝罪（パリンプセスト）
 */

const CLAUSES = [
  {
    key: "noArchiveApology",
    label: "謝罪の内容は公共档に残さない",
    desc: "贖罪を記録の商品にしない",
  },
  {
    key: "victimClosure",
    label: "儀式の終了は被害者のみが宣言できる",
    desc: "時間や共同体が「もう十分」と決めない",
  },
  {
    key: "witnessSeal",
    label: "見届け人は存在のみ記録——内容は封印",
    desc: "あったことだけが残る",
  },
  {
    key: "repairBeforeForget",
    label: "行為的賠償完了まで、忘却申請を保留",
    desc: "忘れる前に、身体で向き合う",
  },
  {
    key: "perpAnonymous",
    label: "加害者の実名は儀式に出さない",
    desc: "匿名の贖罪——名声の反転も防ぐ",
  },
];

const OUTCOMES = {
  noArchiveApology: {
    stat: "公共档への謝罪記録ゼロ——代わりに「非記録儀式」という新カテゴリ",
    detail: "内容は消えた。ただし、儀式が行われたこと自体は、匿名マークとして残った。",
    npc: "sen",
    quote: "謝罪を記録にすると、それはもう贖罪ではなく、自己演出になる。",
  },
  victimClosure: {
    stat: "早期終了の強制はゼロ——12%が「まだ終わらない」と再開を選んだ",
    detail: "被害者のペースが尊重された。共同体は待つことを学んだ。",
    npc: "lin",
    quote: "終わりも、被害者の選択だ。早く終わらせたいのは、加害側の不安かもしれない。",
  },
  witnessSeal: {
    stat: "見届け人記録は「封印済み」タグのみ——内容開示請求はすべて却下",
    detail: "第三者は存在を知った。中身は知らない。それが新しい透明性の形になった。",
    npc: "sen",
    quote: "見届けたことと、読めることは違う。後者まで求めるなら、それはもう記録だ。",
  },
  repairBeforeForget: {
    stat: "忘却申請の68%が賠償完了後に受理——32%は「完了の定義」で争った",
    detail: "忘れる前に動く身体が求められた。定義の争いは、新しい摩擦になった。",
    npc: "lin",
    quote: "忘れる前に、何かをしたか。それを測る尺度は、また invent される。",
  },
  perpAnonymous: {
    stat: "実名儀式ゼロ——「匿名の加害者」という記号が年表に残った",
    detail: "名声の反転は防がれた。被害者の一部は「誰に謝られたかわからない」と苦しんだ。",
    npc: "sen",
    quote: "匿名は、加害者を守ることでもある。ただし、被害者の記憶には名前が残る。",
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

export function simulateEvent10(state) {
  const active = CLAUSES.map((c) => c.key).filter((k) => state.flags[`ev10_${k}`]);
  const outcomes = active.map((k) => OUTCOMES[k]).filter(Boolean);
  const rite = state.apologyRiteResult;

  let tension = "medium";
  if (state.flags.ev10_noArchiveApology && state.flags.ev10_victimClosure) tension = "low";
  if (!state.flags.ev10_noArchiveApology && !state.flags.ev10_victimClosure) tension = "high";

  let summary = "五年。パリンプセストで、記録しない謝罪の儀式が試された。";
  if (state.flags.ev04_done) {
    summary += " 忘れられる権利の特区の隣で、贖罪と忘却のあいだに新しい層が生まれた。";
  }
  if (rite?.profile === "repairLead") {
    summary += " あなたが設計した儀式は贖罪偏重——身体の労働が先に立った。";
  } else if (rite?.profile === "forgetLead") {
    summary += " 封印偏重——記録を拒む設計が、共同体の不安をあおった。";
  } else if (rite?.profile === "victimLead") {
    summary += " 被害者留保偏重——終わり方と記憶の選択が最優先された。";
  }
  if (state.refusal === "memory") {
    summary += " 記憶の編集を拒んだあなたに、記録しない贖罪が問われた。";
  }
  if (tension === "high") {
    summary += " 謝罪の内容を求める声と、封印を守る声が、記録庫の前で向き合った。";
  } else {
    summary += " 摩擦はあるが、秘密の抹殺や強制の和解には至っていない。";
  }

  return { summary, outcomes, tension };
}

export function renderOutcomeCards(outcomes) {
  if (!outcomes.length) {
    return `<p class="sim-empty">条項が少なく、謝罪は従来の公開謝罪のままだった。</p>`;
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
  return sim.outcomes.find((o) => o.npc === "sen") || sim.outcomes[0];
}

export function getDeliberationReason() {
  return {
    id: "senApology",
    speaker: "セン",
    text: "パリンプセストで学んだ。謝罪を記録にすると、それは贖罪ではなく演出になる——ただし、被害者の記憶まで奪うな。出発憲章に、記録しない贖罪の隙間を書いて。",
    context: "失うもの: 公開謝罪の伝統 / 状況: 事件#10の再訪後",
  };
}
