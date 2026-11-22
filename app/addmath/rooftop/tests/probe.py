from playwright.sync_api import sync_playwright
from pathlib import Path
import json
import sys

if '--edges' in sys.argv:
    from edge_cases import run
    run()
    sys.exit(0)

OUT=Path(__file__).parent/'artifacts'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, args=['--disable-background-timer-throttling','--disable-renderer-backgrounding'])
    page=browser.new_page(viewport={'width':1440,'height':1000})
    errors=[]
    console_errors=[]
    failed_requests=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda m:console_errors.append(m.text) if m.type=='error' else None)
    page.on('requestfailed',lambda r:failed_requests.append(r.url))
    # V8 Phase 6: Restart/Replay now show a confirm() dialog; auto-accept it
    # so the existing regression flow (which expects these buttons to work
    # exactly as before) isn't blocked by Playwright's default auto-dismiss.
    page.on('dialog',lambda d:d.accept())
    page.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test',wait_until='networkidle')
    page.wait_for_selector('#welcome:not([hidden])')
    page.screenshot(path=str(OUT/'desktop-welcome.png'))
    page.click('#start')
    page.wait_for_timeout(400)
    def state():
        return page.evaluate('''() => {const s=rooftop.scene,b=s.player.body; return {x:s.player.x,y:s.player.y,feet:b.bottom,vx:b.velocity.x,vy:b.velocity.y,ground:b.blocked.down,mode:s.mode,climb:s.climbing,frame:s.visual.frame.texture.key,camera:{x:s.cameras.main.scrollX,y:s.cameras.main.scrollY}}}''')
    def wait(expression):
        try:
            page.wait_for_function('() => {const s=rooftop.scene,b=s.player.body; return '+expression+'}',timeout=45000)
        except Exception:
            print('FAILED',expression,json.dumps(state()),'errors',errors,flush=True)
            page.screenshot(path=str(OUT/'failure.png'))
            raise
    def walk(target):
        x=state()['x']; key='d' if x<target else 'a'
        page.keyboard.down(key)
        wait(f's.mode==="complete" || s.player.x {">=" if x<target else "<="} {target}')
        page.keyboard.up(key)
        wait('Math.abs(b.velocity.x)<1')
    def climb_up(top):
        page.keyboard.down('w'); wait(f'b.bottom<={top+1} && !s.climbing'); page.keyboard.up('w')
        wait('b.blocked.down')
    def climb_down(bottom):
        page.keyboard.down('s'); wait(f'b.bottom>={bottom-1} && !s.climbing'); page.keyboard.up('s')
        wait('b.blocked.down')
    def running_jump(jump_at_x, land_min_x):
        page.keyboard.down('d')
        wait(f's.player.x>={jump_at_x}')
        page.keyboard.press('Space');wait('b.velocity.y<0')
        wait(f's.player.x>={land_min_x}')
        page.keyboard.up('d')
        wait('b.blocked.down')
    def solve(x, feet, wrong, correct):
        walk(x)
        page.keyboard.press('e');page.wait_for_selector('#puzzle[open]')
        page.locator('#answer').fill(wrong);page.locator('#answer-form button').click()
        assert '#' not in page.locator('#answer-feedback').inner_text()
        # V8 Phase 5: a correct answer no longer auto-closes the puzzle
        # dialog — it shows the worked reasoning and waits for the student
        # (here, the test) to click "Teruskan" before closing. World state
        # (gate/lever/audio) already changed the instant the answer was
        # validated, same as before; only the dialog's own close timing
        # moved.
        page.locator('#answer').fill(correct);page.locator('#answer-form button').click()
        page.wait_for_selector('#puzzle-continue:not([hidden])')
        feedback_text = page.locator('#answer-feedback').inner_text()
        assert 'Betul!' in feedback_text, f'expected the worked reasoning in the dialog, got: {feedback_text}'
        page.locator('#puzzle-continue').click()
        wait('s.mode==="playing"')
    frame_box=page.locator('.game-frame').bounding_box()
    assert frame_box['width']/1440>0.75, f"game frame only {frame_box['width']}px wide on a 1440px viewport"
    assert page.evaluate("document.documentElement.scrollWidth<=document.documentElement.clientWidth+1")
    assert page.evaluate("document.documentElement.scrollHeight<=document.documentElement.clientHeight+1")
    assert not page.locator('#fullscreen').is_hidden()
    page.click('#fullscreen');page.wait_for_timeout(200)
    print('spawn',json.dumps(state()),flush=True)

    # --- Zone A: FIRST_GAP, the one plain un-gated jump. ---
    page.keyboard.down('d');wait('s.player.x>=510')
    page.keyboard.press('Space');wait('b.velocity.y<0')
    wait('s.player.x>=680');page.keyboard.up('d')
    wait('b.blocked.down')
    assert abs(page.evaluate("rooftop.scene.player.body.bottom")-1100)<3
    print('A: first gap jumped',json.dumps(state()),flush=True)
    page.screenshot(path=str(OUT/'desktop-zoneA.png'))

    # --- A -> B: the clear ladder route (rise 162, exceeds max jump rise). ---
    walk(710);climb_up(938)
    assert abs(page.evaluate("rooftop.scene.player.body.bottom")-938)<3
    print('A->B: ladder climbed',json.dumps(state()),flush=True)

    # Walk off the crest: the 54px terraces provide local recovery.
    walk(1110);wait('b.blocked.down')
    assert abs(state()['feet']-1046)<3, 'missed crest jump must land on the recovery terrace'
    for target, feet in [(1065,992),(1010,938)]:
        page.keyboard.down('a');page.keyboard.press('Space');wait('b.velocity.y<0')
        wait(f's.player.x<={target}');page.keyboard.up('a');wait('b.blocked.down')
        assert abs(state()['feet']-feet)<3
    walk(710)
    # Test descent and re-ascent of the actual new ladder with natural input.
    climb_down(1100);climb_up(938)
    print('B: local terrace recovery and ladder descent/ascent passed',json.dumps(state()),flush=True)

    # --- B -> C detour: checkpoint, then back down the SAME ladder. ---
    walk(750);climb_up(820)
    assert abs(page.evaluate("rooftop.scene.player.body.bottom")-820)<3
    walk(950)
    assert page.evaluate("rooftop.scene.checkpointIndex")==0, 'CP1 (café) must be reached'
    print('C: checkpoint 1 reached',json.dumps(state()),flush=True)
    page.screenshot(path=str(OUT/'desktop-zoneC.png'))
    walk(750);climb_down(938)
    assert abs(page.evaluate("rooftop.scene.player.body.bottom")-938)<3
    print('C->B: returned down the same ladder',json.dumps(state()),flush=True)

    # --- B's crest jump, onto the solid town-walk-2 bank, up to Machine 1. ---
    running_jump(1000, 1180)
    assert abs(page.evaluate("rooftop.scene.player.body.bottom")-980)<3, 'B jump must land on town-walk-2 (y=980)'
    print('B: real jump to town-walk-2 landed',json.dumps(state()),flush=True)
    page.screenshot(path=str(OUT/'desktop-zoneB.png'))

    # --- Gate-bypass test: workshop-gate must not be jumpable while unsolved. ---
    walk(1290)
    before_x = state()['x']
    page.keyboard.down('d');wait('s.player.x>=1295')
    page.keyboard.press('Space');wait('b.velocity.y<0')
    page.wait_for_timeout(900)
    page.keyboard.up('d');wait('b.blocked.down')
    after = state()
    assert after['x'] < 1600, f"workshop-gate must not be crossable unsolved (x={after['x']})"
    assert after['mode']=='playing'
    print('D: workshop-gate bypass attempt correctly failed',json.dumps(after),flush=True)

    # --- Solve Machine 1, cross the now-open gate. ---
    solve(1250, 980, '6', '7')
    print('D: puzzle 1 solved',json.dumps(state()),flush=True)
    page.screenshot(path=str(OUT/'desktop-zoneD.png'))
    walk(1770)
    assert abs(page.evaluate("rooftop.scene.player.body.bottom")-980)<3, 'workshop-gate must be crossable once solved'

    # --- D -> E: the single long ladder (rise 280). ---
    climb_up(700)
    assert abs(page.evaluate("rooftop.scene.player.body.bottom")-700)<3
    print('D->E: ladder climbed',json.dumps(state()),flush=True)

    # Interaction reachability is checked in the unit suite. Keep this
    # complete A-G run uninterrupted: no body resets or teleports.

    # --- E chain: roof-entry -> roof-laundry (gap 150, drop 40). ---
    running_jump(1920, 2120)
    assert abs(page.evaluate("rooftop.scene.player.body.bottom")-740)<3
    print('E: jumped to roof-laundry',json.dumps(state()),flush=True)

    # Bypass check from the horizontally-closest adjacent deck (roof-laundry,
    # 80px below Machine 2 — only the vertical tolerance protects it).
    page.keyboard.press('e');page.wait_for_timeout(300)
    assert page.evaluate("rooftop.scene.mode")=='playing', 'M2 must not be reachable from roof-laundry'
    print('M2 bypass from roof-laundry blocked (expected)',json.dumps(state()),flush=True)

    # --- E internal ladder (rise 80) up to Machine 2's deck. ---
    walk(2280);climb_up(660)
    assert abs(page.evaluate("rooftop.scene.player.body.bottom")-660)<3
    print('E: ladder to roof-m2 climbed',json.dumps(state()),flush=True)
    page.screenshot(path=str(OUT/'desktop-zoneE.png'))

    solve(2400, 660, '10', '4')
    print('E: puzzle 2 solved on roof-m2',json.dumps(state()),flush=True)
    assert page.evaluate("rooftop.scene.solvedGates.has('rooftop-gate')")
    page.screenshot(path=str(OUT/'desktop-zoneE-m2-solved.png'))

    # --- Cross the now-open rooftop-gate into F (real 40px gap/drop, not a flush step). ---
    running_jump(2850, 2950)
    assert abs(page.evaluate("rooftop.scene.player.body.bottom")-700)<3
    assert page.evaluate("rooftop.scene.checkpointIndex")==1, 'CP2 (post-rooftop) must be reached'
    print('E->F: crossed rooftop-gate, checkpoint 2 reached',json.dumps(state()),flush=True)
    page.screenshot(path=str(OUT/'desktop-zoneF.png'))

    # --- F optional cave alcove: down, collect, back up. Not required. ---
    walk(3000);climb_down(880)
    wait('s.coinsFound>=1')
    print('F: optional cave visited',json.dumps(state()),flush=True)
    page.screenshot(path=str(OUT/'desktop-zoneF-cave.png'))
    climb_up(700)

    # --- F's main step-down jump (gap 150, drop 200), then the ladder to G. ---
    running_jump(3040, 3240)
    assert abs(page.evaluate("rooftop.scene.player.body.bottom")-900)<3
    print('F: step-down jump landed on f-step2',json.dumps(state()),flush=True)
    walk(3230);climb_down(1100)
    assert abs(page.evaluate("rooftop.scene.player.body.bottom")-1100)<3
    print('F->G: descended to ground',json.dumps(state()),flush=True)

    walk(3550)
    assert page.evaluate("rooftop.scene.checkpointIndex")==2, 'CP3 (bridge) must be reached'
    print('G: checkpoint 3 reached',json.dumps(state()),flush=True)
    page.screenshot(path=str(OUT/'desktop-zoneG.png'))

    solve(3650, 1100, '17', '5')
    print('G: puzzle 3 solved',json.dumps(state()),flush=True)
    assert page.evaluate("rooftop.scene.solvedGates.size")==3

    # R resets to the current checkpoint (CP3) but preserves every solved gate.
    page.keyboard.press('r');wait('s.player.x<3650')
    assert page.evaluate('rooftop.scene.solvedGates.size===3 && Math.abs(rooftop.scene.player.body.bottom-1100)<3')
    print('checkpoint recovery preserves solved gates',json.dumps(state()),flush=True)

    walk(4100)
    # V8.7 Phase E: the goal is now a real 'E' exit/door interaction, not an
    # automatic trigger on proximity alone.
    page.keyboard.press('e')
    page.wait_for_selector('#complete[open]')
    print('complete',json.dumps(state()),flush=True)
    page.screenshot(path=str(OUT/'desktop-complete.png'))
    page.click('#replay');wait('s.mode==="playing" && s.solvedGates.size===0 && s.checkpointIndex===-1')
    # V9.9: 8 A/B solid volumes + 3 unchanged ground spans + 9 one-way
    # decks. Machine 1's bank is a solid volume, not a duplicate deck.
    assert len(page.evaluate('rooftop.scene.routePlatforms.map(p=>p.getData("id"))'))==20
    page.keyboard.press('Escape');page.wait_for_selector('#paused[open]')
    before=state();page.wait_for_timeout(300);assert state()['x']==before['x']
    page.keyboard.press('Escape');wait('s.mode==="playing"')
    page.screenshot(path=str(OUT/'desktop-playing.png'))
    print('errors',errors,flush=True)
    assert not errors and not console_errors and not failed_requests
    results={'desktop':'passed','errors':errors,'consoleErrors':console_errors,'failedRequests':failed_requests}
    page.close()

    mobile=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1)
    page=mobile.new_page()
    mobile_errors=[]
    page.on('pageerror',lambda e:mobile_errors.append(str(e)))
    page.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test',wait_until='networkidle')
    page.wait_for_selector('#welcome:not([hidden])')
    page.screenshot(path=str(OUT/'mobile-welcome.png'))
    page.tap('#start');wait('b.blocked.down')
    assert page.locator('#touch-controls').is_visible()
    cdp=mobile.new_cdp_session(page)
    def touch_hold(selector):
        box=page.locator(selector).bounding_box()
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':box['x']+box['width']/2,'y':box['y']+box['height']/2}]})
    def touch_release():
        cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    touch_hold('[data-hold="right"]');wait('s.player.x>210');touch_release();wait('Math.abs(b.velocity.x)<1')
    page.tap('[data-action="jump"]');wait('b.velocity.y<0');wait('b.blocked.down')
    page.screenshot(path=str(OUT/'mobile-playing.png'))
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.set_viewport_size({'width':844,'height':390})
    page.wait_for_timeout(400)
    page.screenshot(path=str(OUT/'mobile-landscape.png'))
    page.evaluate('rooftop.scene.player.body.reset(1250,950)')
    wait('b.blocked.down')
    page.tap('[data-action="interact"]');page.wait_for_selector('#puzzle[open]')
    page.set_viewport_size({'width':390,'height':844})
    page.locator('#answer').fill('7');page.screenshot(path=str(OUT/'mobile-puzzle.png'))
    page.tap('#answer-form button');wait('s.solvedGates.size===1')
    # V8 Phase 5: correct answer now holds the dialog open on the worked
    # reasoning until the student taps "Teruskan" — same on mobile.
    page.wait_for_selector('#puzzle-continue:not([hidden])')
    page.tap('#puzzle-continue');wait('s.mode==="playing"')
    page.tap('#pause');page.wait_for_selector('#paused[open]');page.tap('#resume');wait('s.mode==="playing"')
    assert not mobile_errors
    results['mobile']='touch run/jump/interact, rotate, puzzle and pause passed'
    results['mobileErrors']=mobile_errors
    page.close()

    page=browser.new_page(viewport={'width':1280,'height':800})
    page.route('**/chill-boy/idle-00.png',lambda route:route.abort())
    page.goto('http://127.0.0.1:8765/app/addmath/rooftop/',wait_until='networkidle')
    page.wait_for_function('document.getElementById("loading").textContent.includes("Aset tidak dapat")')
    assert not page.locator('#welcome').is_visible()
    results['missingAsset']='visible failure with asset key, no broken start'
    page.close()

    page=browser.new_page()
    page.goto('http://127.0.0.1:8765/app/addmath/',wait_until='domcontentloaded')
    page.wait_for_selector('#start-mula');assert page.locator('a[href="rooftop/"]').count()==1
    page.click('#start-mula');page.click('#choose-4');page.wait_for_url('**/#/map/4')
    results['learningApp']='home, original MULA and Tingkatan 4 map preserved'
    (OUT/'browser-results.json').write_text(json.dumps(results,indent=2))
    print(json.dumps(results),flush=True)
    browser.close()
