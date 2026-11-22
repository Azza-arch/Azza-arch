"""V8 Phase 2 evidence capture: sequential real screenshots through a jump
arc (apex) and a landing, for the fixed build."""
from playwright.sync_api import sync_playwright
from pathlib import Path

OUT = Path(__file__).parent / 'artifacts' / 'phase2'
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={'width': 700, 'height': 500})
    pg.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test', wait_until='networkidle')
    pg.wait_for_selector('#welcome:not([hidden])')
    pg.click('#start')
    pg.wait_for_timeout(300)
    pg.evaluate("()=>{const s=rooftop.scene; s.cameras.main.setZoom(2.2); s.cameras.main.centerOn(200,1050);}")
    pg.wait_for_timeout(100)
    pg.keyboard.down('Space')
    frames = []
    for i in range(16):
        pg.wait_for_timeout(45)
        st = pg.evaluate("()=>({anim:rooftop.scene.visual.anims.currentAnim&&rooftop.scene.visual.anims.currentAnim.key, grounded:rooftop.scene.player.body.blocked.down})")
        path = OUT / f'jump-{i:02d}-{st["anim"]}.png'
        pg.screenshot(path=str(path))
        frames.append((str(path.name), st))
    pg.keyboard.up('Space')
    for f in frames:
        print(f)
    b.close()
