/**
 * 3D / 2D 探索モードの切り替え
 */
import {
  initWorld3d,
  showWorld3d,
  hideWorld3d,
  setExplorationEnabled as setExploration3d,
  setWorldFromScene as setWorld3d,
  setDiscoverHandler as setDiscover3d,
  isWorld3dAvailable,
  tryInteract as tryInteract3d,
} from "./world3d.js";
import {
  initWorld2d,
  showWorld2d,
  hideWorld2d,
  setExplorationEnabled as setExploration2d,
  setWorldFromScene as setWorld2d,
  setDiscoverHandler as setDiscover2d,
  tryInteract as tryInteract2d,
} from "./world2d.js";

const STORAGE_KEY = "utopia_view_mode";
let mode = "3d";
let discoverHandler = null;

function readStoredMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "2d" || stored === "3d") return stored;
  } catch {
    /* ignore */
  }
  return "3d";
}

function persistMode() {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

function syncToggleButton() {
  const btn = document.getElementById("btn-view-mode");
  if (!btn) return;
  const can3d = isWorld3dAvailable();
  const is2d = mode === "2d";
  btn.hidden = !can3d;
  if (!can3d) return;
  btn.textContent = is2d ? "▣ 2D" : "◈ 3D";
  btn.setAttribute("aria-pressed", is2d ? "true" : "false");
  btn.title = is2d ? "3D探索に切り替え" : "2Dドット絵に切り替え";
}

export function getViewMode() {
  return mode;
}

export function getViewLabel() {
  return mode === "2d" ? "2D" : "3D";
}

export function setViewMode(next, { persist = true } = {}) {
  if (next !== "2d" && next !== "3d") return;
  if (next === "3d" && !isWorld3dAvailable()) return;

  mode = next;
  if (persist) persistMode();
  syncToggleButton();

  const exploring = document.body.classList.contains("mode-3d");
  if (exploring) {
    if (mode === "2d") {
      hideWorld3d();
      showWorld2d();
    } else {
      hideWorld2d();
      showWorld3d();
    }
  }
}

export function toggleViewMode() {
  if (mode === "3d" && isWorld3dAvailable()) {
    setViewMode("2d");
  } else if (mode === "2d") {
    setViewMode("3d");
  }
}

export function initWorldView() {
  initWorld3d();
  initWorld2d();

  mode = readStoredMode();
  if (mode === "3d" && !isWorld3dAvailable()) {
    mode = "2d";
  }

  syncToggleButton();

  const btn = document.getElementById("btn-view-mode");
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => toggleViewMode());
  }

  const interactBtn = document.getElementById("btn-interact");
  if (interactBtn && !interactBtn.dataset.bound) {
    interactBtn.dataset.bound = "1";
    interactBtn.addEventListener("click", () => {
      if (mode === "2d") tryInteract2d();
      else tryInteract3d();
    });
  }
}

export function showWorld() {
  document.body.classList.add("mode-3d");
  if (mode === "2d") {
    hideWorld3d();
    showWorld2d();
  } else {
    hideWorld2d();
    showWorld3d();
  }
}

export function hideWorld() {
  hideWorld3d();
  hideWorld2d();
  document.body.classList.remove("mode-3d");
  document.body.classList.remove("dialogue-collapsed");
  document.body.classList.remove("title-backdrop");

  const hint = document.getElementById("world3d-hint");
  const stick = document.getElementById("touch-stick");
  const tab = document.getElementById("panel-focus-tab");
  if (hint) hint.hidden = true;
  if (stick) stick.hidden = true;
  if (tab) tab.hidden = true;
}

export function setExplorationEnabled(enabled) {
  if (mode === "2d") setExploration2d(enabled);
  else setExploration3d(enabled);
}

export function setWorldFromScene(sceneMeta) {
  if (mode === "2d") setWorld2d(sceneMeta);
  else setWorld3d(sceneMeta);
}

export function setDiscoverHandler(fn) {
  discoverHandler = fn;
  setDiscover3d(fn);
  setDiscover2d(fn);
}
