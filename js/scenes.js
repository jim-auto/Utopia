import { ENDINGS, REFUSALS } from "./state.js";
import { say } from "./portraits.js";
import { renderOutcomeCards, getFeaturedQuote } from "./covenant-sim.js";
import {
  renderOutcomeCards as renderEvent04Cards,
  getFeaturedQuote as getEvent04Quote,
} from "./covenant-event-04.js";

export function getSceneHandlers(game) {
  const { state, go, renderRefusalPicker, renderPresence, renderCovenant, renderEvent04Covenant, renderDeliberation, renderEndingPicker, renderEpilogue } = game;

  return {
    title: () =>
      go({
        chapter: "",
        title: "UTOPIA",
        body: `
          <p><em>最後の必要のあと</em></p>
          <p>世界は救われた。もう、誰も救わなくていい。<br>では、人類は何を未来に手渡すのか。</p>
          <blockquote>意味には「取り消せなさ」が必要である。<br>しかし正義には「退出できること」が必要である。</blockquote>
        `,
        mood: "cosmos",
        art: "title",
        titleScreen: true,
        choices: [
          {
            label: "始める",
            primary: true,
            action: () => go("refusal"),
          },
        ],
        hud: false,
      }),

    refusal: () => renderRefusalPicker(),

    prologue1: () =>
      go({
        chapter: "序章",
        title: "勝利の翌日",
        body: `
          <p>事件は起きない。それが今日のルールだ。</p>
          <p>海上都市では百年祭が続いている。子どもたちが光の糸を渡し、老人が百年前の友人と再会している。住居は誰でも選べる。医療も、食事も、時間も、足りている。</p>
          <p>あなたは《可能未来の証人》として呼ばれる前の、普通の一日を歩く。</p>
        `,
        period: 0,
        location: "コモン・ガーデン",
        mood: "garden",
        art: "garden",
        choices: [{ label: "祭りの広場へ", action: () => go("prologue2") }],
      }),

    prologue2: () =>
      go({
        chapter: "序章",
        title: "壊すべき偽物ではない",
        body: `
          <p>演奏が終わると、観客は拍手より先に、隣の人と目を合わせる。記録も、配信も、再生もない。ただ、その場にいた。</p>
          <p>誰かが言う。「退屈？」——笑いが返る。退屈なら、ここを去ればいい。誰も止めない。</p>
          <p>あなたは${refusalLine(state)}</p>
        `,
        mood: "dawn",
        art: "festival",
        choices: [{ label: "港へ向かう", action: () => go("prologue3") }],
      }),

    prologue3: () =>
      go({
        chapter: "序章",
        title: "地平門",
        body: `
          <p>太陽系の外縁で、自然発生したワームホールが確認された。</p>
          <p>向こう側には、人間が住める星系がある。罠ではない。観測も正しい。ただし——<strong>約90年後に門は閉じ、通過者は二度と戻れない。</strong></p>
          <p>避難命令はない。行く必要もない。それでも、志願者は数百万人に及ぶ。</p>
          <blockquote>何の必要もないのに、我々は楽園を去るべきか。</blockquote>
        `,
        mood: "cosmos",
        art: "gate",
        choices: [{ label: "証人としての任務が始まる", action: () => go("chapter1") }],
      }),

    chapter1: () =>
      go({
        chapter: "第一章",
        title: "誰も行く必要はない",
        body: `
          <p>あなたの仕事は命令することではない。聞き、滞在し、提案し、証言する。</p>
          <p>まず、出発を望む者と、残る者の声を聞く時が来た。同じ日に、二人とも会いたがっている——だが、あなたの<strong>注意</strong>は一つしかない。</p>
        `,
        period: 1,
        location: "太陽系",
        mood: "cosmos",
        art: "horizon",
        choices: [{ label: "プレゼンス — どちらに居合わせるか", action: () => renderPresence("chapter1") }],
      }),

    chapter1b: () => {
      const metAster = state.flags.metAster;
      go({
        chapter: "第一章",
        title: metAster ? "センの記憶管理室" : "アスターの展望台",
        location: metAster ? "パリンプセスト" : "ホライズン",
        mood: metAster ? "memory" : "cosmos",
        art: metAster ? "palimpsest" : "horizon",
        body: metAster
          ? `
          <p>月・パリンプセスト。記録の海の端で、センがあなたを迎える。</p>
          ${say("sen", "安全な家があるのに出ていくことを、我々は勇気と呼ぶべきではない。残る者の人生を二流にしてはならない。")}
          <p>あなたはアスターのもとには間に合わなかった。彼からの手紙だけが届く。「不可逆性は、初めて自由になる」と。</p>
        `
          : `
          <p>土星圏・ホライズン。アスターは門の向こうを見つめている。</p>
          ${say("aster", "これは、人類が初めて自由に選べる、真の不可逆性だ。")}
          <p>センのもとには間に合わなかった。記録庫から届いたのは短い文だけ。「残ることも、冒険と同じ重さを持て」。</p>
        `,
        speaker: metAster ? "sen" : "aster",
        choices: [{ label: "第二章へ — 約束の重さ", action: () => go("chapter2") }],
      });
    },

    chapter2: () =>
      go({
        chapter: "第二章",
        title: "約束の重さ",
        body: `
          <p>火星・アトリエ。音楽家ソリは、一度だけ演奏され、録音も再演もされない交響曲を作っている。</p>
          <p>「価値あるのは希少なデータではない。数千人が<em>一度だけ</em>と約束することだ」</p>
          <p>同じ期間、地球では「個人名を使わない集団」の試験が始まる。あなたはどちらに<strong>時間を預ける</strong>か。</p>
        `,
        period: 2,
        location: "火星 / 地球",
        mood: "mars",
        art: "atelier",
        choices: [{ label: "プレゼンス — どちらに参加するか", action: () => renderPresence("chapter2") }],
      }),

    chapter2b: () => {
      if (state.flags.joinedConcert) {
        go({
          chapter: "第二章",
          title: "最後の初演 — 誓約",
          body: `
            <p>会場は完成した。演奏まであと三ヶ月。ソリが静かにこちらを見る。</p>
            ${say("soli", "記録しない。再演しない。口伝えも、共同体の規則で禁止する——あなたは、その約束に署名できますか？")}
          `,
          location: "アトリエ",
          mood: "vow",
          art: "atelier",
          speaker: "soli",
          choices: [
            {
              label: "誓約する — 記録も口伝えもしない",
              hint: "一回性を守る。文化継承の道を狭める",
              action: () => {
                game.addVow({ label: "初演を記録・再演・口伝えしない", with: "ソリ" });
                game.bumpTrust("soli", 2);
                go("chapter2c");
              },
            },
            {
              label: "誓約しない — 個人の記憶までは縛らない",
              hint: "自由を残す。共同体の期待を裏切る",
              action: () => {
                game.bumpTrust("soli", -1);
                game.bumpTrust("children", 1);
                state.flags.refusedConcertVow = true;
                go("chapter3");
              },
            },
          ],
        });
      } else {
        go({
          chapter: "第二章",
          title: "無名の集団 — 誓約",
          body: `
            <p>個人名を使わない村。ここでは、呼ばれ方が毎月変わる。記録も、外部への言及も、試験期間中は禁止されている。</p>
            <p>「退出はいつでもできます。ただし、試験の期間中は、私たちの匿名性を外に持ち出さないでください」</p>
          `,
          location: "コモン・ガーデン",
          mood: "garden",
          art: "garden",
          choices: [
            {
              label: "誓約する — 試験期間中、匿名性を守る",
              action: () => {
                game.addVow({ label: "匿名共同体の秘密を試験期間中守る", with: "無名の集団" });
                go("chapter3");
              },
            },
            {
              label: "誓約しない",
              action: () => go("chapter3"),
            },
          ],
        });
      }
    },

    chapter2c: () =>
      go({
        chapter: "第二章",
        title: "最後の初演 — 二十年後",
        body: `
          <p>二十年。演奏は一度だけ、守られた。沈黙は、共同体の誇りになった。</p>
          <p>だが、当時の演奏者が曲の断片を子どもへ教えたという噂が広がる。共同体は「誓約違反だ」と主張する。</p>
          ${say("soli", "自分の記憶まで、共同体の所有物ではない。")}
          ${say("child", "文化を未来へ伝えないための約束を、文化と呼べるのですか。")}
          <p>正解はない。あなたは、この争いを見届けた。</p>
        `,
        period: 2,
        location: "アトリエ",
        mood: "vow",
        art: "atelier",
        speaker: "child",
        choices: [
          {
            label: "第三章へ — 未来人の問い",
            action: () => go("chapter3"),
          },
        ],
      }),

    chapter3: () =>
      go({
        chapter: "第三章",
        title: "まだ存在しない者たち",
        body: `
          <p>20年が経った。${state.flags.joinedConcert ? "ソリの初演と、その後の沈黙の争いが、共同体に深い亀裂を残した。" : "無名の集団は、次世代によって再解釈されている。"}</p>
          ${say("child", "あなたたちが退屈だから、私たちの未来を一つ減らすのですか。")}
          <p>船団の設計——未来人の同意——を、抽象論ではなく制度として組む時が来た。</p>
        `,
        period: 3,
        location: "ホライズン",
        mood: "law",
        art: "covenant",
        speaker: "child",
        choices: [
          {
            label: "パリンプセスト — 忘れられる権利（事件 #04）",
            hint: "記憶の削除と歴史の連続が衝突する試験",
            action: () => go("event04_intro"),
          },
          {
            label: "ホライズン — 出発憲章の試行（事件 #03）",
            hint: "未来人の同意を制度として組む",
            action: () => renderCovenant(),
          },
        ],
      }),

    event04_intro: () =>
      go({
        chapter: "第三章",
        title: "忘れられる権利",
        body: `
          <p>月・パリンプセスト。記録の海は、人類のすべてに近い。ここでは「忘れる権利」と「歴史を残す義務」が毎日衝突する。</p>
          ${state.refusal === "memory" ? "<p>あなたはかつて<strong>記憶の編集</strong>を拒んだ。今、他者の忘れを制度で守る立場に立っている。</p>" : ""}
          ${say("sen", "本人が望むなら、痛みの記憶は消せるべきだ。ただし、消したこと自体を歴史から消すことはできない。")}
          ${say("lin", "年表に穴が開くたび、未来は盲目的になる。匿名化なら、まだ連続性は保てる。")}
          <p>センとリンのあいだで、特区の試行が始まろうとしている。あなたは条項を提案できる。</p>
        `,
        period: 3,
        location: "パリンプセスト",
        mood: "memory",
        art: "palimpsest",
        speaker: "sen",
        choices: [
          {
            label: "コヴナント・グラマー — 記憶特区の条項を組む",
            action: () => renderEvent04Covenant(),
          },
        ],
      }),

    event04_revisit: () => {
      const sim = state.event04Sim || { summary: "", outcomes: [], tension: "medium" };
      const quote = getEvent04Quote(sim);
      go({
        chapter: "第三章",
        title: "忘れられる権利 — 三年後",
        body: `
          <p class="sim-lead">${sim.summary}</p>
          ${renderEvent04Cards(sim.outcomes)}
          <p>削除、匿名化、再記録の禁止——条項は実行されたが、人々は<strong>解釈</strong>し、<strong>回避記録</strong>という抜け道を invent した。</p>
          ${quote ? say(quote.npc, quote.quote) : ""}
          <p>パリンプセストでの経験は、これから起草する出発憲章にも影響を与えるだろう。</p>
        `,
        period: 3,
        location: "パリンプセスト",
        mood: sim.tension === "high" ? "vow" : "memory",
        art: "palimpsest",
        speaker: quote?.npc,
        choices: [
          {
            label: "ホライズンへ — 出発憲章の試行を始める",
            action: () => {
              state.location = "ホライズン";
              renderCovenant();
            },
          },
        ],
      });
    },

    chapter3b: () => {
      const sim = state.covenantSim || { summary: "", outcomes: [], tension: "medium" };
      const quote = getFeaturedQuote(state, sim);
      go({
        chapter: "第三章",
        title: "五年後の再訪",
        body: `
          <p class="sim-lead">${sim.summary}</p>
          ${renderOutcomeCards(sim.outcomes)}
          <p>制度は条文どおりに動いていない。人々は<strong>解釈</strong>し、<strong>抜け道</strong>を見つけ、<strong>儀式</strong>に変え、次世代へ渡している。</p>
          ${quote ? say(quote.npc, quote.quote) : ""}
          <p>いよいよ、支持者と反対者が公共議会に集う。</p>
        `,
        period: 3,
        location: "ホライズン",
        mood: sim.tension === "high" ? "vow" : "law",
        art: "covenant",
        speaker: quote?.npc,
        choices: [{ label: "第四章 — 理由の地図", action: () => go("chapter4") }],
      });
    },

    chapter4: () =>
      go({
        chapter: "第四章",
        title: "理由の地図",
        body: `
          <p>あなたが提案した制度は、五年の試行を経た。支持者と反対者が、公共議会に集う。</p>
          <p>ここでの勝利条件は全会一致ではない。<strong>安定した異議</strong>——反対者が賛成しなくても、負担が理解され、退出権が残り、意見が記録されれば、決定は正当になる。</p>
        `,
        period: 4,
        location: "ホライズン",
        mood: "council",
        art: "deliberation",
        choices: [{ label: "議会に入る", action: () => renderDeliberation() }],
      }),

    finale: () =>
      go({
        chapter: "最終章",
        title: "最後の開いた扉",
        body: `
          <p>地平門が閉じる日が近い。最終局面は、ボス戦ではない。</p>
          <p>巨大な公共議会、出発式、最後に会う相手——そして、出発憲章を完成させる儀式。</p>
          <p>あなたがこれまで試した制度、守った約束、見送った出来事、記録した異議。それらすべてが、未来への手渡し方を形作る。</p>
        `,
        period: 5,
        location: "ホライズン",
        mood: "finale",
        art: "gate",
        choices: [{ label: "出発憲章を起草する", action: () => renderEndingPicker() }],
      }),
  };
}

