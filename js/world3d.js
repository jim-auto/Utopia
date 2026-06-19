import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

let renderer;
let labelRenderer;
let composer;
let scene;
let camera;
let player;
let playerShadow;
let worldRoot;
let skyMesh;
let rafId = null;
let visible = false;
let explorationEnabled = false;
let currentWorldId = "garden";
let elapsed = 0;

const keys = new Set();
const pointer = { down: false, x: 0, y: 0, id: null };
const cameraOrbit = { yaw: 0, pitch: 0.38, distance: 8 };
const playerVel = new THREE.Vector3();
const tmpVec = new THREE.Vector3();

const WORLD_BOUNDS = 24;
const MOVE_SPEED = 8.5;

const WORLD_CONFIG = {
  garden: {
    fog: 0.032,
    fogColor: "#0a1410",
    skyTop: "#1a3828",
    skyBottom: "#060c0a",
    sun: 0.75,
    bloom: 0.35,
  },
  horizon: {
    fog: 0.018,
    fogColor: "#050810",
    skyTop: "#122a45",
    skyBottom: "#030508",
    sun: 0.55,
    bloom: 0.65,
  },
  chorus: {
    fog: 0.04,
    fogColor: "#180818",
    skyTop: "#402030",
    skyBottom: "#100810",
    sun: 0.5,
    bloom: 0.5,
  },
  palimpsest: {
    fog: 0.038,
    fogColor: "#0c0a18",
    skyTop: "#2a2848",
    skyBottom: "#080810",
    sun: 0.45,
    bloom: 0.4,
  },
  atelier: {
    fog: 0.035,
    fogColor: "#140808",
    skyTop: "#402018",
    skyBottom: "#100808",
    sun: 0.6,
    bloom: 0.45,
  },
  council: {
    fog: 0.028,
    fogColor: "#080a12",
    skyTop: "#203048",
    skyBottom: "#060810",
    sun: 0.5,
    bloom: 0.42,
  },
};

const NPC_LABELS = {
  aster: "アスター",
  sen: "セン",
  soli: "ソリ",
  child: "子ども代表",
  lin: "リン",
  kaede: "カエデ",
  haru: "ハル",
  io: "イオ",
};

const WORLD_LANDMARKS = {
  garden: { label: "祭りの広場", position: [0, 2.8, -8] },
  horizon: { label: "地平門", position: [0, 4.2, -10] },
  chorus: { label: "共有室", position: [0, 3.5, 0] },
  palimpsest: { label: "記録の環", position: [0, 3.2, 0] },
  atelier: { label: "初演の舞台", position: [0, 3.5, -4] },
  council: { label: "公共議会", position: [0, 2.5, 0] },
};

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
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

function applyWorldAtmosphere(worldId) {
  const cfg = WORLD_CONFIG[worldId] || WORLD_CONFIG.garden;
  scene.fog = new THREE.FogExp2(cfg.fogColor, cfg.fog);
  scene.background = new THREE.Color(cfg.fogColor);

  if (skyMesh) {
    skyMesh.material.uniforms.topColor.value.set(cfg.skyTop);
    skyMesh.material.uniforms.bottomColor.value.set(cfg.skyBottom);
  }

  if (composer) {
    const bloom = composer.passes[1];
    if (bloom) bloom.strength = cfg.bloom;
  }
}

function createSky() {
  const geo = new THREE.SphereGeometry(90, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color("#122a45") },
      bottomColor: { value: new THREE.Color("#050810") },
      offset: { value: 8 },
      exponent: { value: 0.55 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPosition = wp.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
  });
  skyMesh = new THREE.Mesh(geo, mat);
  scene.add(skyMesh);
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

function addGround(group, color, size = 48, accent) {
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(size, 64),
    new THREE.MeshStandardMaterial({ color, roughness: 0.94, metalness: 0.04 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(size * 0.92, size * 0.94, 64),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);
}

function addTrees(group, count, color, seed = 1) {
  const rand = seededRandom(seed);
  for (let i = 0; i < count; i++) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 1.2, 6),
      new THREE.MeshStandardMaterial({ color: "#4a3528", roughness: 0.9 })
    );
    trunk.position.y = 0.6;
    trunk.castShadow = true;
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(0.85 + rand() * 0.3, 2 + rand() * 0.5, 7),
      new THREE.MeshStandardMaterial({ color, roughness: 0.88 })
    );
    crown.position.y = 2.1;
    crown.castShadow = true;
    tree.add(trunk, crown);
    const angle = rand() * Math.PI * 2;
    const radius = 9 + rand() * 13;
    tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    tree.rotation.y = rand() * Math.PI;
    group.add(tree);
  }
}

