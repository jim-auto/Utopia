import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { buildPlayerModel } from "./player-model.js";
import {
  WORLD_CONFIG,
  createSkyMesh,
  updateSkyMesh,
  buildWorldEnvironment,
  applyWorldLighting,
} from "./world-environments.js";

let renderer;
let labelRenderer;
let composer;
let scene;
let camera;
let player;
let playerShadow;
let playerWalkPhase = 0;
let worldRoot;
let skyMesh;
let sunLight;
let hemiLight;
let rafId = null;
let visible = false;
let explorationEnabled = false;
let currentWorldId = "garden";
let elapsed = 0;

const keys = new Set();
const pointer = { down: false, x: 0, y: 0, id: null };
let cameraIntro = 0;
const CAMERA_INTRO_FROM = 13.5;
const CAMERA_INTRO_TO = 8;
const playerVel = new THREE.Vector3();
const tmpVec = new THREE.Vector3();

const WORLD_BOUNDS = 24;
const MOVE_SPEED = 8.5;
const DEFAULT_HINT = "WASD / 矢印 — 移動 · ドラッグ — 視点 · ホイール — 距離 · V — 一人称";
const TOUCH_HINT = "左スティック — 移動 · ドラッグ — 視点 · 調べる";
const SYSTEM_HINT = "条項を選んでください（移動は一時停止）";

const touchInput = { x: 0, z: 0, active: false };
let currentSpeaker = null;
let firstPerson = false;
let nearestInteract = null;
let onDiscover = null;
const discoveredIds = new Set();

const NPC_LABELS = {
  aster: "アスター",
  sen: "セン",
  soli: "ソリ",
  child: "子ども代表",
  lin: "リン",
  kaede: "カエデ",
  haru: "ハル",
  io: "イオ",
  nagi: "ナギ",
};

const WORLD_LANDMARKS = {
  garden: { label: "祭りの広場", position: [0, 2.8, -8] },
  horizon: { label: "地平門", position: [0, 4.2, -10] },
  chorus: { label: "共有室", position: [0, 3.5, 0] },
  palimpsest: { label: "記録の環", position: [0, 3.2, 0] },
  atelier: { label: "初演の舞台", position: [0, 3.5, -4] },
  council: { label: "公共議会", position: [0, 2.5, 0] },
  abyss: { label: "深層クレバス", position: [0, 1.5, -6] },
  forge: { label: "試着室", position: [0, 2.8, -5] },
};

const WORLD_DISCOVERIES = {
  garden: {
    id: "garden_festival",
    text: "百年祭の光の糸。記録も再生もない——ただ、その場にいた者だけが知っている。",
  },
  horizon: {
    id: "horizon_gate",
    text: "門は約90年後に閉じる。不可逆だが、避難命令ではない。選べる驚異。",
  },
  chorus: {
    id: "chorus_share",
    text: "感覚は分かち合える。ただし、境界線は消えない——切れる共有。",
  },
  palimpsest: {
    id: "palimpsest_ring",
    text: "記録の環。削除と匿名化のあいだに、まだ名前のない記憶がある。",
  },
  atelier: {
    id: "atelier_stage",
    text: "一度きりの舞台。完成するが、再演しない——約束が作品になる。",
  },
  council: {
    id: "council_mosaic",
    text: "命令しない神の座。暴走ではなく、自発的服従が問題だ。",
  },
  abyss: {
    id: "abyss_trench",
    text: "未命名の深層。ここでは、驚異に急いで名を付けない——仮名期間が保護になる。",
  },
  forge: {
    id: "forge_chamber",
    text: "試着室。14日で戻れる身体——不可逆変更は、別の契約で。",
  },
};

function applyWorldAtmosphere(worldId) {
  const cfg = WORLD_CONFIG[worldId] || WORLD_CONFIG.garden;
  scene.fog = new THREE.FogExp2(cfg.fogColor, cfg.fog);
  scene.background = new THREE.Color(cfg.fogColor);

  updateSkyMesh(skyMesh, worldId, readAccent(), elapsed);
  applyWorldLighting(worldId, sunLight, hemiLight);

  if (composer) {
    const bloom = composer.passes[1];
    if (bloom) bloom.strength = cfg.bloom;
  }
}

