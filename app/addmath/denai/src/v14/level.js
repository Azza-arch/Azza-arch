// DENAI V14 — Level 1 "Jejak Taman Fungsi".
// All six sections follow the approved blueprint (docs/level1-blueprint/).
// Phase 2A built Sections 01–02; Phase 2C replaced the temporary legacy
// continuation with Sections 03–06 (station, cliffs over water, Pokok
// Tinjau, final clearing).
// Grid: 54px (18px Kenney tile drawn x3). y = top of surface. Floor = 1566.
// Surface kinds:
//   solid    full-depth terrain column down to the floor (collider + art)
//   slab     finite-thickness terrain: collider and art span y..bottom only
//   oneWay   16px deck, passable from below
//   gate     puzzle-gated walkway (lift)
//   optional crate-revealed deck (collider added only while the plate is pressed)
// Reachability of every S1/S2 hop is checked against measured Chill Boy
// physics (peak 92.3px, flat reach 200.7px) in docs/level1-blueprint/check.json.
import {MOTION,PUZZLES as ORIGINAL_PUZZLES} from '../level.js';
export {MOTION};
export const WORLD={width:5940,height:1600,gravity:1400,floor:1566};
export const BUILD_STAGE=4, BATCH_END=5940;
export const LEGACY_DX=0; // legacy offset retired in Phase 2C (kept so older imports resolve)
export const WATER_Y=1512; // water surface in the station chasm and under Tebing Berliku
export const SPAWN={x:60,feet:1296},GOAL={x:5751,feet:1188};
export const FIRST_GAP={x:2538,width:324};
export const ROOMS=[
 {id:'R01',zone:'A',from:0,to:972,name:'Taman Permulaan'},
 {id:'R02',zone:'A',from:972,to:2052,name:'Laluan Akar'},
 {id:'R03',zone:'B',from:2052,to:3024,name:'Stesen Fungsi'},
 {id:'R04',zone:'C',from:3024,to:4212,name:'Tebing Berliku'},
 {id:'R05',zone:'C',from:4212,to:5184,name:'Pokok Tinjau'},
 {id:'R06',zone:'C',from:5184,to:5940,name:'Destinasi Terakhir'}];
