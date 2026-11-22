"""Offline blueprint generation only. Never imported by, or writes to, the game."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, math, csv, hashlib, re

OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[2]
GAME=ROOT/'app/addmath/rooftop'
ASSET=GAME/'assets/kenney-pixel-platformer'
FONT=Path('C:/Windows/Fonts/arial.ttf')
BOLD=Path('C:/Windows/Fonts/arialbd.ttf')
def font(n=22,b=False): return ImageFont.truetype(str(BOLD if b else FONT),n)
INK='#263c3d'; MUTED='#536d70'; PAPER='#f6f1e5'; SKY='#c5e9ec'; GOLD='#b35d19'; TEAL='#147f87'; PURPLE='#7553a0'
W,H=8400,1600
surfaces=[]
def s(id,x,y,w,kind='solid',zone='',gate=None):
    surfaces.append(dict(id=id,x=x,y=y,width=w,kind=kind,zone=zone,gate=gate));return id
s('A0',0,1296,648,zone='A');s('A1',756,1296,270,zone='A')
s('A2',1026,1242,108,zone='A');s('A3',1134,1188,108,zone='A');s('A4',1242,1134,162,zone='A')
s('A-ledge',414,1176,162,'optional','A')
s('B0',1404,1134,270,zone='B');s('B1',1674,1080,108,zone='B');s('B2',1782,1080,270,zone='B')
s('G1',2052,1080,324,'gate','B','gear')
s('B3',2376,1080,216,zone='B');s('B4',2592,1026,108,zone='B');s('B5',2700,972,216,zone='B')
s('C0',1512,810,432,'optional','C')
s('D0',2916,972,432,zone='D');s('G2',3348,972,324,'gate','D','block')
s('D1',3672,972,432,zone='D');s('D-upper',3780,756,270,'optional','D')
s('E0',4104,972,216,zone='E');s('E1',4104,756,324,'oneway','E')
s('E-recovery',4320,1080,594,zone='E');s('E2',4536,810,270,'oneway','E');s('E3',4590,648,324,'oneway','E')
s('G3',4914,648,324,'gate','E','pipe');s('E4',5238,648,432,'oneway','E')
s('F0',5724,702,216,zone='F');s('F1',5940,756,108,zone='F');s('F2',6048,810,108,zone='F')
s('F3',6156,864,108,zone='F');s('F4',6264,918,216,zone='F')
s('F-roof',6480,918,270,'oneway','F');s('F-cave',6480,1242,270,zone='F')
s('F5',6750,972,108,zone='F');s('F6',6858,1026,108,zone='F');s('F7',6966,1080,108,zone='F')
s('F8',7074,1134,108,zone='F');s('F9',7182,1188,108,zone='F')
s('G0',7290,1242,216,zone='G');s('G-bank',7506,1296,216,zone='G')
s('G4',7722,1296,378,'gate','G','final');s('G-exit',8100,1296,300,zone='G')
byid={t['id']:t for t in surfaces}
ladders=[dict(id=id,x=x,top=top,bottom=bottom,upper=upper,lower=lower,optional=opt) for id,x,top,bottom,upper,lower,opt in [
    ('LC-in',1566,810,1134,'C0','B0',True),('LC-out',1836,810,1080,'C0','B2',True),
    ('LD-note',3834,756,972,'D-upper','D1',True),('LE-main',4212,756,972,'E1','E0',False),
    ('LE-recover',4374,756,1080,'E1','E-recovery',False),('LE-pipe',4698,648,810,'E3','E2',False),
    ('LF-cave',6588,918,1242,'F-roof','F-cave',True)]]
checkpoints=[dict(id=id,x=x,feet=y,optional=opt) for id,x,y,opt in [
    ('cp-a',1080,1242,False),('cp-b',1900,1080,False),('cp-c',1620,810,True),('cp-d',3024,972,False),
    ('cp-e',4752,648,False),('cp-f',5832,702,False),('cp-g',7560,1296,False)]]
mechanisms=[dict(id=id,x=x,feet=y,kind=kind,label=label) for id,x,y,kind,label in [
    ('crate',270,1296,'crate','Push / plate / ledge'),('probe',1480,1134,'probe','D / codomain / range'),
    ('gear',1960,1080,'gear','P1: f(3) = 7'),('cafe',1740,810,'optional','Optional mapping tray'),
    ('block',3186,972,'block','P2: 3x - 2 = 10'),('primer',3942,972,'pipe','2 > 5 > 13'),
    ('pipe',4806,648,'pipe','g(f(3)) = 19'),('inverse',6650,1242,'optional','Optional inverse'),
    ('final',7632,1296,'final','P3 + familiar pipe order'),('exit',8316,1296,'exit','Home / reflection')]]
zones=[('A','Taman / learning garden',0,1404),('B','Gear mill ascent',1404,2916),('D','Function workshop',2916,4104),
       ('E','Waterworks rooftops',4104,5670),('F','Hill / cave archive',5670,7290),('G','River / destination',7290,8400)]
beats=[
 (1,'A',160,1296,'Welcome / safe movement',25,40,False),
 (2,'A',450,1296,'Crate / optional reward',45,75,True),
 (3,'A',1080,1242,'Gap / stepped ascent',25,40,False),
 (4,'B',1480,1134,'Input-output probe',30,50,False),
 (5,'B',1960,1080,'Function gear',45,75,False),
 (6,'C',1740,810,'Cafe mapping / rest',40,70,True),
 (7,'B',2700,972,'Mill release / workshop reveal',15,25,False),
 (8,'D',3186,972,'Number-block insertion',60,90,False),
 (9,'D',3930,756,'Upper note branch',30,50,True),
 (10,'D',3942,972,'Composition rehearsal',35,55,False),
 (11,'E',4536,810,'Roof rhythm / recovery',20,40,False),
 (12,'E',4806,648,'Pipe order twist',60,90,False),
 (13,'F',5832,702,'Hill overlook / checkpoint',20,30,False),
 (14,'F',6650,1242,'Cave inverse challenge',60,90,True),
 (15,'F',7074,1134,'Descent / river foreshadow',15,25,False),
 (16,'G',7580,1296,'Final input: h(x) = 17',45,75,False),
 (17,'G',7690,1296,'Bridge / familiar synthesis',40,60,False),
 (18,'G',8316,1296,'Arrival / explain a mapping',20,30,False)]
main=['A0','A1','A2','A3','A4','B0','B1','B2','G1','B3','B4','B5','D0','G2','D1','E0','E1','E2','E3','G3','E4','F0','F1','F2','F3','F4','F-roof','F5','F6','F7','F8','F9','G0','G-bank','G4','G-exit']
routes=[]
for a,b in zip(main,main[1:]):
    aa,bb=byid[a],byid[b]; gap=bb['x']-aa['x']-aa['width'];rise=aa['y']-bb['y']
    ladder=next((l for l in ladders if l['lower']==a and l['upper']==b),None)
    kind='ladder' if ladder else 'gate' if bb['kind']=='gate' else 'jump' if gap>0 or rise>0 else 'walk/drop'
    routes.append(dict(source=a,target=b,kind=kind,gap=gap,rise=rise,ladder=ladder['id'] if ladder else None))

# Exact verified constants are read from the live source, not guessed.
src=(GAME/'src/level.js').read_text(encoding='utf-8')
values={k:float(re.search(r'\b'+k+r':\s*([\d.]+)',src).group(1)) for k in ['gravity','speed','acceleration','braking','jump','bodyWidth','bodyHeight','climb']}
g,v,j=values['gravity'],values['speed'],values['jump']
physics=dict(values,maxRise=j*j/(2*g),flatFlight=2*j/g,flatRange=2*j/g*v,runup=v*v/(2*values['acceleration']),stopDistance=v*v/(2*values['braking']))
def flight(rise): return (j+math.sqrt(j*j-2*g*rise))/g
checks=[]
def simulate_jump(a,b):
    # A small source-derived 60Hz point/body envelope check, NOT Phaser.
    rise=a['y']-b['y'];gap=b['x']-a['x']-a['width']
    x=a['x']+a['width']-(60 if rise>0 else 28);y=float(a['y']);vx=v;vy=-j
    target=b['x']+min(48,b['width']/2);dt=1/60;stop=physics['stopDistance']
    minimum=y;wall_clear=True;landed=False
    for frame in range(180):
        oldx,oldy=x,y
        if x>=target-stop: vx=max(0,vx-values['braking']*dt)
        vy=min(850,vy+g*dt);x+=vx*dt;y+=vy*dt;minimum=min(minimum,y)
        if oldx+14 < b['x'] <= x+14 and y>b['y']:wall_clear=False
        if vy>=0 and oldy<=b['y']<=y and x+14>b['x'] and x-14<b['x']+b['width']:
            landed=wall_clear and x-14>=b['x'] and x+14<=b['x']+b['width'];break
    return dict(landed=landed,wallClear=wall_clear,landingX=round(x,2),apexRise=round(a['y']-minimum,2),frames=frame+1)
for r in routes:
    a,b=byid[r['source']],byid[r['target']]
    if r['kind']=='jump':
        sim=simulate_jump(a,b)
        assert sim['landed'],(r,sim)
        checks.append(dict(**r,analyticRange=round(v*flight(r['rise']),2),simulation=sim,status='KINEMATIC PASS; engine proof pending'))
    elif r['kind']=='ladder':
        l=next(l for l in ladders if l['id']==r['ladder']);checks.append(dict(**r,seconds=round((l['bottom']-l['top'])/values['climb'],2),status='endpoint checked'))
    else:checks.append(dict(**r,status='conditional on gate solved' if r['kind']=='gate' else 'connected / descending surface'))
for l in ladders:
    for side,y in [('upper',l['top']),('lower',l['bottom'])]:
        t=byid[l[side]];assert t['x']+14<l['x']<t['x']+t['width']-14 and t['y']==y,l
    # Solid volumes must not intersect a climb shaft above its landing.
    for t in surfaces:
        if t['kind']=='solid' and t['x']<l['x']+14 and t['x']+t['width']>l['x']-14:
            assert t['y']>=l['bottom'],(l,t)
for cp in checkpoints:
    assert any(t['x']+14<cp['x']<t['x']+t['width']-14 and t['y']==cp['feet'] for t in surfaces if t['kind']!='gate'),cp
# More conservative than flat range: body overlap + full coyote allowance.
physics['gateFlatUpperBound']=physics['flatRange']+values['bodyWidth']+v*.110
for t in surfaces:
    if t['kind']=='gate': assert t['width']>physics['gateFlatUpperBound']+40,t
physics['cafeToFarBankReachUpperBound']=v*flight(-270)+28+v*.110
assert 2376-1944>physics['cafeToFarBankReachUpperBound']

data=dict(status='PROPOSED BLUEPRINT ONLY — not engine validated',world=dict(width=W,height=H,tilePitch=54,terrainBottom=1566,cameraMinY=300,respawnPlayerCenterY=1510),
          surfaces=surfaces,ladders=ladders,checkpoints=checkpoints,mechanisms=mechanisms,routes=routes,physics=physics,beats=beats,
          crate=dict(x=270,feet=1296,size=48,plateX=450,plateRadius=40,ledge='A-ledge',reward=[500,1112]))
(OUT/'proposed-world.json').write_text(json.dumps(data,indent=2))
(OUT/'evidence/kinematic-checks.json').write_text(json.dumps(checks,indent=2))
for name,rows in [('surfaces',surfaces),('ladders',ladders),('checkpoints',checkpoints),('mechanisms',mechanisms)]:
    with (OUT/f'proposed-{name}.csv').open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=rows[0].keys());w.writeheader();w.writerows(rows)

atlas=Image.open(ASSET/'Tilemap/tilemap_packed.png').convert('RGBA')
tiles={i:Image.open(ASSET/f'Tiles/tile_{i:04}.png').convert('RGBA') for i in range(180)}
for i,t in tiles.items():
    x=i%20*18;y=i//20*18;crop=atlas.crop((x,y,x+18,y+18))
    # Some exported PNGs retain white RGB under alpha=0 whereas the atlas
    # uses black. Compare visible pixels AND alpha, not invisible RGB.
    for px,py in zip(t.getdata(),crop.getdata()):
        assert px[3]==py[3] and (px[3]==0 or px[:3]==py[:3]),i
def sprite(canvas,idx,x,y,w=54,h=None,alpha=255):
    im=tiles[idx].resize((round(w),round(h or w)),Image.Resampling.NEAREST)
    if alpha!=255:im.putalpha(im.getchannel('A').point(lambda p:p*alpha//255))
    canvas.paste(im,(round(x),round(y)),im)
def text(d,xy,t,n=22,fill=INK,b=False):d.text(xy,t,font=font(n,b),fill=fill)
def tag(d,x,y,t,fill=PAPER,n=20):
    box=d.textbbox((0,0),t,font=font(n,True));d.rounded_rectangle((x-8,y-5,x+box[2]+8,y+box[3]+5),radius=5,fill=fill);text(d,(x,y),t,n,b=True)
def line(d,pts,fill=TEAL,width=5,dashed=False):
    if not dashed:d.line(pts,fill=fill,width=width)
    else:
        for a,b in zip(pts,pts[1:]):
            dist=math.dist(a,b)
            for k in range(0,int(dist),22):
                e=min(k+12,dist);d.line([(a[0]+(b[0]-a[0])*k/dist,a[1]+(b[1]-a[1])*k/dist),(a[0]+(b[0]-a[0])*e/dist,a[1]+(b[1]-a[1])*e/dist)],fill=fill,width=width)
def arrow(d,a,b,fill=TEAL,width=5):
    line(d,[a,b],fill,width);ang=math.atan2(b[1]-a[1],b[0]-a[0]);r=14
    d.polygon([b,(b[0]-r*math.cos(ang-.5),b[1]-r*math.sin(ang-.5)),(b[0]-r*math.cos(ang+.5),b[1]-r*math.sin(ang+.5))],fill=fill)
def tree(im,x,feet,size=1):
    p=54*size
    for row in range(3):sprite(im,136,x-p/2,feet-p*(row+1),p)
    for row,ids in enumerate([[17,18,19],[37,38,39],[57,58,59]]):
        for col,idx in enumerate(ids):sprite(im,idx,x-p*1.5+col*p,feet-p*5+row*p,p)
def gear(im,cx,cy,r=63):
    # Sprite assembly concept: NOT an existing animated cog asset.
    for k in range(8):
        a=k*math.pi/4;piece=tiles[68].resize((42,42),Image.Resampling.NEAREST).rotate(-k*45,Image.Resampling.NEAREST,expand=True)
        im.paste(piece,(int(cx+math.cos(a)*r-piece.width/2),int(cy+math.sin(a)*r-piece.height/2)),piece)
    sprite(im,157,cx-27,cy-27,54)
def surface_tiles(im,t,ox,oy):
    x0=t['x']+ox;y0=t['y']+oy;w=t['width']
    if t['kind']!='solid':
        for xx in range(0,w,54):
            idx=48 if xx==0 else 50 if xx+54>=w else 49
            tile=tiles[idx].resize((54,18),Image.Resampling.NEAREST).crop((0,0,min(54,w-xx),18))
            if t['kind']=='gate':tile.putalpha(tile.getchannel('A').point(lambda p:p*100//255))
            im.paste(tile,(x0+xx,y0),tile)
        return
    solids=[q for q in surfaces if q['kind']=='solid']
    def adjacent(x):return min([q['y'] for q in solids if q['x']<=x<q['x']+q['width']],default=9999)
    for xx in range(0,w,54):
        for yy in range(t['y'],1566,54):
            cw=min(54,w-xx);ch=min(54,1566-yy)
            left=xx==0 and adjacent(t['x']-1)>yy;right=xx+54>=w and adjacent(t['x']+w)>yy
            idx=(20 if left and right else 21 if left else 23 if right else 22) if yy==t['y'] else (120 if left and right else 121 if left else 123 if right else 4+(xx//54+yy//54)%2)
            tile=tiles[idx].resize((54,54),Image.Resampling.NEAREST)
            tile=tile.crop((54-cw if right else 0,0,54 if right else cw,ch))
            im.paste(tile,(x0+xx,oy+yy),tile)
def render_world(kind):
    ox,oy=120,280
    im=Image.new('RGB',(W+240,H+620),PAPER);d=ImageDraw.Draw(im)
    text(d,(120,42),'LORONG ATAS BUMBUNG / V10',52,b=True)
    text(d,(120,110),'MASTER '+('GAMEPLAY BLOCKOUT' if kind=='blockout' else 'KENNEY COMPOSITION'),34,b=True)
    text(d,(120,165),'PROPOSED DESIGN — NOT A PLAYABLE SCREENSHOT  |  8,400 × 1,600 world pixels  |  1 image px = 1 world px inside ruler',24)
    d.rectangle((ox,oy,ox+W,oy+H),fill=SKY)
    # Distant art uses only imported Kenney backgrounds; never collision.
    bg=Image.open(ASSET/'Tiles/Backgrounds/tile_0015.png').convert('RGBA').resize((300,300),Image.Resampling.NEAREST)
    bg.putalpha(bg.getchannel('A').point(lambda p:p//6))
    if kind=='composition':
        for x in range(0,W,300):im.paste(bg,(ox+x,oy+1000),bg)
    if kind=='blockout':
        for x in range(0,W+1,216):d.line((ox+x,oy,ox+x,oy+H),fill='#a9cdd1',width=1)
        for y in range(0,H,108):d.line((ox,oy+y,ox+W,oy+y),fill='#a9cdd1',width=1)
    for zone,name,left,right in zones:
        d.line((ox+left,oy-35,ox+right-18,oy-35),fill=INK,width=3)
        text(d,(ox+left+8,oy-77),zone+' / '+name,25,b=True)
    for x in range(0,W+1,216):
        d.line((ox+x,oy-10,ox+x,oy),fill=INK,width=2);text(d,(ox+x-16,oy-30),str(x),16)
    for y in range(0,H,108):text(d,(25,oy+y-9),str(y),16)
    # Existing family of canopy trees, asymmetrically placed on actual banks.
    for x,y,sz in [(160,1296,1),(930,1296,.8),(1320,1134,.7),(2470,1080,.8),(2840,972,.6),(3750,972,.6),(5890,702,.75),(6360,918,.9),(7140,1134,.8),(8220,1296,.8)]:tree(im,ox+x,oy+y,sz)
    for t in surfaces:surface_tiles(im,t,ox,oy)
    # Blue water is decorative + reset hazard only; no implied swimming.
    for x in range(7722,8100,54):
        sprite(im,33,ox+x,oy+1360)
        for y in range(1414,1566,54):sprite(im,73,ox+x,oy+y)
    for l in ladders:
        for y in range(l['top'],l['bottom'],54):sprite(im,71,ox+l['x']-27,oy+y,54,min(54,l['bottom']-y))
    # Cafe is a sheltered upper rest ledge, not a giant custom house.
    for k in range(5):sprite(im,12 if k==0 else 15 if k==4 else 13,ox+1566+k*54,oy+594,54)
    sprite(im,84,ox+1710,oy+756,54);sprite(im,124,ox+1880,oy+774,36)
    for x,y in [(890,1296),(1350,1134),(2440,1080),(2790,972),(4010,972),(5390,648),(6410,918),(7010,1080),(8190,1296)]:sprite(im,124 if x%3 else 125,ox+x,oy+y-36,36)
    # F is an actual open shaft with a timber roof and a lower floor.
    tag(d,ox+6495,oy+1120,'CAVE / return by LF-cave',n=17)
    sprite(im,151,ox+6690,oy+1170,36)
    # Crate, pressure plate and optional ledge are explicitly proposed.
    sprite(im,9,ox+270-24,oy+1296-48,48);sprite(im,107,ox+450-36,oy+1296-14,72,14)
    sprite(im,151,ox+500-18,oy+1112-18,36)
    # Number block racks / sockets use actual crate + digit frames.
    for x,n in [(3060,2),(3114,3),(3168,4)]:
        sprite(im,9,ox+x,oy+972-48,48);sprite(im,160+n,ox+x+12,oy+972-36,24)
    sprite(im,130,ox+3210,oy+864,54);sprite(im,150,ox+3210,oy+918,54)
    # Fixed pipe assemblies: explicit f then g arrows, no invisible collision.
    for start,y in [(3834,810),(4698,486)]:
        for k,idx in enumerate([93,134,94]):sprite(im,idx,ox+start+k*54,oy+y,54)
        sprite(im,115,ox+start+108,oy+y+54,54)
    gear(im,ox+2120,oy+990)
    # Mount the shaft to the left bank, not a freestanding terrain disk.
    for x in range(2020,2120,36):sprite(im,91,ox+x,oy+1000,36)
    for m in mechanisms:
        if m['kind'] in ['probe','optional','final']:sprite(im,84,ox+m['x']-27,oy+m['feet']-54,54)
    sprite(im,130,ox+8316-27,oy+1296-108,54);sprite(im,150,ox+8316-27,oy+1296-54,54)
    for cp in checkpoints:
        sprite(im,111,ox+cp['x']-18,oy+cp['feet']-54,54)
    # Original Chill Boy at his true .158 visual scale and anchor.
    boy=Image.open(GAME/'assets/chill-boy/idle-00.png').convert('RGBA').resize((104,99),Image.Resampling.LANCZOS)
    im.paste(boy,(round(ox+80-346*.158),round(oy+1296-525*.158)),boy)
    # Plot the MAIN route with rises/jump arcs that use the verified constants.
    for r in routes:
        a,b=byid[r['source']],byid[r['target']]
        if r['kind']=='jump':
            start=a['x']+a['width']-(60 if r['rise']>0 else 28);end=b['x']+min(48,b['width']/2)
            pts=[];T=flight(r['rise'])
            for k in range(25):
                u=k/24;t=T*u;pts.append((ox+start+(end-start)*u,oy+a['y']-j*t+.5*g*t*t-12))
            line(d,pts,GOLD,4)
        elif r['kind']=='ladder':
            l=next(l for l in ladders if l['id']==r['ladder']);arrow(d,(ox+l['x']+35,oy+l['bottom']-35),(ox+l['x']+35,oy+l['top']-20),TEAL,4)
    for t in surfaces:
        if t['kind']=='gate':
            line(d,[(ox+t['x'],oy+t['y']-8),(ox+t['x']+t['width'],oy+t['y']-8)],PURPLE,5,True)
            tag(d,ox+t['x']+12,oy+t['y']+36,t['id']+' · '+str(t['width'])+'px · SOLVED STATE ONLY',n=16)
        if kind=='blockout':
            line(d,[(ox+t['x'],oy+t['y']),(ox+t['x']+t['width'],oy+t['y'])],INK,3)
            tag(d,ox+t['x']+5,oy+t['y']+60,t['id']+f" ({t['x']},{t['y']}) w{t['width']}",n=14)
    for l in ladders:
        if l['optional']:line(d,[(ox+l['x']-36,oy+l['top']),(ox+l['x']-36,oy+l['bottom'])],PURPLE,4,True)
        if kind=='blockout':tag(d,ox+l['x']+34,oy+(l['top']+l['bottom'])/2,l['id']+f" x{l['x']} {l['top']}–{l['bottom']}",n=15)
    for cp in checkpoints:tag(d,ox+cp['x']-30,oy+cp['feet']+110,cp['id'],n=16)
    for m in mechanisms:
        if m['id']=='crate':continue
        # Offset mechanism labels away from the mathematical diagram itself.
        tag(d,ox+m['x']-70,oy+m['feet']-155,m['label'],n=18)
    for n,zone,x,y,title,lo,hi,opt in beats:
        yy=oy+y-240 if zone!='C' and n!=14 else oy+y-175
        xx=ox+x
        d.line((xx,yy+19,xx,oy+y-105),fill=PURPLE if opt else INK,width=2)
        d.ellipse((xx-21,yy-21,xx+21,yy+21),fill=PURPLE if opt else INK)
        text(d,(xx-13,yy-14),f'{n:02}',21,fill='white',b=True)
    tag(d,ox+1512,oy+490,'C / OPTIONAL UPPER CAFE — both exits before G1',n=22)
    tag(d,ox+3780,oy+570,'OPTIONAL NOTE BRANCH',n=18)
    # Legend and explicit interpretation outside the map, never masquerading as HUD.
    y=oy+H+35
    text(d,(120,y),'LEGEND',27,b=True)
    items=[(22,'Solid grass/dirt = full volume to y1566'),(49,'Timber = one-way surface (18px visual)'),(71,'Ladder = exact top/bottom table'),(151,'Gold arc = jump / collectible guidance'),(111,'Flag = checkpoint; stable ID'),(68,'Gear teeth = sprite assembly concept; new code required')]
    for k,(idx,label) in enumerate(items):
        xx=120+k*1335;sprite(im,idx,xx,y+52,48);text(d,(xx+60,y+60),label,20)
    text(d,(120,y+130),'Purple dashed bridge = conditional proposed connection, not present while locked. Purple branch = optional. Numbered circles = beats 01–18. Sky/tree/pipe art has no collision unless explicitly tabled.',22)
    text(d,(120,y+172),'Planning proof: source-derived kinematics and endpoint checks only. Natural-input Phaser validation remains a future implementation acceptance gate. Art: imported Kenney Pixel Platformer CC0; original Chill Boy retained.',21,fill=MUTED)
    path=OUT/('master-gameplay-blockout.png' if kind=='blockout' else 'master-kenney-composition.png');im.save(path)
    preview=im.copy();preview.thumbnail((2400,900));preview.save(OUT/'review'/(path.stem+'-overview.png'))
    if kind=='composition':
        for label,left,right in [('AB-C',0,2916),('D-E',2916,5670),('F-G',5670,8400)]:
            im.crop((ox+left,oy+400,ox+right,oy+1600)).save(OUT/'review'/f'composition-{label}.png')
    return im

def topology():
    im=Image.new('RGB',(2600,1700),PAPER);d=ImageDraw.Draw(im)
    text(d,(90,55),'V10 / MASTER WORLD TOPOLOGY',54,b=True)
    text(d,(90,125),'A coherent water-powered neighbourhood: learn the mapping, restore the route, reach the river.',25)
    text(d,(90,166),'DESIGN ONLY · schematic distances; exact scale and coordinates are in the blockout · 18 beats / 7 zones',21,fill=MUTED)
    points={'A':(200,650),'B':(660,650),'D':(1120,650),'E':(1580,650),'F':(2040,650),'G':(2420,650),'C':(660,320),'note':(1120,1020),'cave':(2040,1080)}
    for a,b in zip(['A','B','D','E','F'],['B','D','E','F','G']):
        ax,ay=points[a];bx,by=points[b];arrow(d,(ax+90,ay),(bx-95,by),TEAL,8)
    for base,branch in [('B','C'),('D','note'),('F','cave')]:
        ax,ay=points[base];bx,by=points[branch]
        line(d,[(ax-45,ay-70 if by<ay else ay+90),(bx-45,by+85 if by<ay else by-100)],PURPLE,6,True)
        line(d,[(bx+45,by+85 if by<ay else by-100),(ax+45,ay-70 if by<ay else ay+90)],PURPLE,6,True)
    for zone,(x,y) in points.items():
        for k in range(-2,3):sprite(im,21 if k==-2 else 23 if k==2 else 22,x+k*42-21,y+58,42)
        if zone in ['A','F']:tree(im,x,y+58,.48)
        elif zone=='B':gear(im,x,y-12,39)
        elif zone=='D':sprite(im,9,x-50,y,48);sprite(im,130,x+10,y-50,54);sprite(im,150,x+10,y+4,54)
        elif zone=='E':
            for k,idx in enumerate([93,134,94]):sprite(im,idx,x-75+k*50,y-30,50)
        elif zone=='G':
            for k in range(3):sprite(im,33,x-75+k*50,y+100,50)
            sprite(im,130,x-27,y-50,54);sprite(im,150,x-27,y+4,54)
        elif zone=='C':sprite(im,128,x-50,y-20,60);sprite(im,84,x+20,y-5,54)
        else:sprite(im,84,x-27,y-20,54);sprite(im,151,x+40,y,36)
        labels={'A':('A  Learning garden','01–03 · safe start / optional crate'),'B':('B  Gear mill','04–07 · G1: f(3)=7'),'C':('C  Upper cafe','06 · optional · two return ladders'),
                'D':('D  Function workshop','08–10 · G2: numbered block'),'E':('E  Roof waterworks','11–12 · G3: composition pipes'),'F':('F  Hill / cave','13–15 · descent / inverse branch'),
                'G':('G  River / home','16–18 · G4: familiar synthesis'),'note':('Upper service ledge','09 · secret note · returns to D'),'cave':('Cave archive','14 · inverse / treasure · returns to F')}
        title,desc=labels[zone]
        text(d,(x-145,y+124),title,25,b=True);text(d,(x-145,y+160),desc,18)
    tag(d,850,550,'G1',n=22);tag(d,1305,550,'G2',n=22);tag(d,1770,550,'G3',n=22);tag(d,2250,550,'G4',n=22)
    text(d,(300,220),'Main spine: A → B → D → E → F → G. C never gates progression.',27,b=True)
    text(d,(95,1330),'READING THE MAP',28,b=True)
    for i,t in enumerate(['Teal arrows: main progression; every gate has a nearby safe input station and checkpoint.',
                          'Purple paired paths: optional upper/cave branches; return before the next locked cut.',
                          'Active beat targets: main about 8–12 minutes; branches add 3–5 minutes. Travel/retries add time; not measured.',
                          'Solid banks, timber crossings, a working mill, roof pipes and a river share one architectural story.',
                          'No optional branch bridges G1/G2/G3/G4. Wrong answers return the local input, not the player to the beginning.']):text(d,(95,1380+i*42),t,23)
    im.save(OUT/'master-world-topology.png')

def atlas_sheet():
    im=Image.new('RGB',(2000,1150),PAPER);d=ImageDraw.Draw(im)
    text(d,(25,15),'ACTUAL IMPORTED KENNEY BASE ATLAS / 180 frames / filename indices',27,b=True)
    for idx in range(180):
        x=idx%20*100;y=idx//20*120+65
        sprite(im,idx,x+14,y,72);text(d,(x+20,y+77),f'{idx:03}',20)
    im.save(OUT/'evidence/verified-atlas-contact-sheet.png')

if __name__=='__main__':
    atlas_sheet();topology();render_world('blockout');render_world('composition')
    mainlo=sum(b[5] for b in beats if not b[7]);mainhi=sum(b[6] for b in beats if not b[7])
    optlo=sum(b[5] for b in beats if b[7]);opthi=sum(b[6] for b in beats if b[7])
    (OUT/'evidence/generation-summary.json').write_text(json.dumps(dict(surfaces=len(surfaces),ladders=len(ladders),beats=len(beats),mainSeconds=[mainlo,mainhi],optionalSeconds=[optlo,opthi],physics=physics,sourceAtlasFramesVerified=180),indent=2))
    print('Blueprint only:',len(surfaces),'surfaces;',len(ladders),'ladders;',len(beats),'beats. Main duration seconds:',mainlo,mainhi)
