import { ENDINGS, REFUSALS } from "./state.js";
import { say } from "./portraits.js";
import { renderOutcomeCards, getFeaturedQuote } from "./covenant-sim.js";
import {
  renderOutcomeCards as renderEvent04Cards,
  getFeaturedQuote as getEvent04Quote,
} from "./covenant-event-04.js";
import {
  renderOutcomeCards as renderEvent05Cards,
  getFeaturedQuote as getEvent05Quote,
} from "./covenant-event-05.js";
import {
  renderOutcomeCards as renderEvent06Cards,
  getFeaturedQuote as getEvent06Quote,
} from "./covenant-event-06.js";
import {
  renderOutcomeCards as renderEvent07Cards,
  getFeaturedQuote as getEvent07Quote,
} from "./covenant-event-07.js";
import {
  renderOutcomeCards as renderEvent08Cards,
  getFeaturedQuote as getEvent08Quote,
} from "./covenant-event-08.js";
import {
  renderOutcomeCards as renderEvent12Cards,
  getFeaturedQuote as getEvent12Quote,
} from "./covenant-event-12.js";

export function getSceneHandlers(game) {
  const {
    state,
    go,
    renderRefusalPicker,
    renderPresence,
    renderCovenant,
    renderEvent04Covenant,
    renderEvent05Covenant,
    renderEvent06Covenant,
    renderEvent07Covenant,
    renderEvent08Covenant,
    renderEvent12Covenant,
    renderAtelierImprov,
    renderForgeTryon,
    renderDeliberation,
    renderEndingPicker,
    renderEpilogue,
  } = game;

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
          ${state.refusal === "family" ? "<p>あなたはかつて<strong>家族</strong>を拒んだ。センは言う。「残る者も、血縁以外の絆で生きられる——それを、二流と呼ぶな」</p>" : ""}
          ${state.refusal === "immortality" ? "<p>あなたは<strong>永遠の生命</strong>を拒んだ。センは続ける。「終わりのない時間に、『残る』選択は軽くなる——だからこそ、重さを問う」</p>" : ""}
          <p>あなたはアスターのもとには間に合わなかった。彼からの手紙だけが届く。「不可逆性は、初めて自由になる」と。</p>
        `
          : `
          <p>土星圏・ホライズン。アスターは門の向こうを見つめている。</p>
          ${say("aster", "これは、人類が初めて自由に選べる、真の不可逆性だ。")}
          ${state.refusal === "immortality" ? "<p>あなたは<strong>永遠の生命</strong>を拒んだ。アスターが聞く。「終わりを選べる今、なぜ門に行く必要がある——と、残る者は言う。あなたはどう答える」</p>" : ""}
          ${state.refusal === "fame" ? "<p>あなたは<strong>名声</strong>を拒んだ。アスターは続ける。「誰にも記録されない出発に、意味はあるか。あるなら、それは私たちだけの意味だ」</p>" : ""}
          <p>センのもとには間に合わなかった。記録庫から届いたのは短い文だけ。「残ることも、冒険と同じ重さを持て」。</p>
        `,
        speaker: metAster ? "sen" : "aster",
        choices: [{ label: "第二章へ — 約束の重さ", action: () => go("chapter1_bridge") }],
      });
    },

    chapter1_bridge: () =>
      go({
        chapter: "第一章",
        title: "感覚の共有期間",
        body: `
          <p>金星・コーラス。ここでは、限られた期間だけ感覚を分かち合う共同体がある。</p>
          ${say("io", "触れ合うことは、溶けることではない。切れる保証があるから、ここに来られる。")}
          <p>第二章の前に、ここで試行を見届けるかどうかを選べる。</p>
        `,
        location: "コーラス",
        mood: "chorus",
        art: "chorus",
        speaker: "io",
        choices: [
          {
            label: "感覚の共有期間を見届ける（事件 #06）",
            hint: "関係の深化・自己の境界・退出後の記憶",
            action: () => go("event06_intro"),
          },
          {
            label: "第二章へ進む — 約束の重さ",
            action: () => go("chapter2"),
          },
        ],
      }),

    event06_intro: () =>
      go({
        chapter: "第一章",
        title: "感覚の共有期間 — 設計",
        body: `
          <p>イオは共有室の設計図を見せる。三つの円が重なり、境界線だけが保たれている。</p>
          ${state.refusal === "collective" ? "<p>あなたはかつて<strong>集団意識</strong>——境界の溶解——を拒んだ。イオは、切れる共有を試している。</p>" : ""}
          ${state.refusal === "family" ? "<p>あなたはかつて<strong>家族</strong>——血縁による義務——を拒んだ。ここでは、選ばれた親密さだけが共有される。</p>" : ""}
          ${say("io", "深めることと、消えることは違う。条項を選び、三年の試行を始めよう。")}
        `,
        location: "コーラス",
        mood: "chorus",
        art: "chorus",
        speaker: "io",
        choices: [
          {
            label: "コヴナント・グラマー — 共有期間の条項を組む",
            action: () => renderEvent06Covenant(),
          },
        ],
      }),

    event06_revisit: () => {
      const sim = state.event06Sim || { summary: "", outcomes: [], tension: "medium" };
      const quote = getEvent06Quote(sim);
      go({
        chapter: "第一章",
        title: "感覚の共有期間 — 三年後",
        body: `
          <p class="sim-lead">${sim.summary}</p>
          ${renderEvent06Cards(sim.outcomes)}
          <p>共有は深化した。境界は完全には消えなかった。退出した者の記憶は、外部へ持ち出されなかった——それが、残った者の安心にもなった。</p>
          ${quote ? say(quote.npc, quote.quote) : ""}
        `,
        location: "コーラス",
        mood: sim.tension === "high" ? "vow" : "chorus",
        art: "chorus",
        speaker: quote?.npc,
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

    atelier_improv_intro: () =>
      go({
        chapter: "第二章",
        title: "初演のリハーサル — 即興",
        body: `
          <p>会場の骨組みが立ち上がる。ソリは指揮棒を置き、あなたを円陣に招く。</p>
          ${state.refusal === "art" ? "<p>あなたは<strong>完成</strong>を拒んだ。ソリは言う。「即興には完成がない——それでも、作品と呼べるか」</p>" : ""}
          ${state.refusal === "fame" ? "<p>あなたは<strong>名声</strong>を拒んだ。ここでは、聴衆も記録もない。居合わせた者だけが、音を持つ。</p>" : ""}
          ${say("soli", "録音しない。再演もしない。今夜の拍だけを、初演の骨格にしよう。")}
          <p>身体的実践（SYS-07）——拍に合わせて即興する。二度と同じ演奏はできない。</p>
        `,
        location: "アトリエ",
        mood: "mars",
        art: "atelier",
        speaker: "soli",
        choices: [
          {
            label: "即興リハーサルに参加する",
            hint: "Space / タップ — 拍の輪が重なる瞬間に奏でる",
            action: () => renderAtelierImprov(),
          },
          {
            label: "舞台裏の作業だけ手伝う",
            action: () => {
              state.flags.atelier_improv_skipped = true;
              go("chapter2b");
            },
          },
        ],
      }),

    atelier_improv_result: () => {
      const r = state.improvResult;
      go({
        chapter: "第二章",
        title: "即興のあと — 誓約へ",
        body: `
          <p>演奏ID <code>${r?.signature || "—"}</code> — この即興は、もう存在しない。</p>
          <p class="sim-lead">${r?.lead || ""}</p>
          ${say("soli", r?.soliQuote || "初演の準備を続けよう。")}
          <p>会場は完成に近づいた。いよいよ、誓約の話になる。</p>
        `,
        location: "アトリエ",
        mood: "vow",
        art: "atelier",
        speaker: "soli",
        choices: [{ label: "最後の初演 — 誓約の場へ", action: () => go("chapter2b") }],
      });
    },

    chapter2b: () => {
      if (state.flags.joinedConcert) {
        go({
          chapter: "第二章",
          title: "最後の初演 — 誓約",
          body: `
            <p>会場は完成した。演奏まであと三ヶ月。ソリが静かにこちらを見る。</p>
            ${state.refusal === "art" ? "<p>あなたは<strong>芸術家としての成功</strong>——完成という名の固定——を拒んだ。ソリは言う。「この曲は完成する。ただし、二度と再演しない——それでも、作品と呼べるか」</p>" : ""}
            ${state.refusal === "fame" ? "<p>あなたは<strong>名声</strong>を拒んだ。ソリは続ける。「誰も知らない演奏に、あなたは居合わせるか。居合わせた者だけが、それを持つ」</p>" : ""}
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
                go("chapter2_bridge");
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
            ${state.refusal === "fame" ? "<p>あなたは<strong>名声</strong>を拒んだ。ここでは、名前すら持ち出せない——記録に残ることを避けたあなたに、この共同体は都合がいい。</p>" : ""}
            ${state.refusal === "family" ? "<p>あなたは<strong>家族</strong>を拒んだ。血縁のない者だけが、匿名で集まっている——義務ではなく、選んだ関係だけが残る。</p>" : ""}
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
                go("chapter2_bridge");
              },
            },
            {
              label: "誓約しない",
              action: () => go("chapter2_bridge"),
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
            action: () => go("chapter2_bridge"),
          },
        ],
      }),

    chapter2_bridge: () =>
      go({
        chapter: "第二章",
        title: "百年庭園",
        body: `
          <p>地球・コモン・ガーデン。百年かけて一つの庭を完成させる共同体がある——と、人々は言う。</p>
          ${say("haru", "完成は目標であって、期限ではない。去る人も、残る人も、どちらも正しい。")}
          <p>第三章の前に、ここで試行を見届けるかどうかを選べる。</p>
        `,
        location: "コモン・ガーデン",
        mood: "garden",
        art: "garden",
        speaker: "haru",
        choices: [
          {
            label: "百年庭園の試験を見届ける（事件 #05）",
            hint: "完成の遅延・放棄の自由・世代交代",
            action: () => go("event05_intro"),
          },
          {
            label: "第三章へ進む — 未来人の問い",
            action: () => go("chapter3"),
          },
        ],
      }),

    event05_intro: () =>
      go({
        chapter: "第二章",
        title: "百年庭園 — 設計",
        body: `
          <p>ハルは設計図を広げる。回廊は42%しか繋がっていない。</p>
          ${state.refusal === "art" ? "<p>あなたはかつて<strong>芸術家としての成功</strong>——完成——を拒んだ。ハルはそれを知っている。</p>" : ""}
          ${say("haru", "この庭は、百年後に完成するかもしれない。完成しないかもしれない。どちらも失敗ではない。")}
          <p>条項を選び、十年の試行を始めよう。</p>
        `,
        location: "コモン・ガーデン",
        mood: "garden",
        art: "garden",
        speaker: "haru",
        choices: [
          {
            label: "コヴナント・グラマー — 庭園の条項を組む",
            action: () => renderEvent05Covenant(),
          },
        ],
      }),

    event05_revisit: () => {
      const sim = state.event05Sim || { summary: "", outcomes: [], tension: "medium" };
      const quote = getEvent05Quote(sim);
      go({
        chapter: "第二章",
        title: "百年庭園 — 十年後",
        body: `
          <p class="sim-lead">${sim.summary}</p>
          ${renderEvent05Cards(sim.outcomes)}
          <p>庭は未完成のまま、来園者を増やした。世代は交代し、創設者の半分は不満を残した——それでも、暴力はなかった。</p>
          ${quote ? say(quote.npc, quote.quote) : ""}
        `,
        location: "コモン・ガーデン",
        mood: sim.tension === "high" ? "vow" : "garden",
        art: "garden",
        speaker: quote?.npc,
        choices: [{ label: "第三章へ — 未来人の問い", action: () => go("chapter3") }],
      });
    },

    chapter3: () =>
      go({
        chapter: "第三章",
        title: "まだ存在しない者たち",
        body: `
          <p>20年が経った。${state.flags.joinedConcert ? "ソリの初演と、その後の沈黙の争いが、共同体に深い亀裂を残した。" : "無名の集団は、次世代によって再解釈されている。"}</p>
          ${state.refusal === "immortality" ? "<p>あなたは<strong>永遠の生命</strong>を拒んだ。子ども代表が言う。「私たちは終わりのある存在として生まれる——その前提を、憲章に書いて」</p>" : ""}
          ${state.refusal === "family" ? "<p>あなたは<strong>家族</strong>を拒んだ。子ども代表は続ける。「血縁で未来を縛らないで。再選択の権利を、条文に」</p>" : ""}
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
            label: "アビス — 深層の命名（事件 #07）",
            hint: "驚異の保護 × 知の公開 × 探索のリスク",
            action: () => go("event07_intro"),
          },
          {
            label: "ジェネシス・フォージ — 新身体の試着（事件 #08）",
            hint: "生成の自由 × 不可逆変更 × 子どもの同意",
            action: () => go("event08_intro"),
          },
          {
            label: "ホライズン — 出発憲章の試行（事件 #03）",
            hint: "未来人の同意を制度として組む",
            action: () => renderCovenant(),
          },
        ],
      }),

    event08_intro: () =>
      go({
        chapter: "第三章",
        title: "新身体の試着",
        body: `
          <p>水星・ジェネシス・フォージ。ここでは、新しい身体・感覚・生物種が試される——未来への贈り物か、勝手な設計か。</p>
          ${state.refusal === "immortality" ? "<p>あなたは<strong>永遠の生命</strong>を拒んだ。不可逆変更の重さが、ここでは日常だ。</p>" : ""}
          ${state.refusal === "family" ? "<p>あなたは<strong>家族</strong>を拒んだ。子ども代表が言う。「身体の継承も、血縁で縛らないで」</p>" : ""}
          ${say("child", "試着は14日で戻せる。不可逆変更は、別の契約——それを、条文に書いて。")}
          ${say("lin", "設計図を公開しなければ、未来は盲目的になる——ただし、読める者が限られることもある。")}
          <p>3D空間で<strong>試着室</strong>へ近づき、<strong>E</strong>で調べてから、身体試着または条項設計へ。</p>
        `,
        period: 3,
        location: "ジェネシス・フォージ",
        mood: "forge",
        art: "forge",
        speaker: "child",
        choices: [
          {
            label: "身体試着 — 感覚3軸を配分する（SYS-07）",
            hint: "視覚・触覚・平衡に5点配分。14日で戻れる",
            action: () => renderForgeTryon(),
          },
          {
            label: "試着せず — 条項だけ組む",
            action: () => renderEvent08Covenant(),
          },
        ],
      }),

    event08_tryon_result: () => {
      const r = state.forgeTryonResult;
      go({
        chapter: "第三章",
        title: "試着のあと",
        body: `
          <p>試着ID <code>${r?.signature || "—"}</code> — 14日後、元の身体に戻る。</p>
          <p class="sim-lead">${r?.lead || ""}</p>
          ${say("child", "戻れる試着と、戻れない変更——その境界を、共同体で守ろう。")}
          <p>フォージの条項を、これから組む。</p>
        `,
        location: "ジェネシス・フォージ",
        mood: "forge",
        art: "forge",
        speaker: "child",
        choices: [{ label: "コヴナント・グラマー — フォージの条項を組む", action: () => renderEvent08Covenant() }],
      });
    },

    event08_revisit: () => {
      const sim = state.event08Sim || { summary: "", outcomes: [], tension: "medium" };
      const quote = getEvent08Quote(sim);
      go({
        chapter: "第三章",
        title: "新身体の試着 — 三年後",
        body: `
          <p class="sim-lead">${sim.summary}</p>
          ${renderEvent08Cards(sim.outcomes)}
          <p>可逆試着、未成年同意、設計公開——条項は実行されたが、一部は「限定公開」という抜け道を invent した。</p>
          ${quote ? say(quote.npc, quote.quote) : ""}
          <p>フォージでの経験は、出発憲章にも影響を与えるだろう。</p>
        `,
        period: 3,
        location: "ジェネシス・フォージ",
        mood: sim.tension === "high" ? "vow" : "forge",
        art: "forge",
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

    event07_intro: () =>
      go({
        chapter: "第三章",
        title: "深層の命名",
        body: `
          <p>エウロパ・アビス。氷の下の海で、未命名の生物と未公開のデータが同時に存在する。</p>
          ${state.refusal === "fame" ? "<p>あなたは<strong>名声</strong>を拒んだ。ナギは「発見者なき記録」を試している。</p>" : ""}
          ${state.refusal === "immortality" ? "<p>あなたは<strong>永遠の生命</strong>を拒んだ。不可逆な深層リスクが、ここでは日常だ。</p>" : ""}
          ${say("nagi", "名前は、捕まえることでもある。急ぐ名前は、所有の始まりだ。")}
          ${say("lin", "データを公開しなければ、未来は盲目的になる——ただし、驚異を要約できないものもある。")}
          <p>3D空間で<strong>深層クレバス</strong>へ近づき、<strong>E</strong>で調べてから、条項を提案しよう。</p>
        `,
        period: 3,
        location: "アビス",
        mood: "abyss",
        art: "abyss",
        speaker: "nagi",
        choices: [
          {
            label: "コヴナント・グラマー — 深層探査の条項を組む",
            action: () => renderEvent07Covenant(),
          },
        ],
      }),

    event07_revisit: () => {
      const sim = state.event07Sim || { summary: "", outcomes: [], tension: "medium" };
      const quote = getEvent07Quote(sim);
      go({
        chapter: "第三章",
        title: "深層の命名 — 五年後",
        body: `
          <p class="sim-lead">${sim.summary}</p>
          ${renderEvent07Cards(sim.outcomes)}
          <p>仮名期間、公開義務、引き上げ——条項は実行されたが、探査者たちは<strong>要約版</strong>という抜け道を invent した。</p>
          ${quote ? say(quote.npc, quote.quote) : ""}
          <p>アビスでの経験は、出発憲章にも影響を与えるだろう。</p>
        `,
        period: 3,
        location: "アビス",
        mood: sim.tension === "high" ? "vow" : "abyss",
        art: "abyss",
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
        choices: [{ label: "第四章 — 命令しない神", action: () => go("chapter4") }],
      });
    },

    chapter4: () =>
      go({
        chapter: "第四章",
        title: "命令しない神",
        body: `
          <p>一部の市民が《モザイク》——全人類の経験を読み、「次に目指すべき目的」を<strong>提案するだけ</strong>の知性——の建造を提案した。</p>
          ${state.refusal === "collective" ? "<p>あなたは<strong>集団意識</strong>——境界の溶解——を拒んだ。カエデは言う。「モザイクは溶けない。ただ、皆が同じ答えを選び始めた——それは、境界を保ったまま起きうる」</p>" : ""}
          ${say("kaede", "これは神ではない。文明が自分自身へ送る手紙だ。")}
          ${say("sen", "命令しなくても、誰もがその答えを信じるなら、それは神と何が違うのか。")}
          <p>問題は暴走ではない。自由な人間が、自発的に判断を委ねることだ。</p>
          <p>出発憲章の議会の前に、モザイクの存続条件を設計するかどうかを選べる。</p>
        `,
        period: 4,
        location: "ホライズン",
        mood: "council",
        art: "mosaic",
        speaker: "kaede",
        choices: [
          {
            label: "モザイクの存続条件を設計する（事件 #12）",
            hint: "命令権なし・承認投票・少数派証言",
            action: () => renderEvent12Covenant(),
          },
          {
            label: "モザイク試行を見送る — 出発憲章の議会へ",
            hint: "《命令しない神》エンディングは条件付きでロック",
            action: () => {
              state.flags.ev12_skipped = true;
              go("chapter4b");
            },
          },
        ],
      }),

    event12_revisit: () => {
      const sim = state.event12Sim || { summary: "", outcomes: [], tension: "medium" };
      const quote = getEvent12Quote(sim);
      go({
        chapter: "第四章",
        title: "モザイク — 一年後",
        body: `
          <p class="sim-lead">${sim.summary}</p>
          ${renderEvent12Cards(sim.outcomes)}
          <p>モザイクは暴走していない。それでも、人々は<strong>自発的に</strong>その言葉を引用し始めた。</p>
          ${quote ? say(quote.npc, quote.quote) : ""}
          ${sim.safeguards ? "<p>あなたが選んだ安全装置は、機能している——少なくとも、今のところは。</p>" : "<p>安全装置が弱い。反対者の声が、祝祭の中でかき消されつつある。</p>"}
        `,
        period: 4,
        location: "ホライズン",
        mood: sim.tension === "high" ? "vow" : "finale",
        art: "mosaic",
        speaker: quote?.npc,
        choices: [{ label: "出発憲章の議会へ", action: () => go("chapter4b") }],
      });
    },

    chapter4b: () =>
      go({
        chapter: "第四章",
        title: "理由の地図",
        body: `
          <p>あなたが提案した制度は、五年の試行を経た。${state.flags.ev12_done ? "モザイクの一年評価も、議題に加わる。" : ""}支持者と反対者が、公共議会に集う。</p>
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
  if (state.flags.ev05_done) processNote += "終わらない庭の試行を見届けた。";
  if (state.flags.ev06_done) processNote += "切れる共有の試行を見届けた。";
  if (state.flags.ev07_done) processNote += "未命名の驚異の試行を見届けた。";
  if (state.flags.ev12_done) processNote += "命令しない神の条件を設計した。";
  if (state.flags.ev12_skipped) processNote += "モザイク試行を見送った。";
  if (state.ending === "mosaic" && state.event12Sim?.safeguards) {
    processNote += "安全装置付きでモザイクが未来へ残った。";
  }

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