export const SURFACES=[
 // ── 01 Taman Permulaan ──
 {id:'meadow',x:0,y:1296,width:810,kind:'solid',room:'R01'},
 // Phase C (V2 redesign): the flat garden step becomes a small hill — up,
 // crest, down — before the root path. One-tile (54) steps, all jumpable.
 {id:'garden-step',x:810,y:1242,width:108,kind:'solid',room:'R01'},
 {id:'garden-crest',x:918,y:1188,width:108,kind:'solid',room:'R01'},
 {id:'garden-down',x:1026,y:1242,width:54,kind:'solid',room:'R01'},
 // Kampung house veranda behind the spawn (optional; reached by its ladder).
 {id:'house-veranda',x:0,y:1188,width:162,kind:'oneWay',room:'R01',optional:true}, // the house ladder (x135) tops out on it
 // Crate reward ledge: 108px above the meadow (> 92.3px jump peak), so it
 // is only reachable from the crate top (1248) once the crate is on the plate.
 {id:'start-ledge',x:432,y:1188,width:162,kind:'optional',room:'R01'},
 // ── 02 Laluan Akar ──
 {id:'root-overhang',x:1080,y:1242,width:108,bottom:1296,kind:'slab',room:'R02'},
 {id:'root-lane',x:1080,y:1404,width:432,kind:'solid',room:'R02'},
 {id:'root-step-1',x:1512,y:1350,width:108,kind:'solid',room:'R02'},
 {id:'root-step-2',x:1620,y:1296,width:162,kind:'solid',room:'R02'},
 // Phase C: the two post-and-deck canopy frames are replaced by ONE stone
 // root arch (solid, 2 rows) carried by two old tree trunks standing in the
 // tunnel (art only). Underside 1188: 216 above the root lane, 162 above
 // root-step-1, so the main route under it is unchanged. Top stays at 1080
 // (the old canopy height), so the canopy coins keep their heights.
 {id:'root-arch',x:1242,y:1080,width:378,bottom:1188,kind:'slab',style:'arch',room:'R02',optional:true},
 {id:'arch-landing',x:1188,y:1080,width:54,kind:'oneWay',room:'R02',optional:true},
 // ── 03 Stesen Fungsi ── yard continues from S02; the station stands on it.
 {id:'station-yard',x:1782,y:1242,width:756,kind:'solid',room:'R03'},
 // Construction yard: a stack of plank crates (solid, one tile) to hop over.
 {id:'plank-stack',x:1944,y:1188,width:108,bottom:1242,kind:'slab',style:'crates',room:'R03'},
 // Bridge over the water chasm: 324px is beyond any jump (max 200.7 + 28px
 // body credit), so the puzzle gate is mandatory. Collision only once built.
 {id:'lift',x:2538,y:1242,width:324,kind:'gate',room:'R03'},
 {id:'far-bank',x:2862,y:1242,width:270,kind:'solid',room:'R03'},
 // ── 04 Tebing Berliku ── five hops over water: down, up, up (peak), down, down.
 // Phase 2C overshoot rule: every landing is long enough to catch a
 // full-speed jump taken at the very edge (gap + width + 14 ≥ max carry).
 {id:'cliff-1',x:3240,y:1296,width:162,kind:'solid',room:'R04'},
 {id:'pier-1',x:3492,y:1242,width:126,kind:'oneWay',room:'R04'},
 {id:'rest-cliff',x:3726,y:1188,width:162,kind:'solid',room:'R04'},
 {id:'pier-2',x:3978,y:1242,width:144,kind:'oneWay',room:'R04'},
 // ── 05 Pokok Tinjau ── ground route stays open under the treehouse.
 {id:'grove-floor',x:4212,y:1296,width:378,kind:'solid',room:'R05'},
 {id:'root-dip',x:4590,y:1350,width:162,kind:'solid',room:'R05'},
 {id:'grove-east',x:4752,y:1296,width:432,kind:'solid',room:'R05'},
 {id:'lookout-low',x:4266,y:1134,width:324,kind:'oneWay',room:'R05',optional:true},
 {id:'lookout-branch',x:4563,y:1080,width:135,kind:'oneWay',room:'R05',optional:true}, // widened 90→135: fairer landing for the optional branch jump
 {id:'lookout-high',x:4410,y:1026,width:126,kind:'oneWay',room:'R05',optional:true},
 // Phase C: rope bridge east from the top deck to a deck resting on a tree crown.
 {id:'rope-bridge',x:4536,y:1026,width:324,kind:'oneWay',room:'R05',optional:true},
 {id:'ridge-deck',x:4860,y:1026,width:162,kind:'oneWay',room:'R05',optional:true},
 // ── 06 Destinasi Terakhir ── arrival step, clearing, stone plinth with the flag.
 {id:'clearing',x:5184,y:1242,width:486,kind:'solid',room:'R06'},
 {id:'flag-plinth',x:5670,y:1188,width:162,kind:'solid',style:'stone',room:'R06'}, // 3 tiles: a running jump (~173px) still lands on it
 {id:'clearing-east',x:5832,y:1242,width:108,kind:'solid',room:'R06'}];
export const AB_TERRAIN=SURFACES.filter(s=>s.kind==='solid');
export const SLABS=SURFACES.filter(s=>s.kind==='slab');
export const DECKS=SURFACES.filter(s=>s.kind==='oneWay');
export const GROUND_RANGES=AB_TERRAIN.map(s=>[s.x,s.x+s.width]);
// Pokok Tinjau barriers: solid fence walls on the treehouse's outer edges so
// the only way down is the ladder. Heights beat the 92.3px jump peak where a
// jump could otherwise clear them; the low deck's right fence is short on
// purpose (anything over it lands on the branch deck, whose tall fence stops
// overshoot). Inner edges stay open: top deck → low deck, branch → low deck.
// Art: each wall is a full-height post (drawn by buildLandscape) with ONE
// railing section at deck level; the old stacked fence tiles read as loose ladders.
export const WALLS=[
 {id:'tinjau-low-left',x:4266,width:12,top:1026,bottom:1134,art:[[106,4278,1080]]},
 {id:'tinjau-low-right',x:4578,width:12,top:1080,bottom:1134,art:[[105,4524,1080],[69,4557,1080]]},
 {id:'tinjau-branch-right',x:4686,width:12,top:1040,bottom:1080,art:[[106,4632,1026]]}, // Phase C: lowered so the rope bridge (1026) passes over it
 {id:'tinjau-high-left',x:4410,width:12,top:918,bottom:1026,art:[[106,4416,972]]}];
