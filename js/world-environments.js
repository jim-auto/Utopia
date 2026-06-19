import * as THREE from "three";

export const WORLD_CONFIG = {
  garden: {
    fog: 0.028,
    fogColor: "#0a1410",
    skyTop: "#2a5038",
    skyBottom: "#060c0a",
    horizon: "#3a6848",
    sun: 0.8,
    sunColor: "#ffe8c8",
    hemiTop: "#8ec8a0",
    hemiBottom: "#1a2018",
    bloom: 0.38,
    stars: 0.15,
  },
  horizon: {
    fog: 0.014,
    fogColor: "#040810",
    skyTop: "#1a3a58",
    skyBottom: "#020408",
    horizon: "#6ec8e8",
    sun: 0.5,
    sunColor: "#a8d8f0",
    hemiTop: "#88b8e8",
    hemiBottom: "#0a1020",
    bloom: 0.72,
    stars: 1,
  },
  chorus: {
    fog: 0.036,
    fogColor: "#180818",
    skyTop: "#502838",
    skyBottom: "#100810",
    horizon: "#e8a8c8",
    sun: 0.45,
    sunColor: "#f0c0d8",
    hemiTop: "#c890a8",
    hemiBottom: "#201018",
    bloom: 0.55,
    stars: 0.4,
  },
  palimpsest: {
    fog: 0.032,
    fogColor: "#0c0a18",
    skyTop: "#3a3868",
    skyBottom: "#080810",
    horizon: "#a8a0e8",
    sun: 0.4,
    sunColor: "#c8c0f0",
    hemiTop: "#9890d8",
    hemiBottom: "#12101e",
    bloom: 0.45,
    stars: 0.6,
  },
  atelier: {
    fog: 0.03,
    fogColor: "#140808",
    skyTop: "#502818",
    skyBottom: "#100808",
    horizon: "#e8926a",
    sun: 0.65,
    sunColor: "#ffb890",
    hemiTop: "#d89070",
    hemiBottom: "#201010",
    bloom: 0.48,
    stars: 0.25,
  },
  council: {
    fog: 0.024,
    fogColor: "#080a12",
    skyTop: "#284868",
    skyBottom: "#060810",
    horizon: "#88b8e8",
    sun: 0.48,
    sunColor: "#b8d8f8",
    hemiTop: "#7898c8",
    hemiBottom: "#101820",
    bloom: 0.44,
    stars: 0.7,
  },
  abyss: {
    fog: 0.042,
    fogColor: "#040810",
    skyTop: "#104858",
    skyBottom: "#020408",
    horizon: "#5ec8d8",
    sun: 0.32,
    sunColor: "#90e8f8",
    hemiTop: "#408898",
    hemiBottom: "#081018",
    bloom: 0.58,
    stars: 0.35,
  },
  forge: {
    fog: 0.034,
    fogColor: "#100c06",
    skyTop: "#483818",
    skyBottom: "#0c0804",
    horizon: "#e8c878",
    sun: 0.58,
    sunColor: "#ffe8b0",
    hemiTop: "#d8b878",
    hemiBottom: "#181008",
    bloom: 0.52,
    stars: 0.3,
  },
};

function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function createSkyMesh() {
  const geo = new THREE.SphereGeometry(120, 48, 32);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color("#122a45") },
      bottomColor: { value: new THREE.Color("#050810") },
      horizonColor: { value: new THREE.Color("#6ec8e8") },
      accentColor: { value: new THREE.Color("#6ec8e8") },
      starStrength: { value: 0.5 },
      time: { value: 0 },
      offset: { value: 10 },
      exponent: { value: 0.52 },
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
      uniform vec3 horizonColor;
      uniform vec3 accentColor;
      uniform float starStrength;
      uniform float time;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;

      float hash(vec3 p) {
        return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
      }

      float stars(vec3 dir) {
        float brightness = 0.0;
        vec3 p = dir * 180.0;
        vec3 cell = floor(p);
        float h = hash(cell);
        if (h > 0.992) {
          float tw = 0.6 + 0.4 * sin(time * 2.5 + h * 40.0);
          brightness += smoothstep(0.992, 1.0, h) * tw;
        }
        return brightness * starStrength;
      }

      void main() {
        vec3 dir = normalize(vWorldPosition);
        float h = normalize(vWorldPosition + offset).y;
        vec3 sky = mix(bottomColor, topColor, pow(max(h, 0.0), exponent));
        float horizonBand = exp(-abs(h) * 14.0);
        sky = mix(sky, horizonColor, horizonBand * 0.55);
        sky += accentColor * horizonBand * 0.12;
        sky += vec3(stars(dir));
        gl_FragColor = vec4(sky, 1.0);
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
}

