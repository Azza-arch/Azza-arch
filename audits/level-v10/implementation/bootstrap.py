"""One-time creation of isolated V10 batch files; V9 is read-only."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2].parent
game=root/'app/addmath/rooftop'
out=game/'src/v10'
data=json.loads((root/'audits/level-v10/master-architecture/proposed-world.json').read_text())
(out/'candidate-world.json').write_text(json.dumps(data,indent=2))
surfaces=[s for s in data['surfaces'] if s['zone'] in ['A','B','C']]
level="""// V10 Batch 1: exact blueprint geometry. Future zones remain data only.
import { MOTION, PUZZLES as ORIGINAL_PUZZLES, SECRETS as ORIGINAL_SECRETS } from '../level.js';
export { MOTION };
export const WORLD = { width:8400, height:1600, gravity:1400 };
export const BATCH_END = 2916;
export const SPAWN = {x:80, feet:1296};
export const GOAL = {x:2820, feet:972}; // review boundary, NOT full-world completion
export const FIRST_GAP = {x:648,width:108};
export const ZONES = [
 {id:'taman-perumahan',name:'A · Taman Pembelajaran',xStart:0,xEnd:1404},
 {id:'lorong-pekan',name:'B · Kincir Fungsi',xStart:1404,xEnd:2916},
 {id:'cafe-atas-angin',name:'C · Café Atas Angin (pilihan)',xStart:1512,xEnd:1944,yMax:870}
];
"""
level+='export const SURFACES = '+json.dumps(surfaces,indent=2)+';\n'
level+="""export const AB_TERRAIN = SURFACES.filter(s=>s.kind==='solid');
export const DECKS = SURFACES.filter(s=>s.id==='C0');
export const GROUND_RANGES = [[0,648],[756,2052],[2376,2916]];
export const LADDERS = [
 {id:'LC-in',x:1566,top:810,bottom:1134},
 {id:'LC-out',x:1836,top:810,bottom:1080}
];
export const GATES = [{id:'gear',x:2052,y:1080,width:324}];
export const TERMINALS = [
 {id:'probe',kind:'probe',x:1480,feet:1134},
 {id:'p1',kind:'gear',gate:'gear',x:1960,feet:1080},
 {id:'cafe',kind:'mapping',x:1740,feet:810}
];
export const CHECKPOINTS = [
 {id:'cp-a',x:1080,feet:1242},
 {id:'cp-b',x:1900,feet:1080},
 {id:'cp-c',x:1620,feet:810,optional:true},
 {id:'cp-b-exit',x:2790,feet:972,requires:'gear'}
];
export const COLLECTIBLES = [
 {id:'coin-a',x:500,y:1112}, {id:'coin-b',x:2520,y:1020}, {id:'coin-c',x:1880,y:750}
];
export const SECRETS = [{...ORIGINAL_SECRETS[0],x:1900,feet:810,radius:48}];
export const CRATE_PUZZLE = {
 crate:{id:'crate-1',x:270,feet:1296}, floorSwitch:{id:'switch-1',x:450,feet:1296,radius:40},
 platform:{id:'A-ledge',x:414,y:1176,width:162}
};
export const PUZZLES = [{...ORIGINAL_PUZZLES[0],gate:'gear'}];
export const BASELINE_QUESTIONS = ORIGINAL_PUZZLES; // p2/p3 preserved for later batches
"""
(out/'level.js').write_text(level,encoding='utf-8')
html=(game/'index.html').read_text(encoding='utf-8').replace('src/game.js','src/v10/game.js')
html=html.replace('<link rel="stylesheet" href="style.css">','<link rel="stylesheet" href="style.css">\n  <link rel="stylesheet" href="src/v10/world.css">')
html=html.replace('<h1>Lorong Atas Bumbung</h1>','<h1>Lorong Atas Bumbung · V10</h1>')
html=html.replace('Bawa Chill Boy dari rumah ke bukit kecil. Selesaikan tiga mesin fungsi untuk membuka laluan.','Terokai taman, kincir fungsi dan café pilihan. Buka jambatan kincir bersama Chill Boy.')
html=html.replace('<p class="small">Tiada had masa. Tersilap? Cuba lagi.</p>','<p class="small">Pratonton A/B/C · <a href="index.html">Main versi V9 penuh</a></p><button id="import-v9" type="button" hidden>Salin kemajuan V9 yang serasi</button>')
html=html.replace('<div id="touch-controls"','<section id="mechanism" hidden aria-labelledby="mechanism-title"><h2 id="mechanism-title"></h2><p id="mechanism-rule"></p><output id="mechanism-value"></output><p id="mechanism-feedback" role="status" aria-live="polite"></p><div class="mechanism-actions"><button id="dial-less" type="button" aria-label="Kurangkan nilai">−</button><button id="dial-test" type="button">Uji</button><button id="dial-more" type="button" aria-label="Tambah nilai">+</button><button id="dial-hint" type="button">Hint</button><button id="dial-close" type="button">Kembali</button></div></section>\n        <div id="touch-controls"')
html=html.replace('Level 1 Selesai!','Laluan kincir dibuka!').replace('Tiga mesin fungsi diselesaikan. Destinasi di bukit kecil berjaya dicapai.','Taman, kincir dan café tersedia dalam pratonton ini. Sambungan bengkel dan zon D–G belum dibina.')
html=html.replace('Konsep yang dipelajari: mencari output daripada input (f(3) = 7), dan mencari input daripada output yang diketahui (3x − 2 = 10, 4x − 3 = 17).','f(3) = 2(3) + 1 = 7. Jambatan kincir kini bersambung.')
html=html.replace('<button id="dial-hint"','<button id="dial-preview" type="button">Lihat jambatan</button><button id="dial-hint"')
html=html.replace('<div class="touch-group"><button type="button" data-hold="left"','<button type="button" data-action="resetCrate" class="crate-reset">Reset kotak</button><div class="touch-group"><button type="button" data-hold="left"')
(game/'v10.html').write_text(html,encoding='utf-8')
js=(game/'src/game.js').read_text(encoding='utf-8').replace("from './audio.js'","from '../audio.js'")
js=js.replace('WORLD, MOTION, SPAWN','BATCH_END, SURFACES, WORLD, MOTION, SPAWN',1)
js=js.replace('setBounds(0, 0, WORLD.width, WORLD.height','setBounds(0, 0, BATCH_END, WORLD.height')
js=js.replace('setBounds(0, 450, WORLD.width, WORLD.height - 450)','setBounds(0, 300, BATCH_END, 1566 - 300)')
js=js.replace('this.crate.y > 1160','this.crate.y > 1440').replace('this.player.y>1160','this.player.y>1510')
js=js.replace("this.label('Tolak kotak ke plet →', 240, 916, 12);","this.label('Tolak kotak ke plet →', 300, 1060, 14);")
js=js.replace("this.label('C · Reset kotak', 240, 946, 11);","this.label('C · Reset kotak', 300, 1092, 12);")
js=js.replace("'kpp_dirt_mid').setOrigin(.5, 1).setDisplaySize(72, 16)","'kpp_terrain_atlas',107).setOrigin(.5, 1).setDisplaySize(72, 16)")
js=js.replace("'Terokai kejiranan. Cari jalan ke bukit kecil.'","'Terokai taman dan hidupkan kincir fungsi.'")
js=js.replace("'Ikut jalan ke kanan. Tiga mesin fungsi menanti sepanjang laluan.'","'Ikut taman ke kincir. Café di atas ialah laluan pilihan.'")
# The core update movement/animation/crate code remains the V9 implementation.
start=js.index('    const nextCheckpoint=CHECKPOINTS[this.checkpointIndex+1];')
end=js.index('    this.setStep(this.currentZoneIndex());',start)
js=js[:start]+"""    const cpIndex=CHECKPOINTS.findIndex(cp=>Math.abs(this.player.x-cp.x)<48 && Math.abs(body.bottom-cp.feet)<5 && body.blocked.down && (!cp.requires || this.solvedGates.has(cp.requires)));
    if(cpIndex>=0 && cpIndex!==this.checkpointIndex) {
      this.checkpointIndex=cpIndex;
      this.checkpointArts[cpIndex].setFrame(112);
      $('checkpoint-state').textContent='Checkpoint disimpan';
      SFX.checkpoint(audio);this.writeSave();
    }
