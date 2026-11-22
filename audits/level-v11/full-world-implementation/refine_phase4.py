from pathlib import Path
root=Path(__file__).resolve().parents[3]
base=root/'app/addmath/rooftop/src/v11'
p=base/'level.js';s=p.read_text(encoding='utf-8-sig')
for a,b in [("id:'F-cave-floor',x:6136,y:1296","id:'F-cave-floor',x:6136,y:1134"),("x:6226,top:918,bottom:1296","x:6226,top:918,bottom:1134"),("x:6478,top:918,bottom:1296","x:6478,top:918,bottom:1134"),("kind:'inverse-f',x:6400,feet:1296","kind:'inverse-f',x:6400,feet:1134"),("id:'f-cave-gem',x:6360,y:1242","id:'f-cave-gem',x:6360,y:1080"),("id:'f-inverse',x:6400,feet:1296","id:'f-inverse',x:6400,feet:1134")]:s=s.replace(a,b)
s=s.replace('// V11.1 Phase 1 only.','// V11 Phase 4: continuous Level 1, rooms R01-R16.')
p.write_text(s,encoding='utf-8')
p=base/'environment.js';s=p.read_text(encoding='utf-8-sig');lines=[]
for line in s.splitlines(True):
 try: line=line.encode('cp1252').decode('utf-8')
 except (UnicodeEncodeError,UnicodeDecodeError): pass
 lines.append(line)
s=''.join(lines).replace('post(6136,918,1296)','post(6136,918,1134)').replace('tile(85,6400,1194,11)','tile(85,6400,1080,11)').replace(' // Zone G river is scenery only.', ' s.sceneryTree(6020,864);\n // Zone G river is scenery only.')
p.write_text(s,encoding='utf-8')
for name in ['phase4_natural_input.py','phase4_state_checks.py']:
 p=Path(__file__).with_name(name);s=p.read_text(encoding='utf-8-sig')
 s=s.replace("climb('down',1296); shot('F-R14-interior')","climb('down',1134); shot('F-R14-interior')")
 s=s.replace('player.body.bottom===1296','player.body.bottom===1134')
 p.write_text(s,encoding='utf-8')
p=Path(__file__).with_name('v11_phase4.test.mjs');s=p.read_text(encoding='utf-8-sig').replace("l.id==='F-cave-entry'&&l.top===918&&l.bottom===1296","l.id==='F-cave-entry'&&l.top===918&&l.bottom===1134");p.write_text(s,encoding='utf-8')
