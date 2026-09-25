(function () {
  var KEY = 'tenseTales.audio.v1';
  var context = null;
  var activeSpeech = null;

  function defaults() { return { muted: false, volume: 0.55, narration: true }; }
  function normalize(value) {
    var base = defaults();
    if (!value || typeof value !== 'object') return base;
    return {
      muted: value.muted === true,
      volume: Math.max(0, Math.min(1, Number.isFinite(Number(value.volume)) ? Number(value.volume) : base.volume)),
      narration: value.narration !== false,
    };
  }
  function load(storage) {
    try { return normalize(JSON.parse((storage || localStorage).getItem(KEY) || 'null')); }
    catch (error) { return defaults(); }
  }
  function save(next, storage) {
    var value = normalize(next);
    try { (storage || localStorage).setItem(KEY, JSON.stringify(value)); } catch (error) { /* storage can be unavailable */ }
    return value;
  }
  function ensureContext() {
    if (typeof window === 'undefined') return null;
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!context) context = new AudioContext();
    if (context.state === 'suspended') context.resume();
    return context;
  }
  function tone(kind) {
    var settings = load();
    if (settings.muted || settings.volume === 0) return;
    var ctx = ensureContext();
    if (!ctx) return;
    var profiles = {
      tap: [[420, 0.045, 0]],
      move: [[330, 0.055, 0], [440, 0.055, 0.045]],
      correct: [[523, 0.11, 0], [659, 0.11, 0.09], [784, 0.16, 0.18]],
      retry: [[260, 0.09, 0], [220, 0.12, 0.08]],
    };
    (profiles[kind] || profiles.tap).forEach(function (note) {
      var oscillator = ctx.createOscillator();
      var gain = ctx.createGain();
      var start = ctx.currentTime + note[2];
      oscillator.type = kind === 'retry' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(note[0], start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, settings.volume * 0.12), start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note[1]);
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.start(start); oscillator.stop(start + note[1] + 0.02);
    });
  }
  function stopNarration() {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    activeSpeech = null;
  }
  function speak(text) {
    stopNarration();
    var settings = load();
    if (settings.muted || !settings.narration || typeof window === 'undefined' || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      return Promise.resolve(false);
    }
    return new Promise(function (resolve) {
      var utterance = new SpeechSynthesisUtterance(String(text));
      utterance.lang = 'en-GB';
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
      utterance.volume = settings.volume;
      activeSpeech = utterance;
      utterance.onend = function () { if (activeSpeech === utterance) activeSpeech = null; resolve(true); };
      utterance.onerror = function () { if (activeSpeech === utterance) activeSpeech = null; resolve(false); };
      window.speechSynthesis.speak(utterance);
    });
  }
  function toggleMuted(storage) {
    var current = load(storage);
    current.muted = !current.muted;
    if (current.muted) stopNarration();
    return save(current, storage);
  }
  var api = { KEY: KEY, defaults: defaults, normalize: normalize, load: load, save: save, toggleMuted: toggleMuted, tone: tone, speak: speak, stopNarration: stopNarration };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.TenseTales.utils.audioManager = api;
})();
