// Notes validator: structure, curriculum coverage, KaTeX, and independent
// re-solving of every auto-checkable question in every chapter notes file.
//   node app/addmath/tests/validate-notes.mjs [report.md]
// Passing does NOT prove the mathematics or the teaching is right: 'manual'
// items and all explanations still need human review (listed in the report).
import { writeFileSync } from 'node:fs';
import katex from '../vendor/katex/katex.mjs';
import { CURRICULUM, chapterById } from '../src/content/curriculum.js';
import { STATUSES } from '../src/content/status.js';
import { NOTE_MODULES, NOTE_STATUS } from '../src/content/notes/index.js';
import { evaluate, f1, roots, sameFunction, extremaOnInterval, isFunctionMapping, parseSet } from './solvers.mjs';

const errors = [], warnings = [], manual = [], chapterRows = [];
const err = (id, m) => errors.push(`${id}: ${m}`), warn = (id, m) => warnings.push(`${id}: ${m}`);
const near = (a, b) => Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(b));
const strip = (h) => String(h).replace(/<[^>]+>/g, '').trim();
const LEVELS = ['mudah', 'sederhana', 'mencabar'];

// ---- KaTeX: every \( \) and \[ \] must compile in strict mode
function texCheck(id, s) {
  if (typeof s !== 'string') return;
  for (const m of s.matchAll(/\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g)) {
    try { katex.renderToString(m[1] ?? m[2], { throwOnError: true, strict: 'ignore', displayMode: !!m[1] }); }
    catch (e) { err(id, `KaTeX: ${e.message.split('\n')[0]} in "${(m[1] ?? m[2]).slice(0, 60)}"`); }
  }
  const open = (s.match(/\\\(/g) || []).length, close = (s.match(/\\\)/g) || []).length;
  if (open !== close) err(id, `unbalanced \\( \\) delimiters (${open} vs ${close})`);
}
function walkStrings(id, obj) {
  if (typeof obj === 'string') return texCheck(id, obj);
  if (Array.isArray(obj)) return obj.forEach((v) => walkStrings(id, v));
  if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) if (typeof v !== 'function') walkStrings(id, v);
}

