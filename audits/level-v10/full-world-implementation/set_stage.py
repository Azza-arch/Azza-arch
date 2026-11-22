"""Materialise only the current implementation batch from the approved data."""
from pathlib import Path
import json,sys
root=Path(__file__).resolve().parents[2].parent
out=root/'app/addmath/rooftop/src/v10'
stage=int(sys.argv[1]);assert stage in [2,3,4,5]
d=json.loads((out/'candidate-world.json').read_text())
zones=['A','B','C','D']+(['E'] if stage>=3 else [])+(['F'] if stage>=4 else [])+(['G'] if stage>=5 else [])
surfaces=[s for s in d['surfaces'] if s['zone'] in zones];sids={s['id'] for s in surfaces}
ladders=[l for l in d['ladders'] if l['upper'] in sids and l['lower'] in sids]
cps=[]
for c in d['checkpoints']:
 if c['id']=='cp-e' and stage<3 or c['id']=='cp-f' and stage<4 or c['id']=='cp-g' and stage<5:continue
 req={'cp-d':['gear'],'cp-e':['gear','block'],'cp-f':['gear','block','pipe'],'cp-g':['gear','block','pipe']}.get(c['id'],[])
 cps.append({**c,'requires':req})
cps.insert(3,dict(id='cp-b-exit',x=2790,feet=972,requires=['gear']))
gates=[dict(id=s['gate'],x=s['x'],y=s['y'],width=s['width']) for s in surfaces if s['kind']=='gate']
terms=[dict(id='probe',kind='probe',x=1480,feet=1134),dict(id='p1',kind='gear',gate='gear',x=1960,feet=1080),dict(id='cafe',kind='mapping',x=1740,feet=810),dict(id='p2',kind='block',gate='block',x=3186,feet=972),dict(id='primer',kind='primer',x=3942,feet=972)]
if stage>=3:terms.append(dict(id='pipe',kind='pipe',gate='pipe',x=4806,feet=648))
if stage>=4:terms.append(dict(id='inverse',kind='inverse',x=6650,feet=1242))
if stage>=5:terms.append(dict(id='p3',kind='final',gate='final',x=7632,feet=1296))
js="""// Live V10 geometry, materialised from candidate-world.json. Physics remains V9's.
import {MOTION,PUZZLES as ORIGINAL_PUZZLES,SECRETS as ORIGINAL_SECRETS} from '../level.js';
export {MOTION};
export const WORLD={width:8400,height:1600,gravity:1400};
export const SPAWN={x:80,feet:1296};
export const FIRST_GAP={x:648,width:108};
"""
exports=dict(BUILD_STAGE=stage,BATCH_END={2:4104,3:5670,4:7290,5:8400}[stage],GOAL=dict(x=8316,feet=1296),SURFACES=surfaces,LADDERS=ladders,CHECKPOINTS=cps,GATES=gates,TERMINALS=terms)
allzones=[dict(id=z,name=n,xStart=a,xEnd=b,**({'yMax':870} if z=='cafe-atas-angin' else {})) for z,n,a,b in [('taman-perumahan','A · Taman Pembelajaran',0,1404),('lorong-pekan','B · Kincir Fungsi',1404,2916),('cafe-atas-angin','C · Café Atas Angin (pilihan)',1512,1944),('bengkel-fungsi','D · Bengkel Fungsi',2916,4104),('deretan-bumbung','E · Bumbung Air',4104,5670),('bukit-tanjung-gua','F · Bukit & Arkib Gua',5670,7290),('jambatan-destinasi','G · Sungai & Destinasi',7290,8400)]]
exports['ZONES']=allzones[:stage+2]
coins=[dict(id='coin-a',x=500,y=1112),dict(id='coin-b',x=2520,y=1020),dict(id='coin-c',x=1880,y=750),dict(id='coin-d-note',x=3996,y=696)]
if stage>=3:coins += [dict(id='coin-e1',x=4536,y=750),dict(id='coin-e2',x=5508,y=588)]
if stage>=4:coins += [dict(id='coin-cave',x=6690,y=1182)]
if stage>=5:coins += [dict(id='coin-g',x=8210,y=1236)]
exports['COLLECTIBLES']=coins
for k,v in exports.items():js+='export const '+k+' = '+json.dumps(v,ensure_ascii=False,indent=2)+';\n'
js+="""export const AB_TERRAIN=SURFACES.filter(s=>s.kind==='solid');
export const DECKS=SURFACES.filter(s=>s.kind!=='solid'&&s.kind!=='gate'&&s.id!=='A-ledge');
export const GROUND_RANGES=AB_TERRAIN.map(s=>[s.x,s.x+s.width]);
export const SECRETS=[{...ORIGINAL_SECRETS[0],x:1900,feet:810,radius:48},
 {...ORIGINAL_SECRETS[1],x:3996,feet:756,radius:40},
 ...(BUILD_STAGE>=4?[{...ORIGINAL_SECRETS[2],x:6700,feet:1242,radius:36}]:[])];
export const CRATE_PUZZLE={crate:{id:'crate-1',x:270,feet:1296},floorSwitch:{id:'switch-1',x:450,feet:1296,radius:40},platform:{id:'A-ledge',x:414,y:1176,width:162}};
export const BASELINE_QUESTIONS=ORIGINAL_PUZZLES;
export const PUZZLES=[{...ORIGINAL_PUZZLES[0],gate:'gear'},{...ORIGINAL_PUZZLES[1],gate:'block'},
 ...(BUILD_STAGE>=3?[{id:'pipe',gate:'pipe',formula:'g(f(3))',hints:['Lakukan f dahulu, kemudian g.','f(3)=7, kemudian g(7)=3(7)−2=19.']}]:[]),
 ...(BUILD_STAGE>=5?[{...ORIGINAL_PUZZLES[2],gate:'final'}]:[])];
"""
(out/'level.js').write_text(js,encoding='utf-8');print('Active stage',stage,'surfaces',len(surfaces),'gates',len(gates))