export function updateSkyMesh(skyMesh, worldId, accent, elapsed = 0) {
  const cfg = WORLD_CONFIG[worldId] || WORLD_CONFIG.garden;
  if (!skyMesh?.material?.uniforms) return;
  const u = skyMesh.material.uniforms;
  u.topColor.value.set(cfg.skyTop);
  u.bottomColor.value.set(cfg.skyBottom);
  u.horizonColor.value.set(cfg.horizon);
  u.accentColor.value.set(accent);
  u.starStrength.value = cfg.stars;
  u.time.value = elapsed;
}

function mesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function addRollingTerrain(group, baseColor, accentColor, size, seed) {
  const rand = seededRandom(seed);
  const geo = new THREE.PlaneGeometry(size * 2, size * 2, 80, 80);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const h =
      Math.sin(x * 0.11) * 0.18 +
      Math.cos(y * 0.09) * 0.14 +
      Math.sin((x + y) * 0.07) * 0.08 +
      rand() * 0.04;
    pos.setZ(i, h);
  }
  geo.computeVertexNormals();
  const ground = mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.92,
      metalness: 0.03,
      flatShading: false,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(size * 0.88, size * 0.92, 80),
    new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.1, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;
  group.add(ring);
}

function addMountainRing(group, count, radius, maxH, color, seed) {
  const rand = seededRandom(seed);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + rand() * 0.2;
    const r = radius + rand() * 8;
    const h = maxH * (0.5 + rand() * 0.5);
    const mountain = mesh(
      new THREE.ConeGeometry(2.5 + rand() * 3, h, 8),
      new THREE.MeshStandardMaterial({ color, roughness: 0.95, flatShading: true })
    );
    mountain.position.set(Math.cos(angle) * r, h * 0.5 - 0.5, Math.sin(angle) * r);
    group.add(mountain);
  }
}

function addParticles(group, animated, count, color, spread, height, seed, size = 0.1) {
  const rand = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rand() - 0.5) * spread;
    positions[i * 3 + 1] = rand() * height + 0.5;
    positions[i * 3 + 2] = (rand() - 0.5) * spread;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  group.add(points);
  animated.push({ mesh: points, type: "drift", speed: 0.3 + rand() * 0.2 });
}

function addTrees(group, count, color, seed) {
  const rand = seededRandom(seed);
  for (let i = 0; i < count; i++) {
    const tree = new THREE.Group();
    const trunk = mesh(
      new THREE.CylinderGeometry(0.1, 0.16, 1.3, 8),
      new THREE.MeshStandardMaterial({ color: "#4a3528", roughness: 0.9 })
    );
    trunk.position.y = 0.65;
    const crown = mesh(
      new THREE.ConeGeometry(0.75 + rand() * 0.4, 1.8 + rand() * 0.6, 10),
      new THREE.MeshStandardMaterial({ color, roughness: 0.88 })
    );
    crown.position.y = 2;
    tree.add(trunk, crown);
    const angle = rand() * Math.PI * 2;
    const radius = 10 + rand() * 16;
    tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    tree.rotation.y = rand() * Math.PI;
    group.add(tree);
  }
}