function clearWorld() {
  if (!worldRoot) return;
  scene.remove(worldRoot);
  worldRoot.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material.dispose();
    }
  });
  worldRoot = null;
}

function readAccent() {
  return getComputedStyle(document.documentElement).getPropertyValue("--mood-accent").trim() || "#6ec8e8";
}

function makeLabel(text, className = "world-label") {
  const el = document.createElement("div");
  el.className = className;
  el.textContent = text;
  return new CSS2DObject(el);
}

export function mapSceneToWorld({ art, mood, location } = {}) {
  const loc = location || "";
  if (loc.includes("コーラス") || loc.includes("金星")) return "chorus";
  if (loc.includes("アビス") || loc.includes("エウロパ") || loc.includes("深層")) return "abyss";
  if (loc.includes("水星") || loc.includes("フォージ") || loc.includes("ジェネシス")) return "forge";
  if (loc.includes("月") || loc.includes("パリンプセスト")) return "palimpsest";
  if (loc.includes("火星") || loc.includes("アトリエ")) return "atelier";
  if (loc.includes("ホライズン") || loc.includes("土星")) return "horizon";
  if (loc.includes("コモン") || loc.includes("地球")) return "garden";

  const artMap = {
    garden: "garden",
    festival: "garden",
    gate: "horizon",
    horizon: "horizon",
    title: "horizon",
    chorus: "chorus",
    palimpsest: "palimpsest",
    atelier: "atelier",
    covenant: "council",
    deliberation: "council",
    council: "council",
    mosaic: "council",
    ending: "horizon",
    refusal: "garden",
    abyss: "abyss",
    forge: "forge",
  };
  if (art && artMap[art]) return artMap[art];

  const moodMap = {
    garden: "garden",
    dawn: "garden",
    cosmos: "horizon",
    chorus: "chorus",
    memory: "palimpsest",
    mars: "atelier",
    vow: "atelier",
    law: "council",
    council: "council",
    finale: "horizon",
    abyss: "abyss",
    forge: "forge",
  };
  if (mood && moodMap[mood]) return moodMap[mood];

  return "garden";
}

let npcBeacon = null;

function clearNpcBeacon() {
  if (worldRoot?.userData?.animated) {
    worldRoot.userData.animated = worldRoot.userData.animated.filter((a) => a.type !== "beacon");
  }
  if (npcBeacon && worldRoot) {
    worldRoot.remove(npcBeacon);
    npcBeacon = null;
  }
}

function setNpcBeacon(worldId, speaker) {
  clearNpcBeacon();
  if (!speaker || !worldRoot || !NPC_LABELS[speaker]) return;

  const lm = WORLD_LANDMARKS[worldId];
  if (!lm) return;

  const beacon = new THREE.Group();
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.12, 2.8, 8),
    new THREE.MeshStandardMaterial({
      color: readAccent(),
      emissive: readAccent(),
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
    })
  );
  pillar.position.y = 1.4;
  beacon.add(pillar);

  const label = makeLabel(NPC_LABELS[speaker], "world-label world-label-npc");
  label.position.y = 3.2;
  beacon.add(label);

  beacon.position.set(lm.position[0] + 3.5, 0, lm.position[2] + 1.5);
  worldRoot.add(beacon);
  npcBeacon = beacon;
  worldRoot.userData.animated.push({ mesh: pillar, type: "beacon", phase: 0 });
}

