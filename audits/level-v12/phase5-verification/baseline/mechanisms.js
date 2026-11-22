import { GATES, TERMINALS, PUZZLES, CHECKPOINTS, COLLECTIBLES, SECRETS, SPAWN, GOAL } from './level.js';
import { SaveManager } from './save.js';
import {DialogueQueue,LINES} from './dialogue.js';
import { evaluateWaterOrder, recoverWaterworksState, transitionWaterworks, WATERWORKS_STATE as WS } from './waterworks.js';

export function createMechanismMethods({ $, clearControls, audio, SFX, reducedMotion, announce }) {
  return {
    nearestTerminal() {
      return TERMINALS.filter(t => !((t.kind==='lift'&&this.solvedGates.has('lift'))||(t.kind==='number'&&this.solvedGates.has('number-span'))||(t.kind==='number-input'&&this.solvedGates.has('number-span'))||(t.kind==='water-activate'&&this.solvedGates.has('water-crossing'))||(t.kind==='water-stage'&&this.solvedGates.has('water-crossing'))||(t.kind==='inverse-f'&&this.discoveredSecrets.has('f-inverse'))||(t.kind==='river-final'&&this.solvedGates.has('river-crossing'))) && Math.abs(this.player.x - t.x) < 78 && Math.abs(this.player.body.bottom - t.feet) < 72).sort((a,b)=>Math.abs(this.player.x-a.x)-Math.abs(this.player.x-b.x))[0]||null;
    },
    runLiftExperiment(input) {
      if(!['playing','mechanism'].includes(this.mode)||this.solvedGates.has('lift')||this.liftExperimentBusy)return;
      const output=2*input+1;
      if(this.mode==='mechanism')this.dismissForAnimation();
      this.liftExperimentBusy=true;
      this.lever.setAngle(0);
      this.bReadoutShown=true;
      this.liftReadout.setText(`f(${input}) = ${output} · kod hentian ${output}`);
      this.liftState.setText(output===7?'Hentian lintasan · sasaran':'Hentian uji · lintasan terkunci');
      announce(`f(${input}) = ${output}. Hentian mesin ${output}${output===7?' · laluan sedang dibuka.':' · lintasan belum selamat, pilih input lain.'}`);
      if(output!==7){
        this.say('failed:lift');
        const positions={1:1272,3:1230,5:1188,9:1146},targetY=positions[output]??1272;
        this.liftPlanks.forEach(a=>a.setVisible(true));
        this.mode='mechanism-transition';this.input.keyboard.enabled=false;this.physics.world.pause();
        const finish=()=>{this.liftPlanks.forEach(a=>a.y=targetY);clearControls();this.mode='playing';this.input.keyboard.enabled=true;this.physics.world.resume();this.liftExperimentBusy=false;this.lever.setAngle(0);};
        this.tweens.add({targets:this.liftPlanks,y:targetY,duration:reducedMotion?0:420,ease:'Sine.inOut',onComplete:finish});
        return;
      }
      this.mode='mechanism-transition';this.input.keyboard.enabled=false;this.physics.world.pause();this.liftPlanks.forEach(a=>a.setVisible(true));
      this.tweens.add({targets:this.lever,angle:-28,delay:reducedMotion?0:220,duration:reducedMotion?0:280,yoyo:true,hold:160,onComplete:()=>{
        if(!reducedMotion)SFX.bridge(audio);
        this.tweens.add({targets:this.liftPlanks,y:GATES[0].y,duration:reducedMotion?0:640,ease:'Sine.inOut',onComplete:()=>{
          this.liftPlanks.forEach(a=>a.y=GATES[0].y);
          this.gateBodies.lift=this.platform({id:'lift-open',x:GATES[0].x,y:GATES[0].y,width:GATES[0].width});
          this.solvedGates.add('lift');this.liftState.setText('Lintasan selamat · checkpoint disimpan');
          const index=CHECKPOINTS.findIndex(c=>c.id==='b-lift');if(index>=0){this.checkpointIndex=index;this.checkpointArts[index]?.setFrame(112);}
          this.writeSave();clearControls();this.mode='playing';this.input.keyboard.enabled=true;this.physics.world.resume();this.liftExperimentBusy=false;announce('Hentian 7 terkunci pada aras lintasan. Pijak dek dan lintas ke tebing nombor.');
        }});
      }});
    },
    selectNumberBlock(input) {
      if(this.mode!=='playing'||this.solvedGates.has('number-span')||this.numberMachineBusy)return;
      const block=this.numberBlockArts?.[input];if(!block)return;
      this.numberMachineBusy=true;this.numberSelected=input;
      this.numberReadoutShown=true;
      this.numberBlockArts.forEach((art,n)=>art?.setAlpha(n===input?1:.58));
      const home=this.numberBlockHomes?.[input]??block.x;
      this.mode='mechanism-transition';this.input.keyboard.enabled=false;this.physics.world.pause();
      this.numberReadout.setText(`Blok ${input} bergerak ke soket`);
      this.tweens.add({targets:block,x:3372,y:900,duration:reducedMotion?0:300,ease:'Sine.out',onComplete:()=>{
        const output=3*input-2;this.numberReadout.setText(`g(${input}) = ${output} · sasaran 10`);
        if(output!==10){this.say('failed:number');this.numberState?.setText(`Ujian ${input} · output ${output}`);announce(`g(${input}) = ${output}. Blok kembali ke rak; lintasan kekal tertutup.`);
          this.time.delayedCall(reducedMotion?0:500,()=>this.tweens.add({targets:block,x:home,y:918,duration:reducedMotion?0:280,ease:'Sine.in',onComplete:()=>{this.numberBlockArts.forEach((art,n)=>art?.setAlpha(n===input ? 1 : 0.58));this.numberMachineBusy=false;clearControls();this.mode='playing';this.input.keyboard.enabled=true;this.physics.world.resume();}}));return;}
        this.numberState?.setText('Output 10 · lintasan dibuka');this.solvedGates.add('number-span');this.writeSave();
        this.tweens.add({targets:this.numberSpan,y:GATES[1].y,duration:reducedMotion?0:620,ease:'Sine.inOut',onComplete:()=>{
          this.numberSpan.forEach(a=>a.y=GATES[1].y);this.gateBodies['number-span']=this.platform({id:'number-span-open',x:GATES[1].x,y:GATES[1].y,width:GATES[1].width});
          const i=CHECKPOINTS.findIndex(c=>c.id==='d-crossing');if(i>=0){this.checkpointIndex=i;this.checkpointArts[i]?.setFrame(112);}
          this.numberMachineBusy=false;clearControls();this.mode='playing';this.input.keyboard.enabled=true;this.physics.world.resume();this.writeSave();announce('g(4) = 10. Lintasan D sudah selamat.');
        }});
      }});
    },
    interactWaterworks(terminal) {
      if(this.mode!=='playing'||this.waterworksState===WS.RUNNING||this.waterworksState===WS.TARGET_REACHED||this.waterworksState===WS.CROSSING_ACTIVATING||this.waterworksState===WS.CROSSING_SAFE)return;
      if(terminal.kind==='water-stage'){
        const order=terminal.stage==='f'?'fg':'gf';
        this.waterOrder=order;
        this.waterworksState=transitionWaterworks(this.waterworksState,'choose-order',order);
        this.renderWaterworksState();this.writeSave();
        announce(order==='fg'?'Susunan dipilih: F dahulu, kemudian G. Jejak mesin dan tekan E pada tuil untuk uji.':'Susunan dipilih: G dahulu, kemudian F. Jejak mesin dan tekan E pada tuil untuk uji.');
        return;
      }
      if(terminal.kind==='water-activate'){
        if(!this.waterOrder||this.waterworksState===WS.LOCKED){announce('Periksa mesin F dan G dahulu. Pilih mesin pertama dengan E, kemudian kembali ke tuil.');return;}
        this.runWaterworksExperiment();
      }
    },
    renderWaterworksState() {
      document.body.dataset.waterworksState=this.waterworksState;
      if(this.waterworksState===WS.LOCKED){
        this.waterStage1.setText('F · 2x + 1');this.waterStage2.setText('G · 3x − 2');
        this.waterTag.setText('Input 3 · pilih F atau G dahulu');this.waterResultLabel.setText('Belum diuji');return;
      }
      if(this.waterOrder==='fg'){
        this.waterStage1.setText('Pertama · F');this.waterStage2.setText('Kemudian · G');this.waterTag.setText('Susunan F → G');
      }else{
        this.waterStage1.setText('Kemudian · F');this.waterStage2.setText('Pertama · G');this.waterTag.setText('Susunan G → F');
      }
      if(this.waterworksState===WS.CONFIGURED)this.waterResultLabel.setText('Input 3 · sedia diuji');
    },
    runWaterworksExperiment() {
      if(![WS.CONFIGURED,WS.NON_TARGET_RESULT].includes(this.waterworksState))return;
      this.waterworksState=transitionWaterworks(this.waterworksState,'activate');
      const result=evaluateWaterOrder(this.waterOrder,3);if(!result){this.waterworksState=WS.LOCKED;return;}
      this.lastWaterResult=result;this.renderWaterworksState();this.waterResultLabel.setText('Aliran bermula · input 3');
      this.waterStage1.setText(result.stages[0]==='F'?'F mengira…':'G mengira…');
      this.waterStage2.setText(result.stages[1]==='F'?'F menunggu':'G menunggu');
      this.writeSave();this.mode='mechanism-transition';this.input.keyboard.enabled=false;clearControls();this.physics.world.pause();
      this.waterFlowDot.setPosition(this.eWaterPath[0].x,this.eWaterPath[0].y).setVisible(true);
      this.waterOutput.setAngle(this.waterOrder==='fg'?-24:24);
      this.reservoir.forEach((a,i)=>a.setVisible(false).setAlpha(.72));
      let index=1;
      const advance=()=>{
        if(index>=this.eWaterPath.length){this.finishWaterworksExperiment(result);return;}
        const point=this.eWaterPath[index++];
        if(index===3){
          const first=result.stages[0],value=result.intermediate;
          this.waterStage1.setText(first==='F'?`F(3) = ${value}`:`G(3) = ${value}`);
        }
        if(index===5){
          const second=result.stages[1];
          this.waterStage2.setText(second==='G'?`G(${result.intermediate}) = ${result.output}`:`F(${result.intermediate}) = ${result.output}`);
          this.waterResultLabel.setText(`Output dikira: ${result.output} · sasaran 19`);
        }
        this.tweens.add({targets:this.waterFlowDot,x:point.x,y:point.y,duration:reducedMotion?0:125,ease:'Linear',onComplete:advance});
      };
      this.waterFlowDot.setVisible(true);advance();
    },
    finishWaterworksExperiment(result) {
      this.waterFlowDot.setVisible(false);
      const reached=result.output===19;
      this.waterworksState=transitionWaterworks(this.waterworksState,'result',result.output);
      document.body.dataset.waterworksState=this.waterworksState;
      this.reservoir.forEach((a,i)=>a.setVisible(reached||i<2).setAlpha(reached?1:.78));
      this.waterResultLabel.setText(`Output sebenar: ${result.output} · sasaran 19`);
      if(!reached){
        this.say('failed:water');
        this.writeSave();this.mode='playing';this.input.keyboard.enabled=true;this.physics.world.resume();
        $('game').focus({preventScroll:true});SFX.incorrect(audio);
        announce('Takungan belum penuh. Output 15 mengisi dua bahagian; susun semula mesin dan cuba lagi.');return;
      }
      this.solvedGates.add('water-crossing');this.writeSave();SFX.correct(audio);
      announce('Output 19 memenuhi takungan. Laluan air sedang turun ke kedudukan selamat.');
      const begin=()=>{
        this.waterworksState=transitionWaterworks(this.waterworksState,'begin-crossing');document.body.dataset.waterworksState=this.waterworksState;this.writeSave();
        const duration=reducedMotion?0:680;
        this.tweens.add({targets:this.waterBridge,y:GATES[2].y,duration,ease:'Sine.inOut',onComplete:()=>{
          this.waterBridge.forEach(a=>a.y=GATES[2].y);
          this.gateBodies['water-crossing']=this.platform({id:'water-crossing-open',x:GATES[2].x,y:GATES[2].y,width:GATES[2].width});
          this.waterworksState=transitionWaterworks(this.waterworksState,'crossing-safe');
          document.body.dataset.waterworksState=this.waterworksState;
          this.waterOutputLabel.setText('Lintasan selamat');
          const cp=CHECKPOINTS.findIndex(point=>point.id==='e-crossing');if(cp>=0){this.checkpointIndex=cp;this.checkpointArts[cp]?.setFrame(112);}
          this.mode='playing';this.input.keyboard.enabled=true;this.physics.world.resume();this.writeSave();
          $('game').focus({preventScroll:true});announce('Jambatan air sudah berhenti. Lintas ke tebing seberang.');
        }});
      };
      if(reducedMotion)begin();else this.time.delayedCall(520,begin);
    },
    openPuzzle() {
      if (this.mode !== 'playing') return;
      const terminal = this.nearestTerminal();
      if (!terminal) return;
      if(terminal.kind==='lift'){
        this.activePuzzle=terminal;this.selectedInput=this.bInput??3;this.mode='mechanism';this.physics.world.pause();clearControls();this.input.keyboard.enabled=false;
        $('mechanism').hidden=false;$('mechanism-title').textContent='Konsol hentian pengangkat';
        $('mechanism-rule').textContent='Pilih input pada konsol, kemudian uji. Output f(x)=2x+1 ialah kod hentian mesin; hanya kod 7 menetapkan lintasan pada aras tebing.';
        $('token-options').hidden=false;$('pipe-options').hidden=true;$('mechanism-value').textContent=`Input ${this.selectedInput} · output ${2*this.selectedInput+1}`;
        $('mechanism-feedback').textContent='Hentian uji bergerak tanpa menjadi platform. Lintasan hanya mendapat collider pada kod 7.';
        document.querySelectorAll('[data-token]').forEach(button=>{const n=Number(button.dataset.token);button.hidden=n>4;button.setAttribute('aria-pressed',String(n===this.selectedInput));});
        $('dial-test').textContent='Uji pengangkat';$('dial-test').hidden=false;$('dial-hint').hidden=false;$('dial-solution').hidden=false;
        this.numberBlockArts?.forEach((art,n)=>art?.setAlpha(.92));$('mechanism').focus?.();return;
      }
      this.activePuzzle = terminal;
      this.mode = 'mechanism'; this.physics.world.pause(); clearControls(); this.input.keyboard.enabled = false;
      const box = $('mechanism');
      box.hidden = false;
      const isD=terminal.kind==='number', isComposition=['composition','water-composition','river-final'].includes(terminal.kind), isWater=terminal.kind==='water-composition', isInverse=terminal.kind==='inverse-f', isRiver=terminal.kind==='river-final', riverOrder=this.solvedGates.has('river-input');
      $('mechanism-title').textContent = isD?'Bengkel blok nombor':isInverse?'Hubungan songsang':isRiver?(riverOrder?'Pilih urutan fungsi':'Sungai - latch pertama'):isComposition?'Susun fungsi':'Cuba mesin fungsi';
      $('mechanism-rule').textContent = isD
        ? 'g(x)=3x−2. Berjalan ke rak, pilih blok input dan lihat mesin mengira outputnya. Output 10 menetapkan lintasan selamat.'
        : isInverse
          ? 'Diberi f(x)=2x+1 pada domain {0,1,2,3}. Setiap input mempunyai output berbeza, jadi songsang wujud pada imej {1,3,5,7}. Output 7 datang daripada input mana? Songsang bukan 1/f(x).'
        : isRiver
          ? (riverOrder?'Input x=2. Bandingkan f kemudian g dengan g kemudian f. Laluan betul memerlukan g(f(2))=13.':'Latch 1: h(x)=4x-3 mesti menghasilkan 17. Cari input, kemudian susun komposisi untuk membuka jambatan.')
        : isWater
          ? 'Input x = 3 melalui dua fungsi f(x) = 2x + 1 dan g(x) = 3x − 2. Susun f kemudian g untuk sasaran 19. Bandingkan hasil susunan songsang.'
          : isComposition
          ? 'f(x)=2x+1; g(x)=3x−2. Gunakan input 2. Bandingkan f kemudian g dengan g kemudian f.'
          : terminal.kind === 'lift'
            ? 'f(x) = 2x + 1. Pengangkat memerlukan output 7. Pilih input.'
            : terminal.kind === 'mapping'
              ? 'Pilih input 0 hingga 3. Catat output setiap pasangan untuk permata bonus.'
              : 'Perhatikan peraturan f(x) = 2x + 1. Pilih input untuk melihat outputnya.';
      $('token-options').hidden = isD || (isComposition && (!isRiver||riverOrder)); $('pipe-options').hidden = !(isComposition && (!isRiver||riverOrder));
      document.querySelectorAll('[data-token]').forEach(button => {
        const n=Number(button.dataset.token);
        button.hidden = isD?(n<2||n>4):isRiver?(riverOrder||n>9):n>(isInverse?3:3);
        button.setAttribute('aria-pressed', String(Number(button.dataset.token) === (terminal.kind === 'lift' ? 3 : isD ? 2 : 0)));
      });
      this.selectedInput = terminal.kind === 'lift' ? 3 : isD ? 2 : isWater ? 3 : isRiver ? 0 : isComposition ? 2 : 0;
      $('mechanism-value').textContent = isD?'Pilih blok 2, 3 atau 4 pada rak':isInverse?'f(x)=7; cari input asal':isRiver?(riverOrder?'2 -> f(2)=5 -> g(5)=13':`h(${this.selectedInput}) = ${4*this.selectedInput-3}`):isWater?'Input 3 · pilih urutan untuk mengira output':isComposition?'f(2)=5 · g(2)=4':`f(${this.selectedInput}) = ${2 * this.selectedInput + 1}`;
      $('mechanism-feedback').textContent = isD?'Blok terpilih bergerak ke soket. Mesin mengira g(x); output selain 10 boleh dicuba semula.':isInverse?'Output 7 datang daripada input yang mana?':isRiver?(riverOrder?'Bandingkan output perantaraan dan hasil akhir.':'Pilih input 0 hingga 9, kemudian uji.'):isWater?'Pilih susunan paip. Hasil yang betul akan mengisi takungan.':isComposition?'Pilih satu susunan untuk melihat hasilnya.':terminal.kind === 'lift' ? 'Output mesti sepadan dengan 7.' : 'Pilih input, kemudian tekan Lihat output.';
      $('dial-test').textContent = terminal.kind === 'lift' ? 'Uji pengangkat' : isD?'Uji blok':isInverse?'Uji input':isRiver?(riverOrder?'':'Uji latch'): 'Lihat output';
      this.numberBlockArts?.forEach((art,n)=>art?.setAlpha(isD&&n===this.selectedInput?1:.68));
      $('dial-less').hidden = $('dial-more').hidden = $('dial-preview').hidden = $('dial-hint').hidden = true;
      $('dial-hint').hidden = !(isInverse || isRiver);
      $('dial-hint').hidden=false;$('worked-solution').hidden=true;$('dial-solution').setAttribute('aria-expanded','false');
      $('dial-test').hidden = isD || (isComposition && (!isRiver||riverOrder));
      document.querySelectorAll('[data-order]').forEach(button=>button.setAttribute('aria-pressed','false'));
      box.focus?.();
    },
    chooseToken(value) {
      if (this.mode !== 'mechanism' || !this.activePuzzle) return;
      if(this.activePuzzle.kind==='lift'){
        if(value<0||value>4)return;this.selectedInput=this.bInput=value;
        document.querySelectorAll('[data-token]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.token)===value)));
        $('mechanism-value').textContent=`f(${value}) = ${2*value+1} · kod hentian ${2*value+1}`;
        $('mechanism-feedback').textContent=value===3?'Hentian lintasan: kod 7 sepadan dengan aras tebing.':'Uji setpoint ini untuk melihat respons lift; lintasan belum selamat.';return;
      }
      if(this.activePuzzle.kind==='number'&&(value<2||value>4)) return;
      if(this.activePuzzle.kind==='inverse-f'&&(value<0||value>3))return;
      if(this.activePuzzle.kind==='river-final'&&this.solvedGates.has('river-input'))return;
      this.selectedInput = value;
      document.querySelectorAll('[data-token]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.token) === value)));
      const isD=this.activePuzzle.kind==='number',isH=this.activePuzzle.kind==='river-final',out=isD?3*value-2:isH?4*value-3:2*value+1;
      if(isD)this.numberBlockArts?.forEach((art,n)=>art?.setAlpha(n===value?1:.68));
      $('mechanism-value').textContent = isD?`g(${value}) = ${out}`:isH?`h(${value}) = ${out}`:`f(${value}) = ${out}`;
      $('mechanism-feedback').textContent = isD?`Blok ${value} menghasilkan ${out}. Sasaran: 10.`:isH?`h(${value}) menghasilkan ${out}. Sasaran: 17.`:this.activePuzzle.kind === 'inverse-f'?`f(${value}) menghasilkan ${out}; sasaran output 7.`:this.activePuzzle.kind === 'lift' ? `Output ${out}. Sasaran: 7.` : `f(${value}) menghasilkan ${out}.`;
    },
    testDial() {
      if (this.mode !== 'mechanism' || !this.activePuzzle) return;
      const terminal = this.activePuzzle;
      if(terminal.kind==='lift'){this.runLiftExperiment(this.selectedInput??3);return;}
      if(terminal.kind==='composition') { this.chooseOrder(false); return; }
      if(terminal.kind==='river-final') { this.testRiverInput(); return; }
      if(terminal.kind==='inverse-f') { this.testInverseInput(); return; }
      if(terminal.kind==='number') {
        const output=3*this.selectedInput-2;
        this.numberReadout.setText(`g(${this.selectedInput}) = ${output}  ·  sasaran 10`);
        if(output!==10) { this.say('failed:number'); SFX.incorrect(audio); $('mechanism-value').textContent=`${output}`; $('mechanism-feedback').textContent=`Input ${this.selectedInput}: 3 × ${this.selectedInput} − 2 = ${output}. Blok itu kembali ke rak; cuba input lain.`; return; }
        $('mechanism-feedback').textContent='Tepat! g(4) = 10. Blok masuk ke soket dan lintasan sedang bergerak.';
        SFX.correct(audio);this.dismissForAnimation();this.solvedGates.add('number-span'); this.writeSave(); this.mode='mechanism-transition';
        const deployBridge=()=>this.tweens.add({targets:this.numberSpan,y:GATES[1].y,duration:reducedMotion?0:680,ease:'Sine.inOut',onComplete:()=>{
          this.numberSpan.forEach(a=>a.y=GATES[1].y);
          this.gateBodies['number-span']=this.platform({id:'number-span-open',x:GATES[1].x,y:GATES[1].y,width:GATES[1].width});
          const i=CHECKPOINTS.findIndex(c=>c.id==='d-crossing');if(i>=0){this.checkpointIndex=i;this.checkpointArts[i]?.setFrame(112);}
          this.closeMechanism();this.writeSave();announce('g(4) = 10. Lintasan D sudah selamat.');
        }});
        const block=this.numberBlockArts?.[4];
        if(block)this.tweens.add({targets:block,x:3372,y:900,delay:reducedMotion?0:320,duration:reducedMotion?0:260,ease:'Sine.out',onComplete:deployBridge}); else deployBridge();
        return;
      }
      const output = 2 * this.selectedInput + 1;
      if (terminal.kind === 'mapping') {
        this.mappingInputs.add(this.selectedInput);
        this.mappingReadout.setText([0,1,2,3].map(n => this.mappingInputs.has(n) ? `${n}→${2*n+1}` : `${n}→?`).join('   '));
        $('mechanism-feedback').textContent = `Pasangan direkodkan: ${this.selectedInput} → ${output}. ${this.mappingInputs.size}/4 diteroka.`;
        if (this.mappingInputs.size === 4) {
          this.mappingDone = true;
          this.discoverSecret('bonus-mapping');
        }
        this.writeSave();
        return;
      }
      if (terminal.kind !== 'lift') {
        this.probeSeen.add(this.selectedInput);
        this.probeReadout.setText(`f(${this.selectedInput}) = ${output}`);
        $('mechanism-feedback').textContent = `Input ${this.selectedInput} menghasilkan output ${output}.`;
        return;
      }
      if (output !== 7) { this.say('failed:lift'); SFX.incorrect(audio);
        $('mechanism-feedback').textContent = `Output ${output}; pengangkat memerlukan 7 langkah. Cuba lagi.`;
        return;
      }
      if (this.solvedGates.has('lift')) { $('mechanism-feedback').textContent = 'Pengangkat sudah berada pada kedudukan selamat.'; return; }
      $('mechanism-feedback').textContent = 'Tepat! f(3) = 7. Tuil mengangkat lintasan.';
      SFX.correct(audio);this.dismissForAnimation();this.solvedGates.add('lift'); this.writeSave();
      this.mode = 'mechanism-transition';
      this.tweens.add({ targets: this.lever, angle: -28, delay:reducedMotion?0:320, duration: reducedMotion ? 0 : 280, yoyo: true, hold: 180,
        onComplete: () => {
          if (!reducedMotion) SFX.bridge(audio);
          const duration = reducedMotion ? 0 : 760;
          this.tweens.add({ targets: this.liftPlanks, y: GATES[0].y, duration, ease: 'Sine.inOut',
            onComplete: () => {
              this.liftPlanks.forEach((art, i) => art.y = GATES[0].y);
              this.gateBodies.lift = this.platform({id:'lift-open',x:GATES[0].x,y:GATES[0].y,width:GATES[0].width});
              this.liftState.setText('Lintasan selamat · checkpoint disimpan');
              const index = CHECKPOINTS.findIndex(c => c.id === 'b-lift');
              if (index >= 0) { this.checkpointIndex = index; this.checkpointArts[index]?.setFrame(112); }
              this.closeMechanism(); this.writeSave();
              announce('Pengangkat sudah berhenti. Lintas ke teres blok nombor.');
            }
          });
        }
      });
    },
    dismissForAnimation() {
      this.time.delayedCall(reducedMotion?0:300,()=>{if(this.mode==='mechanism-transition')$('mechanism').hidden=true;});
    },
    closeMechanism() {
      $('game').inert=false;
      $('mechanism').hidden = true;
      this.activePuzzle = null; this.mode = 'playing'; this.input.keyboard.enabled = true;
      clearControls(); this.physics.world.resume(); $('game').focus({preventScroll:true});
    },
    closePuzzle() {
      if (this.mode === 'mechanism-transition') return;
      if (this.mode !== 'mechanism') return;
      this.closeMechanism();
    },
    changeDial(delta) { const kind=this.activePuzzle?.kind,min=kind==='number'?2:0,max=kind==='number'?4:kind==='river-final'?9:3;this.chooseToken(Math.max(min,Math.min(max,(this.selectedInput??min)+delta))); },
    answer(raw) { const parsed = Number(raw),kind=this.activePuzzle?.kind,min=kind==='number'?2:0,max=kind==='number'?4:kind==='river-final'?9:3; if (Number.isInteger(parsed) && parsed >= min && parsed <= max) this.chooseToken(parsed); },
    testInverseInput() {
      const x=this.selectedInput, output=2*x+1;
      $('mechanism-value').textContent=`f(${x}) = ${output}`;
      if(output!==7){this.say('failed:inverse-f');SFX.incorrect(audio);$('mechanism-feedback').textContent=`Input ${x} memberi output ${output}, bukan 7. Songsangkan f(x)=2x+1 dan cuba lagi.`;return;}
      $('mechanism-feedback').textContent='Tepat: f(3)=7, maka f invers(7)=3. Ini input asal, bukan 1/7.';
      this.discoverSecret('f-inverse');
      this.time.delayedCall(reducedMotion?0:520,()=>this.closeMechanism());
    },
    testRiverInput() {
      const x=this.selectedInput, output=4*x-3;
      $('mechanism-value').textContent=`h(${x}) = 4(${x}) - 3 = ${output}`;
      if(output!==17){this.say('failed:river-final');SFX.incorrect(audio);$('mechanism-feedback').textContent=`h(${x}) = 4(${x}) - 3 = ${output}. Sasaran 17; cuba input lain.`;return;}
      $('mechanism-feedback').textContent='Tepat: h(5)=17. Latch pertama terbuka; sekarang pilih susunan untuk input 2.';
      SFX.correct(audio);this.solvedGates.add('river-input');this.writeSave();
      $('token-options').hidden=true;$('dial-test').hidden=true;$('pipe-options').hidden=false;
      $('mechanism-title').textContent='Latch kedua: susun fungsi';
      $('mechanism-rule').textContent='f(x)=2x+1; g(x)=3x−2. Input 2 melalui dua fungsi. Susun untuk sasaran 13.';
      $('mechanism-value').textContent='2 -> f(2)=5 -> g(5)=13';
      $('mechanism-feedback').textContent='Pilih susunan. Susunan songsang dikira sebenar dan boleh dicuba semula.';
    },
    chooseOrder(reverse) {
      if(this.mode!=='mechanism'||!['composition','river-final'].includes(this.activePuzzle?.kind)) return;
      if(this.activePuzzle.kind==='river-final') return this.chooseRiverOrder(reverse);
      const result=reverse?2*(3*2-2)+1:3*(2*2+1)-2;
      const text=reverse?'g(2)=4 → f(4)=9':'f(2)=5 → g(5)=13';
      this.compositionReadout.setText(`${text}  ·  ${result}`);
      $('mechanism-value').textContent=`Hasil ${result}`;
      $('mechanism-feedback').textContent=`${reverse?'g kemudian f':'f kemudian g'}: ${text}.`;
      document.querySelectorAll('[data-order]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.order==='gf')===reverse)));
      this.writeSave();
    },
    chooseRiverOrder(reverse) {
      if(this.mode!=='mechanism'||this.activePuzzle?.kind!=='river-final'||!this.solvedGates.has('river-input'))return;
      const intermediate=reverse?4:5, result=reverse?9:13;
      const description=reverse?'g(2)=3(2)-2=4; f(4)=2(4)+1=9.':'f(2)=2(2)+1=5; g(5)=3(5)-2=13.';
      $('mechanism-value').textContent=`Input 2 -> ${reverse?'g(2)=4 -> f(4)=9':'f(2)=5 -> g(5)=13'}`;
      $('mechanism-feedback').textContent=reverse?`${description} Sasaran 13. Tukar susunan dan cuba lagi.`:`Betul. ${description} Kedua-dua latch aktif; jambatan sedang bergerak.`;
      document.querySelectorAll('[data-order]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.order==='gf')===reverse)));
      if(reverse){this.say('failed:river-final');SFX.incorrect(audio);return;}
      SFX.correct(audio);this.solvedGates.add('river-composition');this.solvedGates.add('river-crossing');this.writeSave();this.mode='mechanism-transition';
      this.time.delayedCall(reducedMotion?0:250,()=>{
        $('mechanism').hidden=true;this.activePuzzle=null;clearControls();this.input.keyboard.enabled=false;
        const settle=()=>this.tweens.add({targets:this.riverBridge,y:GATES[3].y,duration:reducedMotion?0:760,ease:'Sine.inOut',onComplete:()=>{
          this.riverBridge.forEach(a=>a.y=GATES[3].y);
          this.gateBodies['river-crossing']=this.platform({id:'river-crossing-open',x:GATES[3].x,y:GATES[3].y,width:GATES[3].width});
          this.riverLever.setAngle(-52);SFX.checkpoint(audio);
          const i=CHECKPOINTS.findIndex(c=>c.id==='g-river-east');if(i>=0){this.checkpointIndex=i;this.checkpointArts[i]?.setFrame(112);}
          this.mode='playing';this.input.keyboard.enabled=true;this.physics.world.resume();$('game').focus({preventScroll:true});this.writeSave();announce('Jambatan sungai berhenti dan selamat dilalui.');
        }});
        if(reducedMotion){this.riverLever.setAngle(-52);settle();return;}
        // The handle and bridge now respond to the same solved action. The
        // hinge/base remains fixed; bridge collision is added only on settle.
        this.riverLever.setAngle(0);
        this.tweens.add({targets:this.riverLever,angle:-52,duration:460,ease:'Sine.inOut'});
        settle();
      });
    },
    dialHint() { const kind=this.activePuzzle?.kind; $('mechanism-feedback').textContent = kind==='lift'?'f(x)=2x+1. Kod hentian 7 dipilih oleh input 3: 2(3)+1=7. Kod output ialah preset mekanisme, bukan ukuran jarak.':kind==='inverse-f'?'Untuk membalikkan f(x)=2x+1, mula dengan 7: tolak 1, kemudian bahagi 2.':kind==='river-final'&&!this.solvedGates.has('river-input')?'Selesaikan 4x-3=17 dengan operasi songsang.':kind==='river-final'?'Jejak hasil pertama sebagai input fungsi kedua; bandingkan g(f(2)) dan f(g(2)).':'Gandakan input, kemudian tambah 1. Untuk 7, fikirkan input yang menghasilkan 7.'; },
    previewRoute() { $('mechanism-feedback').textContent = 'Lintasan berada di bawah rangka kayu. Ia hanya boleh dipijak selepas berhenti.'; },
    writeSave() {
      for(const id of this.solvedGates){if(!this.dialogueGates.has(id))this.dialogue.enqueue(`activated:${id}`);}
      this.dialogueGates=new Set(this.solvedGates);
      const point = CHECKPOINTS[this.checkpointIndex] || SPAWN;
      const data = { checkpointId: CHECKPOINTS[this.checkpointIndex]?.id || null, solvedGateIds:[...this.solvedGates], mappingInputs:[...this.mappingInputs],
        collectedCoinIds:[...this.collectedCoinIds], discoveredSecretIds:[...this.discoveredSecrets], elapsedMs:this.elapsed, phase1Reviewed:this.solvedGates.has('lift'), completed:this.levelCompleted,
        waterOrder:this.waterOrder,waterworksState:this.waterworksState,dialogue:this.dialogue.snapshot() };
      const ok = SaveManager.save(data);
      if (ok) this.pendingSave = SaveManager.load();
      return ok;
    },
    continueFromSave() {
      const save = SaveManager.load(); if (!save) return this.startRun();
      this.dialogue=new DialogueQueue(save.dialogue);this.dialogueGates=new Set(save.solvedGateIds);this.dialogueBound=false;
      this.solvedGates = new Set(save.solvedGateIds); this.mappingInputs = new Set(save.mappingInputs); this.mappingDone = save.mappingDone;
      this.collectedCoinIds = new Set(save.collectedCoinIds); this.discoveredSecrets = new Set(save.discoveredSecretIds);
      this.waterOrder=save.waterOrder;this.waterworksState=recoverWaterworksState(save.waterworksState,save.waterOrder);
      this.elapsed = save.elapsedMs; this.checkpointIndex = CHECKPOINTS.findIndex(c => c.id === save.checkpointId);
      if (this.solvedGates.has('lift')) this.restoreLift();
      if (this.solvedGates.has('number-span')) this.restoreNumberSpan();
      if (this.solvedGates.has('water-crossing')) this.restoreWaterworks();
      else this.restoreWaterExperiment(save);
      if (this.solvedGates.has('river-crossing')) this.restoreRiver();
      this.levelCompleted=save.completed===true;
      if (this.mappingDone) this.mappingReadout.setText('0→1   1→3   2→5   3→7');
      this.collectibles.forEach(c => { if (this.collectedCoinIds.has(c.getData('id'))) c.destroy(); });
      if(this.discoveredSecrets.has('f-inverse')){const gem=this.collectibles.find(c=>c.getData('id')==='f-cave-gem');if(gem?.body){gem.body.enable=true;gem.refreshBody();}}
      this.checkpointArts.forEach((art, i) => art.setFrame(i === this.checkpointIndex ? 112 : 111));
      const cp = CHECKPOINTS[this.checkpointIndex] || SPAWN;
      this.player.body.reset(cp.x, cp.feet - 30);
      this.syncVisual(); this.refreshMenu(); this.startRun();
      if(this.levelCompleted)this.showCompletion();
    },
    restoreLift() {
      this.liftPlanks.forEach(art => art.setVisible(true).setY(GATES[0].y));
      this.bReadoutShown=true;this.liftReadout.setText('f(3) = 7 · kod hentian lintasan');
      if (!this.gateBodies.lift) this.gateBodies.lift = this.platform({id:'lift-open',x:GATES[0].x,y:GATES[0].y,width:GATES[0].width});
      this.lever.angle = -28; this.liftState.setText('Lintasan selamat · checkpoint disimpan');
    },
    restoreNumberSpan() {
      this.numberSpan.forEach(a=>a.y=GATES[1].y);
      this.numberReadoutShown=true;this.numberReadout.setText('g(4) = 10 · lintasan selamat');
      if(!this.gateBodies['number-span']) this.gateBodies['number-span']=this.platform({id:'number-span-open',x:GATES[1].x,y:GATES[1].y,width:GATES[1].width});
    },
    restoreWaterworks() {
      this.waterworksState=WS.CROSSING_SAFE;this.waterOrder='fg';this.renderWaterworksState();
      this.reservoir.forEach(a=>a.setPosition(a.x,972).setVisible(true).setAlpha(1));
      this.waterBridge.forEach(a=>a.y=GATES[2].y);
      this.waterOutput.setAngle(-24);
      this.waterStage1.setText('F · 2x + 1');this.waterStage2.setText('G · 3x − 2');this.waterTag.setText('F → G');
      this.waterStage1.setText('F(3) = 7');this.waterStage2.setText('G(7) = 19');this.waterResultLabel.setText('Output 19 · lintasan selamat');this.waterOutputLabel.setVisible(true);
      if(!this.gateBodies['water-crossing']) this.gateBodies['water-crossing']=this.platform({id:'water-crossing-open',x:GATES[2].x,y:GATES[2].y,width:GATES[2].width});
    },
    restoreWaterExperiment(save) {
      this.waterworksState=recoverWaterworksState(save.waterworksState,save.waterOrder);this.waterOrder=save.waterOrder;
      this.renderWaterworksState();this.waterFlowDot.setVisible(false);this.waterBridge.forEach(a=>a.y=GATES[2].parkedY);
      this.reservoir.forEach((a,i)=>a.setVisible(this.waterworksState===WS.NON_TARGET_RESULT&&i<2).setAlpha(.78));
      if(this.waterworksState===WS.NON_TARGET_RESULT){
        const result=evaluateWaterOrder(this.waterOrder,3);
        if(result){this.waterStage1.setText(result.stages[0]==='F'?`F(3) = ${result.intermediate}`:`G(3) = ${result.intermediate}`);this.waterStage2.setText(result.stages[1]==='G'?`G(${result.intermediate}) = ${result.output}`:`F(${result.intermediate}) = ${result.output}`);this.waterResultLabel.setText(`Output sebenar: ${result.output} · sasaran 19`);}
      }
      if(this.waterworksState===WS.CROSSING_SAFE){this.solvedGates.add('water-crossing');this.restoreWaterworks();}
    },
    restoreRiver() {
      this.riverBridge.forEach(a=>a.y=GATES[3].y);
      this.riverLever.setAngle(-52);
      if(!this.gateBodies['river-crossing'])this.gateBodies['river-crossing']=this.platform({id:'river-crossing-open',x:GATES[3].x,y:GATES[3].y,width:GATES[3].width});
    },
    finish() {
      if(this.levelCompleted||this.mode==='complete')return;
      const required=['lift','number-span','water-crossing','river-input','river-composition','river-crossing'];
      if(!required.every(id=>this.solvedGates.has(id)))return;
      this.levelCompleted=true;this.dialogue.seen.add('destination');this.writeSave();this.mode='complete';this.physics.world.pause();clearControls();this.input.keyboard.enabled=false;
      this.sparkleBurst(GOAL.x,GOAL.feet-70,10,0xffd16b);this.pulseRing(GOAL.x,GOAL.feet-35,0xffd16b);
      this.time.delayedCall(reducedMotion?0:380,()=>this.showCompletion());
    },
    showCompletion() {
      $('destination-reaction').textContent=LINES.destination;
      this.mode='complete';this.physics.world.pause();clearControls();this.input.keyboard.enabled=false;
      const seconds=Math.floor(this.elapsed/1000),minutes=Math.floor(seconds/60),rest=seconds%60;
      $('completion-time').textContent=`Masa: ${minutes}:${String(rest).padStart(2,'0')}`;
      $('completion-coins').textContent=`Koleksi: ${this.collectedCoinIds.size}/${COLLECTIBLES.length}`;
      $('completion-puzzles').textContent='Konsep: input, output dan komposisi fungsi.'+(this.discoveredSecrets.has('f-inverse')?' Fungsi songsang turut diterokai.':'');
      $('completion-secrets').textContent=`Rahsia: ${this.discoveredSecrets.size}/${SECRETS.length}`;
      if(!$('complete').open)$('complete').showModal();
      if(!this.completionSoundPlayed){SFX.victory(audio);this.completionSoundPlayed=true;}
    },
  };
}