"""+js[end:]
# Replace only complete class method spans; movement remains inherited verbatim.
def method(name,body):
    global js
    a=js.index('  '+name+'(')
    nxt=re.search(r'^  [A-Za-z]\w*\(',js[a+3:],re.M)
    b=a+3+nxt.start() if nxt else js.index('\n}\n',a)
    js=js[:a]+body.rstrip()+'\n'+js[b:]
for name,body in json.loads((Path(__file__).parent/'methods.json').read_text(encoding='utf-8')).items():method(name,body)
js=js.replace("    if(fatal||!this.player||this.mode!=='playing') return;","    if(this.mode==='mechanism') { this.syncVisual(); return; }\n    if(fatal||!this.player||this.mode!=='playing') return;")
js=js.replace("else if(activeScene.mode==='puzzle') activeScene.closePuzzle();","else if(activeScene.mode==='mechanism') activeScene.closePuzzle();\n  else if(activeScene.mode==='puzzle') activeScene.closePuzzle();")
js=js.replace("this.renderLevelSelect();\n    this.setStep(0);","this.renderLevelSelect();\n    $('import-v9').hidden=!!existingSave || !SaveManager.legacyAvailable();\n    this.setStep(0);")
js=js.replace("function restart() {", """$('dial-less').onclick=()=>activeScene?.changeDial(-1);
$('dial-more').onclick=()=>activeScene?.changeDial(1);
$('dial-test').onclick=()=>activeScene?.testDial();
$('dial-hint').onclick=()=>activeScene?.dialHint();
$('dial-preview').onclick=()=>{
 const s=activeScene;if(s?.mode!=='mechanism')return;
 if(reducedMotion){$('mechanism-feedback').textContent='Tebing dekat x2052 → jambatan 324px → tebing selamat x2376. Output 7 membuka lintasan.';return;}
 s.previewTimer?.remove();s.cameras.main.stopFollow();s.cameras.main.centerOn(2376,970);
 s.previewTimer=s.time.delayedCall(1400,()=>s.cameras.main.startFollow(s.player,true,.14,.16,-85,10));
};
$('dial-close').onclick=()=>activeScene?.closePuzzle();
$('import-v9').onclick=()=>{ if(SaveManager.importLegacy()) { activeScene.refreshMenu(); $('import-v9').hidden=true; announce('Kemajuan serasi disalin. Save V9 tidak berubah.'); } };
document.addEventListener('keydown',event=>{
 if(activeScene?.mode!=='mechanism'||event.repeat) return;
 if(['ArrowLeft','KeyA','ArrowRight','KeyD','Enter','KeyE','KeyH'].includes(event.code)) event.preventDefault();
 if(event.code==='ArrowLeft'||event.code==='KeyA') activeScene.changeDial(-1);
 if(event.code==='ArrowRight'||event.code==='KeyD') activeScene.changeDial(1);
 if(event.code==='Enter'||event.code==='KeyE') activeScene.testDial();
 if(event.code==='KeyH') activeScene.dialHint();
});
function restart() {""")
(out/'game.js').write_text(js,encoding='utf-8')
print('Isolated V10 files generated; no V9 files changed.')
