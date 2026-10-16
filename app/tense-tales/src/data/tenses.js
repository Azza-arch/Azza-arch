// The three tenses this MVP teaches. Keys are used everywhere else
// (verbs, time cues, sentence templates, story data) to stay in sync.

const Tenses = {
  PRESENT_SIMPLE: 'presentSimple',
  PAST_SIMPLE: 'pastSimple',
  FUTURE_SIMPLE: 'futureSimple',
};

const TenseLabels = {
  presentSimple: 'Present Simple',
  pastSimple: 'Past Simple',
  futureSimple: 'Future Simple',
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Tenses, TenseLabels };
}
