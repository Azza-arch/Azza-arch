import {AB_TERRAIN,DECKS,LADDERS,CHECKPOINTS,GATES,SECRETS} from './level.js';
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
 s.actuatorMarks=[];
 for(let i=0;i<7;i++)s.actuatorMarks.push(tile(107,2187+i*36,885,5,36,36).setAlpha(.4));
 CHECKPOINTS.forEach((c,i)=>s.checkpointArts[i]=s.add.image(c.x,c.feet,'kpp_terrain_atlas',111).setOrigin(.5,1).setScale(3).setDepth(11));
 // R07/D transition and R08 number-block station. The gap is the gated
 // timber span: its art starts visibly below both banks and rises on solve.
 s.numberBlockArts=[];
 for(const [i,n] of [2,3,4].entries()){tile(9,3102+i*54,918,11);s.numberBlockArts[n]=tile(160+n,3102+i*54,918,12);}
 // R08: simple open rack, input socket, and output display (no façade).
 post(3078,810,918);post(3294,810,918);beam(3078,792,216);
 tile(9,3372,918,11);tile(85,3420,918,11);s.numberReadout=s.label('g(x) = 3x − 2  ·  10',3420,810,13);
 s.numberState=null;
 s.numberSpan=s.deck({...GATES[1],y:GATES[1].parkedY});
 // R09 optional supported service route. Ladder is the only access; it
 // returns to the same safe floor and does not bypass the machine.
 post(3294,738,972);post(3510,738,972);
 s.compositionHeader=s.label('f(2) ↔ g(2)',3960,858,13);
 s.compositionReadout=s.label('Pilih susunan · hasil 13 / 9',3960,810,12);
 s.compositionConsole=tile(85,3915,918,11);
 // R11–R12: connected, source-derived waterworks. The low bank under the
 // optional roof route is real recovery terrain; the R12 crossing has its
 // own lower recovery floor and two return ladders. Pipe artwork stays
 // decorative and is never added to Arcade collision.
 post(4104,1152,1296);post(4428,810,1080);post(4482,810,1080);
 post(4428,1098,1296);post(4536,1098,1296);
 post(4590,864,1026);post(4806,864,1026);
 post(4860,810,972);post(5022,810,972);
 post(5130,810,864);post(5238,810,864);
 // Source tank is moved into the visible R11/R12 overlap and sits directly
 // above rooted posts. The pipe exits its right wall, traverses both stages,
 // and enters the reservoir at its left wall; the outlet leaves the tank
 // base and drops to the separate crossing control. All pipe art is visual.
 s.ePipeArt=[];
 s.sourceTank=[tile(34,4428,702,11),tile(35,4482,702,11),tile(74,4428,756,11),tile(75,4482,756,11)];
 s.ePipeArt.push(tile(94,4536,756,10));
 for(let x=4590;x<5130;x+=54)s.ePipeArt.push(tile(x+54>=5130?134:133,x,756,10));
 // Two operation housings sit over the continuous conduit. Formula copy is
 // proximity-scoped; the interaction panel remains the complete lesson.
 s.waterStageBoards=[tile(85,4860,702,11),tile(85,5022,702,11)];
 s.waterStage1=s.add.text(4887,690,'F · 2x + 1',{fontFamily:'Arial,sans-serif',fontSize:'16px',fontStyle:'bold',color:'#123b4a',stroke:'#ffffff',strokeThickness:3}).setOrigin(.5,1).setDepth(13);
 s.waterStage2=s.add.text(5049,690,'G · 3x − 2',{fontFamily:'Arial,sans-serif',fontSize:'16px',fontStyle:'bold',color:'#123b4a',stroke:'#ffffff',strokeThickness:3}).setOrigin(.5,1).setDepth(13);
 s.waterTag=s.add.text(5100,858,'Pilih urutan',{fontFamily:'Arial,sans-serif',fontSize:'13px',fontStyle:'bold',color:'#123b4a',stroke:'#ffffff',strokeThickness:3}).setOrigin(.5,1).setDepth(13);
 // Reservoir has supported walls and begins visibly low; its water tiles
 // rise to full opacity only after the correct composition is selected.
 s.reservoir=[tile(34,5130,702,11).setAlpha(.38),tile(35,5184,702,11).setAlpha(.38),tile(74,5130,756,11).setAlpha(.38),tile(75,5184,756,11).setAlpha(.38)];
 // A short timber cradle makes the tank look supported; the centered pipe
 // begins exactly under its base so the inlet and outlet read as one circuit.
 beam(5130,810,108);post(5130,864,972);post(5238,864,972);
 s.ePipeArt.push(tile(133,5130,756,10),tile(95,5184,756,10),tile(115,5184,810,10),tile(135,5184,864,10),tile(134,5184,918,10));
 s.eWaterPath=[{x:4563,y:783},{x:4698,y:783},{x:4833,y:783},{x:4968,y:783},{x:5103,y:783},{x:5130,y:783},{x:5184,y:783},{x:5184,y:837},{x:5184,y:891}];
 s.waterOutput=tile(64,5238,918,12);
 s.waterOutputLabel=s.add.text(5292,858,'Lintasan air',{fontFamily:'Arial,sans-serif',fontSize:'13px',fontStyle:'bold',color:'#123b4a',stroke:'#ffffff',strokeThickness:3}).setOrigin(.5,1).setDepth(13);
 s.waterConsole=tile(85,5073,918,12);
 s.waterFlowDot=s.add.image(4347,783,'kpp_terrain_atlas',33).setDisplaySize(18,18).setDepth(14).setVisible(false);
 s.waterBridge=s.deck({...GATES[2],y:GATES[2].parkedY});
 s.eReadouts=[s.waterStage1,s.waterStage2,s.waterTag,s.waterOutputLabel];s.eReadouts.forEach(readout=>readout.setVisible(false));
 // No D terminal art is used as a fake door or building.
 s.spawnCollectibles();s.buildSecrets();s.buildCratePuzzle();
}
export function buildSecretMarkers(s){
 s.secretMarkers={};for(const d of SECRETS)s.secretMarkers[d.id]=s.add.image(d.x,d.feet-80,'kpp_terrain_atlas',67).setScale(2).setDepth(14).setAlpha(s.discoveredSecrets.has(d.id)?1:.35);
}
