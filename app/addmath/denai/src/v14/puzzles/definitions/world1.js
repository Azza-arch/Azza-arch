// DENAI · World 1 (Hutan & Sungai · T4 Bab 1 Fungsi) puzzle definitions.
// Data only: the scene reads parameters, hints and feedback from here; the
// models in ../models compute every answer. `answer` is stored as data and
// re-checked against the model by validators/validate.js and the tests.
// IDs are stable — never rename or reuse one (saves may refer to `legacyId`).
import { makeRule, ruleText } from '../rules.js';
import { inverseSteps } from '../models/inverse.js';

const CHAPTER = 't4-1';

// ── Level 1-1 · Stor Kayu: linear cost C(x) = px + d ────────────────────────
// Base need/stock of the bridge; three price lists (legacy variant ids K1–K3).
const SUPPLY = { need: 5, stock: 8 };
export function supplyDefinition(id, legacyId, { price, delivery, budget, need = SUPPLY.need, stock = SUPPLY.stock }, answer, extra = {}) {
  return {
    id, legacyId, chapter: CHAPTER, subtopic: '1.1', sp: ['1.1.3'], difficulty: 'mudah',
    learningObjective: 'Menggunakan fungsi C(x) = px + d untuk menentukan kos mengikut bilangan papan dan memilih pembelian dalam bajet.',
    mechanic: 'supply-store',
    parameters: { price, delivery, budget, need, stock },
    check: { kind: 'linear-cost' },
    answer,
    hints: [`Jambatan perlukan ${need} papan.`, 'Kos = harga setiap papan × bilangan + hantaran (sekali).', `Kira dahulu: C(${need}) = ? Bandingkan dengan bajet.`],
    explanation: [`C(x) = ${ruleText(makeRule(price, delivery))}`, `C(${need}) = ${price}(${need}) + ${delivery} = ${price * need + delivery}`, `${price * need + delivery} ≤ ${budget}: cukup papan dalam bajet.`],
    wrongFeedback: { short: '{x} papan tak cukup: jambatan perlukan {need}.', budget: 'RM{cost} melebihi bajet RM{budget}.', range: 'Pilih bilangan papan.' },
    status: 'live', ...extra,
  };
}

// ── Level 1-2 · Bengkel Kayu: composite gf vs fg ────────────────────────────
export function workshopDefinition(id, { input, need, start = 'BA', f, g }, answer, extra = {}) {
  return {
    id, chapter: CHAPTER, subtopic: '1.2', sp: ['1.2.1', '1.2.2'], difficulty: 'sederhana',
    learningObjective: 'Memahami bahawa susunan fungsi dalam gubahan mengubah hasil: gf(x) = g(f(x)) tidak sama dengan fg(x) = f(g(x)).',
    mechanic: 'machine-order',
    parameters: { input, need, start, machines: {
      A: { name: 'Mesin Gandaan', short: 'Gandaan', letter: 'f', rule: f, min: 1 },
      B: { name: 'Mesin Kawalan Kualiti', short: 'Kawalan kualiti', letter: 'g', rule: g, min: Math.max(0, -g.b) },
    } },
    check: { kind: 'composite-order' },
    answer,
    hints: [`Hasil ${answer.outputs[start]} tak cukup. Apa yang berubah jika mesin lain bermula dahulu?`, 'Tuas berada di dek atas, berhampiran tangga.', `Cuba gandakan dahulu, kemudian buang ${-g.b}: g(f(${input})).`],
    explanation: [`gf(${input}) = g(f(${input})) = ${answer.outputs.AB}`, `fg(${input}) = f(g(${input})) = ${answer.outputs.BA}`, 'Mesin yang bekerja dahulu ditulis di sebelah kanan.'],
    wrongFeedback: { low: 'Hasil {out} — belum cukup {need}.' },
    status: 'live', ...extra,
  };
}

// ── Level 1-3 · Pintu Air: inverse f⁻¹(y) ──────────────────────────────────
export function sluiceDefinition(id, { rule, domain = [0, 6], target }, answer, extra = {}) {
  const p = { rule, domain, target };
  return {
    id, chapter: CHAPTER, subtopic: '1.3', sp: ['1.3.1', '1.3.2'], difficulty: 'sederhana',
    learningObjective: 'Menggunakan fungsi songsang untuk mencari input asal daripada output yang diketahui.',
    mechanic: 'valve-meter',
    parameters: p,
    check: { kind: 'inverse-linear' },
    answer,
    hints: [`Meter pada paip menunjukkan tanda asal ${target}. Pintu air terbuka hanya jika bacaan tepat ${target}.`, `Baca catatan penyelenggaraan: bacaan = ${rule.a} × tetapan + ${rule.b}. Tetapan berapa memberi ${target}?`, `Undur langkah mesin: ${inverseSteps(p, target)}. Pusing injap ke ${answer.setting}, kemudian tarik tuas aliran.`],
    explanation: [`f(x) = ${ruleText(rule)}`, `f(${answer.setting}) = ${target} ✓`, `f⁻¹(${target}) = (${target} ${rule.b >= 0 ? '−' : '+'} ${Math.abs(rule.b)}) ÷ ${rule.a} = ${answer.setting}`],
    wrongFeedback: { low: 'Aliran masih rendah.', high: 'Tekanan terlalu tinggi!' },
    status: 'live', ...extra,
  };
}

const F2 = makeRule(2, 0), G2 = makeRule(1, -2), SLUICE = makeRule(2, 3);

export const WORLD1 = Object.freeze([
  supplyDefinition('w1.l1.supply.k1', 'K1', { price: 4, delivery: 6, budget: 30 }, { accepted: [5, 6], best: 5 }),
  supplyDefinition('w1.l1.supply.k2', 'K2', { price: 3, delivery: 9, budget: 25 }, { accepted: [5], best: 5 }),
  supplyDefinition('w1.l1.supply.k3', 'K3', { price: 5, delivery: 5, budget: 32 }, { accepted: [5], best: 5 }),
  workshopDefinition('w1.l2.workshop.main', { input: 5, need: 8, start: 'BA', f: F2, g: G2 }, { working: ['AB'], outputs: { AB: 8, BA: 6 } }),
  sluiceDefinition('w1.l3.sluice.main', { rule: SLUICE, target: 13 }, { setting: 5 }),
  // Optional cave valve: same machine, broken meter, plate says "bacaan 15".
  sluiceDefinition('w1.l3.cave.main', { rule: SLUICE, target: 15 }, { setting: 6 }, { mechanic: 'pressure-plates', difficulty: 'cabaran', status: 'optional',
    hints: ['Meter gua rosak, tetapi plat menyatakan bacaan 15.', 'Mesin yang sama: bacaan = 2 × tetapan + 3.', 'Undur langkah: 15 − 3 = 12, 12 ÷ 2 = 6. Berdiri pada plat 6.'] }),
]);
