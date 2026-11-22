from playwright.sync_api import sync_playwright
from pathlib import Path

OUT = Path(__file__).parent / 'artifacts' / 'phase6'
OUT.mkdir(parents=True, exist_ok=True)
URL = 'http://127.0.0.1:8765/app/addmath/rooftop/?test'

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)

    # 1. Fresh user: plain "Mula meneroka" welcome screen
    ctx = b.new_context()
    pg = ctx.new_page()
    pg.on('dialog', lambda d: d.accept())
    pg.goto(URL, wait_until='networkidle')
    pg.wait_for_selector('#welcome:not([hidden])')
    pg.screenshot(path=str(OUT / '1-welcome-fresh-no-save.png'))
    ctx.close()

    # 2. Progress a run to checkpoint 1 + solve M1, reload -> welcome shows Continue/New Adventure
    ctx = b.new_context()
    pg = ctx.new_page()
    pg.on('dialog', lambda d: d.accept())
    pg.goto(URL, wait_until='networkidle')
    pg.wait_for_selector('#welcome:not([hidden])')
    pg.click('#start'); pg.wait_for_timeout(300)
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(950,790);}")
    pg.wait_for_timeout(400)
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(1245,950);}")
    pg.wait_for_timeout(150)
    pg.keyboard.press('e'); pg.wait_for_selector('#puzzle[open]')
    pg.locator('#answer').fill('7'); pg.locator('#answer-form button').click()
    pg.wait_for_selector('#puzzle-continue:not([hidden])')
    pg.locator('#puzzle-continue').click()
    pg.wait_for_timeout(200)
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    pg.screenshot(path=str(OUT / '2-welcome-continue-new-adventure.png'))

    # 3. Click Continue -> player back at checkpoint, M1 lever already shown solved, gate already open
    pg.click('#continue-btn'); pg.wait_for_timeout(400)
    pg.screenshot(path=str(OUT / '3-continued-progress-restored.png'))
    ctx.close()

    # 4. Mobile: welcome screen with Continue option, fits the small viewport
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.on('dialog', lambda d: d.accept())
    pg.goto(URL, wait_until='networkidle')
    pg.wait_for_selector('#welcome:not([hidden])')
    pg.tap('#start'); pg.wait_for_timeout(300)
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(950,790);}")
    pg.wait_for_timeout(400)
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    pg.screenshot(path=str(OUT / '4-mobile-welcome-continue.png'))
    ctx.close()

    b.close()
    print('done')