// ---- independent answer checks
function expected(check, id) {
  switch (check.kind) {
    case 'evaluate': return evaluate(check.rule, { x: check.x });
    case 'solve': { const r = roots(f1(check.rule), check.target); if (!r.length) { err(id, 'no real root'); return NaN; } if (r.length > 1 && !check.pick) { err(id, `${r.length} roots (${r}) but question expects one; add pick or rephrase`); } return check.pick === 'max' ? Math.max(...r) : check.pick === 'min' ? Math.min(...r) : r[0]; }
    case 'undefined': { const r = []; for (let k = -2000; k <= 2000; k++) { const x = k / 20; try { const v = evaluate(check.expr, { x }); if (!Number.isFinite(v)) r.push(x); } catch { r.push(x); } } if (r.length !== 1) err(id, `expected exactly one undefined point, found ${r}`); return r[0]; }
    case 'range-interval': { const e = extremaOnInterval(f1(check.rule), check.from, check.to); return check.part === 'min' ? e.min : e.max; }
    case 'compose-value': { const f = f1(check.f), g = f1(check.g); return check.order === 'fg' ? f(g(check.x)) : g(f(check.x)); }
    case 'compose-solve': { const f = f1(check.f), g = f1(check.g); const h = check.order === 'fg' ? (x) => f(g(x)) : (x) => g(f(x)); const r = roots(h, check.target); if (r.length !== 1) err(id, `composite has ${r.length} solutions (${r})`); return r[0]; }
    case 'inverse-value': { const r = roots(f1(check.f), check.y, -1000, 1000, 400000); if (r.length !== 1) err(id, `f(x) = ${check.y} has ${r.length} solutions`); return r[0]; }
    case 'fixed-point': { const f = f1(check.f); const r = roots((x) => f(x) - x, 0); if (r.length !== 1) err(id, `f(x) = x has ${r.length} solutions`); return r[0]; }
    case 'substitute': return null; // handled with the answer below
    case 'value': return evaluate(check.expr);
    case 'linear3': { // Cramer's rule on [[a,b,c,d],…] meaning ax + by + cz = d
      const M = check.eqs, det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
      const A = M.map((r) => r.slice(0, 3)), D = det(A); if (Math.abs(D) < 1e-12) { err(id, 'system has no unique solution'); return NaN; }
      const col = { x: 0, y: 1, z: 2 }[check.want]; const Ak = A.map((r, i) => r.map((v, j) => (j === col ? M[i][3] : v))); return det(Ak) / D; }
    case 'sim2': { // one linear + one non-linear equation in x, y
      const lin = (x, y) => evaluate(check.linear, { x, y }), yx = (x) => evaluate(check.yOfX, { x });
      for (const x of [-2.3, 0.7, 3.1]) if (Math.abs(lin(x, yx(x))) > 1e-9) err(id, `yOfX ${check.yOfX} does not satisfy ${check.linear} = 0`);
      const r = roots((x) => evaluate(check.g, { x, y: yx(x) }), 0); if (!r.length) { err(id, 'no real solution'); return NaN; }
      const xs = check.pick === 'max' ? Math.max(...r) : check.pick === 'min' ? Math.min(...r) : (r.length > 1 ? (err(id, `${r.length} solutions, add pick`), r[0]) : r[0]);
      return check.want === 'y' ? yx(xs) : xs; }
    case 'vertex-x': { const f = f1(check.rule); let best = null; for (let k = -200000; k <= 200000; k++) { const x = k / 1000; const v = f(x); if (best === null || (check.type === 'max' ? v > best.v : v < best.v)) best = { x, v }; } return best.x; }
    default: return undefined;
  }
}
function checkNumeric(spec, id) {
  if (!Number.isFinite(spec.answer)) { err(id, 'numeric answer missing'); return; }
  if (spec.check.kind === 'substitute') { const v = evaluate(spec.check.expr, { [spec.check.variable]: spec.answer }); if (!near(v, spec.check.equals)) err(id, `substituting ${spec.answer} gives ${v}, not ${spec.check.equals}`); }
  else { const want = expected(spec.check, id); const tol = spec.tolerance ?? 1e-7; if (want === undefined) err(id, `unknown check ${spec.check.kind}`); else if (Math.abs(spec.answer - want) > tol * Math.max(1, Math.abs(want))) err(id, `independent solve gives ${want}, stored answer ${spec.answer}`); if (spec.tolerance && spec.tolerance > 0.01) warn(id, `tolerance ${spec.tolerance} is loose`); }
  for (const w of spec.wrong || []) { if (near(w.value, spec.answer)) err(id, `wrong-answer feedback for ${w.value} equals the correct answer`); if (!w.feedback) err(id, `wrong value ${w.value} has no feedback`); }
}
function checkExpression(spec, id) {
  const c = spec.check, A = f1(spec.answer);
  let ref;
  switch (c.kind) {
    case 'compose-expr': { const f = f1(c.f), g = f1(c.g); ref = c.order === 'fg' ? (x) => f(g(x)) : (x) => g(f(x)); break; }
    case 'find-inner': { const f = f1(c.f), fg = f1(c.fg); if (!sameFunction((x) => f(A(x)), fg)) err(id, `f(answer(x)) is not fg(x)`); ref = A; break; }
    case 'find-outer': { const g = f1(c.g), fg = f1(c.fg); if (!sameFunction((x) => A(g(x)), fg)) err(id, `answer(g(x)) is not fg(x)`); ref = A; break; }
    case 'iterate': { const f = f1(c.f); ref = (x) => { let v = x; for (let k = 0; k < c.n; k++) v = f(v); return v; }; break; }
    case 'inverse-expr': { const f = f1(c.f); if (!sameFunction((x) => f(A(x)), (x) => x) || !sameFunction((x) => A(f(x)), (x) => x)) err(id, 'answer is not the inverse: f(answer(x)) and answer(f(x)) must both equal x'); ref = A; break; }
    case 'equiv-expr': ref = f1(c.expr); break;
    case 'from-roots': ref = (x) => (c.lead ?? 1) * (x - c.roots[0]) * (x - c.roots[1]); break;
    default: err(id, `unknown expression check ${c.kind}`); return;
  }
  if (!sameFunction(A, ref)) err(id, `answer ${spec.answer} does not match the independent result`);
  for (const w of spec.wrong || []) { if (sameFunction(f1(w.expr), A)) err(id, `wrong expression ${w.expr} is equivalent to the answer`); if (!w.feedback) err(id, `wrong expression ${w.expr} has no feedback`); }
}
function checkMcq(q, id) {
  const correct = q.options.filter((o) => o.correct);
  if (correct.length !== 1) err(id, `exactly one correct option required, found ${correct.length}`);
  const texts = q.options.map((o) => strip(o.text)); if (new Set(texts).size !== texts.length) err(id, 'duplicate options');
  q.options.forEach((o, k) => { if (!o.feedback) err(id, `option ${k + 1} has no feedback`); if (!o.correct && /^Betul/.test(strip(o.feedback))) err(id, `wrong option ${k + 1} says "Betul"`); });
  const c = q.check;
  if (c.kind === 'mapping-function') q.options.forEach((o) => { if (isFunctionMapping(o.data) !== !!o.correct) err(id, `option "${strip(o.text)}" key disagrees with mapping data`); });
  else if (c.kind === 'range-discrete') { const want = [...new Set(c.domain.map((x) => evaluate(c.rule, { x })))].sort((a, b) => a - b); q.options.forEach((o) => { const s = parseSet(strip(o.text).replace(/\\\(|\\\)|\\\{|\\\}|\\dots/g, (m) => (m === '\\{' ? '{' : m === '\\}' ? '}' : m === '\\dots' ? '' : ''))); const isIt = s && JSON.stringify(s) === JSON.stringify(want); if (isIt !== !!o.correct) err(id, `option "${strip(o.text)}" key disagrees with range {${want}}`); }); }
  else if (c.kind === 'one-to-one') q.options.forEach((o) => { const f = f1(o.data.rule); const seen = new Map(); let inj = true; for (let k = -600; k <= 600; k++) { const x = (k / 100) * (c.interval[1] / 6); const v = +f(x).toFixed(9); if (seen.has(v) && Math.abs(seen.get(v) - x) > 1e-9) { inj = false; break; } seen.set(v, x); } if (inj !== !!o.correct) err(id, `option "${strip(o.text)}" key disagrees: one-to-one = ${inj}`); });
  else if (c.kind === 'root-type') { const [a, b, cc] = c.coeffs; const D = b * b - 4 * a * cc; const want = D > 1e-12 ? 'two' : Math.abs(D) <= 1e-12 ? 'equal' : 'none'; q.options.forEach((o) => { if ((o.data.type === want) !== !!o.correct) err(id, `option "${strip(o.text)}" key disagrees: discriminant ${D} → ${want}`); }); }
  else if (c.kind === 'quad-ineq') { const f = f1(c.rule); const holds = (x) => { const v = f(x); return c.op === '<' ? v < 0 : c.op === '<=' ? v <= 1e-12 : c.op === '>' ? v > 0 : v >= -1e-12; };
    q.options.forEach((o) => { const s = o.data; const inSet = (x) => s.kind === 'between' ? (s.closed ? x >= s.a && x <= s.b : x > s.a && x < s.b) : s.kind === 'outside' ? (s.closed ? x <= s.a || x >= s.b : x < s.a || x > s.b) : s.kind === 'all' ? true : s.kind === 'lt' ? (s.closed ? x <= s.a : x < s.a) : s.kind === 'gt' ? (s.closed ? x >= s.a : x > s.a) : false;
      let match = true; for (let k = -4000; k <= 4000; k++) { const x = k / 200 + 0.0013; if (holds(x) !== inSet(x)) { match = false; break; } } for (const x of [s.a, s.b].filter(Number.isFinite)) if (holds(x) !== inSet(x)) match = false;
      if (match !== !!o.correct) err(id, `option "${strip(o.text)}" key disagrees with the solution set of ${c.rule} ${c.op} 0`); }); }
  else if (c.kind === 'manual') manual.push(`${id} (objektif) — ${strip(q.prompt).slice(0, 110)}`);
  else err(id, `unknown mcq check ${c.kind}`);
}
function checkQuestion(q, chapterId) {
  const id = q.id;
  for (const f of ['id', 'chapter', 'subtopic', 'sp', 'difficulty', 'type', 'prompt', 'status', 'provenance', 'review']) if (q[f] === undefined) err(id, `missing ${f}`);
  if (!STATUSES.includes(q.status)) err(id, `bad status ${q.status}`);
  if (!LEVELS.includes(q.difficulty)) err(id, `bad difficulty ${q.difficulty}`);
  const ch = chapterById(chapterId); const allSp = ch.contentStandards.flatMap((s) => s.learningStandards);
  for (const c of q.sp || []) if (!allSp.includes(c)) err(id, `SP ${c} not in DSKP for ${chapterId}`);
  if (q.status === 'published' && !q.review?.ownerApproved) err(id, 'published without owner approval');
  if (q.type === 'mcq') checkMcq(q, id);
  else if (q.type === 'numeric') { checkNumeric(q, id); if (!q.solution?.length) err(id, 'no solution'); }
  else if (q.type === 'expression') { checkExpression(q, id); if (!q.solution?.length) err(id, 'no solution'); }
  else if (q.type === 'reasoning') { manual.push(`${id} (penaakulan) — ${strip(q.prompt).slice(0, 110)}`); if (!q.solution?.length) err(id, 'no model solution'); }
  else if (q.type === 'structured') q.parts.forEach((p, k) => { const pid = `${id}(${'abcdef'[k]})`; if (!p.solution?.length) err(pid, 'no solution'); if (p.type === 'numeric') checkNumeric(p, pid); else if (p.type === 'expression') checkExpression(p, pid); else if (p.type === 'reasoning') manual.push(`${pid} (penaakulan) — ${strip(p.prompt).slice(0, 110)}`); else err(pid, `bad part type ${p.type}`); });
  else err(id, `unknown type ${q.type}`);
  if (q.type === 'mcq' && !q.solution?.length) err(id, 'no solution');
}

