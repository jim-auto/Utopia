const MOOD_TONES = {
  cosmos: { a: 110, b: 164.81, vol: 0.04 },
  dawn: { a: 130.81, b: 196, vol: 0.045 },
  garden: { a: 98, b: 146.83, vol: 0.04 },
  mars: { a: 123.47, b: 185, vol: 0.042 },
  memory: { a: 116.54, b: 174.61, vol: 0.038 },
  vow: { a: 103.83, b: 155.56, vol: 0.04 },
  law: { a: 87.31, b: 130.81, vol: 0.035 },
  council: { a: 105, b: 157.5, vol: 0.038 },
  finale: { a: 92.5, b: 138.59, vol: 0.045 },
};

let ctx = null;
let master = null;
let oscA = null;
let oscB = null;
let gainA = null;
let gainB = null;
let muted = localStorage.getItem("utopia-muted") === "1";
let started = false;
let currentMood = "cosmos";

export function initAudio() {
  updateMuteButton();
}

export function ensureAudio() {
  if (started) return true;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);

    oscA = ctx.createOscillator();
    oscB = ctx.createOscillator();
    gainA = ctx.createGain();
    gainB = ctx.createGain();

    oscA.type = "sine";
    oscB.type = "triangle";
    oscA.connect(gainA);
    oscB.connect(gainB);
    gainA.connect(master);
    gainB.connect(master);

    applyMood(currentMood);
    oscA.start();
    oscB.start();
    started = true;
    return true;
  } catch {
    return false;
  }
}

function applyMood(moodId) {
  if (!ctx || !oscA) return;
  const tone = MOOD_TONES[moodId] || MOOD_TONES.cosmos;
  const now = ctx.currentTime;
  oscA.frequency.setTargetAtTime(tone.a, now, 1.2);
  oscB.frequency.setTargetAtTime(tone.b, now, 1.2);
  gainA.gain.setTargetAtTime(tone.vol, now, 0.8);
  gainB.gain.setTargetAtTime(tone.vol * 0.55, now, 0.8);
}

export function setAudioMood(moodId) {
  currentMood = moodId;
  if (started) applyMood(moodId);
}

export function playClick() {
  ensureAudio();
  if (!ctx || muted) return;
  const click = ctx.createOscillator();
  const g = ctx.createGain();
  click.type = "sine";
  click.frequency.value = 520;
  g.gain.value = 0.06;
  click.connect(g);
  g.connect(master);
  click.start();
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  click.stop(ctx.currentTime + 0.12);
}

export function toggleMute() {
  muted = !muted;
  localStorage.setItem("utopia-muted", muted ? "1" : "0");
  if (master) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.15);
  updateMuteButton();
}

function updateMuteButton() {
  const btn = document.getElementById("btn-audio");
  if (!btn) return;
  btn.textContent = muted ? "🔇 音 OFF" : "🔊 音 ON";
  btn.setAttribute("aria-pressed", muted ? "true" : "false");
}

export function bindAudioToggle() {
  const btn = document.getElementById("btn-audio");
  if (!btn) return;
  btn.addEventListener("click", () => {
    ensureAudio();
    toggleMute();
  });
}

export function onUserGesture() {
  ensureAudio();
}
