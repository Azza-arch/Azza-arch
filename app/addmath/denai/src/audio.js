// V8 Phase 4 (audits/level-v8/phase4/): a single reusable AudioManager,
// instantiated once at module scope (see the bottom of this file) so it
// survives every `scene.restart()` (replay) without ever creating a second
// AudioContext — Phaser scenes are recreated on restart, this module is
// not. Every sound is synthesized in-code via oscillators/gain envelopes;
// no audio files are loaded, downloaded or decoded anywhere in this file.
//
// Mirrors the architecture already established for visual effects in
// game.js (Phases 1-3.1): short-lived nodes that schedule their own
// cleanup, a shared "reduced-ness" concept (here, user-controlled mute/
// volume, never tied to prefers-reduced-motion — that flag is visual-only
// and must stay that way per the Phase 4 brief), and pause/resume reusing
// the Web Audio API's own native mechanism (AudioContext.suspend/resume)
// exactly the way game.js's pauseRun()/resumeRun() already reuse Phaser's
// own tweens.pauseAll()/time.paused — not a second, parallel system.

const STORAGE_KEY = 'lorong-audio-settings-v1';

// Per-category relative levels, so frequent movement sounds (jump/landing)
// never compete on equal footing with important feedback (puzzle/
// checkpoint/victory) — brief §4's explicit mixing priority, implemented
// as fixed per-sound gain multipliers rather than anything dynamic/
// adaptive (simplest thing that satisfies "frequent sounds must be
// quieter than important events" without over-engineering a mixer).
const LEVELS = {
  jump: .16, land: .14, coin: .32, checkpoint: .5, correct: .55,
  incorrect: .3, machine: .4, bridge: .42, victory: .6, ui: .22,
};

// A minimal voice limiter: if too many oscillators are already ringing at
// once, the newest LOW-priority request is simply skipped rather than
// stacked — avoids harsh peaks/clipping from simultaneous layers without
// needing a compressor node. High-priority categories (correct/checkpoint/
// victory/bridge/machine) are never dropped.
const MAX_VOICES = 6;
const HIGH_PRIORITY = new Set(['correct', 'checkpoint', 'victory', 'bridge', 'machine']);

// Per-category cooldown (ms): the smallest time two sounds of the SAME
// category may start apart, a safety net against duplicate playback from
// any future caller mistake — distinct from, and in addition to, every
// gameplay event already being single-fire by construction in game.js.
const COOLDOWN_MS = { jump: 60, land: 60, coin: 40, ui: 80 };