// ---- run every chapter notes file
for (const [chapterId, load] of Object.entries(NOTE_MODULES)) {
  const { CHAPTER } = await load();
  const meta = chapterById(chapterId);
  if (!meta) { err(chapterId, 'not in curriculum'); continue; }
  if (CHAPTER.id !== chapterId) err(chapterId, `file declares id ${CHAPTER.id}`);
  if (NOTE_STATUS[chapterId] !== CHAPTER.status) err(chapterId, `NOTE_STATUS (${NOTE_STATUS[chapterId]}) differs from chapter status (${CHAPTER.status})`);
  walkStrings(chapterId, CHAPTER);
  const qs = CHAPTER.questions || [];
  const ids = qs.map((q) => q.id); if (new Set(ids).size !== ids.length) err(chapterId, 'duplicate question ids');
  qs.forEach((q) => checkQuestion(q, chapterId));
  // coverage: every SP of the chapter must be taught, exemplified and practised
  const coverage = [];
  for (const sk of meta.contentStandards) for (const sp of sk.learningStandards) {
    const sub = CHAPTER.subtopics.find((s) => s.sp.includes(sp));
    const concept = sub?.sections.some((s) => s.kind === 'concept' && (s.sp || []).includes(sp));
    const example = sub?.sections.some((s) => s.kind === 'examples' && s.items.some((e) => (e.sp || []).includes(sp)));
    const nq = qs.filter((q) => (q.sp || []).includes(sp)).length;
    coverage.push({ sp, sub: sub?.id || '—', concept: !!concept, example: !!example, nq });
    if (!sub) err(chapterId, `SP ${sp} has no subtopic`);
    else { if (!concept) err(chapterId, `SP ${sp}: no concept section`); if (!example) err(chapterId, `SP ${sp}: no worked example`); if (nq < 1) err(chapterId, `SP ${sp}: no practice question`); else if (nq < 2) warn(chapterId, `SP ${sp}: only ${nq} question`); }
  }
  for (const sub of CHAPTER.subtopics) {
    const sq = qs.filter((q) => q.subtopic === sub.id);
    for (const lv of LEVELS) if (!sq.some((q) => q.difficulty === lv)) err(`${chapterId} ${sub.id}`, `no ${lv} question`);
    const types = new Set(sq.map((q) => q.type)); if (types.size < 3) warn(`${chapterId} ${sub.id}`, `only ${types.size} question types`);
    const kinds = new Set(sub.sections.map((s) => s.kind));
    for (const k of ['intro', 'concept', 'visual', 'formula', 'examples', 'mistakes', 'summary', 'next']) if (!kinds.has(k)) err(`${chapterId} ${sub.id}`, `missing section "${k}"`);
    sub.sections.filter((s) => s.kind === 'visual').forEach((s, k) => { if (!s.alt || strip(s.alt).length < 40) err(`${chapterId} ${sub.id}`, `visual ${k + 1} lacks a text alternative`); });
    sub.sections.filter((s) => s.kind === 'examples').forEach((s) => s.items.forEach((e, k) => { for (const f of ['question', 'given', 'find', 'method', 'steps', 'check', 'conclusion']) if (!e[f] || (Array.isArray(e[f]) && !e[f].length)) err(`${chapterId} ${sub.id} contoh ${k + 1}`, `missing ${f}`); }));
  }
  const nEx = CHAPTER.subtopics.reduce((n, s) => n + s.sections.filter((x) => x.kind === 'examples').reduce((m, x) => m + x.items.length, 0), 0);
  const nVis = CHAPTER.subtopics.reduce((n, s) => n + s.sections.filter((x) => x.kind === 'visual').length, 0);
  chapterRows.push({ chapterId, title: meta.title, status: CHAPTER.status, subs: CHAPTER.subtopics.length, nEx, nVis, nQ: qs.length, coverage });
}

