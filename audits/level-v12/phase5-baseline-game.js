import {buildWorld,buildSecretMarkers} from './environment.js';
import {createMechanismMethods} from './mechanisms.js';
import {notify,syncPresentation,installPresentation,explain} from './presentation.js';
import { BUILD_STAGE, BATCH_END, SURFACES, WORLD, MOTION, SPAWN, GOAL, ZONES, GROUND_RANGES, FIRST_GAP, AB_TERRAIN, DECKS, LADDERS, GATES, TERMINALS, CHECKPOINTS, COLLECTIBLES, PUZZLES, SECRETS, CRATE_PUZZLE } from './level.js';
import { audio, SFX } from '../audio.js';
import { SaveManager } from './save.js';
import { WATERWORKS_STATE } from './waterworks.js';
import { updateMovingPlatform } from './moving-platform.js';

const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
// V8 Phase 2: named so the takeoff/landing squash-stretch tween (update())
// can scale relative to it instead of a second hardcoded ".158".
const BASE_SCALE = .158;
// V8 Phase 8.5 (audits/level-v8/phase8-5/): function_machine_idle/active is
// 186px tall natively; scaled so its visual height roughly matches the
// player's own on-screen height (~99px at BASE_SCALE), the same
// scale-consistency rule checkpoint_post_idle/active below follows.
const MACHINE_SCALE = .55;
// Purely a decoration lookup, never read by collision/physics code — kept
// OUT of level.js's DECKS table on purpose (brief §12: "separate scenery
// composition from collision data"). f-step1/cave-alcove/f-step2 are F's
// hillside steps; every other supported deck reads as a town/workshop
// building facade instead.
// V9.7 (audits/level-v9/full-kenney-world/): F's three step decks used to
// get a special Graphics-drawn zigzag "rock" silhouette instead of the
// normal land-mass fill — flagged as the highest-priority visual defect
// ("artificial zigzag rock-pillar appearance") once real Kenney terrain
// was available elsewhere. They are `supports:true` decks exactly like
// every A/B/D deck, so they now get the SAME kppLandMassFill() treatment
// (connected, stepped grass/dirt landforms) — no special-casing needed.
// DECK_STYLE kept (empty) in case a future zone genuinely needs a
// non-standard treatment again.
const DECK_STYLE = {};
const touchDevice = matchMedia('(pointer: coarse)').matches;
const controls = { left:false, right:false, up:false, down:false, jump:false, interact:false, restart:false, resetCrate:false };
let activeScene;
let fatal = false;
function announce(text) { $('status').textContent = text; $('objective').textContent = text; if(activeScene?.mode==='playing')notify(text); }
function clearControls() {
  Object.keys(controls).forEach(key => controls[key] = false);
  activeScene?.input.keyboard.resetKeys();
  if (activeScene?.player) activeScene.player.body.setVelocity(0, 0);
}
function fail(message) {
  fatal = true;
  $('loading').hidden = false;
  $('loading').textContent = message;
  $('welcome').hidden = true;
  $('pause').disabled = true;
}

