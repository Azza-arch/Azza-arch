import {AB_TERRAIN,DECKS,LADDERS,CHECKPOINTS,GATES,SECRETS,SURFACES,F_MOVING_PLATFORM,WORLD} from './level.js';
export function buildWorld(s){
 s.textures.get('kpp_terrain_atlas').setFilter(Phaser.Textures.FilterMode.NEAREST);
 s.textures.get('kpp_bg_hill').setFilter(Phaser.Textures.FilterMode.NEAREST);
 s.textures.get('kpp_tree').setFilter(Phaser.Textures.FilterMode.NEAREST);
 s.worldObjects=[];s.cClues=new Set();s.probeSeen=new Set();s.eReadoutShown=false;s.eOutputShown=false;
 s.riverInputSel=null;s.riverLastInputTrial=null;s.riverOrderSel=null;s.riverLastOrderTrial=null;
 // Phase 6.5C2A (audits/denai-v12/phase6-5c2a/): background/midground depth
 // layers. Both textures were loaded but 100% unused before this (see
 // audits/denai-v12/phase6-5c1/verified-asset-options.md) — no new asset,
 // no download. Plain non-colliding add.image calls, the same primitive
 // already used below for secretMarkers/cave-entrance blocks — no physics
 // body is ever attached. Depths .5/1.5 sit below every gameplay layer
 // (ground=9, decks=10, signs=11, ladders=13), so neither layer can ever
 // render in front of, or be mistaken for, a real surface. Vertical
 // placement (bgY=430, treeY bottom=640) clears the highest real platform
 // in the level (D-service, y=738) by 100-300px with margin, and both sit
 // inside the camera's own vertical bounds (top=300, see game.js).
 // scrollFactor <1 makes each layer drift slower than the foreground
 // (classic parallax); the loop is drawn across the full WORLD.width so
 // there is never a gap regardless of how far that drift lags the camera.
 const bgScale=3,bgSize=24*bgScale,bgY=430;
 for(let x=-bgSize;x<WORLD.width+bgSize;x+=bgSize)s.add.image(x,bgY,'kpp_bg_hill').setOrigin(0,0).setScale(bgScale).setDepth(.5).setAlpha(.4).setScrollFactor(.3,.2);
 const treeScale=3,treeStep=540;
 // Phase 6.5C2B: the fixed 540px stride puts one tree at x=8250, 12px from
 // the destination door (tile(130/150,8262,...) below) — confirmed live,
 // see audits/denai-v12/phase6-5c2b/final-report.md §2. Skipping the goal
 // approach (x>=8100) leaves open sky behind the finale door instead of a
 // tree silhouette crowding it; every other tree position is unaffected.
 for(let x=150;x<WORLD.width-150;x+=treeStep)if(x<8100)s.add.image(x,640,'kpp_tree').setOrigin(.5,1).setScale(treeScale).setDepth(1.5).setAlpha(.65).setScrollFactor(.55,.4);
 const tile=(frame,x,y,depth=4,w=54,h=54)=>{
  const a=s.add.image(x,y,'kpp_terrain_atlas',frame).setOrigin(0).setScale(3).setCrop(0,0,w/3,h/3).setDepth(depth);
  s.worldObjects.push({frame,x,y,width:w,height:h,collision:false});return a;
 };s.tile=tile;
 const post=(x,top,bottom)=>{for(let y=top;y<bottom;y+=54)tile(89,x,y,4,54,Math.min(54,bottom-y));};
 const beam=(x,y,width)=>{for(let a=0;a<width;a+=54)tile(a===0?48:a+54>=width?50:49,x+a,y,4,Math.min(54,width-a),18);};
 const surfaceAt=x=>AB_TERRAIN.find(t=>x>=t.x&&x<t.x+t.width)?.y??Infinity;
 const baseTerrain=[...AB_TERRAIN,{id:'D-approach',x:3024,y:972,width:540,room:'R08'},{id:'D-landing',x:3834,y:972,width:270,room:'R10'}];
 for(const t of baseTerrain){
  const floor=1566,b=s.add.rectangle(t.x+t.width/2,(t.y+floor)/2,t.width,floor-t.y,0,0);
  s.physics.add.existing(b,true);s.solids.add(b);b.setData('oneWay',false).setData('id',t.id);s.routePlatforms.push(b);
  for(let x=t.x;x<t.x+t.width;x+=54)for(let y=t.y;y<floor;y+=54){
   const left=x===t.x&&surfaceAt(x-1)>y,right=x+54>=t.x+t.width&&surfaceAt(x+54)>y;
   const frame=y===t.y?(left&&right?20:left?21:right?23:22):y+54>=floor?(left?141:right?143:142):(left?120:right?121:4+((x/54+y/54)&1));
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
 // C's short supported timber deck; no façade or café objects.
 post(1458,882,1188);post(1620,882,1134);post(1836,882,1080);
 beam(1458,918,432);tile(90,1485,936);tile(92,1818,936);
 // Zone C: two world-mounted clue signs (observations), one apply sign near
 // the reward. Reuses the same frame-85 sign art as Zone B's selector.
 // Terminal x's (c-clue-a 1500, c-clue-b 1610, c-apply 1720 in level.js) are
 // untouched — only this art's presentation changes, so every prompt still
 // lines up with its real interaction point.
 s.cClueArt={a:tile(85,1473,810,11),b:tile(85,1583,810,11)};
 s.cApplyArt=tile(85,1693,810,11);
 // V13: the three signs previously shared one identical size/height and an
 // even 110px rhythm, reading as three identical quiz stations in a row.
 // This build runs Phaser.CANVAS (see game.js's createGame()), where
 // setTint/setTintFill on a static image is a confirmed no-op — verified
 // live here (pure red and pure green fills produced zero visible change)
 // before committing to it, so color was dropped as the differentiator.
 // Scale and height read correctly under CANVAS instead: the second
 // observation sits very slightly smaller (a quieter "step two"), and the
 // apply sign — the one real action in this trio — stands taller and
 // larger, reading as the station that actually matters. A small frame-107
 // tick, the same mechanism-path accent used elsewhere, sits in the gap
 // between the two observations and the apply sign, marking "these two
 // feed into that one" instead of one unbroken row.
 s.cClueArt.b.setScale(2.7);
 s.cApplyArt.setScale(3.45).setY(802);
 tile(107,1638,828,11,36,36).setAlpha(.5);
 s.cReadout=s.label('',1692,696,13).setAlpha(.86);
 // R01 owns the full tree landmark; the lift and its landing stay visually
 // clear. V13: scaled up ~18% from the Phase-6.5 baseline (still the exact
 // same trunk/canopy tile set, same 3x3-grid construction in sceneryTree()
 // below — only its displaySize grows) so the very first thing the player
 // sees reads as a deliberate anchor, not an incidental background tree.
 s.sceneryTree(120,1296,1.18);
 // A short dashed accent trail (frame 107, the same "mechanism path" tick
 // already used to tie B's selector to its lift) between the crate's rest
 // spot (x540) and the plate it needs to reach (x810) — reads as "this is
 // where the crate travels," not a random scatter. Clear of both props'
 // own footprints (crate 516-564, plate 783-837).
 for(let x=594;x<756;x+=54)tile(107,x,1206,5,54,36).setAlpha(.35);
 // Phase 6.5C2B had placed a bush at x=360 (18px from the a-safe checkpoint
 // flag at x=378) and another at x=1260 (36px from the a-gap checkpoint
 // flag at x=1296) — both effectively hidden behind/under the checkpoint
 // art rather than reading as distinct accents. V13 removes those two and
 // moves the landing's remaining bush from x=1370 to x=1416, so it marks
 // the clean hand-off into Zone C's ladder instead of bunching with a
 // neighbor 110px away.
 // V13: B's post-lift staircase (B-bank/B-terrace/B-overlook) previously
 // echoed the pre-lift staircase's exact single-bush-per-step rhythm,
 // reading as the same silhouette twice. Its terrace step (2646-2808) had
 // no accent at all; adding one there and varying all three steps' offsets
 // (the same device already used for Zone F's descent) gives the reward
 // side of the lift a distinct, less uniform read from the climb before it.
 for(const [x,y] of [[10,1296],[1000,1242],[1416,1242],[1640,1134],[2566,1080],[2700,1026],[2890,972],[3060,972],[4020,972]])tile(124,x,y-54,10);
 // R02 ledge supports are behind the walking plane and end at its real floor.
 post(774,1140,1242);post(900,1140,1242);
 // V13: removed a stray frame-84 prop that sat here with no clear identity
 // (not a sign, not terrain-matched, the only one of its kind in the
 // level) — the start's focal point is now the landmark tree plus the new
 // departure flag above, not an unrelated ground prop.
 tile(85,1665,1080,11);s.probeReadout=s.label('Input → f → output',1692,1000,14);
 // R05: compact supported lintel and short rooted guides; moving deck is
 // visually distinct from fixed posts and rails.
 post(2106,972,1080);post(2484,972,1080);beam(2106,954,432);
 for(let x=2070;x<2160;x+=54)tile(91,x,1053,5,Math.min(54,2160-x),54);
 s.lever=tile(64,2043,1026,12);
 s.bInput=null;s.bLastTrial=null;
 s.bSelector=tile(85,1933,1026,12);
 s.bSelectorLabel=s.add.text(1960,1016,'?',{fontFamily:'Arial,sans-serif',fontSize:'18px',color:'#fff2ce',backgroundColor:'#6f3e43',padding:{x:8,y:4}}).setOrigin(.5,1).setDepth(14);
 s.liftReadout=s.label('f(3) = ? · sasaran 7',2322,912,13);
 s.liftState=s.label('Terkunci',2322,1000,12);
 s.liftPlanks=s.deck({...GATES[0],y:GATES[0].parkedY});
 s.liftPlanks.forEach(a=>a.setVisible(false));
 s.actuatorMarks=[];
 // Phase 6.5C2B: the existing actuator-mark row (below) started at x=2187,
 // leaving a 144px gap back to the lever (x=2043) with nothing visually
 // tying selector → lever → lift together as one control bank. Three more
 // marks at the same frame/style/36px stride close that gap without moving
 // the lever, selector, or lift gate.
 // V13: this whole row previously floated at y=885, 69px above the gantry
 // beam (beam(2106,954,432) below) with nothing visually under it —
 // confirmed live, a thin strip of ticks hanging in open sky. Resting it
 // directly on the beam's own top edge (954-36=918) reads as hardware
 // mounted on the gantry's spine instead of a disconnected floating prop,
 // which is what actually ties selector → lever → lift together.
 for(let i=0;i<3;i++)s.actuatorMarks.push(tile(107,2079+i*36,918,5,36,36).setAlpha(.4));
 for(let i=0;i<7;i++)s.actuatorMarks.push(tile(107,2187+i*36,918,5,36,36).setAlpha(.4));
 CHECKPOINTS.forEach((c,i)=>s.checkpointArts[i]=s.add.image(c.x,c.feet,'kpp_terrain_atlas',111).setOrigin(.5,1).setScale(3).setDepth(11));
 // R07/D transition and R08 number-block station. The gap is the gated
 // timber span: its art starts visibly below both banks and rises on solve.
 s.numberBlockArts=[];s.numberBlockHomes={};
 for(const [i,n] of [2,3,4].entries()){tile(9,3102+i*54,918,11);s.numberBlockArts[n]=tile(160+n,3102+i*54,918,12);s.numberBlockHomes[n]=3102+i*54;}
 // R08: simple open rack, input socket, and output display (no façade).
 // V13: the rack's right post (x=3294, was post(3294,810,918)) exactly
 // duplicated the lower half of the service ledge's own left post
 // (post(3294,738,972) below, same x, its 810-918 span fully inside
 // 738-972) — two overlapping copies of the same tile stack, confirmed
 // live. Dropped here; the taller service post already does both jobs,
 // which is more structurally honest anyway — one continuous post really
 // does carry both the rack's lintel and the ledge above it.
 // V13: the lintel previously stopped exactly at the rack's own width
 // (216px, ending at x=3294) with an 18px gap of open sky before the
 // service ladder — confirmed live, it read as a standalone little awning
 // rather than part of the same workshop. Extending it to x=3348 lets it
 // visibly rest on the service post at x=3294 too (the same post the
 // comment above folds the rack's lintel into), so blocks → rack → ladder
 // now read as one continuous structure instead of two separate set pieces.
 post(3078,810,918);beam(3078,792,270);
 tile(9,3372,918,11);tile(85,3420,918,11);s.numberReadout=s.label('g(x) = 3x − 2  ·  10',3462,810,11);
 s.numberState=null;
 s.numberSpan=s.deck({...GATES[1],y:GATES[1].parkedY});
 // R09 optional supported service route. Ladder is the only access; it
 // returns to the same safe floor and does not bypass the machine.
 post(3294,738,972);post(3510,738,972);
 // Phase 6.5C2A: ties D-rack/D-service/D-crossing into one "workshop"
 // identity per audits/denai-v12/phase6-5c1/zone-improvement-plan.md §D —
 // reuses the existing kpp_crate asset (already loaded for the Zone A
 // puzzle) as static, non-interactive stock resting on the real D-service
 // ledge directly above the rack. Purely decorative art (no physics body);
 // does not move or resize D-rack, the input socket signs, or D-crossing,
 // and does not touch any interaction radius.
 s.add.image(3330,738,'kpp_crate').setOrigin(.5,1).setDisplaySize(36,36).setDepth(10);
 s.add.image(3450,738,'kpp_crate').setOrigin(.5,1).setDisplaySize(30,30).setDepth(10);
 s.add.image(3480,738,'kpp_crate').setOrigin(.5,1).setDisplaySize(24,24).setDepth(10).setAlpha(.92);
 // V13: small support-bracket accents (frame 91, the same piece already
 // used under B's lift) in the rack's own narrow margins, beside the real
 // number blocks — reads as shelf hardware framing the mechanism, doesn't
 // move or resize the blocks/socket themselves.
 tile(91,3078,906,5,24,12);tile(91,3270,906,5,24,12);
 s.compositionHeader=s.label('f(2) ↔ g(2)',3960,858,13);
 s.compositionReadout=s.label('Pilih susunan · hasil 13 / 9',3960,810,12);
 s.compositionConsole=tile(85,3915,918,11);
 // R11-R12 use a compact, low pipe rack, a climbable service hollow, and a
 // recessed open output pool. Pipe sprites are decoration only; surfaces and
 // the gate below are the independent collision model.
 post(4536,864,972);post(4752,864,972);post(4968,864,972);
 beam(4482,846,540);
 // Water source rests directly on the raised natural terrace.
 s.sourceTank=[tile(34,4374,756,11),tile(35,4428,756,11),tile(74,4374,810,11),tile(75,4428,810,11)];
 s.ePipeArt=[];
 // Source outlet runs through F and G stations, then turns down into the pool.
 s.ePipeArt.push(tile(133,4482,783,10));
 for(let x=4536;x<5022;x+=54)s.ePipeArt.push(tile(x+54>=5022?134:133,x,783,10));
 s.ePipeArt.push(tile(94,5022,783,10));
 s.ePipeArt.push(tile(95,5022,837,10),tile(115,5022,891,10),tile(115,5022,945,10),tile(135,5022,999,10));
 // Two stage controls sit on existing walkable banks. Frame 85 is the
 // already-used Kenney wooden control-board tile; text remains world UI.
 s.waterStageBoards=[tile(85,4374,810,11),tile(85,4860,918,11)];
 const stageStyle={fontFamily:'Arial,sans-serif',fontSize:'15px',fontStyle:'bold',color:'#fff2ce',backgroundColor:'#203e36',padding:{x:6,y:4}};
 s.waterStage1=s.add.text(4428,804,'F · 2x + 1',{...stageStyle}).setOrigin(.5,1).setDepth(14);
 s.waterStage2=s.add.text(4914,912,'G · 3x − 2',{...stageStyle}).setOrigin(.5,1).setDepth(14);
 s.waterTag=s.add.text(5076,900,'Pilih susunan untuk uji',{...stageStyle,fontSize:'13px'}).setOrigin(.5,1).setDepth(14);
 // Two surface-water sprites rise only after flow reaches the recessed basin.
 s.reservoir=[tile(33,5022,999,11).setAlpha(.45),tile(33,5076,999,11).setAlpha(.45),tile(33,5130,999,11).setAlpha(.45)];
 // Short outlet conduit physically reaches the control lever on the safe bank.
 s.ePipeArt.push(tile(135,5130,972,10),tile(93,5130,918,10),tile(134,5184,918,10));
 s.waterOutput=tile(64,5238,918,12);
 s.waterOutputLabel=s.add.text(5292,918,'Lintasan air',{...stageStyle,fontSize:'13px'}).setOrigin(.5,1).setDepth(13).setVisible(false);
 s.waterResultLabel=s.add.text(5076,1090,'Takungan kosong',{...stageStyle,fontSize:'13px'}).setOrigin(.5,1).setDepth(14);
 s.waterFlowDot=s.add.image(4510,810,'kpp_terrain_atlas',33).setDisplaySize(18,18).setDepth(14).setVisible(false);
 s.waterBridge=s.deck({...GATES[2],y:GATES[2].parkedY});
 s.eWaterPath=[{x:4510,y:810},{x:4644,y:810},{x:4806,y:810},{x:4968,y:810},{x:5049,y:810},{x:5049,y:837},{x:5049,y:891},{x:5049,y:945},{x:5049,y:999},{x:5157,y:999},{x:5157,y:945},{x:5184,y:945},{x:5211,y:945}];
 s.eReadouts=[s.waterStage1,s.waterStage2];
 // The R11/R12 spans are held by short posts rooted on the main deck and banks.
 for(const [x,y] of [[10,1296],[360,1242],[1000,1242],[1370,1242],[1640,1134],[2520,1080],[2840,972],[3060,972],[4020,972],[4158,972],[4302,918],[5292,1296],[5508,972]])tile(124,x,y-54,10);
 // E ladder reaches a lower sheltered route with its own safe floor and reward.
 tile(9,4644,1134,11);tile(124,4590,1134,10);tile(124,4752,1134,10);
 // Zone F: visible stepped hillside; the lower cave is the open volume
 // between its dirt floor, the supported one-way roof, and solid end banks.
 post(6136,918,1134);post(6568,918,972);beam(6136,900,432);
 // Short guide-post bookends mark the moving deck's own travel range
 // (F_MOVING_PLATFORM.minX..maxX+width) — the same post() piece used for
 // every structural support in this file, just short stubs here — so the
 // crossing reads as "this slides along a track between these two posts"
 // instead of a plank floating disconnected above the cave roof.
 post(F_MOVING_PLATFORM.minX,792,828);
 post(F_MOVING_PLATFORM.maxX+F_MOVING_PLATFORM.width,792,828);
 // Optional platforming route: familiar timber deck tiles move above the
 // retained cave roof. The Arcade body is independent of its tile artwork.
 const fDeckX=F_MOVING_PLATFORM.minX;
 const fDeckArt=s.deck({x:fDeckX,y:F_MOVING_PLATFORM.y,width:F_MOVING_PLATFORM.width});
 const fDeckBody=s.platform({id:F_MOVING_PLATFORM.id,x:fDeckX,y:F_MOVING_PLATFORM.y,width:F_MOVING_PLATFORM.width});
 fDeckBody.body.position.y=F_MOVING_PLATFORM.y;fDeckBody.body.updateCenter();
 // V13: two frame-91 bracket accents (the same "hardware" piece already
 // used under B's lift and D's rack) riding on the deck's own underside —
 // this build runs Phaser.CANVAS, where setTint is a confirmed no-op (see
 // the Zone C clue-sign comment above), so a shape/hardware cue reads
 // reliably where a color cue would not. They travel with the platform via
 // fMovingPlatform.markers, translated by the same per-frame dx as its art
 // and body in updateMovingPlatform() (moving-platform.js) — never by a
 // fixed index*54 like the deck tiles, since these sit at an offset the
 // deck grid doesn't share.
 const fMarkerA=tile(91,fDeckX+6,F_MOVING_PLATFORM.y+12,13,24,12);
 const fMarkerB=tile(91,fDeckX+F_MOVING_PLATFORM.width-30,F_MOVING_PLATFORM.y+12,13,24,12);
 s.fMovingPlatform={config:F_MOVING_PLATFORM,x:fDeckX,direction:1,art:fDeckArt,body:fDeckBody,markers:[fMarkerA,fMarkerB]};
 tile(85,6400,1080,11);
 // Phase 6.5C2B: the ascent (5650/5812/5974) already reads as a hillside
 // (one bush per step, audits/denai-v12/phase6-5c1/visual-audit.md); the
 // descent (6730/6892/7108) had the identical fixed +54 offset on every
 // shelf, reading as a uniform staircase instead. Varying only the
 // descent's offset (same frame124, no coordinate/collision change) breaks
 // that repetition per zone-improvement-plan.md §F.
 for(const x of [5650,5812,5974]) tile(124,x+54, (SURFACES.find(t=>t.x===x)?.y ?? 972)-54,10);
 for(const [x,off] of [[6730,108],[6892,54],[7108,88]]) tile(124,x+off, (SURFACES.find(t=>t.x===x)?.y ?? 972)-54,10);
 // F's ridge is also the entry to the optional cave. The oversized tree at
 // this exact landing was purely decorative and crowded the ledge/player;
 // keep the cave route open and leave the A landmark untouched.
 // Zone G river is scenery only. Banks and gap collision are authored in
 // level.js; water tiles are kept separate from the player collider.
 for(let x=7506;x<7830;x+=54){tile(33,x,1080,8,54,54);for(let y=1134;y<1512;y+=54)tile(73,x,y,8,54,Math.min(54,1512-y));}
 post(7506,972,1080);post(7830,972,1080);
 tile(85,7336,918,11);
 // Split Kenney's combined lever tile at its hinge: the base stays fixed,
 // while only the handle turns around its visible lower hinge (11,12 px).
 const atlas=s.textures.get('kpp_terrain_atlas').getSourceImage();
 const atlasPiece=(key,sourceY,height)=>{
  if(!s.textures.exists(key)){
   const texture=s.textures.createCanvas(key,18,height);
   texture.getContext().drawImage(atlas,72,54+sourceY,18,height,0,0,18,height);
   texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
  return key;
 };
 const leverBaseTexture=atlasPiece('kpp_river_lever_base',10,8);
 const leverHandleTexture=atlasPiece('kpp_river_lever_handle',0,12);
 const riverX=7390,riverY=918;
 s.riverLeverBase=s.add.image(riverX,riverY+30,leverBaseTexture).setOrigin(0).setScale(3).setDepth(12);
 const riverPivotX=riverX+33,riverPivotY=riverY+33;
 const riverHandle=s.add.image(-33,-33,leverHandleTexture).setOrigin(0).setScale(3).setDepth(12);
 s.riverLever=s.add.container(riverPivotX,riverPivotY,[riverHandle]).setDepth(12).setAngle(0);
 s.riverBridge=s.deck({...GATES[3],y:GATES[3].parkedY});
 s.riverStatusText=s.label('Jambatan terkunci - dua pengunci diperlukan',7390,810,12);
 // V13: a simple post+beam arch frames the destination door, giving the
 // finale an "arrival" silhouette instead of a bare sign-height prop —
 // reuses the exact same post()/beam() helpers already used everywhere
 // else, no new frames, no change to GOAL/door coordinates below.
 post(8208,810,972);post(8334,810,972);beam(8208,792,180);
 // Door uses approved Kenney atlas frames.
 tile(130,8262,864,11);tile(150,8262,918,11);
 // V13: dropped the frame-110 "flag" fragment that stood at x=8370 — it
 // turns out to render as a small plain plank, not a flag (confirmed
 // live), and it sat mostly behind the arch's own right post (8334-8388)
 // while its right edge ran 24px past WORLD.width (8400). Removing it
 // lets the arch + door stand alone as the arrival's one clear focal
 // point instead of a stray fragment competing at the frame's edge.
 // No D terminal art is used as a fake door or building.
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

