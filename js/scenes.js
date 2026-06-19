import { ENDINGS, REFUSALS } from "./state.js";

export function getSceneHandlers(game) {
  const { state, go, renderRefusalPicker, renderPresence, renderCovenant, renderDeliberation, renderEndingPicker, renderEpilogue } = game;

  return {
    title: () =>
      go({
        chapter: "",
        title: "UTOPIA",
        body: `
          <p><em>最後の必要のあと</em></p>
          <p>世界は救われた。もう、誰も救わなくていい。<br>では、人類は何を未来に手渡すのか。</p>
          <blockquote>意味には「取り消せなさ」が必要である。<br>しかし正義には「退出できること」が必要である。</blockquote>
          <p>ブラウザで遊べるインタラクティブ・プロトタイプ（約20分）</p>
        `,
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
        choices: [{ label: "プレゼンス — どちらに居合わせるか", action: () => renderPresence("chapter1") }],
      }),

    chapter1b: () => {
      const metAster = state.flags.metAster;
      go({
        chapter: "第一章",
        title: metAster ? "センの記憶管理室" : "アスターの展望台",
        body: metAster
          ? `
          <p>月・パリンプセスト。記録の海の端で、センは静かに言う。</p>
          <blockquote>安全な家があるのに出ていくことを、我々は勇気と呼ぶべきではない。残る者の人生を二流にしてはならない。</blockquote>
          <p>あなたはアスターのもとには間に合わなかった。彼からの手紙だけが届く。「不可逆性は、初めて自由になる」と。</p>
        `
          : `
          <p>土星圏・ホライズン。アスターは門の向こうを見ながら言う。</p>
          <blockquote>これは、人類が初めて自由に選べる、真の不可逆性だ。</blockquote>
          <p>センのもとには間に合わなかった。記録庫から届いたのは短い文だけ。「残ることも、冒険と同じ重さを持て」。</p>
        `,
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
        choices: [{ label: "プレゼンス — どちらに参加するか", action: () => renderPresence("chapter2") }],
      }),

    chapter2b: () => {
      if (state.flags.joinedConcert) {
        go({
          chapter: "第二章",
          title: "最後の初演 — 誓約",
          body: `
            <p>会場は完成した。演奏まであと三ヶ月。ソリがあなたを見る。</p>
            <p>「記録しない。再演しない。口伝えも、共同体の規則で禁止する——あなたは、その約束に署名できますか？」</p>
          `,
          location: "アトリエ",
          choices: [
            {
              label: "誓約する — 記録も口伝えもしない",
              hint: "一回性を守る。文化継承の道を狭める",
              action: () => {
                game.addVow({ label: "初演を記録・再演・口伝えしない", with: "ソリ" });
                game.bumpTrust("soli", 2);
                go("chapter3");
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

    chapter3: () =>
      go({
        chapter: "第三章",
        title: "まだ存在しない者たち",
        body: `
          <p>20年が経った。${state.flags.joinedConcert ? "ソリの初演は、伝説ではなく、沈黙として残った。" : "無名の集団は、次世代によって再解釈されている。"}</p>
          <p>子どもたちの代表が、成人を前にこう問う。</p>
          <blockquote>あなたたちが退屈だから、私たちの未来を一つ減らすのですか。</blockquote>
          <p>船団の設計——未来人の同意——を、抽象論ではなく制度として組む時が来た。</p>
        `,
        period: 3,
        choices: [{ label: "コヴナント・グラマー — 制度を試作する", action: () => renderCovenant() }],
      }),

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

  go({
    chapter: "エピローグ",
    title: e.title,
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
