from playwright.sync_api import sync_playwright
from pathlib import Path

OUT = Path(__file__).parent / 'artifacts' / 'phase3-1'
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={'width': 900, 'height': 650})
    pg.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test', wait_until='networkidle')
    pg.wait_for_selector('#welcome:not([hidden])')
    pg.click('#start')
    pg.wait_for_timeout(300)
    pg.evaluate("()=>{rooftop.scene.cameras.main.setZoom(2); rooftop.scene.cameras.main.centerOn(4100,1100);}")

    pg.evaluate("""()=>{
        const s = rooftop.scene;
        for (const id of ['workshop-gate','rooftop-gate','final-gate']) s.solvedGates.add(id);
        for (const id of ['p1','p2','p3']) s.machines[id].setTexture('kenney_lever_left');
        for (const g of rooftop.constants.GATES) s.gateBodies[g.id]=s.platform(g);
        const b = s.player.body; b.setAllowGravity(true);
        // exactly at GOAL, already grounded, so the very next update() tick finishes the level
        b.reset(rooftop.constants.ZONES ? 4100 : 4100, 1070);
    }""")
    pg.wait_for_timeout(120)

    print('mode before:', pg.evaluate("()=>rooftop.scene.mode"))
    for i in range(14):
        pg.wait_for_timeout(35)
        mode = pg.evaluate("()=>rooftop.scene.mode")
        dlg = pg.evaluate("()=>document.getElementById('complete').open")
        pg.screenshot(path=str(OUT / f'victory-{i:02d}-mode_{mode}-dialog_{dlg}.png'))
        print(i, 'mode=', mode, 'dialogOpen=', dlg)

    b.close()
    print('done')
