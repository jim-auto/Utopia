import {
  setMood,
  renderSceneHero,
  getSceneArtHtml,
  animateSceneText,
  updatePeriodProgress,
  moodFromLocation,
  getSystemMeta,
} from "./visuals.js";

const narrativePanel = () => document.getElementById("narrative-panel");
const systemPanel = () => document.getElementById("system-panel");

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
}

export function renderScene({ chapter, title, body, choices = [], mood, art, titleScreen = false }) {
  showNarrative();
  if (mood) setMood(mood);
  renderSceneHero(art || "title");

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
    btn.addEventListener("click", choice.action);
    container.appendChild(btn);
  });

  animateSceneText();
  panel.style.animation = "none";
  void panel.offsetWidth;
  panel.style.animation = "";
}

export function renderSystem({ title, desc, contentHtml, actions = [], systemId = "presence" }) {
  showSystem();
  const meta = getSystemMeta(systemId);
  setMood(meta.mood);

  const hero = document.getElementById("system-hero");
  if (hero) hero.innerHTML = getSceneArtHtml(meta.art);

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
    btn.addEventListener("click", action.action);
    container.appendChild(btn);
  });

  const panel = systemPanel();
  panel.style.animation = "none";
  void panel.offsetWidth;
  panel.style.animation = "";
}

export function showRestart(onRestart) {
  const btn = document.getElementById("btn-restart");
  btn.hidden = false;
  btn.onclick = onRestart;
}

export function hideRestart() {
  document.getElementById("btn-restart").hidden = true;
}