function loadWorld(worldId, force = false) {
  const id = WORLD_CONFIG[worldId] ? worldId : "garden";
  if (id === currentWorldId && worldRoot && !force) {
    applyWorldAtmosphere(id);
    updatePlayerAccent();
    return;
  }

  clearWorld();
  clearNpcBeacon();
  currentWorldId = id;
  const accent = readAccent();
  const lm = WORLD_LANDMARKS[id];

  worldRoot = buildWorldEnvironment(id, accent, (group, pos) => {
    if (!lm) return;
    const label = makeLabel(lm.label, "world-label world-label-landmark");
    label.position.set(pos[0], pos[1], pos[2]);
    group.add(label);
  });
  scene.add(worldRoot);
  applyWorldAtmosphere(id);

  player.position.set(0, 0, 7);
  playerVel.set(0, 0, 0);
  cameraOrbit.yaw = 0;
  if (force) {
    cameraIntro = 1;
    cameraOrbit.distance = CAMERA_INTRO_FROM;
    cameraOrbit.pitch = 0.28;
  }
  updatePlayerAccent();
}

function updatePlayerAccent() {
  if (!player?.userData?.accentMats) return;
  const accent = readAccent();
  for (const mat of player.userData.accentMats) {
    mat.color.set(accent);
    if (mat.emissive) mat.emissive.set(accent);
  }
  if (player.userData.glow) player.userData.glow.color.set(accent);
  if (playerShadow?.material) {
    playerShadow.material.color.set(accent);
  }
}

function animatePlayerWalk(dt, speed) {
  const parts = player?.userData?.walkParts;
  if (!parts) return;
  const baseY = 1.2;

  if (speed > 0.35) {
    playerWalkPhase += dt * (9 + speed * 0.35);
    const swing = Math.sin(playerWalkPhase) * 0.52;
    const bob = Math.abs(Math.sin(playerWalkPhase * 2)) * 0.04;
    parts.legL.rotation.x = swing;
    parts.legR.rotation.x = -swing;
    parts.armL.rotation.x = -swing * 0.42;
    parts.armR.rotation.x = swing * 0.42;
    parts.torso.position.y = baseY + bob;
    parts.cape.rotation.x = 0.24 + Math.sin(playerWalkPhase) * 0.1;
    parts.capeInner.rotation.x = 0.18 + Math.sin(playerWalkPhase + 0.4) * 0.08;
    parts.coatPanelL.rotation.z = Math.sin(playerWalkPhase) * 0.04;
    parts.coatPanelR.rotation.z = -Math.sin(playerWalkPhase) * 0.04;
    parts.coatTailL.rotation.x = 0.38 + swing * 0.08;
    parts.coatTailR.rotation.x = 0.38 - swing * 0.08;
    parts.halo.rotation.z = Math.sin(playerWalkPhase * 0.5) * 0.06;
    parts.hoodPeak.rotation.x = -0.35 + Math.sin(playerWalkPhase) * 0.05;
    parts.gem.rotation.y += dt * 1.8;
    parts.gemShell.rotation.y -= dt * 1.2;
    parts.gemRing.rotation.z += dt * 0.9;
    parts.gemAura.scale.setScalar(1 + Math.sin(playerWalkPhase * 2) * 0.08);
  } else {
    const ease = 1 - Math.pow(0.001, dt);
    parts.legL.rotation.x = THREE.MathUtils.lerp(parts.legL.rotation.x, 0, ease);
    parts.legR.rotation.x = THREE.MathUtils.lerp(parts.legR.rotation.x, 0, ease);
    parts.armL.rotation.x = THREE.MathUtils.lerp(parts.armL.rotation.x, 0, ease);
    parts.armR.rotation.x = THREE.MathUtils.lerp(parts.armR.rotation.x, 0, ease);
    parts.torso.position.y = THREE.MathUtils.lerp(parts.torso.position.y, baseY, ease);
    parts.cape.rotation.x = THREE.MathUtils.lerp(parts.cape.rotation.x, 0.24, ease);
    parts.capeInner.rotation.x = THREE.MathUtils.lerp(parts.capeInner.rotation.x, 0.18, ease);
    parts.coatPanelL.rotation.z = THREE.MathUtils.lerp(parts.coatPanelL.rotation.z, 0, ease);
    parts.coatPanelR.rotation.z = THREE.MathUtils.lerp(parts.coatPanelR.rotation.z, 0, ease);
    parts.gem.rotation.y += dt * 0.5;
    parts.gemShell.rotation.y -= dt * 0.3;
    parts.gemRing.rotation.z += dt * 0.2;
  }
}