function addLanterns(group, accent) {
  for (let i = 0; i < 10; i++) {
    const x = -12 + i * 2.6;
    const z = -5 + (i % 2) * 10;
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.07, 2.4, 6),
      new THREE.MeshStandardMaterial({ color: "#3a3028" })
    );
    pole.position.set(x, 1.2, z);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 10),
      new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 1.2 })
    );
    lamp.position.set(x, 2.5, z);
    const light = new THREE.PointLight(accent, 0.55, 9);
    light.position.copy(lamp.position);
    group.add(pole, lamp, light);
    group.userData.animated.push({
      mesh: lamp,
      light,
      phase: i * 0.7,
      type: "pulse",
    });
  }
}

function addParticles(group, count, color, spread, height, seed = 7) {
  const rand = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rand() - 0.5) * spread;
    positions[i * 3 + 1] = rand() * height + 0.5;
    positions[i * 3 + 2] = (rand() - 0.5) * spread;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size: 0.12,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  group.add(points);
  group.userData.animated.push({ mesh: points, type: "drift", speed: 0.35 });
}

function buildGarden(accent) {
  const group = new THREE.Group();
  group.userData.animated = [];
  addGround(group, "#1a2e22", 46, accent);
  addTrees(group, 18, "#2d5a3a", 11);
  addLanterns(group, accent);
  addParticles(group, 80, accent, 30, 4, 19);

  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 22),
    new THREE.MeshStandardMaterial({ color: "#2a4030", roughness: 0.96 })
  );
  path.rotation.x = -Math.PI / 2;
  path.position.y = 0.015;
  group.add(path);

  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.14, 10, 32, Math.PI),
    new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.45,
      metalness: 0.35,
      roughness: 0.35,
    })
  );
  arch.position.set(0, 2.3, -8);
  group.add(arch);
  group.userData.animated.push({ mesh: arch, type: "gatePulse" });

  const landmark = makeLabel(WORLD_LANDMARKS.garden.label, "world-label world-label-landmark");
  landmark.position.set(0, 3.6, -8);
  group.add(landmark);

  return group;
}

function buildHorizon(accent) {
  const group = new THREE.Group();
  group.userData.animated = [];
  addGround(group, "#0a1018", 58, accent);

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(7, 8, 0.45, 40),
    new THREE.MeshStandardMaterial({ color: "#1a2430", metalness: 0.45, roughness: 0.45 })
  );
  platform.position.y = 0.22;
  platform.receiveShadow = true;
  group.add(platform);

  const gate = new THREE.Mesh(
    new THREE.TorusGeometry(3.4, 0.2, 20, 80),
    new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.75,
      metalness: 0.65,
      roughness: 0.2,
    })
  );
  gate.position.set(0, 3.6, -10);
  group.add(gate);
  group.userData.animated.push({ mesh: gate, type: "gateSpin" });

  const inner = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.06, 12, 64),
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      emissive: accent,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.5,
    })
  );
  inner.position.copy(gate.position);
  group.add(inner);
  group.userData.animated.push({ mesh: inner, type: "gateSpinReverse" });

  const gateLight = new THREE.PointLight(accent, 1.4, 35);
  gateLight.position.copy(gate.position);
  group.add(gateLight);

  addParticles(group, 120, accent, 55, 25, 31);

  const landmark = makeLabel(WORLD_LANDMARKS.horizon.label, "world-label world-label-landmark");
  landmark.position.set(0, 5.2, -10);
  group.add(landmark);

  return group;
}

function buildChorus(accent) {
  const group = new THREE.Group();
  group.userData.animated = [];
  addGround(group, "#201018", 42, accent);

  [[-4.5, -3], [4.5, -3], [0, 4.5]].forEach(([x, z], i) => {
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(2.1, 28, 28),
      new THREE.MeshStandardMaterial({
        color: accent,
        transparent: true,
        opacity: 0.32,
        emissive: accent,
        emissiveIntensity: 0.45,
      })
    );
    orb.position.set(x, 2.2, z);
    group.add(orb);
    group.userData.animated.push({ mesh: orb, type: "float", phase: i * 1.4, amp: 0.35 });
  });

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(5.5, 0.07, 10, 64),
    new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.55 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.06;
  group.add(ring);
  group.userData.animated.push({ mesh: ring, type: "slowSpin" });

  addParticles(group, 60, accent, 18, 6, 43);

  const landmark = makeLabel(WORLD_LANDMARKS.chorus.label, "world-label world-label-landmark");
  landmark.position.set(0, 4.2, 0);
  group.add(landmark);

  return group;
}

