// One template per tense. The shape is identical for now (Subject + verb +
// complement) because Simple tenses don't change sentence order — kept
// separate per tense so a later tense (e.g. a negative or question form)
// can override its own template without touching the others.

const SentenceTemplates = {
  presentSimple: '{Subject} {verb} {complement}.',
  pastSimple: '{Subject} {verb} {complement}.',
  futureSimple: '{Subject} {verb} {complement}.',
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SentenceTemplates;
}
