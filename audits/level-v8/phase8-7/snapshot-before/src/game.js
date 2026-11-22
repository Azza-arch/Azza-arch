import { WORLD, MOTION, SPAWN, GOAL, ZONES, GROUND_RANGES, FIRST_GAP, DECKS, LADDERS, GATES, TERMINALS, CHECKPOINTS, COLLECTIBLES, PUZZLES, SECRETS } from './level.js';
import { audio, SFX } from './audio.js';
import { SaveManager } from './save.js';

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
const DECK_STYLE = { 'f-step1':'rock', 'cave-alcove':'rock', 'f-step2':'rock' };
const touchDevice = matchMedia('(pointer: coarse)').matches;
const controls = { left:false, right:false, up:false, down:false, jump:false, interact:false, restart:false };
let activeScene;
let fatal = false;
function announce(text) { $('status').textContent = text; }
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
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height, true, true, true, false);
    this.solids = this.physics.add.staticGroup();
    this.buildEnvironment();
    // A separate rectangular body means animation transparency never changes collisions.
    this.player = this.add.rectangle(SPAWN.x, SPAWN.feet - MOTION.bodyHeight/2, MOTION.bodyWidth, MOTION.bodyHeight, 0xffffff, 0);
    this.physics.add.existing(this.player);
    this.player.body.setSize(MOTION.bodyWidth, MOTION.bodyHeight).setMaxVelocity(MOTION.speed, 850).setCollideWorldBounds(true);
    this.visual = this.add.sprite(SPAWN.x, SPAWN.feet, 'idle-00').setOrigin(346/659, 525/626).setScale(BASE_SCALE).setDepth(20);
    for (const [key,count,fps] of [['idle',12,8],['run',10,14],['jump',1,1],['fall',1,1]]) {
      if (!this.anims.exists(key)) this.anims.create({ key, frames:Array.from({length:count},(_,i)=>({key:`${key}-${String(i).padStart(2,'0')}`})), frameRate:fps, repeat:-1 });
    }
    this.visual.play('idle');
    this.physics.add.collider(this.player, this.solids, undefined, (_player, platform) => {
      if (this.climbing && platform.getData('oneWay')) return false;
      // Decks are one-way. Solid street geometry is never bypassed.
      if (platform.getData('oneWay')) return this.player.body.velocity.y >= 0 && this.player.body.prev.y + MOTION.bodyHeight <= platform.body.top + 8;
      return true;
    });
    this.keys = this.input.keyboard.addKeys({left:'LEFT',right:'RIGHT',up:'UP',down:'DOWN',a:'A',d:'D',w:'W',s:'S',jump:'SPACE',interact:'E',restart:'R'});
    // Latch even a very short tap between render frames; held keys do not auto-jump.
    for(const action of ['jump','interact','restart']) this.keys[action].on('down',()=>{
      if(this.mode==='playing') controls[action]=true;
    });
    this.input.keyboard.removeCapture(['W','A','S','D','E','R','ESC']);
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
    this.cameras.main.setBounds(0, 450, WORLD.width, WORLD.height - 450);
    this.cameras.main.startFollow(this.player, true, reducedMotion ? 1 : .14, reducedMotion ? 1 : .16, -85, 10);
    this.cameras.main.setBackgroundColor('#e8e9e3');
    this.cameras.main.centerOn(SPAWN.x, SPAWN.feet - 190);
    this.prompt = this.add.text(0,0,'',{fontFamily:'Arial, sans-serif',fontSize:'17px',fontStyle:'bold',color:'#242624',backgroundColor:'#fffefa',padding:{x:12,y:8}}).setOrigin(.5,1).setDepth(40).setVisible(false);
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
    $('pause').disabled = true;
    $('touch-controls').hidden = true;
    $('checkpoint-state').textContent = 'Mula di rumah';
    $('objective').textContent = 'Terokai kejiranan. Cari jalan ke bukit kecil.';
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
    this.setStep(0);
    announce('Ikut jalan ke kanan. Tiga mesin fungsi menanti sepanjang laluan.');
    this.events.once('shutdown', () => { this.input.keyboard.enabled = true; });
    if (this.game.registry.get('replay')) {
      this.game.registry.set('replay', false); this.startRun();
    }
  }
  art(key,x,y,scale=1,depth=4,alpha=1) { return this.add.image(x,y,key).setOrigin(0,1).setScale(scale).setDepth(depth).setAlpha(alpha); }
  label(text,x,y,size=15) {
    return this.add.text(x,y,text,{fontFamily:'Arial, sans-serif',fontSize:`${size}px`,color:'#343831',backgroundColor:'#f9f9f3',padding:{x:9,y:6}}).setOrigin(.5,1).setDepth(12);
  }
  platform(data, oneWay=true) {
    const body = this.add.rectangle(data.x + data.width/2, data.y+8, data.width, 16, 0, 0);
    this.physics.add.existing(body,true); this.solids.add(body);
    body.setData('oneWay',oneWay).setData('id',data.id);
    this.routePlatforms.push(body);
    return body;
  }
  deck(data, supportsOverride) {
    const supports = supportsOverride !== undefined ? supportsOverride : (data.supports !== undefined ? data.supports : true);
    // Collision-visible surface art: Kenney stone tiles only (temporary, see
    // assets/provenance.json). No other visual family mixed in.
    const images=[];
    for(let x=0;x<data.width;x+=32) {
      const key = x===0?'kenney_deck_left':x+32>=data.width?'kenney_deck_right':'kenney_deck_center';
      images.push(this.add.image(data.x+x,data.y,key).setOrigin(0).setScale(.5).setDepth(10));
    }
    if(supports) {
      // Caller-supplied floor: V6's decks all sat directly above the single
      // y=1000 ground, so a hardcoded stop worked. V7's decks sit at many
      // different tiers, several with NO ground below them at all (that's
      // deliberate — see GROUND_RANGES in level.js) — stacking pillars to a
      // hardcoded floor would either run forever or land on the wrong tier.
      const floor = supports === true ? 1100 : supports;
      // V8 Phase 8.5: the old look here was two thin "kenney_block_center"
      // columns at the deck's own corners — exactly the "random tiled
      // pillar" the brief calls out. Replaced with one coherent decorative
      // mass (a building facade for town/workshop decks, a hillside rock
      // face for F's three step decks via DECK_STYLE) spanning the FULL
      // deck width, purely visual — platform()'s own collision body is
      // completely separate and untouched by this.
      if (DECK_STYLE[data.id] === 'rock') this.rockMass(data.x, data.width, data.y, floor);
      else this.buildingFacade(data.x, data.width, data.y, floor);
    }
    return images;
  }
  // V8 Phase 8.5: ONE wall mass spanning a deck's full width, built from
  // h3_wall_upper (top storey) then h3_wall_lower tiles repeated down to
  // the floor — reads as "the building this walkway is the top of",
  // instead of two disconnected stone towers. No physics body (this.add.
  // image only); collision is still exactly platform()'s own rectangle.
  buildingFacade(x, width, surfaceY, floorY) {
    const scale = Phaser.Math.Clamp(width / 300, .68, 1.05);
    const wallW = 224 * scale;
    const cols = Math.max(1, Math.round(width / wallW));
    const colW = width / cols;
    for (let i = 0; i < cols; i++) {
      const left = x + colW * i + (colW - wallW) / 2;
      let y = surfaceY;
      this.art('h3_wall_upper', left, y + 168 * scale, scale, 1.3, .92);
      y += 168 * scale;
      while (y < floorY - 20) {
        this.art('h3_wall_lower', left + 2 * scale, y + 159 * scale, scale, 1.2, .88);
        y += 159 * scale;
      }
    }
  }
  // V8 Phase 8.5: F's three step decks (f-step1/cave-alcove/f-step2) are
  // hillside terrain, not buildings — a restrained Graphics-drawn rock
  // silhouette (grayscale, charcoal outline, matching the established
  // visual identity) stands in for them. Documented limitation (see
  // remaining-art-gaps.md): no dedicated rock/cliff production asset
  // exists in assets/production or assets/kenney, so this is intentionally
  // simple geometry, never claiming to be a detailed painted cliff.
  rockMass(x, width, surfaceY, floorY) {
    const g = this.add.graphics().setDepth(4);
    const left = x + 6, right = x + width - 6;
    const jag = 14;
    g.fillStyle(0xb9bbb4, 1);
    g.lineStyle(3, 0x5c5f58, 1);
    g.beginPath();
    g.moveTo(left, surfaceY);
    for (let y = surfaceY; y < floorY; y += 46) {
      g.lineTo(left + (((y / 46) | 0) % 2 ? jag : -jag), y + 23);
    }
    g.lineTo(left, floorY);
    g.lineTo(right, floorY);
    for (let y = floorY; y > surfaceY; y -= 46) {
      g.lineTo(right - (((y / 46) | 0) % 2 ? jag : -jag), y - 23);
    }
    g.lineTo(right, surfaceY);
    g.closePath();
    g.fillPath(); g.strokePath();
  }
  // V8 Phase 8.5: a dark archway purely behind the existing cave-alcove
  // deck/label — the cave previously had no visual mouth at all, just a
  // text sign. Depth 3.5 keeps it behind every gameplay surface (ground=9,
  // decks=10) and behind rockMass's own depth-4 fill, so it never reads as
  // a collidable opening.
  caveMouth(x, y) {
    const g = this.add.graphics().setDepth(3.5);
    g.fillStyle(0x34362f, 1);
    g.fillEllipse(x, y, 92, 110);
  }
  // V8 Phase 8.5: the final-gate's gap, visually a river until the bridge
  // opens. No water/river production asset exists (documented in
  // remaining-art-gaps.md) — a flat grayscale band with a simple wave
  // pattern, well below the walkable ground surface, stands in for it.
  riverBand(x, width, y) {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0xaeb0a9, .9);
    g.fillRect(x, y, width, 140);
    g.lineStyle(2, 0x9a9c95, .8);
    for (let wy = y + 24; wy < y + 140; wy += 30) {
      g.beginPath();
      for (let wx = x; wx <= x + width; wx += 40) g.lineTo(wx, wy + (((wx / 40) | 0) % 2 ? 6 : -6));
      g.strokePath();
    }
  }
  // V8 Phase 8.5: a locked gate must "clearly look blocked or incomplete"
  // (brief §7). Two broken, angled plank stubs — purely decorative, no
  // physics body — mark every unsolved gate; destroyed the instant that
  // gate's real bridge art/collision is created (see answer() and
  // continueFromSave()), so the game can never show a complete-looking
  // walkable bridge while it is still locked.
  buildGateStubs() {
    this.gateStubs = {};
    for (const g of GATES) {
      this.gateStubs[g.id] = [
        this.art('platform_wood_left', g.x + 6, g.y + 30, 1.15, 9.5, 1).setAngle(-22),
        this.art('platform_wood_right', g.x + g.width - 80, g.y + 30, 1.15, 9.5, 1).setAngle(22),
      ];
    }
  }
  gateArt(data) {
    // A solved gate's walkable surface uses a visually distinct Kenney tile
    // (log planks, not stone) so the activated mechanism reads differently
    // from ordinary ground/deck terrain.
    const images=[];
    for(let x=0;x<data.width;x+=64) images.push(this.add.image(data.x+x,data.y,'kenney_bridge').setOrigin(0).setDepth(10));
    return images;
  }
  spawnCollectibles() {
    for(const def of COLLECTIBLES) {
      const coin=this.physics.add.staticSprite(def.x,def.y,'kenney_coin').setScale(.5).setDepth(14);
      coin.setData('id',def.id);
      this.tweens.add({targets:coin,y:def.y-10,duration:900,yoyo:true,repeat:-1,ease:'Sine.inOut'});
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
  // V8 Phase 8.5 (audits/level-v8/phase8-5/): re-composed zone-by-zone
  // against the LIVE DECKS/GATES/LADDERS/TERMINALS tables (re-verified at
  // the top of this phase, not assumed from history) — every placement
  // below names the exact ladder/machine/gap x it stays clear of. The
  // distant bg() band is the only layer that keeps a strong parallax
  // scrollFactor; mid()/the new facade/rock/river helpers are all true
  // world-space (default scrollFactor 1,1), per the brief's explicit
  // warning not to let precisely-aligned architecture drift during camera
  // movement.
  buildScenery() {
    const bg = (key,x,y,scale=1) => this.art(key,x,y,scale,.5,.45).setScrollFactor(.85,.6);
    const mid = (key,x,y,scale=1) => this.art(key,x,y,scale,1.5,.7);
    const prop = (key,x,y,scale=1) => this.art(key,x,y,scale,2,.85);

    // --- Background: two SIMPLE, single-height bands, varied with gaps and
    // bg_palm (previously unused in the manifest) instead of one unbroken
    // identical row — the old flat repeat read as "wallpaper, no depth"
    // (the specific failure mode this phase's brief calls out). Town row
    // across A-D, hill skyline across E-G, with a deliberate overlap zone
    // (1700-1950) so the transition is gradual, not a hard cut.
    for(let i=0;i<9;i++) if(i%4!==2) bg('bg_house_row', i*256-150, 700);
    bg('bg_mosque', 500, 760);
    bg('bg_palm', 940, 820, .8);
    bg('bg_palm', 2650, 760, .7);
    for(let i=0;i<7;i++) bg('bg_hills', 1700+i*512-100, 650);

    // === ZONE A — Taman Perumahan: a small recognizable residential street.
    // Two DIFFERENT full houses (never the same silhouette twice in a row)
    // plus a palm accent, all clear of FIRST_GAP (420-540) and the A->B
    // ladder (610).
    mid('house_1_full', 40, 1100, .7);
    mid('house_2_full', 230, 1100, .62);
    prop('flag_malaysia', 160, 1100, .8);
    prop('plant_bush', 320, 1100, .9);

    // === ZONE B — Lorong Pekan: a compact shopfront row, each shop built
    // from wall + window + a porch-roof AWNING actually touching the wall
    // (not a lone roof floating above nothing) — one combo behind each of
    // the two town-walk decks, clear of the B->C ladder (750) and M1 (1250).
    this.shopfront(690, 980, 'h1_roof_porch');   // behind town-walk-1 (580-900)
    this.shopfront(1100, 980, 'h3_roof_hut');    // behind town-walk-2 (1040-1300), clear of M1 (1250)
    prop('plant_pot_leafy', 1150, 980);
    prop('lamp_wall', 640, 980, .8);

    // === ZONE C — Café Atas Angin: ONE recognizable café facade (wall +
    // window + canopy, stacked as a real building, not a bare roof) well
    // clear of the ladder (750), CP1 (950) and Si Oyen (680).
    this.shopfront(880, 820, 'h1_roof_porch');
    prop('plant_pot_tall', 950, 820);

    // === ZONE D — Bengkel Fungsi: one compact workshop, door/grille as the
    // distinct, named feature, well clear of Machine 1 (1250) and the gate
    // (1300) — the machine itself must stay visually dominant, so this sits
    // at the LEFT end of workshop-approach-adjacent space, not crowding it.
    mid('h3_wall_lower', 1160, 980, .85);
    mid('h3_door_grille', 1190, 980, .8);
    mid('h3_parapet', 1150, 822, .85);

    // === ZONE E — Deretan Bumbung: the primary architectural showcase.
    // Each of the three "floating" roof decks (supports:false in DECKS,
    // since there is no real ground beneath them) gets its OWN building
    // facade hung directly below it, down to the town tier (y=980) — this
    // is what turns three disconnected platforms into "a rooftop route
    // across three linked buildings." Varied rooflines (hut on roof-entry,
    // laundry — matching its own name — on roof-laundry, water tank on
    // roof-m2) keep the three from reading as identical repeats.
    this.buildingFacade(1750, 200, 700, 980);
    mid('h3_roof_hut', 1770, 700, .85);
    this.buildingFacade(2100, 200, 740, 980);
    prop('laundry_line', 2160, 740, .8);
    this.buildingFacade(2260, 320, 660, 980);
    mid('water_tank_stand', 2500, 660, .7);

    // === ZONE F — Bukit Tanjung & Gua: natural hillside, not buildings —
    // rockMass() is wired in via DECK_STYLE for f-step1/cave-alcove/
    // f-step2 (see deck()), so this section only adds the cave's own mouth
    // and sparse greenery. caveMouth() sits behind the existing "Gua
    // (pilihan)" label so the optional cave finally has a visible opening,
    // not just a sign.
    this.caveMouth(2990, 865);
    prop('plant_bush', 3050, 700);
    prop('plant_bush', 2930, 700);

    // === ZONE G — Jambatan Sungai: a visible river gap beneath the
    // final-gate, plus sparse bank greenery — see riverBand()'s own
    // comment for why this is simple code-drawn geometry, not a production
    // asset (none exists).
    this.riverBand(3700, 300, 1108);
    prop('plant_bush', 3600, 1100);
    prop('plant_bush', 4050, 1100);
  }
  // V8 Phase 8.5: a small reusable "shopfront" combo (wall + window +
  // canopy actually resting on the wall) used by B and C — a single
  // lone roof/porch sprite floating with nothing visibly beneath it was
  // one of the specific failures the brief calls out ("houses floating
  // behind platforms"). Every call site picks its own canopy key (porch
  // strip or hut roof) so B's two shopfronts and C's café don't repeat
  // the exact same silhouette.
  shopfront(x, surfaceY, roofKey) {
    this.art('h3_wall_lower', x-96, surfaceY+2, .78, 1.4, .88);
    this.art('h3_window_casement', x-34, surfaceY-58, .62, 1.6, .9);
    this.art(roofKey, x-100, surfaceY-128, .78, 1.7, .95);
  }
  buildEnvironment() {
    // V8 Phase 1 (audits/level-v8/phase1/): buildScenery() was re-derived
    // against the live V7 DECKS/ZONES table (see the method itself) and is
    // now enabled.
    this.buildScenery();
    for(let i=0;i<Math.ceil(WORLD.width/1152)+1;i++) this.art('kenney_bg_clouds',i*1152-150,0,4.5,0,.5).setScrollFactor(.3,.2);
    // Ground is deliberately NOT continuous across the whole world — see
    // GROUND_RANGES in level.js for exactly why (a world-spanning ground
    // would bypass every mandatory gate). The GROUND_Y constant below
    // replaces V6's hardcoded 998/1108/1000 (tuned for a y=1000 ground)
    // with V7's actual ground tier, y=1100.
    const GROUND_Y = 1100;
    for(const [left,right] of GROUND_RANGES) {
      for(let x=left;x<right;x+=64) {
        const key=x===left?'kenney_ground_left':x+64>=right?'kenney_ground_right':'kenney_ground_center';
        this.add.image(x,GROUND_Y-2,key).setOrigin(0).setDepth(9);
      }
      this.add.rectangle((left+right)/2,GROUND_Y+108,right-left,88,0x787c73).setDepth(3);
      this.platform({id:`street-${left}`,x:left,y:GROUND_Y,width:right-left},false);
    }
    DECKS.forEach(d => {this.deck(d);this.platform(d);});
    LADDERS.forEach(ladder => {
      for(let y=ladder.top;y<ladder.bottom;y+=48) {
        const key=y===ladder.top?'kenney_ladder_top':y+48>=ladder.bottom?'kenney_ladder_bottom':'kenney_ladder_middle';
        const height=Math.min(48,ladder.bottom-y);
        this.add.image(ladder.x-24,y,key).setOrigin(0).setDisplaySize(48,height).setDepth(13);
      }
      const zone=this.add.zone(ladder.x,(ladder.top+ladder.bottom)/2,56,ladder.bottom-ladder.top+72);
      this.physics.add.existing(zone,true); zone.setData('ladder',ladder); this.ladderZones.push(zone);
    });
    // Zone names are announced once as a brief toast on arrival (setStep).
    // Background/midground buildings are handled by buildScenery() above
    // (V6.3 Phase 1) using the pre-existing production/background-legacy
    // asset sets — deliberately never stacked from flat Kenney terrain
    // blocks (that specific approach was rejected: it reads as arbitrary
    // obstacles, not architecture). Café/workshop/etc. still keep their
    // checkpoint sign, machine and lever as the primary clear markers;
    // the new scenery supplements that, it does not replace it.
    this.label(touchDevice?'Lompat':'Space · Lompat', FIRST_GAP.x+30, 1050, 13);
    // The cave ledge, visibly darker and off the main gold-line route so it
    // reads as "detour", not a missed jump. Lower contrast than any required
    // surface, per the visual-hierarchy rule (background decoration ranks
    // below gameplay terrain). This label stays, since it marks a specific
    // optional feature rather than an entire zone's name.
    this.label('Gua (pilihan)', 2990, 820, 12);
    // V8 Phase 8.5: Checkpoints and machines now use the production
    // assets/production/Puzzle/ sprites (checkpoint_post_idle/active,
    // function_machine_idle/active) that have sat unused in the manifest
    // since Phase 0 — a direct swap of what a production checkpoint/
    // machine was always meant to look like, in place of the generic
    // Kenney sign/lever placeholders. Position, interaction range and
    // every state-transition event are completely unchanged; only the
    // texture + origin/scale (picked to match the player's own on-screen
    // height, see MACHINE_SCALE) differ. The goal's own flag (below) is
    // untouched — it is a different concept (destination), not a
    // checkpoint, and keeps its original kenney_flag_a/b animation.
    CHECKPOINTS.forEach((cp,i) => {
      this.checkpointArts[i] = this.add.image(cp.x, cp.feet, 'checkpoint_post_idle').setOrigin(.5,1).setScale(1).setDepth(11);
    });
    // Function machines: the machine itself stays the visually dominant
    // interactive object at its own position — no formula baked into the
    // art, the puzzle dialog alone presents each f(x).
    TERMINALS.forEach((t,i) => {
      this.machines[t.id] = this.add.image(t.x, t.feet, 'function_machine_idle').setOrigin(.5,1).setScale(MACHINE_SCALE).setDepth(11);
      this.label(`MESIN ${i+1}`, t.x, t.feet-150, 16);
    });
    // Closed gates get a small sign naming the blocking mechanism, PLUS
    // (buildGateStubs(), called below) a pair of broken-plank markers so
    // the crossing visibly looks incomplete, not an invisible gap.
    GATES.forEach(g => this.label('Selesaikan mesin →', g.x+40, g.y-20, 13));
    this.buildGateStubs();
    // Goal: a classic Kenney finish flag, animated between its two frames.
    this.label('DESTINASI', GOAL.x, GOAL.feet-150, 17);
    this.flag=this.add.sprite(GOAL.x,GOAL.feet,'kenney_flag_a').setOrigin(.5,1).setScale(1.3).setDepth(14);
    // Each flag frame is its own whole-image texture (loaded via load.image,
    // not a spritesheet), so Phaser needs the '__BASE' frame name explicit —
    // omitting it leaves the animation frame's texture-frame lookup empty
    // and throws inside startAnimation on every scene create.
    if(!this.anims.exists('flag-wave')) this.anims.create({key:'flag-wave',frames:[{key:'kenney_flag_a',frame:'__BASE'},{key:'kenney_flag_b',frame:'__BASE'}],frameRate:2,repeat:-1});
    this.flag.play('flag-wave');
    this.spawnCollectibles();
    this.buildSecrets();
  }
  // V8 Phase 7 (audits/level-v8/phase7/): three small optional discovery
  // markers. Always created (so an undiscovered one has its "come find me"
  // clue), but a secret already in this.discoveredSecrets (set in create(),
  // before this runs) gets no idle motion — it reads as a settled, found
  // detail rather than something still inviting interaction.
  buildSecrets() {
    this.secretMarkers = {};
    for (const secret of SECRETS) {
      const found = this.discoveredSecrets.has(secret.id);
      let marker;
      if (secret.id === 'secret-oyen') {
        // PLACEHOLDER (documented, see phase7 report): no cat/animal asset
        // exists anywhere in assets/manifest.json (checked assets/kenney,
        // assets/production, assets/chill-boy, assets/background-legacy).
        // A small procedural silhouette, generated once via Graphics —
        // exactly the technique 'fx-dot' (V8 Phase 3) already established
        // for this codebase, not a new mechanism — stands in for real art.
        if (!this.textures.exists('fx-cat-placeholder')) {
          const g = this.add.graphics();
          g.fillStyle(0x3b3b38, 1);
          g.fillEllipse(16, 18, 24, 14);
          g.fillCircle(29, 9, 8);
          g.fillTriangle(23, 4, 27, -4, 31, 5);
          g.fillTriangle(31, 4, 35, -3, 37, 6);
          g.fillRect(2, 12, 10, 4);
          g.generateTexture('fx-cat-placeholder', 40, 26);
          g.destroy();
        }
        marker = this.add.image(secret.x, secret.feet, 'fx-cat-placeholder').setOrigin(.5, 1).setDepth(11);
      } else if (secret.id === 'secret-function-note') {
        // Reuses the existing, previously-unused 'answer_sign' production
        // asset (assets/production/Puzzle/answer_sign.png) — an existing
        // approved asset, not a placeholder.
        marker = this.add.image(secret.x, secret.feet, 'answer_sign').setOrigin(.5, 1).setScale(.55).setDepth(11);
      } else {
        // Reuses the existing coin asset/tint-approach, distinctly tinted
        // and slightly larger than an ordinary collectible coin so it
        // reads as "a special find", not one more of the seven COLLECTIBLES.
        marker = this.add.image(secret.x, secret.feet - 6, 'kenney_coin').setOrigin(.5, 1).setScale(.85).setTint(0xcf8a2b).setDepth(14);
      }
      this.secretMarkers[secret.id] = marker;
      if (!found && !reducedMotion) {
        this.tweens.add({ targets: marker, y: marker.y - 8, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }
    }
  }
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
    toast.classList.add('show');
    this.zoneToastTimer=setTimeout(()=>toast.classList.remove('show'),2600);
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
    $('continue-btn').textContent = save.completed ? 'Main semula →' : 'Teruskan →';
    $('save-status').hidden = false;
    $('save-status').textContent = save.completed
      ? 'Level 1 telah diselesaikan sebelum ini.'
      : `Kemajuan disimpan · checkpoint ${CHECKPOINTS.findIndex(c => c.id === save.checkpointId) + 1 || 0}, ${save.solvedGateIds.length}/${PUZZLES.length} mesin.`;
  }
  // V8 Phase 8: the Level Select screen's one real card (Level 1). Reads
  // the SAME save SaveManager.load() always has — no second source of
  // truth, no cached/stale status — so it's safe to call every time the
  // dialog opens, not just once at create().
  renderLevelSelect() {
    const save = SaveManager.load();
    let status, actionLabel;
    if (!save) { status = 'Belum mula'; actionLabel = 'Mula'; }
    else if (save.completed) { status = 'Selesai'; actionLabel = 'Main semula'; }
    else { status = 'Dalam perjalanan'; actionLabel = 'Teruskan'; }
    $('level1-status').textContent = status;
    $('level1-action').textContent = actionLabel;
    if (save) {
      $('level1-summary').hidden = false;
      $('level1-summary').textContent = `${save.solvedGateIds.length}/${PUZZLES.length} mesin · ${save.collectedCoinIds.length}/${COLLECTIBLES.length} koleksi · ${save.discoveredSecretIds.length}/${SECRETS.length} rahsia`;
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
    $('complete').close();
    this.mode = 'welcome';
    this.refreshMenu(); this.renderSecretsUI();
    $('welcome').hidden = false; $('pause').disabled = true; $('touch-controls').hidden = true;
  }
  // Rebuilt fresh from the scene's own authoritative state every time —
  // never a partial merge onto whatever was saved before, so a save can
  // never end up mixing state from two different moments.
  writeSave() {
    SaveManager.save({
      checkpointId: CHECKPOINTS[this.checkpointIndex]?.id ?? null,
      solvedGateIds: [...this.solvedGates],
      collectedCoinIds: [...this.collectedCoinIds],
      // V8 Phase 7: this.discoveredSecrets is carried forward from
      // create()'s unconditional load (see there) across every scene
      // instance, so this always includes everything ever found, even on
      // the very first autosave of a freshly Restarted/Replayed run.
      discoveredSecretIds: [...this.discoveredSecrets],
      completed: this.levelCompleted,
      updatedAt: Date.now(),
    });
  }
  // V8 Phase 6: restore a previously saved run SILENTLY — no SFX, no
  // particles, no lever/plank tweens, no reopened puzzle dialogs. Those
  // effects are one-shot feedback for the MOMENT something is solved, not
  // for the state itself; replaying all of them on load is exactly the
  // failure mode the brief calls out.
  continueFromSave() {
    const save = this.pendingSave || SaveManager.load();
    if (!save) { this.startRun(); return; }
    this.checkpointIndex = CHECKPOINTS.findIndex(cp => cp.id === save.checkpointId);
    for (let i = 0; i <= this.checkpointIndex; i++) this.checkpointArts[i]?.setTexture('checkpoint_post_active');
    for (const gateId of save.solvedGateIds) {
      const gate = GATES.find(g => g.id === gateId);
      const puzzle = PUZZLES.find(p => p.gate === gateId);
      if (!gate || !puzzle || this.solvedGates.has(gateId)) continue;
      this.solvedGates.add(gateId);
      this.machines[puzzle.id]?.setTexture('function_machine_active');
      // V8 Phase 8.5: a restored (already-solved) gate must show the real,
      // finished bridge, not the locked-stub markers — same reasoning as
      // the live-solve path in answer() below.
      this.gateStubs[gateId]?.forEach(s => s.destroy());
      this.gateArt(gate);
      this.gateBodies[gate.id] = this.platform(gate);
    }
    for (const coinId of save.collectedCoinIds) {
      const coin = this.collectibles.find(c => c.active && c.getData('id') === coinId);
      if (!coin) continue;
      coin.destroy(); this.coinsFound++; this.collectedCoinIds.add(coinId);
    }
    this.levelCompleted = !!save.completed;
    $('coin-count').textContent = `Koleksi: ${this.coinsFound}`;
    $('checkpoint-state').textContent = this.checkpointIndex >= 0 ? `Checkpoint ${this.checkpointIndex + 1} disimpan` : 'Mula di rumah';
    $('objective').textContent = this.solvedGates.size > 0
      ? `Laluan terbuka. ${this.solvedGates.size < PUZZLES.length ? 'Teruskan meneroka.' : 'Capai destinasi.'}`
      : 'Terokai kejiranan. Cari jalan ke bukit kecil.';
    // respawn() already does exactly what a silent "place the player at
    // CHECKPOINTS[this.checkpointIndex] (or SPAWN)" needs — same safe-landing
    // guarantee a mid-game respawn already relies on, so Continue can never
    // drop the player inside a wall, gap or locked bridge either.
    this.respawn();
    this.startRun();
    announce('Kemajuan disambung dari checkpoint terakhir.');
  }
  // V8 Phase 7: same spatial-range pattern as nearestTerminal() — already
  // excludes anything in this.discoveredSecrets, so it can never re-offer
  // an already-found secret for a duplicate award.
  nearestSecret() {
    return SECRETS.find(s => !this.discoveredSecrets.has(s.id)
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
    this.writeSave();
    this.tweens.killTweensOf(this.secretMarkers[id]);
    this.pulseRing(secret.x, secret.feet - 30, 0xc9a227);
    this.sparkleBurst(secret.x, secret.feet - 30, 8, id === 'secret-cave-treasure' ? 0xd7b84a : 0x8a8fd6);
    this.floatingText(secret.x, secret.feet - 40, secret.foundText);
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
    this.mode='playing';this.physics.world.resume();clearControls();
    $('welcome').hidden=true;$('pause').disabled=false;
    $('touch-controls').hidden=!touchDevice;
    $('game').focus({preventScroll:true});
    announce(touchDevice?'Gunakan butang arah dan Lompat. Teroka ke kanan.':'A / D untuk bergerak. Space untuk lompat. Teroka ke kanan.');
  }
  pauseRun() {
    if(this.mode!=='playing') return;
    this.mode='paused';this.physics.world.pause();clearControls();
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
    $('paused').close();this.mode='playing';this.input.keyboard.enabled=true;
    clearControls();this.physics.world.resume();$('game').focus({preventScroll:true});
    this.tweens.resumeAll();this.time.paused=false;
    audio.resume();
  }
  nearestTerminal() {
    return TERMINALS.find(t => !this.solvedGates.has(t.gate)
      && Math.abs(this.player.x-t.x)<115 && Math.abs(this.player.body.bottom-t.feet)<48);
  }
  openPuzzle() {
    if(this.mode!=='playing') return;
    const terminal=this.nearestTerminal();
    if(!terminal) return;
    const puzzle=PUZZLES.find(p => p.id===terminal.id);
    this.activePuzzle=puzzle;
    this.mode='puzzle';this.physics.world.pause();clearControls();
    this.input.keyboard.enabled=false;
    $('puzzle-title').textContent=puzzle.id==='p1'?'Buka laluan bengkel':puzzle.id==='p2'?'Hidupkan mekanisme bumbung':'Buka laluan terakhir';
    $('equation').textContent=puzzle.formula;
    $('puzzle-given').textContent=puzzle.given;
    $('puzzle-prompt').textContent=puzzle.prompt;
    $('answer-label').textContent=puzzle.inputLabel;
    $('answer').value='';$('answer').placeholder=puzzle.placeholder;
    $('answer-feedback').textContent=`${puzzle.given} ${puzzle.prompt}`;
    $('answer-feedback').classList.remove('correct');
    // V8 Phase 5: reset the success state from any previous puzzle — the
    // answer form / hint area must always start visible and the Continue
    // button hidden when a (possibly different) puzzle's dialog opens.
    document.querySelector('.answer-row').hidden=false;
    this.renderHints();
    $('puzzle-continue').hidden=true;
    $('puzzle').showModal();$('answer').focus();
  }
  renderHints() {
    const puzzle=this.activePuzzle;
    const level=this.hintLevels[puzzle.id]||0;
    $('hint-btn').hidden=level>=puzzle.hints.length;
    $('hint-list').innerHTML='';
    for(let i=0;i<level;i++) {
      const li=document.createElement('li');li.textContent=puzzle.hints[i];$('hint-list').append(li);
    }
  }
  requestHint() {
    if(this.mode!=='puzzle') return;
    const puzzle=this.activePuzzle;
    const level=this.hintLevels[puzzle.id]||0;
    if(level>=puzzle.hints.length) return;
    this.hintLevels[puzzle.id]=level+1;
    this.renderHints();
  }
  closePuzzle() {
    $('puzzle').close();this.input.keyboard.enabled=true;this.mode='playing';
    this.activePuzzle=null;
    clearControls();this.physics.world.resume();$('game').focus({preventScroll:true});
  }
  answer(raw) {
    if(this.mode!=='puzzle'||!this.activePuzzle) return;
    const puzzle=this.activePuzzle;
    const result=puzzle.check(raw);
    if(!result.valid) { $('answer-feedback').textContent='Masukkan nombor sahaja. Mesin menunggu satu jawapan.'; return; }
    if(!result.correct) {
      this.attempts[puzzle.id]=(this.attempts[puzzle.id]||0)+1;
      // V8 Phase 5: a gentle, specific nudge toward the EXISTING hint
      // system (not a new one) once it's clear the student is stuck —
      // shown every wrong attempt while hints remain, not just once, since
      // a reminder isn't a penalty. No change to progress, no answer
      // reveal, nothing added when no hints remain (nothing left to point
      // to).
      const level=this.hintLevels[puzzle.id]||0;
      const nudge=level<puzzle.hints.length?' Perlukan bantuan? Cuba hint di bawah.':'';
      $('answer-feedback').textContent=result.wrongMessage(Number(raw))+nudge;
      $('answer').select();SFX.incorrect(audio);return;
    }
    // V8 Phase 5: show the worked reasoning INSIDE the dialog (where the
    // student is already looking) instead of relying solely on the
    // bottom-of-page status text, which previously was the only place
    // `solvedMessage` appeared — easy to miss, since closePuzzle() used to
    // run in this same instant, the modal vanishing right as the canvas
    // behind it gets busy (dust/pulse/bridge). The dialog now stays open,
    // under the student's own control (a focused "Teruskan" button), while
    // every piece of world state below still changes at the exact same
    // moment it always did — this only changes when the DIALOG closes, not
    // when the gate/lever/audio/bridge activate.
    $('answer-feedback').textContent=`Betul! ${puzzle.solvedMessage}.`;
    $('answer-feedback').classList.add('correct');
    document.querySelector('.answer-row').hidden=true;
    $('hint-btn').hidden=true;
    $('puzzle-continue').hidden=false;$('puzzle-continue').focus();
    SFX.correct(audio);
    // V8 Phase 4: machine activation is staggered ~120ms after the
    // correct-answer chime — both are very short sounds and layering them
    // at the exact same instant read as muddy in a quick listening pass;
    // this single setTimeout is audio sequencing only (no gameplay state
    // changes inside it), and SFX itself already no-ops silently if the
    // AudioContext is unavailable, so this can never block or alter
    // progress even if audio fails entirely.
    setTimeout(()=>{if(!audio.isPaused())SFX.machine(audio);},120);
    this.solvedGates.add(puzzle.gate);
    // V8 Phase 6: autosave the instant a machine is solved, even if the
    // player hasn't reached another checkpoint yet — a solved machine must
    // never be lost to a reload before that.
    this.writeSave();
    const lever=this.machines[puzzle.id];
    lever.setTexture('function_machine_active');
    // V8 Phase 3: brief activation response — a small scale pop on the
    // lever itself (not the player; distinct from, and does not touch,
    // the Phase 2 player squash/stretch) plus a pulse ring at the
    // terminal's own position. Runs exactly once, since answer() only
    // reaches this branch on the single correct submission per puzzle
    // (solvedGates.add + the gate check at openPuzzle() prevent re-entry).
    const terminalPos=TERMINALS.find(t=>t.id===puzzle.id);
    this.pulseRing(terminalPos.x,terminalPos.feet-40,0xc9a227);
    if(!reducedMotion) {
      // V8 Phase 8.5: relative to MACHINE_SCALE, not an absolute 1/1.3 —
      // the machine's own base scale changed this phase (was 1), the pop
      // itself (a brief 30% size bump) did not.
      lever.setScale(MACHINE_SCALE*1.3,MACHINE_SCALE*1.3);
      this.tweens.add({targets:lever,scaleX:MACHINE_SCALE,scaleY:MACHINE_SCALE,duration:260,ease:'Back.out'});
    }
    const gate=GATES.find(g=>g.id===puzzle.gate);
    // V8 Phase 8.5: the locked-gate stub markers are removed the instant
    // the real bridge is about to be drawn — never both on screen at once.
    this.gateStubs[puzzle.gate]?.forEach(s=>s.destroy());
    // V8 Phase 5: closePuzzle() is no longer called here — the dialog now
    // stays open (showing the reasoning above) until the student clicks
    // "Teruskan" (wired at the bottom of this file). Every world-state
    // change below is completely unaffected by that — it already ran
    // regardless of dialog visibility before this change, and still does.
    const planks=this.gateArt(gate);
    // Collision is created with the visible gate surface, never for wrong/empty inputs.
    this.gateBodies[gate.id]=this.platform(gate);
    // V8 Phase 4: synchronized with the actual bridge-opening event (right
    // where its collision body and plank art are created), not an
    // arbitrary delay.
    SFX.bridge(audio);
    if(!reducedMotion) this.tweens.add({targets:planks,alpha:{from:.25,to:1},duration:450,delay:this.tweens.stagger(18)});
    $('objective').textContent=`Laluan terbuka. ${this.solvedGates.size<PUZZLES.length?'Teruskan meneroka.':'Capai destinasi.'}`;
    announce(`Betul! ${puzzle.solvedMessage}. Laluan kini boleh dilalui.`);
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
  finish() {
    this.mode='complete';this.physics.world.pause();clearControls();this.visual.play('idle');
    this.input.keyboard.enabled=false;
    // V8 Phase 6: mark + autosave completion before anything else in this
    // method, so even the very first frame of the completion dialog has
    // already persisted (fatal reload mid-celebration is not a lost run).
    this.levelCompleted=true;this.writeSave();
    const seconds=Math.round(this.elapsed/1000);
    $('completion-time').textContent=`Masa meneroka: ${Math.floor(seconds/60)} min ${seconds%60} saat · Tiada had masa`;
    $('completion-coins').textContent=`Koleksi dijumpai: ${this.coinsFound}/${COLLECTIBLES.length}`;
    $('completion-puzzles').textContent=`Mesin fungsi diselesaikan: ${this.solvedGates.size}/${PUZZLES.length}`;
    // V8 Phase 8: secrets were already tracked (Phase 7) — this is the
    // first time the completion screen itself reports them.
    $('completion-secrets').textContent=`Rahsia dijumpai: ${this.discoveredSecrets.size}/${SECRETS.length}`;
    announce('Level 1 selesai!');
    // V8 Phase 3.1 fix: the dialog's own semi-transparent backdrop
    // (#151914a6, pre-existing, untouched here) was dimming the goal
    // sparkle almost the instant it appeared, since showModal() used to
    // run in the very same tick as the burst. Fix: play the celebration
    // on the open canvas FIRST, open the dialog only once it's mostly
    // finished — not a new timing system, just this method's own existing
    // this.time (same Clock already used for the burst's own cleanup
    // delayedCall). Still fires exactly once: finish() itself is only
    // ever called once per playthrough (update() returns immediately once
    // mode!=='playing', and a replay fully restarts the scene rather than
    // re-entering 'complete'), and showDialog() is referenced from nowhere
    // else, so it can't double-run either.
    const showDialog=()=>{$('complete').showModal();$('replay').focus();};
    // V8 Phase 4: the victory jingle is NOT gated behind reducedMotion —
    // that flag is prefers-reduced-motion (visual only) and must stay
    // that way; audio has its own independent mute/volume controls (see
    // src/audio.js). Fires exactly once, same guarantee as the sparkle
    // burst it's paired with (finish() itself is single-fire).
    SFX.victory(audio);
    if(reducedMotion) { showDialog(); return; }
    this.sparkleBurst(GOAL.x,GOAL.feet-90,16,0xd7b84a);
    this.time.delayedCall(140,()=>this.sparkleBurst(GOAL.x-20,GOAL.feet-60,8,0xc9a227));
    // 420ms: the longer burst's own lifespan (see sparkleBurst) — the
    // dialog opens right as it finishes, not mid-animation. Brief and
    // fixed, not input-blocking beyond what finish() already does on this
    // same line regardless (keyboard already disabled, physics already
    // paused, above).
    this.time.delayedCall(420,showDialog);
  }
  // V8 Phase 3: lightweight, reusable, self-destroying effect helpers.
  // Every one is a one-shot burst/tween that cleans itself up via a
  // `time.delayedCall` slightly after its own lifespan/duration — no
  // steady-state accumulation of particle emitters or tweens across a
  // long play session, and nothing here is ever referenced after it
  // destroys itself, so a mid-effect scene restart just discards it along
  // with everything else Phaser already tears down on restart.
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
  floatingText(x, y, text, color = '#d7b84a') {
    if (reducedMotion) return;
    const t = this.add.text(x, y, text, { fontFamily: 'Arial, sans-serif', fontSize: '15px', fontStyle: 'bold', color }).setOrigin(.5, 1).setDepth(22);
    this.tweens.add({ targets: t, y: y - 26, alpha: 0, duration: 650, ease: 'Sine.out', onComplete: () => t.destroy() });
  }
  syncVisual() { this.visual.setPosition(this.player.x,this.player.body.bottom); }
  update(time,delta) {
    if(fatal||!this.player||this.mode!=='playing') return;
    this.elapsed+=delta;
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
    this.visual.play(anim,true);
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
    // V7: gates now sit at three different tiers (y=980/660/1100), so the
    // early-trigger check must be relative to EACH gate's own y, not one
    // hardcoded value — a player standing inside an unsolved gate's gap has
    // no ground there by construction, so this only controls how soon the
    // respawn fires, not whether it's needed.
    const inOpenGate = GATES.some(g => !this.solvedGates.has(g.id) && this.player.x>g.x && this.player.x<g.x+g.width && body.bottom>g.y+100);
    // The absolute "fell out of the world" threshold is the lowest tier
    // (ground, y=1100) plus the same 60px margin V6 used relative to its
    // own single ground height.
    if(this.player.y>1160 || inOpenGate) {this.respawn();return;}
    const nextCheckpoint=CHECKPOINTS[this.checkpointIndex+1];
    if(nextCheckpoint && Math.abs(this.player.x-nextCheckpoint.x)<70 && Math.abs(body.bottom-nextCheckpoint.feet)<5 && body.blocked.down) {
      // Already single-fire by construction: incrementing checkpointIndex
      // here changes which CHECKPOINTS entry `nextCheckpoint` resolves to
      // on every later frame, so this block cannot run twice for the same
      // checkpoint even while the player keeps standing on it.
      this.checkpointIndex++;
      const art=this.checkpointArts[this.checkpointIndex];
      art.setTexture('checkpoint_post_active');
      this.pulseRing(art.x,art.y-44,0x1b5e20);
      SFX.checkpoint(audio);
      $('checkpoint-state').textContent=`Checkpoint ${this.checkpointIndex+1} disimpan`;
      announce(touchDevice?'Checkpoint dicapai.':'Checkpoint dicapai. Tekan R untuk kembali ke sini jika jatuh.');
      // V8 Phase 6: a new checkpoint is itself an autosave trigger.
      this.writeSave();
    }
    this.setStep(this.currentZoneIndex());
    const terminal=this.nearestTerminal();
    const secret=this.nearestSecret();
    // V8 Phase 3: readiness cue. The ring's visibility/position is plain
    // state (not motion) — shown the instant a terminal is in range,
    // regardless of reducedMotion, so the cue itself is never lost under
    // reduced-motion; only the gentle pulse brightness animation is
    // skipped, matching "all feedback must remain understandable without
    // particles/motion" (the lever's own idle/active texture swap already
    // carries the solved-state meaning unconditionally).
    if(terminal) {
      this.machineGlow.setPosition(terminal.x,terminal.feet-70).setVisible(true);
      this.machineGlow.setAlpha(reducedMotion?.4:.28+.18*Math.sin(time/260));
    } else this.machineGlow.setVisible(false);
    this.prompt.setVisible(!!terminal || !!secret || (!!nearby&&!this.climbing));
    // V8 Phase 7: a generic "E · Teroka" (Explore) for any undiscovered
    // secret — deliberately not naming which one, so the prompt itself
    // never spoils what's there; the environmental marker is the clue.
    if(terminal) this.prompt.setText(touchDevice?'Guna · Mesin fungsi':'E · Gunakan mesin').setPosition(terminal.x,terminal.feet-134);
    else if(secret) this.prompt.setText(touchDevice?'Guna · Teroka':'E · Teroka').setPosition(secret.x,secret.feet-90);
    else if(nearby&&!this.climbing) this.prompt.setText(touchDevice?'↑ / ↓ · Tangga':'W / S · Tangga').setPosition(nearby.x,this.player.body.top-20);
    if(interact) {
      if (secret) { if (secret.note) this.openSecretNote(secret); else this.discoverSecret(secret.id); }
      else this.openPuzzle();
    }
    if(this.solvedGates.size>=PUZZLES.length && Math.abs(this.player.x-GOAL.x)<62 && Math.abs(body.bottom-GOAL.feet)<6 && body.blocked.down) this.finish();
  }
}

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
  if($('level-select').open) { closeOverlay('level-select'); return; }
  if($('collection').open) { closeOverlay('collection'); return; }
  if($('settings').open) { closeOverlay('settings'); return; }
  if(activeScene.mode==='playing') activeScene.pauseRun();
  else if(activeScene.mode==='paused') activeScene.resumeRun();
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

try {
  if(!window.Phaser) throw new Error('Phaser runtime missing');
  const response=await fetch('assets/manifest.json');
  if(!response.ok) throw new Error('Asset manifest missing');
  const assets=await response.json();
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
  const observer=new ResizeObserver(()=>{fitFrame();const d=dimensions();game.scale.setGameSize(d.width,d.height);});
  observer.observe(stage);
  // Explicit opt-in read/test access; no production shortcuts or skip-level controls.
  if(new URLSearchParams(location.search).has('test')) window.rooftop={game,get scene(){return activeScene;},constants:{WORLD,MOTION,ZONES,DECKS,GATES,LADDERS,TERMINALS,CHECKPOINTS,PUZZLES,FIRST_GAP,SECRETS}};
} catch(error) {
  console.error(error);
  fail('Permainan tidak dapat dimulakan. Muat semula halaman atau kembali ke Add Math.');
}
