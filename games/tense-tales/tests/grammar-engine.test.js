// Phase 2 grammar engine tests. No framework — Node's assert only.
// Run with: node tests/grammar-engine.test.js

const assert = require('assert');
const GrammarEngine = require('../src/grammar/grammarEngine.js');
const Subjects = require('../src/data/subjects.js');

const { Tenses, getVerbForm, buildSentence, validateVerbChoice, validateSentenceTokens, getTenseLabel, getTimeCueForTense } = GrammarEngine;

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

// ---- Present Simple ----
test('Present Simple: I walk', () => {
  assert.strictEqual(getVerbForm({ verbId: 'walk', tense: Tenses.PRESENT_SIMPLE, subject: 'i' }), 'walk');
});
test('Present Simple: He walks', () => {
  assert.strictEqual(getVerbForm({ verbId: 'walk', tense: Tenses.PRESENT_SIMPLE, subject: 'he' }), 'walks');
});
test('Present Simple: Aina reads', () => {
  assert.strictEqual(getVerbForm({ verbId: 'read', tense: Tenses.PRESENT_SIMPLE, subject: 'aina' }), 'reads');
});
test('Present Simple: They play', () => {
  assert.strictEqual(getVerbForm({ verbId: 'play', tense: Tenses.PRESENT_SIMPLE, subject: 'they' }), 'play');
});

// ---- Past Simple ----
test('Past: walk -> walked', () => {
  assert.strictEqual(getVerbForm({ verbId: 'walk', tense: Tenses.PAST_SIMPLE, subject: 'he' }), 'walked');
});
test('Past: go -> went', () => {
  assert.strictEqual(getVerbForm({ verbId: 'go', tense: Tenses.PAST_SIMPLE, subject: 'he' }), 'went');
});
test('Past: find -> found', () => {
  assert.strictEqual(getVerbForm({ verbId: 'find', tense: Tenses.PAST_SIMPLE, subject: 'he' }), 'found');
});
test('Past: lose -> lost', () => {
  assert.strictEqual(getVerbForm({ verbId: 'lose', tense: Tenses.PAST_SIMPLE, subject: 'he' }), 'lost');
});
test('Past: read -> read (same spelling)', () => {
  assert.strictEqual(getVerbForm({ verbId: 'read', tense: Tenses.PAST_SIMPLE, subject: 'he' }), 'read');
});

// ---- Future Simple ----
test('Future: will walk', () => {
  assert.strictEqual(getVerbForm({ verbId: 'walk', tense: Tenses.FUTURE_SIMPLE, subject: 'they' }), 'will walk');
});
test('Future: will go', () => {
  assert.strictEqual(getVerbForm({ verbId: 'go', tense: Tenses.FUTURE_SIMPLE, subject: 'they' }), 'will go');
});
test('Future: will read', () => {
  assert.strictEqual(getVerbForm({ verbId: 'read', tense: Tenses.FUTURE_SIMPLE, subject: 'they' }), 'will read');
});

// ---- Third-person spelling ----
test('Third person spelling: carry -> carries', () => {
  assert.strictEqual(getVerbForm({ verbId: 'carry', tense: Tenses.PRESENT_SIMPLE, subject: 'theBoy' }), 'carries');
});
test('Third person spelling: go -> goes', () => {
  assert.strictEqual(getVerbForm({ verbId: 'go', tense: Tenses.PRESENT_SIMPLE, subject: 'theGirl' }), 'goes');
});

// ---- Sentence generation ----
test('Sentence: The boy walked toward the tree.', () => {
  const sentence = buildSentence({ subject: 'theBoy', verbId: 'walk', tense: Tenses.PAST_SIMPLE, complement: 'toward the tree' });
  assert.strictEqual(sentence, 'The boy walked toward the tree.');
});
test('Sentence: Aina reads the book.', () => {
  const sentence = buildSentence({ subject: 'aina', verbId: 'read', tense: Tenses.PRESENT_SIMPLE, object: 'the book' });
  assert.strictEqual(sentence, 'Aina reads the book.');
});
test('Sentence: The children will play.', () => {
  const sentence = buildSentence({ subject: 'theChildren', verbId: 'play', tense: Tenses.FUTURE_SIMPLE });
  assert.strictEqual(sentence, 'The children will play.');
});

// ---- Time context is separate from grammar ----
test('Time cue is metadata, not required in a sentence (yesterday + present-tense-shaped past sentence is still valid English)', () => {
  const sentence = buildSentence({ subject: 'theBoy', verbId: 'walk', tense: Tenses.PAST_SIMPLE, complement: 'home' });
  assert.strictEqual(sentence, 'The boy walked home.');
  assert.strictEqual(getTimeCueForTense(Tenses.PAST_SIMPLE, 0), 'yesterday');
});

// ---- validateVerbChoice / validateSentenceTokens ----
test('validateVerbChoice: correct answer', () => {
  const result = validateVerbChoice({ chosen: 'walked', verbId: 'walk', tense: Tenses.PAST_SIMPLE, subject: 'he' });
  assert.strictEqual(result.correct, true);
});
test('validateVerbChoice: wrong answer reports the expected form', () => {
  const result = validateVerbChoice({ chosen: 'walks', verbId: 'walk', tense: Tenses.PAST_SIMPLE, subject: 'he' });
  assert.strictEqual(result.correct, false);
  assert.strictEqual(result.expected, 'walked');
});
test('validateSentenceTokens: matching order', () => {
  assert.strictEqual(validateSentenceTokens(['a', 'b', 'c'], ['a', 'b', 'c']), true);
});
test('validateSentenceTokens: wrong order', () => {
  assert.strictEqual(validateSentenceTokens(['b', 'a', 'c'], ['a', 'b', 'c']), false);
});

// ---- getTenseLabel ----
test('getTenseLabel: presentSimple -> "Present Simple"', () => {
  assert.strictEqual(getTenseLabel(Tenses.PRESENT_SIMPLE), 'Present Simple');
});

// ---- Subject data sanity ----
test('Named subjects resolve with correct person/number', () => {
  assert.strictEqual(Subjects.theBoy.person, 3);
  assert.strictEqual(Subjects.theBoy.number, 'singular');
  assert.strictEqual(Subjects.theChildren.number, 'plural');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