function buildPalimpsest(accent) {
  const group = new THREE.Group();
  group.userData.animated = [];
  addGround(group, "#12101e", 44, accent);

  const ringGroup = new THREE.Group();
  for (let i = 0; i < 20; i++) {
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2.6, 0.1),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? "#2a2840" : "#3a3860",
        emissive: i % 3 ? accent : "#000000",
        emissiveIntensity: i % 3 ? 0.22 : 0,
        roughness: 0.75,
      })
    );
    const angle = (i / 20) * Math.PI * 2;
    slab.position.set(Math.cos(angle) * 7.5, 1.3, Math.sin(angle) * 7.5);
    slab.lookAt(0, 1.3, 0);
    ringGroup.add(slab);
  }
  group.add(ringGroup);
  group.userData.animated.push({ mesh: ringGroup, type: "slowSpin" });

  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.3, 0),
    new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.5 })
  );
  core.position.y = 2.2;
  group.add(core);
  group.userData.animated.push({ mesh: core, type: "float", phase: 0, amp: 0.2 });

  const landmark = makeLabel(WORLD_LANDMARKS.palimpsest.label, "world-label world-label-landmark");
  landmark.position.set(0, 3.8, 0);
  group.add(landmark);

  return group;
}

function buildAtelier(accent) {
  const group = new THREE.Group();
  group.userData.animated = [];
  addGround(group, "#281018", 44, accent);

  const stage = new THREE.Mesh(
    new THREE.BoxGeometry(11, 0.55, 7),
    new THREE.MeshStandardMaterial({ color: "#3a2028", roughness: 0.82 })
  );
  stage.position.set(0, 0.28, -4);
  stage.receiveShadow = true;
  group.add(stage);

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(5, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2.1),
    new THREE.MeshStandardMaterial({
      color: accent,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      emissive: accent,
      emissiveIntensity: 0.25,
    })
  );
  shell.position.set(0, 0, -4);
  group.add(shell);

  for (let i = 0; i < 6; i++) {
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.45, 0.85),
      new THREE.MeshStandardMaterial({ color: "#402830" })
    );
    seat.position.set(-5 + i * 2, 0.22, 4);
    group.add(seat);
  }

  const spotlight = new THREE.SpotLight(accent, 1.2, 30, 0.45, 0.5);
  spotlight.position.set(0, 8, 2);
  spotlight.target.position.set(0, 0, -4);
  group.add(spotlight, spotlight.target);
  group.userData.animated.push({ mesh: spotlight, type: "spotSweep" });

  const landmark = makeLabel(WORLD_LANDMARKS.atelier.label, "world-label world-label-landmark");
  landmark.position.set(0, 4, -4);
  group.add(landmark);

  return group;
}

function buildCouncil(accent) {
  const group = new THREE.Group();
  group.userData.animated = [];
  addGround(group, "#101820", 48, accent);

  for (let i = 0; i < 10; i++) {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.42, 5.5, 10),
      new THREE.MeshStandardMaterial({ color: "#1a2838", metalness: 0.35, roughness: 0.55 })
    );
    const angle = (i / 10) * Math.PI * 2;
    pillar.position.set(Math.cos(angle) * 10, 2.75, Math.sin(angle) * 10);
    pillar.castShadow = true;
    group.add(pillar);
  }

  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(3.8, 3.8, 0.35, 32),
    new THREE.MeshStandardMaterial({ color: "#243040", metalness: 0.3, roughness: 0.5 })
  );
  table.position.y = 0.18;
  group.add(table);

  const mosaic = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 32),
    new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.55 })
  );
  mosaic.rotation.x = -Math.PI / 2;
  mosaic.position.y = 0.36;
  group.add(mosaic);
  group.userData.animated.push({ mesh: mosaic, type: "gatePulse" });

  const landmark = makeLabel(WORLD_LANDMARKS.council.label, "world-label world-label-landmark");
  landmark.position.set(0, 3.2, 0);
  group.add(landmark);

  return group;
}

const WORLD_BUILDERS = {
  garden: buildGarden,
  horizon: buildHorizon,
  chorus: buildChorus,
  palimpsest: buildPalimpsest,
  atelier: buildAtelier,
  council: buildCouncil,
};

