// V14 — genuinely new level architecture, NOT the V13 map.
//
// Source: Wild Adventure's data/levels/level_4.tmj, read from its
// AUTHORITATIVE "collision" layer (the one TilemapLoader.cpp actually uses
// for physics — confirmed by reading the engine source, not the decorative
// "foreground"/"decorations" layers). A full column-by-column scan of that
// layer (references/wild-adventure/) found:
//   - The main floor is CONTINUOUS end to end (zero true air-gap columns)
//     but far from flat: constant 1-3-tile dips/rises throughout.
//   - Three optional vertical towers rise OFF the continuous floor (the
//     floor keeps going at its own height directly underneath each one) —
//     reached by a trampoline-equivalent, each holding extra loot at
//     increasing height. They are detours, not gates on the main route.
//   - One long, low, mostly-flat stretch (x135-157 in WA tiles) is crossed
//     via a row of box platforms held just above a hazard-covered floor —
//     a "stepping-stone gauntlet" beat, distinct from the rest of the
//     level's gentle up/down rhythm.
//
// This file re-derives that SHAPE in DENAI's own units — it does not copy
// Wild Adventure's pixel coordinates (different tile scale, different
// physics). Concretely:
//   - start -> small dip/rise pairs -> ONE optional ladder-accessed tower
//     (DENAI has no trampoline; a ladder is DENAI's own existing mechanic
//     for a rise this big, same convention V13 already used for any
//     >88px tier change) -> a real jump gap -> more dip/rise pairs ->
//     the relocated 'lift' puzzle gate -> a 5-deck stepping-stone gauntlet
//     (oneWay decks over open air, each hop individually verified against
//     Chill Boy's jump envelope — see the validation table in this
//     session's notes) -> recovery -> a final dip/rise echo -> finish.
// Every gap/rise below was checked against MOTION (speed 280, jump 520,
// gravity 1400 => max flat range ~208px, max pure-vertical rise ~96.6px):
// every dip/rise pair is a 54px step across a 40px gap (small, safe hop);
// every gauntlet hop and every flat gap is <=162px, inside Chill Boy's
// jump range; the one genuinely large rise (the tower, 486px) is ladder
// -only, matching DENAI's own established threshold for "too tall to jump".
import {MOTION,PUZZLES as ORIGINAL_PUZZLES} from '../level.js';
export {MOTION};
export const WORLD={width:4900,height:1600,gravity:1400};
export const BUILD_STAGE=4, BATCH_END=4900;
export const SPAWN={x:60,feet:1296},GOAL={x:4550,feet:1296};
export const FIRST_GAP={x:926,width:120};
export const ROOMS=[
 {id:'R01',zone:'A',from:0,to:1046,name:'Taman & menara pilihan'},
 {id:'R01b',zone:'A',from:400,to:676,name:'Menara (pilihan)',optional:true},
 {id:'R02',zone:'B',from:1046,to:2296,name:'Pengangkat fungsi'},
 {id:'R03',zone:'C',from:2296,to:3596,name:'Laluan batu loncatan'},
 {id:'R04',zone:'C',from:3596,to:4900,name:'Destinasi slice'}];
export const SURFACES=[
 {id:'start',x:0,y:1296,width:360,kind:'solid',room:'R01'},
 {id:'dip-1',x:400,y:1350,width:270,kind:'solid',room:'R01'},
 // Optional reward platform atop the tower ladder — not on the critical
 // path (the floor continues underneath via dip-1/rise-1 either way).
 // BUGFIX: this was kind:'solid' (AB_TERRAIN), and every AB_TERRAIN entry
 // renders as a full-depth pillar down to the world floor (y1566) — see
 // environment.js's baseTerrain loop (`floor=1566`, confirmed unchanged
 // from V13). That pillar overlapped dip-1 (x400-670) at x460-670,
 // fusing into one solid mass from y864 to the floor: a sheer wall right
 // where the ladder is, blocking dip-1->rise-1. Fixed by making it a thin
 // oneWay deck (DECKS/s.deck(), 16px platform) like its sibling
 // tower-mid, instead of a pillar — same fix pattern already used
 // everywhere else a reward ledge sits above the main floor.
 {id:'tower-top',x:460,y:864,width:216,kind:'oneWay',room:'R01b',optional:true},
 {id:'rise-1',x:710,y:1296,width:216,kind:'solid',room:'R01'},
 {id:'mid-1',x:1046,y:1296,width:270,kind:'solid',room:'R02'},
 {id:'dip-2',x:1356,y:1350,width:216,kind:'solid',room:'R02'},
 {id:'approach',x:1612,y:1296,width:198,kind:'solid',room:'R02'},
 {id:'lift-gate',x:1810,y:1296,width:270,kind:'gate',room:'R02'},
 {id:'post-gate',x:2080,y:1296,width:216,kind:'solid',room:'R02'},
 // TERRAIN PASS (post-puzzle/recovery section, x3636-4724): this used to
 // be 4 narrow pillars (216/162/216/324 wide) separated by small gaps —
 // the "repeated rectangular dirt column" silhouette. Rebuilt as 3 WIDER
 // landmasses (420/120/468) with the same total span, same entry/exit
 // points (gaunt-5 end, GOAL, cp-recovery, cp-final all still land on
 // solid ground) and the same proven 40px/54px anti-flush transition
 // already used everywhere else in this level — fewer, bigger connected
 // masses instead of many small ones; one real "natural dip" (mid-notch)
 // kept for genuine elevation variety rather than four repeated steps.
 {id:'lower-terrace',x:3636,y:1296,width:420,kind:'solid',room:'R04'},
 {id:'mid-notch',x:4096,y:1350,width:120,kind:'solid',room:'R04'},
 {id:'upper-plateau',x:4256,y:1296,width:468,kind:'solid',room:'R04'},
 // Stepping-stone gauntlet: 5 oneWay decks over open air.
 // BUGFIX (2nd pass): first fix widened these to 140-150px with ~130px
 // gaps, which read fine on a physics calculator (max range ~208px with a
 // comfortable margin on paper) but live play (scripted AND manual) still
 // showed misses — a jump launched with any run-up carries further than
 // the simple same-height formula assumes, and 130px left too little
 // margin against that. Gaps tightened further to 90-100px — well under
 // half the theoretical max — so a jump lands solidly mid-platform
 // instead of right at its edge. Same stepping-stone concept and
 // dip/rise silhouette, just a real safety margin instead of a
 // paper-thin one. (This shifted everything from 'recovery' onward 50px
 // earlier; GOAL/WORLD.width below are unchanged, just extra margin.)
 {id:'tower-mid',x:490,y:1134,width:108,kind:'oneWay',room:'R01b',optional:true},
 {id:'gaunt-1',x:2386,y:1296,width:150,kind:'oneWay',room:'R03'},
 {id:'gaunt-2',x:2636,y:1332,width:150,kind:'oneWay',room:'R03'},
 {id:'gaunt-3',x:2886,y:1278,width:150,kind:'oneWay',room:'R03'},
 {id:'gaunt-4',x:3136,y:1332,width:150,kind:'oneWay',room:'R03'},
 {id:'gaunt-5',x:3386,y:1296,width:160,kind:'oneWay',room:'R03'},
 // Crate-puzzle reward ledge — 'optional' kind (excluded from both solid
 // terrain and decks), instantiated only once the crate reaches the
 // switch, same mechanic V13 used for its own A-ledge.
 {id:'start-ledge',x:220,y:1188,width:108,kind:'optional',room:'R01'}];