// Phase C: root ladder moved to the shaft beside the arch (x 1215); house ladder added.
export const LADDERS=[{id:'root-ladder',x:1215,top:1080,bottom:1404},{id:'tree-ladder',x:4374,top:1134,bottom:1296},{id:'house-ladder',x:135,top:1188,bottom:1296}];
// Optional fishing jetty (built by the sawmill puzzle, no collision before that):
// low walkway from cliff-1 to the rest cliff, plus its ladder up the rest cliff.
export const JETTY={id:'jetty',x:3402,y:1458,width:324,planks:11,ladder:{id:'jetty-ladder',x:3699,top:1188,bottom:1458},landing:{id:'jetty-landing',x:3672,y:1188,width:54}};
export const SAWMILL={id:'sawmill',x:3060,feet:1242,leverX:3375,leverFeet:1296};
// Water is drawn (not collided) in front of cliff bases too, so the Tebing
// Berliku cliffs visibly rise out of one continuous stretch of water.
export const WATER=[{x:2538,width:324},{x:3132,width:1080}];
export const GATES=[{id:'lift',x:2538,y:1242,width:324,parkedY:1242,planks:7}];
export const TERMINALS=[
 {id:'probe',kind:'probe',x:2151,feet:1242},
 {id:'lift',kind:'lift',gate:'lift',x:2484,feet:1242}];
export const CHECKPOINTS=[
 {id:'cp-start',x:120,feet:1296},
 {id:'cp-rise1',x:1700,feet:1296},
 {id:'cp-gate',x:2940,feet:1242,requires:['lift']},
 {id:'cp-gaunt-mid',x:3760,feet:1188,requires:['lift']},
 {id:'cp-recovery',x:4330,feet:1296}, // where the last Tebing hop lands and beside the tree ladder
 {id:'cp-final',x:5238,feet:1242,requires:['lift']}];
// 15 collectibles + 2 secrets (approved total).
export const COLLECTIBLES=[
 {id:'start-reward',x:459,y:1140},{id:'start-reward-2',x:513,y:1124},{id:'start-reward-3',x:567,y:1140},
 {id:'canopy-1',x:1323,y:1040},{id:'canopy-2',x:1485,y:1020},{id:'canopy-3',x:1580,y:1040},
 {id:'bridge-coin',x:2700,y:1190},
 {id:'arc-1',x:3426,y:1200},{id:'arc-2',x:3447,y:1180},{id:'arc-3',x:3468,y:1190},
 {id:'pier-high',x:3650,y:1420}, // Phase C: moved to the end of the optional jetty (same id)
 {id:'lookout-1',x:4330,y:1090},{id:'lookout-2',x:4608,y:1040},{id:'lookout-3',x:4500,y:986},
 {id:'finish-plinth',x:5751,y:1062}];
export const CRATE_PUZZLE={crate:{id:'crate-1',x:216,feet:1296},floorSwitch:{id:'plate-1',x:405,feet:1296,radius:40},platform:SURFACES.find(s=>s.id==='start-ledge')};
export const SECRETS=[
 {id:'tower-whisper',name:'Jejak di Akar',title:'Jejak di Akar',description:'Di bawah akar, laluan rendah menyimpan petunjuk kecil.',foundText:'Rahsia ditemui!',x:1124,feet:1404,radius:52,hint:'Sesuatu tersembunyi di bawah laluan atas Laluan Akar.'},
 {id:'lookout-note',name:'Nota Fungsi Misteri',title:'Nota Fungsi Misteri',description:'Nota di puncak Pokok Tinjau.',foundText:'Nota rahsia ditemui!',x:4446,feet:1026,radius:46,note:true,hint:'Satu misteri menanti jauh di atas lantai hutan.',
  noteText:'Di puncak Pokok Tinjau tertulis:\n\n"Di Jambatan Berkembar, f(x) = 2x + 1 dan g(x) = x².\nApakah yang berubah apabila urutan mesin ditukar?"\n\nPetua: hasil mesin pertama menjadi input mesin kedua.'}
];
export const PUZZLES=[{...ORIGINAL_PUZZLES[0],gate:'lift'}];
export const ZONES=[
 {name:'01 · Taman Permulaan',xStart:0,xEnd:972},
 {name:'02 · Laluan Akar',xStart:972,xEnd:2052},
 {name:'03 · Stesen Fungsi',xStart:2052,xEnd:3024},
 {name:'04 · Tebing Berliku',xStart:3024,xEnd:4212},
 {name:'05 · Pokok Tinjau',xStart:4212,xEnd:5184},
 {name:'06 · Destinasi Terakhir',xStart:5184,xEnd:5940}
];
export const F_MOVING_PLATFORM={id:'unused-moving-deck',minX:0,maxX:0,y:0,width:54,height:18,speed:1};
