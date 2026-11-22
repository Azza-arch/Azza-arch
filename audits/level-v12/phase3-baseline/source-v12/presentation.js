// DOM presentation derives from the Phaser scene; it owns no saved progress.
const $=id=>document.getElementById(id);
let noticeTimer,lastMode,noticePriority=0;
export function notify(text,priority=1){
 if(priority<noticePriority)return;
 const box=$('notice');if(!box)return;
 clearTimeout(noticeTimer);noticePriority=priority;box.textContent=text;
 box.classList.add('show');document.body.dataset.notice='true';
 noticeTimer=setTimeout(()=>{box.classList.remove('show');document.body.dataset.notice='false';noticePriority=0;},2800);
}
const lessons={
 probe:['Gandakan input, kemudian tambah 1.','Contoh: f(2)=2×2+1=5. Setiap input memberikan tepat satu output.'],
 mapping:['Uji keempat-empat input untuk melengkapkan pemetaan.','f(0)=1, f(1)=3, f(2)=5, f(3)=7. Pemetaan ialah hubungan input dengan outputnya.'],
 lift:['Output perlu menjadi 7. Songsangkan operasi tambah 1, kemudian darab 2.','2x+1=7\n2x=6\nx=3. Semakan: f(3)=2×3+1=7.'],
 number:['Sasaran 10: tolak 2 selepas mendarab input dengan 3.','3x−2=10\n3x=12\nx=4. Semakan: g(4)=3×4−2=10.'],
 composition:['Hasil fungsi pertama menjadi input fungsi kedua.','f(x)=2x+1; g(x)=3x−2.\nf kemudian g: 2→5→13.\ng kemudian f: 2→4→9. Urutan mengubah hasil.'],
 'water-composition':['Jejak input 3 melalui f dahulu, kemudian g.','f(3)=2×3+1=7; g(7)=3×7−2=19.\nUrutan songsang: g(3)=7; f(7)=15. Sasaran ialah 19.'],
 'inverse-f':['Mula daripada output 7. Tolak 1, kemudian bahagi 2.','f(x)=2x+1, domain {0,1,2,3}, imej {1,3,5,7}.\nf⁻¹(7)=(7−1)/2=3. Fungsi ini satu-ke-satu pada domain ini. Songsang bukan 1/f(x).'],
 'river-input':['Selesaikan 4x−3=17 dengan operasi songsang.','4x−3=17\n4x=20\nx=5. Semakan: h(5)=4×5−3=17.'],
 'river-order':['Input 2: bandingkan f kemudian g dengan g kemudian f.','f(x)=2x+1; g(x)=3x−2.\nf(2)=5, kemudian g(5)=13.\ng(2)=4, kemudian f(4)=9. Pilih f kemudian g untuk sasaran 13.']
};
export function explain(scene,worked=false){
 const kind=scene.activePuzzle?.kind;
 const key=kind==='river-final'?(scene.solvedGates.has('river-input')?'river-order':'river-input'):kind;
 const lesson=lessons[key];if(!lesson)return;
 if(worked){const box=$('worked-solution');box.hidden=!box.hidden;box.textContent=lesson[1];$('dial-solution').setAttribute('aria-expanded',String(!box.hidden));}
 else $('mechanism-feedback').textContent=lesson[0];
}
export function syncPresentation(scene){
 const mode=scene.mode;
 if(mode!==lastMode){
  lastMode=mode;document.body.dataset.mode=mode;
  $('game').inert=mode!=='playing';
  if(mode==='welcome'){
   scene.visual?.setVisible(false);scene.cameras.main.stopFollow();scene.cameras.main.setScroll(0,700);
   requestAnimationFrame(()=>{if(scene.mode==='welcome')($('continue-btn').hidden?$('start'):$('continue-btn')).focus({preventScroll:true});});
  }
  if(mode!=='playing')scene.prompt?.setVisible(false);
 }
 const count=scene.collectedCoinIds?.size||0;
 $('hud-collection').textContent=`Koleksi ${count} / 9`;
 if(mode!=='playing')return;
 // Old world-space formula/readout sprites remain as data for mechanics,
 // but explanations now live in the deliberate interaction panel.
 for(const key of ['mappingReadout','probeReadout','liftReadout','liftState','numberReadout','numberState','compositionReadout','compositionHeader'])scene[key]?.setVisible(false);
 const ladder=scene.ladderZones.some(z=>Math.abs(scene.player.x-z.x)<48&&scene.player.body.bottom>=z.getData('ladder').top-5&&scene.player.body.bottom<=z.getData('ladder').bottom+5);
 $('touch-controls').classList.toggle('ladder-near',ladder);
 document.querySelectorAll('[data-hold="up"],[data-hold="down"]').forEach(b=>b.hidden=!ladder);
 document.querySelector('[data-action="resetCrate"]').hidden=Math.abs(scene.player.x-810)>350;
 document.querySelector('[data-action="interact"]').hidden=!(scene.nearestTerminal()||scene.nearestSecret()||scene.player.x>8200);
 const tutorial=$('tutorial');let text='';
 scene.tutorialMoved ||= scene.player.x>180;
 scene.tutorialJumped ||= scene.player.body.velocity.y<0;
 if(!scene.tutorialMoved)text=matchMedia('(pointer:coarse)').matches?'Butang arah untuk bergerak. Teroka ke kanan.':'A / D untuk bergerak. Teroka ke kanan.';
 else if(!scene.tutorialJumped&&scene.player.x<300)text=matchMedia('(pointer:coarse)').matches?'Tekan Lompat untuk naik ke teres.':'Space untuk lompat ke teres.';
 else if(scene.player.x>450&&scene.player.x<850&&!scene.crateSwitchActive&&!scene.crateHintSeen){text='Tolak kotak ke plet untuk laluan bonus.';scene.crateHintAt??=scene.time.now;if(scene.time.now-scene.crateHintAt>4500)scene.crateHintSeen=true;}
 tutorial.textContent=text;tutorial.classList.toggle('show',!!text);
}
export function installPresentation(getScene){
 const openHelp=()=>$('help').showModal();
 $('how-to-play').onclick=openHelp;$('pause-help').onclick=openHelp;
 $('help-close').onclick=()=>$('help').close();
 $('dial-solution').onclick=()=>explain(getScene(),true);
 $('restart-checkpoint').onclick=()=>{const s=getScene();s.resumeRun();s.respawn();};
 $('pause-menu').onclick=()=>{const s=getScene();s.writeSave();s.returnToMenu();};
 document.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const dialogs=[...document.querySelectorAll('dialog[open]')];
  const scope=dialogs.at(-1)||(!$('mechanism').hidden?$('mechanism'):!$('welcome').hidden?$('welcome'):null);
  if(!scope)return;
  const nodes=[...scope.querySelectorAll('button,a[href],input,summary,[tabindex="0"]')].filter(n=>!n.disabled&&n.getClientRects().length);
  if(!nodes.length)return;
  const first=nodes[0],last=nodes.at(-1);
  if(event.shiftKey&&(document.activeElement===first||!nodes.includes(document.activeElement))){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&(document.activeElement===last||!nodes.includes(document.activeElement))){event.preventDefault();first.focus();}
 });
}
