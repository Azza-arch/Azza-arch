// DENAI mission variants (data-driven, validated) for the Level 1-1 bridge.
//
// The bridge is a real 7-plank crossing, so EVERY variant's correct answer
// makes the machine output exactly 7 planks; only the rule and the kind of
// reasoning change. Inputs the player can choose are 0..4 (the panel's
// buttons); "find-rule" variants offer three machines instead.
//
// Reasoning types (Tingkatan 4 · Fungsi):
//   find-input  — rule shown, target output 7: which input x?   (inverse thinking)
//   find-rule   — input fixed, three machines: which one outputs 7? (evaluate f(k))
//   pattern     — rule hidden, three observed input→output pairs:
//                 which input gives 7? (interpret the relationship)
export const BRIDGE_PLANKS = 7;
export const INPUTS = [0, 1, 2, 3, 4];
const lin = (a, b) => ({ a, b });
export const evalRule = (r, x) => r.a * x + r.b;
export function ruleText(r) {
  const ax = r.a === 1 ? 'x' : `${r.a}x`;
  return r.b === 0 ? ax : r.b > 0 ? `${ax} + ${r.b}` : `${ax} − ${-r.b}`;
}
// id 'A' is the original V14 question: legacy saves keep it.
export const MISSION_BANK = [
  { id: 'A', type: 'find-input', rule: lin(2, 1) },
  { id: 'B', type: 'find-input', rule: lin(1, 4) },
  { id: 'C', type: 'find-input', rule: lin(3, 1) },
  { id: 'D', type: 'find-input', rule: lin(2, 3) },
  { id: 'E', type: 'find-input', rule: lin(3, -2) },
  { id: 'F', type: 'find-input', rule: lin(1, 5) },
  { id: 'P1', type: 'pattern', rule: lin(2, 1), clues: [0, 1, 2] },
  { id: 'P2', type: 'pattern', rule: lin(3, 1), clues: [0, 1, 3] },
  { id: 'P3', type: 'pattern', rule: lin(1, 4), clues: [1, 2, 4] },
  { id: 'R1', type: 'find-rule', input: 2, options: [lin(2, 1), lin(3, 1), lin(1, 4)] },
  { id: 'R2', type: 'find-rule', input: 3, options: [lin(1, 4), lin(3, -1), lin(2, -1)] },
  { id: 'R3', type: 'find-rule', input: 1, options: [lin(5, 1), lin(4, 3), lin(2, 3)] },
];
export const TYPE_LABEL = { 'find-input': 'Cari input', 'find-rule': 'Pilih mesin', pattern: 'Baca corak' };

// ---- answers & validation ---------------------------------------------------
export function answerOf(v) {
  if (v.type === 'find-rule') return v.options.findIndex(o => evalRule(o, v.input) === BRIDGE_PLANKS);
  return INPUTS.find(x => evalRule(v.rule, x) === BRIDGE_PLANKS);
}
// Output (planks) produced by a player's choice (input value, or option index).
export function outputFor(v, choice) {
  if (v.type === 'find-rule') { const o = v.options[choice]; return o ? evalRule(o, v.input) : null; }
  return INPUTS.includes(choice) ? evalRule(v.rule, choice) : null;
}
export function choicesOf(v) { return v.type === 'find-rule' ? v.options.map((_, i) => i) : INPUTS; }
// A variant is valid only if exactly ONE choice yields exactly 7 planks, all
// numbers are integers, and (pattern) the clues are distinct, consistent and
// do not already contain the answer.
export function validateVariant(v) {
  const errors = [];
  const outs = choicesOf(v).map(c => outputFor(v, c));
  if (outs.some(o => !Number.isInteger(o))) errors.push('non-integer output');
  const hits = outs.filter(o => o === BRIDGE_PLANKS).length;
  if (hits !== 1) errors.push(`expected exactly 1 correct choice, got ${hits}`);
  if (v.type === 'pattern') {
    const ans = answerOf(v);
    if (new Set(v.clues).size !== v.clues.length || v.clues.length < 3) errors.push('need 3 distinct clues');
    if (v.clues.includes(ans)) errors.push('clues reveal the answer');
    if (v.clues.some(c => !INPUTS.includes(c))) errors.push('clue outside inputs');
  }
  if (v.type === 'find-rule' && !INPUTS.includes(v.input)) errors.push('fixed input outside 0..4');
  return { ok: errors.length === 0, errors };
}

// ---- deterministic selection -------------------------------------------------
// mulberry32: tiny, well-known 32-bit PRNG; same seed → same sequence.
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Picks a variant for a NEW run. `recent` = ids used by the last runs; they are
// avoided while enough alternatives remain (no guarantee of uniqueness forever).
export function selectVariant(seed, recent = []) {
  const valid = MISSION_BANK.filter(v => validateVariant(v).ok);
  const fresh = valid.filter(v => !recent.includes(v.id));
  const pool = fresh.length ? fresh : valid;
  return pool[Math.floor(rng(seed)() * pool.length)];
}
export const variantById = id => MISSION_BANK.find(v => v.id === id) || MISSION_BANK[0];

