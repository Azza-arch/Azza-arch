// DOM presentation derives from the Phaser scene; it owns no saved progress.
import {COLLECTIBLES,GOAL} from './level.js';
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
 'c-help':['Perhatikan dua papan dahulu, kemudian uji satu input lagi untuk sahkan corak.','f(x)=2x+1. 0→1, 1→3, 2→5, 3→7. Output bertambah 2 setiap kali input bertambah 1.'],
 lift:['Petunjuk: fikir terbalik. Output 7 tolak 1 = 6, kemudian bahagi 2.','2x + 1 = 7\n2x = 6\nx = 3\nSemakan: f(3) = 2(3) + 1 = 7 ✓'],
 number:['g(x)=3x−2: darab input dengan 3, kemudian tolak 2. Cari blok yang menghasilkan output 10.','3x−2=10\n3x=12\nx=4. Semakan: g(4)=3×4−2=10.'],
 composition:['Hasil fungsi pertama menjadi input fungsi kedua.','f(x)=2x+1; g(x)=3x−2.\nf kemudian g: 2→5→13.\ng kemudian f: 2→4→9. Urutan mengubah hasil.'],
 'water-help':['Jejak input 3 melalui mesin pertama, kemudian mesin kedua. Paip tidak berubah arah — hanya tugas F dan G bertukar tempat.','F dahulu: f(3)=2×3+1=7, kemudian g(7)=3×7−2=19.\nG dahulu: g(3)=3×3−2=7, kemudian f(7)=2×7+1=15.\nKedua-dua susunan memberi nilai pertengahan 7, tetapi atas sebab berbeza — mesin yang berbeza menghasilkannya. Sasaran akhir ialah 19.'],
 'inverse-f':['Mula daripada output 7. Tolak 1, kemudian bahagi 2.','f(x)=2x+1, domain {0,1,2,3}, imej {1,3,5,7}.\nf⁻¹(7)=(7−1)/2=3. Fungsi ini satu-ke-satu pada domain ini. Songsang bukan 1/f(x).'],
 'river-input':['Selesaikan 4x−3=17 dengan operasi songsang.','4x−3=17\n4x=20\nx=5. Semakan: h(5)=4×5−3=17.'],
 'river-order':['Input 2: bandingkan f kemudian g dengan g kemudian f.','f(x)=2x+1; g(x)=3x−2.\nf(2)=5, kemudian g(5)=13.\ng(2)=4, kemudian f(4)=9. Pilih f kemudian g untuk sasaran 13.']
};
// Small, short checkpoint confirmation (top-left under the HUD, ~1.8s).
let cpTimer;
export function showCheckpointToast(text='Checkpoint disimpan'){
 const t=$('cp-toast');if(!t)return;t.lastElementChild.textContent=text;t.hidden=false;
 t.classList.remove('show');void t.offsetWidth;t.classList.add('show');
 clearTimeout(cpTimer);cpTimer=setTimeout(()=>{t.classList.remove('show');setTimeout(()=>{if(!t.classList.contains('show'))t.hidden=true;},250);},1800);
}
// World-anchored contextual prompt (key cap + verb). scene.worldPrompt is
// {key,text,x,y} in world coordinates, or null.
export function setWorldPrompt(scene,wp){scene.worldPrompt=wp;}
function placeWorldPrompt(scene){
 const el=$('world-prompt');if(!el)return;const wp=scene.worldPrompt;
 if(!wp||scene.mode!=='playing'){el.hidden=true;return;}
 if($('world-prompt-key').textContent!==wp.key)$('world-prompt-key').textContent=wp.key;
 if($('world-prompt-text').textContent!==wp.text)$('world-prompt-text').textContent=wp.text;
 const cam=scene.cameras.main,c=scene.game.canvas.getBoundingClientRect(),fr=document.querySelector('.game-frame').getBoundingClientRect();
 const k=c.width/scene.scale.width;
 let x=c.left-fr.left+(wp.x-cam.worldView.x)*cam.zoom*k,y=c.top-fr.top+(wp.y-cam.worldView.y)*cam.zoom*k;
 el.hidden=false;const half=el.offsetWidth/2+10;x=Math.max(half,Math.min(fr.width-half,x));y=Math.max(el.offsetHeight+70,y);
 el.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-100%)`;
}
export function explain(scene,worked=false){
 const kind=scene.activePuzzle?.kind;
 const key=kind==='lift-help'?'lift':kind==='river-help'?(scene.solvedGates.has('river-input')?'river-order':'river-input'):kind;
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
   // UI pass: the menu now shows the real Section 01–02 world behind the
   // title (oak, crate garden, root path) instead of a separate canvas.
   scene.visual?.setVisible(false);scene.cameras.main.stopFollow();requestAnimationFrame(()=>scene.frameMenu?.());
   requestAnimationFrame(()=>{if(scene.mode==='welcome'&&!document.body.classList.contains('world-map-open'))$('play-main').focus({preventScroll:true});});
   $('world-prompt').hidden=true;
  }
  if(mode!=='playing')scene.prompt?.setVisible(false);
 }
 const count=scene.collectedCoinIds?.size||0;
 const coinText=`${count} / ${COLLECTIBLES.length}`;if($('hud-collection').textContent!==coinText){$('hud-collection').textContent=coinText;$('hud-collection').setAttribute('aria-label',`Syiling ${coinText}`);}
 placeWorldPrompt(scene);
 if(mode!=='playing')return;
 // Old world-space formula/readout sprites remain as data for mechanics,
 // but explanations now live in the deliberate interaction panel.
 for(const key of ['cReadout','probeReadout','liftReadout','liftState','numberReadout','numberState','compositionReadout','compositionHeader','waterStage1','waterStage2','waterTag','waterResultLabel','waterOutputLabel'])scene[key]?.setVisible(false);
 // No persistent world-space equation banner after solving the gate.
 if(scene.numberReadoutShown){scene.numberReadout?.setVisible(true);scene.numberState?.setVisible(true);}
 if(scene.eReadoutShown){scene.waterStage1?.setVisible(true);scene.waterStage2?.setVisible(true);scene.waterTag?.setVisible(true);scene.waterResultLabel?.setVisible(true);}
 if(scene.eOutputShown)scene.waterOutputLabel?.setVisible(true);
 const ladder=scene.ladderZones.some(z=>Math.abs(scene.player.x-z.x)<48&&scene.player.body.bottom>=z.getData('ladder').top-5&&scene.player.body.bottom<=z.getData('ladder').bottom+5);
 $('touch-controls').classList.toggle('ladder-near',ladder);
 document.querySelectorAll('[data-hold="up"],[data-hold="down"]').forEach(b=>b.hidden=!ladder);
 document.querySelector('[data-action="resetCrate"]').hidden=!(scene.crate&&scene.player.x<900&&Math.abs(scene.crate.x-scene.crateStart.x)>8);
 document.querySelector('[data-action="interact"]').hidden=!(scene.nearestTerminal()||scene.nearestSecret()||scene.sawmillReady||(Math.abs(scene.player.x-GOAL.x)<62&&scene.solvedGates.has('lift'))); // Phase C: + sawmill / jetty lever
 // Let the spatial design teach movement; no persistent tutorial ribbon.
 const tutorial=$('tutorial');tutorial.textContent='';tutorial.classList.remove('show');
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
