"""V8.7 Phase E: the goal's exit/door interaction, tested directly."""
from playwright.sync_api import sync_playwright
import sys
sys.stdout.reconfigure(encoding='utf-8')

URL = 'http://127.0.0.1:8765/app/addmath/rooftop/?test'

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

    print('--- Exit is NOT available before all three gates are solved ---')
    ctx, pg = fresh()
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(4047,1070);}")
    pg.wait_for_timeout(300)
    pg.keyboard.press('e')
    pg.wait_for_timeout(300)
    print('solvedGates (expect 0):', pg.evaluate("()=>rooftop.scene.solvedGates.size"))
    print('mode stays playing, no completion triggered:', pg.evaluate("()=>rooftop.scene.mode"), '(expect playing)')
    print('no exit prompt shown when gates unsolved:', not pg.evaluate("()=>rooftop.scene.prompt.visible"), '(expect True)')
    ctx.close()

    print('--- Exit prompt appears, and only completes on explicit E ---')
    ctx, pg = fresh()
    pg.evaluate("""()=>{
        const s=rooftop.scene;
        s.solvedGates.add('workshop-gate');s.solvedGates.add('rooftop-gate');s.solvedGates.add('final-gate');
        s.player.body.reset(4047,1070);
    }""")
    pg.wait_for_timeout(400)
    print('prompt visible at goal once solved:', pg.evaluate("()=>rooftop.scene.prompt.visible"), '(expect True)')
    print('prompt text:', pg.evaluate("()=>rooftop.scene.prompt.text"))
    print('mode still playing before pressing E (no auto-trigger):', pg.evaluate("()=>rooftop.scene.mode"), '(expect playing)')
    pg.keyboard.press('e')
    pg.wait_for_selector('#complete[open]')
    print('mode after explicit E:', pg.evaluate("()=>rooftop.scene.mode"), '(expect complete)')
    ctx.close()

    print('--- Completion summary reflects real gameplay data ---')
    ctx, pg = fresh()
    # V9.6 (audits/level-v9/phase6-real-kenney-layout/): coin-a moved from
    # (300,1050) to (340,940) — now the crate puzzle's own ledge reward,
    # not a ground-level pickup — so the teleport target moved with it.
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(432,916-30);}")
    pg.wait_for_timeout(400)  # picks up coin-a
    pg.evaluate("""()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(680,820-30);}""")
    pg.wait_for_timeout(100)
    pg.keyboard.press('e'); pg.wait_for_timeout(200)  # Si Oyen secret
    pg.evaluate("""()=>{
        const s=rooftop.scene;
        s.solvedGates.add('workshop-gate');s.solvedGates.add('rooftop-gate');s.solvedGates.add('final-gate');
        s.player.body.reset(4047,1070);
    }""")
    pg.wait_for_timeout(300)
    pg.keyboard.press('e')
    pg.wait_for_selector('#complete[open]')
    print('coins in summary:', pg.locator('#completion-coins').inner_text(), '(expect 1/7)')  # confirms the relocated coin-a is still reachable/collectible
    print('secrets in summary:', pg.locator('#completion-secrets').inner_text(), '(expect 1/3)')
    print('machines in summary:', pg.locator('#completion-puzzles').inner_text(), '(expect 3/3)')
    ctx.close()

    print('--- Return to Level Select from completion works ---')
    ctx, pg = fresh()
    pg.evaluate("""()=>{
        const s=rooftop.scene;
        s.solvedGates.add('workshop-gate');s.solvedGates.add('rooftop-gate');s.solvedGates.add('final-gate');
        s.player.body.reset(4047,1070);
    }""")
    pg.wait_for_timeout(300)
    pg.keyboard.press('e')
    pg.wait_for_selector('#complete[open]')
    pg.click('#complete-level-select')
    pg.wait_for_selector('#level-select[open]')
    print('level1-status after exit+complete:', pg.locator('#level1-status').inner_text(), '(expect Selesai)')
    ctx.close()

    print('--- Save/Continue preserved: exit-triggered completion persists ---')
    ctx, pg = fresh()
    pg.evaluate("""()=>{
        const s=rooftop.scene;
        s.solvedGates.add('workshop-gate');s.solvedGates.add('rooftop-gate');s.solvedGates.add('final-gate');
        s.player.body.reset(4047,1070);
    }""")
    pg.wait_for_timeout(300)
    pg.keyboard.press('e')
    pg.wait_for_selector('#complete[open]')
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    print('continue-btn label after reload (completed persisted):', pg.locator('#continue-btn').inner_text(), '(expect Main semula)')
    ctx.close()

    b.close()
    print('done')