// ---- player-facing text (Malay) ------------------------------------------------
export function describe(v) {
  const ans = answerOf(v);
  if (v.type === 'find-input') {
    const r = ruleText(v.rule);
    return {
      typeLabel: TYPE_LABEL[v.type], screen: `f(x) = ${r}`, screenSub: 'x = ?  →  7',
      rule: `Mesin ini mengeluarkan f(x) = ${r} papan untuk input x. Jurang ini memerlukan tepat 7 papan.`,
      core: r, inLabel: 'input x', question: 'Input x yang mana akan menghasilkan output 7?',
      hint: `Fikir terbalik: mulakan dengan 7 dan buat langkah songsang bagi ${r}.`,
      worked: workedInverse(v.rule), solvedScreen: `f(${ans}) = 7  ✓`, summary: `f(x) = ${r}, x = ${ans}`,
    };
  }
  if (v.type === 'pattern') {
    return {
      typeLabel: TYPE_LABEL[v.type], screen: 'f(x) = ?', screenSub: 'x = ?  →  7',
      rule: 'Peraturan mesin ini tersembunyi. Kaji input dan output yang telah direkodkan. Jurang memerlukan tepat 7 papan.',
      core: '?', inLabel: 'input x', clues: v.clues.map(x => [x, evalRule(v.rule, x)]),
      question: 'Berdasarkan corak, input x yang mana menghasilkan 7?',
      hint: 'Lihat berapa banyak output berubah apabila input bertambah 1.',
      worked: `Corak: setiap kali x bertambah 1, output bertambah ${v.rule.a}.\nPeraturan: f(x) = ${ruleText(v.rule)}\nf(${ans}) = ${v.rule.a}(${ans}) ${v.rule.b >= 0 ? '+' : '−'} ${Math.abs(v.rule.b)} = 7 ✓`,
      solvedScreen: `f(x) = ${ruleText(v.rule)}  ✓`, summary: `corak f(x) = ${ruleText(v.rule)}, x = ${ans}`,
    };
  }
  // find-rule
  const k = v.input, labels = v.options.map(ruleText);
  return {
    typeLabel: TYPE_LABEL[v.type], screen: `x = ${k}  →  ?`, screenSub: 'perlu 7 papan',
    rule: `Tuas input tersekat pada x = ${k}. Pilih mesin yang mengeluarkan tepat 7 papan.`,
    core: '?', inLabel: 'input x', fixedInput: k, optionLabels: labels,
    question: `Mesin manakah memberi f(${k}) = 7?`,
    hint: `Gantikan x = ${k} ke dalam setiap peraturan dan bandingkan hasilnya.`,
    worked: labels.map((l, i) => `${l}: ${evalRule(v.options[i], k)}${i === ans ? '  ✓' : ''}`).join('\n'),
    solvedScreen: `f(${k}) = 7  ✓`, summary: `f(x) = ${labels[ans]} pada x = ${k}`,
  };
}
function workedInverse(r) {
  const lines = [`${ruleText(r)} = 7`];
  let rhs = 7;
  if (r.b !== 0) { rhs = 7 - r.b; lines.push(`${r.a === 1 ? 'x' : r.a + 'x'} = ${rhs}      (${r.b > 0 ? 'tolak ' + r.b : 'tambah ' + (-r.b)} pada kedua-dua belah)`); }
  if (r.a !== 1) { lines.push(`x = ${rhs / r.a}      (bahagi ${r.a})`); }
  const x = (7 - r.b) / r.a; lines.push(`Semakan: f(${x}) = ${evalRule(r, x)} ✓`);
  return lines.join('\n');
}
// Feedback for a wrong choice, from the actual machine output.
export function wrongFeedback(v, choice) {
  const out = outputFor(v, choice);
  const calc = v.type === 'find-rule' ? `${ruleText(v.options[choice])} pada x = ${v.input} memberi ${out}` : (v.type === 'pattern' ? `Input ${choice} memberi ${out}` : `f(${choice}) = ${ruleText(v.rule).replace(/x/g, `(${choice})`)} = ${out}`);
  const why = out <= 0 ? `Mesin tidak boleh mengeluarkan ${out} papan, jadi ia tersekat.` : out < BRIDGE_PLANKS ? `Hanya ${out} papan — jambatan terlalu pendek.` : `Sebanyak ${out} papan — terlalu panjang untuk jurang ini.`;
  return `${calc}. ${why} Cuba lagi — tiada penalti.`;
}