function getDefaultHint() {
  const fp = firstPerson ? " · 一人称モード" : "";
  return ("ontouchstart" in window ? TOUCH_HINT : DEFAULT_HINT) + fp;
}

function showDiscoveryToast(text, title) {
  const toast = document.getElementById("world3d-toast");
  if (!toast) return;
  toast.hidden = false;
  toast.innerHTML = title
    ? `<strong>${title}</strong><p>${text}</p>`
    : `<p>${text}</p>`;
  toast.classList.remove("fade-out");
  clearTimeout(showDiscoveryToast._timer);
  showDiscoveryToast._timer = setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => {
      toast.hidden = true;
    }, 400);
  }, 4200);
}

export function setDiscoverHandler(fn) {
  onDiscover = fn;
}

function tryInteract() {
  if (!explorationEnabled || !nearestInteract || nearestInteract.dist >= 3.2) return;

  const discovery = WORLD_DISCOVERIES[currentWorldId];
  if (discovery && !discoveredIds.has(discovery.id)) {
    discoveredIds.add(discovery.id);
    showDiscoveryToast(discovery.text, nearestInteract.label);
    if (onDiscover) onDiscover(discovery);
    return;
  }

  if (nearestInteract.kind === "npc" && currentSpeaker) {
    showDiscoveryToast("パネルの選択が、この場所でのあなたの関与だ。", nearestInteract.label);
    return;
  }

  showDiscoveryToast("ここには、まだ名前のないものがある。", nearestInteract.label);
}

function updateInteractButton() {
  const btn = document.getElementById("btn-interact");
  if (!btn) return;
  const can = explorationEnabled && nearestInteract && nearestInteract.dist < 3.2;
  btn.hidden = !can;
}

function updateProximityHint() {
  const hint = document.getElementById("world3d-hint");
  if (!hint || !explorationEnabled) return;

  let nearest = null;
  let nearestDist = Infinity;

  const lm = WORLD_LANDMARKS[currentWorldId];
  if (lm) {
    const d = Math.hypot(player.position.x - lm.position[0], player.position.z - lm.position[2]);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = { label: lm.label, dist: d, kind: "landmark" };
    }
  }

  if (npcBeacon) {
    const d = Math.hypot(player.position.x - npcBeacon.position.x, player.position.z - npcBeacon.position.z);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = {
        label: currentSpeaker ? NPC_LABELS[currentSpeaker] : "誰か",
        dist: d,
        kind: "npc",
      };
    }
  }

  if (nearest && nearest.dist < 6) {
    nearestInteract = nearest;
    hint.classList.add("world3d-hint-near");
    if (nearest.dist < 3.2) {
      const action = "ontouchstart" in window ? "調べる" : "E — 調べる";
      hint.textContent =
        nearest.kind === "npc"
          ? `${nearest.label} のそば — ${action}`
          : `${nearest.label} — ${action}`;
    } else {
      hint.textContent = `${nearest.label} へ近づいている…`;
    }
  } else {
    nearestInteract = null;
    hint.classList.remove("world3d-hint-near");
    hint.textContent = getDefaultHint();
  }
  updateInteractButton();
}

function bindTouchStick() {
  const stick = document.getElementById("touch-stick");
  const knob = document.getElementById("touch-stick-knob");
  if (!stick || !knob) return;

  const maxRadius = 42;
  let pointerId = null;
  let centerX = 0;
  let centerY = 0;

  stick.addEventListener("pointerdown", (e) => {
    if (!explorationEnabled) return;
    pointerId = e.pointerId;
    const rect = stick.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
    touchInput.active = true;
    stick.setPointerCapture(e.pointerId);
    moveKnob(e.clientX, e.clientY);
    e.preventDefault();
  });

  stick.addEventListener("pointermove", (e) => {
    if (e.pointerId !== pointerId) return;
    moveKnob(e.clientX, e.clientY);
    e.preventDefault();
  });

  function release(e) {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    touchInput.active = false;
    touchInput.x = 0;
    touchInput.z = 0;
    knob.style.transform = "translate(-50%, -50%)";
  }

  stick.addEventListener("pointerup", release);
  stick.addEventListener("pointercancel", release);

  function moveKnob(clientX, clientY) {
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const len = Math.hypot(dx, dy);
    if (len > maxRadius) {
      dx = (dx / len) * maxRadius;
      dy = (dy / len) * maxRadius;
    }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    touchInput.x = dx / maxRadius;
    touchInput.z = -dy / maxRadius;
  }
}

