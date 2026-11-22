"""V9.6 — natural-input reachability checks for the redesigned A/B visuals
and the repositioned crate-ledge coin. Uses held keys exactly like a human
player (no teleports for any of the checked transitions)."""
from playwright.sync_api import sync_playwright
import json

URL = 'http://127.0.0.1:8765/app/addmath/rooftop/?test'

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    ctx = b.new_context()
    pg = ctx.new_page()
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('dialog', lambda d: d.accept())
    pg.goto(URL, wait_until='networkidle')
    pg.wait_for_selector('#welcome:not([hidden])')
    pg.click('#start'); pg.wait_for_timeout(300)

    def state():
        return pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; return {x:s.player.x,feet:b.bottom,ground:b.blocked.down,coins:s.coinsFound}}")
    def wait(expr):
        pg.wait_for_function('() => {const s=rooftop.scene,b=s.player.body; return '+expr+'}', timeout=20000)

    # --- First gap (natural input) ---
    pg.keyboard.down('d'); wait('s.player.x>=390')
    pg.keyboard.press('Space'); wait('b.velocity.y<0')
    wait('s.player.x>=560'); pg.keyboard.up('d'); wait('b.blocked.down')
    assert abs(state()['feet']-1100) < 3
    print('First gap: cleared naturally,', json.dumps(state()))

    # --- Crate puzzle: push crate from x=230 to the switch at x=340 ---
    pg.keyboard.down('a'); wait('s.player.x<=250'); pg.keyboard.up('a'); wait('Math.abs(b.velocity.x)<1')
    crate_x = pg.evaluate("()=>rooftop.scene.crate.x")
    print('crate at start x:', crate_x, '(expect ~230)')
    pg.keyboard.down('d')
    wait('rooftop.scene.crateSwitchActive === true')
    pg.keyboard.up('d'); wait('Math.abs(b.velocity.x)<1')
    print('switch activated by pushing the crate:', pg.evaluate("()=>rooftop.scene.crateSwitchActive"))
    assert pg.evaluate("()=>rooftop.scene.cratePlatformBody !== null"), 'ledge platform must spawn once the switch is active'

    # --- Climb onto the ledge and collect the relocated coin-a ---
    # Same proven two-hop sequence as tests/v9_phase1_crate.py: a short
    # hop-and-drift to mount the crate's top, then a second jump from
    # there onto the unlocked ledge (crate-top rise 72px, ledge rise from
    # crate-top 72px — both within the 96.6px max unaided jump rise; the
    # ground-to-ledge rise of 120px alone is NOT, which is the whole point
    # of the puzzle).
    crate_x = pg.evaluate("()=>rooftop.scene.crate.x")
    pg.keyboard.down('a')
    wait(f's.player.x <= {crate_x-40}')
    pg.keyboard.up('a')
    pg.wait_for_timeout(400)
    pg.keyboard.down(' '); pg.wait_for_timeout(16); pg.keyboard.up(' ')
    pg.keyboard.down('d'); pg.wait_for_timeout(260); pg.keyboard.up('d')
    pg.wait_for_timeout(500)
    on_crate = pg.evaluate("()=>{const b=rooftop.scene.player.body; return Math.abs(b.bottom-1052)<15}")
    print('player mounted the crate top naturally:', on_crate, '(expect True)')
    pg.keyboard.press(' ')
    pg.wait_for_timeout(900)
    st = state()
    print('on the ledge:', json.dumps(st))
    assert abs(st['feet']-980) < 10, 'player must actually be standing on the unlocked ledge (feet~980), not back on the ground'
    assert st['coins'] >= 1, f"coin-a must be collectible from the ledge naturally (coins={st['coins']})"
    print('coin-a collected via the natural crate->ledge sequence: coinsFound =', st['coins'])

    # --- Reset Kotak still works mid-interaction ---
    pg.keyboard.press('r'); wait('s.player.x < 100 && b.blocked.down')
    pg.keyboard.press('c'); pg.wait_for_timeout(200)
    print('Reset Kotak after use: crate back at', pg.evaluate("()=>rooftop.scene.crate.x"), '(expect ~230)')
    assert abs(pg.evaluate("()=>rooftop.scene.crate.x") - 230) < 3

    # --- A->B ladder, B jump, reach Machine 1 (mandatory route) ---
    def walk(target):
        x = pg.evaluate("()=>rooftop.scene.player.x")
        key = 'd' if x < target else 'a'
        pg.keyboard.down(key)
        wait(f's.player.x {">=" if x<target else "<="} {target}')
        pg.keyboard.up(key); wait('Math.abs(b.velocity.x)<1')
    # Reset Kotak just put the crate back at its start (x~230), directly
    # in the walk-forward path from the respawn point (x=80) — continuing
    # to HOLD right would just shove the crate ahead the whole way, into
    # the first gap's void, which is not how a real player actually
    # crosses it (they jump it, same as every earlier pass of this gap).
    # So: jump the gap again, same as the very first check in this test,
    # rather than naively walking through it a second time.
    pg.keyboard.down('d'); wait('s.player.x>=390')
    pg.keyboard.press('Space'); wait('b.velocity.y<0')
    wait('s.player.x>=560'); pg.keyboard.up('d'); wait('b.blocked.down')
    print('first gap re-crossed (post Reset Kotak) via a real jump, not by shoving the crate into it')
    walk(610)
    pg.keyboard.down('w'); wait('b.bottom<=981 && !s.climbing'); pg.keyboard.up('w'); wait('b.blocked.down')
    print('A->B ladder climbed naturally, feet=', pg.evaluate("()=>rooftop.scene.player.body.bottom"))
    pg.keyboard.down('d'); wait('s.player.x>=860')
    pg.keyboard.press('Space'); wait('b.velocity.y<0')
    wait('s.player.x>=1060'); pg.keyboard.up('d'); wait('b.blocked.down')
    assert abs(pg.evaluate("()=>rooftop.scene.player.body.bottom")-980) < 3, 'B jump must land on town-walk-2'
    print('B jump landed on town-walk-2 naturally')
    walk(1250)
    pg.keyboard.press('e'); pg.wait_for_selector('#puzzle[open]')
    pg.locator('#answer').fill('7'); pg.locator('#answer-form button').click()
    pg.wait_for_selector('#puzzle-continue:not([hidden])'); pg.locator('#puzzle-continue').click()
    wait('s.mode==="playing"')
    print('Machine 1 solved, workshop-gate opens naturally')
    walk(1770)
    assert abs(pg.evaluate("()=>rooftop.scene.player.body.bottom")-980) < 3, 'B->D transition must still work'
    print('B->D transition confirmed:', json.dumps(state()))

    print('errors', errors)
    assert errors == []
    ctx.close()
    b.close()
print('done')
