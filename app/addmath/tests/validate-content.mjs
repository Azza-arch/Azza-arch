// Content validator for the Add Math question bank.
//   node app/addmath/tests/validate-content.mjs [report.md]
// Exit code 1 if any ERROR is found. Passing this does NOT prove the
// mathematics is right: items marked 'manual', and every pedagogical claim,
// still need human review — the report lists them.
import { writeFileSync } from 'node:fs';
import { STATUSES, STATUS } from '../src/content/status.js';
import { CURRICULUM, learningStandardExists } from '../src/content/curriculum.js';
import { BAB1_QUESTIONS, BAB1_GENERATORS } from '../src/content/questions/bab1.js';
import { evaluate, domainOfMapping, isFunctionMapping, parseSet, mulberry32 } from './solvers.mjs';

const errors = [], warnings = [], manual = [], rows = [];
const err = (id, m) => errors.push(`${id}: ${m}`);
const warn = (id, m) => warnings.push(`${id}: ${m}`);
const strip = (h) => String(h).replace(/<[^>]+>/g, '').replace(/&minus;/g, '−').replace(/&rarr;/g, '→').replace(/&times;/g, '×').replace(/&mdash;/g, '—').replace(/&[a-z]+;/g, ' ');
const sameNum = (a, b) => Math.abs(a - b) < 1e-9;

function checkQuestion(q, label = q.id) {
  const checks = [];
  // ---- structure
  for (const f of ['id', 'chapter', 'sk', 'sp', 'difficulty', 'type', 'checker', 'prompt', 'options', 'solution', 'status', 'provenance', 'review'])
    if (q[f] === undefined || q[f] === null || q[f] === '') err(label, `missing field "${f}"`);
  if (!STATUSES.includes(q.status)) err(label, `invalid status "${q.status}"`);
  if (!['mudah', 'sederhana', 'mencabar'].includes(q.difficulty)) err(label, `invalid difficulty "${q.difficulty}"`);
  for (const code of q.sp || []) if (!learningStandardExists(q.chapter, code)) err(label, `SP ${code} is not in the DSKP for ${q.chapter}`);
  if (!(q.sp || []).every((c) => c.startsWith(q.sk + '.'))) err(label, `SP codes ${q.sp} do not belong to SK ${q.sk}`);
  if (!Array.isArray(q.solution) || q.solution.length < 1) err(label, 'no worked solution');
  // ---- options
  const opts = q.options || [];
  const correct = opts.filter((o) => o.correct);
  if (correct.length !== 1) err(label, `expected exactly 1 correct option, found ${correct.length}`);
  const texts = opts.map((o) => strip(o.text).trim());
  if (new Set(texts).size !== texts.length) err(label, `duplicate option text: ${texts}`);
  opts.forEach((o, k) => {
    if (!o.feedback) err(label, `option ${k + 1} has no feedback`);
    if (!o.correct && !o.misconception) warn(label, `option ${k + 1} has no misconception tag`);
    if (o.correct && !/^Betul/.test(strip(o.feedback))) warn(label, 'correct option feedback does not start with "Betul"');
    if (!o.correct && /^Betul/.test(strip(o.feedback))) err(label, `wrong option ${k + 1} has feedback starting "Betul"`);
  });
  // ---- distractor derivations: the stated mistake must really give that value
  opts.filter((o) => o.derive).forEach((o) => {
    const v = evaluate(o.derive);
    if (!sameNum(v, Number(strip(o.text)))) err(label, `distractor "${strip(o.text)}" claims ${o.derive} but that equals ${v}`);
    else checks.push(`distractor ${strip(o.text)} = ${o.derive} ✓`);
  });
  // ---- independent solve
  const right = correct[0];
  switch (q.checker) {
    case 'evaluate': {
      const want = evaluate(q.given.rule, { x: q.given.x });
      if (!right || !sameNum(want, Number(strip(right.text)))) err(label, `independent solve gives ${want}, stored answer is "${right && strip(right.text)}"`);
      else checks.push(`f(${q.given.x}) for ${q.given.rule} = ${want} ✓`);
      opts.filter((o) => !o.correct).forEach((o) => { if (sameNum(Number(strip(o.text)), want)) err(label, `wrong option equals the answer ${want}`); });
      break;
    }
    case 'domain-of-mapping': {
      const want = domainOfMapping(q.given.mapping);
      opts.forEach((o) => {
        const s = parseSet(strip(o.text));
        const ok = s && JSON.stringify(s) === JSON.stringify(want);
        if (ok !== !!o.correct) err(label, `option "${strip(o.text)}" marked ${o.correct ? 'correct' : 'wrong'} but domain is {${want}}`);
      });
      checks.push(`domain = {${want}} ✓`);
      break;
    }
    case 'is-function-mapping': {
      opts.forEach((o) => {
        if (!o.data) { err(label, `option "${strip(o.text)}" has no mapping data`); return; }
        const isF = isFunctionMapping(o.data);
        if (isF !== !!o.correct) err(label, `option "${strip(o.text)}" marked ${o.correct ? 'correct' : 'wrong'} but isFunction = ${isF}`);
      });
      checks.push('each option re-classified from its mapping data ✓');
      break;
    }
    case 'manual':
      manual.push(`${label} — ${strip(q.prompt)} (jawapan: ${right && strip(right.text)})`);
      checks.push('needs human review (conceptual item)');
      break;
    default: err(label, `unknown checker "${q.checker}"`);
  }
  // ---- publication rules
  if (q.status === STATUS.PUBLISHED && !q.review?.ownerApproved)
    warn(label, q.provenance?.origin === 'legacy' ? 'published (legacy, already live) without owner approval recorded' : 'published without owner approval');
  return checks;
}

