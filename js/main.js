import {
  createInitialState,
  REFUSALS,
  ENDINGS,
  addVow,
  addMissed,
  bumpTrust,
} from "./state.js";
import {
  renderScene,
  renderSystem,
  setHud,
  hideHud,
  showRestart,
  hideRestart,
} from "./ui.js";
import { getSceneHandlers, renderEpilogue } from "./scenes.js";
import { miniPortrait } from "./portraits.js";
import { initAmbience, setMood } from "./visuals.js";
import { initAudio, bindAudioToggle } from "./audio.js";
import { initWorld3d, setDiscoverHandler } from "./world3d.js";
import { simulateFiveYears } from "./covenant-sim.js";
import {
  buildClauseForm as buildEvent04Form,
  simulateEvent04,
  getDeliberationExtraReason as getEvent04Reason,
} from "./covenant-event-04.js";
import {
  buildClauseForm as buildEvent05Form,
  simulateEvent05,
  getDeliberationReason as getEvent05Reason,
} from "./covenant-event-05.js";
import {
  buildClauseForm as buildEvent06Form,
  simulateEvent06,
  getDeliberationReason as getEvent06Reason,
} from "./covenant-event-06.js";
import {
  buildClauseForm as buildEvent07Form,
  simulateEvent07,
  getDeliberationReason as getEvent07Reason,
} from "./covenant-event-07.js";
import {
  buildClauseForm as buildEvent12Form,
  simulateEvent12,
  getDeliberationReasons as getEvent12Reasons,
  canUnlockMosaicEnding,
} from "./covenant-event-12.js";

const scenes = {};

function register(name, fn) {
  scenes[name] = fn;
}

