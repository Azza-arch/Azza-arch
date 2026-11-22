import {AB_TERRAIN,DECKS,LADDERS,CHECKPOINTS,GATES,SECRETS,SURFACES,F_MOVING_PLATFORM,WORLD} from './level.js';
export function buildWorld(s){
 s.textures.get('kpp_terrain_atlas').setFilter(Phaser.Textures.FilterMode.NEAREST);
 s.worldObjects=[];s.cClues=new Set();s.probeSeen=new Set();s.eReadoutShown=false;s.eOutputShown=false;
 s.riverInputSel=null;s.riverLastInputTrial=null;s.riverOrderSel=null;s.riverLastOrderTrial=null;
 // COMPOSITION PASS (Task 2): the previous two attempts (opacity tweak,
 // then alternating the real 0014/0015 tile pair) both kept a horizontal
 // band of hill/mountain silhouette running the full width of the level —
 // that continuous band, not its alpha or which half-tile it used, is
 // what reads as "wallpaper". Re-examined the actual Kenney reference
 // image directly: it has NO background band at all — flat sky, with
 // every bit of visual interest built into the FOREGROUND (terrain shape
 // + one real tree + grounded props). Per the brief's own instruction
 // ("if the existing hill/mountain sprites cannot form a convincing
 // continuous scene, simplify rather than repeat"), the band and the
 // separate small-pine parallax layer are both removed outright — not
 // re-tuned. Sky is the plain canvas background (set in game.js) with
 // nothing drawn over it; everything that reads as "landscape" now has
 // to come from real, grounded foreground composition (below), matching
 // how the reference actually achieves its look.
 const tile=(frame,x,y,depth=4,w=54,h=54)=>{
  const a=s.add.image(x,y,'kpp_terrain_atlas',frame).setOrigin(0).setScale(3).setCrop(0,0,w/3,h/3).setDepth(depth);
  s.worldObjects.push({frame,x,y,width:w,height:h,collision:false});return a;
 };s.tile=tile;
 const post=(x,top,bottom)=>{for(let y=top;y<bottom;y+=54)tile(89,x,y,4,54,Math.min(54,bottom-y));};
 const beam=(x,y,width)=>{for(let a=0;a<width;a+=54)tile(a===0?48:a+54>=width?50:49,x+a,y,4,Math.min(54,width-a),18);};
 const surfaceAt=x=>AB_TERRAIN.find(t=>x>=t.x&&x<t.x+t.width)?.y??Infinity;
 // ROOT-CAUSE BUGFIX: this was `[...AB_TERRAIN, {id:'D-approach',x:3024,...
 // width:540}, {id:'D-landing',x:3834,...}]` — two hardcoded V13 Zone-D
 // terrain pieces, left in from the original V13 copy this file was
 // trimmed from, never removed because they're outside level.js (not
 // visible when auditing SURFACES) and this `baseTerrain` line reads as
 // "just AB_TERRAIN" at a glance. D-approach alone is a FULL-DEPTH solid
 // pillar at x3024-3564, y972-1566 — real, both visually (the "enormous
 // vertical dirt mass near the gauntlet" reported) and physically (every
 // AB_TERRAIN-style entry here fills to the world floor, see the loop
 // below). It sat directly across the gaunt-3->gaunt-4 jump path
 // (gaunt-3 ends x3036, 12px inside this pillar's left face at x3024),
 // which is the actual, now-confirmed cause of the "stuck" collision
 // (body.blocked.right/touching.right against this invisible-in-level.js
 // wall) — not a Phaser oneWay-platform edge-case as first suspected.
 for(const t of AB_TERRAIN){
  const floor=1566,b=s.add.rectangle(t.x+t.width/2,(t.y+floor)/2,t.width,floor-t.y,0,0);
  s.physics.add.existing(b,true);s.solids.add(b);b.setData('oneWay',false).setData('id',t.id);s.routePlatforms.push(b);
  for(let x=t.x;x<t.x+t.width;x+=54)for(let y=t.y;y<floor;y+=54){
   const left=x===t.x&&surfaceAt(x-1)>y,right=x+54>=t.x+t.width&&surfaceAt(x+54)>y;
   // BUGFIX (confirmed by sampling actual pixel rows of the source PNG,
   // not visual guessing): this terrain tile family repeats the SAME
   // 4-column pattern on every row — col+0 = dark bar on BOTH sides,
   // col+1 = dark bar on the LEFT only, col+2 = plain fill (no bar),
   // col+3 = dark bar on the RIGHT only. Verified directly: frame 120
   // has the dark color at pixel columns [0,1,16,17] (BOTH sides), frame
   // 121 has it only at [0,1] (LEFT), frame 123 only at [16,17] (RIGHT) —
   // confirmed identically for the 100/101/103 and 140/141/143 row
   // triples and for the already-correct top-row 20/21/23 in use above.
   // The mid-depth branch here had it backwards: it used 120 (BOTH) for
   // a left-only column and 121 (LEFT) for a right-only column, and never
   // used 123 at all — so a right-hand cliff face was rendering a LEFT-
   // style dark bar (wrong side) and a left-hand cliff face was getting
   // an extra, unwanted dark bar on its interior-facing side too. That
   // second, wrong-side bar sitting a few pixels in from the true edge is
   // what was reading as "a dark line inside the dirt." Same fix applied
   // to the bottom-row branch, which was missing the both-sides case
   // entirely (defaulted to the left-only frame).
   const frame=y===t.y?(left&&right?20:left?21:right?23:22):y+54>=floor?(left&&right?140:left?141:right?143:142):(left&&right?120:left?121:right?123:4+((x/54+y/54)&1));
   tile(frame,x,y,9,Math.min(54,t.x+t.width-x),Math.min(54,floor-y));
  }
 }
 for(const d of DECKS){
  const deckArt=s.deck(d);s.platform(d);
  if(d.id==='E-cave-walkway'){
   // Phase 6.5C2A: the one deck in the pipe run that is actually walkable
   // (confirmed live — audits/denai-v12/phase6-5c1/coordinate-issues.md),
   // visually indistinguishable before this from the purely-decorative
   // pipe tiles stacked directly above it. The already-used pipe-joint
   // frame (93, already in service on the real pipe at environment.js's
   // waterworks section) at both ends marks it as "connected to the pipe
   // system, walkable" without altering s.platform (called exactly as for
   // every other deck) or any decorative pipe frame/segment elsewhere.
   // V13: dropped the accompanying setTint() call — this build runs
   // Phaser.CANVAS, where it's a confirmed no-op (see the Zone C/F
   // comments on the same finding), so it was shipping a dead instruction.
   // The end-cap frames above are the real, working differentiator.
   tile(93,d.x,d.y-18,11,54,18);
   tile(93,d.x+d.width-54,d.y-18,11,54,18);
  }
 }
 for(const l of LADDERS){
  for(let y=l.top;y<l.bottom;y+=54)tile(71,l.x-27,y,13,54,Math.min(54,l.bottom-y));
  const z=s.add.zone(l.x,(l.top+l.bottom)/2,56,l.bottom-l.top+72);s.physics.add.existing(z,true);z.setData('ladder',l);s.ladderZones.push(z);
 }
 // Start landmark tree — the first thing the player sees, same verified
 // trunk/canopy assembly as every other sceneryTree() call in this codebase.
 s.sceneryTree(30,1296,1.1);
 // Crate-puzzle supports (start-ledge, level.js) sit behind the walking
 // plane and end at the ledge's own real floor.
 post(220,1134,1188);post(328,1134,1188);
 // Optional tower: a tree marking the reward platform at the top, plus a
 // short dashed "this leads somewhere" trail at the ladder's base so the
 // detour reads as deliberate, not an unexplained post sticking out of
 // the ground. DECKS/LADDERS already render the ladder/tower-mid deck/
 // tower-top platform generically via the loops above.
 s.sceneryTree(640,864,.85);
 for(let x=460;x<670;x+=54)tile(107,x,1314,5,54,36).setAlpha(.3);
 // Mechanism-approach composition (Task 2 representative scene): tree +
 // bush pair frame the dip BEFORE the sign, a second bush grounds the
 // gate's far post AFTER it — the control bank itself (selector/lever/
 // sign/readout) stays completely clear so nothing sits on top of an
 // interactable. Reads as "walk past a planted roadside, arrive at the
 // machine," not an isolated tree floating near unrelated hardware.
 s.sceneryTree(1500,1350,.9);
 s.add.image(1440,1350,'kpp_bush_a').setOrigin(.5,1).setDisplaySize(32,27).setDepth(3.2);
 s.add.image(1572,1350,'kpp_bush_b').setOrigin(.5,1).setDisplaySize(30,25).setDepth(3.2);
 s.add.image(2060,1296,'kpp_bush_a').setOrigin(.5,1).setDisplaySize(34,28).setDepth(3.2);
 // Probe sign + readout, ahead of the relocated lift gate.
 tile(85,1660,1296,11);s.probeReadout=s.label('Input → f → output',1687,1216,14);
 // Lift control bank: selector -> lever -> gate, same compact grouping
 // V13 used, repositioned to this slice's own gate at x1810.
 post(1756,1188,1296);post(2080,1188,1296);beam(1756,1170,324);
 for(let x=1720;x<1810;x+=54)tile(91,x,1269,5,Math.min(54,1810-x),54);
 s.lever=tile(64,1760,1242,12);
 s.bInput=null;s.bLastTrial=null;
 s.bSelector=tile(85,1680,1242,12);
 s.bSelectorLabel=s.add.text(1707,1232,'?',{fontFamily:'Arial,sans-serif',fontSize:'18px',color:'#fff2ce',backgroundColor:'#6f3e43',padding:{x:8,y:4}}).setOrigin(.5,1).setDepth(14);
 s.liftReadout=s.label('f(3) = ? · sasaran 7',2069,1128,13);
 s.liftState=s.label('Terkunci',2069,1216,12);
 s.liftPlanks=s.deck({...GATES[0],y:GATES[0].parkedY});
 s.liftPlanks.forEach(a=>a.setVisible(false));
 s.actuatorMarks=[];
 for(let i=0;i<3;i++)s.actuatorMarks.push(tile(107,1796+i*36,1134,5,36,36).setAlpha(.4));
 for(let i=0;i<7;i++)s.actuatorMarks.push(tile(107,1904+i*36,1134,5,36,36).setAlpha(.4));
 // Ground-tick accents (frame 124) at a varying offset per step, the same
 // device V13 used to avoid every dip/rise reading as an identical stair.
 // 3930/4130 repositioned to 4150/4290 — their old x,y matched the
 // pre-redesign final-dip/final-rise positions (now 'mid-notch' and
 // 'upper-plateau', see level.js's terrain-pass note); left as-is they'd
 // float in open air or sit at the wrong surface height.
 for(const [x,y] of [[40,1296],[440,1350],[750,1296],[1080,1296],[1390,1350],[2120,1296],[2420,1296],[3670,1296],[4150,1350],[4290,1296],[4440,1296]])tile(124,x,y-54,10);
 // Finish landmark — the goal reads as a distinct destination, not just
 // where the ground happens to stop.
 s.sceneryTree(4650,1296,1.05);
 tile(124,4600,1242,10);tile(124,4700,1242,10);
 // VISUAL PASS: the route had only 4 broad-canopy trees across ~4900px —
 // far sparser than the Kenney reference's clustered composition. These
 // use the SAME verified sceneryTree() 3x3-canopy+trunk assembly as the
 // 4 above (not a new asset, not a stretched single sprite), at varied
 // scale so the route reads as a planted landscape, not evenly-spaced
 // copies. Clear of every prop/sign/lever/ladder footprint already placed
 // above. kpp_bush_a/kpp_bush_b (separate verified sprites, distinct from
 // the frame-124 bush already used for ground ticks) add low variety at
 // a few transitions without another full tree.
 s.sceneryTree(1220,1296,.8);
 s.sceneryTree(2230,1296,.9);
 s.sceneryTree(3760,1296,.85);
 // Repositioned from x4230 (would now float in the gap between mid-notch
 // and upper-plateau after the terrain-pass redesign) to x4350.
 s.sceneryTree(4350,1296,.7);
 for(const [x,y,key] of [[300,1296,'kpp_bush_a'],[1250,1296,'kpp_bush_b'],[2260,1296,'kpp_bush_a'],[3820,1296,'kpp_bush_b'],[4280,1296,'kpp_bush_a']])
  s.add.image(x,y,key).setOrigin(.5,1).setDisplaySize(36,30).setDepth(3.2);
 // DENAI SECTION COMPOSITION: no extra collision, no second ladder.
 // Landmarks are grouped around real supported ground surfaces. The open
 // spans around the selector, lever, narrow jumps and checkpoint flags stay
 // intentionally clear. All these ornaments sit behind the player.
 const accent=(x,feet,frame=107)=>tile(frame,x,feet-45,5,38,38);
 const shrub=(x,feet,which='kpp_bush_a',width=40)=>s.add.image(x,feet,which)
   .setOrigin(.5,1).setDisplaySize(width,30).setDepth(3.4);
 // Section 1 / Arrival: a little grove by the crate, not a forest wall.
 shrub(90,1296,'kpp_bush_b',35);accent(286,1296);
 // Section 2 / Raised walk: a small and an asymmetric tree to frame a
 // meaningful high detour; not another ladder to nowhere.
 s.sceneryTree(815,1296,.64);shrub(860,1296,'kpp_bush_a',28);
 // Section 3 / Machine: leave ~x1600–1810 visual air around the levers.
 shrub(1392,1350,'kpp_bush_b',34);
 // Section 4 / Stepping stones: decoration stays off jump decks; only
 // low distant foliage at entry / recovery, emphasizing the jump arcs.
 shrub(2200,1296,'kpp_bush_b',28);shrub(3830,1296,'kpp_bush_a',40);
 // Section 5 / Finish: a landmark pair and gentle vegetation.
 s.sceneryTree(4450,1296,.67);shrub(4610,1296,'kpp_bush_b',26);
 // A short trail of actual Kenney ground details marks the optional
 // first detour. It never overlaps the crate/pressure plate collision.
 for(const x of [425,480,535,590])accent(x,1350,107);
 CHECKPOINTS.forEach((c,i)=>s.checkpointArts[i]=s.add.image(c.x,c.feet,'kpp_terrain_atlas',111).setOrigin(.5,1).setScale(3).setDepth(11));
 s.spawnCollectibles();s.buildSecrets();s.buildCratePuzzle();
}
export function buildSecretMarkers(s){
 s.secretMarkers={};
 for(const d of SECRETS){
  const marker=s.add.image(d.x,d.feet-80,'kpp_terrain_atlas',67).setScale(2).setDepth(14).setAlpha(s.discoveredSecrets.has(d.id)?1:.35);
  s.secretMarkers[d.id]=marker;
  // V13: an undiscovered secret previously sat still at a low, easy-to-miss
  // alpha — nothing distinguished "there's a reward here" from ordinary
  // background art. The same gentle bob already used for every collectible
  // coin (spawnCollectibles() in game.js) now also plays on an undiscovered
  // marker, so Zone C's bonus-mapping reward reads as something alive and
  // worth seeking out, not a static prop. Stops the moment it's found.
  if(!s.discoveredSecrets.has(d.id)&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   s.tweens.add({targets:marker,y:marker.y-10,duration:950,yoyo:true,repeat:-1,ease:'Sine.inOut'});
  }
 }
}

