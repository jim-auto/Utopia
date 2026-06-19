import * as THREE from "three";

/** ハイポリ証人キャラ — ブラウザ向けに ~12k tris 目安 */
const CY = 28;
const SP = 36;
const TR = 64;

export function buildPlayerModel(accentColor) {
  const root = new THREE.Group();
  const accentMats = [];
  const registerAccent = (mat) => {
    accentMats.push(mat);
    return mat;
  };

  const fabric = new THREE.MeshStandardMaterial({
    color: "#0c1218",
    roughness: 0.88,
    metalness: 0.12,
  });
  const fabricMid = new THREE.MeshStandardMaterial({
    color: "#182430",
    roughness: 0.82,
    metalness: 0.14,
  });
  const fabricLight = new THREE.MeshStandardMaterial({
    color: "#243040",
    roughness: 0.78,
    metalness: 0.1,
  });
  const leather = new THREE.MeshStandardMaterial({
    color: "#1a1410",
    roughness: 0.62,
    metalness: 0.22,
  });
  const skin = new THREE.MeshStandardMaterial({
    color: "#eadfce",
    roughness: 0.72,
    metalness: 0.03,
  });
  const skinShadow = new THREE.MeshStandardMaterial({
    color: "#c9b8a6",
    roughness: 0.8,
    metalness: 0.02,
  });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: "#f4f0ea", roughness: 0.35 });
  const eyeDark = new THREE.MeshStandardMaterial({ color: "#1a2030", roughness: 0.2, metalness: 0.1 });
  const accentTrim = registerAccent(
    new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: accentColor,
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.35,
    })
  );

  function mesh(geo, mat) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  const hips = new THREE.Group();
  hips.position.y = 0.9;

  function makeBoot(parent, y) {
    const sole = mesh(new THREE.BoxGeometry(0.15, 0.05, 0.28), leather);
    sole.position.set(0, y - 0.02, 0.06);
    const upper = mesh(new THREE.BoxGeometry(0.13, 0.14, 0.22), leather);
    upper.position.set(0, y + 0.06, 0.02);
    const toe = mesh(new THREE.SphereGeometry(0.07, SP, SP, 0, Math.PI * 2, 0, Math.PI / 2), leather);
    toe.rotation.x = Math.PI;
    toe.position.set(0, y, 0.12);
    const strap = mesh(new THREE.TorusGeometry(0.065, 0.012, 8, TR), accentTrim);
    strap.rotation.y = Math.PI / 2;
    strap.position.set(0, y + 0.04, 0.08);
    parent.add(sole, upper, toe, strap);
  }

  function makeLeg(x) {
    const leg = new THREE.Group();
    leg.position.x = x;

    const pelvis = mesh(new THREE.SphereGeometry(0.11, SP, SP), fabricMid);
    pelvis.scale.set(1.1, 0.85, 0.95);
    pelvis.position.y = 0.02;

    const thigh = mesh(new THREE.CapsuleGeometry(0.082, 0.38, 8, CY), fabric);
    thigh.position.y = -0.2;

    const knee = mesh(new THREE.SphereGeometry(0.075, SP, SP), fabricLight);
    knee.position.y = -0.44;

    const shin = mesh(new THREE.CapsuleGeometry(0.068, 0.36, 8, CY), fabricMid);
    shin.position.y = -0.66;

    const calfPlate = mesh(new THREE.BoxGeometry(0.06, 0.22, 0.04), fabricLight);
    calfPlate.position.set(0, -0.66, 0.06);

    const ankle = mesh(new THREE.TorusGeometry(0.055, 0.014, 8, TR), accentTrim);
    ankle.rotation.x = Math.PI / 2;
    ankle.position.y = -0.88;

    makeBoot(leg, -0.9);
    leg.add(pelvis, thigh, knee, shin, calfPlate, ankle);
    return leg;
  }

  const legL = makeLeg(-0.155);
  const legR = makeLeg(0.155);

  const belt = mesh(new THREE.TorusGeometry(0.27, 0.035, 12, TR), leather);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.02;

  const buckle = mesh(
    new THREE.BoxGeometry(0.1, 0.08, 0.04),
    registerAccent(
      new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.55,
      })
    )
  );
  buckle.position.set(0, 0.02, 0.26);

  const scrollCase = mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.22, CY), leather);
  scrollCase.rotation.z = Math.PI / 2;
  scrollCase.position.set(0.22, -0.02, -0.08);
  const scrollCap = mesh(new THREE.SphereGeometry(0.05, SP, SP), accentTrim);
  scrollCap.position.set(0.33, -0.02, -0.08);

  hips.add(belt, buckle, scrollCase, scrollCap);

  const torso = new THREE.Group();
  torso.position.y = 1.2;

  const chest = mesh(new THREE.CapsuleGeometry(0.22, 0.48, 10, CY), fabric);
  chest.position.y = 0.02;

  const abdomen = mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.18, CY), fabricMid);
  abdomen.position.y = -0.28;

  const collar = mesh(new THREE.TorusGeometry(0.17, 0.025, 10, TR), fabricLight);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.28;

  const pauldronL = mesh(new THREE.SphereGeometry(0.11, SP, SP), fabricLight);
  pauldronL.scale.set(1.2, 0.75, 1);
  pauldronL.position.set(-0.3, 0.2, 0);
  const pauldronR = pauldronL.clone();
  pauldronR.position.x = 0.3;

  const coatPanelL = mesh(new THREE.BoxGeometry(0.22, 0.62, 0.04), fabric);
  coatPanelL.position.set(-0.12, -0.12, 0.2);
  coatPanelL.rotation.y = 0.08;
  const coatPanelR = coatPanelL.clone();
  coatPanelR.position.x = 0.12;
  coatPanelR.rotation.y = -0.08;

  for (let i = 0; i < 4; i++) {
    const btn = mesh(new THREE.SphereGeometry(0.018, 12, 12), accentTrim);
    btn.position.set(0, 0.12 - i * 0.14, 0.235);
    torso.add(btn);
  }

  const gemCore = mesh(
    new THREE.IcosahedronGeometry(0.055, 1),
    registerAccent(
      new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 1.1,
        roughness: 0.08,
        metalness: 0.55,
      })
    )
  );
  gemCore.position.set(0, 0.06, 0.24);

  const gemShell = mesh(
    new THREE.OctahedronGeometry(0.1, 2),
    registerAccent(
      new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.35,
        roughness: 0.05,
        metalness: 0.2,
      })
    )
  );
  gemShell.position.copy(gemCore.position);

  const gemAura = mesh(
    new THREE.SphereGeometry(0.16, SP, SP),
    registerAccent(
      new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      })
    )
  );
  gemAura.position.copy(gemCore.position);

  const gemRing = mesh(
    new THREE.TorusGeometry(0.12, 0.008, 8, TR),
    registerAccent(
      new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.85,
      })
    )
  );
  gemRing.position.copy(gemCore.position);
  gemRing.rotation.x = Math.PI / 2;

  function makeHand(sign) {
    const hand = new THREE.Group();
    const palm = mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), skinShadow);
    for (let f = 0; f < 4; f++) {
      const finger = mesh(new THREE.CapsuleGeometry(0.012, 0.05, 4, 12), skin);
      finger.position.set(-0.022 + f * 0.015, -0.06, 0);
      hand.add(finger);
    }
    const thumb = mesh(new THREE.CapsuleGeometry(0.013, 0.035, 4, 12), skin);
    thumb.position.set(sign * 0.038, -0.03, 0.02);
    thumb.rotation.z = sign * 0.6;
    hand.add(palm, thumb);
    return hand;
  }

  function makeArm(x, sign) {
    const arm = new THREE.Group();
    arm.position.set(x, 0.14, 0);
    arm.rotation.z = sign * 0.14;

    const upper = mesh(new THREE.CapsuleGeometry(0.052, 0.28, 6, CY), fabricMid);
    upper.position.y = -0.14;

    const elbow = mesh(new THREE.SphereGeometry(0.048, SP, SP), fabricLight);
    elbow.position.y = -0.3;

    const fore = mesh(new THREE.CapsuleGeometry(0.044, 0.26, 6, CY), fabric);
    fore.position.y = -0.48;

    const cuff = mesh(new THREE.TorusGeometry(0.042, 0.012, 8, TR), accentTrim);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = -0.62;

    const hand = makeHand(sign);
    hand.position.y = -0.68;
    arm.add(upper, elbow, fore, cuff, hand);
    return arm;
  }

  const armL = makeArm(-0.36, -1);
  const armR = makeArm(0.36, 1);

  const head = new THREE.Group();
  head.position.y = 0.5;

  const neck = mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, CY), skinShadow);
  neck.position.y = -0.06;

  const face = mesh(new THREE.SphereGeometry(0.155, SP, SP), skin);
  const jaw = mesh(new THREE.SphereGeometry(0.12, SP, SP, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), skinShadow);
  jaw.position.y = -0.04;
  jaw.scale.set(1, 0.75, 0.9);

  const nose = mesh(new THREE.ConeGeometry(0.025, 0.05, 12), skinShadow);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, -0.01, 0.14);

  function makeEye(x) {
    const eye = new THREE.Group();
    eye.position.set(x, 0.02, 0.12);
    const white = mesh(new THREE.SphereGeometry(0.028, 16, 16), eyeWhite);
    const iris = mesh(new THREE.SphereGeometry(0.014, 12, 12), eyeDark);
    iris.position.z = 0.018;
    const pupil = mesh(
      new THREE.SphereGeometry(0.007, 10, 10),
      registerAccent(
        new THREE.MeshStandardMaterial({
          color: accentColor,
          emissive: accentColor,
          emissiveIntensity: 0.8,
        })
      )
    );
    pupil.position.z = 0.024;
    eye.add(white, iris, pupil);
    return eye;
  }

  const hoodBase = mesh(
    new THREE.SphereGeometry(0.21, SP, SP, 0, Math.PI * 2, 0, Math.PI * 0.68),
    fabric
  );
  hoodBase.position.y = 0.04;

  const hoodPeak = mesh(new THREE.ConeGeometry(0.16, 0.28, CY), fabricMid);
  hoodPeak.rotation.x = -0.35;
  hoodPeak.position.set(0, 0.18, -0.06);

  for (let i = 0; i < 6; i++) {
    const strand = mesh(new THREE.CylinderGeometry(0.008, 0.004, 0.14, 8), fabricLight);
    strand.position.set(-0.06 + i * 0.024, 0.02, 0.1);
    strand.rotation.x = 0.4 + i * 0.05;
    head.add(strand);
  }

  const halo = mesh(
    new THREE.TorusGeometry(0.29, 0.022, 12, TR),
    registerAccent(
      new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.75,
        transparent: true,
        opacity: 0.85,
      })
    )
  );
  halo.rotation.x = Math.PI / 2.35;
  halo.position.set(0, 0.1, -0.08);

  const haloInner = mesh(
    new THREE.TorusGeometry(0.24, 0.008, 8, TR),
    registerAccent(
      new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 1,
        transparent: true,
        opacity: 0.5,
      })
    )
  );
  haloInner.rotation.copy(halo.rotation);
  haloInner.position.copy(halo.position);

  const cape = mesh(new THREE.PlaneGeometry(0.95, 1.25, 16, 12), fabric);
  cape.position.set(0, -0.1, -0.26);
  cape.rotation.x = 0.24;

  const capeInner = mesh(new THREE.PlaneGeometry(0.82, 1.1, 12, 8), fabricMid);
  capeInner.position.set(0, -0.08, -0.22);
  capeInner.rotation.x = 0.18;

  const coatTailL = mesh(new THREE.BoxGeometry(0.2, 0.62, 0.05), fabric);
  coatTailL.position.set(-0.17, -0.44, -0.1);
  coatTailL.rotation.x = 0.38;
  const coatTailR = coatTailL.clone();
  coatTailR.position.x = 0.17;

  head.add(neck, face, jaw, nose, makeEye(-0.055), makeEye(0.055), hoodBase, hoodPeak, halo, haloInner);
  torso.add(
    chest,
    abdomen,
    collar,
    pauldronL,
    pauldronR,
    coatPanelL,
    coatPanelR,
    gemAura,
    gemShell,
    gemCore,
    gemRing,
    head,
    cape,
    capeInner,
    coatTailL,
    coatTailR,
    armL,
    armR
  );
  hips.add(legL, legR);

  const groundRing = mesh(
    new THREE.TorusGeometry(0.46, 0.028, 12, TR),
    registerAccent(
      new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.7,
      })
    )
  );
  groundRing.rotation.x = Math.PI / 2;
  groundRing.position.y = 0.02;

  const groundRingOuter = mesh(
    new THREE.TorusGeometry(0.54, 0.01, 8, TR),
    registerAccent(
      new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.35,
      })
    )
  );
  groundRingOuter.rotation.x = Math.PI / 2;
  groundRingOuter.position.y = 0.015;

  const glow = new THREE.PointLight(accentColor, 0.55, 6);
  glow.position.set(0, 1.4, 0.18);

  root.add(groundRing, groundRingOuter, hips, torso, glow);

  return {
    group: root,
    accentMats,
    glow,
    walkParts: {
      legL,
      legR,
      armL,
      armR,
      cape,
      capeInner,
      coatPanelL,
      coatPanelR,
      coatTailL,
      coatTailR,
      torso,
      gem: gemCore,
      gemAura,
      gemShell,
      gemRing,
      halo,
      hoodPeak,
    },
  };
}