class Rooftop extends Phaser.Scene {
  constructor() { super('Lorong'); }
  init() {
    this.mode = 'welcome'; this.climbing = null; this.climbLockUntil = 0; this.groundedAt = -1000;
    this.jumpAt = -1000; this.elapsed = 0; this.step = -1;
    this.routePlatforms = []; this.ladderZones = [];
    this.coinsFound = 0; this.collectibles = [];
    // V8 Phase 6: stable ids of collected coins (not just a count) and a
    // single flag for "this run reached the finish" — both exist purely so
    // writeSave()'s snapshot can be rebuilt from the scene's own
    // authoritative state at any trigger point, never guessed or inferred
    // from localStorage.
    this.collectedCoinIds = new Set(); this.levelCompleted = false; this.pendingSave = null;
    // V8 Phase 7: overwritten unconditionally in create() (before
    // buildEnvironment()) from whatever save already exists — this default
    // only matters when there's no save yet. Unlike solvedGates/
    // collectedCoinIds/checkpointIndex above, discoveredSecrets is
    // PERMANENT discovery progress, not per-run state: it is deliberately
    // never reset by Restart/Replay, only by an explicit, confirmed "Mula
    // petualangan baharu".
    this.discoveredSecrets = new Set();
    // Multi-gate / multi-checkpoint state (replaces the old single
    // solved/checkpointReached booleans now that there are three of each).
    this.solvedGates = new Set(); this.checkpointIndex = -1;
    this.waterworksState=WATERWORKS_STATE.LOCKED;this.waterOrder=null;
    this.gateBodies = {}; this.machines = {}; this.checkpointArts = [];
    this.activePuzzle = null; this.hintLevels = {}; this.attempts = {};
    // V8 Phase 2: tracks the previous frame's animation state, purely to
    // detect takeoff/landing EDGES for the squash/stretch below — not read
    // by any gameplay logic.
    this.lastAnim = 'idle'; this.lastGrounded = true;
    // V8 Phase 3: last frame's fall speed, read (not reset) right before a
    // landing is detected, so it reflects the actual impact speed for
    // scaling the landing dust. Starts at 0 and `lastGrounded` starts
    // `true` (both already set above), so the very first frame — spawn
    // already standing on the ground — never reads as "just landed".
    this.lastVy = 0;
  }
  preload() {
    this.load.spritesheet('kpp_terrain_atlas', 'assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png', {frameWidth:18, frameHeight:18});
    this.load.on('progress', value => $('load-progress') && ($('load-progress').textContent = `${Math.round(value * 100)}%`));
    this.load.on('loaderror', file => fail(`Aset tidak dapat dimuatkan: ${file.key}. Muat semula halaman untuk cuba lagi.`));
    Object.entries(this.game.registry.get('assets')).forEach(([key,path]) => {
      if (!this.textures.exists(key)) this.load.image(key, path);
    });
  }
  create() {
    if (fatal) return;
    activeScene = this;
    // V8 Phase 7: loaded here, unconditionally, BEFORE buildEnvironment()
    // draws the secret markers below — so an already-discovered secret
    // never re-renders its idle "come find me" motion on a fresh scene
    // instance, whether this is a genuine page reload or just a Restart/
    // Replay's scene.restart(). Secrets are the one part of the save that
    // is NOT gated behind the player clicking Continue.
    const existingSave = SaveManager.load();
    this.discoveredSecrets = new Set(existingSave?.discoveredSecretIds || []);
    this.physics.world.setBounds(0, 0, BATCH_END, WORLD.height, true, true, true, false);
    this.solids = this.physics.add.staticGroup();
    // V9.6: the real Kenney Pixel Platformer tiles (18px native, stretched
    // to a 54px display size) need nearest-neighbor filtering so they stay
    // crisp pixel art instead of blurring — Chill Boy's own existing
    // smooth/antialiased rendering is untouched (this only touches keys
    // prefixed 'kpp_').
    Object.keys(this.game.registry.get('assets')).forEach(key => {
      if (key.startsWith('kpp_')) this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    });
    this.buildEnvironment();
    this.renderWaterworksState();
    // A separate rectangular body means animation transparency never changes collisions.
    this.player = this.add.rectangle(SPAWN.x, SPAWN.feet - MOTION.bodyHeight/2, MOTION.bodyWidth, MOTION.bodyHeight, 0xffffff, 0);
    this.physics.add.existing(this.player);
    this.player.body.setSize(MOTION.bodyWidth, MOTION.bodyHeight).setMaxVelocity(MOTION.speed, 850).setCollideWorldBounds(true);
    this.visual = this.add.sprite(SPAWN.x, SPAWN.feet, 'idle-00').setOrigin(346/659, 525/626).setScale(BASE_SCALE).setDepth(20);
    for (const [key,count,fps] of [['idle',12,8],['run',10,14],['jump',1,1],['fall',1,1]]) {
      if (!this.anims.exists(key)) this.anims.create({ key, frames:Array.from({length:count},(_,i)=>({key:`${key}-${String(i).padStart(2,'0')}`})), frameRate:fps, repeat:-1 });
    }
    if(reducedMotion) this.visual.setTexture('idle-00');
    else this.visual.play('idle');
    this.physics.add.collider(this.player, this.solids, undefined, (_player, platform) => {
      if (this.climbing && platform.getData('oneWay')) return false;
      // Decks are one-way. Solid street geometry is never bypassed.
      if (platform.getData('oneWay')) return this.player.body.velocity.y >= 0 && this.player.body.prev.y + MOTION.bodyHeight <= platform.body.top + 8;
      return true;
    });
    // V9 Phase 1: a real solid collider between the player and the crate —
    // without this the two dynamic bodies simply pass through each other
    // (no amount of touching.left/right logic in update() means anything
    // without the collider that actually sets those flags). This is what
    // makes pushing reliable regardless of approach speed: Arcade resolves
    // the overlap every physics step, so the crate can never be walked
    // through, only pushed.
    if (this.crate) this.physics.add.collider(this.player, this.crate);
    this.keys = this.input.keyboard.addKeys({left:'LEFT',right:'RIGHT',up:'UP',down:'DOWN',a:'A',d:'D',w:'W',s:'S',jump:'SPACE',interact:'E',restart:'R',resetCrate:'C'});
    // Latch even a very short tap between render frames; held keys do not auto-jump.
    for(const action of ['jump','interact','restart','resetCrate']) this.keys[action].on('down',()=>{
      if(this.mode==='playing') controls[action]=true;
    });
    this.input.keyboard.removeCapture(['W','A','S','D','E','R','C','ESC']);
    // V7 camera (audits/level-v7/): the world is now genuinely tall
    // (WORLD.height=1300, tiers from y=660 to y=1100, vs V6's effectively
    // flat ~350px range), so the V6.1 bounds.top=480 value is meaningless
    // here — it was already a world-specific number, not a constant, and
    // the V6.1 report's own derivation shows why: bounds.top's legal
    // ceiling is WORLD.height - viewportHeight, which changes with
    // WORLD.height. Recomputed the same way: viewport height is 700
    // (slightly taller than V6's 648, matched to this world's real vertical
    // range), ceiling = 1300-700=600, bounds.top=450 leaves 150px of
    // vertical scroll room (vs V6.1's own measured 24px) AND ~210px of
    // headroom above the highest platform (roof-m2, y=660) for jump arcs.
    this.cameras.main.setBounds(0, 300, BATCH_END, 1566 - 300);
    this.cameras.main.startFollow(this.player, true, reducedMotion ? 1 : .14, reducedMotion ? 1 : .16, -85, 10);
    // V9.4: soft sky blue (brief's explicit "lock the visual direction"
    // color list), replacing the flat neutral grey — now that the removed
    // background-legacy skyline no longer fills this role, a plain color
    // layer is the approved fallback per the brief's own clarification.
    this.cameras.main.setBackgroundColor('#aee3f5');
    this.cameras.main.centerOn(SPAWN.x, SPAWN.feet - 190);
    this.applyResponsiveZoom();
    this.prompt = this.add.text(0,0,'',{fontFamily:'Arial, sans-serif',fontSize:'17px',fontStyle:'bold',color:'#fff2ce',backgroundColor:'#203e36',padding:{x:8,y:6}}).setOrigin(.5,1).setDepth(40).setVisible(false);
    // V8 Phase 3 (audits/level-v8/phase3/): a single small soft-circle
    // texture, generated once from a Graphics object — no new asset file,
    // reused (via per-emitter tint) for every dust/sparkle effect below.
    if (!this.textures.exists('fx-dot')) {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 1).fillCircle(4, 4, 4);
      g.generateTexture('fx-dot', 8, 8);
      g.destroy();
    }
    // Machine-interaction readiness cue: one persistent, reused ring
    // (never recreated per-frame) toggled visible/positioned in update()
    // when the player is within interaction range of a terminal. Depth
    // 10.5 sits behind the lever/prompt (11/40) and above decks (10), so
    // it can never obscure the interaction prompt or the puzzle dialog
    // (a separate HTML <dialog>, entirely outside the Phaser canvas).
    this.machineGlow = this.add.circle(0, 0, 24, 0xc9a227, 0).setStrokeStyle(2, 0xc9a227, .55).setDepth(10.5).setVisible(false);
    this.physics.world.pause();
    $('loading').hidden = true;
    $('welcome').hidden = false;
    document.body.classList.add('menu-active');
    $('pause').disabled = true;
    $('touch-controls').hidden = true;
    $('checkpoint-state').textContent = 'Mula di rumah';
    $('objective').textContent = 'Lintasi bukit, susun fungsi dan capai pintu destinasi.';
    // V8 Phase 6: decide which welcome-screen actions to show (Continue /
    // Start New Adventure vs. just Start) from whatever is actually on disk
    // right now, every time this scene is (re)created.
    this.refreshMenu();
    // V8 Phase 7: the pause menu's collection section reflects
    // this.discoveredSecrets regardless of whether the player has ever
    // opened pause yet this session.
    this.renderSecretsUI();
    // V8 Phase 8: Level Select's one card reflects the save too, from the
    // moment the scene exists — opening it never shows stale data even on
    // the very first frame.
    this.renderLevelSelect();
    $('import-v9').hidden=!!existingSave || !SaveManager.legacyAvailable();
    announce('Ikut laluan dari taman ke sungai. Laluan atas ialah bonus pilihan.');
    this.events.once('shutdown', () => { this.input.keyboard.enabled = true; });
    if (this.game.registry.get('replay')) {
      this.game.registry.set('replay', false); this.startRun();
    }
  }
  art(key,x,y,scale=1,depth=4,alpha=1) { return this.add.image(x,y,key).setOrigin(0,1).setScale(scale).setDepth(depth).setAlpha(alpha); }
  label(text,x,y,size=15) {
    return this.add.text(x,y,text,{fontFamily:'Arial, sans-serif',fontSize:`${size}px`,color:'#fff2ce',backgroundColor:'#203e36',padding:{x:9,y:6}}).setOrigin(.5,1).setDepth(12).setVisible(false);
  }
  platform(data, oneWay=true) {
    const body = this.add.rectangle(data.x + data.width/2, data.y+8, data.width, 16, 0, 0);
    this.physics.add.existing(body,true); this.solids.add(body);
    body.setData('oneWay',oneWay).setData('id',data.id);
    this.routePlatforms.push(body);
    return body;
  }
  deck(data) {
    const arts=[];
    for(let x=data.x;x<data.x+data.width;x+=54) {
      const w=Math.min(54,data.x+data.width-x);
      const a=this.add.image(x,data.y,'kpp_terrain_atlas',x===data.x?48:x+54>=data.x+data.width?50:49).setOrigin(0).setScale(3).setCrop(0,0,w/3,6).setDepth(10);
      arts.push(a);
    }
    return arts;
  }
  gateArt(data) { return this.deck(data); }
  spawnCollectibles() {
    // V9.8 (audits/level-v9/visual-acceptance/): swapped from the 64px
    // pack's `kenney_coin` to the real imported pack's own coin tile
    // (`kpp_coin`, index 150) — the last old-family sprite still mixed
    // into the new terrain. Scaled to the same ~32px visual size the old
    // coin used (18px native * 1.78 ≈ 32px); `refreshBody()` keeps the
    // static Arcade body in sync with the new texture/scale so pickup
    // overlap detection is unaffected.
    for(const def of COLLECTIBLES) {
      const coin=def.kind==='gem'?this.physics.add.staticImage(def.x,def.y,'kpp_terrain_atlas',67).setScale(2).setDepth(14):this.physics.add.staticSprite(def.x,def.y,'kpp_coin').setScale(1.78).setDepth(14);
      coin.body.setSize(18,18); coin.refreshBody();
      if(def.requiresSecret&&!this.discoveredSecrets.has(def.requiresSecret))coin.body.enable=false;
      coin.setData('id',def.id);
      if(!reducedMotion) this.tweens.add({targets:coin,y:def.y-10,duration:900,yoyo:true,repeat:-1,ease:'Sine.inOut'});
      this.collectibles.push(coin);
    }
  }
  // V6.3 Phase 1 (audits/level-v6.3/): three purely decorative layers, all
  // non-colliding `this.add.image` calls (no physics body — same primitive
  // already used for the cave-entrance markers below), all at depths below
  // every gameplay/interactive layer (ground=9, decks=10, machines/signs=11,
  // ladders=13) so they can never visually compete with or obscure them.
  // - Background (depth .5, alpha .45, scrollFactor .3/.2 — identical to the
  //   existing cloud layer's values): distant skyline, lowest contrast.
  // - Midground (depth 1.5, alpha .7, scrollFactor .55/.4): building/roof
  //   silhouettes behind the platforms, giving every awning/deck something
  //   to visually belong to instead of reading as a floating pillar.
  // - Ground-level props (depth 2, alpha .85, default scrollFactor i.e. 1:1
  //   with gameplay — same as the existing cave-entrance blocks): small,
  //   sparse accents directly on the street, never parallaxing (so they
  //   never interfere with judging a jump distance).
  // Assets are the pre-existing, already-imported `assets/production/` and
  // `assets/background-legacy/` sets (see level-v6.3-asset-inventory.md) —
  // not a new pack, already present in assets/manifest.json and therefore
  // already loaded by preload() whether or not this method draws them.
  // V8 Phase 1 (audits/level-v8/phase1/): re-derived entirely against the
  // live V7 coordinates in level.js — the previous version (kept only in
  // git history/baseline snapshots now) was tuned for V6.3's flat world
  // and placed things like "x:4555" in a world that is now only 4300px
  // wide. Every placement below is read directly from the current DECKS/
  // ZONES/GATES tables, not reused from any prior pass.
  // V8.7 (audits/level-v8/phase8-7/): deliberately pared back from Phase
  // 8.5's full architectural pass. The user's own call after reviewing it
  // live: too much detailed house/shop scenery, not enough "clean
  // lightweight Kenney puzzle-platformer." This method now places AT MOST
  // one small, sparse landmark per zone (never a multi-piece building/
  // shopfront), keeps hill/cave/river identity exactly as Phase 8.5 built
  // it (the brief explicitly asked to retain those), and otherwise leans
  // on supportPiers()'s unified Kenney-tile look plus the existing
  // distant background band. Every placement still names the exact
  // ladder/machine/gap x it stays clear of.
  sceneryTree(x, groundY) {
    // Verified Base-pack canopy and trunk tiles; scenery has no body.
    for (let row = 0; row < 3; row++) {
      this.add.image(x - 27, groundY - 54 * (row + 1), 'kpp_trunk').setOrigin(0).setDisplaySize(54, 54).setDepth(3);
    }
    const canopy = [[17,18,19],[37,38,39],[57,58,59]];
    canopy.forEach((line, row) => line.forEach((id, col) => {
      this.add.image(x - 81 + col * 54, groundY - 270 + row * 54, `kpp_canopy_${id}`).setOrigin(0).setDisplaySize(54,54).setDepth(3);
    }));
  }
  buildEnvironment() { buildWorld(this); }
  buildCratePuzzle() {
    const cfg = CRATE_PUZZLE;
    // Crate: a real dynamic Arcade body (collides with this.solids exactly
    // like the player does), separate from its visual — same "art never
    // determines collision" split the player itself already uses.
    this.crateStart = { x: cfg.crate.x, y: cfg.crate.feet - 24 };
    this.crate = this.add.rectangle(this.crateStart.x, this.crateStart.y, 48, 48, 0, 0);
    this.physics.add.existing(this.crate);
    this.crate.body.setCollideWorldBounds(false).setDragX(0).setBounce(0).setMaxVelocity(MOTION.speed * .75, 850);
    this.physics.add.collider(this.crate, this.solids);
    // V9.1 (audits/level-v9/phase1-layout-repair/): tinted distinctly from
    // the identical-looking ground/deck/support tiles built from the same
    // 'kenney_block_center' texture family — the brief's own "distinct
    // crates" requirement. A pure visual change, the collision rectangle
    // above is untouched.
    // V9.6: the crate now uses the real Kenney Pixel Platformer pack's own
    // chest/crate tile (already warm wood/gold colored by design — no tint
    // needed to read as "distinct from terrain," unlike the old reused
    // block texture it replaces).
    this.crateArt = this.add.image(cfg.crate.x, cfg.crate.feet, 'kpp_crate').setOrigin(.5, 1).setDisplaySize(48, 48).setDepth(15);
    // V9.1: the switch is now a flat pressure PLATE, not a lever — a
    // lever (an upright arm) doesn't read as "step here", a flattened tile
    // does. 'kenney_lever'/'kenney_lever_left' (Phase 8.5 freed these up)
    // are reused elsewhere for nothing now, so this reuses
    // 'kenney_block_blue' (otherwise unused in this project) squashed flat
    // and recessed slightly into the ground; "pressed" is a further
    // flatten + darken, not a texture swap — code-driven, no new asset.
    // V9.6: base texture switched from the 64px pack's 'kenney_block_blue'
    // to the imported pack's plain dirt tile, so nothing in A/B still
    // draws from the old pack — the pressed/unpressed tint logic below is
    // otherwise completely unchanged.
    this.crateSwitch = this.add.image(cfg.floorSwitch.x, cfg.floorSwitch.feet, 'kpp_terrain_atlas',148).setOrigin(.5, 1).setDisplaySize(54, 54).setDepth(11);
    this.crateSwitchActive = false;
    this.cratePlatformBody = null;
    // V9.1: this ledge is the actual destination the crate is FOR — see
    // CRATE_PUZZLE's own comment in level.js for why its rise (120px)
    // makes it genuinely unreachable without the crate. Discovery
    // feedback (sparkle/text) is session-only, not saved — this is
    // deliberately NOT a new tracked collectible (see
    // crate-puzzle-purpose-and-reachability.md for why).
    // V9.6: the ledge now ALSO holds coin-a (repositioned here from ground
    // level — see COLLECTIBLES in level.js) so solving the puzzle has a
    // real, concrete reward, not just a discovery cue.
    this.crateLedgeDiscovered = false;
    const plat = cfg.platform;
    // A thin one-way ledge must not draw a false dirt wall down into
    // the player's 60px body. The timber now matches the 16px collider.
    this.cratePlatformArt = this.deck(plat);
    this.cratePlatformArt.forEach(a => a.setAlpha(.3));
  }
  // Removes the platform's collision body (and its bookkeeping in
  // this.solids/this.routePlatforms) without touching its art — called
  // every time the switch deactivates, so repeated activate/deactivate
  // cycles never accumulate stale bodies.
  deactivateCratePlatform() {
    if (!this.cratePlatformBody) return;
    this.solids.remove(this.cratePlatformBody);
    const i = this.routePlatforms.indexOf(this.cratePlatformBody);
    if (i >= 0) this.routePlatforms.splice(i, 1);
    this.cratePlatformBody.destroy();
    this.cratePlatformBody = null;
  }
  // Explicit "Reset Kotak" — resets ONLY this local puzzle (crate
  // position/velocity, switch state, platform collision) and never
  // touches checkpoints, solved gates, coins, secrets or save data.
  resetCrate(auto = false) {
    if (!this.crate) return;
    this.crate.body.reset(this.crateStart.x, this.crateStart.y);
    this.crate.body.setVelocity(0, 0);
    if (this.crateSwitchActive) {
      this.crateSwitchActive = false;
      this.crateSwitch.setFrame(148).setY(CRATE_PUZZLE.floorSwitch.feet);
      this.cratePlatformArt.forEach(a => a.setAlpha(.3));
      this.deactivateCratePlatform();
    }
    if (!reducedMotion) this.dustBurst(this.crateStart.x, this.crateStart.y + 24, 4);
    SFX.ui(audio);
    announce(auto ? 'Kotak kembali ke tempat asal.' : 'Kotak di-reset.');
  }
  // V8 Phase 7 (audits/level-v8/phase7/): three small optional discovery
  // markers. Always created (so an undiscovered one has its "come find me"
  // clue), but a secret already in this.discoveredSecrets (set in create(),
  // before this runs) gets no idle motion — it reads as a settled, found
  // detail rather than something still inviting interaction.
  buildSecrets() { buildSecretMarkers(this); }
  setStep(step) {
    if(this.step===step) return;
    this.step=step;
    document.querySelectorAll('[data-step]').forEach((node,i)=>{
      node.classList.toggle('done',i<step); node.removeAttribute('aria-current');
      if(i===step) node.setAttribute('aria-current','step');
    });
    // A brief on-screen toast instead of a permanent world-space label over
    // each building — the zone name only needs to be read once, on arrival.
    if(step<0) return;
    const toast=$('zone-toast');
    toast.textContent=ZONES[step].name;
    clearTimeout(this.zoneToastTimer);
    document.querySelector('.game-frame')?.classList.add('zone-announcing');
    toast.classList.add('show');
    this.zoneToastTimer=setTimeout(()=>{toast.classList.remove('show');document.querySelector('.game-frame')?.classList.remove('zone-announcing');},2600);
  }
  // V7: zones can now stack (C sits directly above B, E above D — same
  // x-range, different tier) since the world is genuinely vertical, not
  // just horizontal. A zone with a `yMax` only matches when the player is
  // at or above that height; among all x/y-matching zones, the LAST one
  // in ZONES wins (stacked zones are listed with the higher/later one
  // after its base, e.g. C after B), so this picks the more specific match.
  currentZoneIndex() {
    let best = -1;
    ZONES.forEach((z, i) => {
      if (this.player.x >= z.xStart && this.player.x < z.xEnd && (z.yMax === undefined || this.player.y <= z.yMax)) best = i;
    });
    return best === -1 ? 0 : best;
  }
  // V8.7 Phase C (audits/level-v8/phase8-7/camera-ab/): a real-browser A/B
  // measurement across desktop/short-wide-laptop/mobile-landscape at zoom
  // 1.0/1.2/1.3 found the player sprite rendering meaningfully smaller in
  // actual screen pixels whenever the game frame's CSS height falls below
  // the fixed logical canvas height (700) — Scale.FIT then shrinks the
  // whole render uniformly to fit. Camera zoom partially compensates by
  // capturing a tighter view before that shrink happens. Desktop's own
  // frame is already >=700px tall in every viewport tested (no shrink),
  // so it keeps zoom 1 — maximum jump lookahead, already comfortably
  // readable. Short-wide-laptop/mobile-landscape shrink heavily and read
  // noticeably better at the highest tested zoom (1.3), while STILL
  // showing more world width than desktop's own 1.0 baseline (no jump
  // lookahead was impaired) — not the same zoom blindly applied
  // everywhere, and not a zoom beyond what was actually measured.
  applyResponsiveZoom() {
    const frameH = document.querySelector('.game-frame')?.clientHeight || 700;
    this.cameras.main.setZoom(frameH < 650 ? 1.3 : 1);
  }
  // V8 Phase 6: reads whatever save currently exists on disk and toggles
  // the welcome screen's own buttons accordingly — never auto-applies it to
  // the scene (that only happens if/when the player clicks Continue).
  refreshMenu() {
    const save = SaveManager.load();
    this.pendingSave = save;
    $('start').hidden = !!save;
    $('continue-btn').hidden = !save;
    $('new-adventure').hidden = !save;
    if (!save) { $('save-status').hidden = true; return; }
    $('continue-btn').textContent = save.completed ? 'Lihat Pencapaian' : 'Sambung Permainan';
    $('save-status').hidden = false;
    $('save-status').textContent = save.completed
      ? 'Level 1 telah diselesaikan sebelum ini.'
      : `Kemajuan disimpan · checkpoint ${CHECKPOINTS.findIndex(c => c.id === save.checkpointId) + 1 || 0}, ${GATES.filter(g=>save.solvedGateIds.includes(g.id)).length}/${GATES.length} lintasan.`;
  }
  // V8 Phase 8: the Level Select screen's one real card (Level 1). Reads
  // the SAME save SaveManager.load() always has — no second source of
  // truth, no cached/stale status — so it's safe to call every time the
  // dialog opens, not just once at create().
  renderLevelSelect() {
    const save = SaveManager.load();
    let status, actionLabel;
    if (!save) { status = 'Belum mula'; actionLabel = 'Mula'; }
    else if (save.completed) { status = 'Selesai'; actionLabel = 'Lihat Pencapaian'; }
    else { status = 'Dalam perjalanan'; actionLabel = 'Teruskan'; }
    $('level1-status').textContent = status;
    $('level1-action').textContent = actionLabel;
    if (save) {
      $('level1-summary').hidden = false;
      $('level1-summary').textContent = `${GATES.filter(g=>save.solvedGateIds.includes(g.id)).length}/${GATES.length} lintasan · ${save.collectedCoinIds.length}/${COLLECTIBLES.length} koleksi · ${save.discoveredSecretIds.length}/${SECRETS.length} rahsia`;
    } else {
      $('level1-summary').hidden = true;
    }
  }
  // V8 Phase 8: used by both the complete dialog's "Menu Utama" button and
  // (indirectly) by nothing else yet — returns to the main menu WITHOUT
  // touching the save (finish() already wrote it before this is ever
  // reachable). Physics is already paused ('complete' mode pauses it the
  // same way 'welcome' does at boot), so no extra pause/resume call here.
  returnToMenu() {
    $('paused').close();$('mechanism').hidden=true;this.activePuzzle=null;
    this.physics.world.pause();clearControls();this.input.keyboard.enabled=false;
    this.tweens.resumeAll();this.time.paused=false;audio.resume();
    $('complete').close();
    this.mode = 'welcome';
    document.body.classList.remove('game-active');
    this.refreshMenu(); this.renderSecretsUI();
    $('welcome').hidden = false; $('pause').disabled = true; $('touch-controls').hidden = true;
    document.body.classList.add('menu-active');
    // A fresh title scene cancels in-flight mechanisms; their saved solved
    // state is restored safely only when Continue is chosen.
    this.tweens.killAll();this.time.removeAllEvents();
    this.game.registry.set('replay',false);this.scene.restart();
  }
  // Rebuilt fresh from the scene's own authoritative state every time —
  // never a partial merge onto whatever was saved before, so a save can
  // never end up mixing state from two different moments.
  nearestSecret() {
    return SECRETS.find(s => !s.puzzleTerminal && !this.discoveredSecrets.has(s.id)
      && Math.abs(this.player.x - s.x) < s.radius && Math.abs(this.player.body.bottom - s.feet) < 48);
  }
  // Awards exactly once per id, ever (this.discoveredSecrets only grows,
  // never shrinks except via the explicit, confirmed "Mula petualangan
  // baharu" wipe) — reuses Phase 3's particle helpers and Phase 4's SFX,
  // no new effect/audio system.
  discoverSecret(id) {
    if (this.discoveredSecrets.has(id)) return;
    const secret = SECRETS.find(s => s.id === id);
    if (!secret) return;
    this.discoveredSecrets.add(id);
    if(id==='f-inverse'){const gem=this.collectibles.find(c=>c.getData('id')==='f-cave-gem');if(gem?.body){gem.body.enable=true;gem.refreshBody();}}
    this.writeSave();
    this.tweens.killTweensOf(this.secretMarkers[id]);
    this.pulseRing(secret.x, secret.feet - 30, 0xc9a227);
    this.sparkleBurst(secret.x, secret.feet - 30, 8, id === 'secret-cave-treasure' ? 0xd7b84a : 0x8a8fd6);
    (id === 'secret-cave-treasure' ? SFX.coin : SFX.checkpoint)(audio);
    announce(secret.foundText);
    this.renderSecretsUI();
  }
  // Secret B only — reuses the existing dialog pattern (showModal/close,
  // keyboard-disable, physics-pause) the puzzle/pause dialogs already use.
  // mode='note' makes update() no-op exactly like 'puzzle'/'paused' already
  // do (its only check is `mode!=='playing'`).
  openSecretNote(secret) {
    if (this.mode !== 'playing') return;
    this.mode = 'note'; this.physics.world.pause(); clearControls();
    this.input.keyboard.enabled = false;
    $('secret-note-title').textContent = secret.title;
    $('secret-note-body').textContent = secret.noteText;
    $('secret-note').showModal();
    this.discoverSecret(secret.id);
  }
  closeSecretNote() {
    $('secret-note').close(); this.input.keyboard.enabled = true; this.mode = 'playing';
    clearControls(); this.physics.world.resume(); $('game').focus({ preventScroll: true });
  }
  // V8 Phase 7: the pause menu's small collection section. Never reveals an
  // undiscovered secret's title/description/location — only a generic
  // "not yet found" line — and reads every string either from the static
  // SECRETS table (never from localStorage) or as a plain count, so no
  // saved value is ever inserted as HTML.
  renderSecretsUI() {
    $('secrets-count').textContent = `${this.discoveredSecrets.size}/${SECRETS.length}`;
    $('secrets-list').innerHTML = '';
    for (const s of SECRETS) {
      const li = document.createElement('li');
      if (this.discoveredSecrets.has(s.id)) { li.textContent = `${s.title} — ${s.description}`; }
      else { li.textContent = 'Rahsia belum ditemui.'; li.classList.add('locked'); }
      $('secrets-list').append(li);
    }
  }
  startRun() {
    $('game').inert=false;
    this.visual.setVisible(true);
    this.cameras.main.startFollow(this.player,true,reducedMotion?1:.14,reducedMotion?1:.16,-85,10);
    this.mode='playing';this.input.keyboard.enabled=true;this.physics.world.resume();clearControls();
    document.body.classList.add('game-active');
    document.body.classList.remove('menu-active');
    this.setStep(this.currentZoneIndex());
    $('welcome').hidden=true;$('pause').disabled=false;
    $('touch-controls').hidden=!touchDevice;
    $('game').focus({preventScroll:true});
    $('status').textContent='Pengembaraan bermula. Cara Main tersedia dalam menu Jeda.';
  }
  pauseRun() {
    if(!['playing','mechanism','mechanism-transition'].includes(this.mode)) return;
    this.resumeMode=this.mode; this.mode='paused';this.physics.world.pause();clearControls();
    $('restart-checkpoint').disabled=this.resumeMode!=='playing';
    this.input.keyboard.enabled=false;
    // V8 Phase 7: refresh the collection section every time pause opens —
    // cheap, and guarantees it's current even though discoverSecret()/
    // create() already keep it up to date on their own.
    this.renderSecretsUI();
    $('paused').showModal();
    // V8 Phase 3.1: reuse Phaser's own TweenManager/Clock pause — the
    // exact mechanism every effect in this file already runs on (dust,
    // sparkle cleanup, squash/stretch, the bridge-reveal fade, the coin
    // bob, the checkpoint/machine pulses), so this is one line pausing
    // all of them at once, not a second tracking system. Does NOT touch
    // puzzle mode (openPuzzle()/closePuzzle() never call this) — a solved-
    // machine's pop/pulse should keep playing while the player reads the
    // correct-answer message, since that isn't "the game is paused".
    this.tweens.pauseAll();this.time.paused=true;
    // V8 Phase 4: AudioContext.suspend() — the Web Audio API's own native
    // pause, freezing every in-flight oscillator envelope's time
    // progression exactly like the tween/time pause above. Does not undo
    // or replace that fix, just extends the same reasoning to audio.
    audio.pause();
  }
  resumeRun() {
    $('game').inert=false;
    $('paused').close();this.mode=this.resumeMode||'playing';this.input.keyboard.enabled=this.mode==='playing';
    clearControls();
    if(this.mode==='playing'){this.physics.world.resume();$('game').focus({preventScroll:true});}
    else if(this.mode==='mechanism')$('mechanism').focus({preventScroll:true});
    this.tweens.resumeAll();this.time.paused=false;
    audio.resume();
  }
  respawn() {
    const point=CHECKPOINTS[this.checkpointIndex]||SPAWN;
    this.climbing=null;this.player.body.setAllowGravity(true);
    this.player.body.reset(point.x,point.feet-MOTION.bodyHeight/2-2);
    clearControls();this.groundedAt=-1000;this.jumpAt=-1000;
    this.syncVisual();
    // Checkpoint recovery always faces the player back toward progress,
    // regardless of which way they were facing when they fell.
    this.visual.setFlipX(true);this.visual.play('idle',true);
    // V8 Phase 2: a respawn can interrupt a landing squash-stretch tween
    // mid-flight (e.g. falling into the void) — cancel it and snap back to
    // the base scale so the character never reappears visibly squashed.
    this.tweens.killTweensOf(this.visual);this.visual.setScale(BASE_SCALE);
    this.lastAnim='idle';this.lastGrounded=true;
    this.cameras.main.centerOn(this.player.x+85,this.player.y-60);
    announce(this.checkpointIndex>=0?'Kembali ke checkpoint. Semua mesin yang sudah diselesaikan kekal terbuka.':'Kembali ke rumah. Cuba lagi — tiada nyawa yang hilang.');
  }
  dustBurst(x, y, count = 5) {
    if (reducedMotion) return;
    const emitter = this.add.particles(x, y, 'fx-dot', {
      speed: { min: 30, max: 95 }, angle: { min: 200, max: 340 },
      scale: { start: .55, end: 0 }, alpha: { start: .5, end: 0 },
      tint: 0x9a9a92, lifespan: 380, quantity: count, emitting: false,
    }).setDepth(21);
    emitter.explode(count);
    this.time.delayedCall(480, () => emitter.destroy());
  }
  sparkleBurst(x, y, count = 8, tint = 0xd7b84a) {
    if (reducedMotion) return;
    const emitter = this.add.particles(x, y, 'fx-dot', {
      speed: { min: 40, max: 110 }, angle: { min: 0, max: 360 },
      scale: { start: .6, end: 0 }, alpha: { start: .9, end: 0 },
      tint, lifespan: 420, quantity: count, emitting: false,
    }).setDepth(21);
    emitter.explode(count);
    this.time.delayedCall(520, () => emitter.destroy());
  }
  pulseRing(x, y, color = 0x1b5e20) {
    if (reducedMotion) return;
    // alpha tweens the whole shape (fill+stroke) uniformly — no need to
    // touch strokeStyle per-frame.
    const ring = this.add.circle(x, y, 14, color, 0).setStrokeStyle(3, color, .9).setDepth(21);
    this.tweens.add({ targets: ring, radius: 34, alpha: 0, duration: 420, ease: 'Sine.out', onComplete: () => ring.destroy() });
  }
  floatingText(x, y, text) {
    if (reducedMotion) return;
    const t = this.add.text(x, y, text, { fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '15px', fontStyle: 'bold', color:'#fff8e6', backgroundColor:'#253a34', padding:{x:6,y:4}, stroke:'#253a34', strokeThickness:3 }).setOrigin(.5, 1).setDepth(22);
    this.tweens.add({ targets: t, y: y - 26, alpha: 0, duration: 650, ease: 'Sine.out', onComplete: () => t.destroy() });
  }
  syncVisual() { this.visual.setPosition(this.player.x,this.player.body.bottom); }
  update(time,delta) {
    syncPresentation(this);
    if(this.mode==='mechanism'||this.mode==='mechanism-transition') { this.elapsed+=delta; this.syncVisual(); return; }
    if(fatal||!this.player||this.mode!=='playing') return;
    this.elapsed+=delta;
    updateMovingPlatform(this,delta);
    const body=this.player.body;
    const key=this.keys;
    const left=key.left.isDown||key.a.isDown||controls.left;
    const right=key.right.isDown||key.d.isDown||controls.right;
    const up=key.up.isDown||key.w.isDown||controls.up;
    const down=key.down.isDown||key.s.isDown||controls.down;
    const jump=Phaser.Input.Keyboard.JustDown(key.jump)||controls.jump;
    const interact=Phaser.Input.Keyboard.JustDown(key.interact)||controls.interact;
    controls.jump=false;controls.interact=false;
    if(Phaser.Input.Keyboard.JustDown(key.restart)||controls.restart) {controls.restart=false;this.respawn();return;}
    if(Phaser.Input.Keyboard.JustDown(key.resetCrate)||controls.resetCrate) {controls.resetCrate=false;this.resetCrate(false);}
    if(jump) this.jumpAt=time;
    if(body.blocked.down||body.touching.down) this.groundedAt=time;
    const nearby=this.ladderZones.find(zone=>this.physics.overlap(this.player,zone)&&Math.abs(this.player.x-zone.x)<34)?.getData('ladder');
    if(!this.climbing&&nearby&&time>this.climbLockUntil&&(up||down)) {
      if((up&&body.bottom>nearby.top+2)||(down&&body.bottom<nearby.bottom-2)) {
        this.climbing=nearby;body.setAllowGravity(false);body.setVelocity(0,0);
        body.reset(nearby.x,this.player.y);
      }
    }
    if(this.climbing) {
      const ladder=this.climbing;
      body.setVelocity(0,(down?1:0)-(up?1:0)); body.velocity.y*=MOTION.climb;
      if(jump) {
        this.climbing=null;this.climbLockUntil=time+250;body.setAllowGravity(true);
        body.setVelocity((right?1:left?-1:0)*MOTION.speed,-MOTION.jump);this.jumpAt=-1000;
        this.dustBurst(this.player.x,body.bottom,4);SFX.jump(audio);
      } else if(body.bottom<=ladder.top && up) {
        body.reset(ladder.x,ladder.top-MOTION.bodyHeight/2-1);
        this.climbing=null;body.setAllowGravity(true);body.setVelocity(0,0);this.climbLockUntil=time+180;
      } else if(body.bottom>=ladder.bottom && down) {
        body.reset(ladder.x,ladder.bottom-MOTION.bodyHeight/2-1);
        this.climbing=null;body.setAllowGravity(true);body.setVelocity(0,0);this.climbLockUntil=time+180;
      }
    } else {
      const direction=(right?1:0)-(left?1:0);
      const target=direction*MOTION.speed;
      const change=(direction?MOTION.acceleration:MOTION.braking)*Math.min(delta,40)/1000;
      body.setVelocityX(body.velocity.x+Phaser.Math.Clamp(target-body.velocity.x,-change,change));
      if(time-this.jumpAt<MOTION.buffer&&time-this.groundedAt<MOTION.coyote) {
        body.setVelocityY(-MOTION.jump);this.jumpAt=-1000;this.groundedAt=-1000;
        // V8 Phase 3: dust exactly at the moment the impulse is applied,
        // not merely when the 'jump' animation flag turns on — this line
        // only ever runs once per real jump, since jumpAt is immediately
        // reset to -1000 right after, so it can't re-trigger next frame.
        this.dustBurst(this.player.x,body.bottom,5);SFX.jump(audio);
      }
    }
    // V8 Phase 2 fix: the original `vy>60?'fall':...'run':'idle'` left a
    // dead zone (-35 <= vy <= 60) where the character is airborne but
    // shows neither jump nor fall — confirmed live (Playwright, frame-by-
    // frame velocity logging) to produce a one-to-three-frame flash of the
    // STANDING idle pose at the apex of every jump, and a "running in
    // midair" flash for a couple of frames after walking off any ledge
    // (the earliest part of an ordinary fall, before gravity has built vy
    // past 60). Fix: once airborne (not grounded, not climbing), the only
    // choice is jump (still rising, vy<-35, unchanged threshold/feel) or
    // fall (everything else airborne) — run/idle are grounded-only states.
    const grounded=body.blocked.down||body.touching.down;
    let anim=this.climbing?'idle':body.velocity.y<-35?'jump':!grounded?'fall':Math.abs(body.velocity.x)>20?'run':'idle';
    if(reducedMotion) this.visual.setTexture(`${anim}-00`);
    else this.visual.play(anim,true);
    this.visual.setOrigin(346/659,(anim==='jump'?463:anim==='fall'?461:525)/626);
    // Source frames (idle/run/jump/fall) are drawn facing left by default;
    // flip only when moving right so the sprite always faces its travel
    // direction instead of walking backward. Idle keeps whatever facing it
    // last had (velocity.x===0 skips the flip call entirely below).
    if(body.velocity.x!==0) this.visual.setFlipX(body.velocity.x>0);
    // V8 Phase 2: subtle sprite-only squash/stretch on takeoff and landing
    // — scales only this.visual (the animated sprite), never the physics
    // body/collider, so timing and collision are untouched. Skipped
    // entirely under prefers-reduced-motion, consistent with every other
    // motion effect in this file (camera lerp, bridge reveal).
    if(!reducedMotion) {
      if(anim==='jump'&&this.lastAnim!=='jump') {
        this.tweens.killTweensOf(this.visual);
        this.visual.setScale(BASE_SCALE*.88,BASE_SCALE*1.14);
        this.tweens.add({targets:this.visual,scaleX:BASE_SCALE,scaleY:BASE_SCALE,duration:160,ease:'Sine.out'});
      } else if(grounded&&!this.lastGrounded&&!this.climbing) {
        this.tweens.killTweensOf(this.visual);
        this.visual.setScale(BASE_SCALE*1.16,BASE_SCALE*.82);
        this.tweens.add({targets:this.visual,scaleX:BASE_SCALE,scaleY:BASE_SCALE,duration:130,ease:'Sine.out'});
        // V8 Phase 3: landing dust, reusing this EXACT same already-proven
        // single-fire edge (grounded&&!lastGrounded&&!climbing) as the
        // Phase 2 squash — no separate detection logic, no risk of firing
        // on every grounded frame. Scaled modestly by impact speed
        // (this.lastVy, captured below before being overwritten): a light
        // step-off landing (~small vy) gives a faint 2-particle puff, a
        // hard fall from height (vy approaching the 850 velocity cap)
        // gives a fuller 8-particle burst.
        const impact=Math.min(1,this.lastVy/700);
        this.dustBurst(this.player.x,this.player.body.bottom,Math.round(2+impact*6));
        SFX.land(audio,impact);
      }
    }
    this.lastAnim=anim;this.lastGrounded=grounded;this.lastVy=body.velocity.y;
    this.syncVisual();
    for(const coin of this.collectibles) {
      if(coin.active && this.physics.overlap(this.player,coin)) {
        // coin.active flips false the instant destroy() runs, so this
        // overlap check can never fire twice for the same coin — the
        // effects below inherit that same single-fire guarantee for free.
        const cx=coin.x,cy=coin.y,coinId=coin.getData('id');
        coin.destroy();this.coinsFound++;
        // V8 Phase 6: a collected coin is a "persistent collectible" per
        // the brief — autosaved immediately, same rule as a solved machine.
        this.collectedCoinIds.add(coinId);this.writeSave();
        $('coin-count').textContent=`Koleksi: ${this.coinsFound}`;
        announce('Koleksi dijumpai! Teruskan meneroka.');
        this.sparkleBurst(cx,cy,7);
        this.floatingText(cx,cy-14,'+1');
        SFX.coin(audio);
      }
    }
    // V9 Phase 1 (audits/level-v9/phase1-prototype/): the crate puzzle.
    // Entirely optional, entirely isolated from the mandatory-route logic
    // below it.
    if (this.crate) {
      const cb = this.crate.body;
      const crateGrounded = cb.blocked.down || cb.touching.down;
      if (crateGrounded) {
        // Standard solid collider (this.physics.add.collider(this.crate,
        // this.solids) in buildCratePuzzle()) already guarantees the
        // player can never tunnel through the crate regardless of speed;
        // Arcade sets body.touching.left/right on the PLAYER the instant
        // that collider resolves contact, so "pushing" is just: player is
        // pressed against the crate AND holding the key that points INTO
        // it. Works identically from both sides.
        // touching also includes terrain contacts. Require the crate itself
        // to be adjacent: a distant wall must never drive this body's speed.
        const overlapY = Math.min(body.bottom, cb.bottom) - Math.max(body.top, cb.top);
        const pushRight = body.touching.right && Math.abs(body.right - cb.left) < 8;
        const pushLeft = body.touching.left && Math.abs(body.left - cb.right) < 8;
        if (right && pushRight && overlapY > 4) cb.setVelocityX(MOTION.speed * .6);
        else if (left && pushLeft && overlapY > 4) cb.setVelocityX(-MOTION.speed * .6);
        else cb.setVelocityX(0);
      }
      this.crateArt.setPosition(this.crate.x, this.crate.y + 24);
      // Auto-recovery: verified against this crate's OWN placement (Zone
      // A's ground tier, y=1100 — see CRATE_PUZZLE's comment in level.js)
      // that the player's existing 1160 fall threshold is the correct
      // value here too, not assumed from a different tier's geometry.
      if (this.crate.y > 1440) this.resetCrate(true);
      // Switch activation requires BOTH: grounded (not merely overlapping
      // while falling past) AND within the switch's own x-footprint — a
      // side-on contact while the crate is still elsewhere on the ground
      // can never satisfy both at once.
      const onSwitch = crateGrounded && Math.abs(this.crate.x - CRATE_PUZZLE.floorSwitch.x) < CRATE_PUZZLE.floorSwitch.radius;
      if (onSwitch && !this.crateSwitchActive) {
        this.crateSwitchActive = true;
        // V9.1: "pressed" is a flatten + darken of the SAME pressure-plate
        // tile, not a texture swap — reads as "pushed down into the
        // ground" the way a real plate would.
        this.crateSwitch.setFrame(149).setY(CRATE_PUZZLE.floorSwitch.feet);
        this.cratePlatformArt.forEach(a => a.setAlpha(1));
        if (!this.cratePlatformBody) this.cratePlatformBody = this.platform(CRATE_PUZZLE.platform);
        this.pulseRing(CRATE_PUZZLE.floorSwitch.x, CRATE_PUZZLE.floorSwitch.feet - 30, 0xc9a227);
        SFX.machine(audio);
        this.time.delayedCall(150, () => { if (!audio.isPaused()) SFX.bridge(audio); });
        if (!reducedMotion) this.tweens.add({ targets: this.cratePlatformArt, alpha: { from: .3, to: 1 }, duration: 350, delay: this.tweens.stagger(20) });
      } else if (!onSwitch && this.crateSwitchActive) {
        // Real, reversible mechanism (brief: "a real gameplay state
        // change, not just a decorative animation") — pulling the crate
        // back off the switch retracts the platform's collision body,
        // exactly like a pressure plate.
        this.crateSwitchActive = false;
        this.crateSwitch.setFrame(148).setY(CRATE_PUZZLE.floorSwitch.feet);
        this.cratePlatformArt.forEach(a => a.setAlpha(.3));
        this.deactivateCratePlatform();
      }
      // V9.1: one-time, session-only discovery cue for reaching the
      // otherwise-unreachable ledge — reuses the exact same particle/SFX
      // language as every other discovery in this game, but deliberately
      // NOT saved/tracked as a collectible (see crate-puzzle-purpose-and-
      // reachability.md for why no new collectible was added this pass).
      if (!this.crateLedgeDiscovered) {
        const plat = CRATE_PUZZLE.platform;
        const onLedge = body.blocked.down && Math.abs(body.bottom - plat.y) < 4 && this.player.x > plat.x && this.player.x < plat.x + plat.width;
        if (onLedge) {
          this.crateLedgeDiscovered = true;
          this.sparkleBurst(this.player.x, plat.y - 20, 8, 0x8a8fd6);
          SFX.checkpoint(audio);
        }
      }
    }
    // V7: gates now sit at three different tiers (y=980/660/1100), so the
    // early-trigger check must be relative to EACH gate's own y, not one
    // hardcoded value — a player standing inside an unsolved gate's gap has
    // no ground there by construction, so this only controls how soon the
    // respawn fires, not whether it's needed.
    const inOpenGate = GATES.some(g => !this.solvedGates.has(g.id) && this.player.x>g.x && this.player.x<g.x+g.width && body.bottom>g.y+100);
    // The absolute "fell out of the world" threshold is the lowest tier
    // (ground, y=1100) plus the same 60px margin V6 used relative to its
    // own single ground height.
    if(this.player.y>1510 || inOpenGate || (BUILD_STAGE>=4&&this.player.x>7506&&this.player.x<7830&&body.bottom>1072)) {this.respawn();return;}
    const cpIndex=CHECKPOINTS.findIndex(cp=>Math.abs(this.player.x-cp.x)<48 && Math.abs(body.bottom-cp.feet)<5 && body.blocked.down && (!cp.requires || cp.requires.every(id=>this.solvedGates.has(id))));
    if(cpIndex>=0 && cpIndex!==this.checkpointIndex) {
      this.checkpointIndex=cpIndex;
      this.checkpointArts[cpIndex].setFrame(112);
      $('checkpoint-state').textContent='Checkpoint disimpan';
      notify('Checkpoint disimpan',2);
      SFX.checkpoint(audio);this.writeSave();
    }
    this.setStep(this.currentZoneIndex());
    const terminal=this.nearestTerminal();
    const secret=this.nearestSecret();
    const near=(x,d=190)=>Math.abs(this.player.x-x)<d;
    // V8 Phase 3: readiness cue. The ring's visibility/position is plain
    // state (not motion) — shown the instant a terminal is in range,
    // regardless of reducedMotion, so the cue itself is never lost under
    // reduced-motion; only the gentle pulse brightness animation is
    // skipped, matching "all feedback must remain understandable without
    // particles/motion" (the lever's own idle/active texture swap already
    // carries the solved-state meaning unconditionally).
    // V8.7: the SAME glow cue now also marks a nearby undiscovered secret
    // (previously machines only) — one consistent highlight treatment for
    // every interactable object, per the brief's "use a consistent
    // outline or highlight treatment for objects that can be interacted
    // with", instead of machines getting a glow and secrets getting none.
    // V8.7 Phase E: the exit is only a real prompt once every gate is
    // solved AND the player is at the goal's own position — identical
    // condition to the one that used to auto-trigger finish() directly.
    const required=['lift','number-span','water-crossing','river-input','river-composition','river-crossing'];
    const atExit = BUILD_STAGE>=4 && required.every(id=>this.solvedGates.has(id)) && Math.abs(this.player.x-GOAL.x)<62 && Math.abs(body.bottom-GOAL.feet)<6 && body.blocked.down;
    if(terminal || secret || atExit) {
      const cue = terminal || secret || {x:GOAL.x,feet:GOAL.feet};
      this.machineGlow.setPosition(cue.x,cue.feet-70).setVisible(true);
      this.machineGlow.setAlpha(reducedMotion?.4:.28+.18*Math.sin(time/260));
    } else this.machineGlow.setVisible(false);
    this.prompt.setVisible(!!terminal || !!secret || atExit || (!!nearby&&!this.climbing));
    // V8 Phase 7: a generic "E · Teroka" (Explore) for any undiscovered
    // secret — deliberately not naming which one, so the prompt itself
    // never spoils what's there; the environmental marker is the clue.
    if(terminal) {
      const action=terminal.kind==='water-stage'?`Tetapkan ${terminal.stage.toUpperCase()} dahulu`:terminal.kind==='water-activate'?'Jalankan air':'Guna';
      this.prompt.setText(touchDevice?`Guna · ${action}`:`E · ${action}`).setPosition(terminal.x,terminal.feet-112);
    }
    else if(secret) this.prompt.setText(touchDevice?'Guna':'E').setPosition(secret.x,secret.feet-90);
    else if(atExit) this.prompt.setText(touchDevice?'Guna':'E').setPosition(GOAL.x,GOAL.feet-134);
    else if(nearby&&!this.climbing) this.prompt.setText(touchDevice?'↑ ↓':'W / S').setPosition(nearby.x,this.player.body.top-20);
    if(interact) {
      if (secret) { if (secret.note) this.openSecretNote(secret); else this.discoverSecret(secret.id); }
      else if (atExit) this.finish();
      else if(terminal?.kind==='water-stage'||terminal?.kind==='water-activate')this.interactWaterworks(terminal);
      else this.openPuzzle();
    }
  }
}