export { checkQuestion, errors };
const MAIN = import.meta.url === `file://${process.argv[1]}`;
if (MAIN) {
// static questions
for (const q of BAB1_QUESTIONS) rows.push([q.id, q.status, q.checker, checkQuestion(q).join('; ')]);
// ids unique
const ids = BAB1_QUESTIONS.map((q) => q.id);
if (new Set(ids).size !== ids.length) err('bank', 'duplicate question ids');

// parameterised templates: many seeds, every instance must pass the same checks
const SEEDS = 1000;
for (const g of BAB1_GENERATORS) {
  let failed = 0; const before = errors.length;
  for (let s = 1; s <= SEEDS; s++) {
    const inst = { ...g, ...g.generate(mulberry32(s)) };
    delete inst.generate;
    checkQuestion(inst, `${g.id}#seed${s}`);
    if (errors.length > before + failed) failed = errors.length - before;
  }
  rows.push([g.id, g.status, g.checker, `${SEEDS} seeds, ${errors.length - before} errors`]);
}

// curriculum sanity
const nSK = CURRICULUM.reduce((n, c) => n + c.contentStandards.length, 0);
const nSP = CURRICULUM.reduce((n, c) => n + c.contentStandards.reduce((m, s) => m + s.learningStandards.length, 0), 0);
if (CURRICULUM.length !== 18) err('curriculum', `expected 18 chapters, found ${CURRICULUM.length}`);

const report = [
  '# Laporan pengesahan kandungan Add Math', '',
  `Kurikulum: ${CURRICULUM.length} bab, ${nSK} standard kandungan, ${nSP} standard pembelajaran.`, '',
  `**Ralat: ${errors.length} · Amaran: ${warnings.length} · Perlu semakan manusia: ${manual.length}**`, '',
  '| ID | Status | Penyemak | Hasil |', '|---|---|---|---|',
  ...rows.map((r) => `| ${r.join(' | ')} |`), '',
  '## Ralat', ...(errors.length ? errors.slice(0, 50).map((e) => `- ${e}`) : ['- tiada']), '',
  '## Amaran', ...(warnings.length ? warnings.map((w) => `- ${w}`) : ['- tiada']), '',
  '## Perlu semakan manusia (tiada penyelesai automatik)', ...(manual.length ? manual.map((m) => `- ${m}`) : ['- tiada']), '',
  '> Lulus pengesahan ini tidak membuktikan kebenaran matematik sepenuhnya. Ia menyemak struktur, jawapan yang boleh dikira semula, nilai pilihan salah yang dinyatakan, dan parameter. Kejelasan penerangan dan kesesuaian pedagogi mesti disemak oleh manusia.',
].join('\n');
if (process.argv[2]) writeFileSync(process.argv[2], report);
console.log(report);
process.exit(errors.length ? 1 : 0);
}
