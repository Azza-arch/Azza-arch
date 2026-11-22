from playwright.sync_api import sync_playwright
from pathlib import Path

OUT = Path(__file__).parent / 'artifacts' / 'phase5'
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)

    # Desktop: wrong answer (shows the fixed, non-revealing message + nudge)
    pg = b.new_page(viewport={'width': 900, 'height': 750})
    pg.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test', wait_until='networkidle')
    pg.wait_for_selector('#welcome:not([hidden])')
    pg.click('#start')
    pg.wait_for_timeout(200)
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(1245,950);}")
    pg.wait_for_timeout(150)
    pg.keyboard.press('e'); pg.wait_for_selector('#puzzle[open]')
    pg.locator('#answer').fill('99')
    pg.locator('#answer-form button').click()
    pg.wait_for_timeout(100)
    pg.screenshot(path=str(OUT / '1-wrong-answer-no-leak.png'))

    # One hint requested, shown
    pg.locator('#hint-btn').click()
    pg.wait_for_timeout(100)
    pg.screenshot(path=str(OUT / '2-hint-stage-1.png'))

    # Correct answer -> reasoning + Teruskan button, dialog still open
    pg.locator('#answer').fill('7')
    pg.locator('#answer-form button').click()
    pg.wait_for_timeout(150)
    pg.screenshot(path=str(OUT / '3-correct-answer-dialog-open.png'))
    pg.close()

    # Mobile: same correct-answer success state, fits the small viewport
    pg = b.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pg.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test', wait_until='networkidle')
    pg.wait_for_selector('#welcome:not([hidden])')
    pg.tap('#start')
    pg.wait_for_timeout(200)
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(1245,950);}")
    pg.wait_for_timeout(150)
    pg.evaluate("()=>rooftop.scene.openPuzzle()")
    pg.wait_for_selector('#puzzle[open]')
    pg.locator('#answer').fill('7')
    pg.tap('#answer-form button')
    pg.wait_for_timeout(150)
    pg.screenshot(path=str(OUT / '4-mobile-correct-answer.png'))
    pg.close()

    b.close()
    print('done')
