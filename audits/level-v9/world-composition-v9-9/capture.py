from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
import json, hashlib

OUT = Path(__file__).resolve().parent
GAME = OUT.parents[2] / 'app/addmath/rooftop'
m = json.loads((GAME/'assets/manifest.json').read_text())
p = GAME/'assets/provenance.json'
records = json.loads(p.read_text())
for key, path in m.items():
    if key in {r['key'] for r in records}: continue
    im = Image.open(GAME/path)
    records.append(dict(key=key, source='Imported official Kenney Pixel Platformer Base pack (CC0)', entry=path.split('kenney-pixel-platformer/')[1], path=path, dimensions=list(im.size), alphaBounds=list(im.getbbox() or (0,0,0,0)), sha256=hashlib.sha256((GAME/path).read_bytes()).hexdigest()))
p.write_text(json.dumps(records, indent=2)+'\n')
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width':1100,'height':650})
    page.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test', wait_until='networkidle')
    page.click('#start')
    page.wait_for_timeout(400)
    for zone,(x,y) in zip('ABCDEFG', [(300,1030),(950,950),(900,850),(1650,980),(2300,700),(3100,850),(3900,1050)]):
        page.evaluate('''([x,y])=>{const c=rooftop.scene.cameras.main;c.stopFollow();c.setZoom(1);c.centerOn(x,y);}''', [x,y])
        page.wait_for_timeout(150)
        page.screenshot(path=str(OUT/f'screenshots/final-{zone}.png'))
    page.set_viewport_size({'width':390,'height':844})
    page.reload(wait_until='networkidle')
    page.click('#start'); page.wait_for_timeout(500)
    page.screenshot(path=str(OUT/'screenshots/mobile.png'))
    browser.close()
sheet = Image.new('RGB',(1100, 7*350),'#eee')
d=ImageDraw.Draw(sheet)
for n, zone in enumerate('ABCDEFG'):
    im=Image.open(OUT/f'screenshots/final-{zone}.png'); im.thumbnail((1050,320))
    sheet.paste(im,(25,n*350+25)); d.text((25,n*350+5),f'Zone {zone} - browser camera capture, zoom 1',fill='black')
sheet.save(OUT/'zone-contact-sheet.jpg')
for zone in 'AB':
    out=Image.new('RGB',(1100,1340),'#eee');d=ImageDraw.Draw(out)
    for n,label in enumerate(['before','final']):
        out.paste(Image.open(OUT/f'screenshots/{label}-{zone}.png'),(0,n*670+20))
        d.text((10,n*670+3),f'{zone}: {label} (before = resumed session baseline)',fill='black')
    out.save(OUT/f'{zone}-before-after.jpg')
roles={1:'grass left',2:'grass middle',3:'grass right',22:'grass alternate',4:'dirt fill',5:'dirt alternate',21:'inner terrain variant',23:'outer terrain variant',48:'timber left',49:'timber middle',50:'timber right',71:'ladder',9:'crate',151:'coin',27:'key',130:'door top',150:'door bottom',84:'sign',33:'water top',53:'water fill',124:'small plant',125:'tall plant',126:'conifer',128:'mushroom',129:'mushroom tall',144:'flower',136:'trunk',17:'canopy top left',18:'canopy top middle',19:'canopy top right',37:'canopy left',38:'canopy center',39:'canopy right',57:'canopy bottom left',58:'canopy bottom',59:'canopy bottom right',105:'fence'}
out=Image.new('RGB',(800,((len(roles)+4)//5)*120),'#dbe8ed'); d=ImageDraw.Draw(out)
for i,(idx,role) in enumerate(roles.items()):
    im=Image.open(GAME/f'assets/kenney-pixel-platformer/Tiles/tile_{idx:04}.png').convert('RGBA').resize((72,72),Image.Resampling.NEAREST)
    x=(i%5)*160;y=(i//5)*120;out.paste(im,(x+40,y),im);d.text((x+5,y+76),f'{idx}: {role}',fill='black')
out.save(OUT/'verified-asset-role-contact-sheet.png')

