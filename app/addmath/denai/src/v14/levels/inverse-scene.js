import {buildLandscape,buildTree} from '../environment.js';
import {track,durationBucket} from '../analytics.js';
import {showLevelVictory} from '../victory.js';
import {startCoin,coinPickup,checkpointFx,ATLAS,COIN_FACE} from '../feel.js';
import {createPlayer} from '../core/player.js';
import {updatePlayer} from '../core/player-motion.js';
import {createInverseStore,newRun} from '../core/inverse-campaign.js';
import {installViewCull} from '../core/view-cull.js';
import {hud,dialogue,pagesOf,reward,stamp} from '../ui/v4-ui.js';
import {inFinishZone} from './inverse.js';
import {DEFINITION,WORLD,SPAWN,GOAL,CHECKPOINTS,COINS,SECRETS,WATER,WATERFALL} from './inverse-world.js';
import {buildSluice,sluicePrompt,useSluice,installTracker,renderTracker,syncSluiceUI,sluiceWaterY,newSluice} from './sluice-line.js';
const $=id=>document.getElementById(id);
export function createInverseScene(Base,{controls,audio,SFX,reducedMotion,BASE_SCALE,setActive,clearControls}){
 return class GerbangSongsang extends Base{
  constructor(){super('GerbangSongsang');}
  init(data={}){
   super.init();this.fresh=data.fresh===true;this.store=createInverseStore(localStorage);
   this.run=this.fresh?newRun():(this.store.load().run||newRun());this.elapsed=this.run.elapsedMs;
   this.run.sluice||=newSluice();
   this.mode='playing';this.exitHinted=false;this.sluiceIntro=false;this.hintLevel=0;this.lastHintStep=null;
  }
  preload(){
   this.load.image('l3-stone-left','assets/kenney/tiles/terrain_stone_block_left.png');
   this.load.image('l3-stone-center','assets/kenney/tiles/terrain_stone_block_center.png');
   this.load.image('l3-stone-right','assets/kenney/tiles/terrain_stone_block_right.png');
  }
  create(){
   setActive(this);clearControls();this.physics.world.setBounds(0,0,WORLD.width,WORLD.height,true,true,true,false);
   for(const key of ['l3-stone-left','l3-stone-center','l3-stone-right'])this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
   this.solids=this.physics.add.staticGroup();const {tile,pole,beam}=buildLandscape(this,DEFINITION);
   this.landTile=tile;this.landPole=pole;
   // Small, varied Kenney groves frame the route without hiding platforms.
   // Groves: a stream-side pair of different sizes, courtyard oak + pine,
   // an upper-ruin tree, the waterfall-bank oak and a pair framing the gate.
   [['T5',250,1728],['T1',560,1728],['T3',1440,1728],['T1',1560,1728],['T3',2268,1674],['T1',2390,1674],['T4',3960,1674],['T3',4250,1620],['T2',4700-27,1620],['T1',5480,1566],['T3',5560,1566]].forEach(([type,x,y])=>buildTree(this,type,x,y));
   // Ruin galleries stand on broken stone piers (the level's identity: a
   // stepped ruin, not scaffolding); other decks keep timber posts.
   const pier=(x,top,bottom)=>{for(let y=top;y<bottom;y+=54)this.add.image(x-27,y,'l3-stone-center').setOrigin(0).setDisplaySize(54,Math.min(54,bottom-y)).setDepth(4).setTint(0xe6dfd2);};
   const piers=new Set();
   for(const d of DEFINITION.DECKS){
    for(const x of [d.x+27,d.x+d.width-27]){
     const ground=DEFINITION.AB_TERRAIN.find(t=>x>=t.x&&x<t.x+t.width)?.y||WORLD.floor;
     if(ground<=d.y+18)continue;
     if(d.x>=702&&d.x<2538){if(!piers.has(x)){piers.add(x);pier(x,d.y+18,ground);}}
     else pole(x,d.y+18,ground,4);
    }
   }
   this.checkpointArts=CHECKPOINTS.map(cp=>tile(cp.id===this.run.checkpointId?112:111,cp.x-27,cp.feet-54,12));
   this.buildRuinDetails(tile,pole,beam);
   this.creekBridgeArt=this.deckArtById?.['creek-crossing']||[];
   this.creekBridgeArt.forEach(a=>a.setData('restY',a.y));
   if(!reducedMotion){let phase=0;this.time.addEvent({delay:520,loop:true,callback:()=>{phase^=1;this.waterSurfaceTiles?.forEach((a,i)=>a.setFrame(((i+phase)&1)?53:33));}});}
   this.coinViews=COINS.map((def,i)=>({def,art:startCoin(this,this.add.sprite(def.x,def.y,ATLAS,COIN_FACE).setScale(1.78).setDepth(14),i,reducedMotion).setVisible(!this.run.coins.includes(def.id)&&(!def.cave||this.run.sluice.cave.solved))}));
   // Keep notes discoverable through the close-range E prompt without
   // floating blue gem markers that read like detached pipe fragments.
   this.secretViews=SECRETS.map(def=>({def}));
   createPlayer(this,{SPAWN,BASE_SCALE,reducedMotion,controls});
   this.cameras.main.setBounds(0,240,WORLD.width,WORLD.floor-240).setBackgroundColor(this.bgColor??'#aee3f5');
   this.cameras.main.startFollow(this.player,true,reducedMotion?1:.14,reducedMotion?1:.16,-85,100).setDeadzone(0,150);
   this.applyResponsiveZoom();this.respawn();this.installUI();installTracker(this);
   // Performance (Fasa E): skip drawing off-screen tiles — see core/view-cull.js.
   if(!window.__DENAI_NO_CULL__)this.viewCull=installViewCull(this,{exclude:[...this.creekBridgeArt]});
   document.body.classList.remove('menu-active');document.body.classList.add('game-active','inverse-active');
   for(const id of ['welcome','loading','mission-indicator','chill-bubble','world-prompt','tutorial'])$(id).hidden=true;
   $('pause').disabled=false;$('touch-controls').hidden=!matchMedia('(pointer: coarse)').matches;$('hud-mode').hidden=true;
   this.message(this.run.sluice.open?'Pintu air sudah dipulihkan. Teruskan ke gerbang.':'Ikut sungai ke halaman mesin lama.');this.writeSave();renderTracker(this);
   this.events.once('shutdown',()=>{this.writeSave();clearControls();this.uiAbort?.abort();this.bubble?.destroy();this.bubble=null;$('inverse-dialog')?.remove();document.body.classList.remove('inverse-active');$('touch-controls').hidden=true;});
  }
  buildRuinDetails(tile,pole,beam){
   // Signboards sit in the soil band, so area names read as part of the world.
   this.areaSign(tile,pole,216,1764,216,'JEJAK SUNGAI');
   this.areaSign(tile,pole,1755,1764,324,'RUNTUHAN BERTINGKAT');
   this.areaSign(tile,pole,2862,1764,324,'HALAMAN MESIN');
   this.areaSign(tile,pole,5076,1764,270,'GERBANG UTAMA');
   // A stone-lined spring mouth is cut into the visible dirt bank; the water
   // surface and rising pipe share one centerline, so the source is obvious.
   const springStone=(key,x,y)=>this.add.image(x,y,key).setOrigin(0).setDisplaySize(54,54).setDepth(10.3);
   for(const y of [1566,1620]){springStone('l3-stone-left',2592,y);springStone('l3-stone-right',2700,y);}
   springStone('l3-stone-left',2592,1674);springStone('l3-stone-center',2646,1674);springStone('l3-stone-right',2700,1674);
   tile(33,2646,1566,10.5);tile(73,2646,1620,10.5);
   // One continuous Kenney pipe rises from the spring, crosses the machine,
   // then turns down directly into the single waterfall.
   this.pipeTile=tile;
   this.placePipePath([[2646,1512],[2646,1404],[3240,1404],[3240,1458]],11); // intake sits on the spring surface (1566), outlet mouth above the waterfall
   // A short timber service frame supports the pipe and carries the controls.
   for(let x=2700;x<3024;x+=54)tile(x===2700?48:x+54>=3024?50:49,x,1566,9.6,54,18);
   for(const x of [2673,2862,2997])pole(x,1458,1566,9.7);
   // A narrow creek passes under the entry footbridge; water is scenery only.
   this.waterSurfaceTiles=[];
   for(let x=378;x<486;x+=54){
    // Creek pool: one surface row, then water body down past the floor
    // (was waterfall columns with a floating crate block and open gaps below).
    this.waterSurfaceTiles.push(tile(33,x,1782,6));
    for(let y=1836;y<WORLD.floor+54;y+=54)tile(73,x,y,6);
   }
   // The cliff lip pours into the empty ravine; the lower river tiles form
   // the catch pool. This cascade is scenic and adds no gameplay collider.
   this.waterfallTiles=[];
   for(let y=WATERFALL.top;y<WATERFALL.bottom;y+=54)this.waterfallTiles.push(tile(73,WATERFALL.x,y,6));
   this.channelWater={surface:[],firstRow:[]};
   for(let x=3240;x<3456;x+=54){
    const surface=tile(33,x,1674,6.4);this.waterSurfaceTiles.push(surface);this.channelWater.surface.push(surface);
    for(let y=1728;y<WORLD.floor+54;y+=54){const body=tile(73,x,y,6.4);if(y===1728)this.channelWater.firstRow.push(body);} // pool reaches the floor
   }
   // Stone gateway: paired masonry piers and a deep lintel (the exit landmark).
   const left=4860,right=5292,top=1188,feet=1566;
   const stone=(key,x,y)=>this.add.image(x,y,key).setOrigin(0).setDisplaySize(54,54).setDepth(11);
   for(let y=top;y<feet;y+=54){
    stone('l3-stone-left',left,y);stone('l3-stone-center',left+54,y);
    stone('l3-stone-center',right-108,y);stone('l3-stone-right',right-54,y);
   }
   for(const y of [top-108,top-54])for(let x=left;x<right;x+=54){
    const key=x===left?'l3-stone-left':x+54>=right?'l3-stone-right':'l3-stone-center';stone(key,x,y);
   }
   tile(124,left-54,feet-54,11);tile(125,right,feet-54,11);
   // Battlements and two banners make the exit gate the level's landmark.
   for(let x=left;x<right;x+=108)stone(x===left?'l3-stone-left':x+54>=right?'l3-stone-right':'l3-stone-center',x,top-162);
   stone('l3-stone-right',right-54,top-162);
   for(const x of [left+27,right-27])this.add.image(x,top-162,'kpp_terrain_atlas',112).setOrigin(.5,1).setScale(3).setDepth(11);
   buildSluice(this);
  }
  areaSign(tile,pole,x,y,width,text){
   const left=x-width/2;
   for(let row=0;row<2;row++)for(let dx=0;dx<width;dx+=54){
    const frame=dx===0?48:dx+54>=width?50:49;tile(frame,left+dx,y+row*18,11,54,18);
   }
   pole(left+18,y+36,y+72,11);pole(left+width-18,y+36,y+72,11);
   this.add.text(x,y+18,text,{fontFamily:'Arial,sans-serif',fontSize:'14px',fontStyle:'bold',color:'#fff0ce',stroke:'#593c2a',strokeThickness:3,align:'center'}).setOrigin(.5,.5).setDepth(12);
  }
  // Kenney pipe set (checked against tilemap_packed.png): 115 vertical body,
  // 133 horizontal body, 95/135 vertical end with flange (top/bottom),
  // 132/134 horizontal end (left/right), and the four quarters of the round
  // junction as elbows: 93 joins right+down, 94 left+down, 113 up+right,
  // 114 up+left. No tile is rotated or overlapped.
  placePipePath(points,depth=11){
   const dirs=points.map((p,i)=>i?[Math.sign(p[0]-points[i-1][0]),Math.sign(p[1]-points[i-1][1])]:null);
   const opposite=d=>[-d[0],-d[1]];
   const elbow=(a,b)=>{const has=(dx,dy)=>[a,b].some(d=>d[0]===dx&&d[1]===dy);
    return has(1,0)&&has(0,1)?93:has(-1,0)&&has(0,1)?94:has(0,-1)&&has(1,0)?113:114;};
   const cells=[];
   for(let i=1;i<points.length;i++){
    const [x1,y1]=points[i-1],[x2,y2]=points[i],[dx,dy]=dirs[i];
    if(dx&&dy)throw new Error('Kenney pipe route must use horizontal or vertical runs');
    for(let x=x1,y=y1;;x+=dx*54,y+=dy*54){
     if(!(i>1&&x===x1&&y===y1))cells.push({x,y,horizontal:!!dx,first:i===1&&x===x1&&y===y1,last:i===points.length-1&&x===x2&&y===y2});
     if(x===x2&&y===y2)break;
    }
    if(i<points.length-1){const c=cells.at(-1);c.elbow=elbow(opposite(dirs[i]),dirs[i+1]);}
   }
   this.pipeCells=cells;
   for(const c of cells){
    let frame=c.elbow??(c.horizontal?133:115);
    if(!c.elbow&&(c.first||c.last)){
     const d=c.first?dirs[1]:dirs.at(-1),end=c.first?opposite(d):d; // which way the open end faces
     frame=c.horizontal?(end[0]<0?132:134):(end[1]<0?95:135);
    }
    this.pipeTile(frame,c.x,c.y,depth);
   }
  }
  worldText(text,x,y,size=16){return this.add.text(x,y,text,{fontFamily:'Arial,sans-serif',fontSize:`${size}px`,color:'#203e36',backgroundColor:'#f9f2d8',padding:{x:8,y:5},align:'center'}).setOrigin(.5,1).setDepth(15);}
  machineText(text,x,y,size=15){return this.add.text(x,y,text,{fontFamily:'Arial,sans-serif',fontSize:`${size}px`,fontStyle:'bold',color:'#fff1cf',stroke:'#3d493c',strokeThickness:3,align:'center'}).setOrigin(.5,1).setDepth(16);}
  installUI(){
   this.uiAbort=new AbortController();const signal=this.uiAbort.signal;
   const dialog=document.createElement('dialog');dialog.id='inverse-dialog';dialog.setAttribute('aria-labelledby','inverse-dialog-title');
   dialog.innerHTML='<h2 id="inverse-dialog-title"></h2><p id="inverse-dialog-copy"></p><div class="inverse-dialog-actions"><button id="inverse-resume">Sambung</button><button id="inverse-replay">Main semula 1–3</button><button id="inverse-menu">Peta Dunia</button><button id="inverse-main-menu">Menu utama</button></div>';
   document.querySelector('.shell').append(dialog);
   $('inverse-resume').addEventListener('click',()=>this.resumeRun(),{signal});
   $('inverse-replay').addEventListener('click',()=>{dialog.close();this.scene.restart({fresh:true});},{signal});
   $('inverse-menu').addEventListener('click',()=>this.returnToMenu(),{signal});
   $('inverse-main-menu').addEventListener('click',()=>{dialog.close();this.returnToMenu(false);},{signal});
   dialog.addEventListener('cancel',e=>{e.preventDefault();if(this.mode==='paused')this.resumeRun();},{signal});
  }
  // V4: completion = short portrait dialogue + gold stamp (maths summary in the Journal).
  summary(){renderTracker(this);dialogue(this,['Air dah surut! Laluan dah terbuka.','Fungsi songsang bantu cari semula input daripada output.']).then(()=>stamp('Misi selesai · Pintu air dipulihkan'));}
  revealCave(){
   for(const {def,art} of this.coinViews)if(def.cave&&!this.run.coins.includes(def.id)){art.setVisible(true);if(!reducedMotion){art.setScale(.4);this.tweens.add({targets:art,scale:1.78,duration:380,ease:'Back.out'});}}
  }
  update(time,delta){
   if(!this.player||this.mode!=='playing')return;this.elapsed+=delta;
   const motion=updatePlayer(this,time,delta,{controls,audio,SFX,reducedMotion,BASE_SCALE,WATER,WATER_Y:sluiceWaterY(this)});if(motion.respawned)return;
   const {body,interact,grounded}=motion;if(body.bottom>WORLD.floor-8){this.respawn();return;}
   if(!reducedMotion&&grounded&&Math.abs(body.velocity.x)>35&&this.player.x>=348&&this.player.x<=516&&time>=(this.nextCreekWobbleAt||0)){
    const direction=Math.sign(body.velocity.x);this.nextCreekWobbleAt=time+360;
    this.creekBridgeArt.forEach((a,i)=>{this.tweens.killTweensOf(a);this.tweens.add({targets:a,y:a.getData('restY')+(i%2?2:-2),angle:(i%2?1:-1)*direction,duration:85,yoyo:true,repeat:1,ease:'Sine.inOut'});});
   }
   if(this.noticeUntil&&time>this.noticeUntil){$('notice').classList.remove('show');this.noticeUntil=0;}
   for(const {def,art} of this.coinViews)if(art.visible&&Math.abs(this.player.x-def.x)<32&&Math.abs(body.center.y-def.y)<48){this.run.coins.push(def.id);art.setVisible(false);art.anims?.stop();SFX.coin?.(audio);this.writeSave();coinPickup(this,def.x,art.y,{reduced:reducedMotion});}
   const secretOpen=def=>!def.cave||this.run.sluice.cave.solved;
   const secret=this.secretViews.find(({def})=>secretOpen(def)&&Math.abs(this.player.x-def.x)<54&&Math.abs(body.bottom-def.feet)<14);
   if(secret&&interact){if(!this.run.secrets.includes(secret.def.id)){this.run.secrets.push(secret.def.id);this.writeSave();reward(`Rahsia ditemui · ${this.run.secrets.length}/${SECRETS.length}`);}dialogue(this,pagesOf(secret.def.text),{portrait:'none'});} // V4
   CHECKPOINTS.forEach((cp,i)=>{const current=CHECKPOINTS.findIndex(c=>c.id===this.run.checkpointId);if(grounded&&Math.abs(this.player.x-cp.x)<48&&Math.abs(body.bottom-cp.feet)<8&&(!cp.requires||this.run.sluice.open)&&i>current){this.run.checkpointId=cp.id;this.checkpointArts[i].setFrame(112);this.writeSave();checkpointFx(this,this.checkpointArts[i],{audio,SFX,reduced:reducedMotion});this.message('Checkpoint disimpan. R untuk kembali ke sini.');}});
   const touch=matchMedia('(pointer: coarse)').matches;
   const sp=sluicePrompt(this,grounded||body.blocked.down||body.touching.down,touch);
   let prompt='';if(secret)prompt='E · Baca catatan';else if(sp)prompt=`E · ${sp.text}`;
   if(interact&&sp&&!secret)useSluice(this,{audio,SFX});
   {const g=document.querySelector('[data-action="interact"]');if(g)g.hidden=!(sp||secret);} // touch: Guna only when it does something
   const inExit=inFinishZone({x:this.player.x,feet:body.bottom,grounded:grounded||body.blocked.down||body.touching.down},GOAL);
   if(inExit&&this.run.sluice.open){this.finish();return;}
   if(inExit&&!this.run.sluice.open){prompt='Pulihkan pintu air dahulu';if(!this.exitHinted){this.exitHinted=true;this.message(prompt);}}else this.exitHinted=false;
   const wp=$('world-prompt');wp.hidden=!prompt;if(prompt){$('world-prompt-key').textContent=touch?'Guna':'E';$('world-prompt-text').textContent=prompt.replace(/^E · /,'');wp.style.transform='translate(-50%,0)';wp.style.left='50%';wp.style.top='auto';wp.style.bottom='108px';}
   syncSluiceUI(this);
   const zone=this.player.x<756?'Jejak Sungai':this.player.x<2538?'Runtuhan Bertingkat':this.player.x<3240?'Halaman Mesin':this.player.x<4104?'Air Terjun':'Gerbang Utama';
   hud(this,{level:'1–3',coins:this.run.coins.length,zone,coll:`Syiling ${this.run.coins.length}/${COINS.length} · Rahsia ${this.run.secrets.length}/${SECRETS.length}`}); // V4 plaque + ribbon
   if(time-(this.lastAutosave||0)>10000){this.lastAutosave=time;this.writeSave();}
  }
  message(text){$('objective').textContent=text;$('status').textContent=text;$('notice').textContent=text;$('notice').classList.add('show');this.noticeUntil=this.time.now+3500;}
  writeSave(){if(!this.run)return;this.run.elapsedMs=this.elapsed;if(!this.store.save(this.run)&&$('status'))$('status').textContent='Simpanan Level 1–3 tidak tersedia.';}
  respawn(){const cp=CHECKPOINTS.find(c=>c.id===this.run.checkpointId)||SPAWN;this.climbing=null;this.climbLockUntil=0;this.jumpAt=-1000;this.groundedAt=-1000;this.player.body.setAllowGravity(true);this.player.body.reset(cp.x,cp.feet-31);this.player.body.setVelocity(0,0);this.syncVisual();this.cameras.main.centerOn(cp.x,cp.feet-190);clearControls();}
  pauseRun(){if(this.mode!=='playing')return;this.mode='paused';clearControls();this.writeSave();this.physics.pause();this.tweens.pauseAll();this.time.paused=true;this.input.keyboard.enabled=false;$('world-prompt').hidden=true;$('quest-tracker')&&($('quest-tracker').hidden=true);$('inverse-dialog-title').textContent='Gerbang Songsang · Jeda';$('inverse-dialog-copy').textContent=`${this.run.coins.length}/${COINS.length} syiling · ${this.run.secrets.length}/${SECRETS.length} rahsia. Checkpoint disimpan.`;$('inverse-resume').hidden=false;$('inverse-replay').hidden=true;$('inverse-dialog').showModal();}
  resumeRun(){if(this.mode!=='paused')return;$('inverse-dialog').close();clearControls();this.mode='playing';this.physics.resume();this.tweens.resumeAll();this.time.paused=false;this.input.keyboard.enabled=true;renderTracker(this);$('game').focus({preventScroll:true});}
  finish(){if(this.mode==='complete'||!this.run.sluice.open)return;
   const prevBest=this.store.load().bestMs;
   this.run.checkpointId='gate-court';this.run.completed=true;this.writeSave();
   track('level_completed',{level:'w1-l3',duration_s:durationBucket(this.elapsed),coins:this.run.coins.length,secrets:this.run.secrets.length,ranked_eligible:false,first_completion:this.store.load().completions===1});
   this.mode='complete';clearControls();this.physics.pause();$('world-prompt').hidden=true;$('quest-tracker')&&($('quest-tracker').hidden=true);
   const best=this.store.load().bestMs,missing=SECRETS.length-this.run.secrets.length,coinsLeft=COINS.length-this.run.coins.length;
   SFX.victory?.(audio);
   showLevelVictory({level:'1-3',quote:'Fungsi songsang membantu mencari semula input daripada output: f⁻¹(13) = (13 − 3) ÷ 2 = 5.',
    coins:[this.run.coins.length,COINS.length],secrets:[this.run.secrets.length,SECRETS.length],timeMs:this.elapsed,
    newBest:Number.isFinite(best)&&(!Number.isFinite(prevBest)||best<prevBest),
    hint:missing?`Masih ada ${missing} rahsia tersembunyi di gerbang ini…`:coinsLeft?`Semua rahsia ditemukan! ${coinsLeft} syiling masih menunggu.`:'Semua syiling dan rahsia ditemukan. Jejak yang sempurna!',
    next:null,finale:{kicker:'Dunia 1 selesai!',title:'Dunia 2: Lembah Batu Kapur',quote:'Sedang dibina. Ulang level untuk kumpul syiling dan rahsia yang tertinggal.'},
    on:{replay:()=>this.scene.restart({fresh:true}),map:()=>this.returnToMenu(true),menu:()=>this.returnToMenu(false)}});
  }
  returnToMenu(toMap=true){this.writeSave();this.time.paused=false;this.tweens.resumeAll();this.input.keyboard.enabled=true;if(toMap)this.game.registry.set('showLevelSelect',true);this.scene.start('Lorong');}
 }
}