function bindInput() {
  window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
      keys.add(e.key.toLowerCase());
      e.preventDefault();
    }
    if (e.key === "e" || e.key === "E") {
      if (explorationEnabled) {
        e.preventDefault();
        tryInteract();
      }
    }
    if (e.key === "v" || e.key === "V") {
      if (visible && explorationEnabled) {
        e.preventDefault();
        firstPerson = !firstPerson;
        cameraOrbit.distance = firstPerson ? 0.15 : 8;
        showDiscoveryToast(
          firstPerson ? "一人称視点。深層の圧が近い。" : "三人称視点に戻った。",
          "視点"
        );
        updateProximityHint();
      }
    }
  });
  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", (e) => {
    if (!explorationEnabled || e.button !== 0) return;
    if (e.target.closest(".panel, .hud, .sidebar, .footer, .world3d-hint")) return;
    pointer.down = true;
    pointer.id = e.pointerId;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointerup", (e) => {
    if (e.pointerId === pointer.id) pointer.down = false;
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!pointer.down || !explorationEnabled || e.pointerId !== pointer.id) return;
    const dx = e.clientX - pointer.x;
    const dy = e.clientY - pointer.y;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    cameraOrbit.yaw -= dx * 0.0045;
    cameraOrbit.pitch = THREE.MathUtils.clamp(cameraOrbit.pitch - dy * 0.0035, 0.12, 1.15);
  });
  canvas.addEventListener(
    "wheel",
    (e) => {
      if (!visible) return;
      e.preventDefault();
      cameraOrbit.distance = THREE.MathUtils.clamp(cameraOrbit.distance + e.deltaY * 0.008, 4.5, 16);
    },
    { passive: false }
  );
}

function updatePlayer(dt) {
  if (!explorationEnabled) return;

  const forward = tmpVec.set(Math.sin(cameraOrbit.yaw), 0, Math.cos(cameraOrbit.yaw));
  const right = new THREE.Vector3(forward.z, 0, -forward.x);
  const move = new THREE.Vector3();

  if (keys.has("w") || keys.has("arrowup")) move.add(forward);
  if (keys.has("s") || keys.has("arrowdown")) move.sub(forward);
  if (keys.has("d") || keys.has("arrowright")) move.add(right);
  if (keys.has("a") || keys.has("arrowleft")) move.sub(right);

  if (touchInput.active && (touchInput.x !== 0 || touchInput.z !== 0)) {
    move.add(new THREE.Vector3(touchInput.x, 0, touchInput.z));
  }

  if (move.lengthSq() > 0) {
    move.normalize();
    playerVel.lerp(move.multiplyScalar(MOVE_SPEED), 1 - Math.pow(0.0004, dt));
  } else {
    playerVel.multiplyScalar(Math.pow(0.015, dt));
  }

  player.position.addScaledVector(playerVel, dt);
  player.position.x = THREE.MathUtils.clamp(player.position.x, -WORLD_BOUNDS, WORLD_BOUNDS);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -WORLD_BOUNDS, WORLD_BOUNDS);

  if (playerVel.lengthSq() > 0.08) {
    player.rotation.y = Math.atan2(playerVel.x, playerVel.z);
  }

  const speed = playerVel.length();
  animatePlayerWalk(dt, speed);

  if (playerShadow) {
    playerShadow.position.x = player.position.x;
    playerShadow.position.z = player.position.z;
    playerShadow.scale.set(0.95 + speed * 0.05, 0.95 + speed * 0.05, 1);
    playerShadow.material.opacity = 0.14 + speed * 0.025;
  }
}

