// Round trip through the REAL answer checker (src/notes/practice.js checkSingle,
// the same function the notes app and the DENAI Learning Hub call).
// The notes validator proves each stored answer is mathematically right; this
// test proves a student who types that answer is told "right", and that every
// stored misconception value reaches its own feedback (not generic text, and
// never "right").
//   node app/addmath/tests/checker-roundtrip.mjs
import { NOTE_MODULES } from '../src/content/notes/index.js';
import { checkSingle } from '../src/notes/practice.js';

const errors = [];
let checked = 0, wrongs = 0;
const shown = (v) => (Number.isInteger(v) ? String(v) : String(+v.toPrecision(10))); // as answerHtml displays it

function trySpec(spec, id) {
  if (spec.type === 'numeric') {
    checked++;
    const r = checkSingle(spec, shown(spec.answer));
    if (r.state !== 'right') errors.push(`${id}: typing the stored answer ${shown(spec.answer)} gives ${r.state}`);
    // the answer rounded as a student would write it must still be accepted when a tolerance is given
    if (spec.tolerance) for (const dp of [2, 3]) { const t = spec.answer.toFixed(dp); if (Math.abs(+t - spec.answer) <= spec.tolerance) { const rr = checkSingle(spec, t); if (rr.state !== 'right') errors.push(`${id}: rounded answer ${t} rejected`); } }
    for (const w of spec.wrong || []) {
      wrongs++;
      const rw = checkSingle(spec, shown(w.value));
      if (rw.state !== 'wrong') errors.push(`${id}: misconception value ${w.value} gives ${rw.state}`);
      else if (rw.html !== w.feedback) errors.push(`${id}: misconception value ${w.value} shows other feedback (shadowed by an earlier wrong value?)`);
    }
  } else if (spec.type === 'expression') {
    checked++;
    const typed = spec.upToConstant ? `${spec.answer}+c` : spec.answer;
    const r = checkSingle(spec, typed);
    if (r.state !== 'right') errors.push(`${id}: typing the stored answer "${typed}" gives ${r.state}`);
    for (const w of spec.wrong || []) {
      wrongs++;
      const rw = checkSingle(spec, spec.upToConstant ? `${w.expr}+c` : w.expr);
      if (rw.state !== 'wrong') errors.push(`${id}: misconception "${w.expr}" gives ${rw.state}`);
      else if (rw.html !== w.feedback) errors.push(`${id}: misconception "${w.expr}" shows other feedback`);
    }
  } else if (spec.type === 'mcq') {
    checked++;
    if (spec.options.filter((o) => o.correct).length !== 1) errors.push(`${id}: needs exactly one correct option`);
    for (const o of spec.options) if (!o.correct) { wrongs++; if (!o.feedback) errors.push(`${id}: wrong option without feedback`); }
  }
}

for (const [ch, load] of Object.entries(NOTE_MODULES)) {
  const { CHAPTER } = await load();
  for (const q of CHAPTER.questions || []) {
    if (q.type === 'structured') q.parts.forEach((p, k) => trySpec(p, `${q.id}(${'abcdef'[k]})`));
    else trySpec(q, q.id);
  }
}
if (errors.length) { console.log(errors.join('\n')); console.log(`checker round trip: ${errors.length} problem(s)`); process.exit(1); }
console.log(`checker round trip: ${checked} answers and ${wrongs} misconception responses behave as authored`);