function buildGarden(accent, animated, addLandmark) {
  const group = new THREE.Group();
  addRollingTerrain(group, "#1a2e22", accent, 50, 11);
  addMountainRing(group, 14, 38, 5, "#142818", 13);
  addTrees(group, 22, "#2d5a3a", 17);

  for (let i = 0; i < 14; i++) {
    const x = -14 + i * 2.1;
    const z = -6 + (i % 2) * 12;
    const pole = mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.6, 8), new THREE.MeshStandardMaterial({ color: "#3a3028" }));
    pole.position.set(x, 1.3, z);
    const lamp = mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 1.1 })
    );
    lamp.position.set(x, 2.65, z);
    const light = new THREE.PointLight(accent, 0.6, 10);
    light.position.copy(lamp.position);
    group.add(pole, lamp, light);
    animated.push({ mesh: lamp, light, phase: i * 0.65, type: "pulse" });
  }

  const stream = mesh(
    new THREE.PlaneGeometry(2.5, 28),
    new THREE.MeshStandardMaterial({
      color: "#2a4858",
      roughness: 0.15,
      metalness: 0.35,
      transparent: true,
      opacity: 0.75,
    })
  );
  stream.rotation.x = -Math.PI / 2;
  stream.position.set(-4, 0.06, 0);
  group.add(stream);

  const path = mesh(
    new THREE.PlaneGeometry(3.5, 24),
    new THREE.MeshStandardMaterial({ color: "#2a4030", roughness: 0.96 })
  );
  path.rotation.x = -Math.PI / 2;
  path.position.y = 0.05;
  group.add(path);

  const pavilion = new THREE.Group();
  pavilion.position.set(0, 0, -8);
  for (let i = 0; i < 6; i++) {
    const col = mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 2.8, 10),
      new THREE.MeshStandardMaterial({ color: "#3a3028", roughness: 0.85 })
    );
    const a = (i / 6) * Math.PI * 2;
    col.position.set(Math.cos(a) * 2.2, 1.4, Math.sin(a) * 1.6);
    pavilion.add(col);
  }
  const roof = mesh(
    new THREE.ConeGeometry(2.8, 1.2, 6),
    new THREE.MeshStandardMaterial({ color: "#2a4030", roughness: 0.88 })
  );
  roof.position.y = 2.9;
  pavilion.add(roof);
  group.add(pavilion);

  const arch = mesh(
    new THREE.TorusGeometry(2.5, 0.16, 12, 48, Math.PI),
    new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.5,
      metalness: 0.4,
      roughness: 0.3,
    })
  );
  arch.position.set(0, 2.4, -8);
  group.add(arch);
  animated.push({ mesh: arch, type: "gatePulse" });

  for (let i = 0; i < 20; i++) {
    const flower = mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? accent : "#e8c878",
        emissive: accent,
        emissiveIntensity: 0.3,
      })
    );
    flower.position.set(-8 + (i % 10) * 1.6, 0.08, -3 + Math.floor(i / 10) * 6);
    group.add(flower);
  }

  addParticles(group, animated, 100, accent, 45, 5, 29, 0.08);
  addLandmark(group, [0, 3.8, -8]);
  return group;
}

function buildHorizon(accent, animated, addLandmark) {
  const group = new THREE.Group();
  addRollingTerrain(group, "#0a1018", accent, 58, 31);
  addMountainRing(group, 10, 45, 8, "#0a1420", 37);

  const platform = mesh(
    new THREE.CylinderGeometry(8, 9, 0.5, 48),
    new THREE.MeshStandardMaterial({ color: "#1a2430", metalness: 0.5, roughness: 0.4 })
  );
  platform.position.y = 0.25;
  group.add(platform);

  for (let i = 0; i < 24; i++) {
    const rune = mesh(
      new THREE.TorusGeometry(0.35, 0.03, 6, 24),
      new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.35, transparent: true, opacity: 0.7 })
    );
    rune.rotation.x = Math.PI / 2;
    const a = (i / 24) * Math.PI * 2;
    rune.position.set(Math.cos(a) * 6.5, 0.52, Math.sin(a) * 6.5);
    group.add(rune);
  }

  const gate = mesh(
    new THREE.TorusGeometry(3.6, 0.22, 24, 96),
    new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.8,
      metalness: 0.7,
      roughness: 0.18,
    })
  );
  gate.position.set(0, 3.8, -10);
  group.add(gate);
  animated.push({ mesh: gate, type: "gateSpin" });

  const inner = mesh(
    new THREE.TorusGeometry(2.5, 0.07, 12, 72),
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      emissive: accent,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.55,
    })
  );
  inner.position.copy(gate.position);
  group.add(inner);
  animated.push({ mesh: inner, type: "gateSpinReverse" });

  const nebula = mesh(
    new THREE.PlaneGeometry(40, 20),
    new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
  );
  nebula.position.set(0, 8, -25);
  group.add(nebula);
  animated.push({ mesh: nebula, type: "sway", amp: 0.04 });

  const moon = mesh(
    new THREE.SphereGeometry(1.8, 32, 32),
    new THREE.MeshStandardMaterial({ color: "#8898a8", emissive: "#a0b0c0", emissiveIntensity: 0.15, roughness: 0.9 })
  );
  moon.position.set(18, 14, -30);
  group.add(moon);

  const gateLight = new THREE.PointLight(accent, 1.6, 40);
  gateLight.position.copy(gate.position);
  group.add(gateLight);

  addParticles(group, animated, 160, accent, 60, 28, 41, 0.14);
  addLandmark(group, [0, 5.4, -10]);
  return group;
}