function updateCamera(dt) {
  if (cameraIntro > 0) {
    cameraIntro = Math.max(0, cameraIntro - dt * 1.15);
    const blend = 1 - cameraIntro;
    cameraOrbit.distance = THREE.MathUtils.lerp(CAMERA_INTRO_FROM, CAMERA_INTRO_TO, blend);
    cameraOrbit.pitch = THREE.MathUtils.lerp(0.26, 0.38, blend);
  }

  const targetY = firstPerson ? 1.68 : 1.52;
  const target = tmpVec.set(player.position.x, targetY, player.position.z);
  if (player) player.visible = !firstPerson;

  if (firstPerson) {
    const look = new THREE.Vector3(
      target.x + Math.sin(cameraOrbit.yaw) * Math.cos(cameraOrbit.pitch),
      target.y + Math.sin(cameraOrbit.pitch) * 0.85,
      target.z + Math.cos(cameraOrbit.yaw) * Math.cos(cameraOrbit.pitch)
    );
    camera.position.lerp(target, 1 - Math.pow(0.0001, dt));
    camera.lookAt(look);
    return;
  }

  const offset = new THREE.Vector3(
    Math.sin(cameraOrbit.yaw) * Math.cos(cameraOrbit.pitch) * cameraOrbit.distance,
    Math.sin(cameraOrbit.pitch) * cameraOrbit.distance + 1.2,
    Math.cos(cameraOrbit.yaw) * Math.cos(cameraOrbit.pitch) * cameraOrbit.distance
  );
  const desired = target.clone().add(offset);
  camera.position.lerp(desired, 1 - Math.pow(0.0002, dt));
  camera.lookAt(target);
}

function animateWorld(dt) {
  if (!worldRoot?.userData?.animated) return;
  for (const item of worldRoot.userData.animated) {
    const t = elapsed + (item.phase || 0);
    switch (item.type) {
      case "pulse":
        item.mesh.material.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.35;
        if (item.light) item.light.intensity = 0.45 + Math.sin(t * 3) * 0.2;
        break;
      case "gatePulse":
        item.mesh.material.emissiveIntensity = 0.4 + Math.sin(t * 1.6) * 0.25;
        break;
      case "gateSpin":
        item.mesh.rotation.z += dt * 0.12;
        break;
      case "gateSpinReverse":
        item.mesh.rotation.z -= dt * 0.08;
        break;
      case "slowSpin":
        item.mesh.rotation.y += dt * (item.speed || 0.06);
        break;
      case "float":
      case "floatAt":
        item.mesh.position.y =
          (item.baseY ?? 2.2) + Math.sin(t * 1.2) * (item.amp || 0.3);
        break;
      case "sway":
        item.mesh.rotation.z = Math.sin(t * 0.9 + (item.phase || 0)) * (item.amp || 0.08);
        break;
      case "caustics":
        item.mesh.material.emissiveIntensity = 0.12 + Math.sin(t * 2.2) * 0.08;
        item.mesh.material.opacity = 0.28 + Math.sin(t * 1.8) * 0.1;
        break;
      case "drift":
        item.mesh.rotation.y += dt * item.speed * 0.15;
        break;
      case "spotSweep":
        item.mesh.position.x = Math.sin(t * 0.4) * 2.5;
        break;
      case "beacon":
        item.mesh.material.emissiveIntensity = 0.45 + Math.sin(t * 4) * 0.35;
        item.mesh.scale.y = 1 + Math.sin(t * 4) * 0.08;
        break;
      default:
        break;
    }
  }
}

function tick() {
  rafId = requestAnimationFrame(tick);
  if (!visible || !renderer) return;

  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;

  updatePlayer(dt);
  updateCamera(dt);
  animateWorld(dt);
  updateProximityHint();
  updateSkyMesh(skyMesh, currentWorldId, readAccent(), elapsed);

  composer.render();
  labelRenderer.render(scene, camera);
}

let clock;

