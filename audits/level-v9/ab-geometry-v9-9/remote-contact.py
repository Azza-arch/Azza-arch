from pathlib import Path
import json,sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(headless=True);pg=b.new_page()
    pg.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test',wait_until='networkidle');pg.click('#start')
    pg.keyboard.down('d');pg.wait_for_function('()=>rooftop.scene.player.x>=510')
    pg.keyboard.press('Space');pg.wait_for_function('()=>rooftop.scene.player.x>=680');pg.keyboard.up('d')
    pg.wait_for_function('()=>rooftop.scene.player.body.blocked.down')
    pg.keyboard.press('c');pg.wait_for_timeout(200)
    start=pg.evaluate('rooftop.scene.crate.x')
    pg.keyboard.down('d');pg.wait_for_timeout(1200)
    result=pg.evaluate('''()=>{const s=rooftop.scene,b=s.player.body;return {player:s.player.x,crate:s.crate.x,velocity:s.crate.body.velocity.x,touching:b.touching,blocked:b.blocked,art:s.crateArt.x}}''')
    pg.keyboard.up('d');result['initialCrate']=start
    Path(__file__).with_name('logs').joinpath(f'remote-contact-{sys.argv[1]}.json').write_text(json.dumps(result,indent=2))
    print(result)
    if sys.argv[1]=='after': assert abs(result['crate']-start)<.1
    b.close()
