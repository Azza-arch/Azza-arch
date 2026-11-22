"""Natural-input R01–R12 verification and real browser captures for V11 Phase 3."""
from pathlib import Path
import json, time
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'audits/level-v11/full-world-implementation/screenshots/phase3'
OUT.mkdir(parents=True, exist_ok=True)
BASE = 'http://127.0.0.1:8765/app/addmath/rooftop/v11.html?test'
events = []
errors, console_errors, failed_requests = [], [], []

def state(page):
    return page.evaluate("""() => { const s=rooftop.scene,b=s.player.body; return {
      x:Math.round(s.player.x), feet:Math.round(b.bottom), mode:s.mode,
      grounded:!!(b.blocked.down||b.touching.down), climbing:!!s.climbing,
      solved:[...s.solvedGates], checkpoint:s.checkpointIndex,
      crateX:s.crate?.x, plate:s.crateSwitchActive, mapping:[...s.mappingInputs], coins:[...s.collectedCoinIds] }; }""")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width':1440,'height':900}, device_scale_factor=1)
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: console_errors.append(m.text) if m.type == 'error' else None)
    page.on('requestfailed', lambda r: failed_requests.append(r.url))
    page.add_init_script("localStorage.setItem('lorong-save-v10', 'preserve-me')")
    started = time.monotonic()
    page.goto(BASE, wait_until='networkidle')
    page.wait_for_selector('#welcome:not([hidden])')
    assert page.evaluate("document.body.classList.contains('menu-active') && getComputedStyle(document.querySelector('.hud')).visibility==='hidden'")
    assert page.evaluate("getComputedStyle(document.querySelector('.menu-mascot')).animationName==='chill-menu-idle'")
    page.screenshot(path=str(OUT/'phase3-menu-desktop.png'))
    page.locator('#start').focus()
    assert page.evaluate('document.activeElement.id') == 'start', 'Play action must accept keyboard focus'
    page.screenshot(path=str(OUT/'phase3-menu-keyboard-focus.png'))
    page.click('#start')
    page.wait_for_function('() => rooftop.scene.player.body.blocked.down')
    assert page.evaluate('document.activeElement.id') == 'game', 'Play must return focus to the game canvas'

    def wait(expr, timeout=10000):
        try:
            page.wait_for_function('() => { const s=rooftop.scene,b=s.player.body; return ' + expr + ' }', timeout=timeout)
        except Exception:
            print('Traversal stopped at', expr, state(page), flush=True)
            print('Physics diagnostics', page.evaluate("""()=>{const s=rooftop.scene,b=s.player.body,k=s.keys;return JSON.stringify({mode:s.mode,status:s.sys.settings.status,scenePaused:s.scene.isPaused(),sceneActive:s.scene.isActive(),keyEnabled:s.input.keyboard.enabled,keys:{d:k.d.isDown,a:k.a.isDown,left:k.left.isDown,right:k.right.isDown},climbing:s.climbing,allowGravity:b.allowGravity,moves:b.moves,enable:b.enable,delta:s.game.loop.delta,timePaused:s.time.paused,physicsPaused:s.physics.world.isPaused,vx:b.velocity.x,touching:b.touching,blocked:b.blocked,liftText:s.liftState.text,bridgeY:s.liftPlanks.map(a=>a.y)})}"""), 'pageErrors', errors, 'consoleErrors', console_errors, flush=True)
            page.screenshot(path=str(OUT/'phase3-failure.png'))
            raise

    def walk_to(x):
        current = state(page)['x']; key = 'd' if x > current else 'a'
        page.keyboard.down(key)
        wait(f's.player.x {">=" if key=="d" else "<="} {x}')
        page.keyboard.up(key)
        wait('Math.abs(b.velocity.x)<1')
        events.append({'event':'walk','target':x,**state(page)})

    def jump_to(x):
        current = state(page)['x']; key = 'd' if x > current else 'a'
        page.keyboard.down(key); page.keyboard.press('Space')
        wait('b.velocity.y<0')
        wait(f's.player.x {">=" if key=="d" else "<="} {x}')
        page.keyboard.up(key)
        wait('(b.blocked.down||b.touching.down)')
        events.append({'event':'jump-land','target':x,**state(page)})

    def climb(direction, feet):
        key = 'w' if direction == 'up' else 's'
        page.keyboard.down(key)
        wait('!!s.climbing', timeout=3000)
        wait(f'!s.climbing && Math.abs(b.bottom-{feet})<3 && b.blocked.down', timeout=12000)
        page.keyboard.up(key)
        events.append({'event':'climb-'+direction,'targetFeet':feet,**state(page)})

    def shot(name):
        page.screenshot(path=str(OUT/f'phase3-{name}.png'))
        events.append({'event':'screenshot','name':name,**state(page)})

    def interact():
        page.keyboard.press('e')
        wait('s.mode==="mechanism"')

    # R01: cross the first low rise with a normal run-up and jump.
    walk_to(220); jump_to(390)
    # R02: use the real crate route; push it onto the plate, then test the ledge.
    walk_to(485)
    page.keyboard.down('d'); wait('s.crateSwitchActive')
    page.keyboard.up('d'); wait('Math.abs(s.crate.body.velocity.x)<1')
    shot('A-crate-plate-open')
    page.keyboard.press('Space'); wait('b.velocity.y<0'); wait('b.bottom<1194')
    page.keyboard.down('a'); wait('s.player.x<=750'); page.keyboard.up('a')
    wait('b.blocked.down||b.touching.down')
    page.keyboard.press('Space'); wait('b.velocity.y<0'); wait('b.bottom<1180')
    page.keyboard.down('d'); wait('s.player.x>=770'); page.keyboard.up('d')
    wait('Math.abs(b.bottom-1194)<4')
    jump_to(855); wait('Math.abs(b.bottom-1122)<4')
    shot('A-crate-bonus-ledge')
    # Return to the main route and cross the measured 108px gap naturally.
    walk_to(1020); jump_to(1240)
    wait('Math.abs(b.bottom-1242)<4')
    page.screenshot(path=str(OUT/'phase3-A-gap-checkpoint.png'))
    walk_to(1400); jump_to(1540)
    # C is genuinely optional: climb in, visit all four function pairs, and return.
    walk_to(1512); climb('up', 864)
    walk_to(1692); interact(); shot('C-mapping-panel')
    for value in range(4):
        page.click(f'[data-token="{value}"]'); page.click('#dial-test')
        wait(f's.mappingInputs.has({value})')
    page.click('#dial-close'); wait('s.mode==="playing"')
    wait('s.discoveredSecrets.has("bonus-mapping")')
    shot('C-bonus-complete')
    walk_to(1890); climb('down', 1080)
    # R04 demonstrates output calculation before the mandatory lift.
    walk_to(1692); interact(); page.click('[data-token="2"]'); page.click('#dial-test')
    wait('s.probeReadout.text.includes("f(2) = 5")')
    page.click('#dial-close'); wait('s.mode==="playing"')
    walk_to(1810); jump_to(1910); walk_to(2070); interact(); shot('B-lift-locked')
    page.click('[data-token="2"]'); page.click('#dial-test')
    wait('document.querySelector("#mechanism-feedback").textContent.includes("Output 5")')
    assert not page.evaluate("rooftop.scene.solvedGates.has('lift')")
    assert not page.evaluate('!!rooftop.scene.gateBodies.lift')
    shot('B-lift-wrong-input')
    page.click('[data-token="3"]'); page.click('#dial-test')
    wait('s.liftPlanks.some(a=>a.y>1080&&a.y<1296)', timeout=4000)
    shot('B-lift-moving')
    wait('s.mode==="playing" && !!s.gateBodies.lift', timeout=8000)
    wait('s.liftPlanks.every(a=>Math.abs(a.y-1080)<1)')
    assert 'selamat' in page.evaluate('String(rooftop.scene.liftState.text).toLowerCase()')
    events.append({'event':'lift-state',**page.evaluate("""()=>{const s=rooftop.scene;return {text:s.liftState.text,bridgeY:s.liftPlanks.map(a=>a.y),body:{x:s.gateBodies.lift.x,y:s.gateBodies.lift.y,w:s.gateBodies.lift.body.width,h:s.gateBodies.lift.body.height},platforms:s.solids.getChildren().map(o=>({id:o.getData('id'),x:o.body.x,y:o.body.y,w:o.body.width,h:o.body.height,oneWay:o.getData('oneWay')})).filter(o=>o.x>1800&&o.x<2600)}}""")})
    shot('B-lift-locked-safe')
    # Traverse the bridge and continue through R08-R10 using natural keyboard input.
    page.wait_for_timeout(250)
    page.keyboard.down('ArrowRight'); wait('s.player.x>=2520'); page.keyboard.up('ArrowRight')
    wait('Math.abs(b.velocity.x)<1')
    jump_to(2700); jump_to(2900)
    walk_to(3200); shot('D-R08-number-rack')
    # R09 optional service ledge is reached and returned by its actual ladder.
    walk_to(3330); climb('up',738); walk_to(3402)
    wait("s.collectedCoinIds.has('d-service')", timeout=4000)
    shot('D-R09-service-reward')
    walk_to(3330); climb('down',972)
    walk_to(3380); interact()
    assert page.evaluate('document.activeElement.id') == 'mechanism', 'R08 interaction must receive keyboard focus'
    assert page.locator('[data-token="0"]').is_hidden() and page.locator('[data-token="1"]').is_hidden()
    assert page.locator('[data-token="2"]').is_visible() and page.locator('[data-token="4"]').is_visible()
    shot('D-R08-input-panel')
    page.click('[data-token="2"]'); page.click('#dial-test')
    wait("document.querySelector('#mechanism-feedback').textContent.includes('= 4')")
    assert page.evaluate('rooftop.scene.mode==="mechanism"')
    shot('D-R08-wrong-input')
    assert page.evaluate('rooftop.scene.numberSpan.every(a=>Math.abs(a.y-1188)<1)')
    assert not page.evaluate("rooftop.scene.solvedGates.has('number-span')")
    page.click('[data-token="4"]'); page.click('#dial-test')
    wait('s.numberSpan.some(a=>a.y<1188&&a.y>972)', timeout=4000)
    shot('D-R08-span-moving')
    wait("s.mode==='playing'&&!!s.gateBodies['number-span']", timeout=8000)
    wait('s.numberSpan.every(a=>Math.abs(a.y-972)<1)')
    assert page.evaluate("rooftop.scene.gateBodies['number-span'].body.top===972")
    assert page.evaluate('Math.abs(rooftop.scene.numberBlockArts[4].x-3372)<1 && Math.abs(rooftop.scene.numberBlockArts[4].y-900)<1')
    shot('D-R08-span-safe')
    walk_to(3915); wait("s.checkpointIndex===6")
    walk_to(3960); interact(); shot('D-R10-composition-panel')
    page.click('[data-order="fg"]'); wait("s.compositionReadout.text.includes('13')")
    page.click('[data-order="gf"]'); wait("s.compositionReadout.text.includes('9')")
    shot('D-R10-composition-results')
    page.click('#dial-close'); wait('s.mode==="playing"')
    assert state(page)['x'] <= 4104
    events.append({'event':'R08-R10-natural-route','naturalInput':True,**state(page)})
    # R11: descend to the lower recovery floor, climb to the roof route,
    # jump the 108px gap, collect the visible coin, then return by ladder.
    walk_to(4122); wait('s.checkpointIndex===7'); shot('E-R11-arrival')
    walk_to(4158); climb('down',1296); shot('E-R11-lower-recovery')
    climb('up',1134)
    walk_to(4290); jump_to(4440)
    walk_to(4500)
    wait("s.collectedCoinIds.has('e-waterwalk')",timeout=4000)
    shot('E-R11-upper-reward')
    walk_to(4560); jump_to(4700)
    walk_to(4752); climb('down',1296); shot('E-R11-recovery-return')
    # Return to the upper path and step onto R12's safe west bank.
    climb('up',1026); walk_to(4830); jump_to(4900)
    walk_to(5100); shot('E-R12-pipe-network-locked')
    interact(); shot('E-R12-composition-panel')
    page.click('[data-order="gf"]')
    wait("document.querySelector('#mechanism-feedback').textContent.includes('Hasil 15')")
    assert not page.evaluate("rooftop.scene.solvedGates.has('water-crossing')")
    assert not page.evaluate("!!rooftop.scene.gateBodies['water-crossing']")
    assert page.evaluate('rooftop.scene.waterBridge.every(a=>Math.abs(a.y-1188)<1)')
    shot('E-R12-wrong-order-15')
    page.click('[data-order="fg"]')
    wait("s.mode==='mechanism-transition'&&s.solvedGates.has('water-crossing')")
    assert page.evaluate("document.querySelector('#mechanism-value').textContent.includes('19')")
    assert not page.evaluate("!!rooftop.scene.gateBodies['water-crossing']")
    shot('E-R12-correct-order-19')
    wait('s.waterFlowDot.visible&&s.waterFlowDot.x>=4824',timeout=12000)
    shot('E-R12-water-flow')
    wait("s.mode==='playing'&&!!s.gateBodies['water-crossing']",timeout=12000)
    wait('s.waterBridge.every(a=>Math.abs(a.y-972)<1)')
    assert page.evaluate("rooftop.scene.gateBodies['water-crossing'].body.top===972")
    assert page.evaluate('rooftop.scene.reservoir.every(a=>a.alpha===1)')
    shot('E-R12-crossing-open-safe')
    walk_to(5598); wait('s.checkpointIndex===8')
    shot('E-R12-far-bank-checkpoint')
    events.append({'event':'R11-R12-natural-route','naturalInput':True,**state(page)})
    legacy = page.evaluate("localStorage.getItem('lorong-save-v10')")
    assert legacy == 'preserve-me', 'V10 save key was changed by V11'
    page.reload(wait_until='networkidle')
    page.wait_for_selector('#continue-btn:not([hidden])')
    page.screenshot(path=str(OUT/'phase3-menu-continue-desktop.png'))
    page.click('#continue-btn')
    wait("s.mode==='playing' && s.solvedGates.has('water-crossing') && !!s.gateBodies['water-crossing']")
    assert page.evaluate('rooftop.scene.checkpointIndex===8')
    assert page.evaluate('rooftop.scene.waterBridge.every(a=>Math.abs(a.y-972)<1) && rooftop.scene.reservoir.every(a=>a.alpha===1)')
    page.screenshot(path=str(OUT/'phase3-E-continue-restored.png'))
    assert page.evaluate("localStorage.getItem('lorong-save-v10')") == 'preserve-me'
    events.append({'event':'continue-restored-E-crossing','naturalInput':True,**state(page)})
    desktop_final = state(page)
    page.close()

    # Mobile portrait proof: visible touch layout, held direction, and jump action.
    mobile_context = browser.new_context(viewport={'width':390,'height':844}, device_scale_factor=1, is_mobile=True, has_touch=True, reduced_motion='reduce')
    mobile = mobile_context.new_page()
    mobile.on('pageerror', lambda e: errors.append('mobile: '+str(e)))
    mobile.on('console', lambda m: console_errors.append('mobile: '+m.text) if m.type == 'error' else None)
    mobile.on('requestfailed', lambda r: failed_requests.append('mobile: '+r.url))
    mobile.add_init_script("localStorage.setItem('lorong-save-v11', JSON.stringify({schemaVersion:1,layoutVersion:111,levelId:'lorong-atas-bumbung-v11',checkpointId:'e-entry',solvedGateIds:['lift','number-span'],mappingInputs:[],collectedCoinIds:[],discoveredSecretIds:[],elapsedMs:1200}))")
    mobile.goto(BASE, wait_until='networkidle'); mobile.wait_for_selector('#welcome:not([hidden])')
    assert mobile.evaluate("document.body.classList.contains('menu-active') && getComputedStyle(document.querySelector('.hud')).visibility==='hidden'")
    assert mobile.evaluate("getComputedStyle(document.querySelector('.menu-mascot')).animationName==='none'")
    mobile.screenshot(path=str(OUT/'phase3-menu-mobile.png'))
    assert not mobile.locator('#continue-btn').is_hidden()
    mobile.click('#continue-btn'); mobile.wait_for_function("()=>rooftop.scene.mode==='playing'&&rooftop.scene.checkpointIndex===7")
    assert mobile.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches && rooftop.scene.visual.texture.key==='idle-00'")
    assert not mobile.locator('#touch-controls').evaluate('(e)=>e.hidden')
    mobile.screenshot(path=str(OUT/'phase3-mobile-E-entry.png'))
    start_x = state(mobile)['x']
    cdp = mobile_context.new_cdp_session(mobile)
    right_box = mobile.locator('[data-hold="right"]').bounding_box()
    right_point = {'x':right_box['x']+right_box['width']/2,'y':right_box['y']+right_box['height']/2,'id':1}
    cdp.send('Input.dispatchTouchEvent', {'type':'touchStart','touchPoints':[right_point]})
    mobile.wait_for_function(f'()=>rooftop.scene.player.x>{start_x+24}', timeout=5000)
    cdp.send('Input.dispatchTouchEvent', {'type':'touchEnd','touchPoints':[]})
    # Touch ladder controls descend to recovery and climb back to the roof.
    down_box = mobile.locator('[data-hold="down"]').bounding_box()
    down_point = {'x':down_box['x']+down_box['width']/2,'y':down_box['y']+down_box['height']/2,'id':3}
    cdp.send('Input.dispatchTouchEvent', {'type':'touchStart','touchPoints':[down_point]})
    mobile.wait_for_function('()=>!!rooftop.scene.climbing',timeout=3000)
    mobile.wait_for_function('()=>!rooftop.scene.climbing&&Math.abs(rooftop.scene.player.body.bottom-1296)<3',timeout=12000)
    cdp.send('Input.dispatchTouchEvent', {'type':'touchEnd','touchPoints':[]})
    up_box = mobile.locator('[data-hold="up"]').bounding_box()
    up_point = {'x':up_box['x']+up_box['width']/2,'y':up_box['y']+up_box['height']/2,'id':4}
    cdp.send('Input.dispatchTouchEvent', {'type':'touchStart','touchPoints':[up_point]})
    mobile.wait_for_function('()=>!!rooftop.scene.climbing',timeout=3000)
    mobile.wait_for_function('()=>!rooftop.scene.climbing&&Math.abs(rooftop.scene.player.body.bottom-1134)<3',timeout=12000)
    cdp.send('Input.dispatchTouchEvent', {'type':'touchEnd','touchPoints':[]})
    mobile.screenshot(path=str(OUT/'phase3-mobile-E-ladder.png'))
    mobile.wait_for_function('()=>rooftop.scene.player.body.blocked.down||rooftop.scene.player.body.touching.down')
    jump_box = mobile.locator('[data-action="jump"]').bounding_box()
    jump_point = {'x':jump_box['x']+jump_box['width']/2,'y':jump_box['y']+jump_box['height']/2,'id':2}
    cdp.send('Input.dispatchTouchEvent', {'type':'touchStart','touchPoints':[jump_point]})
    mobile.wait_for_function('()=>rooftop.scene.player.body.velocity.y<0', timeout=3000)
    cdp.send('Input.dispatchTouchEvent', {'type':'touchEnd','touchPoints':[]})
    events.append({'event':'mobile-touch-right-and-jump','naturalInput':True,**state(mobile)})
    mobile.screenshot(path=str(OUT/'phase3-mobile-E-touch.png'))
    mobile_context.close()
    result = {'passed':not errors and not console_errors and not failed_requests,
      'naturalInputOnly':True,'durationSeconds':round(time.monotonic()-started,2),
      'events':events,'pageErrors':errors,'consoleErrors':console_errors,'failedRequests':failed_requests,
      'finalState':desktop_final}
    (ROOT/'audits/level-v11/full-world-implementation/logs/phase3-natural-input.json').write_text(json.dumps(result,indent=2),encoding='utf8')
    browser.close()

