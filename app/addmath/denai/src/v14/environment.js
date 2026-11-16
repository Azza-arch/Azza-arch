import {AB_TERRAIN,SLABS,DECKS,WALLS,LADDERS,CHECKPOINTS,GATES,SECRETS,WORLD,WATER,WATER_Y,GOAL} from './level.js';
import {buildSawmill} from './levels/sawmill.js';
// ─────────────────────────────────────────────────────────────────────────
// DENAI landscape system (Phase 2A).
// Everything here is drawn from verified frames of the Kenney Pixel
// Platformer atlas (tilemap_packed.png, 18px frames drawn at x3 = 54px) and
// its parallax sheet (tilemap-backgrounds_packed.png, 24px frames). No art
// is stretched, recoloured or invented.
// Depth bands: parallax 0.4–0.8 · trees 3.2–3.6 · niche back wall 8 ·
// terrain 9 · decks 10 · props/signs 11 · ladders 13 · player 20.
// ─────────────────────────────────────────────────────────────────────────
const T=54;
// Tree crowns are autotiled masks: '#' = leaf cell. Each cell picks its
// frame from its four neighbours, so a crown is ONE silhouette with one
// outline (no stacked rectangles). Column under the trunk is the middle
// column of the mask; the bottom cell above the trunk becomes frame 97
// (canopy with the trunk fork entering it).
const CROWNS={
 T3:['.#.','###','###'],          // pointed dome
 T4:['.#.','###','###'],          // dome over a branching trunk (was a diagonal mask that read as two crowns)
 T5:['.##..','#####','#####','.###.'], // broad rounded oak
 T6:['.##..','#####'],
 T7:['...##....','..#####..','.########','#########','..#####..'],
 T8:['#','#','#','#'],
};
// Trunk frames bottom→top (checked pixel by pixel against tilemap_packed.png):
// 137 rooted base · 136 plain knot · 116 branch stub LEFT · 138 branch stub
// RIGHT · 117 stubs both sides. 96 (trunk with leaf tufts) is no longer used:
// its tufts read as loose leaf squares beside the trunk.
// A side branch may only sit in a row whose trunk frame has a stub on that
// side (see BRANCH_STUB); treeJoinErrors() checks this for every tree type.
const TRUNKS={T2:[137],T3:[137,136],T4:[137,138,116],T5:[137,138,136],T6:[137,136,136],T7:[137,136,116,138,136,136],T8:[137,136]};
export const BRANCH_STUB={left:[116,117],right:[138,117]};
// Side branches [frame, column offset from trunk (1 = right neighbour, -1 = left), trunk row].
const BRANCHES={T4:[[99,1,1],[98,-1,2]],T5:[[99,1,1]],T7:[[98,-1,2],[119,1,3],[119,2,3],[119,3,3],[99,4,3]]};
// Every branch must touch a trunk stub on its side, or be chained (119) from one.
export function treeJoinErrors(){
 const errs=[];
 for(const [type,list] of Object.entries(BRANCHES))for(const [frame,dx,row] of list){
  const trunk=TRUNKS[type]?.[row];
  if(trunk===undefined){errs.push(`${type}: branch row ${row} has no trunk`);continue;}
  if(Math.abs(dx)===1&&!BRANCH_STUB[dx<0?'left':'right'].includes(trunk))errs.push(`${type}: frame ${frame} at row ${row} side ${dx<0?'left':'right'} meets trunk ${trunk} without a stub`);
  if(Math.abs(dx)>1&&!list.some(([,d,r])=>r===row&&Math.sign(d)===Math.sign(dx)&&Math.abs(d)===Math.abs(dx)-1))errs.push(`${type}: branch piece at ${dx} not chained`);
 }
 return errs;
}
function crownFrame(T_,B,Lf,R){
 if(!Lf&&!R) return T_&&B?56:!T_&&B?36:T_&&!B?76:16;
 if(!T_&&!B) return !Lf?77:!R?79:78;
 return (!T_?17:!B?57:37)+(!Lf?0:!R?2:1);
}
export function buildTree(s,type,x,feet,fg=false){
 const D=fg?19:0; // foreground trees draw in front of Chill Boy (depth 20)
 if(type==='T1'){s.tile(126,x-27,feet-T,3.4+D);return;}
 const trunk=TRUNKS[type];
 trunk.forEach((f,i)=>s.tile(f,x-27,feet-(i+1)*T,3.3+D));
 const top=feet-trunk.length*T;
 (BRANCHES[type]||[]).forEach(([f,dx,row])=>s.tile(f,x-27+dx*T,feet-(row+1)*T,3.4+D));
 if(type==='T2'){s.tile(16,x-27,top-T,3.5+D);(s.treeCrowns||=[]).push({type,x,x0:x-27,x1:x+27,y0:top-T,y1:top});return;}
 const m=CROWNS[type],h=m.length,w=m[0].length,x0=x-w*T/2,has=(r,c)=>m[r]?.[c]==='#';
 (s.treeCrowns||=[]).push({type,x,x0,x1:x0+w*T,y0:top-h*T,y1:top,fg});
 const mid=(w-1)>>1;
 for(let r=0;r<h;r++)for(let c=0;c<w;c++){
  if(!has(r,c))continue;
  let f=crownFrame(has(r-1,c),has(r+1,c),has(r,c-1),has(r,c+1));
  if(r===h-1&&c===mid&&w>1)f=97;
  s.tile(f,x0+c*T,top-(h-r)*T,3.5+D);
 }
}
// Background (Nov 2026 overhaul). The old far layer used Kenney's SNOW
// background set (frames 8–11, pale blue fill 16–19) under the GREEN set's
// band: two different palettes stacked 150 units apart, so the white strip
// never related to the forest below it. World 1 now uses ONE palette (the
// green set) at two depths: a soft sky gradient, a distant low-contrast
// forest (green band washed with horizon haze, slow parallax) and the
// mid forest (stronger colour, faster parallax). 'snow' keeps the previous
// single pale band unchanged for a future ice world.
function bandLayer(s,WORLD,{sf,y,top,fill,depth,haze,hazeAlpha,drift}){
 const span=WORLD.width*Math.max(sf,.6)+3000,box=s.add.container(0,0).setScrollFactor(sf,1).setDepth(depth);
 for(let x=-1152,i=0;x<span;x+=72,i++){
  box.add(s.add.image(x,y,'kpp_bg_atlas',top[i%top.length]).setOrigin(0).setScale(3));
  for(let yy=y+72;yy<WORLD.floor+72;yy+=72)box.add(s.add.image(x,yy,'kpp_bg_atlas',fill[i%fill.length]).setOrigin(0).setScale(3));
 }
 // Opaque tiles + ONE translucent wash = the faded distance look without
 // the 1px double-blend seams that per-tile alpha produced at tile edges.
 s.add.rectangle(-2000,y,span+6000,WORLD.floor+200-y,haze,hazeAlpha).setOrigin(0).setScrollFactor(sf,1).setDepth(depth+.01);
 if(drift&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  let off=0;s.events.on('update',(t,dt)=>{off=(off+dt*.006)%288;box.x=-off;});
 }
 return box;
}
function parallax(s,WORLD,verticalShift=0,theme='green'){
 if(theme==='snow'){
  bandLayer(s,WORLD,{sf:.25,y:990+verticalShift,top:[8,9,10,11],fill:[16,17,18,19],depth:.4,haze:0xaee3f5,hazeAlpha:.1,drift:true});
  return;
 }
 const horizon=1140+verticalShift;
 // Soft sky: deeper blue overhead fading to pale haze at the forest line.
 // Fixed horizontally (scroll factor 0), so it never shows an edge.
 const sky=s.add.graphics().setScrollFactor(0,1).setDepth(.1);
 // The band tiles carry Kenney's own pale-green sky in their top half, so the
 // gradient ends exactly on that colour after the far haze (#b0f0d2):
 // the far layer then has no visible rectangle edge.
 const far=horizon-96;
 sky.fillGradientStyle(0x8fd2ef,0x8fd2ef,0xb0f0d2,0xb0f0d2,1);
 sky.fillRect(-3000,far-800,9000,800);
 sky.fillStyle(0xb0f0d2,1).fillRect(-3000,far,9000,WORLD.floor+400-far);
 s.bgLayers={
  far:bandLayer(s,WORLD,{sf:.2,y:far,top:[15,14,14,15,14],fill:[22,23],depth:.4,haze:0xd4f0f2,hazeAlpha:.58}),
  mid:bandLayer(s,WORLD,{sf:.5,y:horizon,top:[14,15],fill:[22,23],depth:.8,haze:0xaee3f5,hazeAlpha:.12}),
 };
}
export function buildLandscape(s,{AB_TERRAIN,SLABS=[],DECKS=[],WALLS=[],LADDERS=[],WORLD,parallaxShift=0,bgTheme='green'}){
 s.textures.get('kpp_terrain_atlas').setFilter(Phaser.Textures.FilterMode.NEAREST);
 s.textures.get('kpp_bg_atlas').setFilter(Phaser.Textures.FilterMode.NEAREST);
 s.worldObjects=[];s.cClues=new Set();s.probeSeen=new Set();s.eReadoutShown=false;s.eOutputShown=false;
 s.riverInputSel=null;s.riverLastInputTrial=null;s.riverOrderSel=null;s.riverLastOrderTrial=null;
 const tile=(frame,x,y,depth=4,w=54,h=54)=>{
  const a=s.add.image(x,y,'kpp_terrain_atlas',frame).setOrigin(0).setScale(3).setCrop(0,0,w/3,h/3).setDepth(depth);
  s.worldObjects.push({frame,x,y,width:w,height:h,collision:false});return a;
 };s.tile=tile;
 // A support pole (frame 89) whose visible pole sits at x (tile is centred on it).
 const pole=(x,top,bottom,depth=4)=>{for(let y=top;y<bottom;y+=54)tile(89,x-27,y,depth,54,Math.min(54,bottom-y));};
 const post=(x,top,bottom)=>{for(let y=top;y<bottom;y+=54)tile(89,x,y,4,54,Math.min(54,bottom-y));};
 const beam=(x,y,width)=>{for(let a=0;a<width;a+=54)tile(a===0?48:a+54>=width?50:49,x+a,y,4,Math.min(54,width-a),18);};
 parallax(s,WORLD,parallaxShift,bgTheme);
 // ── Terrain ────────────────────────────────────────────────────────────
 // filled(x,y): is there terrain (solid column or slab band) in the 54px
 // row starting at y at column x? Used so edge outlines appear only where
 // terrain actually ends — a slab next to a solid at the same height joins
 // seamlessly, and a slab's underside reads as an overhang.
 const filled=(x,y)=>AB_TERRAIN.some(t=>x>=t.x&&x<t.x+t.width&&y>=t.y)||SLABS.some(t=>x>=t.x&&x<t.x+t.width&&y>=t.y&&y<t.bottom);
 const floor=WORLD.floor;
 for(const t of AB_TERRAIN){
  const b=s.add.rectangle(t.x+t.width/2,(t.y+floor)/2,t.width,floor-t.y,0,0);
  s.physics.add.existing(b,true);s.solids.add(b);b.setData('oneWay',false).setData('id',t.id);s.routePlatforms.push(b);
  for(let x=t.x;x<t.x+t.width;x+=54)for(let y=t.y;y<floor;y+=54){
   const left=x===t.x&&!filled(x-1,y),right=x+54>=t.x+t.width&&!filled(x+54,y);
   const stone=t.style==='stone'&&y===t.y;
   const frame=stone?(left&&right?40:left?41:right?43:42):y===t.y?(left&&right?20:left?21:right?23:22):y+54>=floor?(left&&right?140:left?141:right?143:142):(left&&right?120:left?121:right?123:4+((x/54+y/54)&1));
   tile(frame,x,y,9,Math.min(54,t.x+t.width-x),Math.min(54,floor-y));
  }
 }
 // Finite-depth slabs: collider spans exactly y..bottom (no column to the
 // floor), so the space underneath is real, walkable air.
 for(const t of SLABS){
  const b=s.add.rectangle(t.x+t.width/2,(t.y+t.bottom)/2,t.width,t.bottom-t.y,0,0);
  s.physics.add.existing(b,true);s.solids.add(b);b.setData('oneWay',false).setData('id',t.id);s.routePlatforms.push(b);
  for(let x=t.x;x<t.x+t.width;x+=54){
   const left=!filled(x-1,t.y),right=!filled(x+54,t.y),w=Math.min(54,t.x+t.width-x),k=left&&right?0:left?1:right?3:2;
   if(t.style==='crates'){for(let y=t.y;y<t.bottom;y+=54)tile(26,x,y,9,w,Math.min(54,t.bottom-y));continue;}
   if(t.style==='arch'){ // stone-topped rock band, bottom row outlined: one silhouette, no inner seams
    for(let y=t.y;y<t.bottom;y+=54){const last=y+54>=t.bottom;tile(y===t.y?[60,61,63,62][[0,1,3,2].indexOf(k)]:last?[140,141,143,142][[0,1,3,2].indexOf(k)]:[120,121,123,122][[0,1,3,2].indexOf(k)],x,y,9,w,Math.min(54,t.bottom-y));}
    continue;}
   tile(k,x,t.y,9,w,t.bottom-t.y);
  }
 }
 s.deckArtById={};
 for(const d of DECKS){s.deckArtById[d.id]=s.deck(d);s.platform(d);}
 // Fence walls (visible fence art + matching solid collider; never invisible).
 for(const w of WALLS){
  const b=s.add.rectangle(w.x+w.width/2,(w.top+w.bottom)/2,w.width,w.bottom-w.top,0,0);
  s.physics.add.existing(b,true);s.solids.add(b);b.setData('oneWay',false).setData('id',w.id);s.routePlatforms.push(b);
  // A tall fence gets a full-height post so its stacked sections read as one railing.
  if(w.bottom-w.top>54)pole(w.x+w.width/2,w.top,w.bottom,10.5);
  for(const [f,x,y] of w.art)tile(f,x,y,11);
 }
 for(const l of LADDERS){
  for(let y=l.top;y<l.bottom;y+=54)tile(71,l.x-27,y,13,54,Math.min(54,l.bottom-y));
  const z=s.add.zone(l.x,(l.top+l.bottom)/2,56,l.bottom-l.top+72);s.physics.add.existing(z,true);z.setData('ladder',l);s.ladderZones.push(z);
 }
 return {tile,pole,post,beam};
}
export function buildWorld(s){
 const {tile,pole,post,beam}=buildLandscape(s,{AB_TERRAIN,SLABS,DECKS,WALLS,LADDERS,WORLD});
 // ── 01 · Taman Permulaan ────────────────────────────────────────────────
 // Landmark: wide oak (T5) beside the garden step + small pine companion.
 // The crate lane (x150–430) carries no decoration so the puzzle reads.
 pole(459,1206,1296);pole(567,1206,1296);       // supports for the crate ledge
 // Kampung house on stilts behind the spawn: veranda deck (optional, own
 // ladder at x135), two posts to the ground, timber wall with a door, roof.
 pole(13,1206,1296,4);pole(95,1206,1296,4);pole(149,1206,1296,4);
 tile(6,0,1134,8);tile(150,54,1134,8);tile(6,0,1080,8);tile(130,54,1080,8);
 beam(-27,1062,189);
 tile(86,162,1242,11);signText(s,'Rumah kampung',81,1000);
 tile(128,640,1242,11);tile(124,757,1242,11);    // mushroom + tuft by the step
 tile(125,1110,1188,11);                         // tuft on the root overhang
 // ── 02 · Laluan Akar ────────────────────────────────────────────────────
 // Secret A niche: dirt back wall (45% alpha) under the root overhang so the
 // recess reads as a hollow in the bank, not open sky.
 for(let y=1296;y<1404;y+=54)for(let x=1080;x<1188;x+=54)tile(4+((x/54+y/54)&1),x,y,8).setAlpha(.45);
 tile(129,1188,1350,11);                         // tall mushroom marks the niche mouth
 // Canopy walk supports, each pole lands on the terrain directly below.
 // Root arch supports: two old trunks stand in the tunnel under the arch
 // (art only, no collision, so the root lane stays open). Root base on the
 // floor, plain trunk above, branch-stub frame 117 where it meets the arch.
 [[1242,1404],[1566,1350]].forEach(([x,floor])=>{for(let y=1188;y<floor;y+=54)tile(y+54>=floor?137:y===1188?117:136,x,y,3.3);});
 tile(124,1395,1350,11);tile(125,1735,1242,11);
 const trees=[
  ['T5',729,1296],['T1',891,1242],             // 01: one large + one small
  ['T4',963,1188],['T3',1134,1242],           // 02: hill-crest oak + overhang tree, crowns side by side
  ['T3',1269,1080],['T4',1593,1080],           // 02: two old trees growing out of the root arch (their trunks carry it)
  ['T8',2088,1242],                            // 03: column tree at the yard entrance (clear of the plank stack)
  ['T1',3294,1296],['T6',3850,1188],          // 04: pine on cliff-1, umbrella tree shading the rest cliff
  ['T7',4455,1296],                            // 05: POKOK TINJAU (giant, carries the lookout)
  ['T3',4941,1296],['T2',5076,1296],           // 05: the ridge deck rests on this crown (rope-bridge landing)
  ['T3',1880,1242,'fg'],                       // (fg oak at 3040 removed: the sawmill stands there now) // FOREGROUND: Chill Boy walks behind these three           // 05: young clump in the root dip, column tree before the clearing
  ['T5',5300,1242],['T3',5520,1242],['T1',5612,1242]]; // 06: three-tree grove (large / medium / small), crowns spaced so each reads
 trees.forEach(([t,x,f,fg])=>buildTree(s,t,x,f,!!fg));
 // ── 03 · Stesen Fungsi ──────────────────────────────────────────────────
 // A roofed wooden station on the yard: two posts, a stepped plank roof with
 // a peak block, the function machine under it and the lever at the bridge
 // mouth. The right post doubles as the bridge's left rope anchor.
 pole(2205,1080,1242);pole(2511,1080,1242);
 beam(2160,1062,378);beam(2214,1044,270);tile(47,2322,990,4);
 for(let i=0;i<3;i++){tile(29,2295+i*54,1134,11);tile(i===1?31:29,2295+i*54,1188,11);}
 const screen={fontFamily:'ui-monospace,Consolas,"Roboto Mono",monospace',fontStyle:'bold',color:'#fee481',backgroundColor:'#434a5f',padding:{x:7,y:4}};
 s.machineScreen=s.add.text(2376,1176,'f(x) = 2x + 1',{...screen,fontSize:'15px'}).setOrigin(.5,1).setDepth(12);
 s.machineSub=s.add.text(2376,1218,'x = ?  →  7',{...screen,fontSize:'13px',color:'#fff1d2'}).setOrigin(.5,1).setDepth(12);
 s.lever=s.add.image(2484,1242,'kpp_terrain_atlas',64).setOrigin(.5,1).setScale(3).setDepth(12);
 tile(85,2124,1188,11);s.probeReadout=s.label('Input → f → output',2151,1170,14);
 s.bInput=null;s.bLastTrial=null;
 s.bSelector=s.add.image(-500,0,'kpp_terrain_atlas',85).setVisible(false); // obsolete V13 input board (panel owns input)
 s.bSelectorLabel=s.add.text(-500,0,'').setVisible(false);
 s.liftReadout=s.label('',2700,1150,13);s.liftState=s.label('',2700,1200,12);
 // Bridge: 7 planks (the machine "outputs f(x) planks"; the gap needs 7).
 // Hidden until built; collision is added only after the last plank lands.
 {const g=GATES[0],n=g.planks,pw=g.width/n;s.liftPlanks=[];
  for(let i=0;i<n;i++){const f=i===0?48:i===n-1?50:49;
   s.liftPlanks.push(s.add.image(g.x+i*pw,g.y,'kpp_terrain_atlas',f).setOrigin(0).setScale(3).setCrop(0,0,pw/3,6).setDepth(10).setVisible(false));}
  s.bridgeRails=[];for(let x=g.x;x<g.x+g.width;x+=54)s.bridgeRails.push(tile(x===g.x?90:x+54>=g.x+g.width?92:91,x,g.y-54,5,Math.min(54,g.x+g.width-x),54).setVisible(false));
  pole(g.x+g.width+8,g.y-54,g.y);}               // right rope anchor on the far bank
 tile(125,2900,1188,11);
 // Crane on the far bank: mast on the ground, jib over the gap, a plank
 // bundle on its rope — where the bridge planks come from.
 pole(2889,990,1242,4.5);tile(69,2862,936,4.5);beam(2700,972,216);
 for(let y=990;y<1080;y+=54)tile(89,2700,y,4.4,54,Math.min(54,1080-y));tile(26,2700,1080,4.6);
 // Water: wave row in every gap; two wave frames alternate gently.
 s.waterTiles=[];
 for(const w of WATER)for(let x=w.x;x<w.x+w.width;x+=54)s.waterTiles.push(tile(33,x,WATER_Y,9.5,Math.min(54,w.x+w.width-x),54).setAlpha(.92));
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){let ph=0;s.time.addEvent({delay:650,loop:true,callback:()=>{ph^=1;s.waterTiles.forEach((t,i)=>t.setFrame(((i+ph)&1)?53:33));}});}
 // ── 04 · Tebing Berliku ─────────────────────────────────────────────────
 // Piers stand on posts that go down into the water.
 pole(3502,1260,WATER_Y+10);pole(3608,1260,WATER_Y+10);pole(3988,1260,WATER_Y+10);pole(4112,1260,WATER_Y+10);
 tile(124,3340,1242,11);
 // ── 05 · Pokok Tinjau ───────────────────────────────────────────────────
 // The treehouse: low deck across the trunk (posts at both ends), a branch
 // deck carried by the tree's own branch tiles, and the top deck on the
 // trunk plus a post standing on the low deck. Railings mark the deck edge.
 pole(4293,1152,1296);pole(4563,1152,1296);pole(4422,1044,1134);
 // Rope bridge anchors (posts above the deck ends) — the deck itself is a one-way surface.
 pole(4545,954,1026,10.6);pole(4851,954,1026,10.6);
  tile(124,4800,1242,11);tile(129,5000,1242,11);tile(125,5130,1242,11);
 // ── 06 · Destinasi Terakhir ─────────────────────────────────────────────
 // Wide clearing; the goal flag waves on a stone plinth; a low fence and a
 // sign close the world edge.
 // Finish gate: two timber posts standing on the stone plinth, a plank
 // lintel and a pennant on each post, framing the waving goal flag.
 for(const x of [GOAL.x-54,GOAL.x+54]){pole(x,GOAL.feet-162,GOAL.feet,10.6);s.add.image(x,GOAL.feet-180,'kpp_terrain_atlas',111).setOrigin(.2,1).setScale(2).setDepth(10.7);}
 for(let x=GOAL.x-81;x<GOAL.x+81;x+=54)tile(x===GOAL.x-81?48:x+54>=GOAL.x+81?50:49,x,GOAL.feet-180,10.8,54,18);
 s.goalFlag=s.add.image(GOAL.x,GOAL.feet,'kpp_terrain_atlas',112).setOrigin(.5,1).setScale(4).setDepth(11);
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)s.time.addEvent({delay:420,loop:true,callback:()=>s.goalFlag.setFrame(s.goalFlag.frame.name===112?111:112)});
 tile(128,5420,1188,11);tile(85,5832,1188,11);tile(106,5886,1188,11); // arrow sign → Lembah Sungai (Level 1-2)
 signText(s,'Ke Lembah Sungai →',5859,1146);
 buildSawmill(s);
 CHECKPOINTS.forEach((c,i)=>s.checkpointArts[i]=s.add.image(c.x,c.feet,'kpp_terrain_atlas',111).setOrigin(.5,1).setScale(3).setDepth(11));
 s.spawnCollectibles();s.buildSecrets();s.buildCratePuzzle();
}
function signText(s,text,x,y){
 return s.add.text(x,y,text,{fontFamily:'Arial, sans-serif',fontSize:'13px',fontStyle:'bold',color:'#fff1cf',stroke:'#3d493c',strokeThickness:3}).setOrigin(.5,1).setDepth(12);
}
export function buildSecretMarkers(s){
 s.secretMarkers={};
 for(const d of SECRETS){
  const marker=s.add.image(d.x,d.feet-80,'kpp_terrain_atlas',67).setScale(2).setDepth(14).setAlpha(s.discoveredSecrets.has(d.id)?1:.35);
  s.secretMarkers[d.id]=marker;
  if(!s.discoveredSecrets.has(d.id)&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   s.tweens.add({targets:marker,y:marker.y-10,duration:950,yoyo:true,repeat:-1,ease:'Sine.inOut'});
  }
 }
}
