/**
 * SYS-07 — アトリエ即興（身体的ゲームプレイ）
 * 一回性と関係を、リズム即興で体験する。再プレイ不可。
 */

const BEAT_MS = 900;
const WINDOW_GOOD = 200;
const MOVEMENTS = ["第1楽章 — 呼びかけ", "第2楽章 — 応答", "第3楽章 — 余韻"];
const BEATS_PER_MOVEMENT = 4;

let audioCtx = null;

function ensureCtx() {
  if (audioCtx) return audioCtx;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    audioCtx = null;
  }
  return audioCtx;
}

function playTone(freq, duration = 0.14, volume = 0.07) {
  const ctx = ensureCtx();
  if (!ctx || ctx.state === "suspended") return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  osc.start(now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.stop(now + duration);
}

function classifyHit(deltaMs) {
  if (deltaMs < -WINDOW_GOOD) return "rush";
  if (Math.abs(deltaMs) <= WINDOW_GOOD) return "harmony";
  return "silence";
}

function buildSignature(counts, timings) {
  const raw = `${counts.harmony}-${counts.silence}-${counts.rush}-${timings.map((t) => Math.round(t)).join(",")}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  return `AT-${hash.toString(16).toUpperCase().padStart(6, "0")}`;
}

function describeResult(counts) {
  const total = counts.harmony + counts.silence + counts.rush;
  const h = counts.harmony / total;
  const s = counts.silence / total;
  const r = counts.rush / total;

  if (h >= 0.55) {
    return {
      tone: "together",
      title: "ensemble",
      lead: "あなたの拍は、他者の拍を待っていた。即興は、独りよがりではなかった。",
      soliQuote: "記録はしない。でも、今夜の呼吸は、初演の骨格になる。",
    };
  }
  if (s >= 0.45) {
    return {
      tone: "quiet",
      title: "silence",
      lead: "沈黙が多かった。それでも、空白は譜面の一部だった。",
      soliQuote: "沈黙を恐れるな。再演できないからこそ、間も一度きりだ。",
    };
  }
  if (r >= 0.35) {
    return {
      tone: "eager",
      title: "rush",
      lead: "先走りが目立った。完成への焦りが、即興の前に出た。",
      soliQuote: "急ぐ拍は、美しいが危うい。初演は、待つ技術でもある。",
    };
  }
  return {
    tone: "mixed",
    title: "mixed",
    lead: "呼応と沈黙と先走り——混ざり合った、一度だけの形。",
    soliQuote: "完璧な即興などない。残るのは、共に選んだ不確かさだけだ。",
  };
}

export function mountAtelierImprov(root, { onComplete, onSkip }) {
  if (!root) return { destroy() {} };

  const counts = { harmony: 0, silence: 0, rush: 0 };
  const timings = [];
  let movement = 0;
  let beat = 0;
  let running = true;
  let beatStart = 0;
  let resolved = false;
  let rafId = null;
  const listeners = [];

  root.innerHTML = `
    <div class="improv-game">
      <div class="improv-intro">
        <p class="improv-lead">リハーサル即興。録音なし、再演なし——この演奏は一度だけ。</p>
        <p class="improv-keys">Space / Enter / タップ — 拍の輪が重なる瞬間に奏でる</p>
      </div>
      <div class="improv-hud">
        <span class="improv-movement" id="improv-movement">${MOVEMENTS[0]}</span>
        <span class="improv-beat-count" id="improv-beat-count">1 / ${BEATS_PER_MOVEMENT}</span>
      </div>
      <div class="improv-stage" id="improv-stage">
        <div class="improv-target-ring" aria-hidden="true"></div>
        <div class="improv-pulse" id="improv-pulse" aria-hidden="true"></div>
        <div class="improv-stage-label" id="improv-stage-label">準備…</div>
      </div>
      <div class="improv-meter">
        <span class="improv-stat harmony">呼応 <b id="improv-h">0</b></span>
        <span class="improv-stat silence">沈黙 <b id="improv-s">0</b></span>
        <span class="improv-stat rush">先走り <b id="improv-r">0</b></span>
      </div>
      <button type="button" class="btn btn-primary improv-hit-btn" id="improv-hit">奏でる</button>
      <button type="button" class="btn btn-choice improv-skip-btn" id="improv-skip">舞台裏だけ手伝う（即興を避ける）</button>
    </div>
  `;

  const pulseEl = root.querySelector("#improv-pulse");
  const stageLabel = root.querySelector("#improv-stage-label");
  const movementEl = root.querySelector("#improv-movement");
  const beatCountEl = root.querySelector("#improv-beat-count");
  const hitBtn = root.querySelector("#improv-hit");
  const skipBtn = root.querySelector("#improv-skip");

  function updateMeter() {
    root.querySelector("#improv-h").textContent = counts.harmony;
    root.querySelector("#improv-s").textContent = counts.silence;
    root.querySelector("#improv-r").textContent = counts.rush;
  }

  function addListener(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    listeners.push(() => target.removeEventListener(type, fn, opts));
  }

  function destroy() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    listeners.forEach((off) => off());
    listeners.length = 0;
  }

  function registerHit() {
    if (!running || resolved) return;
    const delta = performance.now() - beatStart - BEAT_MS;
    const kind = classifyHit(delta);
    counts[kind] += 1;
    timings.push(delta);
    resolved = true;
    updateMeter();

    const freqs = { harmony: 392, rush: 330, silence: 262 };
    playTone(freqs[kind] || 330);

    pulseEl.classList.remove("improv-pulse-active");
    stageLabel.textContent =
      kind === "harmony" ? "呼応" : kind === "rush" ? "先走り" : "遅れ";
    stageLabel.className = `improv-stage-label improv-hit-${kind}`;
  }

  addListener(hitBtn, "click", () => {
    ensureCtx()?.resume?.();
    registerHit();
  });

  addListener(
    window,
    "keydown",
    (e) => {
      if (!running || resolved) return;
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        ensureCtx()?.resume?.();
        registerHit();
      }
    },
    { passive: false }
  );

  addListener(skipBtn, "click", () => {
    destroy();
    onSkip?.();
  });

  function animatePulse() {
    pulseEl.classList.remove("improv-pulse-active");
    void pulseEl.offsetWidth;
    pulseEl.classList.add("improv-pulse-active");
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function runMovementIntro(index) {
    movementEl.textContent = MOVEMENTS[index];
    stageLabel.textContent = MOVEMENTS[index];
    stageLabel.className = "improv-stage-label";
    await wait(1200);
  }

  async function runBeat() {
    beatCountEl.textContent = `${beat + 1} / ${BEATS_PER_MOVEMENT}`;
    resolved = false;
    stageLabel.textContent = "…";
    stageLabel.className = "improv-stage-label";
    animatePulse();
    beatStart = performance.now();
    playTone(220 + movement * 40, 0.08, 0.045);

    await wait(BEAT_MS + WINDOW_GOOD + 120);
    if (!resolved) {
      counts.silence += 1;
      timings.push(BEAT_MS + WINDOW_GOOD + 80);
      updateMeter();
      stageLabel.textContent = "沈黙";
      stageLabel.className = "improv-stage-label improv-hit-silence";
    }
    await wait(280);
  }

  async function runGame() {
    ensureCtx()?.resume?.();
    await wait(800);

    for (movement = 0; movement < MOVEMENTS.length; movement++) {
      if (!running) return;
      await runMovementIntro(movement);
      for (beat = 0; beat < BEATS_PER_MOVEMENT; beat++) {
        if (!running) return;
        await runBeat();
      }
    }

    if (!running) return;
    const meta = describeResult(counts);
    const result = {
      ...counts,
      ...meta,
      signature: buildSignature(counts, timings),
      movements: MOVEMENTS.length,
      beats: MOVEMENTS.length * BEATS_PER_MOVEMENT,
    };

    root.innerHTML = `
      <div class="improv-result">
        <p class="improv-signature">演奏ID — ${result.signature}</p>
        <p class="sim-lead">${result.lead}</p>
        <div class="improv-meter improv-meter-final">
          <span class="improv-stat harmony">呼応 ${result.harmony}</span>
          <span class="improv-stat silence">沈黙 ${result.silence}</span>
          <span class="improv-stat rush">先走り ${result.rush}</span>
        </div>
        <blockquote class="dialogue-block reveal">
          <div class="speaker">ソリ</div>
          <p>${result.soliQuote}</p>
        </blockquote>
        <p class="improv-once">この即興は再演されない。記録も、口伝えも、ない。</p>
        <button type="button" class="btn btn-primary" id="improv-finish">初演の準備へ</button>
      </div>
    `;

    root.querySelector("#improv-finish").addEventListener("click", () => {
      destroy();
      onComplete?.(result);
    });
  }

  runGame();

  return { destroy };
}

export function getImprovDeliberationReason(result) {
  const tone = result?.tone || "mixed";
  const texts = {
    together: "一回きりの初演に、共同体だけが居合わせる——それは特権ではなく、関係の重さだ。",
    quiet: "沈黙も即興の一部だ。記録しない文化は、空白ごと未来へ渡す。",
    eager: "完成への焦りが、一回性を危うくする。初演は、待つ技術でもある。",
    mixed: "完璧な即興はない。混ざり合った拍が、一度だけの作品になる。",
  };
  return {
    id: "soli",
    speaker: "ソリ",
    text: texts[tone] || texts.mixed,
    context: "失うもの: 再演の可能性 / 状況: アトリエ即興",
  };
}
