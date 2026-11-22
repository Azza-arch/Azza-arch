"""One-time isolated bootstrap from the preserved V10 engineering baseline."""
from pathlib import Path
import re,json
ROOT=Path(__file__).resolve().parents[3];game=ROOT/'app/addmath/rooftop';dst=game/'src/v11';dst.mkdir(exist_ok=True)
src=(game/'src/v10/game.js').read_text(encoding='utf-8')
# Retain player physics, UI/menu/audio/touch behavior, replacing world and mechanism methods.
remove={'buildEnvironment','openPuzzle','renderDial','changeDial','testDial','dialHint','previewRoute','closePuzzle','writeSave','continueFromSave','finish','nearestTerminal','answer','renderHints','requestHint'}
lines=src.splitlines(True);keep=[];skip=False
for line in lines:
 m=re.match(r'^  (\w+)\(',line)
 if m:skip=m[1] in remove
 if line.startswith('Object.assign(') or line.startswith('}'):skip=False
 if not skip:keep.append(line)
src=''.join(keep)
src=src.replace("import {buildExtension,buildSecretMarkers}","import {buildWorld,buildSecretMarkers}")
src=src.replace("  buildCratePuzzle() {","  buildEnvironment() { buildWorld(this); }\n  buildCratePuzzle() {")
src=src.replace("BUILD_STAGE>=5 && ","")
src=src.replace("'Terokai taman dan hidupkan kincir fungsi.'","'Terokai taman dan hidupkan pengangkat.'").replace("'Ikut taman ke kincir. Café di atas ialah laluan pilihan.'","'Ikut taman ke pengangkat. Laluan kayu di atas ialah bonus pilihan.'")
src=src.replace("this.label('Tolak kotak ke plet →', 300, 1060, 14);","this.label('Tolak kotak ke plet →', 600, 1100, 14);")
src=src.replace("this.label('C · Reset kotak', 300, 1092, 12);","this.label(touchDevice?'Reset kotak: butang kanan':'C · Reset kotak', 600, 1130, 12);")
src=src.replace("this.tweens.add({targets:coin,y:def.y-10", "if(!reducedMotion) this.tweens.add({targets:coin,y:def.y-10")
# Atlas source at integer scale; crop only lower band rather than squashing 18px vertically.
src=src.replace(".setDisplaySize(54,16).setCrop(0,0,w/3,18)",".setScale(3).setCrop(0,0,w/3,6)")
src=src.replace("'kpp_terrain_atlas',107).setOrigin(.5, 1).setDisplaySize(72, 16).setDepth(11).setTint(0xaeb2a5)","'kpp_terrain_atlas',148).setOrigin(.5, 1).setDisplaySize(54, 54).setDepth(11)")
src=src.replace(".setDisplaySize(72, 16).setY(CRATE_PUZZLE.floorSwitch.feet).setTint(0xaeb2a5)",".setFrame(148).setY(CRATE_PUZZLE.floorSwitch.feet)")
src=src.replace(".setDisplaySize(72, 8).setY(CRATE_PUZZLE.floorSwitch.feet + 4).setTint(0xc9a06a)",".setFrame(149).setY(CRATE_PUZZLE.floorSwitch.feet)")
src=src.replace("if(this.mode!=='playing') return;\n    this.mode='paused';", "if(!['playing','mechanism','mechanism-transition'].includes(this.mode)) return;\n    this.resumeMode=this.mode; this.mode='paused';")
# Inspect resume method after bootstrap; transition resumes without exposing movement.
src=src.replace("assets=await response.json();", "assets=Object.fromEntries(Object.entries(await response.json()).filter(([k])=>k.startsWith('kpp_')||/^(idle|run|jump|fall)-/.test(k)));")
(dst/'game.js').write_text(src,encoding='utf-8')
(dst/'world.css').write_text((game/'src/v10/world.css').read_text(),encoding='utf-8')
h=(game/'v10.html').read_text(encoding='utf-8').replace('src/v10/','src/v11/').replace('V10','V11.1')
h=h.replace('Selamat sampai di rumah!','Laluan A/B/C selesai diterokai.').replace('Kincir, bengkel, aliran air dan jambatan sungai sudah dipulihkan. Pengembaraan A–G selesai.','Pengangkat sudah berfungsi. Ini penghujung binaan Phase 1; kawasan D–G belum dibina dalam V11.1.')
h=h.replace('Satu input, satu output. Fungsi bergubahan menjalankan dua pemetaan mengikut urutan; fungsi songsang membalikkan pemetaan satu-ke-satu.','f(3)=7: satu input menghasilkan satu output. Laluan bonus boleh diterokai tanpa mengunci perjalanan utama.')
h=h.replace('Lebih level akan ditambah pada masa hadapan.','Binaan semakan: A/B/C sahaja. Level penuh belum selesai.')
h=h.replace('Café','Bonus atas').replace('Kincir','Pengangkat').replace('kincir','pengangkat')
(game/'v11.html').write_text(h,encoding='utf-8')
print('V11 isolated bootstrap created')