function buildChorus(accent, animated, addLandmark) {
  const group = new THREE.Group();
  addRollingTerrain(group, "#201018", accent, 44, 43);

  for (let layer = 0; layer < 3; layer++) {
    const cloud = mesh(
      new THREE.SphereGeometry(16 + layer * 4, 32, 24),
      new THREE.MeshStandardMaterial({
        color: accent,
        transparent: true,
        opacity: 0.04 + layer * 0.02,
        depthWrite: false,
        side: THREE.BackSide,
      })
    );
    cloud.position.y = 6 + layer * 3;
    group.add(cloud);
    animated.push({ mesh: cloud, type: "sway", amp: 0.02, phase: layer });
  }

  const floor = mesh(
    new THREE.CircleGeometry(8, 64),
    new THREE.MeshStandardMaterial({
      color: "#281820",
      roughness: 0.2,
      metalness: 0.45,
      transparent: true,
      opacity: 0.85,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.04;
  group.add(floor);

  [[-4.5, -3], [4.5, -3], [0, 4.5]].forEach(([x, z], i) => {
    const orb = mesh(
      new THREE.SphereGeometry(2.2, 36, 36),
      new THREE.MeshStandardMaterial({
        color: accent,
        transparent: true,
        opacity: 0.3,
        emissive: accent,
        emissiveIntensity: 0.5,
      })
    );
    orb.position.set(x, 2.2, z);
    group.add(orb);
    animated.push({ mesh: orb, type: "floatAt", baseY: 2.2, phase: i * 1.4, amp: 0.4 });
    const orbLight = new THREE.PointLight(accent, 0.5, 12);
    orbLight.position.copy(orb.position);
    group.add(orbLight);
  });

  for (let r = 0; r < 3; r++) {
    const ring = mesh(
      new THREE.TorusGeometry(5 + r * 1.2, 0.05, 10, 80),
      new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.45 - r * 0.1 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.05 + r * 0.02;
    group.add(ring);
    animated.push({ mesh: ring, type: "slowSpin", speed: 0.04 + r * 0.02 });
  }

  addParticles(group, animated, 80, accent, 22, 7, 53, 0.09);
  addLandmark(group, [0, 4.4, 0]);
  return group;
}

function buildPalimpsest(accent, animated, addLandmark) {
  const group = new THREE.Group();
  addRollingTerrain(group, "#12101e", accent, 46, 61);

  const grid = mesh(
    new THREE.PlaneGeometry(40, 40, 40, 40),
    new THREE.MeshBasicMaterial({
      color: accent,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    })
  );
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = 0.03;
  group.add(grid);

  const ringGroup = new THREE.Group();
  for (let i = 0; i < 24; i++) {
    const slab = mesh(
      new THREE.BoxGeometry(1.4, 2.8, 0.12),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? "#2a2840" : "#3a3860",
        emissive: i % 3 ? accent : "#000000",
        emissiveIntensity: i % 3 ? 0.25 : 0,
        roughness: 0.72,
      })
    );
    const angle = (i / 24) * Math.PI * 2;
    slab.position.set(Math.cos(angle) * 8, 1.4, Math.sin(angle) * 8);
    slab.lookAt(0, 1.4, 0);
    ringGroup.add(slab);
  }
  group.add(ringGroup);
  animated.push({ mesh: ringGroup, type: "slowSpin", speed: 0.035 });

  const beam = mesh(
    new THREE.CylinderGeometry(0.15, 0.4, 8, 16, 1, true),
    new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  beam.position.y = 4;
  group.add(beam);
  animated.push({ mesh: beam, type: "pulse" });

  const core = mesh(
    new THREE.OctahedronGeometry(1.4, 1),
    new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.55 })
  );
  core.position.y = 2.3;
  group.add(core);
  animated.push({ mesh: core, type: "floatAt", baseY: 2.3, amp: 0.25 });

  for (let i = 0; i < 8; i++) {
    const stream = mesh(
      new THREE.PlaneGeometry(0.4, 6),
      new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    const a = (i / 8) * Math.PI * 2;
    stream.position.set(Math.cos(a) * 3, 3, Math.sin(a) * 3);
    group.add(stream);
    animated.push({ mesh: stream, type: "drift", speed: 0.2 });
  }

  addParticles(group, animated, 70, accent, 30, 10, 67, 0.07);
  addLandmark(group, [0, 4, 0]);
  return group;
}

function buildAtelier(accent, animated, addLandmark) {
  const group = new THREE.Group();
  addRollingTerrain(group, "#281018", accent, 46, 71);
  addMountainRing(group, 8, 42, 6, "#301810", 73);

  for (let tier = 0; tier < 4; tier++) {
    const r = 6 + tier * 1.5;
    for (let i = 0; i < 12 + tier * 4; i++) {
      const a = (i / (12 + tier * 4)) * Math.PI * 2;
      const seat = mesh(
        new THREE.BoxGeometry(0.75, 0.4, 0.75),
        new THREE.MeshStandardMaterial({ color: "#402830" })
      );
      seat.position.set(Math.cos(a) * r, 0.2 + tier * 0.15, 4 + Math.sin(a) * (r * 0.55));
      seat.lookAt(0, seat.position.y, -4);
      group.add(seat);
    }
  }

  const stage = mesh(
    new THREE.BoxGeometry(12, 0.6, 8),
    new THREE.MeshStandardMaterial({ color: "#3a2028", roughness: 0.78 })
  );
  stage.position.set(0, 0.3, -4);
  group.add(stage);

  const curtainL = mesh(
    new THREE.PlaneGeometry(2, 5, 1, 8),
    new THREE.MeshStandardMaterial({ color: "#502830", roughness: 0.9, side: THREE.DoubleSide })
  );
  curtainL.position.set(-5.5, 2.5, -4);
  const curtainR = curtainL.clone();
  curtainR.position.x = 5.5;
  group.add(curtainL, curtainR);
  animated.push({ mesh: curtainL, type: "sway", amp: 0.06 });
  animated.push({ mesh: curtainR, type: "sway", amp: 0.06, phase: 1.5 });

  const shell = mesh(
    new THREE.SphereGeometry(5.5, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2.1),
    new THREE.MeshStandardMaterial({
      color: accent,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      emissive: accent,
      emissiveIntensity: 0.28,
    })
  );
  shell.position.set(0, 0, -4);
  group.add(shell);

  const spotlight = new THREE.SpotLight(accent, 1.4, 35, 0.42, 0.45);
  spotlight.castShadow = true;
  spotlight.position.set(0, 10, 3);
  spotlight.target.position.set(0, 0, -4);
  group.add(spotlight, spotlight.target);
  animated.push({ mesh: spotlight, type: "spotSweep" });

  addParticles(group, animated, 90, "#c88060", 35, 6, 79, 0.06);
  addLandmark(group, [0, 4.2, -4]);
  return group;
}

function buildCouncil(accent, animated, addLandmark) {
  const group = new THREE.Group();
  addRollingTerrain(group, "#101820", accent, 50, 81);

  const dome = mesh(
    new THREE.SphereGeometry(14, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2.2),
    new THREE.MeshStandardMaterial({
      color: accent,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false,
      wireframe: false,
    })
  );
  dome.position.y = 0.2;
  group.add(dome);

  for (let i = 0; i < 12; i++) {
    const pillar = mesh(
      new THREE.CylinderGeometry(0.34, 0.44, 6, 16),
      new THREE.MeshStandardMaterial({ color: "#1a2838", metalness: 0.4, roughness: 0.5 })
    );
    const angle = (i / 12) * Math.PI * 2;
    pillar.position.set(Math.cos(angle) * 11, 3, Math.sin(angle) * 11);
    group.add(pillar);
    const capital = mesh(
      new THREE.TorusGeometry(0.5, 0.06, 8, 24),
      new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.25 })
    );
    capital.rotation.x = Math.PI / 2;
    capital.position.set(pillar.position.x, 6, pillar.position.z);
    group.add(capital);
  }

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const bench = mesh(
      new THREE.BoxGeometry(1.2, 0.35, 0.5),
      new THREE.MeshStandardMaterial({ color: "#243040" })
    );
    bench.position.set(Math.cos(a) * 6.5, 0.2, Math.sin(a) * 6.5);
    bench.lookAt(0, 0.2, 0);
    group.add(bench);
  }

  const table = mesh(
    new THREE.CylinderGeometry(4, 4, 0.4, 40),
    new THREE.MeshStandardMaterial({ color: "#243040", metalness: 0.35, roughness: 0.48 })
  );
  table.position.y = 0.2;
  group.add(table);

  const mosaic = mesh(
    new THREE.CircleGeometry(2.4, 48),
    new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.6 })
  );
  mosaic.rotation.x = -Math.PI / 2;
  mosaic.position.y = 0.42;
  group.add(mosaic);
  animated.push({ mesh: mosaic, type: "gatePulse" });

  for (let i = 0; i < 6; i++) {
    const banner = mesh(
      new THREE.PlaneGeometry(0.8, 2.5, 1, 6),
      new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      })
    );
    const a = (i / 6) * Math.PI * 2 + 0.3;
    banner.position.set(Math.cos(a) * 9, 3.5, Math.sin(a) * 9);
    banner.lookAt(0, 3.5, 0);
    group.add(banner);
    animated.push({ mesh: banner, type: "sway", amp: 0.12, phase: i * 0.8 });
  }

  addParticles(group, animated, 60, accent, 40, 12, 89, 0.08);
  addLandmark(group, [0, 3.4, 0]);
  return group;
}

