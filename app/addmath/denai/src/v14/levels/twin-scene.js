import {buildLandscape,buildTree} from '../environment.js';
import {createPlayer} from '../core/player.js';
import {updatePlayer} from '../core/player-motion.js';
import {createCampaignStore,newRun} from '../core/campaign-store.js';
import {compose,solved,inFinishZone,TARGETS} from './composition.js';
import {workshopCommand,driveFraction} from './composition-workshop.js';
import {LEVELS} from './registry.js';
import {DEFINITION,WORLD,SPAWN,GOAL,STATIONS,CHECKPOINTS,COINS,SECRETS,WATER,WATER_Y} from './twin-world.js';
const $=id=>document.getElementById(id);
export function createTwinScene(Base,{controls,audio,SFX,reducedMotion,BASE_SCALE,setActive,clearControls}) {
 return class Jambatan extends Base {
  constructor(){super('Jambatan');}
  init(data={}) {
   super.init();this.fresh=data.fresh===true;this.store=createCampaignStore(localStorage);
   this.run=this.fresh?newRun():(this.store.load().levels['w1-l2'].run||newRun());
   this.elapsed=this.run.elapsedMs;this.mode='playing';this.bridges={};this.stationViews={};this.busy=false;this.nearStation=null;this.exitHinted=false;
  }
  // Shared textures are loaded by the initial L1 scene before scene switching.
  preload(){}
  create(){
   setActive(this);clearControls();
   this.physics.world.setBounds(0,0,WORLD.width,WORLD.height,true,true,true,false);
   this.solids=this.physics.add.staticGroup();
   const {tile,pole}=buildLandscape(this,DEFINITION);
   // Groves, not one tree per area: entry pair + garden oak, a machine-yard
   // shade tree, the deck tree, the canopy giant, a final-yard oak and an exit pair.
   [['T3',486,1296],['T1',600,1296],['T5',860,1242],['T4',1188,1296],['T6',2322,1296],['T7',3024,1296],['T5',3760,1242],['T3',4300,1242],['T1',4420,1242]].forEach(([type,x,y])=>buildTree(this,type,x,y));
   for(const d of DEFINITION.DECKS){pole(d.x+27,d.y+18,DEFINITION.AB_TERRAIN.find(t=>d.x>=t.x&&d.x<t.x+t.width)?.y||1296);}
   // One surface row (33) over body tiles (73) down past the floor: no second wave row, no gap.
   for(const w of WATER)for(let x=w.x;x<w.x+w.width;x+=54){tile(33,x,WATER_Y,7);tile(73,x,WATER_Y+54,7);}
   [[162,1296],[810,1242],[2484-54,1296],[3456,1242],[4482,1242]].forEach(([x,y])=>tile(125,x,y-54,11));
   tile(106,0,1242,11);tile(105,54,1242,11);
   this.checkpointArts=CHECKPOINTS.map(cp=>tile(cp.id===this.run.checkpointId?112:111,cp.x-27,cp.feet-54,12));
   tile(112,GOAL.x-27,GOAL.feet-54,12);
   // Finish arch: two rope posts on the flag terrace and a plank lintel
   // (replaces two floating colour bars that had no support).
   pole(GOAL.x-108,GOAL.feet-162,GOAL.feet);pole(GOAL.x+108,GOAL.feet-162,GOAL.feet);
   for(let x=GOAL.x-135;x<GOAL.x+135;x+=54)tile(x===GOAL.x-135?48:x+54>=GOAL.x+135?50:49,x,GOAL.feet-180,11,54,18);
   this.worldText('TAMAT',GOAL.x,GOAL.feet-186,18).setStyle({backgroundColor:'#315c49',color:'#fff2c5',fontStyle:'bold'});
   this.worldText('JEJAK MASUK',324,1100,21);
   this.worldText('LALUAN RAHSIA ↑',3000,930,18);
   for(const station of STATIONS)this.buildStation(station);
   this.coinViews=COINS.map(def=>({def,art:this.add.image(def.x,def.y,'kpp_coin').setScale(1.78).setDepth(14).setVisible(!this.run.coins.includes(def.id))}));
   this.secretViews=SECRETS.map(def=>({def,art:tile(67,def.x-18,def.feet-54,14,36,36).setAlpha(this.run.secrets.includes(def.id)?.4:1)}));
   createPlayer(this,{SPAWN,BASE_SCALE,reducedMotion,controls});
   const cam=this.cameras.main;
   cam.setBounds(0,300,WORLD.width,WORLD.floor-300).setBackgroundColor('#aee3f5');
   cam.startFollow(this.player,true,reducedMotion?1:.14,reducedMotion?1:.16,-85,100).setDeadzone(0,150);
   this.applyResponsiveZoom();this.respawn();
   this.installUI();
   document.body.classList.remove('menu-active');document.body.classList.add('game-active','twin-active');
   for(const id of ['welcome','loading','mission-indicator','chill-bubble','world-prompt','tutorial'])$(id).hidden=true;
   $('pause').disabled=false;$('touch-controls').hidden=!matchMedia('(pointer: coarse)').matches;
   $('hud-mode').hidden=true;
   this.message('Jambatan Berkembar — ikut sungai ke dua mesin. A/D: gerak · Space: lompat · W/S: tangga · E: guna.');
   this.writeSave();
   this.events.once('shutdown',()=>{
    this.writeSave();clearControls();this.input.keyboard.enabled=true;
    this.uiAbort.abort();$('twin-panel')?.remove();$('twin-dialog')?.remove();
    document.body.classList.remove('twin-active','twin-near-machine');$('touch-controls').hidden=true;
   });
  }
  worldText(text,x,y,size=17){return this.add.text(x,y,text,{fontFamily:'Arial, sans-serif',fontSize:`${size}px`,color:'#203e36',backgroundColor:'#f9f2d8',padding:{x:8,y:5},align:'center'}).setOrigin(.5,1).setDepth(15);}
  machineText(text,x,y,size=15){return this.add.text(x,y,text,{fontFamily:'Arial, sans-serif',fontSize:`${size}px`,fontStyle:'bold',color:'#fff1cf',stroke:'#3d493c',strokeThickness:3,align:'center'}).setOrigin(.5,1).setDepth(15);}
  buildStation(s){
   this.machineText(s.title.toUpperCase(),s.x,s.y-250,21);
   const machines=[this.tile(29,s.x-81,s.y-162,11),this.tile(31,s.x+27,s.y-162,11)];
   for(const x of [s.x-54,s.x+54]){this.tile(89,x-27,s.y-108,10);this.tile(89,x-27,s.y-54,10);}
   const names=[this.machineText('',s.x-54,s.y-170),this.machineText('',s.x+54,s.y-170)];
   this.machineText('→',s.x,s.y-125,24);
   const leverX=s.x+108;
   this.tile(64,leverX-27,s.y-54,11);
   const labels=[this.machineText('Hantar',leverX,s.y-60,15)];
   const receivers=['fg','gf'].map((order,i)=>{
    const x=s.bridge.x+(i?s.bridge.width:0);
    for(let y=s.y-108;y<s.y;y+=54)this.tile(89,x-27,y,10);
    const lamp=this.add.circle(x,s.y-110,11,0x796d50).setDepth(15);
    const label=this.machineText(`${order==='fg'?'f(g(x))':'g(f(x))'} · ${TARGETS[s.id][order]}`,x,s.y-132,14);
    return {lamp,label};
   });
   const preview=this.deck(s.bridge);preview.forEach(a=>a.setAlpha(.55));
   const driveLabel=this.machineText('Dua pemacu · pilih tanda penerima',s.x,s.y-210,14);
   this.stationViews[s.id]={machines,names,labels,receivers,preview,driveLabel};
   this.refreshStation(s);if(solved(this.run.puzzles[s.id]))this.openBridge(s,false);
  }
  refreshStation(s){
   const state=this.run.puzzles[s.id],view=this.stationViews[s.id],r=compose(state.input,state.order);
   view.names[0].setText(r.inner==='f'?'f: 2x + 1':'g: x²');view.names[1].setText(r.outer==='f'?'f: 2x + 1':'g: x²');
   view.labels[0].setText('Hantar');
   ['fg','gf'].forEach((o,i)=>view.receivers[i].lamp.setFillStyle(state.receivers[o]?0x438f55:0x796d50));
   const last=state.route&&state.drives?.[state.route];
   view.driveLabel.setText(last?`Output ${last.output} → tanda ${TARGETS[s.id][state.route]} · ${state.receivers[state.route]?'dikunci':last.output>TARGETS[s.id][state.route]?'lebihan, belum terkunci':'belum sejajar'}`:'Pilih tanda penerima sebelum menghantar');
   view.preview.forEach((a,i)=>{
    const route=i<view.preview.length/2?'fg':'gf',fraction=driveFraction(state,s.id,route);
    a.setVisible(!solved(state));
    const rest=s.bridge.x+i*54,side=route==='fg'?-1:1;
    this.tweens.killTweensOf(a);this.tweens.add({targets:a,x:rest+side*(1-fraction)*s.bridge.width/2,y:s.bridge.y+(state.receivers[route]?0:18),duration:reducedMotion?1:350});
   });
  }
  openBridge(s,animate=true){
   if(this.bridges[s.id])return;
   const decks=[s.bridge];if(s.id==='twins')decks.push({...s.bridge,id:'upper-twin',y:1134});
   this.bridges[s.id]=decks.flatMap(d=>{
    const arts=this.deck(d);this.platform(d);
    // Art and collision become available together; movement is visual only.
    if(animate&&!reducedMotion)arts.forEach((a,i)=>{a.setAlpha(.25);this.tweens.add({targets:a,alpha:1,duration:400,delay:i*70});});
    return arts;
   });
   if(animate){SFX.checkpoint(audio);this.message(`${s.title}: kedua-dua isyarat diterima. Jambatan kini kukuh — teruskan!`);}
  }
  installUI(){
   this.uiAbort=new AbortController();const signal=this.uiAbort.signal;
   const panel=document.createElement('section');panel.id='twin-panel';panel.hidden=true;panel.setAttribute('aria-label','Kawalan mesin fungsi');
   panel.innerHTML='<p class="twin-heading"></p><p class="twin-rule">f(x) = 2x + 1 · g(x) = x²</p><p class="twin-order"></p><div class="twin-actions"><button type="button" data-command="input"></button><button type="button" data-command="order">Tukar urutan</button></div><p class="twin-route-help">Ke tanda mana output ini akan menggerakkan dek?</p><div class="twin-actions"><button data-command="route-fg"></button><button data-command="route-gf"></button><button type="button" data-command="send">Hantar · E</button></div><div class="twin-comparison"><p data-trace="fg"></p><p data-trace="gf"></p></div><p class="twin-trace" role="status" aria-live="polite"></p>';
   document.querySelector('.game-frame').append(panel);
   panel.querySelectorAll('[data-command]').forEach(b=>b.addEventListener('click',()=>{audio.unlock();this.act(b.dataset.command);b.blur();$('game').focus({preventScroll:true});},{signal}));
   document.addEventListener('keydown',e=>{if(!this.nearStation||this.mode!=='playing'||e.repeat||e.target.matches?.('input,select'))return;const action={KeyX:'input',KeyT:'order',Digit1:'route-fg',Digit2:'route-gf'}[e.code];if(action){e.preventDefault();this.act(action);}},{signal});
   const dialog=document.createElement('dialog');dialog.id='twin-dialog';dialog.setAttribute('aria-labelledby','twin-dialog-title');
   dialog.innerHTML='<h2 id="twin-dialog-title"></h2><p id="twin-dialog-copy"></p><div class="twin-dialog-actions"><button type="button" id="twin-resume">Sambung</button><button type="button" id="twin-next" hidden>Teruskan ke Gerbang Songsang</button><button type="button" id="twin-replay">Main semula Level 1–2</button><button type="button" id="twin-menu">Pilih level</button></div>';
   document.querySelector('.shell').append(dialog);
   $('twin-resume').addEventListener('click',()=>this.resumeRun(),{signal});
   $('twin-next').addEventListener('click',()=>{if(!this.run.completed||!LEVELS.find(l=>l.id==='w1-l3')?.ready)return;dialog.close();this.time.paused=false;this.input.keyboard.enabled=true;this.scene.start('GerbangSongsang');},{signal});
   $('twin-replay').addEventListener('click',()=>{dialog.close();this.scene.restart({fresh:true});},{signal});
   $('twin-menu').addEventListener('click',()=>{dialog.close();this.returnToMenu();},{signal});
   dialog.addEventListener('cancel',event=>{event.preventDefault();if(this.mode==='paused')this.resumeRun();},{signal});
   window.addEventListener('pagehide',()=>this.writeSave(),{signal});
  }
  message(text){this.feedback=text;$('objective').textContent=text;$('status').textContent=text;$('notice').textContent=text;$('notice').classList.add('show');this.noticeUntil=this.time.now+6500;}
  act(action){
   const s=this.nearStation;if(!s||this.mode!=='playing'||this.busy)return;
   const before=this.run.puzzles[s.id];
   if(action==='send'&&!before.route){this.message('Pilih tanda penerima dahulu: 1 atau 2.');return;}
   const next=workshopCommand(before,action,s.id);
   if(action!=='send'){this.run.puzzles[s.id]=next;this.refreshStation(s);this.writeSave();return;}
   this.busy=true;this.pendingTrace=next.last;
   const result=next.last;
   const packet=this.worldText(String(result.input),s.x-150,s.y-116,20).setDepth(30);
   const finish=()=>{
    packet.destroy();this.busy=false;this.pendingTrace=null;this.run.puzzles[s.id]=next;
    this.refreshStation(s);if(solved(next))this.openBridge(s);
    this.writeSave();
    const destination=TARGETS[s.id][before.route];
    this.message(`${result.trace}. Ke tanda ${destination}: ${result.output===destination&&before.route===result.order?'pemacu dikunci.':`dek ${result.output<destination?'terlalu pendek':'melepasi tanda'}. Ubah input, urutan atau saluran.`}`);
   };
   // Commit after both machine steps; pausing freezes tweens and game time.
   this.tweens.add({targets:packet,x:s.x-54,duration:reducedMotion?1:350,onComplete:()=>{
    packet.setText(String(result.middle));
    this.tweens.add({targets:packet,x:s.x+54,duration:reducedMotion?1:550,onComplete:()=>{
     packet.setText(String(result.output));this.tweens.add({targets:packet,x:before.route==='fg'?s.bridge.x-48:s.bridge.x+s.bridge.width,duration:reducedMotion?1:450,onComplete:finish});
    }});
   }});
  }
  update(time,delta){
   if(!this.player||this.mode!=='playing')return;
   this.elapsed+=delta;
   const motion=updatePlayer(this,time,delta,{controls,audio,SFX,reducedMotion,BASE_SCALE,WATER,WATER_Y});
   if(motion.respawned)return;
   const {body,interact,grounded}=motion;
   if(body.bottom>1525){this.respawn();return;}
   if(this.noticeUntil&&time>this.noticeUntil){$('notice').classList.remove('show');this.noticeUntil=0;}
   for(const {def,art} of this.coinViews){
    // The coin over the upper bridge appears only with its supporting bridge.
    art.setVisible(!this.run.coins.includes(def.id)&&(def.x!==2052||solved(this.run.puzzles.twins)));
    if(art.visible&&Math.abs(this.player.x-def.x)<30&&Math.abs(body.center.y-def.y)<48){this.run.coins.push(def.id);art.setVisible(false);SFX.coin?.(audio);this.writeSave();}
   }
   CHECKPOINTS.forEach((cp,i)=>{
    // Both parallel routes share the safe lower-bank respawn point.
    const onLanding=Math.abs(body.bottom-cp.feet)<8||(cp.id==='beyond-twins'&&Math.abs(body.bottom-1134)<8);
    if(grounded&&Math.abs(this.player.x-cp.x)<44&&onLanding&&(!cp.requires||solved(this.run.puzzles[cp.requires]))&&CHECKPOINTS.findIndex(c=>c.id===this.run.checkpointId)<i){
     this.run.checkpointId=cp.id;this.checkpointArts[i].setFrame(112);this.writeSave();this.message('Checkpoint disimpan. R untuk kembali ke sini.');
    }
   });
   this.nearStation=STATIONS.find(s=>Math.abs(this.player.x-s.x)<255&&Math.abs(body.bottom-s.y)<65)||null;
   const secret=this.secretViews.find(({def})=>Math.abs(this.player.x-def.x)<55&&Math.abs(body.bottom-def.feet)<12);
   let prompt='';let action=null;
   if(this.nearStation){action='send';prompt='E · Hantar nombor';}
   if(secret){prompt='E · Baca catatan rahsia';if(interact){if(!this.run.secrets.includes(secret.def.id)){this.run.secrets.push(secret.def.id);secret.art.setAlpha(.4);this.writeSave();}this.message(secret.def.text);}}
   else if(interact&&action)this.act(action);
   const inExitZone=inFinishZone({x:this.player.x,feet:body.bottom,grounded:grounded||body.blocked.down||body.touching.down},GOAL);
   if(inExitZone&&solved(this.run.puzzles.final)){this.finish();return;}
   if(inExitZone&&!solved(this.run.puzzles.final)){
    prompt='Lengkapkan semua isyarat dahulu';
    if(!this.exitHinted){this.exitHinted=true;this.message(prompt);}
   }else this.exitHinted=false;
   const wp=$('world-prompt');wp.hidden=!prompt||this.mode!=='playing';
   if(prompt){$('world-prompt-key').textContent='E';$('world-prompt-text').textContent=prompt.slice(4);wp.style.transform='translate(-50%, 0)';wp.style.left='50%';wp.style.top='auto';wp.style.bottom='108px';}
   this.renderPanel();
   const zone=this.player.x<1080?'Jejak Masuk':this.player.x<2484?'Dua Mesin':this.player.x<3402?'Laluan Rahsia':'Jambatan Akhir';
   $('hud-area').textContent=`1–2 · ${zone}`;$('hud-collection').textContent=`${this.run.coins.length}/${COINS.length} · ${this.run.secrets.length}/2 rahsia`;
   if(time-(this.lastAutosave||0)>10000){this.lastAutosave=time;this.writeSave();}
  }
  renderPanel(){
   const panel=$('twin-panel'),s=this.nearStation;panel.hidden=!s||this.mode!=='playing';document.body.classList.toggle('twin-near-machine',!panel.hidden);if(!s)return;
   const state=this.run.puzzles[s.id],r=compose(state.input,state.order);
   panel.querySelector('.twin-heading').textContent=`${s.title} · sasaran ${s.targets} · ${Number(state.receivers.fg)+Number(state.receivers.gf)}/2`;
   panel.querySelector('.twin-order').textContent=`${r.outer}(${r.inner}(x)) · ${r.inner} dahulu`;
   panel.querySelector('[data-command="input"]').textContent=`Input: ${state.input} ↻`;
   panel.querySelectorAll('button').forEach(b=>b.disabled=this.busy);
   for(const [i,route] of ['fg','gf'].entries()){
    const b=panel.querySelector(`[data-command="route-${route}"]`);b.textContent=`${i+1} · Ke ${TARGETS[s.id][route]}`;b.setAttribute('aria-pressed',String(state.route===route));
    const trace=state.history?.[`${state.input}:${route}`];panel.querySelector(`[data-trace="${route}"]`).textContent=trace?trace.trace:`${route==='fg'?'g → f':'f → g'}: belum diuji pada x=${state.input}`;
   }
   panel.querySelector('[data-command="send"]').disabled=this.busy||!state.route;
   const last=this.pendingTrace||state.last;
   panel.querySelector('.twin-trace').textContent=this.busy?`Memproses… ${last.trace}`:this.feedback||'X: input · T: urutan · 1/2: saluran. Bandingkan jejak kedua-dua urutan.';
  }
  writeSave(){if(!this.run)return;this.run.elapsedMs=this.elapsed;if(!this.store.saveRun(this.run)&&$('status'))$('status').textContent='Simpanan tidak tersedia. Kemajuan sesi ini masih boleh dimainkan.';}
  resetCrate(){}
  respawn(){
   const cp=CHECKPOINTS.find(c=>c.id===this.run.checkpointId)||SPAWN;
   this.climbing=null;this.climbLockUntil=0;this.jumpAt=-1000;this.groundedAt=-1000;
   this.player.body.setAllowGravity(true);this.player.body.reset(cp.x,cp.feet-31);this.player.body.setVelocity(0,0);this.syncVisual();
   this.cameras.main.centerOn(cp.x,cp.feet-190);clearControls();
  }
  pauseRun(){
   if(this.mode!=='playing')return;this.mode='paused';clearControls();this.writeSave();this.physics.pause();this.tweens.pauseAll();this.time.paused=true;this.input.keyboard.enabled=false;
   $('twin-panel').hidden=true;$('world-prompt').hidden=true;
   $('twin-dialog-title').textContent='Jambatan Berkembar · Jeda';
   const notes=SECRETS.filter(s=>this.run.secrets.includes(s.id)).map(s=>s.text).join('\n\n');
   $('twin-dialog-copy').textContent=`${this.run.coins.length}/${COINS.length} syiling · ${this.run.secrets.length}/2 rahsia. Checkpoint disimpan.\n\n${notes}`;
   $('twin-resume').hidden=false;$('twin-next').hidden=true;$('twin-replay').hidden=true;$('twin-dialog').showModal();$('twin-resume').focus();
  }
  resumeRun(){if(this.mode!=='paused')return;$('twin-dialog').close();clearControls();this.mode='playing';this.physics.resume();this.tweens.resumeAll();this.time.paused=false;this.input.keyboard.enabled=true;$('game').focus({preventScroll:true});}
  finish(){
   if(!solved(this.run.puzzles.final))return;
   this.run.checkpointId='exit';this.run.completed=true;this.writeSave();this.mode='complete';clearControls();this.physics.pause();
   $('twin-panel').hidden=true;$('world-prompt').hidden=true;$('twin-dialog-title').textContent='Jambatan Berkembar selesai!';
   const nextReady=LEVELS.find(l=>l.id==='w1-l3')?.ready;
   $('twin-next').hidden=!nextReady;
   $('twin-dialog-copy').textContent=`${this.run.coins.length}/${COINS.length} syiling · ${this.run.secrets.length}/2 rahsia · ${Math.round(this.elapsed/1000)} saat.\n\nPada x = 3: f(g(3)) = 19, g(f(3)) = 49. Urutan fungsi penting.\n\n${nextReady?'Seterusnya: Gerbang Songsang — pulihkan input untuk mengawal dek.':'Lebih banyak pengembaraan akan datang.'}`;
   $('twin-resume').hidden=true;$('twin-replay').hidden=false;$('twin-dialog').showModal();$('twin-replay').focus();
  }
  returnToMenu(){this.writeSave();this.time.paused=false;this.tweens.resumeAll();this.input.keyboard.enabled=true;this.game.registry.set('showLevelSelect',true);this.scene.start('Lorong');}
 };
}
