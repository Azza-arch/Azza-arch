"""Isolated animation and ladder fixtures; the main probe traverses the actual route."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json

def run():
    out=Path(__file__).parent/'artifacts'
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        page=browser.new_page(viewport={'width':1440,'height':1000})
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test',wait_until='networkidle')
        page.click('#start')
        frames=set()
        for _ in range(6):
            page.wait_for_timeout(180)
            frames.add(page.evaluate('rooftop.scene.visual.texture.key'))
        assert len(frames)>=2,frames
        page.evaluate('rooftop.scene.player.body.reset(710,908)')
        page.wait_for_function('() => rooftop.scene.player.body.blocked.down')
        page.keyboard.down('s')
        page.wait_for_function('() => rooftop.scene.player.body.bottom>1000',timeout=15000)
        page.wait_for_function('() => rooftop.scene.player.body.bottom>=1099 && !rooftop.scene.climbing',timeout=15000)
        page.keyboard.up('s')
        page.wait_for_function('() => rooftop.scene.player.body.blocked.down')
        assert abs(page.evaluate('rooftop.scene.player.body.bottom')-1100)<2
        page.keyboard.down('w')
        page.wait_for_function('() => rooftop.scene.player.body.bottom<1050 && !!rooftop.scene.climbing',timeout=15000)
        page.keyboard.up('w');page.keyboard.press('Space')
        page.wait_for_function('() => rooftop.scene.player.body.velocity.y<0 && !rooftop.scene.climbing')
        assert not errors
        page.close()
        mobile=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
        page=mobile.new_page()
        page.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test',wait_until='networkidle')
        page.wait_for_selector('#welcome:not([hidden])')
        page.screenshot(path=str(out/'mobile-welcome.png'))
        page.tap('#start')
        assert 'butang arah' in page.locator('#status').inner_text()
        page.screenshot(path=str(out/'mobile-playing.png'))
        result={'idleAnimationFrames':sorted(frames),'ladderDown':'passed','jumpOffLadder':'passed','touchInstruction':'passed','errors':errors}
        (out/'edge-results.json').write_text(json.dumps(result,indent=2))
        print(json.dumps(result),flush=True)
        browser.close()

