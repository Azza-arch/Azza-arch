import {BUILD_STAGE,GOAL,SECRETS} from './level.js';

// Modular scenery only. Traversable surfaces come exclusively from level.js.
export function buildExtension(s) {
 const tile=s.tile;
 s.readouts={};s.waterFills={};s.pipeStageLabels={};s.tokenRacks=[];s.latchArts=[];
 const post=(x,top,bottom)=>{for(let y=top;y<bottom;y+=54)tile(89,x,y,24,Math.min(54,bottom-y),4);};
 const beam=(x,y,w)=>{for(let a=0;a<w;a+=54)tile(a===0?48:a+54>=w?50:49,x+a,y,Math.min(54,w-a),20,4);};
 const station=(id,x,feet,title)=>{
   tile(130,x-27,feet-108,54,54,6);tile(150,x-27,feet-54,54,54,6);
   s.readouts[id]=s.label(title,x,feet-145,14);return s.readouts[id];
 };
 const pipe=(id,x,feet)=>{
   // Actual Base-pack fittings, with a connected raised manifold on timber legs.
   const y=feet-180;
   post(x-108,y+54,feet);post(x+135,y+54,feet);beam(x-108,y+36,270);
   tile(93,x-108,y,54,54,6);tile(133,x-54,y,54,54,6);tile(133,x,y,54,54,6);tile(133,x+54,y,54,54,6);tile(94,x+108,y,54,54,6);
   tile(95,x-108,y+54,54,54,6);tile(115,x+108,y+54,54,54,6);
   tile(34,x-108,y+108,54,54,6);tile(35,x+108,y+108,54,54,6);
   const fill=tile(73,x+114,y+119,42,36,7).setAlpha(.18);s.waterFills[id]=fill;
   s.readouts[id]=s.label('x → f → g',x+27,y-20,14);
   s.pipeStageLabels[id]=[s.label('f',x-20,feet-90,20),s.label('g',x+68,feet-90,20)];
   tile(65,x-20,feet-48,48,48,11);
 };
 if(BUILD_STAGE>=2) {
   post(2970,756,972);post(3294,756,972);beam(2943,738,405);
   tile(90,2994,792,54,27,4);tile(92,3240,792,54,27,4);
   s.label('BENGKEL FUNGSI',3150,720,18);
   station('block',3267,972,'f(x) = 3x − 2 · sasaran 10');
   for(const [i,n] of [2,3,4].entries()) {
     const x=3060+i*54;
     const box=tile(9,x,924,48,48,11),digit=tile(160+n,x+12,936,24,24,12);
     s.tokenRacks.push({n,x:x+24,box,digit});
   }
   s.token=s.add.container(3084,948,[s.add.image(0,0,'kpp_terrain_atlas',9).setDisplaySize(48,48),s.add.image(0,0,'kpp_terrain_atlas',162).setDisplaySize(24,24)]).setDepth(16).setVisible(false);
   tile(69,3330,918,18,54,5);tile(69,3672,918,18,54,5);
   // Service platform has supports that end on D1, leaving ladder unobstructed.
   post(3780,772,972);post(4026,772,972);
   tile(86,3969,702,54,54,10);s.label('Nota di pelantar atas',3920,690,13);
   s.sceneryTree(3730,972);tile(124,4040,936,36,36,10);
   pipe('primer',3942,972);
 }
 if(BUILD_STAGE>=3) {
   s.sceneryTree(4140,972);
   // Platform supports meet the recovery bank; no dirt beneath thin roof decks.
   post(4104,772,972);post(4400,772,1080);post(4752,826,1080);
   pipe('pipe',4806,648);
   s.label('BUMBUNG AIR',4806,405,18);
   // Small reservoir on E1, made from actual bounded water tiles and fittings.
   tile(34,4176,648,54,54,5);tile(35,4230,648,54,54,5);
   tile(74,4176,702,54,54,5);tile(75,4230,702,54,54,5);
   tile(135,4284,702,54,54,5);
   for(let x=5238;x<5670;x+=108)tile(119,x,664,54,24,4);
   tile(124,5380,612,36,36,10);tile(128,5580,612,36,36,10);
   s.label('Jika jatuh, kembali melalui tangga',4520,1040,12);
   tile(69,4896,594,18,54,5);tile(69,5238,594,18,54,5);
 }
 if(BUILD_STAGE>=4) {
   for(const [x,y] of [[5850,702],[6350,918],[7110,1134]])s.sceneryTree(x,y);
   for(const [x,y] of [[6000,756],[6200,864],[6890,1026],[7240,1188]])tile(124,x,y-36,36,36,10);
   // The cave is the genuine empty volume between the solid banks, not a painted door.
   // Dark, borderless earth is a recessed background wall, behind the ladder/player.
   // It adds no collision or foreground grass lip inside the open shaft.
   s.add.rectangle(6615,1089,270,306,0x343344).setDepth(1.9);
   for(let x=6480;x<6750;x+=54)for(let y=936;y<1242;y+=54)
    tile(4,x,y,54,Math.min(54,1242-y),2).setAlpha(.12);
   beam(6480,934,270);post(6490,950,1242);post(6714,950,1242);
   tile(86,6650,1188,54,54,11);tile(47,6696,1194,48,48,11);
   tile(67,6505,1206,36,36,11);tile(67,6700,1160,30,30,11);
   s.readouts.inverse=s.label('Arkib · songsangkan pemetaan',6630,1090,13).setDepth(14);
   s.label('Gua pilihan ↓',6590,860,14);
 }
 if(BUILD_STAGE>=5) {
   for(let x=7722;x<8100;x+=54) {
     tile(33,x,1360,54,54,5);
     for(let y=1414;y<1566;y+=54)tile(73,x,y,54,Math.min(54,1566-y),5);
   }
   station('final',7650,1296,'h(x) = 4x − 3 · sasaran 17');
   for(const [i,x] of [7580,7680].entries())s.latchArts[i]=tile(107,x,1280,36,16,12);
   tile(69,7704,1242,18,54,5);tile(69,8100,1242,18,54,5);
   // Winch with an attached shaft; deployment is game code, not a native animation.
   for(let x=7650;x<7722;x+=18)tile(91,x,1225,18,18,5);
   s.finalWinch=tile(157,7700,1206,36,36,6);
   s.sceneryTree(8170,1296);tile(124,8330,1260,36,36,10);
   post(8240,1080,1296);post(8370,1080,1296);beam(8220,1062,180);
   for(let i=0;i<4;i++)tile(i===0?12:i===3?15:13,8184+i*54,1026,54,54,5);
   tile(130,GOAL.x-27,1188,54,54,11);tile(150,GOAL.x-27,1242,54,54,11);
   s.label('RUMAH · DESTINASI',8290,1040,17);
 }
}

export function buildSecretMarkers(s) {
 s.secretMarkers={};
 for(const def of SECRETS) {
  s.secretMarkers[def.id]=s.tile(def.id==='secret-cave-treasure'?47:84,def.x-18,def.feet-36,36,36,11);
  if(def.id==='secret-oyen')s.label('Si Oyen',def.x,def.feet-60,12);
 }
}
