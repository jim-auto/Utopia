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
import { initAmbience, setMood } from "./visuals.js";

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
            go("chapter4");
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

    const picked = new Set();

    function refresh() {
      const html = `
        <p>他者の理由を、文脈ごと引用して組み合わせよ。切り取りは抗議を招く。</p>
        ${reasons
          .map(
            (r) => `
          <div class="reason-card ${picked.has(r.id) ? "selected" : ""}" data-id="${r.id}" style="cursor:pointer;${picked.has(r.id) ? "border-left-color:var(--accent-gold)" : ""}">
            <div class="speaker">${r.speaker}</div>
            <div>${r.text}</div>
            <div class="context">${r.context}</div>
          </div>
        `
          )
          .join("")}
        <div class="tag-row">
          <span class="tag ${picked.size >= 2 ? "active" : ""}">退出権の保障</span>
          <span class="tag ${picked.has("child") ? "active" : ""}">未来人の再選択</span>
          <span class="tag ${picked.has("sen") ? "active" : ""}">異議の記録</span>
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
    const endingCards = Object.entries(ENDINGS).map(([id, e]) => ({
      id,
      ...e,
    }));

    renderSystem({
      title: "出発憲章 — 未来への手渡し",
      desc: "正解はない。得るものと失うものを選ぶ。",
      systemId: "charter",
      contentHtml: `
        <div class="card-grid">
          ${endingCards
            .map(
              (e) => `
            <div class="card" data-ending="${e.id}">
              <div class="card-title">${e.title}</div>
              <div class="card-desc">得: ${e.gain} / 失: ${e.loss}</div>
            </div>
          `
            )
            .join("")}
        </div>
      `,
      actions: [],
    });

    document.querySelectorAll(".card[data-ending]").forEach((card) => {
      card.addEventListener("click", () => {
        state.ending = card.dataset.ending;
        showRestart(restart);
        renderEpilogue(game);
      });
    });
  }

  return game;
}

export function startGame() {
  initAmbience();
  setMood("cosmos");
  const game = createGame();
  game.go("title");
}

startGame();
