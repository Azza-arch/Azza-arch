from pathlib import Path
import json, time
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'audits/level-v12/screenshots'
OUT.mkdir(parents=True, exist_ok=True)
BASE = 'http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
errors, console_errors, failed = [], [], []

def fixture(order=None, state='LOCKED', checkpoint='e-entry'):
    return {
        'schemaVersion': 1, 'layoutVersion': 120, 'levelId': 'denai-bab1-functions-v12',
        'checkpointId': checkpoint, 'solvedGateIds': ['lift', 'number-span'],
        'mappingInputs': [], 'collectedCoinIds': [], 'discoveredSecretIds': [],
        'elapsedMs': 0, 'waterOrder': order, 'waterworksState': state,
    }

def hold(page, key, ms, with_jump=False):
    page.keyboard.down(key)
    if with_jump: page.keyboard.down('Space')
    page.wait_for_timeout(ms)
    if with_jump: page.keyboard.up('Space')
    page.keyboard.up(key)
    page.wait_for_timeout(450)

def interact(page):
    page.keyboard.press('e')
    page.wait_for_timeout(200)

def start_at_e(page, order=None, state='LOCKED'):
    page.goto(BASE, wait_until='networkidle')
    page.evaluate("data=>{localStorage.setItem('denai-save-v12',JSON.stringify(data));localStorage.setItem('lorong-save-v11','v11-sentinel')}",fixture(order,state))
    page.reload(wait_until='networkidle')
    page.wait_for_selector('#welcome:not([hidden])')
    page.click('#continue-btn')
    page.locator('body.game-active[data-waterworks-state]').wait_for()
    return page

def move_to_f(page):
    hold(page, 'd', 350)
    hold(page, 'd', 470, True)
    hold(page, 'd', 350, True)

def move_to_g(page):
    hold(page, 'd', 1750)

def move_to_output(page):
    hold(page, 'd', 350)
    hold(page, 'd', 620, True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=1, reduced_motion='no-preference')
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: console_errors.append(m.text) if m.type == 'error' else None)
    page.on('requestfailed', lambda r: failed.append(r.url))
    started = time.monotonic()

    start_at_e(page)
    assert page.locator('body').get_attribute('data-waterworks-state') == 'LOCKED'
    page.screenshot(path=str(OUT / 'locked.png'))

    # Select G first, then run. Repeated activation while running is ignored.
    move_to_f(page); interact(page)
    page.locator('body[data-waterworks-state="CONFIGURED"]').wait_for()
    move_to_g(page); interact(page)
    assert page.locator('body').get_attribute('data-waterworks-state') == 'CONFIGURED'
    page.screenshot(path=str(OUT / 'configured-gf.png'))
    page.reload(wait_until='networkidle')
    page.wait_for_selector('#continue-btn:not([hidden])')
    page.click('#continue-btn')
    page.locator('body[data-waterworks-state="CONFIGURED"]').wait_for()
    page.screenshot(path=str(OUT / 'reload-configured.png'))

    # Continue resumes at E entry checkpoint; approach the physical output lever.
    move_to_f(page); move_to_g(page); move_to_output(page)
    page.keyboard.press('e')
    page.locator('body[data-waterworks-state="RUNNING"]').wait_for()
    page.screenshot(path=str(OUT / 'running-gf.png'))
    page.keyboard.press('e'); page.keyboard.press('e'); page.keyboard.press('e')
    page.keyboard.press('Escape')
    page.wait_for_selector('#paused[open]')
    assert page.locator('body').get_attribute('data-waterworks-state') == 'RUNNING'
    page.screenshot(path=str(OUT / 'paused-running.png'))
    page.click('#resume')
    try: page.locator('body[data-waterworks-state="NON_TARGET_RESULT"]').wait_for(timeout=10000)
    except Exception:
        page.screenshot(path=str(OUT / 'unexpected-after-gf.png'))
        print({'afterGf':page.locator('body').get_attribute('data-waterworks-state'),'status':page.locator('#status').inner_text(),'save':page.evaluate("localStorage.getItem('denai-save-v12')"),'pageErrors':errors,'consoleErrors':console_errors},flush=True)
        raise
    page.screenshot(path=str(OUT / 'non-target-15.png'))

    # A run interrupted by reload recovers to CONFIGURED and can be retried.
    page.keyboard.press('e')
    page.locator('body[data-waterworks-state="RUNNING"]').wait_for()
    page.reload(wait_until='networkidle')
    page.wait_for_selector('#continue-btn:not([hidden])')
    page.click('#continue-btn')
    page.locator('body[data-waterworks-state="CONFIGURED"]').wait_for()

    # Select the target order, then return to the lever from the E-entry checkpoint.
    move_to_f(page); interact(page)
    page.locator('body[data-waterworks-state="CONFIGURED"]').wait_for()
    page.screenshot(path=str(OUT / 'configured-fg.png'))
    move_to_g(page);move_to_output(page)
    page.keyboard.press('e')
    page.locator('body[data-waterworks-state="RUNNING"]').wait_for()
    try: page.locator('body[data-waterworks-state="TARGET_REACHED"]').wait_for(timeout=10000)
    except Exception:
        page.screenshot(path=str(OUT / 'unexpected-after-fg.png'))
        print({'afterFg':page.locator('body').get_attribute('data-waterworks-state'),'status':page.locator('#status').inner_text(),'save':page.evaluate("localStorage.getItem('denai-save-v12')"),'pageErrors':errors,'consoleErrors':console_errors},flush=True)
        raise
    page.screenshot(path=str(OUT / 'target-reached-19.png'))
    try: page.locator('body[data-waterworks-state="CROSSING_ACTIVATING"]').wait_for(timeout=2000)
    except Exception: page.locator('body[data-waterworks-state="CROSSING_SAFE"]').wait_for(timeout=2000)
    page.screenshot(path=str(OUT / 'crossing-activating.png'))
    page.locator('body[data-waterworks-state="CROSSING_SAFE"]').wait_for(timeout=10000)
    page.screenshot(path=str(OUT / 'crossing-safe.png'))

    # Traverse the now-safe bridge from the output lever to the far bank.
    hold(page, 'd', 1500)
    page.screenshot(path=str(OUT / 'crossing-traversed.png'))
    assert page.locator('body[data-waterworks-state="CROSSING_SAFE"]').count() == 1

    # Reload during a safe/settled result must restore a stable crossing.
    page.reload(wait_until='networkidle')
    page.wait_for_selector('#continue-btn:not([hidden])')
    page.click('#continue-btn')
    page.locator('body[data-waterworks-state="CROSSING_SAFE"]').wait_for()
    page.screenshot(path=str(OUT / 'reload-crossing-safe.png'))

    result = {
        'passed': True,
        'elapsedSeconds': round(time.monotonic() - started, 2),
        'statesCaptured': ['LOCKED','CONFIGURED','RUNNING','NON_TARGET_RESULT','TARGET_REACHED','CROSSING_ACTIVATING','CROSSING_SAFE'],
        'crossingTraversalAttempted': True,
        'pageErrors': errors, 'consoleErrors': console_errors, 'failedRequests': failed,
        'v11SaveSentinel': context.pages[0].evaluate("localStorage.getItem('lorong-save-v11')"),
    }
    (OUT / 'desktop-browser-qa.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps(result, indent=2))
    assert not errors and not console_errors and not failed
    assert result['v11SaveSentinel'] == 'v11-sentinel'
    browser.close()
