// Story content, data-driven so new stories don't require touching scene
// or grammar code. Three kinds of fields live here side by side:
//
//  - UI fields (label, instruction, panels[].iconKey/caption/order) — read
//    by GameScene for the Phase 1 story-order screen.
//  - `timeModes` — one entry per tense the story can be replayed in
//    (Phase 5 Time Switch). Each mode supplies the framing text
//    (label/contextBadge/prompt) and the time-cue chunk for that tense.
//    `tense` names the story's *default* starting mode.
//  - `sentenceData[]` — tense-INVARIANT grammar facts per panel
//    (subjectId, verbId, complement). The actual sentence for a given
//    tense is generated on demand, never stored per-tense, so switching
//    time modes never duplicates a sentence by hand (see
//    src/grammar/sentence-chunks.js -> resolveSentenceEntry). An entry can
//    carry an optional `overrides: { <tense>: { complement: '...' } }` for
//    the rare case natural English needs a different complement in a
//    different tense — story-01 doesn't need one, but the mechanism is
//    here for stories that do.
//
// panels[] and sentenceData[] are parallel arrays: sentenceData[i]
// describes the sentence for panels[i] (matched by `panelId`).

const StoryData = {
  'story-01': {
    storyId: 'story-01',
    title: 'The Missed Bus',
    label: 'Story 01',
    instruction: 'Put the story in the correct order.',
    tense: 'pastSimple',
    timeModes: {
      pastSimple: { label: 'PAST', contextBadge: 'YESTERDAY', prompt: 'What happened this morning?', timeCueId: 'yesterday' },
      presentSimple: { label: 'PRESENT', contextBadge: 'EVERY SUNDAY', prompt: 'What happens every Sunday?', timeCueId: 'every sunday' },
      futureSimple: { label: 'FUTURE', contextBadge: 'TOMORROW', prompt: 'What will happen tomorrow?', timeCueId: 'tomorrow' },
    },
    panels: [
      { id: 'wake', order: 1, iconKey: 'icon-wake', caption: 'Wakes up' },
      { id: 'breakfast', order: 2, iconKey: 'icon-breakfast', caption: 'Eats breakfast' },
      { id: 'bus', order: 3, iconKey: 'icon-bus', caption: 'Misses the bus' },
      { id: 'school', order: 4, iconKey: 'icon-school', caption: 'Arrives at school' },
    ],
    sentenceData: [
      { panelId: 'wake', subjectId: 'maya', verbId: 'wake', complement: 'up early' },
      { panelId: 'breakfast', subjectId: 'maya', verbId: 'eat', complement: 'breakfast' },
      { panelId: 'bus', subjectId: 'maya', verbId: 'miss', complement: 'the bus' },
      { panelId: 'school', subjectId: 'maya', verbId: 'arrive', complement: 'at school' },
    ],
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StoryData;
}
