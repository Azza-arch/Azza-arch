import {TERMINALS,GATES,CHECKPOINTS,COLLECTIBLES,SECRETS,BASELINE_QUESTIONS,BUILD_STAGE} from './level.js';
import {SaveManager} from './save.js';
import {f,g,h,compose,inverse} from './math.js';

export function createMechanismMethods({$,clearControls,audio,SFX,reducedMotion,touchDevice}) {
 const frames=ms=>reducedMotion?0:ms;
 return {
  nearestTerminal() {
   return TERMINALS.filter(t=>!(t.gate&&this.solvedGates.has(t.gate))&&!(t.kind==='inverse'&&this.inverseSolved))
    .filter(t=>Math.abs(this.player.x-t.x)<72&&Math.abs(this.player.body.bottom-t.feet)<40)
    .sort((a,b)=>Math.abs(a.x-this.player.x)-Math.abs(b.x-this.player.x))[0];
  },
  openPuzzle() {
   if(this.mode!=='playing')return;
   const t=this.nearestTerminal();if(!t)return;
   this.activeTerminal=t;this.dialBusy=false;this.dialHintLevel=0;this.dialValue=t.kind==='block'?2:t.kind==='gear'?3:0;
   this.pipeReverse=true;this.finalLatches??={input:false,composition:false};
   this.mode='mechanism';clearControls();this.physics.world.pause();this.input.keyboard.enabled=false;this.prompt.setVisible(false);
   $('mechanism').hidden=false;$('touch-controls').hidden=true;
   const titles={gear:'Putar kincir',block:'Masukkan blok nombor',probe:'Cuba satu input',mapping:'Pemetaan café',primer:'Dua fungsi berturutan',pipe:'Alirkan air mengikut fungsi',inverse:'Songsangkan pemetaan',final:'Buka jambatan sungai'};
   $('mechanism-title').textContent=titles[t.kind];
   $('mechanism-feedback').textContent='Pilih, cuba dan perhatikan perubahan. H untuk hint; Esc untuk kembali.';
   $('dial-preview').hidden=!t.gate;$('dial-test').disabled=false;
   this.renderDial();$('dial-test').focus();
  },
  renderDial() {
   const t=this.activeTerminal;if(!t)return;const k=t.kind;
   const finalPipe=k==='final'&&this.finalLatches.input;
   const pipe=['pipe','primer'].includes(k)||finalPipe;
   $('token-options').hidden=k!=='block';$('pipe-options').hidden=!pipe;
   $('dial-less').hidden=pipe||k==='block';$('dial-more').hidden=pipe||k==='block';
   const max=k==='gear'?12:k==='final'?7:3;
   $('dial-less').disabled=this.dialBusy||this.dialValue===0;$('dial-more').disabled=this.dialBusy||this.dialValue>=max;
   for(const btn of document.querySelectorAll('[data-token]')){btn.setAttribute('aria-pressed',String(Number(btn.dataset.token)===this.dialValue));btn.disabled=this.dialBusy;}
   for(const btn of document.querySelectorAll('[data-order]')){btn.setAttribute('aria-pressed',String((btn.dataset.order==='gf')===this.pipeReverse));btn.disabled=this.dialBusy;}
   let rule='',value='',action='Hantar input';
   if(k==='gear') {rule='f(x) = 2x + 1 · x = 3. Pilih output f(3).';value=`Output dipilih: ${this.dialValue}`;action='Tarik tuil';
    this.tweens.killTweensOf(this.gearWheel);this.tweens.add({targets:this.gearWheel,angle:this.dialValue*15,duration:frames(180)});
    this.gearReadout.setText(`Output ${this.dialValue} → ${this.dialValue*15}°`);
   } else if(k==='block') {rule='f(x) = 3x − 2. Pilih blok input supaya outputnya 10.';value=`Blok ${this.dialValue} dipilih`;action='Masukkan blok';
    for(const r of this.tokenRacks){r.box.setAlpha(r.n===this.dialValue?1:.45);r.digit.setAlpha(r.n===this.dialValue?1:.45);}
   } else if(pipe) {const x=k==='pipe'?3:2;rule=`f(x)=2x+1 · g(x)=3x−2 · input ${x}`;value=this.pipeReverse?'x → g → f  =  f(g(x))':'x → f → g  =  g(f(x))';action='Alirkan air';
    if(k!=='primer')rule+=` · sasaran ${k==='pipe'?19:13}`;
   } else if(k==='inverse') {rule='f: {0,1,2,3} → {1,3,5,7}, f(x)=2x+1. Cari f⁻¹(7).';value=`Input asal: ${this.dialValue}`;action='Semak songsangan';
   } else if(k==='final') {rule='h(x)=4x−3. Diberi h(x)=17, cari input x.';value=`Input x: ${this.dialValue}`;action='Aktifkan selak pertama';
   } else {rule='f(x)=2x+1 · D={0,1,2,3} · Kodomain={1,2,3,4,5,6,7,8}';value=`Input x: ${this.dialValue}`;}
   $('mechanism-rule').textContent=rule;$('mechanism-value').textContent=value;$('dial-test').textContent=action;
  },
  changeDial(delta) {
   if(this.mode!=='mechanism'||this.dialBusy)return;
   const k=this.activeTerminal.kind;
   if(['pipe','primer'].includes(k)||(k==='final'&&this.finalLatches.input)){this.pipeReverse=!this.pipeReverse;}
   else this.dialValue=Phaser.Math.Clamp(this.dialValue+delta,k==='block'?2:0,k==='gear'?12:k==='block'?4:k==='final'?7:3);
   this.renderDial();
  },
  chooseToken(n) {if(this.mode==='mechanism'&&!this.dialBusy){this.dialValue=n;this.renderDial();}},
  chooseOrder(reverse) {if(this.mode==='mechanism'&&!this.dialBusy){this.pipeReverse=reverse;this.renderDial();}},
  dialHint() {
   if(this.mode!=='mechanism'||this.dialBusy)return;
   const k=this.activeTerminal.kind;
   if(['probe','mapping'].includes(k)) {
    const hints=['Pilih setiap input dalam domain {0,1,2,3}. Gantikan x dalam 2x+1.','Outputnya ialah 1,3,5,7. Julat ialah output sebenar; kodomain juga boleh mengandungi nilai yang tidak dicapai.'];
    $('mechanism-feedback').textContent=hints[Math.min(this.dialHintLevel++,hints.length-1)];return;
   }
   const hints=k==='gear'?BASELINE_QUESTIONS[0].hints:k==='block'?BASELINE_QUESTIONS[1].hints:k==='final'&&!this.finalLatches.input?BASELINE_QUESTIONS[2].hints:k==='inverse'?['Fungsi songsang membatalkan pemetaan asal; ia bukan 1/f.','f⁻¹(y)=(y−1)/2 untuk y dalam julat.','f⁻¹(7)=(7−1)/2=3; semak f(3)=7.']:['Fungsi di sebelah dalam dilakukan dahulu: g(f(x)) bermaksud f kemudian g.','Untuk input 2: f(2)=5, kemudian g(5)=13. Untuk input 3: f(3)=7, kemudian g(7)=19.'];
   $('mechanism-feedback').textContent=hints[Math.min(this.dialHintLevel++,hints.length-1)];
  },
  previewRoute() {
   if(this.mode!=='mechanism'||this.dialBusy)return;
   const gate=GATES.find(g=>g.id===this.activeTerminal.gate);if(!gate)return;
   $('mechanism-feedback').textContent='Jambatan menyambungkan tebing ini dengan pelantar selamat di seberang. Selesaikan mekanisme untuk membuka laluan.';
   if(reducedMotion)return;
   this.previewTimer?.remove();this.cameras.main.stopFollow();this.cameras.main.centerOn(gate.x+gate.width,gate.y-110);
   this.previewTimer=this.time.delayedCall(1400,()=>this.followPlayer());
  },
  followPlayer() {this.cameras.main.startFollow(this.player,true,reducedMotion?1:.14,reducedMotion?1:.16,-85,10);},
  closePuzzle() {
   if(this.dialBusy||this.mode==='mechanism-transition')return;
   this.previewTimer?.remove();this.followPlayer();$('mechanism').hidden=true;$('puzzle').close();
   this.activeTerminal=null;this.mode='playing';this.input.keyboard.enabled=true;clearControls();this.physics.world.resume();$('touch-controls').hidden=!touchDevice;$('game').focus({preventScroll:true});
  },
  // A successful task owns the whole transaction; no controls during moving geometry.
  success(feedback,animate,commit=()=>{}) {
   this.dialBusy=true;this.renderDial();$('dial-test').disabled=true;$('dial-close').disabled=true;
   $('mechanism-feedback').textContent=feedback;SFX.correct(audio);commit();this.writeSave();
   this.time.delayedCall(reducedMotion?250:650,()=>{
    this.previewTimer?.remove();$('mechanism').hidden=true;this.mode='mechanism-transition';
    const done=()=>{this.followPlayer();this.time.delayedCall(frames(250),()=>{
      this.dialBusy=false;$('dial-close').disabled=false;this.mode='mechanism';this.closePuzzle();
      $('objective').textContent=feedback;this.writeSave();
    });};
    animate(done);
   });
  },
  deployGate(id,done) {
   const gate=GATES.find(g=>g.id===id);if(!gate){done();return;}
   if(this.gateBodies[id]){done();return;}
   const planks=this.gateArt(gate);planks.forEach(a=>a.setAlpha(0));
   const park=()=>{planks.forEach(a=>a.setAlpha(1));this.gateBodies[id]=this.platform(gate);SFX.bridge(audio);done();};
   if(reducedMotion)park();else this.tweens.add({targets:planks,alpha:1,duration:220,delay:this.tweens.stagger(80),onComplete:park});
  },
  moveToken(n,correct,done) {
   const rack=this.tokenRacks.find(r=>r.n===n);rack.box.setVisible(false);rack.digit.setVisible(false);this.token.setPosition(rack.x,948).setVisible(true);this.token.list[1].setFrame(160+n);
   const inserted=()=>{this.readouts.block.setText(`${n} → 3(${n})−2 → ${g(n)}`);
    if(correct){done();return;}
    const returned=()=>{this.token.setVisible(false);rack.box.setVisible(true);rack.digit.setVisible(true);done();};
    if(reducedMotion)returned();else this.tweens.add({targets:this.token,x:rack.x,y:948,duration:350,delay:180,onComplete:returned});
   };
   if(reducedMotion){this.token.setPosition(3267,930);inserted();}else this.tweens.add({targets:this.token,x:3267,y:930,duration:450,onComplete:inserted});
  },
  flow(id,input,reverse,done) {
   const t=TERMINALS.find(t=>t.id===id),r=compose(input,reverse),key=id==='p3'?'final':id;
   this.readouts[key]?.setText(`${r.input} → ${r.middle} → ${r.output} (${r.order})`);
   this.waterFills[key]?.setAlpha(.95);
     this.pipeStageLabels[key]?.forEach((label,i)=>label.setText((reverse?['g','f']:['f','g'])[i]));
   const number=this.add.text(t.x-100,t.feet-160,String(input),{fontSize:'24px',fontStyle:'bold',color:'#ffffff',backgroundColor:'#12667a',padding:{x:5,y:3}}).setDepth(18);
   if(reducedMotion){number.destroy();done();return;}
   this.tweens.add({targets:number,x:t.x,duration:350,onComplete:()=>{
    number.setText(String(r.middle));this.tweens.add({targets:number,x:t.x+108,duration:350,onComplete:()=>{number.setText(String(r.output));this.time.delayedCall(250,()=>{number.destroy();done();});}});
   }});
  },
  testDial() {
   if(this.mode!=='mechanism'||this.dialBusy)return;
   const t=this.activeTerminal,k=t.kind,n=this.dialValue;
   const wrong=text=>{$('mechanism-feedback').textContent=text;SFX.incorrect(audio);this.attempts[t.id]=(this.attempts[t.id]||0)+1;};
   if(['probe','mapping'].includes(k)) {
    const value=f(n);this.probeReadout.setText(`${n} → 2(${n})+1 → ${value}`);
    if(k==='mapping'){this.cafeReadout.setText(`${n} → ${value}`);this.mappingInputs??=new Set();this.mappingInputs.add(n);this.mappingDone=this.mappingInputs.size===4;}
    $('mechanism-feedback').textContent=`${n} → ${value}. Julat={1,3,5,7}; setiap input mempunyai tepat satu output.`;this.writeSave();
    if(k==='mapping'&&this.mappingDone)this.success('Semua pasangan café diterokai. Julat={1,3,5,7}.',done=>done());return;
   }
   if(k==='gear') {
    if(!BASELINE_QUESTIONS[0].check(n).correct){wrong(`Output ${n} menghasilkan sudut ${n*15}°. f(3)=2(3)+1=${f(3)}; cuba nilai output itu.`);return;}
    this.success('f(3)=7. Kincir membuka jambatan.',done=>{this.machines.p1.setFrame(66);this.gearWheel.angle=105;this.gateLabel.setText('Jambatan terbuka');this.deployGate('gear',done);},()=>this.solvedGates.add('gear'));return;
   }
   if(k==='block') {
    if(!BASELINE_QUESTIONS[1].check(n).correct){wrong(`${n} → 3(${n})−2 = ${g(n)}, bukan 10. Blok kembali ke rak.`);this.dialBusy=true;this.moveToken(n,false,()=>{this.dialBusy=false;this.renderDial();});return;}
    this.success('3(4)−2=10. Mesin membuka laluan bengkel.',done=>this.moveToken(n,true,()=>this.deployGate('block',done)),()=>this.solvedGates.add('block'));return;
   }
   if(k==='primer'||k==='pipe'||(k==='final'&&this.finalLatches.input)) {
    const input=k==='pipe'?3:2,r=compose(input,this.pipeReverse),correct=k==='primer'||r.output===(k==='pipe'?19:13);
    if(!correct){wrong(`${r.order}: ${r.input} → ${r.middle} → ${r.output}. Susunan ini tidak mencapai sasaran.`);this.dialBusy=true;this.flow(t.id,input,this.pipeReverse,()=>{this.waterFills[k]?.setAlpha(.18);this.dialBusy=false;this.renderDial();});return;}
    this.success(`${r.order}: ${r.input} → ${r.middle} → ${r.output}.`,done=>this.flow(t.id,input,this.pipeReverse,()=>k==='primer'?done():this.deployGate(k==='pipe'?'pipe':'final',done)),()=>{
     if(k==='pipe')this.solvedGates.add('pipe');if(k==='final'){this.finalLatches.composition=true;this.solvedGates.add('final');this.latchArts[1]?.setFrame(108);}if(k==='primer')this.primerSeen=true;
    });return;
   }
   if(k==='inverse') {
    if(n!==inverse(7)){wrong(`Semakan hadapan: f(${n})=${f(n)}, bukan 7. Cuba input asal yang lain.`);return;}
    this.success('f⁻¹(7)=(7−1)/2=3; f(3)=7.',done=>{this.readouts.inverse.setText('7 → f⁻¹ → 3');this.discoverSecret('secret-cave-treasure');done();},()=>{this.inverseSolved=true;});return;
   }
   if(k==='final') {
    if(!BASELINE_QUESTIONS[2].check(n).correct){wrong(`h(${n})=4(${n})−3=${h(n)}, bukan 17. Cuba lagi.`);return;}
    this.success('h(5)=17. Selak pertama aktif; sambung aliran f kemudian g.',done=>{this.latchArts[0]?.setFrame(108);this.readouts.final.setText('Selak 1 ✓ · aliran 2 → f → g');done();},()=>{this.finalLatches.input=true;});
   }
  },
  writeSave() {
   const prior=SaveManager.load();
   SaveManager.save({checkpointId:CHECKPOINTS[this.checkpointIndex]?.id??null,solvedGateIds:[...this.solvedGates],collectedCoinIds:[...this.collectedCoinIds],discoveredSecretIds:[...this.discoveredSecrets],mappingInputs:[...(this.mappingInputs||[])],inverseSolved:!!this.inverseSolved,primerSeen:!!this.primerSeen,finalLatches:this.finalLatches??prior?.finalLatches??{input:false,composition:false},legacyProgress:this.legacyProgress??prior?.legacyProgress??null,completed:!!this.levelCompleted,elapsedMs:this.elapsed,updatedAt:Date.now()});
  },
  continueFromSave() {
   const save=this.pendingSave||SaveManager.load();if(!save){this.startRun();return;}
   this.checkpointIndex=CHECKPOINTS.findIndex(c=>c.id===save.checkpointId);this.elapsed=save.elapsedMs;
   if(this.checkpointIndex>=0)this.checkpointArts[this.checkpointIndex].setFrame(112);
   this.mappingInputs=new Set(save.mappingInputs);this.mappingDone=save.mappingDone;this.inverseSolved=save.inverseSolved;this.primerSeen=save.primerSeen;this.legacyProgress=save.legacyProgress;this.finalLatches=save.finalLatches;
   if(this.mappingDone)this.cafeReadout.setText('Julat: 1, 3, 5, 7');
   for(const id of save.solvedGateIds){const gate=GATES.find(g=>g.id===id);if(!gate)continue;this.solvedGates.add(id);this.gateArt(gate);this.gateBodies[id]=this.platform(gate);}
   if(this.solvedGates.has('gear')){this.machines.p1.setFrame(66);this.gearWheel.angle=105;this.gearReadout.setText('f(3)=7');this.gateLabel.setText('Jambatan terbuka');}
   if(this.solvedGates.has('block')){this.token.setPosition(3267,930).setVisible(true);this.token.list[1].setFrame(164);this.readouts.block.setText('4 → 10');const rack=this.tokenRacks.find(r=>r.n===4);rack.box.setVisible(false);rack.digit.setVisible(false);}
   if(this.solvedGates.has('pipe')){this.waterFills.pipe?.setAlpha(.95);this.readouts.pipe?.setText('3 → 7 → 19');}
   if(this.inverseSolved)this.readouts.inverse?.setText('7 → f⁻¹ → 3');
   this.latchArts.forEach((a,i)=>a.setFrame((i===0?this.finalLatches.input:this.finalLatches.composition)?108:107));
   for(const id of save.collectedCoinIds){const coin=this.collectibles.find(c=>c.active&&c.getData('id')===id);if(coin){coin.destroy();this.coinsFound++;this.collectedCoinIds.add(id);}}
   this.levelCompleted=save.completed;$('coin-count').textContent=`Koleksi: ${this.coinsFound}`;this.respawn();this.startRun();
   if(this.checkpointIndex>=0)$('checkpoint-state').textContent='Checkpoint dipulihkan';
   $('objective').textContent=this.solvedGates.has('final')?'Jambatan sungai terbuka. Teruskan ke rumah.':this.solvedGates.has('pipe')?'Turuni bukit dan pulihkan jambatan sungai.':this.solvedGates.has('block')?'Susun fungsi untuk mengalirkan air.':this.solvedGates.has('gear')?'Teruskan ke bengkel fungsi.':'Terokai taman dan hidupkan kincir fungsi.';
  },
  finish() {
   if(BUILD_STAGE<5||GATES.some(g=>!this.solvedGates.has(g.id)))return;
   this.mode='complete';this.physics.world.pause();clearControls();this.levelCompleted=true;this.writeSave();
   $('completion-time').textContent=`Masa pengembaraan: ${Math.round(this.elapsed/1000)} saat.`;
   $('completion-coins').textContent=`Koleksi: ${this.coinsFound}/${COLLECTIBLES.length}`;
   $('completion-puzzles').textContent='Kincir, bengkel, aliran air dan jambatan sungai dipulihkan.';
   $('completion-secrets').textContent=`Rahsia: ${this.discoveredSecrets.size}/${SECRETS.length}`;
   $('touch-controls').hidden=true;$('complete').showModal();
  }
 };
}
