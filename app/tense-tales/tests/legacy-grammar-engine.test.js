// Lightweight tests for the grammar engine — no test framework, just
// Node's built-in assert. Run with: node tests/grammar-engine.test.js

const assert = require('assert');
const GrammarEngine = require('../src/grammar/legacy-grammar-engine.js');
const SentenceChunks = require('../src/grammar/legacy-sentence-chunks.js');
const StoryData = require('../src/data/legacy-stories.js');

const { Tenses, getVerbForm, buildSentence, validateSentenceChoice, getTenseFromContext } = GrammarEngine;

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (err) {
    failed += 1;
    console.log(`FAIL  ${name}`);
    console.log(`      ${err.message}`);
  }
}

test('regular past tense (walk -> walked)', () => {
  assert.strictEqual(getVerbForm('walk', Tenses.PAST_SIMPLE, 'maya'), 'walked');
});

test('irregular past tense (go -> went)', () => {
  assert.strictEqual(getVerbForm('go', Tenses.PAST_SIMPLE, 'maya'), 'went');
});

test('irregular past tense (eat -> ate)', () => {
  assert.strictEqual(getVerbForm('eat', Tenses.PAST_SIMPLE, 'maya'), 'ate');
});

test('third person singular present (she + miss -> misses)', () => {
  assert.strictEqual(getVerbForm('miss', Tenses.PRESENT_SIMPLE, 'she'), 'misses');
});

test('non-third-person present uses base form (I + miss -> miss)', () => {
  assert.strictEqual(getVerbForm('miss', Tenses.PRESENT_SIMPLE, 'i'), 'miss');
});

test('plural subject present uses base form (they + go -> go)', () => {
  assert.strictEqual(getVerbForm('go', Tenses.PRESENT_SIMPLE, 'they'), 'go');
});

test('future with "will" (arrive -> will arrive)', () => {
  assert.strictEqual(getVerbForm('arrive', Tenses.FUTURE_SIMPLE, 'maya'), 'will arrive');
});

test('sentence generation (past simple)', () => {
  const sentence = buildSentence({
    subjectId: 'maya',
    verbId: 'miss',
    complement: 'the bus',
    tense: Tenses.PAST_SIMPLE,
  });
  assert.strictEqual(sentence, 'Maya missed the bus.');
});

test('sentence generation (present simple, third person)', () => {
  const sentence = buildSentence({
    subjectId: 'she',
    verbId: 'wake',
    complement: 'up early',
    tense: Tenses.PRESENT_SIMPLE,
  });
  assert.strictEqual(sentence, 'She wakes up early.');
});

test('sentence generation (future simple)', () => {
  const sentence = buildSentence({
    subjectId: 'they',
    verbId: 'arrive',
    complement: 'at school',
    tense: Tenses.FUTURE_SIMPLE,
  });
  assert.strictEqual(sentence, 'They will arrive at school.');
});

test('validateSentenceChoice: fully correct selection', () => {
  const correct = { subjectId: 'maya', verbId: 'eat', complement: 'breakfast', tense: Tenses.PAST_SIMPLE };
  const result = validateSentenceChoice({ ...correct }, correct);
  assert.strictEqual(result.correct, true);
  assert.deepStrictEqual(result.errors, []);
});

test('validateSentenceChoice: wrong tense is reported', () => {
  const correct = { subjectId: 'maya', verbId: 'eat', complement: 'breakfast', tense: Tenses.PAST_SIMPLE };
  const wrong = { ...correct, tense: Tenses.PRESENT_SIMPLE };
  const result = validateSentenceChoice(wrong, correct);
  assert.strictEqual(result.correct, false);
  assert.ok(result.errors.includes('tense'));
});

test('validateSentenceChoice: wrong complement is reported', () => {
  const correct = { subjectId: 'maya', verbId: 'eat', complement: 'breakfast', tense: Tenses.PAST_SIMPLE };
  const wrong = { ...correct, complement: 'lunch' };
  const result = validateSentenceChoice(wrong, correct);
  assert.strictEqual(result.correct, false);
  assert.ok(result.errors.includes('complement'));
});

test('getTenseFromContext: unambiguous cue (yesterday -> pastSimple)', () => {
  assert.strictEqual(getTenseFromContext('yesterday'), Tenses.PAST_SIMPLE);
});

test('getTenseFromContext: unambiguous cue (tomorrow -> futureSimple)', () => {
  assert.strictEqual(getTenseFromContext('tomorrow'), Tenses.FUTURE_SIMPLE);
});

test('getTenseFromContext: unknown cue returns null', () => {
  assert.strictEqual(getTenseFromContext('someday'), null);
});

test('Story 01 sentenceData (past, default tense) builds the expected core sentences', () => {
  const story = StoryData['story-01'];
  const expected = {
    wake: 'Maya woke up early.',
    breakfast: 'Maya ate breakfast.',
    bus: 'Maya missed the bus.',
    school: 'Maya arrived at school.',
  };

  story.sentenceData.forEach((baseEntry) => {
    const entry = SentenceChunks.resolveSentenceEntry(baseEntry, story, story.tense);
    const built = buildSentence(entry);
    assert.strictEqual(built, expected[baseEntry.panelId], `Mismatch for panel "${baseEntry.panelId}"`);
  });
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
