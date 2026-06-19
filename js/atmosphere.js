import { getTraditionalArt } from "./traditional-art.js";

let pulseTimer = null;

export function pulseSceneAtmosphere({ mood, location, title, art, intense = false } = {}) {
  const wash = document.getElementById("atmosphere-wash");
  const card = document.getElementById("atmosphere-card");
  const locEl = document.getElementById("atmosphere-location");
  const titleEl = document.getElementById("atmosphere-title");
  const artEl = document.getElementById("atmosphere-art");

  if (wash) {
    wash.dataset.mood = mood || document.body.dataset.mood || "cosmos";
  }

  document.body.classList.remove("atmosphere-pulse");
  void document.body.offsetWidth;
  document.body.classList.add("atmosphere-pulse");

  if (card && location) {
    card.hidden = false;
    card.classList.toggle("atmosphere-card-intense", intense);
    if (locEl) locEl.textContent = location;
    if (titleEl) titleEl.textContent = title || "";
    if (artEl) {
      artEl.innerHTML = art ? getTraditionalArt(art) : "";
      artEl.hidden = !art;
    }
  }

  clearTimeout(pulseTimer);
  pulseTimer = setTimeout(() => {
    if (card) card.hidden = true;
    document.body.classList.remove("atmosphere-pulse");
  }, intense ? 1100 : 850);
}

export function flashSceneTitle() {
  ["scene-title", "chapter-tag"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("scene-enter");
    void el.offsetWidth;
    el.classList.add("scene-enter");
  });
}
