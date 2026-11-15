import {buildLandscape,buildTree} from '../environment.js';
import {createPlayer} from '../core/player.js';
import {updatePlayer} from '../core/player-motion.js';
import {createInverseStore,newRun} from '../core/inverse-campaign.js';
import {puzzleCommand,solved,inFinishZone,SEAL_OUTPUTS,RANGE,stage,target,work,OPERATIONS} from './inverse.js';
import {DEFINITION,WORLD,SPAWN,GOAL,BRIDGE,CHECKPOINTS,COINS,SECRETS,WATER,WATER_Y,WATERFALL} from './inverse-world.js';
const $=id=>document.getElementById(id);
export function createInverseScene(Base,{controls,audio,SFX,reducedMotion,BASE_SCALE,setActive,clearControls}){
 return class GerbangSongsang extends Base{
  constructor(){super('GerbangSongsang');}
  init(data={}){
   super.init();this.fresh=data.fresh===true;this.store=createInverseStore(localStorage);
   this.run=this.fresh?newRun():(this.store.load().run||newRun());this.elapsed=this.run.elapsedMs;
   this.mode='playing';this.exitHinted=false;this.busy=false;this.machineNear=false;this.seenHint=new Set();
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
   [['T3',324,1728],['T3',594,1728],['T3',1512,1728],['T1',1674,1728],['T3',2268,1674],['T1',2376,1674],['T4',3996,1674],['T2',4320,1620],['T2',5400,1566]].forEach(([type,x,y])=>buildTree(this,type,x,y));
   for(const d of DEFINITION.DECKS){
    for(const x of [d.x+27,d.x+d.width-27]){
     const ground=DEFINITION.AB_TERRAIN.find(t=>x>=t.x&&x<t.x+t.width)?.y||WORLD.floor;
     if(ground>d.y+18)pole(x,d.y+18,ground,4);
    }
   }
   this.checkpointArts=CHECKPOINTS.map(cp=>tile(cp.id===this.run.checkpointId?112:111,cp.x-27,cp.feet-54,12));
   this.buildRuinDetails(tile,pole,beam);
   this.creekBridgeArt=this.deckArtById?.['creek-crossing']||[];
   this.creekBridgeArt.forEach(a=>a.setData('restY',a.y));
   if(!reducedMotion){let phase=0;this.time.addEvent({delay:520,loop:true,callback:()=>{phase^=1;this.waterSurfaceTiles?.forEach((a,i)=>a.setFrame(((i+phase)&1)?53:33));}});}
   this.coinViews=COINS.map(def=>({def,art:this.add.image(def.x,def.y,'kpp_coin').setScale(1.78).setDepth(14).setVisible(!this.run.coins.includes(def.id))}));
   // Keep notes discoverable through the close-range E prompt without
   // floating blue gem markers that read like detached pipe fragments.
   this.secretViews=SECRETS.map(def=>({def}));
   createPlayer(this,{SPAWN,BASE_SCALE,reducedMotion,controls});
   this.cameras.main.setBounds(0,240,WORLD.width,WORLD.floor-240).setBackgroundColor('#aee3f5');
   this.cameras.main.startFollow(this.player,true,reducedMotion?1:.14,reducedMotion?1:.16,-85,100).setDeadzone(0,150);
   this.applyResponsiveZoom();this.respawn();this.installUI();
   document.body.classList.remove('menu-active');document.body.classList.add('game-active','inverse-active');
   for(const id of ['welcome','loading','mission-indicator','chill-bubble','world-prompt','tutorial'])$(id).hidden=true;
   $('pause').disabled=false;$('touch-controls').hidden=!matchMedia('(pointer: coarse)').matches;$('hud-mode').hidden=true;
   this.updateGate();this.message('Undur operasi mesin, kemudian gunakan input asal untuk mengangkat jambatan. Mula dengan demonstrasi 13.');this.writeSave();
   this.events.once('shutdown',()=>{this.writeSave();clearControls();this.uiAbort?.abort();$('inverse-panel')?.remove();$('inverse-dialog')?.remove();document.body.classList.remove('inverse-active','inverse-near-machine');$('touch-controls').hidden=true;});
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
   this.placePipePath([[2646,1566],[2646,1404],[3240,1404],[3240,1458]],11);
   // A short timber service frame supports the pipe and carries the controls.
   for(let x=2700;x<3024;x+=54)tile(x===2700?48:x+54>=3024?50:49,x,1566,9.6,54,18);
   for(const x of [2673,2862,2997])pole(x,1458,1566,9.7);
   // A narrow creek passes under the entry footbridge; water is scenery only.
   this.waterSurfaceTiles=[];
   for(let x=378;x<486;x+=54){
    this.waterSurfaceTiles.push(tile(33,x,1782,6));
    tile(x===378?74:75,x,1836,6);
    tile(x===378?74:75,x,1890,6);
    tile(6,x,1944,6);
   }
   // The cliff lip pours into the empty ravine; the lower river tiles form
   // the catch pool. This cascade is scenic and adds no gameplay collider.
   this.waterfallTiles=[];
   for(let y=WATERFALL.top;y<WATERFALL.bottom;y+=54)this.waterfallTiles.push(tile(73,WATERFALL.x,y,6));
   for(let x=3240;x<3456;x+=54){
    this.waterSurfaceTiles.push(tile(33,x,1674,6));
    for(let y=1728;y<2034;y+=54)tile(73,x,y,6);
   }
   this.machineScreen=this.add.text(2862,1398,'f(x) = 2x + 3',{fontFamily:'Arial,sans-serif',fontSize:'16px',fontStyle:'bold',color:'#fff1cf',stroke:'#394238',strokeThickness:3}).setOrigin(.5,1).setDepth(15);
   // A real gap is crossed only after all three inverse seals release this deck.
   this.previewDeck=[];
   for(let x=BRIDGE.x;x<BRIDGE.x+BRIDGE.width;x+=54){const frame=x===BRIDGE.x?48:x+54>=BRIDGE.x+BRIDGE.width?50:49;this.previewDeck.push(tile(frame,x,BRIDGE.y+54,10,54,18).setAlpha(.55));}
   this.driveReadout=this.machineText('Pratonton dek · belum boleh dipijak',BRIDGE.x,BRIDGE.y-72,14).setOrigin(0,1);
   this.driveHandle=tile(64,2781,1512,14);
   this.bridgeArt=[];
   // Stone gateway: paired masonry piers, a deep lintel and three puzzle seals.
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
   this.gateSeals=SEAL_OUTPUTS.map((out,i)=>{
    const x=left+126+i*90;const art=this.add.circle(x,top-84,17,0x746847).setStrokeStyle(4,0x394238).setDepth(15);
    const label=this.machineText(String(out),x,top-48,15);return {out,art,label};
   });
   this.gateLabel=this.worldText('PINTU KELUAR\nPerlu 3 meterai: 13, 7, 15',5076,1398,14);
  }
  areaSign(tile,pole,x,y,width,text){
   const left=x-width/2;
   for(let row=0;row<2;row++)for(let dx=0;dx<width;dx+=54){
    const frame=dx===0?48:dx+54>=width?50:49;tile(frame,left+dx,y+row*18,11,54,18);
   }
   pole(left+18,y+36,y+72,11);pole(left+width-18,y+36,y+72,11);
   this.add.text(x,y+18,text,{fontFamily:'Arial,sans-serif',fontSize:'14px',fontStyle:'bold',color:'#fff0ce',stroke:'#593c2a',strokeThickness:3,align:'center'}).setOrigin(.5,.5).setDepth(12);
  }
  placePipePath(points,depth=11){
   for(let i=1;i<points.length;i++){
    const [x1,y1]=points[i-1],[x2,y2]=points[i];
    if(y1===y2){for(let x=x1;x<x2;x+=54)this.pipeTile(x===x1?132:133,x,y1,depth);}
    else if(x1===x2){const step=y2>y1?54:-54;for(let y=y1+step;y!==y2;y+=step)this.pipeTile(135,x1,y,depth);}
    else throw new Error('Kenney pipe route must use horizontal or vertical runs');
    const next=points[i+1];
    if(next&&((x2-x1===0)!==(next[0]-x2===0))){
     const bend=this.pipeTile(94,x2,y2,depth+.1);
     if(x1===x2&&next[1]===y2)bend.setOrigin(.5).setPosition(x2+27,y2+27).setRotation(-Math.PI/2);
    }
   }
   const last=points.at(-1),prev=points.at(-2);
   if(last[0]===prev[0])this.pipeTile(135,last[0],last[1],depth);
   else this.pipeTile(134,last[0],last[1],depth);
  }
  worldText(text,x,y,size=16){return this.add.text(x,y,text,{fontFamily:'Arial,sans-serif',fontSize:`${size}px`,color:'#203e36',backgroundColor:'#f9f2d8',padding:{x:8,y:5},align:'center'}).setOrigin(.5,1).setDepth(15);}
  machineText(text,x,y,size=15){return this.add.text(x,y,text,{fontFamily:'Arial,sans-serif',fontSize:`${size}px`,fontStyle:'bold',color:'#fff1cf',stroke:'#3d493c',strokeThickness:3,align:'center'}).setOrigin(.5,1).setDepth(16);}
  installUI(){
   this.uiAbort=new AbortController();const signal=this.uiAbort.signal;
   const panel=document.createElement('section');panel.id='inverse-panel';panel.hidden=true;panel.setAttribute('aria-label','Kawalan mesin songsang');
   panel.innerHTML='<p class="inverse-heading"></p><p class="inverse-rule">f(x)=2x+3 · domain {0…6}<br>Imej {3,5,7,9,11,13,15}</p><label class="inverse-select">Output y <select id="inverse-output" aria-label="Output untuk diproses"></select></label><p class="inverse-order"></p><button data-action="demo">Lihat demonstrasi 13 → 5</button><div class="inverse-actions inverse-operations"><button data-action="subtract" title="J">−3</button><button data-action="divide" title="K">÷2</button><button data-action="add" title="U">+3</button><button data-action="multiply" title="I">×2</button></div><p class="inverse-work"></p><div class="inverse-actions"><button data-action="undo">Undur</button><button data-action="reset">Mula semula</button></div><label class="inverse-drive" hidden>Input pemacu x <input id="inverse-actuator" type="range" min="0" max="6" step="1" value="0"><output id="inverse-actuator-value">0</output></label><button data-action="apply">Salur nilai ke dek · E</button><p class="inverse-trace" role="status" aria-live="polite"></p>';
   document.querySelector('.game-frame').append(panel);
   for(let y=0;y<=18;y++)$('inverse-output').add(new Option(String(y),String(y)));
   $('inverse-output').addEventListener('change',e=>this.act('select',Number(e.target.value)),{signal});
   $('inverse-actuator').addEventListener('input',e=>this.act('actuator',Number(e.target.value)),{signal});
   panel.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{audio.unlock();this.act(b.dataset.action);},{signal}));
   // Machine shortcuts never replace movement keys. Native select/slider retain their keys.
   const keys={KeyJ:'subtract',KeyK:'divide',KeyU:'add',KeyI:'multiply',Backspace:'undo'};
   document.addEventListener('keydown',e=>{if(!this.machineNear||this.mode!=='playing'||e.repeat||e.target.matches?.('input,select'))return;const action=keys[e.code];if(action){e.preventDefault();this.act(action);}},{signal});
   panel.addEventListener('keydown',e=>{if(e.target.matches('input,select'))e.stopPropagation();},{signal});
   panel.addEventListener('focusin',()=>clearControls(),{signal});
   const dialog=document.createElement('dialog');dialog.id='inverse-dialog';dialog.setAttribute('aria-labelledby','inverse-dialog-title');
   dialog.innerHTML='<h2 id="inverse-dialog-title"></h2><p id="inverse-dialog-copy"></p><div class="inverse-dialog-actions"><button id="inverse-resume">Sambung</button><button id="inverse-replay">Main semula 1–3</button><button id="inverse-menu">Pilih level</button></div>';
   document.querySelector('.shell').append(dialog);
   $('inverse-resume').addEventListener('click',()=>this.resumeRun(),{signal});
   $('inverse-replay').addEventListener('click',()=>{dialog.close();this.scene.restart({fresh:true});},{signal});
   $('inverse-menu').addEventListener('click',()=>this.returnToMenu(),{signal});
   dialog.addEventListener('cancel',e=>{e.preventDefault();if(this.mode==='paused')this.resumeRun();},{signal});
  }
  updateGate(){
   const open=solved(this.run.puzzle);
   const p=this.run.puzzle;
   this.previewDeck?.forEach((art,i)=>{
    const seal=SEAL_OUTPUTS[Math.floor(i*3/this.previewDeck.length)];
    const trial=p.applied,offset=trial?Math.max(-48,Math.min(90,(trial.target-trial.output)*8)):54;
    this.tweens.killTweensOf(art);
    const y=BRIDGE.y+(p.seals[seal]?0:offset||24);
    art.setVisible(!open);this.tweens.add({targets:art,y,alpha:p.seals[seal]?1:.65,duration:reducedMotion?1:420});
   });
   if(p.applied){this.driveHandle?.setX(2781+p.applied.input*18);this.driveReadout?.setText(`Pemacu ${p.applied.input} → ${p.applied.output} · tanda ${p.applied.target}\n${open?'Dek dikunci · lintas': 'Pratonton · lengkapkan 3 pengunci'}`);}
   this.gateSeals?.forEach(({out,art})=>art.setFillStyle(this.run.puzzle.seals[out]?0xe6c75f:0x746847));
   this.gateLabel?.setText(open?'PINTU KELUAR\nMeterai lengkap - jambatan terbuka':'PINTU KELUAR\nPerlu 3 meterai: 13, 7, 15');
   if(open&&!this.bridgeArt.length){this.bridgeArt=this.deck(BRIDGE);this.platform(BRIDGE);this.bridgeArt.forEach(a=>a.setAlpha(reducedMotion?1:.95));}
  }
  act(action,value){
   if(!this.machineNear||this.mode!=='playing'||this.busy)return;
   const before=this.run.puzzle,next=puzzleCommand(before,action,value);
   const animate=action==='demo'||action==='apply'||Object.hasOwn(OPERATIONS,action);
   const commit=()=>{this.busy=false;this.pendingPuzzle=null;this.run.puzzle=next;this.updateGate();this.renderPanel();this.writeSave();if(next.last)this.message(next.last.trace);};
   if(!animate){commit();return;}
   this.busy=true;this.pendingPuzzle=next;
   const packet=this.machineText(String(work(before).value),2808,1370,18).setDepth(30);
   const values=action==='demo'&&next.demoSeen?[13,10,5]:[work(before).value,action==='apply'?next.applied?.output??work(next).value:work(next).value];
   let step=0;const advance=()=>{packet.setText(String(values[step]));if(++step>=values.length){this.time.delayedCall(reducedMotion?1:280,()=>{packet.destroy();commit();});return;}this.tweens.add({targets:packet,x:2808+step*90,duration:reducedMotion?1:400,onComplete:advance});};advance();
   this.renderPanel();
  }
  renderPanel(){
   const p=$('inverse-panel');p.hidden=!this.machineNear||this.mode!=='playing';document.body.classList.toggle('inverse-near-machine',!p.hidden);if(!this.machineNear)return;
   const state=this.run.puzzle,phase=stage(state),independent=['independent','complete'].includes(phase);
   p.querySelector('.inverse-heading').textContent=`${{demo:'A · Lihat dan cuba',guided:'B · Undur operasi',independent:'C · Pandu dek',complete:'Bengkel bebas'}[phase]} · tanda ${target(state)}`;
   p.querySelector('.inverse-order').textContent=phase==='demo'?'Lihat 13 → 10 → 5, kemudian salurkan 5.':phase==='guided'?'Pilih output 7. Batalkan +3 dahulu, kemudian ×2. Gunakan tuas.':phase==='independent'?'Pulihkan input untuk output 15. Laras pemacu x sendiri, kemudian salurkan.':'Pengunci kekal. Cuba output lain tanpa menutup laluan.';
   p.querySelector('[data-action="demo"]').hidden=phase!=='demo';
   p.querySelector('.inverse-drive').hidden=!independent;
   if(document.activeElement!==$('inverse-output'))$('inverse-output').value=String(state.output);
   if(document.activeElement!==$('inverse-actuator'))$('inverse-actuator').value=String(state.actuator);
   $('inverse-actuator-value').value=String(state.actuator);
   p.querySelector('.inverse-work').textContent=work(this.pendingPuzzle||state).trace;
   const last=this.pendingPuzzle?.last||state.last;p.querySelector('.inverse-trace').textContent=this.busy?'Mesin bergerak…':last?.trace||'J: −3 · K: ÷2 · U: +3 · I: ×2 · Undur: Backspace';
   p.querySelectorAll('button,select,input').forEach(b=>b.disabled=this.busy);
   p.querySelector('[data-action="undo"]').disabled=this.busy||!state.steps.length;
  }
  update(time,delta){
   if(!this.player||this.mode!=='playing')return;this.elapsed+=delta;
   const motion=updatePlayer(this,time,delta,{controls,audio,SFX,reducedMotion,BASE_SCALE,WATER,WATER_Y});if(motion.respawned)return;
   const {body,interact,grounded}=motion;if(body.bottom>WORLD.floor-8){this.respawn();return;}
   if(!reducedMotion&&grounded&&Math.abs(body.velocity.x)>35&&this.player.x>=348&&this.player.x<=516&&time>=(this.nextCreekWobbleAt||0)){
    const direction=Math.sign(body.velocity.x);this.nextCreekWobbleAt=time+360;
    this.creekBridgeArt.forEach((a,i)=>{this.tweens.killTweensOf(a);this.tweens.add({targets:a,y:a.getData('restY')+(i%2?2:-2),angle:(i%2?1:-1)*direction,duration:85,yoyo:true,repeat:1,ease:'Sine.inOut'});});
   }
   if(this.noticeUntil&&time>this.noticeUntil){$('notice').classList.remove('show');this.noticeUntil=0;}
   for(const {def,art} of this.coinViews)if(art.visible&&Math.abs(this.player.x-def.x)<32&&Math.abs(body.center.y-def.y)<48){this.run.coins.push(def.id);art.setVisible(false);SFX.coin?.(audio);this.writeSave();}
   for(const {def,art} of this.secretViews){if(Math.abs(this.player.x-def.x)<54&&Math.abs(body.bottom-def.feet)<14){if(interact){if(!this.run.secrets.includes(def.id)){this.run.secrets.push(def.id);art?.setAlpha(.4);this.writeSave();}this.message(def.text);}}}
   CHECKPOINTS.forEach((cp,i)=>{const current=CHECKPOINTS.findIndex(c=>c.id===this.run.checkpointId);if(grounded&&Math.abs(this.player.x-cp.x)<48&&Math.abs(body.bottom-cp.feet)<8&&(!cp.requires||solved(this.run.puzzle))&&i>current){this.run.checkpointId=cp.id;this.checkpointArts[i].setFrame(112);this.writeSave();this.message('Checkpoint disimpan. R untuk kembali ke sini.');}});
   this.machineNear=Math.abs(this.player.x-2862)<260&&Math.abs(body.bottom-1620)<70;
   const secretNear=this.secretViews.some(({def})=>Math.abs(this.player.x-def.x)<54&&Math.abs(body.bottom-def.feet)<14);
   let prompt='';if(secretNear)prompt='E · Baca catatan';else if(this.machineNear)prompt='E · Salur nilai ke dek';
   if(interact&&this.machineNear&&!secretNear)this.act(stage(this.run.puzzle)==='demo'&&!this.run.puzzle.demoSeen?'demo':'apply');
   const inExit=inFinishZone({x:this.player.x,feet:body.bottom,grounded:grounded||body.blocked.down||body.touching.down},GOAL);
   if(inExit&&solved(this.run.puzzle)){this.finish();return;}
   if(inExit&&!solved(this.run.puzzle)){prompt='Terangi ketiga-tiga meterai dahulu';if(!this.exitHinted){this.exitHinted=true;this.message(prompt);}}else this.exitHinted=false;
   const wp=$('world-prompt');wp.hidden=!prompt;if(prompt){$('world-prompt-key').textContent='E';$('world-prompt-text').textContent=prompt.replace(/^E · /,'');wp.style.transform='translate(-50%,0)';wp.style.left='50%';wp.style.top='auto';wp.style.bottom='108px';}
   this.renderPanel();
   const zone=this.player.x<756?'Jejak Sungai':this.player.x<2538?'Runtuhan Bertingkat':this.player.x<3240?'Halaman Mesin':this.player.x<4104?'Air Terjun':'Gerbang Utama';
   $('hud-area').textContent=`1–3 · ${zone}`;$('hud-collection').textContent=`${this.run.coins.length}/${COINS.length} · ${this.run.secrets.length}/${SECRETS.length} rahsia`;
   if(time-(this.lastAutosave||0)>10000){this.lastAutosave=time;this.writeSave();}
  }
  message(text){$('objective').textContent=text;$('status').textContent=text;$('notice').textContent=text;$('notice').classList.add('show');this.noticeUntil=this.time.now+6000;}
  writeSave(){if(!this.run)return;this.run.elapsedMs=this.elapsed;if(!this.store.save(this.run)&&$('status'))$('status').textContent='Simpanan Level 1–3 tidak tersedia.';}
  respawn(){const cp=CHECKPOINTS.find(c=>c.id===this.run.checkpointId)||SPAWN;this.climbing=null;this.climbLockUntil=0;this.jumpAt=-1000;this.groundedAt=-1000;this.player.body.setAllowGravity(true);this.player.body.reset(cp.x,cp.feet-31);this.player.body.setVelocity(0,0);this.syncVisual();this.cameras.main.centerOn(cp.x,cp.feet-190);clearControls();}
  pauseRun(){if(this.mode!=='playing')return;this.mode='paused';clearControls();this.writeSave();this.physics.pause();this.tweens.pauseAll();this.time.paused=true;this.input.keyboard.enabled=false;$('inverse-panel').hidden=true;$('world-prompt').hidden=true;$('inverse-dialog-title').textContent='Gerbang Songsang · Jeda';$('inverse-dialog-copy').textContent=`${this.run.coins.length}/${COINS.length} syiling · ${this.run.secrets.length}/${SECRETS.length} rahsia. Checkpoint disimpan.`;$('inverse-resume').hidden=false;$('inverse-replay').hidden=true;$('inverse-dialog').showModal();}
  resumeRun(){if(this.mode!=='paused')return;$('inverse-dialog').close();clearControls();this.mode='playing';this.physics.resume();this.tweens.resumeAll();this.time.paused=false;this.input.keyboard.enabled=true;$('game').focus({preventScroll:true});}
  finish(){if(this.mode==='complete'||!solved(this.run.puzzle))return;this.run.checkpointId='gate-court';this.run.completed=true;this.writeSave();this.mode='complete';clearControls();this.physics.pause();$('inverse-panel').hidden=true;$('world-prompt').hidden=true;$('inverse-dialog-title').textContent='Gerbang Songsang dibuka!';$('inverse-dialog-copy').textContent=`${this.run.coins.length}/${COINS.length} syiling · ${this.run.secrets.length}/${SECRETS.length} rahsia · ${Math.round(this.elapsed/1000)} saat.\n\nf(x)=2x+3 pada domain {0,…,6} ialah satu-ke-satu. f⁻¹(13)=(13−3)/2=5. Songsangan memulangkan input asal; ia bukan 1/f.`;$('inverse-resume').hidden=true;$('inverse-replay').hidden=false;$('inverse-dialog').showModal();}
  returnToMenu(){this.writeSave();this.time.paused=false;this.tweens.resumeAll();this.input.keyboard.enabled=true;this.game.registry.set('showLevelSelect',true);this.scene.start('Lorong');}
 }
}
