"""V9.6 required visual output: current/proposed A/B, crate/switch
interaction, main-route overview, optional-route overview."""
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = 'http://127.0.0.1:8765/app/addmath/rooftop/?test'
OUT = Path(__file__).parent / 'artifacts' / 'phase6-real-kenney-layout'
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_context(viewport={'width': 1200, 'height': 700}).new_page()
    pg.on('dialog', lambda d: d.accept())
    pg.goto(URL, wait_until='networkidle')
    pg.wait_for_selector('#welcome:not([hidden])')
    pg.click('#start'); pg.wait_for_timeout(400)

    def frame(x, y, zoom=1):
        pg.evaluate(f"()=>{{const c=rooftop.scene.cameras.main; c.stopFollow(); c.setZoom({zoom}); c.centerOn({x},{y});}}")
        pg.wait_for_timeout(200)

    # Main-route overview: the whole A/B span in one frame.
    frame(650, 1000, 0.55)
    pg.screenshot(path=str(OUT / 'ab-main-route-overview.png'))

    # Optional-route overview: zoomed on the crate puzzle pocket.
    frame(320, 1030, 1.4)
    pg.screenshot(path=str(OUT / 'ab-optional-route-overview.png'))

    # Crate/switch interaction, captured mid-use (crate pushed onto plate).
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(190,1070);}")
    pg.wait_for_timeout(300)
    pg.keyboard.down('d')
    pg.wait_for_function("()=>rooftop.scene.crateSwitchActive", timeout=6000)
    pg.keyboard.up('d')
    pg.wait_for_timeout(200)
    frame(320, 1030, 1.4)
    pg.screenshot(path=str(OUT / 'crate-switch-interaction.png'))

    b.close()
print('done')
