from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path('audits/level-v11/waterworks-reconstruction/screenshots')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1600,'height':1000},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8765/app/addmath/rooftop/v11.html?test',wait_until='networkidle')
    page.wait_for_selector('#welcome:not([hidden])');page.click('#start')
    page.wait_for_function('() => rooftop.scene.mode === "playing"')
    page.evaluate('''() => { const s=rooftop.scene,c=s.cameras.main;s.physics.world.pause();s.player.body.reset(4122,942);s.syncVisual();s.step=-1;s.setStep(s.currentZoneIndex());c.stopFollow();c.setZoom(.70);c.centerOn(4877,1120); }''')
    page.wait_for_timeout(100)
    page.screenshot(path=str(out/'zone-e-after-entry-full.png'))
    page.locator('canvas').screenshot(path=str(out/'zone-e-after-entry-canvas.png'))
    print({'pageErrors':errors,'player':page.evaluate('''()=>({x:rooftop.scene.player.x,feet:rooftop.scene.player.body.bottom,step:rooftop.scene.step})''')})
    browser.close()
