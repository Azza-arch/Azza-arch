import { GATES, TERMINALS, PUZZLES, CHECKPOINTS, COLLECTIBLES, SECRETS, SPAWN, GOAL } from './level.js';
import { SaveManager } from './save.js';

export function createMechanismMethods({ $, clearControls, audio, SFX, reducedMotion, announce }) {
  return {
    nearestTerminal() {
      return TERMINALS.find(t => !((t.kind==='lift'&&this.solvedGates.has('lift'))||(t.kind==='number'&&this.solvedGates.has('number-span'))||(t.kind==='water-composition'&&this.solvedGates.has('water-crossing'))) && Math.abs(this.player.x - t.x) < 78 && Math.abs(this.player.body.bottom - t.feet) < 72);
    },
    openPuzzle() {
      if (this.mode !== 'playing') return;
      const terminal = this.nearestTerminal();
      if (!terminal) return;
      this.activePuzzle = terminal;
      this.mode = 'mechanism'; this.physics.world.pause(); clearControls(); this.input.keyboard.enabled = false;
      const box = $('mechanism');
      box.hidden = false;
      const isD=terminal.kind==='number', isComposition=['composition','water-composition'].includes(terminal.kind), isWater=terminal.kind==='water-composition';
      $('mechanism-title').textContent = isD?'Masukkan blok nombor':isComposition?'Susun fungsi':'Cuba mesin fungsi';
      $('mechanism-rule').textContent = isD
        ? 'Ambil blok input daripada rak. Soket ini mengira g(x) = 3x − 2; buka lintasan apabila output 10.'
        : isWater
          ? 'Input x = 3 melalui dua fungsi f(x) = 2x + 1 dan g(x) = 3x − 2. Susun f kemudian g untuk sasaran 19. Bandingkan hasil susunan songsang.'
          : isComposition
          ? 'Gunakan input 2. Bandingkan f kemudian g dengan g kemudian f.'
          : terminal.kind === 'lift'
            ? 'f(x) = 2x + 1. Pengangkat memerlukan output 7. Pilih input.'
            : terminal.kind === 'mapping'
              ? 'Pilih input 0 hingga 3. Catat output setiap pasangan untuk permata bonus.'
              : 'Perhatikan peraturan f(x) = 2x + 1. Pilih input untuk melihat outputnya.';
      $('token-options').hidden = isComposition; $('pipe-options').hidden = !isComposition;
      document.querySelectorAll('[data-token]').forEach(button => {
        const n=Number(button.dataset.token);
        button.hidden = isD?(n<2||n>4):n>3;
        button.setAttribute('aria-pressed', String(Number(button.dataset.token) === (terminal.kind === 'lift' ? 3 : isD ? 2 : 0)));
      });
      this.selectedInput = terminal.kind === 'lift' ? 3 : isD ? 2 : isWater ? 3 : isComposition ? 2 : 0;
      $('mechanism-value').textContent = isD?`g(${this.selectedInput}) = ${3*this.selectedInput-2}`:isWater?'Input 3 · pilih urutan untuk mengira output':isComposition?'f(2)=5 · g(2)=4':`f(${this.selectedInput}) = ${2 * this.selectedInput + 1}`;
      $('mechanism-feedback').textContent = isD?'Pilih input dari rak, kemudian kira output.':isWater?'Pilih susunan paip. Hasil yang betul akan mengisi takungan.':isComposition?'Pilih satu susunan untuk melihat hasilnya.':terminal.kind === 'lift' ? 'Output mesti sepadan dengan 7.' : 'Pilih input, kemudian tekan Lihat output.';
      $('dial-test').textContent = terminal.kind === 'lift' ? 'Uji pengangkat' : isD?'Uji blok':'Lihat output';
      this.numberBlockArts?.forEach((art,n)=>art?.setAlpha(isD&&n===this.selectedInput?1:.68));
      $('dial-less').hidden = $('dial-more').hidden = $('dial-preview').hidden = $('dial-hint').hidden = true;
      $('dial-test').hidden = isComposition;
      document.querySelectorAll('[data-order]').forEach(button=>button.setAttribute('aria-pressed','false'));
      box.focus?.();
    },
    chooseToken(value) {
      if (this.mode !== 'mechanism' || !this.activePuzzle) return;
      if(this.activePuzzle.kind==='number'&&(value<2||value>4)) return;
      this.selectedInput = value;
      document.querySelectorAll('[data-token]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.token) === value)));
      const isD=this.activePuzzle.kind==='number',out=isD?3*value-2:2*value+1;
      if(isD)this.numberBlockArts?.forEach((art,n)=>art?.setAlpha(n===value?1:.68));
      $('mechanism-value').textContent = isD?`g(${value}) = ${out}`:`f(${value}) = ${out}`;
      $('mechanism-feedback').textContent = isD?`Blok ${value} menghasilkan ${out}. Sasaran: 10.`:this.activePuzzle.kind === 'lift' ? `Output ${out}. Sasaran: 7.` : `f(${value}) menghasilkan ${out}.`;
    },
    testDial() {
      if (this.mode !== 'mechanism' || !this.activePuzzle) return;
      const terminal = this.activePuzzle;
      if(terminal.kind==='composition') { this.chooseOrder(false); return; }
      if(terminal.kind==='number') {
        const output=3*this.selectedInput-2;
        this.numberReadout.setText(`g(${this.selectedInput}) = ${output}  ·  sasaran 10`);
        if(output!==10) { $('mechanism-value').textContent=`${output}`; $('mechanism-feedback').textContent=`Input ${this.selectedInput}: 3 × ${this.selectedInput} − 2 = ${output}. Blok itu kembali ke rak; cuba input lain.`; return; }
        $('mechanism-feedback').textContent='Tepat! g(4) = 10. Blok masuk ke soket dan lintasan sedang bergerak.';
        this.solvedGates.add('number-span'); this.writeSave(); this.mode='mechanism-transition';
        const deployBridge=()=>this.tweens.add({targets:this.numberSpan,y:GATES[1].y,duration:reducedMotion?0:680,ease:'Sine.inOut',onComplete:()=>{
          this.numberSpan.forEach(a=>a.y=GATES[1].y);
          this.gateBodies['number-span']=this.platform({id:'number-span-open',x:GATES[1].x,y:GATES[1].y,width:GATES[1].width});
          const i=CHECKPOINTS.findIndex(c=>c.id==='d-crossing');if(i>=0){this.checkpointIndex=i;this.checkpointArts[i]?.setFrame(112);}
          this.closeMechanism();this.writeSave();announce('g(4) = 10. Lintasan D sudah selamat.');
        }});
        const block=this.numberBlockArts?.[4];
        if(block)this.tweens.add({targets:block,x:3372,y:900,duration:reducedMotion?0:260,ease:'Sine.out',onComplete:deployBridge}); else deployBridge();
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
      if (output !== 7) {
        $('mechanism-feedback').textContent = `Output ${output}; pengangkat memerlukan 7 langkah. Cuba lagi.`;
        return;
      }
      if (this.solvedGates.has('lift')) { $('mechanism-feedback').textContent = 'Pengangkat sudah berada pada kedudukan selamat.'; return; }
      $('mechanism-feedback').textContent = 'Tepat! f(3) = 7. Tuil mengangkat lintasan.';
      this.solvedGates.add('lift'); this.writeSave();
      this.mode = 'mechanism-transition';
      this.tweens.add({ targets: this.lever, angle: -28, duration: reducedMotion ? 0 : 280, yoyo: true, hold: 180,
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
    closeMechanism() {
      $('mechanism').hidden = true;
      this.activePuzzle = null; this.mode = 'playing'; this.input.keyboard.enabled = true;
      clearControls(); this.physics.world.resume(); $('game').focus({preventScroll:true});
    },
    closePuzzle() {
      if (this.mode === 'mechanism-transition') return;
      if (this.mode !== 'mechanism') return;
      this.closeMechanism();
    },
    changeDial(delta) { const min=this.activePuzzle?.kind==='number'?2:0;this.chooseToken(Math.max(min, Math.min(this.activePuzzle?.kind==='number'?4:3, (this.selectedInput ?? min) + delta))); },
    answer(raw) { const parsed = Number(raw),min=this.activePuzzle?.kind==='number'?2:0; if (Number.isInteger(parsed) && parsed >= min && parsed <= (this.activePuzzle?.kind==='number'?4:3)) this.chooseToken(parsed); },
    chooseOrder(reverse) {
      if(this.mode!=='mechanism'||!['composition','water-composition'].includes(this.activePuzzle?.kind)) return;
      if(this.activePuzzle.kind==='water-composition') return this.chooseWaterOrder(reverse);
      const result=reverse?2*(3*2-2)+1:3*(2*2+1)-2;
      const text=reverse?'g(2)=4 → f(4)=9':'f(2)=5 → g(5)=13';
      this.compositionReadout.setText(`${text}  ·  ${result}`);
      $('mechanism-value').textContent=`Hasil ${result}`;
      $('mechanism-feedback').textContent=`${reverse?'g kemudian f':'f kemudian g'}: ${text}.`;
      document.querySelectorAll('[data-order]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.order==='gf')===reverse)));
      this.writeSave();
    },
    chooseWaterOrder(reverse) {
      if(this.mode!=='mechanism'||this.activePuzzle?.kind!=='water-composition') return;
      const first=reverse?'G':'F',second=reverse?'F':'G';
      const intermediate=reverse?3*3-2:2*3+1;
      const result=reverse?2*intermediate+1:3*intermediate-2;
      const description=reverse
        ? `g(3) = 3 × 3 − 2 = ${intermediate}; kemudian f(${intermediate}) = 2 × ${intermediate} + 1 = ${result}.`
        : `f(3) = 2 × 3 + 1 = ${intermediate}; kemudian g(${intermediate}) = 3 × ${intermediate} − 2 = ${result}.`;
      this.waterStage1.setText(`${first} · ${first==='F'?'2x + 1':'3x − 2'}`);
      this.waterStage2.setText(`${second} · ${second==='F'?'2x + 1':'3x − 2'}`);
      this.waterTag.setText(`${first} → ${second}`);
      this.waterOutput.setAngle(reverse?24:-24);
      $('mechanism-value').textContent=`3 → ${first}(3)=${intermediate} → ${second}(${intermediate})=${result}`;
      document.querySelectorAll('[data-order]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.order==='gf')===reverse)));
      if(result!==19) {
        $('mechanism-feedback').textContent=`${description} Hasil ${result}, sasaran 19. Tukar susunan dan cuba lagi.`;
        announce(`Susunan ${first} kemudian ${second} menghasilkan ${result}; sasaran 19.`);
        return;
      }
      $('mechanism-feedback').textContent=`Tepat! ${description} Takungan mula diisi.`;
      this.activateWaterworks();
    },
    activateWaterworks() {
      if(this.solvedGates.has('water-crossing')||this.mode!=='mechanism') return;
      this.solvedGates.add('water-crossing');this.writeSave();this.mode='mechanism-transition';
      const beginFlow=()=>{
        const path=this.eWaterPath||[];let index=1;
        const finishFlow=()=>{
          this.reservoir.forEach(a=>a.setVisible(true).setAlpha(.45));
          this.tweens.add({targets:this.reservoir,y:972,alpha:1,duration:reducedMotion?0:420,ease:'Sine.out',onComplete:()=>{
            const finishBridge=()=>this.tweens.add({targets:this.waterBridge,y:GATES[2].y,duration:reducedMotion?0:680,ease:'Sine.inOut',onComplete:()=>{
              this.waterBridge.forEach(art=>art.y=GATES[2].y);
              this.gateBodies['water-crossing']=this.platform({id:'water-crossing-open',x:GATES[2].x,y:GATES[2].y,width:GATES[2].width});
              const cp=CHECKPOINTS.findIndex(point=>point.id==='e-crossing');if(cp>=0){this.checkpointIndex=cp;this.checkpointArts[cp]?.setFrame(112);}
              this.waterFlowDot.setVisible(false);this.closeMechanism();this.writeSave();
              announce('Air memenuhi takungan. Jambatan berhenti dan selamat dilalui.');
            }});
            if(reducedMotion) finishBridge();else this.time.delayedCall(180,finishBridge);
          }});
        };
        const advance=()=>{
          if(index>=path.length){finishFlow();return;}
          const point=path[index++];
          this.tweens.add({targets:this.waterFlowDot,x:point.x,y:point.y,duration:reducedMotion?0:125,ease:'Linear',onComplete:advance});
        };
          this.waterFlowDot.setPosition(path[0]?.x??4563,path[0]?.y??783).setVisible(true);
        advance();
      };
      // Acknowledge in the learning panel, close it automatically, then
      // run the world mechanism while physics stays paused.
      this.time.delayedCall(reducedMotion?0:620,()=>{
        $('mechanism').hidden=true;this.activePuzzle=null;clearControls();this.input.keyboard.enabled=false;
        $('game').focus({preventScroll:true});announce('Susunan tepat. Aliran air bermula.');beginFlow();
      });
    },
    dialHint() { $('mechanism-feedback').textContent = 'Gandakan input, kemudian tambah 1. Untuk 7, fikirkan input yang menghasilkan 7.'; },
    previewRoute() { $('mechanism-feedback').textContent = 'Lintasan berada di bawah rangka kayu. Ia hanya boleh dipijak selepas berhenti.'; },
    writeSave() {
      const point = CHECKPOINTS[this.checkpointIndex] || SPAWN;
      const data = { checkpointId: CHECKPOINTS[this.checkpointIndex]?.id || null, solvedGateIds:[...this.solvedGates], mappingInputs:[...this.mappingInputs],
        collectedCoinIds:[...this.collectedCoinIds], discoveredSecretIds:[...this.discoveredSecrets], elapsedMs:this.elapsed, phase1Reviewed:this.solvedGates.has('lift') };
      const ok = SaveManager.save(data);
      if (ok) this.pendingSave = SaveManager.load();
      return ok;
    },
    continueFromSave() {
      const save = SaveManager.load(); if (!save) return this.startRun();
      this.solvedGates = new Set(save.solvedGateIds); this.mappingInputs = new Set(save.mappingInputs); this.mappingDone = save.mappingDone;
      this.collectedCoinIds = new Set(save.collectedCoinIds); this.discoveredSecrets = new Set(save.discoveredSecretIds);
      this.elapsed = save.elapsedMs; this.checkpointIndex = CHECKPOINTS.findIndex(c => c.id === save.checkpointId);
      if (this.solvedGates.has('lift')) this.restoreLift();
      if (this.solvedGates.has('number-span')) this.restoreNumberSpan();
      if (this.solvedGates.has('water-crossing')) this.restoreWaterworks();
      if (this.mappingDone) this.mappingReadout.setText('0→1   1→3   2→5   3→7');
      this.collectibles.forEach(c => { if (this.collectedCoinIds.has(c.getData('id'))) c.destroy(); });
      this.checkpointArts.forEach((art, i) => art.setFrame(i === this.checkpointIndex ? 112 : 111));
      const cp = CHECKPOINTS[this.checkpointIndex] || SPAWN;
      this.player.body.reset(cp.x, cp.feet - 30);
      this.syncVisual(); this.refreshMenu(); this.startRun();
    },
    restoreLift() {
      this.liftPlanks.forEach(art => art.y = GATES[0].y);
      if (!this.gateBodies.lift) this.gateBodies.lift = this.platform({id:'lift-open',x:GATES[0].x,y:GATES[0].y,width:GATES[0].width});
      this.lever.angle = -28; this.liftState.setText('Lintasan selamat · checkpoint disimpan');
    },
    restoreNumberSpan() {
      this.numberSpan.forEach(a=>a.y=GATES[1].y);
      if(!this.gateBodies['number-span']) this.gateBodies['number-span']=this.platform({id:'number-span-open',x:GATES[1].x,y:GATES[1].y,width:GATES[1].width});
    },
    restoreWaterworks() {
      this.reservoir.forEach(a=>a.setPosition(a.x,972).setVisible(true).setAlpha(1));
      this.waterBridge.forEach(a=>a.y=GATES[2].y);
      this.waterOutput.setAngle(-24);
      this.waterStage1.setText('F · 2x + 1');this.waterStage2.setText('G · 3x − 2');this.waterTag.setText('F → G');
      if(!this.gateBodies['water-crossing']) this.gateBodies['water-crossing']=this.platform({id:'water-crossing-open',x:GATES[2].x,y:GATES[2].y,width:GATES[2].width});
    },
    finish() { this.mode = 'playing'; },
  };
}
