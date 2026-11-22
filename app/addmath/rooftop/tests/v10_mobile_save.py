"""Touch-only main-route traversal; explicit save fixtures for migration/portrait UI."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parents[4]/'audits/level-v10/implementation'
URL='http://127.0.0.1:8765/app/addmath/rooftop/v10.html?test'
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    ctx=b.new_context(viewport={'width':844,'height':390},has_touch=True,is_mobile=True)
    pg=ctx.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
    pg.goto(URL,wait_until='networkidle');pg.tap('#start')
    pg.evaluate("window.touchLog=[]; for(const t of ['pointerdown','pointerup','pointercancel','lostpointercapture']) document.addEventListener(t,e=>touchLog.push([t,e.pointerId,e.target.dataset.hold||e.target.dataset.action]),true)")
    cdp=ctx.new_cdp_session(pg);points={}
    def wait(expr):
        try:pg.wait_for_function('()=>{const s=rooftop.scene,b=s.player.body,c=s.crate.body;return '+expr+'}',timeout=15000)
        except Exception:
            print('FAILED',expr,pg.evaluate('({x:rooftop.scene.player.x,y:rooftop.scene.player.body.bottom,vx:rooftop.scene.player.body.velocity.x,vy:rooftop.scene.player.body.velocity.y,mode:rooftop.scene.mode})'),flush=True)
            pg.screenshot(path=str(OUT/'after/mobile-failure.png'));raise
    def state():return pg.evaluate('({x:rooftop.scene.player.x,feet:rooftop.scene.player.body.bottom})')
    def touch(selector,id,down):
        if down:
            box=pg.locator(selector).bounding_box();points[id]={'x':box['x']+box['width']/2,'y':box['y']+box['height']/2,'id':id}
        else:ended=points.pop(id,None)
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart' if down else 'touchEnd','touchPoints':list(points.values()) if down else [ended]})
    def hold(direction,down):touch('[data-hold="'+direction+'"]',1,down)
    def jump():
        touch('[data-action="jump"]',2,True);pg.wait_for_timeout(60);touch('[data-action="jump"]',2,False)
    def walk(x):
        right=state()['x']<x;direction='right' if right else 'left';hold(direction,True)
        wait(f's.player.x {">=" if right else "<="} {x}');hold(direction,False);wait('Math.abs(b.velocity.x)<1')
    def jump_to(x,feet):
        jump();wait('b.velocity.y<0');hold('right',True);wait(f's.player.x>={x}');hold('right',False);wait('b.blocked.down || b.touching.down');assert abs(state()['feet']-feet)<3,state()
    wait('b.blocked.down');hold('right',True);wait('s.crateSwitchActive');hold('right',False);wait('Math.abs(b.velocity.x)<1')
    pg.tap('[data-action="resetCrate"]');wait('Math.abs(s.crate.x-270)<1 && !s.crateSwitchActive')
    walk(600);hold('right',True);wait('s.player.x>=620');jump();wait('b.velocity.y<0');pg.wait_for_timeout(180);print('TOUCH DEBUG',state(),pg.evaluate('rooftop.scene.player.body.velocity.x'),pg.evaluate('touchLog'),flush=True);wait('s.player.x>=800');hold('right',False);wait('b.blocked.down')
    walk(960);jump_to(1060,1242);jump_to(1170,1188);jump_to(1280,1134)
    walk(1605);jump_to(1720,1080);walk(1920)
    pg.tap('[data-action="interact"]');wait('s.mode==="mechanism"');pg.tap('#dial-test');assert not pg.evaluate('rooftop.scene.solvedGates.size')
    pg.tap('#dial-hint');assert 'gandakan' in pg.inner_text('#mechanism-feedback')
    before=pg.evaluate('rooftop.scene.cameras.main.scrollX');pg.tap('#dial-preview');pg.wait_for_timeout(100)
    assert pg.evaluate('rooftop.scene.cameras.main.scrollX')!=before
    pg.wait_for_timeout(1700)
    for _ in range(4):pg.tap('#dial-more')
    pg.tap('#dial-test');wait('!!s.gateBodies.gear');pg.screenshot(path=str(OUT/'after/mobile-gear.png'));pg.tap('#dial-close')
    walk(2460);jump_to(2630,1026);jump_to(2740,972);walk(2800);pg.tap('[data-action="interact"]');wait('s.mode==="complete"')
    assert not errors,errors
    result={'touchMainRoute':'passed; actual multi-touch events, no teleports','crateReset':'passed','gearWrongHintPreviewCorrect':'passed','errors':errors}
    ctx.close()
    # Fixtures test migration/persistence/UI only, not terrain reachability.
    ctx=b.new_context(viewport={'width':370,'height':740},has_touch=True,is_mobile=True,reduced_motion='reduce')
    pg=ctx.new_page();pg.on('pageerror',lambda e:errors.append(str(e)))
    old={'schemaVersion':2,'levelId':'lorong-atas-bumbung-1','checkpointId':'cp1-cafe','solvedGateIds':[],'collectedCoinIds':['coin-c'],'discoveredSecretIds':['secret-oyen'],'completed':False}
    pg.goto(URL,wait_until='networkidle');pg.evaluate('(s)=>localStorage.setItem("lorong-save-v1",JSON.stringify(s))',old);pg.reload(wait_until='networkidle')
    legacy=pg.evaluate('localStorage.getItem("lorong-save-v1")');assert pg.evaluate('localStorage.getItem("lorong-save-v10")') is None
    pg.tap('#import-v9');pg.tap('#continue-btn');wait('b.blocked.down')
    assert abs(state()['feet']-810)<3;assert pg.evaluate('localStorage.getItem("lorong-save-v1")')==legacy
    pg.screenshot(path=str(OUT/'after/portrait-cafe.png'))
    # Clean unsolved cp-b fixture for a narrow-screen gear interaction.
    pg.evaluate('''()=>{let s=JSON.parse(localStorage.getItem('lorong-save-v10'));s.checkpointId='cp-b';localStorage.setItem('lorong-save-v10',JSON.stringify(s));}''')
    pg.reload(wait_until='networkidle');pg.tap('#continue-btn');wait('b.blocked.down');pg.tap('[data-action="interact"]');wait('s.mode==="mechanism"')
    pg.tap('#dial-preview');assert '324px' in pg.inner_text('#mechanism-feedback')
    pg.screenshot(path=str(OUT/'after/portrait-gear.png'))
    assert pg.evaluate('document.documentElement.scrollWidth<=innerWidth')
    for _ in range(4):pg.tap('#dial-more')
    pg.tap('#dial-test');wait('!!s.gateBodies.gear');pg.reload(wait_until='networkidle');pg.tap('#continue-btn');wait('b.blocked.down')
    assert pg.evaluate('!!rooftop.scene.gateBodies.gear')
    assert pg.evaluate('localStorage.getItem("lorong-save-v1")')==legacy
    result.update(portraitReducedMotion='passed',explicitLegacyImport='passed; legacy bytes unchanged',reloadSolvedBridge='passed')
    assert not errors,errors
    (OUT/'logs/mobile-save-results.json').write_text(json.dumps(result,indent=2));print(json.dumps(result),flush=True)
    ctx.close();b.close()