function buildAbyss(accent, animated, addLandmark) {
  const group = new THREE.Group();
  addRollingTerrain(group, "#0a1820", accent, 46, 91);

  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const cliff = mesh(
      new THREE.BoxGeometry(3 + (i % 3), 4 + (i % 4), 1.2),
      new THREE.MeshStandardMaterial({ color: "#1a3040", roughness: 0.85, flatShading: true })
    );
    cliff.position.set(Math.cos(angle) * 20, 2, Math.sin(angle) * 16 - 4);
    cliff.lookAt(0, 2, -6);
    group.add(cliff);
  }

  const trench = mesh(
    new THREE.CylinderGeometry(4, 6, 1, 48, 1, true),
    new THREE.MeshStandardMaterial({
      color: "#010408",
      emissive: accent,
      emissiveIntensity: 0.2,
      side: THREE.DoubleSide,
    })
  );
  trench.position.set(0, -0.3, -6);
  group.add(trench);

  const caustics = mesh(
    new THREE.PlaneGeometry(12, 10, 32, 32),
    new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
  );
  caustics.rotation.x = -Math.PI / 2;
  caustics.position.set(0, 0.08, -6);
  group.add(caustics);
  animated.push({ mesh: caustics, type: "caustics" });

  for (let i = 0; i < 16; i++) {
    const pillar = mesh(
      new THREE.CylinderGeometry(0.08, 0.15, 2.8 + (i % 4) * 0.6, 10),
      new THREE.MeshStandardMaterial({
        color: accent,
        emissive: accent,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.8,
      })
    );
    const angle = (i / 16) * Math.PI * 2;
    pillar.position.set(Math.cos(angle) * 9, 1.3, -6 + Math.sin(angle) * 6);
    group.add(pillar);
    animated.push({ mesh: pillar, type: "pulse", phase: i * 0.45 });
  }

  const ice = mesh(
    new THREE.BoxGeometry(16, 0.35, 12),
    new THREE.MeshStandardMaterial({
      color: "#1a3040",
      transparent: true,
      opacity: 0.55,
      roughness: 0.12,
      metalness: 0.2,
    })
  );
  ice.position.set(0, 0.14, -2);
  group.add(ice);

  addParticles(group, animated, 120, accent, 40, 10, 97, 0.1);
  addLandmark(group, [0, 3, -6]);
  return group;
}