export const AB_TERRAIN=SURFACES.filter(s=>s.kind==='solid');
export const DECKS=SURFACES.filter(s=>s.kind==='oneWay');
export const GROUND_RANGES=AB_TERRAIN.map(s=>[s.x,s.x+s.width]);
export const LADDERS=[{id:'tower-ladder',x:550,top:864,bottom:1350}];
export const GATES=[{id:'lift',x:1810,y:1296,width:270,parkedY:1480}];
export const TERMINALS=[
 {id:'probe',kind:'probe',x:1660,feet:1296},
 // BUGFIX: this was x:1945 — INSIDE the unsolved gate's own span
 // (1810-2080), 135px past the end of the nearest solid ground
 // ('approach' ends at x1810). 'lift' is a "tight" interaction kind
 // (48px radius, see mechanisms.js nearestTerminal()), so the terminal
 // was never actually reachable from stable footing — the player could
 // never get in range to interact with it at all. This was the real
 // cause of the reported "cannot submit" bug: not a submit/validation
 // problem, a terminal placed off the standable floor. Moved to x:1770,
 // beside the physical lever prop (environment.js places it at x1760),
 // well inside 'approach'.
 {id:'lift',kind:'lift',gate:'lift',x:1770,feet:1296}];
export const CHECKPOINTS=[
 {id:'cp-start',x:150,feet:1296},
 {id:'cp-rise1',x:780,feet:1296},
 {id:'cp-gate',x:2150,feet:1296,requires:['lift']},
 // Mid-gauntlet safety net (gaunt-3) — see the gauntlet-width bugfix note
 // above: one missed jump in the stepping-stone run no longer costs the
 // whole gauntlet, just the nearer half of it.
 {id:'cp-gaunt-mid',x:2950,feet:1278,requires:['lift']},
 {id:'cp-recovery',x:3700,feet:1296},
 {id:'cp-final',x:4430,feet:1296,requires:['lift']}];
export const COLLECTIBLES=[
 // BUGFIX: the crate-puzzle's own reward ledge (start-ledge, below) had
 // nothing on it — solving the puzzle revealed an empty platform, exactly
 // the "meaningless interactive object" pattern flagged for removal. Same
 // fix V13 used for its own A-ledge: a collectible that sits there,
 // reachable with effort even before solving (no requiresSecret gate),
 // but trivial once the ledge exists.
 {id:'start-reward',x:220,y:1140},
 {id:'tower-1',x:525,y:806},
 {id:'tower-2',x:610,y:806},
 {id:'mid-bonus',x:1180,y:1232},
 {id:'gauntlet-bonus',x:3790,y:1245},
 {id:'finish-bonus',x:4560,y:1218}];
export const CRATE_PUZZLE={crate:{id:'crate-1',x:150,feet:1296},floorSwitch:{id:'plate-1',x:320,feet:1296,radius:40},platform:SURFACES.find(s=>s.id==='start-ledge')};
// Optional discovery — ladder reward, never required to complete the chapter.
export const SECRETS=[{id:'tower-whisper',name:'Pesanan di Puncak',title:'Pesanan di Puncak',description:'Setiap laluan ada cerita kecilnya.',foundText:'Rahsia ditemui: Pesanan di Puncak!',x:620,feet:864,radius:62}];
export const PUZZLES=[{...ORIGINAL_PUZZLES[0],gate:'lift'}];
export const ZONES=[
 {name:'A - Taman Permulaan',xStart:0,xEnd:1046},
 {name:'B - Pengangkat Fungsi',xStart:1046,xEnd:2296},
 {name:'C - Laluan Akhir',xStart:2296,xEnd:4900}];
// Unused in this slice (no moving platform) — exported only because
// moving-platform.js/environment.js import the name; harmless placeholder,
// never attached to a scene.
export const F_MOVING_PLATFORM={id:'unused-moving-deck',minX:0,maxX:0,y:0,width:54,height:18,speed:1};
