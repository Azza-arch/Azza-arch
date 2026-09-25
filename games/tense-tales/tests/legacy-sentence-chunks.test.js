// Lightweight tests for the sentence-chunk builder (Phase 4).
// Run with: node tests/sentence-chunks.test.js

const assert = require('assert');
const SentenceChunks = require('../src/grammar/legacy-sentence-chunks.js');
const StoryData = require('../src/data/legacy-stories.js');

const { buildChunksForEntry, buildFullSentenceText, buildGrammarNote, resolveSentenceEntry } = SentenceChunks;

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

const story = StoryData['story-01'];
const busBaseEntry = story.sentenceData.find((e) => e.panelId === 'bus');
const busEntry = resolveSentenceEntry(busBaseEntry, story, 'pastSimple');

test('correct order is subject, verb, complement, timeCue', () => {
  const { correctOrder } = buildChunksForEntry(busEntry);
  assert.deepStrictEqual(correctOrder, ['subject', 'verb', 'complement', 'timeCue']);
});

test('correct chunks have the expected text', () => {
  const { correctChunks } = buildChunksForEntry(busEntry);
  const byId = Object.fromEntries(correctChunks.map((c) => [c.id, c.text]));
  assert.strictEqual(byId.subject, 'Maya');
  assert.strictEqual(byId.verb, 'missed');
  assert.strictEqual(byId.complement, 'the bus');
  assert.strictEqual(byId.timeCue, 'yesterday');
});

test('distractor is a meaningful alternate tense of the same verb (missed vs misses)', () => {
  const { distractorChunk } = buildChunksForEntry(busEntry);
  assert.strictEqual(distractorChunk.text, 'misses');
  assert.strictEqual(distractorChunk.isDistractor, true);
});

test('bank contains exactly 5 chunks (4 correct + 1 distractor)', () => {
  const { bankChunks } = buildChunksForEntry(busEntry);
  assert.strictEqual(bankChunks.length, 5);
});

test('buildFullSentenceText appends the time cue', () => {
  assert.strictEqual(buildFullSentenceText(busEntry), 'Maya missed the bus yesterday.');
});

test('buildGrammarNote is at most 2 lines and mentions the base/correct verb pair', () => {
  const note = buildGrammarNote(busEntry);
  const lines = note.split('\n');
  assert.ok(lines.length <= 2, `expected at most 2 lines, got ${lines.length}`);
  assert.ok(note.includes('miss'));
  assert.ok(note.includes('missed'));
});

test('present-tense entries get a past-tense distractor (go/went shape)', () => {
  const presentEntry = {
    subjectId: 'maya',
    verbId: 'go',
    complement: 'to school',
    tense: 'presentSimple',
    timeCueId: 'every day',
    correctSentence: 'Maya goes to school.',
  };
  const { distractorChunk, correctChunks } = buildChunksForEntry(presentEntry);
  assert.strictEqual(correctChunks.find((c) => c.id === 'verb').text, 'goes');
  assert.strictEqual(distractorChunk.text, 'went');
});

test('resolveSentenceEntry: past mode uses "yesterday" and produces "missed"', () => {
  const entry = resolveSentenceEntry(busBaseEntry, story, 'pastSimple');
  assert.strictEqual(entry.timeCueId, 'yesterday');
  assert.strictEqual(buildFullSentenceText(entry), 'Maya missed the bus yesterday.');
});

test('resolveSentenceEntry: present mode (Time Switch) uses "every sunday" and "misses"', () => {
  const entry = resolveSentenceEntry(busBaseEntry, story, 'presentSimple');
  assert.strictEqual(entry.timeCueId, 'every sunday');
  assert.strictEqual(buildFullSentenceText(entry), 'Maya misses the bus every sunday.');
});

test('resolveSentenceEntry: future mode (Time Switch) uses "tomorrow" and "will miss"', () => {
  const entry = resolveSentenceEntry(busBaseEntry, story, 'futureSimple');
  assert.strictEqual(entry.timeCueId, 'tomorrow');
  assert.strictEqual(buildFullSentenceText(entry), 'Maya will miss the bus tomorrow.');
});

test('resolveSentenceEntry: per-tense override wins over the base complement', () => {
  const baseWithOverride = {
    subjectId: 'maya',
    verbId: 'play',
    complement: 'football',
    overrides: { futureSimple: { complement: 'football again' } },
  };
  const futureEntry = resolveSentenceEntry(baseWithOverride, story, 'futureSimple');
  const pastEntry = resolveSentenceEntry(baseWithOverride, story, 'pastSimple');
  assert.strictEqual(futureEntry.complement, 'football again');
  assert.strictEqual(pastEntry.complement, 'football');
});

test('same story data replays correctly across all three time modes (no hand-duplicated sentences)', () => {
  const wakeBaseEntry = story.sentenceData.find((e) => e.panelId === 'wake');
  const results = Object.keys(story.timeModes).map((tenseId) => {
    const entry = resolveSentenceEntry(wakeBaseEntry, story, tenseId);
    return buildFullSentenceText(entry);
  });
  assert.deepStrictEqual(results, [
    'Maya woke up early yesterday.',
    'Maya wakes up early every sunday.',
    'Maya will wake up early tomorrow.',
  ]);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