export function createGame() {
  let state = createInitialState();

  const game = {
    state,
    go,
    addVow: (v) => addVow(state, v),
    addMissed: (m) => addMissed(state, m),
    bumpTrust: (npc, n) => bumpTrust(state, npc, n),
    renderRefusalPicker,
    renderPresence,
    renderCovenant,
    renderEvent04Covenant,
    renderEvent05Covenant,
    renderEvent06Covenant,
    renderEvent07Covenant,
    renderEvent12Covenant,
    renderDeliberation,
    renderEndingPicker,
    renderEpilogue: () => renderEpilogue(game),
    restart,
  };

  Object.assign(scenes, getSceneHandlers(game));

  function go(sceneNameOrOpts, optsMaybe) {
    if (typeof sceneNameOrOpts === "string") {
      const fn = scenes[sceneNameOrOpts];
      if (fn) fn();
      else console.error("Unknown scene:", sceneNameOrOpts);
      return;
    }

    const opts = sceneNameOrOpts;
    if (opts.period !== undefined) state.period = opts.period;
    if (opts.location) state.location = opts.location;
    if (opts.hud === false) hideHud();
    else setHud(state);

    renderScene({
      chapter: opts.chapter,
      title: opts.title,
      body: opts.body,
      choices: opts.choices,
      mood: opts.mood,
      art: opts.art,
      titleScreen: opts.titleScreen,
      speaker: opts.speaker,
      location: opts.location || state.location,
    });
  }

  function restart() {
    state = createInitialState();
    game.state = state;
    hideRestart();
    go("title");
  }

  function renderRefusalPicker() {
    renderScene({
      chapter: "始まり",
      title: "あなたが拒んだもの",
      body: `<p>ゲーム開始時、主人公は過去に何かを拒否した。それが、あなた自身のテーマと、NPCから受ける問いを変える。</p>`,
      mood: "cosmos",
      art: "refusal",
      choices: REFUSALS.map((r) => ({
        label: r.label,
        hint: r.hint,
        action: () => {
          state.refusal = r.id;
          go("prologue1");
        },
      })),
    });
  }

  function renderPresence(chapterKey) {
    const conflicts = {
      chapter1: {
        left: {
          title: "アスター（ホライズン）",
          desc: "「不可逆性こそが、初めての自由だ」——出発の哲学を聞く",
          flag: "metAster",
          trust: ["aster", 2],
          missed: "センとの対話",
        },
        right: {
          title: "セン（パリンプセスト）",
          desc: "「残る者の人生を二流にするな」——記憶と残留の尊厳",
          flag: "metSen",
          trust: ["sen", 2],
          missed: "アスターとの対話",
        },
        next: "chapter1b",
      },
      chapter2: {
        left: {
          title: "ソリの初演準備（アトリエ）",
          desc: "一度きりの交響曲——会場建設と練習に参加",
          flag: "joinedConcert",
          trust: ["soli", 2],
          missed: "無名の集団の試験",
        },
        right: {
          title: "無名の集団（コモン・ガーデン）",
          desc: "個人名を使わない共同体の試験期間",
          flag: "joinedAnonymous",
          trust: ["sen", 1],
          missed: "ソリの初演準備",
        },
        next: "chapter2b",
      },
    };

    const conflict = conflicts[chapterKey];
    renderSystem({
      title: "プレゼンス — 時間と注意",
      desc: "一つの期間に、重要な出来事へ同時に参加することはできない。見逃した出来事は失敗ではない。しかし、世界はあなたを待たない。",
      systemId: "presence",
      contentHtml: `
        <div class="conflict-box">
          <div class="conflict-side">
            <h3>${conflict.left.title}</h3>
            <p>${conflict.left.desc}</p>
          </div>
          <div class="conflict-divider">同時に<br>選べない</div>
          <div class="conflict-side">
            <h3>${conflict.right.title}</h3>
            <p>${conflict.right.desc}</p>
          </div>
        </div>
      `,
      actions: [
        {
          label: conflict.left.title.split("（")[0] + "へ向かう",
          action: () => {
            state.flags[conflict.left.flag] = true;
            bumpTrust(state, conflict.left.trust[0], conflict.left.trust[1]);
            addMissed(state, conflict.left.missed);
            state.presenceLog.push(conflict.left.title);
            go(conflict.next);
          },
        },
        {
          label: conflict.right.title.split("（")[0] + "へ向かう",
          action: () => {
            state.flags[conflict.right.flag] = true;
            bumpTrust(state, conflict.right.trust[0], conflict.right.trust[1]);
            addMissed(state, conflict.right.missed);
            state.presenceLog.push(conflict.right.title);
            go(conflict.next);
          },
        },
      ],
    });
  }

  function renderEvent04Covenant() {
    const selected = new Set(["personalErase", "thirdPartyBan"]);

    renderSystem({
      title: "コヴナント事件 #04 — 忘れられる権利",
      desc: "記憶保存 × 個人の忘却 × 歴史の連続。正解はない。",
      systemId: "covenant",
      contentHtml: `<div id="event04-form">${buildEvent04Form(selected)}</div>`,
      actions: [
        {
          label: "特区で試行を開始する（3年後に再訪）",
          action: () => {
            document.querySelectorAll("#event04-form input").forEach((input) => {
              if (input.checked) state.flags[`ev04_${input.dataset.key}`] = true;
            });
            state.flags.ev04_done = true;
            state.event04Sim = simulateEvent04(state);
            if (state.flags.ev04_personalErase) bumpTrust(state, "sen", 1);
            go("event04_revisit");
          },
        },
      ],
    });

    document.getElementById("system-content").addEventListener("change", (e) => {
      if (e.target.type === "checkbox") {
        const key = e.target.dataset.key;
        if (e.target.checked) selected.add(key);
        else selected.delete(key);
      }
    });
  }

  function renderEvent05Covenant() {
    const selected = new Set(["noDeadline", "abandonFree", "noInheritance"]);

    renderSystem({
      title: "コヴナント事件 #05 — 百年庭園",
      desc: "完成の遅延 × 世代交代 × 放棄の自由。終わらない庭を、失敗にしない。",
      systemId: "covenant",
      contentHtml: `<div id="event05-form">${buildEvent05Form(selected)}</div>`,
      actions: [
        {
          label: "庭園で試行を開始する（10年後に再訪）",
          action: () => {
            document.querySelectorAll("#event05-form input").forEach((input) => {
              if (input.checked) state.flags[`ev05_${input.dataset.key}`] = true;
            });
            state.flags.ev05_done = true;
            state.event05Sim = simulateEvent05(state);
            go("event05_revisit");
          },
        },
      ],
    });

    document.getElementById("system-content").addEventListener("change", (e) => {
      if (e.target.type === "checkbox") {
        const key = e.target.dataset.key;
        if (e.target.checked) selected.add(key);
        else selected.delete(key);
      }
    });
  }

  function renderEvent06Covenant() {
    const selected = new Set(["timedSession", "exitAnytime", "soloBuffer"]);

    renderSystem({
      title: "コヴナント事件 #06 — 感覚の共有期間",
      desc: "関係の深化 × 自己の境界 × 退出後の記憶。切れない共有は、親密さではない。",
      systemId: "covenant",
      contentHtml: `<div id="event06-form">${buildEvent06Form(selected)}</div>`,
      actions: [
        {
          label: "コーラスで試行を開始する（3年後に再訪）",
          action: () => {
            document.querySelectorAll("#event06-form input").forEach((input) => {
              if (input.checked) state.flags[`ev06_${input.dataset.key}`] = true;
            });
            state.flags.ev06_done = true;
            state.event06Sim = simulateEvent06(state);
            if (state.flags.ev06_exitAnytime) bumpTrust(state, "sen", 1);
            go("event06_revisit");
          },
        },
      ],
    });

    document.getElementById("system-content").addEventListener("change", (e) => {
      if (e.target.type === "checkbox") {
        const key = e.target.dataset.key;
        if (e.target.checked) selected.add(key);
        else selected.delete(key);
      }
    });
  }

  function renderEvent07Covenant() {
    const selected = new Set(["nameProtection", "exitRecall", "riskConsent"]);

    renderSystem({
      title: "コヴナント事件 #07 — 深層の命名",
      desc: "驚異の保護 × 知の公開 × 探索のリスク。急ぐ名前は、所有の始まりだ。",
      systemId: "covenant",
      contentHtml: `<div id="event07-form">${buildEvent07Form(selected)}</div>`,
      actions: [
        {
          label: "深層探査で試行を開始する（5年後に再訪）",
          action: () => {
            document.querySelectorAll("#event07-form input").forEach((input) => {
              if (input.checked) state.flags[`ev07_${input.dataset.key}`] = true;
            });
            state.flags.ev07_done = true;
            state.event07Sim = simulateEvent07(state);
            if (state.flags.ev07_exitRecall) bumpTrust(state, "aster", 1);
            go("event07_revisit");
          },
        },
      ],
    });

    document.getElementById("system-content").addEventListener("change", (e) => {
      if (e.target.type === "checkbox") {
        const key = e.target.dataset.key;
        if (e.target.checked) selected.add(key);
        else selected.delete(key);
      }
    });
  }

  function renderEvent12Covenant() {
    const selected = new Set(["noCommand", "periodicVote", "minorityWitness"]);

    renderSystem({
      title: "コヴナント事件 #12 — モザイクの承認投票",
      desc: "共通の問い × 服従の誘惑 × 少数派。命令しない神を、制度で縛る。",
      systemId: "covenant",
      contentHtml: `<div id="event12-form">${buildEvent12Form(selected)}</div>`,
      actions: [
        {
          label: "モザイクを完成させ、1年後に評価する",
          action: () => {
            document.querySelectorAll("#event12-form input").forEach((input) => {
              if (input.checked) state.flags[`ev12_${input.dataset.key}`] = true;
            });
            state.flags.ev12_done = true;
            state.event12Sim = simulateEvent12(state);
            go("event12_revisit");
          },
        },
      ],
    });

    document.getElementById("system-content").addEventListener("change", (e) => {
      if (e.target.type === "checkbox") {
        const key = e.target.dataset.key;
        if (e.target.checked) selected.add(key);
        else selected.delete(key);
      }
    });
  }

  function renderCovenant() {
    const clauses = [
      {
        key: "exitImmediate",
        label: "退出は即時に認める",
        desc: "猶予期間なし。コモンズ憲章に最も近い",
      },
      {
        key: "consent5",
        label: "同意は5年ごとに更新",
        desc: "定期的な再確認。負担は増えるが、強制は減る",
        mapKey: "consentYears",
        value: 5,
      },
      {
        key: "memoryLimited",
        label: "記憶編集は、本人同意の治療のみ",
        desc: "美化・強制編集を禁止",
        mapKey: "memoryEdit",
        value: "limited",
      },
      {
        key: "expiry50",
        label: "制度は50年で失効",
        desc: "次世代が白紙から設計できる",
        mapKey: "expiryYears",
        value: 50,
      },
      {
        key: "childChoice",
        label: "子どもは成人時に船団参加を再選択できる",
        desc: "未来人の同意を制度として保障",
      },
      {
        key: "dissentRecord",
        label: "少数派の異議は削除できない",
        desc: "理由の地図と連動",
      },
    ];

    const selected = new Set(["exitImmediate", "childChoice"]);

    function renderClauses() {
      return clauses
        .map(
          (c) => `
        <label class="covenant-clause">
          <input type="checkbox" data-key="${c.key}" ${selected.has(c.key) ? "checked" : ""} />
          <div>
            <div class="card-title">${c.label}</div>
            <div class="card-desc">${c.desc}</div>
          </div>
        </label>
      `
        )
        .join("");
    }

    renderSystem({
      title: "コヴナント・グラマー",
      desc: "社会のルールを組み、実際の地区で試行する。完成した制度はシミュレーションだけで終わらない。",
      systemId: "covenant",
      contentHtml: `<div id="covenant-form">${renderClauses()}</div>`,
      actions: [
        {
          label: "制度試行を開始する（5年後に議会）",
          action: () => {
            document.querySelectorAll("#covenant-form input").forEach((input) => {
              const key = input.dataset.key;
              const clause = clauses.find((c) => c.key === key);
              if (input.checked) {
                if (clause.mapKey) state.covenant[clause.mapKey] = clause.value;
                state.flags[`cov_${key}`] = true;
              }
            });
            if (state.flags.cov_childChoice) bumpTrust(state, "children", 2);
            state.covenantSim = simulateFiveYears(state);
            go("chapter3b");
          },
        },
      ],
    });

    document.getElementById("system-content").addEventListener("change", (e) => {
      if (e.target.type === "checkbox") {
        const key = e.target.dataset.key;
        if (e.target.checked) selected.add(key);
        else selected.delete(key);
      }
    });
  }

  function renderDeliberation() {
    const reasons = [
      {
        id: "sen",
        speaker: "セン",
        text: "記録されない異議は、次世代への盗みだ。反対者の言葉ごと消さないでほしい。",
        context: "失うもの: 記憶の完全性 / 状況: 公共議会",
      },
      {
        id: "aster",
        speaker: "アスター",
        text: "退出権だけが残れば足りる。反対者は、去ればいい。それも自由だ。",
        context: "失うもの: 共同体の連帯 / 状況: 出発準備室",
      },
      {
        id: "child",
        speaker: "子ども代表",
        text: "成人するまで、大人が決めた目的を背負わせないで。再選択の権利を条文に書いて。",
        context: "失うもの: 未来の選択肢 / 状況: 代表会議",
      },
    ];

    if (state.flags.ev04_done) {
      const extra = getEvent04Reason();
      reasons.push({ ...extra, id: "lin" });
    }

    if (state.flags.ev05_done) {
      reasons.push(getEvent05Reason());
    }

    if (state.flags.ev06_done) {
      reasons.push(getEvent06Reason());
    }

    if (state.flags.ev07_done) {
      reasons.push(getEvent07Reason());
    }

    if (state.flags.ev12_done) {
      reasons.push(...getEvent12Reasons());
    }

    const picked = new Set();

    function refresh() {
      const html = `
        <p>他者の理由を、文脈ごと引用して組み合わせよ。切り取りは抗議を招く。</p>
        ${reasons
          .map(
            (r) => `
          <div class="reason-card ${picked.has(r.id) ? "selected" : ""}" data-id="${r.id}">
            <div class="reason-card-head">
              ${miniPortrait(r.id)}
              <div class="speaker">${r.speaker}</div>
            </div>
            <div class="reason-text">${r.text}</div>
            <div class="context">${r.context}</div>
          </div>
        `
          )
          .join("")}
        <div class="tag-row">
          <span class="tag ${picked.size >= 2 ? "active" : ""}">退出権の保障</span>
          <span class="tag ${picked.has("child") ? "active" : ""}">未来人の再選択</span>
          <span class="tag ${picked.has("sen") ? "active" : ""}">異議の記録</span>
          ${state.flags.ev04_done ? `<span class="tag ${picked.has("lin") ? "active" : ""}">記憶の隙間</span>` : ""}
          ${state.flags.ev05_done ? `<span class="tag ${picked.has("haru") ? "active" : ""}">終わらない庭</span>` : ""}
          ${state.flags.ev06_done ? `<span class="tag ${picked.has("io") ? "active" : ""}">切れる共有</span>` : ""}
          ${state.flags.ev07_done ? `<span class="tag ${picked.has("nagi") ? "active" : ""}">未命名の驚異</span>` : ""}
          ${state.flags.ev12_done ? `<span class="tag ${picked.has("kaede") ? "active" : ""}">命令しない神</span>` : ""}
        </div>
      `;
      document.getElementById("system-content").innerHTML = html;

      document.querySelectorAll(".reason-card").forEach((el) => {
        el.addEventListener("click", () => {
          const id = el.dataset.id;
          if (picked.has(id)) picked.delete(id);
          else picked.add(id);
          refresh();
        });
      });
    }

    renderSystem({
      title: "理由の地図",
      desc: "勝利条件は全会一致ではない。安定した異議——負担が理解され、退出権が残り、意見が記録されれば、正当な決定が成立する。",
      systemId: "reasons",
      contentHtml: "",
      actions: [
        {
          label: "決定を記録する（異議を残す）",
          action: () => {
            state.deliberationOutcome = "dissent";
            state.reasonsUsed = [...picked];
            if (picked.has("sen")) bumpTrust(state, "sen", 1);
            if (picked.has("aster")) bumpTrust(state, "aster", 1);
            if (picked.has("child")) bumpTrust(state, "children", 2);
            go("finale");
          },
        },
        {
          label: "決定を記録する（全会一致を目指す）",
          action: () => {
            state.deliberationOutcome = "unanimous";
            go("finale");
          },
        },
      ],
    });

    refresh();
  }

  function renderEndingPicker() {
    const mosaicUnlocked = canUnlockMosaicEnding(state);

    renderSystem({
      title: "出発憲章 — 未来への手渡し",
      desc: "正解はない。得るものと失うものを選ぶ。",
      systemId: "charter",
      contentHtml: `
        <div class="card-grid">
          ${Object.entries(ENDINGS)
            .map(([id, e]) => {
              const locked = id === "mosaic" && !mosaicUnlocked;
              return `
            <div class="card ${locked ? "card-locked" : ""}" data-ending="${id}" ${locked ? 'title="モザイクの安全装置を設計すると選択可能"' : ""}>
              <div class="card-title">${e.title}${locked ? " 🔒" : ""}</div>
              <div class="card-desc">${locked ? "事件#12で命令権なし・承認投票・少数派証言を選ぶ" : `得: ${e.gain} / 失: ${e.loss}`}</div>
            </div>`;
            })
            .join("")}
        </div>
      `,
      actions: [],
    });

    document.querySelectorAll(".card[data-ending]").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.ending;
        if (id === "mosaic" && !canUnlockMosaicEnding(state)) return;
        state.ending = id;
        showRestart(restart);
        renderEpilogue(game);
      });
    });
  }

  return game;
}

export function startGame() {
  initAmbience();
  initWorld3d();
  initAudio();
  bindAudioToggle();
  setMood("cosmos");
  const game = createGame();
  setDiscoverHandler((discovery) => {
    game.state.flags[`disc_${discovery.id}`] = true;
  });
  game.go("title");
}

startGame();