function refusalLine(state) {
  const r = REFUSALS.find((x) => x.id === state.refusal);
  return r ? `かつて<strong>${r.label}</strong>を拒んだ者として、ここにいる。` : "ここにいる。";
}

export function renderEpilogue(game) {
  const { state, go } = game;
  const e = ENDINGS[state.ending];
  const refusal = REFUSALS.find((x) => x.id === state.refusal);

  let processNote = "";
  if (state.vows.length >= 2) processNote += "多くの約束を引き受けた。";
  if (state.missed.length >= 2) processNote += "いくつかの出会いを見送った。";
  if (state.deliberationOutcome === "dissent") processNote += "異議を記録したまま決定した。";
  if (state.flags.refusedConcertVow) processNote += "一回性の誓約を拒んだ。";
  if (state.flags.ev04_done) processNote += "忘れと記録の境界を試した。";

  go({
    chapter: "エピローグ",
    title: e.title,
    mood: "finale",
    art: "ending",
    body: `
      <div class="ending-card">
        <p>${processNote || "静かな選択の積み重ねが、この結末を形作った。"}</p>
        <div class="gain-loss">
          <div class="gain"><strong>得たもの</strong><br>${e.gain}</div>
          <div class="loss"><strong>失うもの</strong><br>${e.loss}</div>
        </div>
        <p style="margin-top:2rem;color:var(--text-muted);font-size:0.9rem;">
          ${refusal ? `あなたが拒んだ${refusal.label}は、今も問い続けている。` : ""}
          <br>同じ結論でも、過程が違えば、文明史は変わる。
        </p>
      </div>
    `,
    choices: [],
  });
}
