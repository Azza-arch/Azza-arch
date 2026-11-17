import {buildLandscape,buildTree,signText} from '../environment.js';
import {track,durationBucket} from '../analytics.js';
import {showLevelVictory} from '../victory.js';
import {startCoin,coinPickup,checkpointFx,ATLAS,COIN_FACE} from '../feel.js';
import {createPlayer} from '../core/player.js';
import {updatePlayer} from '../core/player-motion.js';
import {createCampaignStore,newRun} from '../core/campaign-store.js';
import {inFinishZone} from './composition.js';
import {LEVELS} from './registry.js';
import {DEFINITION,WORLD,SPAWN,GOAL,CHECKPOINTS,COINS,SECRETS,WATER,WATER_Y,PIERS} from './twin-world.js';
import {installViewCull} from '../core/view-cull.js';
import {hud,dialogue,pagesOf,reward} from '../ui/v4-ui.js';
import {buildWorkshop,workshopPrompt,useWorkshop,syncWorkshopUI,renderTracker as renderWorkshopTracker,newWorkshop} from './workshop-line.js';
const $=id=>document.getElementById(id);
export function createTwinScene(Base,{controls,audio,SFX,reducedMotion,BASE_SCALE,setActive,clearControls}) {
 return class Jambatan extends Base {
  constructor(){super('Jambatan');}
  init(data={}) {
   super.init();this.fresh=data.fresh===true;this.store=createCampaignStore(localStorage);
   this.run=this.fresh?newRun():(this.store.load().levels['w1-l2'].run||newRun());
   this.run.workshop||=newWorkshop();this.elapsed=this.run.elapsedMs;this.mode='playing';this.bridges={};this.stationViews={};this.busy=false;this.nearStation=null;this.exitHinted=false;
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
   [['T3',486,1296],['T1',600,1296],['T5',860,1242],['T4',1188,1296],['T6',2322,1296],['T7',3024,1296],['T3',4300,1242],['T1',4420,1242]].forEach(([type,x,y])=>buildTree(this,type,x,y));
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
   // Wayfinding on Kenney sign posts (frame 86 blank board)
   // instead of floating text boxes; the 2 s area banners stay as they are.
   tile(86,270-27,1296-54,11);signText(this,'Jejak Masuk',270,1236);
   tile(86,3096-27,1296-54,11);signText(this,'Laluan rahsia ↑',3096,1236);
   signText(this,'TAMAT',GOAL.x,GOAL.feet-182).setFontSize(20); // on the finish arch's plank lintel
   // World 1 V3: the first river is crossed on two posts (platforming only).
   for(const pr of PIERS){this.platform({...pr,oneWay:true});this.deck(pr);pole(pr.x+36,pr.y+18,WATER_Y+30);}
   // Gudang: the five components wait here for the workshop downstream.
   for(const [dx,dy] of [[0,0],[54,0],[27,-54]])tile(26,1377+dx,1242+dy,10.5);
   tile(85,1512,1242,11);signText(this,'Bengkel di hilir',1539,1236);
   buildWorkshop(this,{audio,SFX});
   this.coinViews=COINS.map((def,i)=>({def,art:startCoin(this,this.add.sprite(def.x,def.y,ATLAS,COIN_FACE).setScale(1.78).setDepth(14),i,reducedMotion).setVisible(!this.run.coins.includes(def.id))}));
   this.secretViews=SECRETS.map(def=>({def,art:this.add.image(def.x,def.feet-18,'kpp_terrain_atlas',67).setOrigin(.5,1).setScale(2).setDepth(14).setAlpha(this.run.secrets.includes(def.id)?.4:1)}));
   createPlayer(this,{SPAWN,BASE_SCALE,reducedMotion,controls});
   const cam=this.cameras.main;
   cam.setBounds(0,300,WORLD.width,WORLD.floor-300).setBackgroundColor(this.bgColor??'#aee3f5');
   cam.startFollow(this.player,true,reducedMotion?1:.14,reducedMotion?1:.16,-85,100).setDeadzone(0,150);
   this.applyResponsiveZoom();this.respawn();
   this.installUI();
   // Fasa F: skip drawing off-screen tiles (core/view-cull.js; measured, pixel-identical).
   if(!window.__DENAI_NO_CULL__)this.viewCull=installViewCull(this);
   document.body.classList.remove('menu-active');document.body.classList.add('game-active','twin-active');
   for(const id of ['welcome','loading','mission-indicator','chill-bubble','world-prompt','tutorial'])$(id).hidden=true;
   $('pause').disabled=false;$('touch-controls').hidden=!matchMedia('(pointer: coarse)').matches;
   $('hud-mode').hidden=true;
   this.message('Ikut sungai ke bengkel di hilir.');
   this.writeSave();
   this.events.once('shutdown',()=>{
    this.writeSave();clearControls();this.input.keyboard.enabled=true;
    this.uiAbort.abort();$('twin-panel')?.remove();$('twin-dialog')?.remove();
    document.body.classList.remove('twin-active','twin-near-machine');$('touch-controls').hidden=true;
   });
  }
  worldText(text,x,y,size=17){return this.add.text(x,y,text,{fontFamily:'Arial, sans-serif',fontSize:`${size}px`,color:'#203e36',backgroundColor:'#f9f2d8',padding:{x:8,y:5},align:'center'}).setOrigin(.5,1).setDepth(15);}
  machineText(text,x,y,size=15){return this.add.text(x,y,text,{fontFamily:'Arial, sans-serif',fontSize:`${size}px`,fontStyle:'bold',color:'#fff1cf',stroke:'#3d493c',strokeThickness:3,align:'center'}).setOrigin(.5,1).setDepth(15);}
  installUI(){
   this.uiAbort=new AbortController();const signal=this.uiAbort.signal;
   const dialog=document.createElement('dialog');dialog.id='twin-dialog';dialog.setAttribute('aria-labelledby','twin-dialog-title');
   dialog.innerHTML='<h2 id="twin-dialog-title"></h2><p id="twin-dialog-copy"></p><div class="twin-dialog-actions"><button type="button" id="twin-resume">Sambung</button><button type="button" id="twin-next" hidden>Teruskan ke Gerbang Songsang</button><button type="button" id="twin-replay">Main semula Level 1–2</button><button type="button" id="twin-menu">Peta Dunia</button><button type="button" id="twin-main-menu">Menu utama</button></div>';
   document.querySelector('.shell').append(dialog);
   $('twin-resume').addEventListener('click',()=>this.resumeRun(),{signal});
   $('twin-next').addEventListener('click',()=>{if(this.run.completed)track('level_started',{level:'w1-l3',mode:'next'});if(!this.run.completed||!LEVELS.find(l=>l.id==='w1-l3')?.ready)return;dialog.close();this.time.paused=false;this.input.keyboard.enabled=true;this.scene.start('GerbangSongsang');},{signal});
   $('twin-replay').addEventListener('click',()=>{dialog.close();this.scene.restart({fresh:true});},{signal});
   $('twin-menu').addEventListener('click',()=>{dialog.close();this.returnToMenu();},{signal});
   $('twin-main-menu').addEventListener('click',()=>{dialog.close();this.returnToMenu(false);},{signal});
   dialog.addEventListener('cancel',event=>{event.preventDefault();if(this.mode==='paused')this.resumeRun();},{signal});
   window.addEventListener('pagehide',()=>this.writeSave(),{signal});
  }
  message(text){this.feedback=text;$('objective').textContent=text;$('status').textContent=text;$('notice').textContent=text;$('notice').classList.add('show');this.noticeUntil=this.time.now+3500;}
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
    art.setVisible(!this.run.coins.includes(def.id));
    if(art.visible&&Math.abs(this.player.x-def.x)<30&&Math.abs(body.center.y-def.y)<48){this.run.coins.push(def.id);art.setVisible(false);art.anims?.stop();SFX.coin?.(audio);this.writeSave();coinPickup(this,def.x,art.y,{reduced:reducedMotion});}
   }
   CHECKPOINTS.forEach((cp,i)=>{
    // Both parallel routes share the safe lower-bank respawn point.
    const onLanding=Math.abs(body.bottom-cp.feet)<8||(cp.id==='beyond-twins'&&Math.abs(body.bottom-1134)<8);
    if(grounded&&Math.abs(this.player.x-cp.x)<44&&onLanding&&(!cp.requires||this.run.workshop.delivered)&&CHECKPOINTS.findIndex(c=>c.id===this.run.checkpointId)<i){
     this.run.checkpointId=cp.id;this.checkpointArts[i].setFrame(112);this.writeSave();checkpointFx(this,this.checkpointArts[i],{audio,SFX,reduced:reducedMotion});this.message('Checkpoint disimpan. R untuk kembali ke sini.');
    }
   });
   this.nearStation=null; // V3: no more answer stations
   const wsp=workshopPrompt(this,grounded||body.blocked.down||body.touching.down,matchMedia('(pointer: coarse)').matches);
   const secret=this.secretViews.find(({def})=>Math.abs(this.player.x-def.x)<55&&Math.abs(body.bottom-def.feet)<12);
   let prompt='';let action=null;
   if(wsp){action='workshop';prompt=`E · ${wsp.text}`;}
   if(secret){prompt='E · Baca catatan rahsia';if(interact){const fresh=!this.run.secrets.includes(secret.def.id);if(fresh){this.run.secrets.push(secret.def.id);secret.art.setAlpha(.4);this.writeSave();reward(`Rahsia ditemui · ${this.run.secrets.length}/${SECRETS.length}`);}dialogue(this,pagesOf(secret.def.text),{portrait:'none'});}} // V4: a note speaks through the fallback portrait
   else if(interact&&action==='workshop')useWorkshop(this,{audio,SFX});
   const inExitZone=inFinishZone({x:this.player.x,feet:body.bottom,grounded:grounded||body.blocked.down||body.touching.down},GOAL);
   if(inExitZone&&this.run.workshop.delivered){this.finish();return;}
   if(inExitZone&&!this.run.workshop.delivered){
    prompt='Bina jambatan bengkel dahulu';
    if(!this.exitHinted){this.exitHinted=true;this.message(prompt);}
   }else this.exitHinted=false;
   {const g=document.querySelector('[data-action="interact"]');if(g)g.hidden=!(wsp||secret);} // touch: Guna only when it does something
   const wp=$('world-prompt');wp.hidden=!prompt||this.mode!=='playing';
   if(prompt){$('world-prompt-key').textContent='E';$('world-prompt-text').textContent=prompt.slice(4);wp.style.transform='translate(-50%, 0)';wp.style.left='50%';wp.style.top='auto';wp.style.bottom='108px';}
   syncWorkshopUI(this);
   const zone=this.player.x<1080?'Jejak Masuk':this.player.x<1836?'Gudang':this.player.x<2484?'Batu Loncatan':this.player.x<3402?'Laluan Rahsia':'Bengkel Dua Mesin';
   hud(this,{level:'1–2',coins:this.run.coins.length,zone,coll:`Syiling ${this.run.coins.length}/${COINS.length} · Rahsia ${this.run.secrets.length}/${SECRETS.length}`}); // V4 plaque + ribbon
   if(time-(this.lastAutosave||0)>10000){this.lastAutosave=time;this.writeSave();}
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
   $('twin-panel')&&($('twin-panel').hidden=true);$('world-prompt').hidden=true;
   $('twin-dialog-title').textContent='Jambatan Berkembar · Jeda';
   const notes=SECRETS.filter(s=>this.run.secrets.includes(s.id)).map(s=>s.text).join('\n\n');
   $('twin-dialog-copy').textContent=`${this.run.coins.length}/${COINS.length} syiling · ${this.run.secrets.length}/2 rahsia. Checkpoint disimpan.\n\n${notes}`;
   $('twin-resume').hidden=false;$('twin-next').hidden=true;$('twin-replay').hidden=true;$('twin-dialog').showModal();$('twin-resume').focus();
  }
  resumeRun(){if(this.mode!=='paused')return;$('twin-dialog').close();clearControls();this.mode='playing';this.physics.resume();this.tweens.resumeAll();this.time.paused=false;this.input.keyboard.enabled=true;$('game').focus({preventScroll:true});}
  finish(){
   if(!this.run.workshop.delivered)return;
   const prevBest=this.store.load().levels['w1-l2'].bestMs;
   this.run.checkpointId='exit';this.run.completed=true;this.writeSave();this.mode='complete';clearControls();this.physics.pause();
   track('level_completed',{level:'w1-l2',duration_s:durationBucket(this.elapsed),coins:this.run.coins.length,secrets:this.run.secrets.length,ranked_eligible:false,first_completion:this.store.load().levels['w1-l2'].completions===1});
   $('world-prompt').hidden=true;
   const best=this.store.load().levels['w1-l2'].bestMs,nextReady=!!LEVELS.find(l=>l.id==='w1-l3')?.ready;
   const missing=SECRETS.length-this.run.secrets.length,coinsLeft=COINS.length-this.run.coins.length;
   SFX.victory?.(audio);
   showLevelVictory({level:'1-2',quote:'Susunan fungsi boleh mengubah hasil: gf(5) = 8, fg(5) = 6.',
    coins:[this.run.coins.length,COINS.length],secrets:[this.run.secrets.length,SECRETS.length],timeMs:this.elapsed,
    newBest:Number.isFinite(best)&&(!Number.isFinite(prevBest)||best<prevBest),
    hint:missing?`Masih ada ${missing} rahsia tersembunyi di jambatan ini…`:coinsLeft?`Semua rahsia ditemukan! ${coinsLeft} syiling masih menunggu.`:'Semua syiling dan rahsia ditemukan. Jejak yang sempurna!',
    next:nextReady?{title:'Level 1-3: Gerbang Songsang',quote:'Pintu air lama tersekat. Cari semula tetapan asal injapnya.',label:'Teruskan ke Level 1–3'}:null,
    on:{next:()=>{track('level_started',{level:'w1-l3',mode:'next'});this.time.paused=false;this.input.keyboard.enabled=true;this.scene.start('GerbangSongsang');},
     replay:()=>this.scene.restart({fresh:true}),map:()=>this.returnToMenu(true),menu:()=>this.returnToMenu(false)}});
  }
  // toMap: open the World Map on return (default); false: main menu.
  returnToMenu(toMap=true){this.writeSave();this.time.paused=false;this.tweens.resumeAll();this.input.keyboard.enabled=true;if(toMap)this.game.registry.set('showLevelSelect',true);this.scene.start('Lorong');}
 };
}
