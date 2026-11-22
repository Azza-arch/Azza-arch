"""Natural controls only for traversal; scene access is read-only assertions."""
from pathlib import Path
import json,time
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parents[4]/'audits/level-v10/implementation'
URL='http://127.0.0.1:8765/app/addmath/rooftop/'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    context=browser.new_context(viewport={'width':1440,'height':1000},record_video_dir=str(OUT/'after/video'))
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(URL+'?test',wait_until='networkidle');page.click('#start');page.wait_for_timeout(600)
    page.screenshot(path=str(OUT/'before/v9-spawn.png'))
    assert page.evaluate('rooftop.constants.WORLD.width')==4300
    page.goto(URL+'v10.html?test',wait_until='networkidle');page.click('#start')
    def wait(expr,timeout=15000):page.wait_for_function('()=>{const s=rooftop.scene,b=s.player.body,c=s.crate.body;return '+expr+'}',timeout=timeout)
    def state():return page.evaluate('''()=>{const s=rooftop.scene,b=s.player.body;return {x:s.player.x,feet:b.bottom,crate:s.crate.x,plate:s.crateSwitchActive,coins:[...s.collectedCoinIds],gates:[...s.solvedGates],cp:s.checkpointIndex,mode:s.mode}}''')
    def walk(x):
        right=state()['x']<x;k='d' if right else 'a'
        page.keyboard.down(k);wait(f's.player.x {">=" if right else "<="} {x}');page.keyboard.up(k);wait('Math.abs(b.velocity.x)<1')
    def jump_to(x,feet):
        right=state()['x']<x;k='d' if right else 'a'
        page.keyboard.press('Space');wait('b.velocity.y<0');page.keyboard.down(k)
        wait(f's.player.x {">=" if right else "<="} {x}');page.keyboard.up(k);wait('b.blocked.down || b.touching.down')
        assert abs(state()['feet']-feet)<3,state()
    def shot(name):page.screenshot(path=str(OUT/'after'/name))
    wait('b.blocked.down');shot('zone-a-spawn.png')
    initial=state()['crate'];walk(170);assert state()['crate']==initial
    page.keyboard.down('d');wait('s.crateSwitchActive');page.keyboard.up('d');wait('Math.abs(b.velocity.x)<1 && Math.abs(c.velocity.x)<1')
    print('PUSH',state(),flush=True);shot('crate-plate.png')
    cx=state()['crate'];walk(cx-48);jump_to(cx-5,1248);jump_to(490,1176)
    assert 'coin-a' in state()['coins'];shot('crate-ledge.png')
    page.keyboard.press('r');wait('s.player.x<100 && b.blocked.down');page.keyboard.press('c');wait('Math.abs(s.crate.x-270)<1 && !s.crateSwitchActive')
    # Vault the reset crate, then naturally reach the first mandatory gap.
    walk(205);jump_to(365,1296);walk(600)
    page.keyboard.down('d');wait('s.player.x>=620');page.keyboard.press('Space');wait('b.velocity.y<0');wait('s.player.x>=800');page.keyboard.up('d');wait('b.blocked.down')
    assert abs(state()['feet']-1296)<3,state()
    walk(960);jump_to(1060,1242);jump_to(1170,1188);jump_to(1280,1134)
    shot('zone-a-steps.png');print('STEPS',state(),flush=True)
    walk(1450);page.keyboard.press('e');wait('s.mode==="mechanism"');page.click('#dial-test');page.click('#dial-more');page.click('#dial-test')
    assert '1 → 2(1)+1 → 3' in page.inner_text('#mechanism-feedback')
    shot('input-output-probe.png');page.click('#dial-close')
    # Skip C first: main checkpoint and gear must work without visiting café.
    walk(1605);jump_to(1720,1080);walk(1920)
    assert state()['cp']==1,state()
    # Unsolved crossing cannot be jumped; checkpoint recovery must be safe.
    remote_crate=state()['crate']
    walk(2000);page.keyboard.down('d');page.keyboard.press('Space');wait('b.velocity.y<0');wait('s.player.x<1950 && b.bottom<1082');page.keyboard.up('d');wait('b.blocked.down')
    assert not state()['gates'];assert state()['crate']==remote_crate,state()
    walk(1920);page.keyboard.press('e');wait('s.mode==="mechanism"')
    page.click('#dial-test');assert not state()['gates'];assert not page.evaluate('!!rooftop.scene.gateBodies.gear')
    shot('gear-wrong.png')
    for _ in range(4):page.keyboard.press('ArrowRight')
    page.keyboard.press('Enter');wait('!!s.gateBodies.gear');assert state()['gates']==['gear'];shot('gear-open.png');page.click('#dial-close')
    walk(2460);jump_to(2630,1026);jump_to(2740,972);walk(2800)
    shot('batch-boundary.png');print('MAIN WITHOUT C',state(),flush=True)
    assert state()['cp']==3
    page.reload(wait_until='networkidle');page.click('#continue-btn');wait('b.blocked.down')
    assert state()['gates']==['gear'] and state()['cp']==3 and 'coin-a' in state()['coins'];print('CONTINUE',state(),flush=True)
    # Backtrack via the solved bridge; climb and descend both optional ladders.
    walk(1840);page.keyboard.down('w');wait('b.bottom<=811 && !s.climbing');page.keyboard.up('w');wait('b.blocked.down');shot('zone-c-arrival.png')
    walk(1730);page.keyboard.press('e');wait('s.mode==="mechanism"')
    for i in range(4):
        page.click('#dial-test')
        if i<3:page.click('#dial-more')
    assert page.evaluate('rooftop.scene.mappingDone');shot('cafe-mapping.png');page.click('#dial-close')
    walk(1900);page.keyboard.press('e');wait('s.discoveredSecrets.has("secret-oyen")')
    walk(1566);page.keyboard.down('s');wait('b.bottom>=1133 && !s.climbing');page.keyboard.up('s');wait('b.blocked.down')
    page.keyboard.down('w');wait('b.bottom<=811 && !s.climbing');page.keyboard.up('w');wait('b.blocked.down')
    walk(1836);page.keyboard.down('s');wait('b.bottom>=1079 && !s.climbing');page.keyboard.up('s');wait('b.blocked.down')
    print('BOTH LADDERS + C',state(),flush=True)
    page.reload(wait_until='networkidle');page.click('#continue-btn');wait('b.blocked.down')
    assert page.evaluate('rooftop.scene.mappingDone && rooftop.scene.discoveredSecrets.has("secret-oyen")')
    walk(1836)
    if state()['feet']<900:
        page.keyboard.down('s');wait('b.bottom>=1079 && !s.climbing');page.keyboard.up('s');wait('b.blocked.down')
    walk(2460);jump_to(2630,1026);jump_to(2740,972);walk(2800);page.keyboard.press('e');wait('s.mode==="complete"')
    assert page.evaluate('JSON.parse(localStorage.getItem("lorong-save-v10")).completed') is False
    shot('batch-complete.png')
    assert not errors,errors
    (OUT/'logs/natural-traversal.json').write_text(json.dumps({'passed':True,'final':state(),'errors':errors},indent=2))
    context.close();browser.close()
