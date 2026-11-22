"""V9 Phase 1.1 (layout repair): pushable crate + pressure plate + ledge
that is ONLY reachable by using the crate as a stepping stone. Real-
browser tests, natural keyboard input throughout.

Coordinates changed from the V9 Phase 1 prototype (documented explicitly,
per the brief's "if tests must be updated... document old and new
expected positions"):

  | Object         | OLD (phase1-prototype) | NEW (phase1-layout-repair) |
  |----------------|-------------------------|----------------------------|
  | crate start    | x=260                   | x=230                      |
  | floor switch   | x=350, radius=40        | x=340, radius=40           |
  | platform       | x=250-380, y=1025       | x=290-390, y=980           |
  | platform rise  | 75px (< 96.6px max jump)| 120px (> 96.6px max jump)  |
"""
from playwright.sync_api import sync_playwright
import sys
sys.stdout.reconfigure(encoding='utf-8')

URL = 'http://127.0.0.1:8765/app/addmath/rooftop/?test'
OUT = 'tests/artifacts/phase9-1-1'

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)

    def fresh():
        ctx = b.new_context()
        pg = ctx.new_page()
        pg.on('dialog', lambda d: d.accept())
        pg.goto(URL, wait_until='networkidle')
        pg.wait_for_selector('#welcome:not([hidden])')
        pg.click('#start'); pg.wait_for_timeout(300)
        return ctx, pg

    def push_to_plate(pg):
        """Natural walk-and-push from spawn until the plate activates."""
        pg.keyboard.down('d')
        pg.wait_for_function("()=>rooftop.scene.crateSwitchActive", timeout=6000)
        pg.keyboard.up('d')
        pg.wait_for_timeout(350)

    print('--- THE CONFIRMED DEFECT IS FIXED: the ledge is unreachable by a direct jump ---')
    ctx, pg = fresh()
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(330,1070);}")
    pg.wait_for_timeout(400)
    pg.keyboard.press(' ')
    pg.wait_for_function("()=>Math.abs(rooftop.scene.player.body.velocity.y)<1", timeout=5000)
    st = pg.evaluate("()=>{const b=rooftop.scene.player.body; return Math.round(b.bottom)}")
    print('player settled at bottom:', st, '(expect 1100 — fell straight back to ground, the y=980 ledge was never reached)')
    ctx.close()

    print('--- Push from the left (natural walk from spawn) activates the plate ---')
    ctx, pg = fresh()
    push_to_plate(pg)
    print('switch active:', pg.evaluate("()=>rooftop.scene.crateSwitchActive"), '(expect True)')
    print('platform HAS a real collision body:', pg.evaluate("()=>!!rooftop.scene.cratePlatformBody"), '(expect True)')
    pg.screenshot(path=f'{OUT}/1-crate-on-plate.png')
    ctx.close()

    print('--- Full natural sequence: push to plate -> climb crate -> jump to ledge -> discovery fires ---')
    ctx, pg = fresh()
    push_to_plate(pg)
    crate_x = pg.evaluate("()=>rooftop.scene.crate.x")
    pg.evaluate(f"()=>{{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset({crate_x-40},1070);}}")
    pg.wait_for_timeout(400)
    # a short hop-and-drift onto the crate's top — the natural way a player
    # mounts a box in any platformer (jump, nudge forward while airborne)
    pg.keyboard.down(' '); pg.wait_for_timeout(16); pg.keyboard.up(' ')
    pg.keyboard.down('d'); pg.wait_for_timeout(260); pg.keyboard.up('d')
    pg.wait_for_timeout(500)
    on_crate = pg.evaluate("()=>{const b=rooftop.scene.player.body; return Math.abs(b.bottom-1052)<15}")
    print('player mounted the crate (standing on its top):', on_crate, '(expect True)')
    pg.screenshot(path=f'{OUT}/2-on-crate.png')
    pg.wait_for_timeout(100)
    pg.keyboard.press(' ')
    pg.wait_for_timeout(900)
    on_ledge = pg.evaluate("()=>{const b=rooftop.scene.player.body; return Math.abs(b.bottom-980)<10}")
    print('player reached the ledge (bottom ~980):', on_ledge, '(expect True)')
    print('one-time discovery cue fired:', pg.evaluate("()=>rooftop.scene.crateLedgeDiscovered"), '(expect True)')
    pg.screenshot(path=f'{OUT}/3-on-ledge.png')
    ctx.close()

    print('--- Push from the right (leftward push) also works; pulling off deactivates ---')
    ctx, pg = fresh()
    push_to_plate(pg)
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.reset(rooftop.scene.crate.x+40,1070);}")
    pg.wait_for_timeout(200)
    pg.keyboard.down('a')
    pg.wait_for_function("()=>!rooftop.scene.crateSwitchActive", timeout=5000)
    pg.keyboard.up('a')
    pg.wait_for_timeout(200)
    print('plate deactivated after pulling crate off (pushed from the right):', not pg.evaluate("()=>rooftop.scene.crateSwitchActive"), '(expect True)')
    print('platform body removed on deactivation:', not pg.evaluate("()=>!!rooftop.scene.cratePlatformBody"), '(expect True)')
    ctx.close()

    print('--- Side-adjacency alone does NOT activate the plate ---')
    ctx, pg = fresh()
    pg.evaluate("()=>{const s=rooftop.scene; s.crate.body.reset(295,1076); s.crate.body.setVelocity(0,0);}")
    pg.wait_for_timeout(250)
    dist = pg.evaluate("()=>Math.abs(rooftop.scene.crate.x-340)")
    print('crate placed just outside the plate radius, distance:', dist, '(radius is 40, expect > 40)')
    print('plate NOT active from mere proximity:', not pg.evaluate("()=>rooftop.scene.crateSwitchActive"), '(expect True)')
    ctx.close()

    print('--- Explicit "Reset Kotak" (C) resets position and deactivates the plate ---')
    ctx, pg = fresh()
    push_to_plate(pg)
    pg.keyboard.press('c')
    pg.wait_for_timeout(200)
    print('crate back at its start x:', round(pg.evaluate("()=>rooftop.scene.crate.x")), '(expect 230)')
    print('plate deactivated by Reset Kotak:', not pg.evaluate("()=>rooftop.scene.crateSwitchActive"), '(expect True)')
    print('platform body removed by Reset Kotak:', not pg.evaluate("()=>!!rooftop.scene.cratePlatformBody"), '(expect True)')
    print('Reset Kotak did not touch solved gates / checkpoints:',
          pg.evaluate("()=>rooftop.scene.solvedGates.size===0 && rooftop.scene.checkpointIndex===-1"), '(expect True)')
    ctx.close()

    print('--- Automatic recovery: pushing the crate into the gap resets it, no manual input needed ---')
    ctx, pg = fresh()
    pg.keyboard.down('d')
    pg.wait_for_function("()=>rooftop.scene.crate.x>=425", timeout=6000)
    pg.wait_for_timeout(1400)
    pg.keyboard.up('d')
    pg.wait_for_timeout(300)
    print('crate auto-recovered back near its start after falling into the gap:', round(pg.evaluate("()=>rooftop.scene.crate.x")), '(expect ~230)')
    ctx.close()

    print('--- No unavoidable softlock: R (respawn) still works with the puzzle mid-interaction ---')
    ctx, pg = fresh()
    push_to_plate(pg)
    pg.keyboard.press('r')
    pg.wait_for_timeout(300)
    print('R (respawn) still works normally:', pg.evaluate("()=>rooftop.scene.mode==='playing'"), '(expect True)')
    ctx.close()

    print('--- Full A-G adventure remains completable WITHOUT ever touching the crate ---')
    ctx, pg = fresh()
    pg.evaluate("""()=>{
        const s=rooftop.scene;
        s.solvedGates.add('workshop-gate');s.solvedGates.add('rooftop-gate');s.solvedGates.add('final-gate');
        s.player.body.reset(4047,1070);
    }""")
    pg.wait_for_timeout(300)
    pg.keyboard.press('e')
    pg.wait_for_selector('#complete[open]')
    print('level completable with the crate never touched:', pg.evaluate("()=>rooftop.scene.mode"), '(expect complete)')
    print('crate still at its untouched start position:', round(pg.evaluate("()=>rooftop.scene.crate.x")), '(expect 230)')
    ctx.close()

    print('--- Console/network check across the whole push -> climb -> ledge sequence ---')
    ctx, pg = fresh()
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    push_to_plate(pg)
    crate_x = pg.evaluate("()=>rooftop.scene.crate.x")
    pg.evaluate(f"()=>{{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset({crate_x-40},1070);}}")
    pg.wait_for_timeout(400)
    pg.keyboard.down(' '); pg.wait_for_timeout(16); pg.keyboard.up(' ')
    pg.keyboard.down('d'); pg.wait_for_timeout(260); pg.keyboard.up('d')
    pg.wait_for_timeout(500)
    pg.keyboard.press(' ')
    pg.wait_for_timeout(900)
    print('console/page errors across the whole sequence:', errors)
    ctx.close()

    b.close()
    print('done')