function buildForge(accent, animated, addLandmark) {
  const group = new THREE.Group();
  addRollingTerrain(group, "#1a1408", accent, 44, 101);
  addMountainRing(group, 10, 40, 5, "#281808", 103);

  for (let i = 0; i < 6; i++) {
    const crucible = mesh(
      new THREE.CylinderGeometry(0.9, 1.1, 1.2, 16),
      new THREE.MeshStandardMaterial({
        color: "#3a2818",
        metalness: 0.55,
        roughness: 0.35,
        emissive: accent,
        emissiveIntensity: 0.15,
      })
    );
    const a = (i / 6) * Math.PI * 2;
    crucible.position.set(Math.cos(a) * 9, 0.6, Math.sin(a) * 7 - 2);
    group.add(crucible);
    animated.push({ mesh: crucible, type: "pulse", phase: i * 0.5 });
  }

  for (let i = 0; i < 8; i++) {
    const pod = mesh(
      new THREE.SphereGeometry(0.7 + (i % 3) * 0.2, 20, 20),
      new THREE.MeshStandardMaterial({
        color: accent,
        transparent: true,
        opacity: 0.35,
        emissive: accent,
        emissiveIntensity: 0.35,
      })
    );
    const a = (i / 8) * Math.PI * 2 + 0.4;
    pod.position.set(Math.cos(a) * 6, 1.2 + (i % 2) * 0.5, Math.sin(a) * 5 - 3);
    group.add(pod);
    animated.push({ mesh: pod, type: "floatAt", baseY: pod.position.y, amp: 0.2, phase: i * 0.7 });
  }

  const chamber = mesh(
    new THREE.TorusGeometry(3.2, 0.35, 16, 48),
    new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.45,
      metalness: 0.6,
      roughness: 0.25,
    })
  );
  chamber.rotation.x = Math.PI / 2;
  chamber.position.set(0, 1.4, -5);
  group.add(chamber);
  animated.push({ mesh: chamber, type: "slowSpin", speed: 0.03 });

  const inner = mesh(
    new THREE.OctahedronGeometry(1.2, 0),
    new THREE.MeshStandardMaterial({
      color: "#f0e6c8",
      emissive: accent,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.75,
    })
  );
  inner.position.set(0, 1.6, -5);
  group.add(inner);
  animated.push({ mesh: inner, type: "floatAt", baseY: 1.6, amp: 0.15 });

  const forgeLight = new THREE.PointLight(accent, 1.2, 25);
  forgeLight.position.set(0, 3, -5);
  group.add(forgeLight);

  addParticles(group, animated, 90, "#e8c878", 32, 8, 107, 0.08);
  addLandmark(group, [0, 3.2, -5]);
  return group;
}

const BUILDERS = {
  garden: buildGarden,
  horizon: buildHorizon,
  chorus: buildChorus,
  palimpsest: buildPalimpsest,
  atelier: buildAtelier,
  council: buildCouncil,
  abyss: buildAbyss,
  forge: buildForge,
};

export function buildWorldEnvironment(worldId, accent, addLandmarkFn) {
  const fn = BUILDERS[worldId] || BUILDERS.garden;
  const animated = [];
  const addLandmark = (group, pos) => addLandmarkFn(group, pos);
  const group = fn(accent, animated, addLandmark);
  group.userData.animated = animated;
  return group;
}

export function applyWorldLighting(worldId, sun, hemi) {
  const cfg = WORLD_CONFIG[worldId] || WORLD_CONFIG.garden;
  if (sun) {
    sun.intensity = cfg.sun;
    sun.color.set(cfg.sunColor);
  }
  if (hemi) {
    hemi.intensity = 0.85;
    hemi.color.set(cfg.hemiTop);
    hemi.groundColor.set(cfg.hemiBottom);
  }
}
