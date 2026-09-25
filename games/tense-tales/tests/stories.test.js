// Phase 2 story-data tests. No framework — Node's assert only.
// Run with: node tests/stories.test.js

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Stories = require('../src/data/stories.js');
const AssetCatalog = require('../src/data/assetCatalog.js');
const SceneComposition = require('../src/utils/sceneComposition.js');
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

const storyList = Object.values(Stories);

test('There are exactly 5 playable stories', () => {
  assert.strictEqual(storyList.length, 5);
});

storyList.forEach((story) => {
  test(`"${story.title}" has exactly 4 panels`, () => {
    assert.strictEqual(story.panels.length, 4);
  });

  test(`"${story.title}" has unique panel orders 1-4`, () => {
    const orders = story.panels.map((p) => p.order).sort();
    assert.deepStrictEqual(orders, [1, 2, 3, 4]);
  });

  test(`"${story.title}" passes validateStoryShape (verbs/subjects exist, tenses valid)`, () => {
    const result = SentenceBuilder.validateStoryShape(story);
    assert.strictEqual(result.valid, true, result.errors.join('; '));
  });

  test(`"${story.title}" generates 4 sentences in Present Simple without throwing`, () => {
    const sentences = SentenceBuilder.buildStorySentences(story, Tenses.PRESENT_SIMPLE);
    assert.strictEqual(sentences.length, 4);
    sentences.forEach((s) => assert.ok(s.sentence.endsWith('.'), `"${s.sentence}" should end with a period`));
  });

  test(`"${story.title}" generates 4 sentences in Past Simple without throwing`, () => {
    const sentences = SentenceBuilder.buildStorySentences(story, Tenses.PAST_SIMPLE);
    assert.strictEqual(sentences.length, 4);
  });

  test(`"${story.title}" supports Present and Past only`, () => {
    assert.deepStrictEqual(story.supportedTenses, [Tenses.PRESENT_SIMPLE, Tenses.PAST_SIMPLE]);
    assert.ok(story.wordChallenge);
  });
});

test('Every story visual references catalogued assets with files on disk', () => {
  storyList.forEach((story) => story.panels.forEach((panel) => {
    assert.ok(panel.scene && panel.scene.layers.length, `${panel.id}: missing authored scene`);
    SceneComposition.resolve(panel.scene, AssetCatalog).forEach((layer) => {
      if (layer.path) assert.ok(fs.existsSync(path.join(__dirname, '..', layer.path)), `${panel.id}: missing file ${layer.path}`);
      assert.ok(layer.cover || (layer.x >= 0 && layer.x <= 100 && layer.y >= 0 && layer.y <= 100), `${panel.id}: layer outside frame`);
      assert.ok(layer.width > 0 && layer.width <= 100, `${panel.id}: invalid width`);
      assert.ok(SceneComposition.anchors.includes(layer.anchor), `${panel.id}: invalid anchor`);
      assert.ok(Number.isFinite(layer.z), `${panel.id}: invalid z-order`);
    });
  }));
});

test('Each level uses its own approved environment preset', () => {
  const expected = ['forest', 'park', 'neighborhood', 'homeExterior', 'studyRoom'];
  storyList.forEach((story, index) => {
    assert.deepStrictEqual([...new Set(story.panels.map((panel) => panel.scene.environment))], [expected[index]]);
    assert.ok(SceneComposition.environmentPresets[expected[index]], `${story.title}: missing environment preset`);
  });
});

test('Climbing the Tree Past Simple recap matches the approved visual actions', () => {
  const story = Stories['climbing-the-tree'];
  const sentences = SentenceBuilder.buildStorySentences(story, Tenses.PAST_SIMPLE).map((entry) => entry.sentence);
  assert.deepStrictEqual(sentences, [
    'The boy walked toward the tree.',
    'He started climbing the tree.',
    'He climbed higher.',
    'He reached the top.',
  ]);
});

test('Reading Under the Tree, panel 3, Present Simple -> "He reads the book."', () => {
  const story = Stories['reading-under-the-tree'];
  const sentences = SentenceBuilder.buildStorySentences(story, Tenses.PRESENT_SIMPLE);
  assert.strictEqual(sentences[2].sentence, 'He reads the book.');
});

test('The five standalone word challenges generate exact Present and Past sentences', () => {
  const expected = {
    'climbing-the-tree': ['The boy walks toward the tree.', 'The boy walked toward the tree.'],
    'reading-under-the-tree': ['The boy reads the book.', 'The boy read the book.'],
    'the-new-phone': ['The boy shows the phone to Aina.', 'The boy showed the phone to Aina.'],
    'getting-ready': ['The boy leaves the house.', 'The boy left the house.'],
    'doing-homework': ['Aina writes with a pencil.', 'Aina wrote with a pencil.'],
  };
  Object.keys(expected).forEach((id) => {
    const story = Stories[id];
    const panel = Object.assign({ id: `${id}-word` }, story.wordChallenge);
    assert.strictEqual(SentenceBuilder.resolvePanelSentence(panel, Tenses.PRESENT_SIMPLE).sentence, expected[id][0]);
    assert.strictEqual(SentenceBuilder.resolvePanelSentence(panel, Tenses.PAST_SIMPLE).sentence, expected[id][1]);
  });
});

test('buildStorySentences throws for an unsupported tense', () => {
  const story = Stories['climbing-the-tree'];
  assert.throws(() => SentenceBuilder.buildStorySentences(story, 'presentContinuous'));
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
