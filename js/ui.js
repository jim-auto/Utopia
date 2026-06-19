import {
  setMood,
  renderSceneHero,
  renderSystemHero,
  animateSceneText,
  updatePeriodProgress,
  moodFromLocation,
  getSystemMeta,
} from "./visuals.js";
import { renderSpeakerStrip } from "./portraits.js";
import { setAudioMood, playClick } from "./audio.js";
import {
  showWorld3d,
  hideWorld3d,
  setExplorationEnabled,
  setWorldFromScene,
} from "./world3d.js";

function applyMood(moodId) {
  if (!moodId) return;
  setMood(moodId);
  setAudioMood(moodId);
}

const narrativePanel = () => document.getElementById("narrative-panel");
const systemPanel = () => document.getElementById("system-panel");

function bindPanelFocusControls() {
  const toggles = document.querySelectorAll(".btn-panel-focus");
  const tab = document.getElementById("panel-focus-tab");
  if (tab && !tab.dataset.bound) {
    tab.dataset.bound = "1";
    tab.addEventListener("click", () => setDialogueCollapsed(false));
  }
  toggles.forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const collapsed = !document.body.classList.contains("dialogue-collapsed");
      setDialogueCollapsed(collapsed);
    });
  });
}

function setDialogueCollapsed(collapsed) {
  document.body.classList.toggle("dialogue-collapsed", collapsed);
  const tab = document.getElementById("panel-focus-tab");
  if (tab) tab.hidden = !document.body.classList.contains("mode-3d") || !collapsed;
  document.querySelectorAll(".btn-panel-focus").forEach((btn) => {
    btn.setAttribute("aria-pressed", collapsed ? "true" : "false");
    btn.textContent = collapsed ? "▶ 会話" : "◀ 3D";
  });
}

function syncPanelFocusUi(titleScreen) {
  bindPanelFocusControls();
  const tab = document.getElementById("panel-focus-tab");
  if (titleScreen || !document.body.classList.contains("mode-3d")) {
    setDialogueCollapsed(false);
    if (tab) tab.hidden = true;
    return;
  }
  if (tab) tab.hidden = !document.body.classList.contains("dialogue-collapsed");
}

export function showNarrative() {
  narrativePanel().hidden = false;
  systemPanel().hidden = true;
}

export function showSystem() {
  narrativePanel().hidden = true;
  systemPanel().hidden = false;
}

export function setHud(state) {
  document.getElementById("hud").hidden = false;
  document.getElementById("sidebar").hidden = false;
  document.getElementById("hud-period").textContent =
    state.period === 0 ? "序章" : `第${state.period}期`;
  document.getElementById("hud-location").textContent = state.location;
  document.getElementById("hud-trust").textContent = state.witnessTier;
  setMood(moodFromLocation(state.location));
  setAudioMood(moodFromLocation(state.location));
  updatePeriodProgress(state.period);
  renderSidebar(state);
}

export function hideHud() {
  document.getElementById("hud").hidden = true;
  document.getElementById("sidebar").hidden = true;
}

export function renderSidebar(state) {
  const vowList = document.getElementById("vow-list");
  const missedList = document.getElementById("missed-list");

  vowList.innerHTML =
    state.vows.length === 0
      ? "<li>なし</li>"
      : state.vows
          .map(
            (v) =>
              `<li><span class="vow-active">${v.label}</span> <em>${v.status}</em></li>`
          )
          .join("");

  missedList.innerHTML =
    state.missed.length === 0
      ? "<li>なし</li>"
      : state.missed.map((m) => `<li>${m}</li>`).join("");

  const eventsEl = document.getElementById("events-list");
  if (eventsEl) {
    const events = [];
    if (state.flags.ev02_done) events.push("匿名の村");
    if (state.flags.ev04_done) events.push("忘れられる権利");
    if (state.flags.ev05_done) events.push("百年庭園");
    if (state.flags.ev06_done) events.push("感覚の共有期間");
    if (state.flags.ev07_done) events.push("深層の命名");
    if (state.flags.ev08_done) events.push("新身体の試着");
    if (state.flags.ev09_done) events.push("競技の一生");
    if (state.flags.ev10_done) events.push("記録しない謝罪");
    if (state.flags.ev11_done) events.push("共同親");
    if (state.flags.ev13_done) events.push("老化を選ぶ村");
    if (state.flags.ev12_done) events.push("モザイク承認投票");
    if (state.flags.atelier_improv_done) events.push("アトリエ即興");
    if (state.flags.cov_childChoice || state.flags.cov_exitImmediate) events.push("出発憲章試行");
    eventsEl.innerHTML =
      events.length === 0 ? "<li>なし</li>" : events.map((e) => `<li>${e}</li>`).join("");
  }
}

export function renderScene({ chapter, title, body, choices = [], mood, art, titleScreen = false, speaker, location }) {
  showNarrative();
  if (mood) applyMood(mood);
  if (titleScreen) {
    hideWorld3d();
    setExplorationEnabled(false);
    renderSceneHero(art || "title");
  } else {
    showWorld3d();
    setWorldFromScene({ art, mood, location, speaker });
    setExplorationEnabled(true);
    renderSceneHero(null);
  }
  renderSpeakerStrip(titleScreen ? null : speaker);

  const panel = narrativePanel();
  panel.classList.toggle("title-screen", titleScreen);

  document.getElementById("chapter-tag").textContent = chapter || "";
  document.getElementById("scene-title").textContent = title || "";
  document.getElementById("scene-body").innerHTML = body || "";

  const container = document.getElementById("scene-choices");
  container.innerHTML = "";

  choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = choice.primary ? "btn btn-primary" : "btn btn-choice";
    btn.style.animationDelay = `${0.3 + i * 0.08}s`;
    btn.classList.add("reveal");
    if (choice.hint) {
      btn.innerHTML = `<span class="choice-label">${choice.label}</span><span class="choice-hint">${choice.hint}</span>`;
    } else {
      btn.textContent = choice.label;
    }
    btn.addEventListener("click", () => {
      playClick();
      choice.action();
    });
    container.appendChild(btn);
  });

  animateSceneText();
  panel.style.animation = "none";
  void panel.offsetWidth;
  panel.style.animation = "";
  syncPanelFocusUi(titleScreen);
}

export function renderSystem({ title, desc, contentHtml, actions = [], systemId = "presence" }) {
  showSystem();
  const meta = getSystemMeta(systemId);
  applyMood(meta.mood);
  showWorld3d();
  setExplorationEnabled(false);
  setWorldFromScene({ art: meta.art, mood: meta.mood });

  renderSystemHero(meta.art);

  const badge = document.getElementById("system-badge");
  if (badge) badge.textContent = meta.badge;

  document.getElementById("system-title").textContent = title;
  document.getElementById("system-desc").textContent = desc;
  document.getElementById("system-content").innerHTML = contentHtml;

  const container = document.getElementById("system-actions");
  container.innerHTML = "";
  actions.forEach((action) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = action.danger ? "btn btn-choice btn-danger" : "btn btn-primary";
    btn.textContent = action.label;
    btn.addEventListener("click", () => {
      playClick();
      action.action();
    });
    container.appendChild(btn);
  });

  const panel = systemPanel();
  panel.style.animation = "none";
  void panel.offsetWidth;
  panel.style.animation = "";
  syncPanelFocusUi(false);
}

export function showRestart(onRestart) {
  const btn = document.getElementById("btn-restart");
  btn.hidden = false;
  btn.onclick = onRestart;
}

export function hideRestart() {
  document.getElementById("btn-restart").hidden = true;
}
