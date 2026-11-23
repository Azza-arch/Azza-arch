// Regression tests for mathematics bugs found in audits. Never delete a case.
//   node app/addmath/tests/regression.mjs
globalThis.document = { compatMode: 'CSS1Compat' };
const { BAB1_QUESTIONS } = await import('../src/content/questions/bab1.js');
const { CHAPTER1_PRACTICE } = await import('../src/data/practiceChapter1.js');
const { CHAPTER1_LESSONS } = await import('../src/data/lessonsChapter1.js');
const { fmt } = await import('../src/notes/expr.js');
const strip = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&#8315;&#185;/g, '⁻¹').replace(/\s+/g, ' ').trim();
let fail = 0; const t = (name, ok, info = '') => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ' — ' + info}`); if (!ok) fail++; };

// Fasa A #1: p2 stored "9" as correct for f(4) where f(x) = 3x − 2 (answer 10).
const p2 = BAB1_QUESTIONS.find((q) => q.legacyId === 'p2');
t('p2 bank: correct option is 10', p2.options.find((o) => o.correct).text === '10');
const p2live = CHAPTER1_PRACTICE.find((q) => q.id === 'p2');
t('p2 live practice: answer index points to "10"', p2live.options[p2live.answer] === '10', p2live.options[p2live.answer]);
t('p2 distractor "6" = 3(4 − 2)', p2.options.some((o) => o.text === '6' && o.derive === '3*(4-2)'));

// Fasa A #2: inverse screen showed 0.09999999999999998 for v = 0.1.
const inv = CHAPTER1_LESSONS.find((l) => l.id === 9);
for (const v of ['0.1', '0.2', '0.3', '1.1', '-0.7', '2.675']) {
  const out = strip(inv.compute(v));
  t(`inverse screen returns exactly v = ${v}`, out.endsWith(`Kembali kepada v = ${Number(v)}`), out);
}
t('fmt(0.1 + 0.2) = "0.3"', fmt(0.1 + 0.2) === '0.3', fmt(0.1 + 0.2));
t('fmt((1.2 − 1) / 2) = "0.1"', fmt((1.2 - 1) / 2) === '0.1');

// Bab 10 audit: numeric tolerance was RELATIVE, so "4894.06 (2 d.p.)" with tolerance 0.006 accepted 4865–4923.
const { checkSingle } = await import('../src/notes/practice.js');
const big = { type: 'numeric', answer: 4894.06, tolerance: 0.006 };
t('tolerance is absolute: 4894.06 accepted', checkSingle(big, '4894.06').state === 'right');
t('tolerance is absolute: 4894.1 rejected', checkSingle(big, '4894.1').state === 'wrong');
t('tolerance is absolute: 4870 rejected', checkSingle(big, '4870').state === 'wrong');
t('exact answers still accept 3/4 for 0.75', checkSingle({ type: 'numeric', answer: 0.75 }, '3/4').state === 'right');
t('rounded wrong value still matches its feedback', checkSingle({ type: 'numeric', answer: 6.571, tolerance: 0.0006, wrong: [{ value: 15.711, feedback: 'X' }] }, '15.711').html === 'X');

// T5 Bab 3: indefinite integrals are accepted up to a constant, with or without "+ c".
const integ = { type: 'expression', answer: 'x^3/3+2x', upToConstant: true };
t('integral: "x^3/3+2x+c" accepted', checkSingle(integ, 'x^3/3+2x+c').state === 'right');
t('integral: "x^3/3+2x+5" accepted (constant differs)', checkSingle(integ, 'x^3/3+2x+5').state === 'right');
t('integral: missing c accepted with a reminder', /\+ c/.test(checkSingle(integ, 'x^3/3+2x').html));
t('integral: "x^3+2x" rejected', checkSingle(integ, 'x^3+2x+c').state === 'wrong');

// T5 Bab 6: Malaysian function names must parse (kosek before kos).
const { equivalent: eqv } = await import('../src/notes/expr.js');
t('kos(x)^2+sin(x)^2 ≡ 1', eqv('kos(x)^2+sin(x)^2', '1'));
t('kosek(x) ≡ 1/sin(x)', eqv('kosek(x)', '1/sin(x)'));
t('sek(x)^2-tan(x)^2 ≡ 1', eqv('sek(x)^2-tan(x)^2', '1'));
t('kot(x) ≡ kos(x)/sin(x)', eqv('kot(x)', 'kos(x)/sin(x)'));
// T5 Bab 7–8 (2026-11-23): solvers used by validate-notes for linear programming and kinematics.
{ const { lpSolve, halfPlaneSame, pathLength, kinExtreme, kinState } = await import('./triangle.mjs');
  const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
  t('LP continuous optimum at the vertex (10, 20): 1400', near(lpSolve({ cons: [[2, 1, '<=', 40], [1, 2, '<=', 50]], obj: [60, 40] }).value, 1400));
  t('LP integer optimum differs from the non-integer vertex: 320, not 330', lpSolve({ cons: [[2, 3, '<=', 18], [3, 1, '<=', 15]], obj: [50, 40], integer: true }).value === 320 && near(lpSolve({ cons: [[2, 3, '<=', 18], [3, 1, '<=', 15]], obj: [50, 40] }).value, 330));
  t('LP minimum on an axis vertex (9, 0): 18, not the crossing (3, 3)', near(lpSolve({ cons: [[3, 1, '>=', 12], [1, 2, '>=', 9], [1, 1, '<=', 15]], obj: [2, 5], goal: 'min' }).value, 18));
  t('LP unbounded maximum is reported', lpSolve({ cons: [[1, 1, '>=', 4]], obj: [1, 1] }).unbounded === true);
  t('half-planes: 12x + 3y ≤ 300 ≡ 4x + y ≤ 100, but not < 100', halfPlaneSame([12, 3, '<=', 300], [4, 1, '<=', 100]) && !halfPlaneSame([12, 3, '<=', 300], [4, 1, '<', 100]));
  t('kinematics: distance ≠ |displacement| when the particle turns (8/3 vs 0)', near(pathLength({ v: (x) => x * x - 4 * x + 3 }, 0, 3), 8 / 3, 1e-6) && near(kinState({ v: (x) => x * x - 4 * x + 3 }, 3).s, 0, 1e-6));
  t('kinematics: RK4 from a(t) with v(0) = 5 gives s(3) = −3', near(kinState({ a: (x) => 2 * x - 6, v0: 5 }, 3).s, -3, 1e-6));
  t('kinematics: ball thrown up at 15 m/s, a = −10, peaks at 11.25 m', near(kinExtreme({ a: () => -10, v0: 15 }, 's', 'max', 0, 3), 11.25, 1e-6)); }
console.log(fail ? `${fail} regression(s) FAILED` : 'all regressions pass');
process.exit(fail ? 1 : 0);
