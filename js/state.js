export function createInitialState() {
  return {
    refusal: null,
    period: 0,
    location: "コモン・ガーデン",
    witnessTier: "客人",
    trust: { aster: 0, sen: 0, soli: 0, children: 0 },
    vows: [],
    missed: [],
    presenceLog: [],
    covenant: {
      exitImmediate: null,
      consentYears: null,
      memoryEdit: null,
      expiryYears: null,
    },
    reasonsUsed: [],
    deliberationOutcome: null,
    ending: null,
    flags: {},
  };
}

export const REFUSALS = [
  { id: "immortality", label: "永遠の生命", hint: "終わりのない時間を拒んだ" },
  { id: "family", label: "家族", hint: "血縁による義務を拒んだ" },
  { id: "fame", label: "名声", hint: "記録に残ることを拒んだ" },
  { id: "memory", label: "記憶の編集", hint: "忘れ去る権利を拒んだ" },
  { id: "collective", label: "集団意識", hint: "境界の溶解を拒んだ" },
  { id: "art", label: "芸術家としての成功", hint: "完成という名の固定を拒んだ" },
];

export const ENDINGS = {
  open: {
    title: "《開かれた地平》",
    gain: "最大限の未来可能性",
    loss: "強い共通物語と方向性",
  },
  islands: {
    title: "《庭園の群島》",
    gain: "価値の複数性",
    loss: "人類全体としての一体感",
  },
  work: {
    title: "《選ばれた大仕事》",
    gain: "連帯、世代を超えた達成",
    loss: "参加しない人生の周縁化",
  },
  mosaic: {
    title: "《命令しない神》",
    gain: "共通の問いと文明的自己理解",
    loss: "自発的服従の誘惑",
  },
  enough: {
    title: "《ここで十分である》",
    gain: "現在の生への肯定",
    loss: "二度と戻らない可能性",
  },
  finite: {
    title: "《有限なる旅》",
    gain: "自由に引き受けた一回性",
    loss: "回復不能な喪失",
  },
};

export function getWitnessTier(state) {
  const total =
    state.trust.aster + state.trust.sen + state.trust.soli + state.trust.children;
  if (total >= 8) return "証言者";
  if (total >= 5) return "預かり者";
  if (total >= 2) return "参加者";
  return "客人";
}

export function addVow(state, vow) {
  state.vows.push({ ...vow, status: "active" });
}

export function addMissed(state, label) {
  state.missed.push(label);
}

export function bumpTrust(state, npc, amount = 1) {
  if (state.trust[npc] !== undefined) {
    state.trust[npc] += amount;
    state.witnessTier = getWitnessTier(state);
  }
}
