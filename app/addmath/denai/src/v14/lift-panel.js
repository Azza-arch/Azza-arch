// Function-machine panel for the Level 1 'lift' gate.
// The active MISSION VARIANT (missions.js, chosen once per run by the run
// seed) supplies the rule, the reasoning type and all text. Every variant's
// correct answer outputs exactly 7 planks, matching the 7-plank bridge.
// Interaction order:
//   choose input → Semak → result shown IN the machine read-out → feedback
//   (+ optional worked solution) → player presses "Buka jambatan" → panel
//   closes → lever + bridge animation → collision enabled → control returns.
// A wrong answer never closes the panel; the world planks preview the
// wrong stop behind it so the machine's effect stays visible.
import {BRIDGE_PLANKS as TARGET,outputFor,answerOf,wrongFeedback,evalRule} from './missions.js';
import {recordSolved} from './progress.js';
export function createLiftPanelMethods({$,clearControls,audio,SFX,reducedMotion,announce,GATES,CHECKPOINTS,B_STOPS,showCheckpointToast}){
 const setMachineState=state=>{const m=$('mx-machine');m.classList.toggle('is-right',state==='right');m.classList.toggle('is-wrong',state==='wrong');
  const fb=$('mechanism-feedback');fb.classList.toggle('is-right',state==='right');fb.classList.toggle('is-wrong',state==='wrong');};
 return {
  // Keep the machine's effect in view: pan so the lever + bridge sit in the
  // part of the screen the panel does not cover (left of a side panel, or
  // above a phone bottom sheet). Camera only; nothing in the world moves.
  focusMachineCamera(){
   const cam=this.cameras.main,g=GATES[0],box=document.getElementById('mechanism').getBoundingClientRect(),cv=this.game.canvas.getBoundingClientRect(),k=cam.zoom;
   const sheet=box.width>cv.width*.8;
   const free=sheet?{x0:0,x1:cv.width,y0:0,y1:box.top-cv.top}:{x0:0,x1:box.left-cv.left,y0:0,y1:cv.height};
   const tx=g.x+g.width/2-70,ty=g.y+40; // low enough that the water under the gap stays in frame
   const cx=tx+(cv.width/2-(free.x0+free.x1)/2)/k,cy=ty+(cv.height/2-(free.y0+free.y1)/2)/k;
   cam.stopFollow();cam.pan(cx,cy,reducedMotion?0:320,'Sine.easeInOut',true);
  },
  releaseMachineCamera(){
   const cam=this.cameras.main;cam.startFollow(this.player,true,reducedMotion?1:.14,reducedMotion?1:.16,-85,this.followOffsetY??100);
  },
  openLiftQuickPanel(){
   if(this.mode!=='playing'||this.solvedGates.has('lift'))return;
   const v=this.mission,t=this.missionText;
   this.activePuzzle={id:'lift',kind:'lift'};this.liftTries=0;this.liftReady=false;
   this.mode='mechanism';this.physics.world.pause();clearControls();this.input.keyboard.enabled=false;
   const box=$('mechanism');box.hidden=false;box.classList.add('is-machine');
   if(!reducedMotion)this.tweens.add({targets:this.lever,angle:-14,duration:110,yoyo:true,ease:'Sine.out'}); // the lever answers the player
   $('mechanism-title').textContent='Mesin Fungsi';
   $('mx-type').textContent=t.typeLabel;
   $('mechanism-rule').textContent=t.rule;
   $('mx-machine').hidden=false;$('mx-rule').textContent=t.core;$('mx-target').textContent=String(TARGET);
   $('mx-in').textContent=t.fixedInput!==undefined?String(t.fixedInput):'?';$('mx-out').textContent='?';setMachineState(null);
   // Pattern missions show the machine's recorded input → output pairs.
   const clues=$('mx-clues');clues.replaceChildren();clues.hidden=!t.clues;
   for(const [x,y] of t.clues||[]){const li=document.createElement('li');li.textContent=`${x} → ${y}`;clues.append(li);}
   $('mx-question').hidden=false;$('mx-question').textContent=t.question;
   $('mechanism-value').textContent='';
   $('mechanism-feedback').textContent=v.type==='find-rule'?'Pilih satu mesin, kemudian tekan Semak.':'Pilih satu input, kemudian tekan Semak.';
   this.selectedInput=null;
   const opts=$('token-options');opts.hidden=false;$('pipe-options').hidden=true;opts.classList.toggle('rule-choices',v.type==='find-rule');
   document.querySelectorAll('[data-token]').forEach(btn=>{const n=Number(btn.dataset.token);btn.disabled=false;btn.setAttribute('aria-pressed','false');
    if(v.type==='find-rule'){btn.hidden=n>=t.optionLabels.length;if(!btn.hidden){btn.textContent=t.optionLabels[n];btn.setAttribute('aria-label',`Mesin ${n+1}: f(x) = ${t.optionLabels[n]}`);}}
    else{btn.hidden=n>4;btn.textContent=String(n);btn.setAttribute('aria-label',`Input ${n}`);}});
   $('dial-test').hidden=false;$('dial-test').textContent='Semak';$('dial-test').disabled=true;
   for(const id of ['dial-less','dial-more','dial-preview','dial-hint','dial-solution','worked-solution','puzzle-go'])$(id).hidden=true;
   $('dial-hint').textContent='Petunjuk';$('dial-solution').textContent='Lihat langkah kerja';
   $('dial-close').hidden=false;$('dial-close').textContent='Tutup';
   requestAnimationFrame(()=>{document.querySelector('[data-token="0"]')?.focus({preventScroll:true});this.focusMachineCamera();});
  },
  liftChoose(value){
   const v=this.mission;const valid=v.type==='find-rule'?value>=0&&value<v.options.length:value>=0&&value<=4;
   if(this.mode!=='mechanism'||this.liftReady||!valid)return;
   this.selectedInput=this.bInput=value;
   document.querySelectorAll('[data-token]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.token)===value)));
   if(v.type==='find-rule'){$('mx-rule').textContent=this.missionText.optionLabels[value];}else $('mx-in').textContent=String(value);
   $('mx-out').textContent='?';setMachineState(null);
   $('mechanism-feedback').textContent=v.type==='find-rule'?`Mesin f(x) = ${this.missionText.optionLabels[value]} dipilih. Tekan Semak.`:`Input ${value} dipilih. Tekan Semak untuk menjalankan mesin.`;
   $('dial-test').disabled=false;
   $('dial-test').focus({preventScroll:true}); // Enter now checks the choice
  },
  liftCheck(){
   const v=this.mission,c=this.selectedInput;if(this.mode!=='mechanism'||this.liftReady||!Number.isInteger(c))return;
   const out=outputFor(v,c);if(out===null)return;
   this.liftTries++;this.bLastTrial=null;
   $('mx-out').textContent=String(out);
   if(out!==TARGET){
    if(this.run)this.run.attempts.lift.wrong++;this.writeSave();
    setMachineState('wrong');SFX.incorrect(audio);
    $('mechanism-feedback').textContent=wrongFeedback(v,c);
    if(this.liftTries>=2)$('dial-hint').hidden=false;
    this.previewPlanks(out);
    announce(`Output ${out}. Bukan ${TARGET}. Cuba lagi.`);
    return;
   }
   if(this.run)this.run.attempts.lift.correct++;recordSolved(v);this.writeSave();
   setMachineState('right');SFX.correct(audio);this.liftReady=true;
   if(v.type==='pattern')$('mx-rule').textContent=this.missionText.solvedScreen.replace('f(x) = ','').replace('  ✓','');
   $('mechanism-feedback').textContent=`Tepat! ${this.missionText.summary} → 7 papan. Mesin sudah sedia.`;
   document.querySelectorAll('[data-token]').forEach(b=>b.disabled=true);
   $('dial-test').disabled=true;$('dial-hint').hidden=true;$('dial-solution').hidden=false;
   $('dial-close').hidden=true;$('puzzle-go').hidden=false;
   announce('Tepat. Tekan Buka jambatan.');
   requestAnimationFrame(()=>$('puzzle-go').focus({preventScroll:true}));
  },
  // Wrong answer, shown in the world: the machine pushes out the variant's
  // actual output in planks. Zero/negative → nothing comes out (it jams);
  // too few stop short; more than 7 are capped at the 7 sprites and jam.
  // Then they retract. Visual only: no collision is ever created here.
  previewPlanks(out){
   const g=GATES[0],n=g.planks,pw=g.width/n,show=Math.max(0,Math.min(out,n));
   this.tweens.killTweensOf(this.liftPlanks);
   this.liftPlanks.forEach((a,i)=>{a.setVisible(false).setAlpha(.6);a.x=g.x+i*pw;});
   if(show===0){if(!reducedMotion)this.tweens.add({targets:this.lever,angle:-8,duration:60,yoyo:true,repeat:3});return;}
   this.liftPlanks.slice(0,show).forEach((a,i)=>{a.setVisible(true);a.x=g.x;
    this.tweens.add({targets:a,x:g.x+i*pw,duration:reducedMotion?0:120,delay:reducedMotion?0:i*55,ease:'Sine.out'});});
   const after=(reducedMotion?0:show*55+160);
   if(out>n&&!reducedMotion)this.time.delayedCall(after,()=>this.tweens.add({targets:this.liftPlanks,x:'+=4',duration:50,yoyo:true,repeat:3}));
   this.time.delayedCall(after+(reducedMotion?900:850),()=>{if(this.solvedGates.has('lift')||this.liftReady)return;
    this.liftPlanks.forEach((a,i)=>this.tweens.add({targets:a,x:g.x,alpha:0,duration:reducedMotion?0:160,delay:reducedMotion?0:(show-1-i)*30,onComplete:()=>a.setVisible(false).setAlpha(.6)}));});
  },
  liftHint(){$('mechanism-feedback').textContent=`Petunjuk: ${this.missionText.hint}`;},
  liftWorked(){const box=$('worked-solution');box.hidden=!box.hidden;
   box.textContent=this.missionText.worked;
   $('dial-solution').setAttribute('aria-expanded',String(!box.hidden));},
  liftOpenBridge(){
   if(!this.liftReady)return;this.liftReady=false;
   const box=$('mechanism');box.hidden=true;box.classList.remove('is-machine');$('worked-solution').hidden=true;
   this.activePuzzle=null;this.mode='mechanism-transition';this.input.keyboard.enabled=false;this.physics.world.pause();
   this.liftExperimentBusy=true;
   const g=GATES[0];
   const n=g.planks,pw=g.width/n;
   this.tweens.killTweensOf(this.liftPlanks);
   this.liftPlanks.forEach(a=>{a.setVisible(false).setAlpha(1);a.x=g.x;a.y=g.y;});
   this.machineScreen?.setText(this.missionText.solvedScreen);this.machineSub?.setText('7 papan');
   // Lever throw (~0.25s), then the 7 planks extend one after another from
   // the station bank (~0.6s). Collision is created only after the last
   // plank lands, so the walkway is never solid before it is visibly there.
   this.tweens.add({targets:this.lever,angle:-24,duration:reducedMotion?0:120,yoyo:true,onComplete:()=>{
    this.lever.setFrame(66);this.lever.angle=0;
    if(!reducedMotion)SFX.bridge(audio);
    let done=0;const finish=()=>{
     this.liftPlanks.forEach((a,i)=>{a.x=g.x+i*pw;a.y=g.y;});
     this.bridgeRails?.forEach(r=>r.setVisible(true));
     for(let i=0;i<4;i++)this.dustBurst?.(g.x+30+i*(g.width-60)/3,g.y+4,3); // planks land
     this.gateBodies.lift=this.platform({id:'lift-open',x:g.x,y:g.y,width:g.width});
     this.solvedGates.add('lift');this.liftState?.setText('Lintasan selamat');
     const index=CHECKPOINTS.findIndex(c=>c.id==='cp-gate');if(index>=0){this.checkpointIndex=index;this.checkpointArts[index]?.setFrame(112);}
     this.writeSave();clearControls();this.mode='playing';this.input.keyboard.enabled=true;this.physics.world.resume();this.liftExperimentBusy=false;
     $('game').inert=false;$('game').focus({preventScroll:true});this.releaseMachineCamera();
     showCheckpointToast('Jambatan terbuka · checkpoint disimpan');
     this.pulseRing?.(g.x+g.width/2,g.y-20,0xffd16b);
     announce('Jambatan terbuka. Checkpoint disimpan. Teruskan ke kanan.');
    };
    this.liftPlanks.forEach((a,i)=>{a.setVisible(true);
     this.tweens.add({targets:a,x:g.x+i*pw,duration:reducedMotion?0:110,delay:reducedMotion?0:i*70,ease:'Sine.out',onComplete:()=>{if(++done===n)finish();}});});
   }});
  },
 };
}