export function initWorld3d() {
  const wrap = document.getElementById("world3d-wrap");
  if (!wrap) return;

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (err) {
    console.error("WebGL unavailable:", err);
    wrap.innerHTML = "<p class='world3d-fallback'>WebGL が利用できません。2Dモードで続行してください。</p>";
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  wrap.appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.className = "world3d-labels";
  wrap.appendChild(labelRenderer.domElement);

  scene = new THREE.Scene();
  skyMesh = createSkyMesh();
  scene.add(skyMesh);

  camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.15, 140);
  camera.position.set(0, 6, 12);

  hemiLight = new THREE.HemisphereLight("#a8c8e8", "#1a1020", 0.85);
  scene.add(hemiLight);

  sunLight = new THREE.DirectionalLight("#fff8f0", 0.9);
  sunLight.position.set(10, 18, 8);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 40;
  sunLight.shadow.camera.left = -18;
  sunLight.shadow.camera.right = 18;
  sunLight.shadow.camera.top = 18;
  sunLight.shadow.camera.bottom = -18;
  scene.add(sunLight);

  const built = buildPlayerModel(readAccent());
  player = built.group;
  player.userData = {
    accentMats: built.accentMats,
    glow: built.glow,
    walkParts: built.walkParts,
  };
  scene.add(player);

  playerShadow = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.68, 48),
    new THREE.MeshBasicMaterial({
      color: readAccent(),
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  playerShadow.rotation.x = -Math.PI / 2;
  playerShadow.position.y = 0.03;
  scene.add(playerShadow);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.52,
    0.38,
    0.78
  );
  composer.addPass(bloom);

  clock = new THREE.Clock();
  bindInput();
  bindTouchStick();
  const interactBtn = document.getElementById("btn-interact");
  if (interactBtn) interactBtn.addEventListener("click", tryInteract);
  loadWorld("horizon", true);
  cameraIntro = 1;
  cameraOrbit.distance = CAMERA_INTRO_FROM;
  cameraOrbit.pitch = 0.26;

  window.addEventListener("resize", onResize);
}

function onResize() {
  if (!renderer || !camera) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  composer.passes[1].resolution.set(w, h);
  labelRenderer.setSize(w, h);
}

export function showWorld3d() {
  visible = true;
  document.body.classList.add("mode-3d");
  const wrap = document.getElementById("world3d-wrap");
  const hint = document.getElementById("world3d-hint");
  const stick = document.getElementById("touch-stick");
  if (wrap) wrap.hidden = false;
  if (hint) hint.hidden = false;
  if (stick) stick.hidden = !("ontouchstart" in window);
  if (!rafId && renderer) tick();
  onResize();
}

export function hideWorld3d() {
  visible = false;
  explorationEnabled = false;
  document.body.classList.remove("mode-3d");
  document.body.classList.remove("title-backdrop");
  document.body.classList.remove("dialogue-collapsed");
  const wrap = document.getElementById("world3d-wrap");
  const hint = document.getElementById("world3d-hint");
  const stick = document.getElementById("touch-stick");
  const tab = document.getElementById("panel-focus-tab");
  if (wrap) wrap.hidden = true;
  if (hint) hint.hidden = true;
  if (stick) stick.hidden = true;
  if (tab) tab.hidden = true;
}

export function setExplorationEnabled(enabled) {
  explorationEnabled = enabled && visible;
  const hint = document.getElementById("world3d-hint");
  if (hint) {
    hint.classList.remove("world3d-hint-near");
    hint.textContent = enabled ? getDefaultHint() : SYSTEM_HINT;
  }
  if (!enabled) {
    touchInput.active = false;
    touchInput.x = 0;
    touchInput.z = 0;
  }
}

export function setWorldFromScene(sceneMeta) {
  if (!scene) return;
  currentSpeaker = sceneMeta.speaker || null;
  const worldId = mapSceneToWorld(sceneMeta);
  const sameWorld = worldId === currentWorldId && worldRoot;
  loadWorld(worldId, !sameWorld);
  updatePlayerAccent();
  setNpcBeacon(worldId, sceneMeta.speaker);
}
