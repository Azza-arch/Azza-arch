// Time cue phrases grouped by tense. "this morning" is intentionally
// listed under Past Simple: in our stories it means "earlier today,
// looking back" (past context), not a recurring habit. getTenseFromContext()
// in grammar-engine.js can still resolve it against a contextHint if a
// future story wants to reuse the same phrase for a present-habit reading.

const TimeCueData = {
  presentSimple: ['every day', 'every morning', 'usually', 'every sunday'],
  pastSimple: ['yesterday', 'last night', 'this morning'],
  futureSimple: ['tomorrow', 'next week', 'later'],
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TimeCueData;
}
