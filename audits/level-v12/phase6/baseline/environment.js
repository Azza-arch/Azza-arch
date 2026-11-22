import {AB_TERRAIN,DECKS,LADDERS,CHECKPOINTS,GATES,SECRETS,SURFACES,F_MOVING_PLATFORM} from './level.js';
export function buildWorld(s){
 s.textures.get('kpp_terrain_atlas').setFilter(Phaser.Textures.FilterMode.NEAREST);
 s.worldObjects=[];s.mappingInputs=new Set();s.mappingDone=false;s.probeSeen=new Set();
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
 for(const d of DECKS){s.deck(d);s.platform(d);}
 for(const l of LADDERS){
  for(let y=l.top;y<l.bottom;y+=54)tile(71,l.x-27,y,13,54,Math.min(54,l.bottom-y));
  const z=s.add.zone(l.x,(l.top+l.bottom)/2,56,l.bottom-l.top+72);s.physics.add.existing(z,true);z.setData('ladder',l);s.ladderZones.push(z);
 }
 // C's short supported timber deck; no façade or café objects.
 post(1458,882,1188);post(1620,882,1134);post(1836,882,1080);
 beam(1458,918,432);tile(90,1485,936);tile(92,1818,936);
 s.mappingReadout=s.label('0→?  1→?  2→?  3→?',1692,696,13).setAlpha(.86);
 tile(85,1665,810,11);
 // R01 owns the full tree landmark; the lift and its landing stay visually clear.
 s.sceneryTree(120,1296);
 for(const [x,y] of [[10,1296],[360,1242],[1000,1242],[1370,1242],[1640,1134],[2520,1080],[2840,972],[3060,972],[4020,972]])tile(124,x,y-54,10);
 // R02 ledge supports are behind the walking plane and end at its real floor.
 post(774,1140,1242);post(900,1140,1242);
 tile(84,180,1242,11);
 tile(85,1665,1080,11);s.probeReadout=s.label('Input → f → output',1692,1000,14);
 // R05: compact supported lintel and short rooted guides; moving deck is
 // visually distinct from fixed posts and rails.
 post(2106,972,1080);post(2484,972,1080);beam(2106,954,432);
 for(let x=2070;x<2160;x+=54)tile(91,x,1053,5,Math.min(54,2160-x),54);
 s.lever=tile(64,2043,1026,12);
 s.liftReadout=s.label('f(3) = ? · sasaran 7',2322,912,13);
 s.liftState=s.label('Terkunci',2322,1000,12);
 s.liftPlanks=s.deck({...GATES[0],y:GATES[0].parkedY});
 s.liftPlanks.forEach(a=>a.setVisible(false));
 s.actuatorMarks=[];
 for(let i=0;i<7;i++)s.actuatorMarks.push(tile(107,2187+i*36,885,5,36,36).setAlpha(.4));
 CHECKPOINTS.forEach((c,i)=>s.checkpointArts[i]=s.add.image(c.x,c.feet,'kpp_terrain_atlas',111).setOrigin(.5,1).setScale(3).setDepth(11));
 // R07/D transition and R08 number-block station. The gap is the gated
 // timber span: its art starts visibly below both banks and rises on solve.
 s.numberBlockArts=[];s.numberBlockHomes={};
 for(const [i,n] of [2,3,4].entries()){tile(9,3102+i*54,918,11);s.numberBlockArts[n]=tile(160+n,3102+i*54,918,12);s.numberBlockHomes[n]=3102+i*54;}
 // R08: simple open rack, input socket, and output display (no façade).
 post(3078,810,918);post(3294,810,918);beam(3078,792,216);
 tile(9,3372,918,11);tile(85,3420,918,11);s.numberReadout=s.label('g(x) = 3x − 2  ·  10',3462,810,11);
 s.numberState=null;
 s.numberSpan=s.deck({...GATES[1],y:GATES[1].parkedY});
 // R09 optional supported service route. Ladder is the only access; it
 // returns to the same safe floor and does not bypass the machine.
 post(3294,738,972);post(3510,738,972);
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
 // Optional platforming route: familiar timber deck tiles move above the
 // retained cave roof. The Arcade body is independent of its tile artwork.
 const fDeckX=F_MOVING_PLATFORM.minX;
 const fDeckArt=s.deck({x:fDeckX,y:F_MOVING_PLATFORM.y,width:F_MOVING_PLATFORM.width});
 const fDeckBody=s.platform({id:F_MOVING_PLATFORM.id,x:fDeckX,y:F_MOVING_PLATFORM.y,width:F_MOVING_PLATFORM.width});
 fDeckBody.body.position.y=F_MOVING_PLATFORM.y;fDeckBody.body.updateCenter();
 s.fMovingPlatform={config:F_MOVING_PLATFORM,x:fDeckX,direction:1,art:fDeckArt,body:fDeckBody};
 tile(85,6400,1080,11);
 for(const x of [5650,5812,5974,6568,6730,6892,7108]) tile(124,x+54, (SURFACES.find(t=>t.x===x)?.y ?? 972)-54,10);
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
 // Door and destination flag use approved Kenney atlas frames.
 tile(130,8262,864,11);tile(150,8262,918,11);tile(110,8370,918,11);
 // No D terminal art is used as a fake door or building.
 s.spawnCollectibles();s.buildSecrets();s.buildCratePuzzle();
}
export function buildSecretMarkers(s){
 s.secretMarkers={};for(const d of SECRETS)s.secretMarkers[d.id]=s.add.image(d.x,d.feet-80,'kpp_terrain_atlas',67).setScale(2).setDepth(14).setAlpha(s.discoveredSecrets.has(d.id)?1:.35);
}