export function mapSceneToWorld({ art, mood, location } = {}) {
  const loc = location || "";
  if (loc.includes("コーラス") || loc.includes("金星")) return "chorus";
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
  const id = WORLD_BUILDERS[worldId] ? worldId : "garden";
  if (id === currentWorldId && worldRoot && !force) {
    applyWorldAtmosphere(id);
    updatePlayerAccent();
    return;
  }

  clearWorld();
  clearNpcBeacon();
  currentWorldId = id;
  const accent = readAccent();
  worldRoot = WORLD_BUILDERS[id](accent);
  scene.add(worldRoot);
  applyWorldAtmosphere(id);

  player.position.set(0, 0, 7);
  playerVel.set(0, 0, 0);
  cameraOrbit.yaw = 0;
  updatePlayerAccent();
}

function updatePlayerAccent() {
  if (!player) return;
  const accent = readAccent();
  const body = player.children[0];
  const ring = player.children[1];
  if (body?.material) {
    body.material.color.set(accent);
    body.material.emissive.set(accent);
  }
  if (ring?.material) {
    ring.material.color.set(accent);
    ring.material.emissive.set(accent);
  }
  if (playerShadow?.material) {
    playerShadow.material.color.set(accent);
  }
}

function bindInput() {
  window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
      keys.add(e.key.toLowerCase());
      e.preventDefault();
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

  if (playerShadow) {
    playerShadow.position.x = player.position.x;
    playerShadow.position.z = player.position.z;
    const speed = playerVel.length();
    playerShadow.scale.setScalar(0.85 + speed * 0.04);
    playerShadow.material.opacity = 0.18 + speed * 0.02;
  }
}

function updateCamera(dt) {
  const targetY = 1.25;
  const target = tmpVec.set(player.position.x, targetY, player.position.z);
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
        item.mesh.rotation.y += dt * 0.06;
        break;
      case "float":
        item.mesh.position.y = 2.2 + Math.sin(t * 1.2) * (item.amp || 0.3);
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
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  wrap.appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.className = "world3d-labels";
  wrap.appendChild(labelRenderer.domElement);

  scene = new THREE.Scene();
  createSky();

  camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.15, 140);
  camera.position.set(0, 6, 12);

  const hemi = new THREE.HemisphereLight("#a8c8e8", "#1a1020", 0.85);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight("#fff8f0", 0.9);
  sun.position.set(10, 18, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = -18;
  sun.shadow.camera.right = 18;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -18;
  scene.add(sun);

  player = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.38, 0.95, 6, 12),
    new THREE.MeshStandardMaterial({
      color: readAccent(),
      emissive: readAccent(),
      emissiveIntensity: 0.18,
      roughness: 0.45,
      metalness: 0.08,
    })
  );
  body.position.y = 0.95;
  body.castShadow = true;

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.04, 8, 32),
    new THREE.MeshStandardMaterial({
      color: readAccent(),
      emissive: readAccent(),
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.7,
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.08;

  player.add(body, ring);
  scene.add(player);

  playerShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 24),
    new THREE.MeshBasicMaterial({
      color: readAccent(),
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    })
  );
  playerShadow.rotation.x = -Math.PI / 2;
  playerShadow.position.y = 0.03;
  scene.add(playerShadow);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.45,
    0.35,
    0.85
  );
  composer.addPass(bloom);

  clock = new THREE.Clock();
  bindInput();
  loadWorld("garden", true);

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
  if (wrap) wrap.hidden = false;
  if (hint) hint.hidden = false;
  if (!rafId && renderer) tick();
  onResize();
}

export function hideWorld3d() {
  visible = false;
  explorationEnabled = false;
  document.body.classList.remove("mode-3d");
  const wrap = document.getElementById("world3d-wrap");
  const hint = document.getElementById("world3d-hint");
  if (wrap) wrap.hidden = true;
  if (hint) hint.hidden = true;
}

export function setExplorationEnabled(enabled) {
  explorationEnabled = enabled && visible;
  const hint = document.getElementById("world3d-hint");
  if (hint) {
    hint.textContent = enabled
      ? "WASD / 矢印 — 移動 · ドラッグ — 視点 · ホイール — 距離"
      : "条項を選んでください（移動は一時停止）";
  }
}

export function setWorldFromScene(sceneMeta) {
  if (!scene) return;
  const worldId = mapSceneToWorld(sceneMeta);
  const sameWorld = worldId === currentWorldId && worldRoot;
  loadWorld(worldId, !sameWorld);
  updatePlayerAccent();
  setNpcBeacon(worldId, sceneMeta.speaker);
}