Object.assign(Rooftop.prototype,createMechanismMethods({$,clearControls,audio,SFX,reducedMotion,touchDevice,announce}));
$('dial-less').onclick=()=>activeScene?.changeDial(-1);
$('dial-more').onclick=()=>activeScene?.changeDial(1);
$('dial-test').onclick=()=>activeScene?.testDial();
$('dial-hint').onclick=()=>explain(activeScene);
$('dial-preview').onclick=()=>activeScene?.previewRoute();
for(const b of document.querySelectorAll('[data-token]'))b.onclick=()=>activeScene?.chooseToken(Number(b.dataset.token));
for(const b of document.querySelectorAll('[data-order]'))b.onclick=()=>activeScene?.chooseOrder(b.dataset.order==='gf');
$('dial-close').onclick=()=>activeScene?.closePuzzle();
$('import-v9').onclick=()=>{ if(SaveManager.importLegacy()) { activeScene.refreshMenu(); $('import-v9').hidden=true; announce('Kemajuan serasi disalin. Save V9 tidak berubah.'); } };
document.addEventListener('keydown',event=>{
 if(activeScene?.mode!=='mechanism'||event.repeat) return;
 if(event.target.closest?.('button,input,summary')&&!['KeyE','KeyH'].includes(event.code))return;
 if(['ArrowLeft','KeyA','ArrowRight','KeyD','Enter','KeyE','KeyH'].includes(event.code)) event.preventDefault();
 if(event.code==='ArrowLeft'||event.code==='KeyA') activeScene.changeDial(-1);
 if(event.code==='ArrowRight'||event.code==='KeyD') activeScene.changeDial(1);
 if(event.code==='Enter'||event.code==='KeyE') activeScene.testDial();
 if(event.code==='KeyH') explain(activeScene);
});
function restart() {
  // V8 Phase 6: shared by both "Mula semula" (pause menu, Restart Current
  // Run) and "Main semula" (complete dialog, Replay Completed Level) — both
  // reset the CURRENT in-memory run, so both get the same confirmation
  // gate. This never touches the persisted save file (SaveManager.clear()
  // is only ever called from "Mula petualangan baharu" below), so the
  // confirm message can truthfully promise the saved checkpoint survives.
  if (!confirm('Mula semula larian ini dari awal? Checkpoint yang disimpan tidak akan terjejas.')) return;
  ['complete','paused','puzzle'].forEach(id=>$(id).close());
  clearControls();activeScene.game.registry.set('replay',true);activeScene.scene.restart();
}
// V8 Phase 4: the canonical first user gesture in this game — AudioContext
// creation/resume MUST happen inside a real interaction handler (browser
// autoplay policy), never eagerly on page load. unlock() is safe to call
// every time (a no-op re-resume if already created), so no extra "have we
// unlocked yet" flag is needed here.
$('start').addEventListener('click',()=>{audio.unlock();SFX.ui(audio);activeScene?.startRun();});
// V8 Phase 6: Continue / Start New Adventure, shown on the welcome screen
// instead of (or alongside) the plain Start button — see refreshMenu().
$('continue-btn').addEventListener('click',()=>{audio.unlock();SFX.ui(audio);activeScene?.continueFromSave();});
$('new-adventure').addEventListener('click',()=>{
  // Only a save that actually exists needs confirming away — nothing to
  // lose if refreshMenu() never found one (the button would be hidden in
  // that case anyway, but this guard keeps the handler correct on its own).
  if (activeScene?.pendingSave && !confirm('Mula petualangan baharu akan memadam kemajuan yang disimpan. Teruskan?')) return;
  SaveManager.clear();
  // V8 Phase 7: discoveredSecrets was loaded unconditionally in create()
  // (before the player ever clicked anything), unlike solvedGates/
  // checkpointIndex/collectedCoinIds which only ever get populated via an
  // explicit continueFromSave() call — so, unlike those, it needs an
  // explicit reset here too, or a New Adventure right after an old save
  // existed would keep showing already-found secrets as found.
  if (activeScene) { activeScene.discoveredSecrets = new Set(); activeScene.renderSecretsUI(); }
  audio.unlock();SFX.ui(audio);activeScene?.startRun();
});
$('pause').addEventListener('click',()=>activeScene?.pauseRun());
// Compact audio settings, added to the existing pause dialog rather than a
// new screen. Initialized from AudioManager's own already-loaded
// (localStorage-persisted) values, so re-opening the pause menu — or
// reloading the page entirely — always reflects the last saved settings.
$('audio-mute').checked=audio.muted;
$('audio-master').value=Math.round(audio.masterVolume*100);
$('audio-sfx').value=Math.round(audio.sfxVolume*100);
$('audio-mute').addEventListener('change',e=>audio.setMuted(e.target.checked));
$('audio-master').addEventListener('input',e=>audio.setMasterVolume(e.target.value/100));
$('audio-sfx').addEventListener('input',e=>{audio.setSfxVolume(e.target.value/100);SFX.ui(audio);});
// Fullscreen: the game should be able to use most of the screen, not sit
// in a small fixed column. Feature-detected; hidden entirely where the
// Fullscreen API isn't available rather than showing a button that fails.
const shellEl=document.querySelector('.shell');
if(shellEl.requestFullscreen) {
  $('fullscreen').addEventListener('click',()=>{
    if(document.fullscreenElement) document.exitFullscreen();
    else shellEl.requestFullscreen().catch(()=>{});
  });
  document.addEventListener('fullscreenchange',()=>{
    $('fullscreen').textContent=document.fullscreenElement?'Keluar skrin penuh':'Skrin penuh';
  });
} else {
  $('fullscreen').hidden=true;
}
$('resume').addEventListener('click',()=>activeScene?.resumeRun());
$('restart').addEventListener('click',restart);
$('replay').addEventListener('click',()=>{SFX.ui(audio);restart();});
$('close-puzzle').addEventListener('click',()=>activeScene?.closePuzzle());
$('answer-form').addEventListener('submit',event=>{event.preventDefault();activeScene?.answer($('answer').value);});
$('hint-btn').addEventListener('click',()=>activeScene?.requestHint());
$('puzzle-continue').addEventListener('click',()=>activeScene?.closePuzzle());
$('puzzle').addEventListener('cancel',event=>{event.preventDefault();activeScene?.closePuzzle();});
$('paused').addEventListener('cancel',event=>{event.preventDefault();activeScene?.resumeRun();});
$('complete').addEventListener('cancel',event=>event.preventDefault());
// V8 Phase 7: Secret B's note dialog — same close/cancel pattern as every
// other dialog here.
$('secret-note-close').addEventListener('click',()=>activeScene?.closeSecretNote());
$('secret-note').addEventListener('cancel',event=>{event.preventDefault();activeScene?.closeSecretNote();});
// V8 Phase 8: Settings/Collection/Level Select are standalone overlays —
// openable from the main menu AND from the pause menu (two entry points,
// one shared dialog/function each; never two copies of the same UI/state).
// Physics is already paused in every context these can be opened from
// ('welcome' pauses it at boot, 'paused'/'complete' already paused it) —
// no extra pause/resume calls needed here, unlike the puzzle/note dialogs.
function openSettings() { $('settings').showModal(); }
function openCollection() { activeScene?.renderSecretsUI(); $('collection').showModal(); }
function closeOverlay(id) { $(id).close(); }
$('settings-btn').addEventListener('click',openSettings);
$('pause-settings-btn').addEventListener('click',openSettings);
$('collection-btn').addEventListener('click',openCollection);
$('pause-collection-btn').addEventListener('click',openCollection);
$('settings-close').addEventListener('click',()=>closeOverlay('settings'));
$('collection-close').addEventListener('click',()=>closeOverlay('collection'));
$('settings').addEventListener('cancel',event=>{event.preventDefault();closeOverlay('settings');});
$('collection').addEventListener('cancel',event=>{event.preventDefault();closeOverlay('collection');});
$('level-select-btn').addEventListener('click',()=>{activeScene?.renderLevelSelect();$('level-select').showModal();});
$('level-select-close').addEventListener('click',()=>closeOverlay('level-select'));
$('level-select').addEventListener('cancel',event=>{event.preventDefault();closeOverlay('level-select');});
// Delegates to whichever of #start/#continue-btn is currently the real,
// already-wired primary action — never a second copy of that decision
// logic. refreshMenu() runs first so this is correct even when Level
// Select was opened straight from the complete dialog (a save may have
// just been written by finish() since the menu last refreshed).
$('level1-action').addEventListener('click',()=>{
  activeScene?.refreshMenu();
  $('level-select').close();
  ($('continue-btn').hidden ? $('start') : $('continue-btn')).click();
});
$('complete-level-select').addEventListener('click',()=>{
  activeScene?.renderLevelSelect();
  $('complete').close();
  $('level-select').showModal();
});
$('menu-btn').addEventListener('click',()=>activeScene?.returnToMenu());
// One owner for Escape prevents the native dialog's cancel event and Phaser
// from handling the same key twice (resume followed immediately by pause).
document.addEventListener('keydown',event=>{
  if(event.code!=='Escape'||!activeScene) return;
  event.preventDefault();event.stopImmediatePropagation();
  if(event.repeat) return;
  if($('help').open) { closeOverlay('help'); return; }
  if($('level-select').open) { closeOverlay('level-select'); return; }
  if($('collection').open) { closeOverlay('collection'); return; }
  if($('settings').open) { closeOverlay('settings'); return; }
  if(activeScene.mode==='playing') activeScene.pauseRun();
  else if(activeScene.mode==='mechanism-transition') activeScene.pauseRun();
  else if(activeScene.mode==='paused') activeScene.resumeRun();
  else if(activeScene.mode==='mechanism') activeScene.closePuzzle();
  else if(activeScene.mode==='puzzle') activeScene.closePuzzle();
  else if(activeScene.mode==='note') activeScene.closeSecretNote();
},true);
window.addEventListener('blur',()=>{clearControls();activeScene?.pauseRun();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearControls();activeScene?.pauseRun();}});
for(const button of document.querySelectorAll('[data-hold],[data-action]')) {
  button.addEventListener('pointerdown',event=>{
    event.preventDefault();button.setPointerCapture(event.pointerId);
    if(activeScene?.mode!=='playing') return;
    controls[button.dataset.hold||button.dataset.action]=true;
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(type,()=>{
    if(button.dataset.hold) controls[button.dataset.hold]=false;
  });
  button.addEventListener('contextmenu',event=>event.preventDefault());
}
installPresentation(()=>activeScene);

try {
  if(!window.Phaser) throw new Error('Phaser runtime missing');
  const response=await fetch('assets/manifest.json');
  if(!response.ok) throw new Error('Asset manifest missing');
  const assets=Object.fromEntries(Object.entries(await response.json()).filter(([k])=>k.startsWith('kpp_')||/^(idle|run|jump|fall)-/.test(k)));
  const stage=document.querySelector('.game-stage');
  const frame=document.querySelector('.game-frame');
  // CSS aspect-ratio inside a centering flexbox, with a percentage-sized
  // child (#game is 100%/100%), is a circular sizing dependency that some
  // engines resolve by collapsing the box instead of shrinking it — so the
  // frame's pixel size is computed here instead, from .game-stage's real
  // flex-resolved remaining space (header/footer height already excluded).
  // This is also what keeps the browser page itself from ever scrolling:
  // .game-stage already can't exceed the viewport, so the frame can't either.
  // Game-first layout: the frame fills the ENTIRE available stage, full
  // stop — no fixed 16:9/3:4 ratio forcing it to shrink on a short-but-wide
  // window. A fixed ratio was height-bound on real short desktop windows
  // (confirmed: 807x454 on a 1365x633 viewport, 59% of available width)
  // because the ratio math capped width to match a height the window
  // didn't have room for.
  // `dimensions()` below already computes Phaser's internal resolution from
  // whatever the frame's real aspect ratio turns out to be, so sprites stay
  // uniformly scaled (never stretched) at any ratio — there is nothing a
  // fixed ratio was protecting here.
  function fitFrame() {
    frame.style.width=`${Math.max(1,Math.floor(stage.clientWidth))}px`;
    frame.style.height=`${Math.max(1,Math.floor(stage.clientHeight))}px`;
  }
  fitFrame();
  // V7: logical viewport height raised from 648 to 700 to match the taller
  // world (see the camera bounds derivation in create() for the exact math).
  const dimensions=()=>({width:Math.round(700*frame.clientWidth/frame.clientHeight),height:700});
  const size=dimensions();
  const game=new Phaser.Game({type:Phaser.CANVAS,parent:'game',...size,backgroundColor:'#e8e9e3',
    banner:false,audio:{noAudio:true},render:{antialias:true,roundPixels:true},
    scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
    physics:{default:'arcade',arcade:{gravity:{y:WORLD.gravity},debug:false}},
    callbacks:{preBoot:game=>game.registry.set('assets',assets)},scene:[Rooftop]});
  const observer=new ResizeObserver(()=>{fitFrame();const d=dimensions();game.scale.setGameSize(d.width,d.height);game.scale.refresh();activeScene?.applyResponsiveZoom();});
  observer.observe(stage);
  // V12 deliberately exposes no URL-parameter test hook.
} catch(error) {
  console.error(error);
  fail('Permainan tidak dapat dimulakan. Muat semula halaman atau kembali ke Add Math.');
}
