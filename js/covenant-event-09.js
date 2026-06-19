/**
 * コヴナント事件 #09 — 競技の一生（アトリエ）
 */

const CLAUSES = [
  {
    key: "retireFree",
    label: "引退は権利——共同体は「逃げ」と呼ばない",
    desc: "熟達の极致と、去る自由を両立",
  },
  {
    key: "noLifetimeLock",
    label: "20年超の生涯専念契約を禁止",
    desc: "不可逆な「一生」を売らない",
  },
  {
    key: "teachQuota",
    label: "熟達者は5年に1年を他者への時間として確保",
    desc: "競技が他者の時間を独占しない",
  },
  {
    key: "youthCap",
    label: "15歳未満の競技専念契約を禁止",
    desc: "子どもの人生を先取りしない",
  },
  {
    key: "rankHonor",
    label: "引退後も段位・記録は消さないが更新義務は停止",
    desc: "去った者の熟達を消さない",
  },
];

const OUTCOMES = {
  retireFree: {
    stat: "第3年に28%が引退——非難は記録されなかった",
    detail: "引退は失敗と呼ばれなくなった。残った者は、選んで残ったと言える。",
    npc: "soli",
    quote: "音楽も競技も、終わりを選べるから、始められる。",
  },
  noLifetimeLock: {
    stat: "生涯契約の申請ゼロ——代わりに10年更新が主流",
    detail: "「一生」という商品は消えた。ただし、短期更新の疲労が新しい摩擦になった。",
    npc: "child",
    quote: "一生を売らないで。終わりのある大人が、有限の競技を設計する。",
  },
  teachQuota: {
    stat: "他者時間の確保率71%——29%は「例外申請」という抜け道",
    detail: "熟達者の時間が他者に向いた。例外申請は、新しい階層を生んだ。",
    npc: "soli",
    quote: "極限の技は、独りよがりではない。誰かの時間を奪うな。",
  },
  youthCap: {
    stat: "15歳未満の専念契約ゼロ——ただし「見学専念」という新語が生まれた",
    detail: "子どもは守られた。言葉の抜け道は、また invent された。",
    npc: "child",
    quote: "競技の前に、子どもであること——それを条文に。",
  },
  rankHonor: {
    stat: "引退者の段位100%存続——更新停止は「沈黙の栄誉」として儀式化",
    detail: "記録は消えなかった。去った者は、共同体の年表に残る。",
    npc: "sen",
    quote: "去った人の熟達も、歴史の一部だ。消さないで。",
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

export function simulateEvent09(state) {
  const active = CLAUSES.map((c) => c.key).filter((k) => state.flags[`ev09_${k}`]);
  const outcomes = active.map((k) => OUTCOMES[k]).filter(Boolean);
  const life = state.arenaLifeResult;

  let tension = "medium";
  if (state.flags.ev09_retireFree && state.flags.ev09_youthCap) tension = "low";
  if (!state.flags.ev09_retireFree && !state.flags.ev09_noLifetimeLock) tension = "high";

  let summary =
    "十年。アトリエで、熟達の极致と引退の権利と他者への時間が試された。";
  if (life?.profile === "dedicated") {
    summary += " あなたが配分した人生は熟達偏重——共同体は「最後の選手」として引用した。";
  } else if (life?.profile === "relational") {
    summary += " 他者への時間を厚く配分した人生が、模範として記録された。";
  } else if (life?.profile === "earlyRest") {
    summary += " 早期引退を選ぶ人生が、引退権の実効性を示した。";
  }
  if (state.refusal === "immortality") {
    summary += " 永遠の生命を拒んだあなたに、終わりのある競技が問われた。";
  }
  if (tension === "high") {
    summary += " 生涯契約の圧力が残り、「最後の選手」という無言の期待がある。";
  } else {
    summary += " 摩擦はあるが、強制の引退拒否には至っていない。";
  }

  return { summary, outcomes, tension };
}

export function renderOutcomeCards(outcomes) {
  if (!outcomes.length) {
    return `<p class="sim-empty">条項が少なく、アトリエは従来の「生涯専念」物語のままだった。</p>`;
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
  return sim.outcomes.find((o) => o.npc === "soli") || sim.outcomes[0];
}

export function getDeliberationReason() {
  return {
    id: "soliArena",
    speaker: "ソリ",
    text: "アトリエで学んだ。極限の熟達は、他者の時間を奪うな——引退できる競技だけが、未来に渡せる。出発憲章に、去る権利を書いて。",
    context: "失うもの: 生涯の物語 / 状況: 事件#09の再訪後",
  };
}
