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
console.log(fail ? `${fail} regression(s) FAILED` : 'all regressions pass');
process.exit(fail ? 1 : 0);
