from pathlib import Path
import json
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parent
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    pg=b.new_page()
    pg.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test',wait_until='networkidle');pg.click('#start');pg.wait_for_timeout(300)
    def st(): return pg.evaluate('''()=>{let s=rooftop.scene,p=s.player.body,c=s.crate.body;return {player:s.player.x,crate:s.crate.x,crateVx:c.velocity.x,art:s.crateArt.x,separation:c.left-p.right,touch:p.touching,blocked:p.blocked};}''')
    results={'initial':st()}
    pg.wait_for_timeout(1200);results['idle']=st()
    pg.keyboard.down('d');pg.wait_for_timeout(200);pg.keyboard.up('d');pg.wait_for_timeout(200);results['walk_without_contact']=st()
    pg.keyboard.down('d');pg.wait_for_function('()=>rooftop.scene.crateSwitchActive');pg.keyboard.up('d');pg.wait_for_timeout(400);results['contact_push']=st()
    pg.keyboard.down('a');pg.wait_for_timeout(250);pg.keyboard.up('a');pg.wait_for_timeout(300);results['walk_away']=st()
    pg.wait_for_timeout(1000);results['settled']=st()
    (OUT/'logs/crate-before.json').write_text(json.dumps(results,indent=2))
    print(json.dumps(results,indent=2));b.close()