const covered = chapterRows.length;
const report = [
  '# Laporan pengesahan nota', '',
  `Bab dengan fail nota: ${covered} daripada ${CURRICULUM.length}.`, '',
  `**Ralat: ${errors.length} · Amaran: ${warnings.length} · Perlu semakan manusia: ${manual.length}**`, '',
  ...chapterRows.flatMap((c) => [`## ${c.chapterId} ${c.title} (status: ${c.status})`, '', `${c.subs} subtopik · ${c.nEx} contoh · ${c.nVis} visual · ${c.nQ} soalan`, '', '| SP | Subtopik | Konsep | Contoh | Soalan |', '|---|---|---|---|---|', ...c.coverage.map((r) => `| ${r.sp} | ${r.sub} | ${r.concept ? '✓' : '✗'} | ${r.example ? '✓' : '✗'} | ${r.nq} |`), '']),
  '## Ralat', ...(errors.length ? errors.map((e) => `- ${e}`) : ['- tiada']), '',
  '## Amaran', ...(warnings.length ? warnings.map((e) => `- ${e}`) : ['- tiada']), '',
  '## Perlu semakan manusia', ...(manual.length ? manual.map((e) => `- ${e}`) : ['- tiada']), '',
  '> Lulus pengesahan automatik ≠ diluluskan untuk diterbitkan. Penerangan, contoh dan soalan penaakulan perlu disemak oleh pemilik.',
].join('\n');
if (process.argv[2]) writeFileSync(process.argv[2], report);
console.log(report);
process.exit(errors.length ? 1 : 0);
