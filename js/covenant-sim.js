/**
 * コヴナント試行の5年後シミュレーション結果を生成する。
 * 単一スコアは出さず、具体的な人物・解釈・摩擦の叙事を返す。
 */

const OUTCOMES = {
  exitImmediate: {
    stat: "第1年に12%が退出",
    detail: "共同体は小さくなったが、残った者の同意はより明確になった。",
    npc: "sen",
    quote: "去った人々の記録も、消さないでください。それも歴史です。",
  },
  consent5: {
    stat: "更新儀式が年2回の祭典になった",
    detail: "透明性は高まったが、「更新疲れ」で形式化する派も現れた。",
    npc: "aster",
    quote: "同意を求めるたびに、本当に選んでいるのかと問われる。それは悪いことかもしれない。",
  },
  memoryLimited: {
    stat: "強制編集の告発はゼロ",
    detail: "美化は防げた。一方、治療を拒んだまま苦しむ者も少数いる。",
    npc: "sen",
    quote: "忘れられる権利と、忘れられない痛みのあいだに、制度だけでは置けない人がいる。",
  },
  expiry50: {
    stat: "40年後の設計会議がすでに始まっている",
    detail: "失効条項が希望にも不安にもなっている。創設者は「まだ早い」と言う。",
    npc: "child",
    quote: "50年後のために今から争うのは、私たちの時代を飛ばすことですか。",
  },
  childChoice: {
    stat: "青年評議会が憲章試行の共同設計者になった",
    detail: "未来人の再選択権は機能している。成人前の不安も増えた。",
    npc: "child",
    quote: "選択肢があると知っているだけで、夜眠れない夜もある。それでも、ないよりはマシです。",
  },
  dissentRecord: {
    stat: "反対者の全文が公共档に残っている",
    detail: "議論は長引くが、暴力には至らない。「安定した異議」が実在する。",
    npc: "sen",
    quote: "記録された反対は、敗北ではない。次の設計への招待状だ。",
  },
};

export function getActiveCovenantFlags(state) {
  return Object.keys(state.flags).filter((k) => k.startsWith("cov_"));
}

export function simulateFiveYears(state) {
  const active = getActiveCovenantFlags(state).map((k) => k.replace("cov_", ""));
  const outcomes = active.map((key) => OUTCOMES[key]).filter(Boolean);

  if (outcomes.length === 0) {
    return {
      summary: "最小限の条項だけで試行が始まった。",
      outcomes: [],
      tension: "medium",
    };
  }

  const hasChild = state.flags.cov_childChoice;
  const hasDissent = state.flags.cov_dissentRecord;
  const hasExit = state.flags.cov_exitImmediate;

  let tension = "medium";
  if (!hasChild && !hasDissent) tension = "high";
  if (hasChild && hasDissent && hasExit) tension = "low";

  return {
    summary: buildSummary(outcomes, tension, state),
    outcomes,
    tension,
    stats: outcomes.map((o) => o.stat),
  };
}

function buildSummary(outcomes, tension, state) {
  const parts = [`五年。あなたが提案した制度は、${outcomes.length}の条項を軸に試行された。`];

  if (tension === "high") {
    parts.push("未来人の再選択も異議の記録も弱く、反対派は「閉じた憲章」と呼び始めている。");
  } else if (tension === "low") {
    parts.push("摩擦はあるが、退出権と異議の記録が争いを暴力に変えていない。");
  } else {
    parts.push("人々はルールを解釈し、抜け道を見つけ、儀式化し、次世代へ渡し始めた。");
  }

  if (state.flags.refusedConcertVow) {
    parts.push("アトリエから持ち込まれた「約束と記憶」の争いが、船団憲章の議論にも波及している。");
  }

  if (state.flags.ev04_done) {
    parts.push("パリンプセストの記憶特区で培われた「削除と匿名化の隙間」が、憲章起草の論点になっている。");
  }

  return parts.join("");
}

export function renderOutcomeCards(outcomes) {
  if (!outcomes.length) {
    return `<p class="sim-empty">目立った変化は、まだ語られていない。</p>`;
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

export function getFeaturedQuote(state, sim) {
  if (sim.outcomes.length === 0) return null;
  const preferred = state.flags.cov_childChoice
    ? sim.outcomes.find((o) => o.npc === "child")
    : sim.outcomes[sim.outcomes.length - 1];
  return preferred || sim.outcomes[0];
}
