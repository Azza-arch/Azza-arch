// Mutation self-test: the validator must catch known kinds of mistakes,
// including the real p2 bug found in the Fasa A audit.
import { checkQuestion, errors } from './validate-content.mjs';
import { BAB1_QUESTIONS } from '../src/content/questions/bab1.js';
const clone = (o) => JSON.parse(JSON.stringify(o));
const base = clone(BAB1_QUESTIONS.find((q) => q.id === 'b1-1.1-002'));
const cases = {
  'real p2 bug: "9" marked correct': (q) => { q.options.forEach((o) => (o.correct = o.text === '9')); },
  'distractor value does not match its stated mistake (old "1")': (q) => { q.options[3].text = '1'; },
  'two correct options': (q) => { q.options[1].correct = true; },
  'duplicate options': (q) => { q.options[2].text = '10'; },
  'SP code not in DSKP': (q) => { q.sp = ['1.1.9']; },
  'SP from another SK': (q) => { q.sp = ['1.2.1']; },
  'wrong option with "Betul" feedback': (q) => { q.options[1].feedback = 'Betul. ...'; },
  'invalid status': (q) => { q.status = 'live'; },
  'missing solution': (q) => { q.solution = []; },
  'domain question with wrong key': () => { const q = clone(BAB1_QUESTIONS.find((x) => x.id === 'b1-1.1-003')); q.options[0].correct = true; q.options[1].correct = false; return q; },
  'function-test question with wrong key': () => { const q = clone(BAB1_QUESTIONS.find((x) => x.id === 'b1-1.1-004')); q.options[0].correct = true; q.options[1].correct = false; return q; },
};
let missed = 0;
for (const [name, mutate] of Object.entries(cases)) {
  const q = clone(base); const out = mutate(q) || q;
  const before = errors.length; checkQuestion(out, name);
  const caught = errors.length > before;
  if (!caught) missed++;
  console.log(caught ? 'CAUGHT' : 'MISSED', name, caught ? '→ ' + errors[errors.length - 1].replace(name + ': ', '') : '');
}
console.log(missed ? `${missed} mutation(s) missed` : `all ${Object.keys(cases).length} mutations caught`);
process.exit(missed ? 1 : 0);