class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sfx = null;
    this.activeVoices = 0;
    this.lastPlayedAt = {};
    this.muted = false;
    this.masterVolume = .7;
    this.sfxVolume = .85;
    this._loadSettings();
  }

  _loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (typeof s.muted === 'boolean') this.muted = s.muted;
      if (typeof s.masterVolume === 'number') this.masterVolume = Phaser_clamp01(s.masterVolume);
      if (typeof s.sfxVolume === 'number') this.sfxVolume = Phaser_clamp01(s.sfxVolume);
    } catch (e) { /* corrupt/blocked storage: fall back to defaults, never throw */ }
  }

  _saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        muted: this.muted, masterVolume: this.masterVolume, sfxVolume: this.sfxVolume,
      }));
    } catch (e) { /* private browsing / quota: silently skip persistence */ }
  }

  // Must be called from an actual user-gesture handler (a click/keydown
  // listener) — browsers refuse to start an AudioContext otherwise. Safe
  // to call repeatedly: a second call just resumes the existing singleton
  // context rather than creating a new one.
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended' && !this._userPaused) this.ctx.resume().catch(() => {});
      return;
    }
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return; // no exception: AudioContext simply unavailable in this browser
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.sfx.connect(this.master);
      this.master.connect(this.ctx.destination);
      this._applyGains();
    } catch (e) {
      this.ctx = null; // any construction failure: stay silent, never throw into gameplay code
    }
  }

  _applyGains() {
    if (!this.master || !this.sfx) return;
    const now = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.muted ? 0 : this.masterVolume, now, .02);
    this.sfx.gain.setTargetAtTime(this.sfxVolume, now, .02);
  }

  setMuted(v) { this.muted = !!v; this._applyGains(); this._saveSettings(); }
  setMasterVolume(v) { this.masterVolume = Phaser_clamp01(v); this._applyGains(); this._saveSettings(); }
  setSfxVolume(v) { this.sfxVolume = Phaser_clamp01(v); this._applyGains(); this._saveSettings(); }

  // Reuses the Web Audio API's own native suspend/resume — the exact
  // audio-equivalent of game.js's `tweens.pauseAll()`/`time.paused`,
  // freezing every in-flight envelope's time progression (not merely
  // zeroing volume) so a resumed sound continues exactly where it left
  // off rather than silently finishing "behind" the pause screen.
  pause() { this._userPaused = true; if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {}); }
  resume() { this._userPaused = false; if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); }
  // For the rare caller (currently just the machine-activation stagger in
  // game.js) that schedules a SFX trigger via setTimeout rather than
  // within a single already-playing node graph — setTimeout runs on wall-
  // clock time, not the AudioContext's own clock, so it isn't frozen by
  // pause()/resume() the way an in-flight envelope already is. Checking
  // this first avoids a sound firing audibly late, out of context, if the
  // player pauses in the brief window between scheduling and firing.
  isPaused() { return !!this._userPaused; }

  // category: one of LEVELS' keys. build(ctx, destGain, t0) schedules the
  // actual oscillator graph and must call destGain as its first `.connect`
  // target; it returns the Set of nodes it created so they can be
  // disconnected once finished (not strictly required by Web Audio, which
  // garbage-collects stopped nodes on its own, but explicit disconnection
  // avoids relying on that and keeps the "no leaks" requirement provable).
  _play(category, build) {
    if (!this.ctx || this.muted) return;
    const now = performance.now();
    const cooldown = COOLDOWN_MS[category];
    if (cooldown && this.lastPlayedAt[category] && now - this.lastPlayedAt[category] < cooldown) return;
    if (this.activeVoices >= MAX_VOICES && !HIGH_PRIORITY.has(category)) return;
    this.lastPlayedAt[category] = now;
    this.activeVoices++;
    const t0 = this.ctx.currentTime;
    const level = (LEVELS[category] ?? .3);
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.value = level;
    voiceGain.connect(this.sfx);
    const nodes = build(this.ctx, voiceGain, t0) || [];
    const endedAt = Math.max(0, ...nodes.map(n => n._stopAt || 0));
    const cleanup = () => {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
      for (const n of nodes) { try { n.disconnect(); } catch (e) {} }
      try { voiceGain.disconnect(); } catch (e) {}
    };
    // setTimeout, not another Web Audio node — this cleanup is bookkeeping
    // only (freeing the voice count / disconnecting finished nodes), it
    // never re-triggers or alters audible output, so it does not need to
    // freeze during ctx.suspend() the way the SOUND itself already does.
    setTimeout(cleanup, Math.max(50, (endedAt - t0) * 1000 + 80));
  }

  tone(category, { freq = 440, endFreq = null, type = 'sine', duration = .12, attack = .006 } = {}) {
    this._play(category, (ctx, dest, t0) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, t0);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t0 + duration);
      env.gain.setValueAtTime(0, t0);
      env.gain.linearRampToValueAtTime(1, t0 + attack);
      env.gain.exponentialRampToValueAtTime(.001, t0 + duration);
      osc.connect(env); env.connect(dest);
      osc.start(t0); osc.stop(t0 + duration + .02);
      osc._stopAt = t0 + duration + .02;
      return [osc, env];
    });
  }

  // A short sequence of discrete tones, each with its own tiny envelope —
  // the building block for the two/three-note confirmations (checkpoint,
  // correct answer, machine activation, victory, bridge).
  sequence(category, notes, { type = 'sine', noteDuration = .1, gap = .07 } = {}) {
    this._play(category, (ctx, dest, t0) => {
      const nodes = [];
      notes.forEach((freq, i) => {
        const start = t0 + i * gap;
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, start);
        env.gain.setValueAtTime(0, start);
        env.gain.linearRampToValueAtTime(1, start + .006);
        env.gain.exponentialRampToValueAtTime(.001, start + noteDuration);
        osc.connect(env); env.connect(dest);
        osc.start(start); osc.stop(start + noteDuration + .02);
        osc._stopAt = start + noteDuration + .02;
        nodes.push(osc, env);
      });
      return nodes;
    });
  }
}

function Phaser_clamp01(v) { return Math.min(1, Math.max(0, v)); }

// --- The seven+ gameplay SFX, each a tiny named wrapper around tone()/
// sequence() above, so every call site in game.js reads as what the sound
// IS for, not its raw synthesis parameters. ---
export const SFX = {
  jump: (audio) => audio.tone('jump', { freq: 420, endFreq: 640, type: 'triangle', duration: .1, attack: .004 }),
  // `intensity` (0-1, from the same landing-speed scaling game.js already
  // computes for the dust burst) nudges both volume-relevant duration and
  // pitch slightly — a harder landing reads as a touch lower/longer, a
  // light step-off as a touch higher/shorter, without ever being harsh.
  land: (audio, intensity = .3) => audio.tone('land', {
    freq: 200 - intensity * 40, type: 'sine', duration: .05 + intensity * .03, attack: .002,
  }),
  coin: (audio) => audio.sequence('coin', [880, 1318], { type: 'triangle', noteDuration: .07, gap: .055 }),
  checkpoint: (audio) => audio.sequence('checkpoint', [523.25, 659.25], { type: 'sine', noteDuration: .14, gap: .11 }),
  correct: (audio) => audio.sequence('correct', [523.25, 659.25, 783.99], { type: 'triangle', noteDuration: .1, gap: .08 }),
  // Deliberately soft/low and NOT dissonant — a gentle two-step descent,
  // never a harsh buzzer, per the brief's explicit "never shame-inducing".
  incorrect: (audio) => audio.sequence('incorrect', [392, 329.63], { type: 'sine', noteDuration: .14, gap: .1 }),
  machine: (audio) => audio.sequence('machine', [330, 415, 494], { type: 'square', noteDuration: .05, gap: .045 }),
  bridge: (audio) => audio.tone('bridge', { freq: 180, endFreq: 420, type: 'sawtooth', duration: .3, attack: .01 }),
  victory: (audio) => audio.sequence('victory', [523.25, 659.25, 783.99, 1046.5], { type: 'triangle', noteDuration: .14, gap: .1 }),
  ui: (audio) => audio.tone('ui', { freq: 600, type: 'sine', duration: .05, attack: .003 }),
};

// One singleton for the whole page lifetime — created here, never inside
// the Phaser Scene class, so `scene.restart()` (replay) can never spawn a
// second AudioContext.
export const audio = new AudioManager();