# A–C contact sheet is assembled only from the actual browser captures above.
images=[]
for name in ['phase3-menu-desktop.png','phase3-A-gap-checkpoint.png','phase3-E-R11-arrival.png','phase3-E-R11-upper-reward.png','phase3-E-R11-lower-recovery.png','phase3-E-R12-pipe-network-locked.png','phase3-E-R12-composition-panel.png','phase3-E-R12-wrong-order-15.png','phase3-E-R12-correct-order-19.png','phase3-E-R12-water-flow.png','phase3-E-R12-crossing-open-safe.png','phase3-E-continue-restored.png','phase3-mobile-E-touch.png']:
    im=Image.open(OUT/name).convert('RGB')
    im.thumbnail((480,300))
    images.append((name,im.copy()))
sheet=Image.new('RGB',(1000,((len(images)+1)//2)*330),'#eef5f5')
draw=ImageDraw.Draw(sheet)
for i,(name,im) in enumerate(images):
    x=12+(i%2)*494; y=12+(i//2)*330
    sheet.paste(im,(x,y+24)); draw.text((x,y+5),name,fill='#183f39')
sheet.save(OUT/'phase3-R01-R12-contact-sheet.png')
print(f"Phase 3 natural input: {'PASS' if result['passed'] else 'FAIL'}; {result['durationSeconds']}s automated desktop route; mobile touch ladder/jump captured; {len(errors)} page errors; {len(console_errors)} console errors; {len(failed_requests)} failed requests.")
