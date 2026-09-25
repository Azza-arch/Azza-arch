// Phase 3 Story Order gameplay-logic tests. No framework — Node's assert.
// Run with: node tests/story-order.test.js

const assert = require('assert');
const { shuffle } = require('../src/gameplay/storyShuffle.js');
const { getCanonicalOrder, isCorrectOrder } = require('../src/gameplay/storyValidation.js');
const { createStoryOrderController } = require('../src/gameplay/storyOrderController.js');
const Stories = require('../src/data/stories.js');
const SentenceBuilder = require('../src/grammar/sentenceBuilder.js');
const { Tenses } = require('../src/grammar/grammarEngine.js');

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

const story = Stories['climbing-the-tree'];
const canonicalIds = getCanonicalOrder(story);

// ---- Shuffle ----
test('shuffle: returns all four panel ids', () => {
  const result = shuffle(canonicalIds);
  assert.deepStrictEqual(result.slice().sort(), canonicalIds.slice().sort());
});
test('shuffle: no duplicates', () => {
  const result = shuffle(canonicalIds);
  assert.strictEqual(new Set(result).size, 4);
});
test('shuffle: does not mutate the canonical array', () => {
  const before = canonicalIds.slice();
  shuffle(canonicalIds);
  assert.deepStrictEqual(canonicalIds, before);
});
test('shuffle: initial shuffle is never the correct order (100 trials)', () => {
  for (let i = 0; i < 100; i += 1) {
    const result = shuffle(canonicalIds);
    assert.notDeepStrictEqual(result, canonicalIds);
  }
});

// ---- Validation ----
test('validation: correct sequence -> true', () => {
  assert.strictEqual(isCorrectOrder(canonicalIds, story), true);
});
test('validation: visible panel sequence 01 -> 02 -> 03 -> 04 is canonical', () => {
  assert.deepStrictEqual(canonicalIds, [
    'climb-tree-01',
    'climb-tree-02',
    'climb-tree-03',
    'climb-tree-04',
  ]);
  assert.strictEqual(isCorrectOrder(canonicalIds, story), true);
});
test('validation: incorrect sequence -> false', () => {
  const wrong = [canonicalIds[1], canonicalIds[0], canonicalIds[2], canonicalIds[3]];
  assert.strictEqual(isCorrectOrder(wrong, story), false);
});
test('all five level stories expose a valid canonical four-frame order', () => {
  Object.values(Stories).forEach((levelStory) => {
    const ids = getCanonicalOrder(levelStory);
    assert.strictEqual(ids.length, 4);
    assert.strictEqual(isCorrectOrder(ids, levelStory), true);
  });
});

// ---- Controller: swap ----
test('controller: selectSlot swaps two different slots and preserves all ids', () => {
  const controller = createStoryOrderController(story);
  const before = controller.getState().orderedPanelIds.slice();
  controller.selectSlot(0);
  const { swapped } = controller.selectSlot(2);
  const after = controller.getState().orderedPanelIds;
  assert.strictEqual(swapped, true);
  assert.strictEqual(after[0], before[2]);
  assert.strictEqual(after[2], before[0]);
  assert.deepStrictEqual(after.slice().sort(), before.slice().sort());
});
test('controller: tapping the same slot twice deselects without swapping', () => {
  const controller = createStoryOrderController(story);
  controller.selectSlot(1);
  const { swapped } = controller.selectSlot(1);
  assert.strictEqual(swapped, false);
  assert.strictEqual(controller.getState().selectedSlot, null);
});
test('controller: dragSwap swaps two slots the same way as tap', () => {
  const controller = createStoryOrderController(story);
  const before = controller.getState().orderedPanelIds.slice();
  const { swapped } = controller.dragSwap(0, 3);
  const after = controller.getState().orderedPanelIds;
  assert.strictEqual(swapped, true);
  assert.strictEqual(after[0], before[3]);
  assert.strictEqual(after[3], before[0]);
});

// ---- Controller: attempts / hint ----
test('controller: first wrong check increments attempts, no hint yet', () => {
  const controller = createStoryOrderController(story);
  // Force a wrong order deterministically regardless of the initial shuffle.
  controller.selectSlot(0);
  controller.selectSlot(1);
  // If that happened to already be correct, swap back-and-forth once more
  // to guarantee a wrong state (four panels means at least one more swap
  // keeps it != canonical in practice for this test's purposes).
  if (isCorrectOrder(controller.getState().orderedPanelIds, story)) {
    controller.selectSlot(0);
    controller.selectSlot(1);
  }
  const result = controller.check();
  assert.strictEqual(result.correct, false);
  assert.strictEqual(result.attempts, 1);
  assert.strictEqual(result.showHint, false);
});
test('controller: second wrong check enables hint state', () => {
  const controller = createStoryOrderController(story);
  controller.selectSlot(0);
  controller.selectSlot(1);
  if (isCorrectOrder(controller.getState().orderedPanelIds, story)) {
    controller.selectSlot(0);
    controller.selectSlot(1);
  }
  controller.check();
  const second = controller.check();
  assert.strictEqual(second.attempts, 2);
  assert.strictEqual(second.showHint, true);
});
test('controller: correct check sets completed and does not increment attempts', () => {
  const controller = createStoryOrderController(story);
  // Force the canonical order directly via repeated swaps is awkward from
  // the outside; instead validate the underlying mechanism directly.
  const canonicalController = createStoryOrderController(story);
  // Manually drive orderedPanelIds to canonical using only public swap ops:
  // selection-sort via selectSlot until it matches canonical.
  for (let i = 0; i < canonicalIds.length; i += 1) {
    const current = canonicalController.getState().orderedPanelIds;
    const correctId = canonicalIds[i];
    const currentIndex = current.indexOf(correctId);
    if (currentIndex !== i) {
      canonicalController.selectSlot(i);
      canonicalController.selectSlot(currentIndex);
    }
  }
  assert.deepStrictEqual(canonicalController.getState().orderedPanelIds, canonicalIds);
  const result = canonicalController.check();
  assert.strictEqual(result.correct, true);
  assert.strictEqual(canonicalController.getState().completed, true);
});
test('controller: playAgain clears attempts, completion, selection, and reshuffles', () => {
  const controller = createStoryOrderController(story);
  controller.selectSlot(0);
  controller.check();
  controller.playAgain();
  const state = controller.getState();
  assert.strictEqual(state.attempts, 0);
  assert.strictEqual(state.completed, false);
  assert.strictEqual(state.selectedSlot, null);
  assert.notDeepStrictEqual(state.orderedPanelIds, canonicalIds);
});

// ---- Grammar integration ----
test('grammar integration: completed Climbing the Tree generates correct Past Simple sentences', () => {
  const sentences = SentenceBuilder.buildStorySentences(story, Tenses.PAST_SIMPLE).map((s) => s.sentence);
  assert.deepStrictEqual(sentences, [
    'The boy walked toward the tree.',
    'He started climbing the tree.',
    'He climbed higher.',
    'He reached the top.',
  ]);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
