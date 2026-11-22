from pathlib import Path
import json, time
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'audits/level-v12/screenshots'
BASE = 'http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
fixture = {'schemaVersion':1,'layoutVersion':120,'levelId':'denai-bab1-functions-v12','checkpointId':'e-entry','solvedGateIds':['lift','number-span'],'mappingInputs':[],'collectedCoinIds':[],'discoveredSecretIds':[],'elapsedMs':0,'waterOrder':None,'waterworksState':'LOCKED'}
errors=[]; failed=[]

def hold_touch(page, selector, duration=400):
    button=page.locator(selector); button.wait_for(state='visible')
    box=button.bounding_box(); x=box['x']+box['width']/2; y=box['y']+box['height']/2
    page._cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':7}]})
    page.wait_for_timeout(duration)
    page._cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    page.wait_for_timeout(300)

def move_jump_touch(page, duration=520):
    right=page.locator('[data-hold="right"]'); jump=page.locator('[data-action="jump"]')
    rb=right.bounding_box(); jb=jump.bounding_box()
    points=[{'x':rb['x']+rb['width']/2,'y':rb['y']+rb['height']/2,'id':8},{'x':jb['x']+jb['width']/2,'y':jb['y']+jb['height']/2,'id':9}]
    page._cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':points})
    page.wait_for_timeout(duration)
    page._cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    page.wait_for_timeout(450)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    context=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True,reduced_motion='reduce')
    page=context.new_page()
    page._cdp=context.new_cdp_session(page)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('requestfailed',lambda r:failed.append(r.url))
    page.goto(BASE,wait_until='networkidle')
    page.evaluate("data=>localStorage.setItem('denai-save-v12',JSON.stringify(data))",fixture)
    page.reload(wait_until='networkidle')
    page.click('#continue-btn')
    page.locator('body.game-active[data-waterworks-state="LOCKED"]').wait_for()
    assert page.locator('#touch-controls').is_visible()
    # Reach the first stage with real simultaneous touch controls.
    hold_touch(page,'[data-hold="right"]',350)
    move_jump_touch(page,470)
    page.screenshot(path=str(OUT/'mobile-touch-approach.png'))
    page.locator('[data-action="interact"]').tap()
    page.locator('body[data-waterworks-state="CONFIGURED"]').wait_for(timeout=3000)
    page.screenshot(path=str(OUT/'mobile-touch-configured.png'))
    # Check the mobile scene remains active and errors/network stay clean.
    result={'passed':not errors and not failed,'configuredByTouch':True,'navigationMethod':'touch right plus jump','reducedMotion':'reduce','pageErrors':errors,'failedRequests':failed}
    (OUT/'mobile-touch-qa.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps(result,indent=2))
    assert result['passed']
    browser.close()
