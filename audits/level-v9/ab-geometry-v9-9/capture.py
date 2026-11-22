from pathlib import Path
import sys, json
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent
stage = sys.argv[1]
views = {'zone-a':(320,990,1), 'crate':(350,1010,1.7), 'zone-b':(960,980,1), 'grass':(340,1110,2), 'ab-overview':(670,960,.8)}
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    pg=b.new_page(viewport={'width':1440,'height':1000}, reduced_motion='reduce')
    errors=[]
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test',wait_until='networkidle')
    pg.click('#start');pg.wait_for_timeout(500)
    # Lock the same camera coordinates in both runs. No player teleport.
    for name,(x,y,z) in views.items():
        pg.evaluate('''([x,y,z])=>{const c=rooftop.scene.cameras.main;c.stopFollow();c.setZoom(z);c.centerOn(x,y);}''',[x,y,z])
        pg.wait_for_timeout(150)
        pg.locator('.game-frame').screenshot(path=str(OUT/stage/f'{name}.png'))
    pg.set_viewport_size({'width':390,'height':844})
    pg.reload(wait_until='networkidle');pg.click('#start');pg.wait_for_timeout(300)
    pg.screenshot(path=str(OUT/stage/'mobile.png'))
    (OUT/stage/'capture.json').write_text(json.dumps({'views':views,'errors':errors},indent=2))
    b.close()
if stage == 'after':
    for name in views:
        before=Image.open(OUT/'before'/f'{name}.png').convert('RGB')
        after=Image.open(OUT/'after'/f'{name}.png').convert('RGB')
        out=Image.new('RGB',(before.width,before.height+after.height+48),'#eeede8');d=ImageDraw.Draw(out)
        d.text((12,6),'BEFORE - current V9.9 baseline',fill='black');out.paste(before,(0,24))
        d.text((12,before.height+30),'AFTER - A/B collision geometry redesign',fill='black');out.paste(after,(0,before.height+48))
        out.save(OUT/f'{name}-comparison.jpg')
