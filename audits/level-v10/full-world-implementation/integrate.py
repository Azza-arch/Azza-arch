from pathlib import Path
root=Path(__file__).resolve().parents[2].parent
game=root/'app/addmath/rooftop';src=game/'src/v10/game.js'
s=src.read_text(encoding='utf-8')
s=s.replace('import { BATCH_END,','import { BUILD_STAGE, BATCH_END,',1)
s="import {buildExtension,buildSecretMarkers} from './environment.js';\nimport {createMechanismMethods} from './mechanisms.js';\n"+s
s=s.replace("    this.gateStubs={};this.probeSeen=new Set();this.mappingDone=false;","    this.gateStubs={};this.probeSeen=new Set();this.mappingDone=false;this.finalLatches={input:false,composition:false};")
s=s.replace("    tile(85,2760,918,54,54,11);this.label('Hujung pratonton A/B/C',2760,870,16);","    tile(85,2760,918,54,54,11);this.label('Bengkel fungsi →',2760,870,16);\n    buildExtension(this);")
a=s.index('  buildSecrets() {');b=s.index('  setStep(',a)
s=s[:a]+"  buildSecrets() { buildSecretMarkers(this); }\n"+s[b:]
s=s.replace("    if(this.mode==='mechanism') { this.syncVisual(); return; }","    if(this.mode==='mechanism'||this.mode==='mechanism-transition') { this.elapsed+=delta; this.syncVisual(); return; }")
s=s.replace("(!cp.requires || this.solvedGates.has(cp.requires))","(!cp.requires || cp.requires.every(id=>this.solvedGates.has(id)))")
s=s.replace("if(this.player.y>1510 || inOpenGate)","if(this.player.y>1510 || inOpenGate || (BUILD_STAGE>=5&&this.player.x>7722&&this.player.x<8100&&body.bottom>1360))")
s=s.replace("const atExit = this.solvedGates.size>=PUZZLES.length", "const atExit = BUILD_STAGE>=5 && this.solvedGates.size>=GATES.length")
s=s.replace("$('dial-less').onclick", "Object.assign(Rooftop.prototype,createMechanismMethods({$,clearControls,audio,SFX,reducedMotion,touchDevice}));\n$('dial-less').onclick",1)
a=s.index("$('dial-preview').onclick=");b=s.index("$('dial-close').onclick",a)
s=s[:a]+"$('dial-preview').onclick=()=>activeScene?.previewRoute();\nfor(const b of document.querySelectorAll('[data-token]'))b.onclick=()=>activeScene?.chooseToken(Number(b.dataset.token));\nfor(const b of document.querySelectorAll('[data-order]'))b.onclick=()=>activeScene?.chooseOrder(b.dataset.order==='gf');\n"+s[b:]
# No old rendering methods are called, but remove them to keep the V10 renderer unambiguous.
for name in ['buildABTerrain','kppLandMassFill','supportPiers','rockMass','caveMouth','riverBand','buildGateStubs','buildScenery','buildDistantBackdrop']:
 import re
 a=s.index('  '+name+'(');m=re.search(r'^  [A-Za-z]\w*\(',s[a+3:],re.M);b=a+3+m.start();s=s[:a]+s[b:]
src.write_text(s,encoding='utf-8')
p=game/'v10.html';h=p.read_text(encoding='utf-8')
h=h.replace('<div class="mechanism-actions">','<div id="token-options" class="mechanism-actions" hidden aria-label="Blok input"><button type="button" data-token="2">Blok 2</button><button type="button" data-token="3">Blok 3</button><button type="button" data-token="4">Blok 4</button></div><div id="pipe-options" class="mechanism-actions" hidden aria-label="Susunan fungsi"><button type="button" data-order="fg">f kemudian g</button><button type="button" data-order="gf">g kemudian f</button></div><div class="mechanism-actions">')
h=h.replace('Terokai taman, kincir fungsi dan café pilihan. Buka jambatan kincir bersama Chill Boy.','Terokai taman, bengkel dan bumbung air. Pulihkan mekanisme fungsi dan bawa Chill Boy menyeberangi sungai.')
h=h.replace('Pratonton A/B/C ·','Dunia V10 ·').replace('Laluan kincir dibuka!','Selamat sampai di rumah!')
h=h.replace('Taman, kincir dan café tersedia dalam pratonton ini. Sambungan bengkel dan zon D–G belum dibina.','Kincir, bengkel, aliran air dan jambatan sungai sudah dipulihkan. Pengembaraan A–G selesai.')
h=h.replace('f(3) = 2(3) + 1 = 7. Jambatan kincir kini bersambung.','Satu input, satu output. Fungsi bergubahan menjalankan dua pemetaan mengikut urutan; fungsi songsang membalikkan pemetaan satu-ke-satu.')
p.write_text(h,encoding='utf-8')
print('Full-world runtime integrated; only active-stage data spawns.')
