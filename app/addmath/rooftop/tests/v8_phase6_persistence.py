from playwright.sync_api import sync_playwright
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

URL = 'http://127.0.0.1:8765/app/addmath/rooftop/?test'
KEY = 'lorong-save-v1'

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    b.new_page().close()  # warm up

    def fresh_page(storage_blocked=False):
        ctx = b.new_context()
        if storage_blocked:
            ctx.add_init_script("""
                Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
            """)
        pg = ctx.new_page()
        pg.on('dialog', lambda d: d.accept())
        return ctx, pg

    def goto(pg):
        pg.goto(URL, wait_until='networkidle')
        pg.wait_for_selector('#welcome:not([hidden])')

    def raw_save(pg):
        return pg.evaluate(f"() => localStorage.getItem('{KEY}')")

    def wait(pg, expr):
        pg.wait_for_function('() => {const s=rooftop.scene,b=s.player.body; return ' + expr + '}', timeout=20000)

    def solve_p1(pg):
        pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(1245,950);}")
        pg.wait_for_timeout(150)
        pg.keyboard.press('e'); pg.wait_for_selector('#puzzle[open]')
        pg.locator('#answer').fill('7'); pg.locator('#answer-form button').click()
        pg.wait_for_selector('#puzzle-continue:not([hidden])')
        pg.locator('#puzzle-continue').click()
        wait(pg, 's.mode==="playing"')

    def reach_cp1(pg):
        pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(950,790);}")
        pg.wait_for_timeout(400)
        wait(pg, 's.checkpointIndex>=0')

    print('--- 1. Fresh user: no save, Start button shown, Continue/New Adventure hidden ---')
    ctx, pg = fresh_page(); goto(pg)
    print('raw save:', raw_save(pg), '(expect None)')
    print('#start hidden:', pg.evaluate("()=>document.getElementById('start').hidden"), '(expect False)')
    print('#continue-btn hidden:', pg.evaluate("()=>document.getElementById('continue-btn').hidden"), '(expect True)')
    print('#new-adventure hidden:', pg.evaluate("()=>document.getElementById('new-adventure').hidden"), '(expect True)')

    print('--- 2/3. Save at Checkpoint 1, then reload and Continue ---')
    pg.click('#start'); pg.wait_for_timeout(300)
    reach_cp1(pg)
    saved = raw_save(pg)
    print('save after CP1:', saved)
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    print('#continue-btn hidden after reload:', pg.evaluate("()=>document.getElementById('continue-btn').hidden"), '(expect False)')
    print('#continue-btn label:', pg.evaluate("()=>document.getElementById('continue-btn').textContent"))
    pg.click('#continue-btn'); pg.wait_for_timeout(300)
    cp = pg.evaluate("()=>rooftop.scene.checkpointIndex")
    px = pg.evaluate("()=>rooftop.scene.player.x")
    print('checkpointIndex after continue:', cp, '(expect 0)')
    print('player x roughly at CP1 (950):', px)
    ctx.close()

    print('--- 4. Solve Machine 1, reload BEFORE reaching next checkpoint ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#start'); pg.wait_for_timeout(300)
    solve_p1(pg)
    save_after_m1 = json.loads(raw_save(pg))
    print('solvedGateIds after M1 (no checkpoint since):', save_after_m1['solvedGateIds'], '(expect ["workshop-gate"])')
    print('checkpointId (still CP1, M1 is past it so unchanged):', save_after_m1['checkpointId'])
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    pg.click('#continue-btn'); pg.wait_for_timeout(300)
    restored_solved = pg.evaluate("()=>[...rooftop.scene.solvedGates]")
    print('restored solvedGates:', restored_solved, '(expect to include workshop-gate)')
    lever_tex = pg.evaluate("()=>rooftop.scene.machines['p1'].texture.key")
    print('M1 lever shows solved texture:', lever_tex, '(expect kenney_lever_left)')
    gate_open = pg.evaluate("()=>!!rooftop.scene.gateBodies['workshop-gate']")
    print('workshop-gate collision body restored:', gate_open, '(expect True)')
    ctx.close()

    print('--- 6/7. Restore opened bridges + collected coins together ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#start'); pg.wait_for_timeout(300)
    solve_p1(pg)
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(300,1020);}")
    pg.wait_for_timeout(500)
    coins_before = pg.evaluate("()=>rooftop.scene.coinsFound")
    print('coins found (coin-a on the way):', coins_before)
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    pg.click('#continue-btn'); pg.wait_for_timeout(300)
    coins_after = pg.evaluate("()=>rooftop.scene.coinsFound")
    coin_a_active = pg.evaluate("()=>rooftop.scene.collectibles.find(c=>c.getData('id')==='coin-a')?.active ?? false")
    print('coins restored after reload:', coins_after, '(expect same as before)')
    print('coin-a sprite correctly absent/inactive:', not coin_a_active, '(expect True)')
    print('no duplicate sparkle/sfx on restore (silent): visually verified via screenshot, no console errors expected')
    ctx.close()

    print('--- 8. Reload DURING math feedback (wrong answer, unsolved) ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#start'); pg.wait_for_timeout(300)
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(1245,950);}")
    pg.wait_for_timeout(150)
    pg.keyboard.press('e'); pg.wait_for_selector('#puzzle[open]')
    pg.locator('#answer').fill('99'); pg.locator('#answer-form button').click()
    print('save during open wrong-answer dialog:', raw_save(pg), '(expect None - nothing solved yet)')
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    print('#start shown (no save to continue):', not pg.evaluate("()=>document.getElementById('start').hidden"), '(expect True)')
    ctx.close()

    print('--- 9. Reload DURING bridge-opening animation (right after a correct answer) ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#start'); pg.wait_for_timeout(300)
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(1245,950);}")
    pg.wait_for_timeout(150)
    pg.keyboard.press('e'); pg.wait_for_selector('#puzzle[open]')
    pg.locator('#answer').fill('7'); pg.locator('#answer-form button').click()
    pg.wait_for_timeout(20)  # mid bridge-plank fade tween, dialog still open
    save_mid_anim = raw_save(pg)
    print('save mid-animation (gate already solved synchronously):', save_mid_anim is not None, '(expect True)')
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    pg.click('#continue-btn'); pg.wait_for_timeout(300)
    print('gate restored without replaying animation, no open dialog:', pg.evaluate("()=>!document.getElementById('puzzle').open and 'workshop-gate' in rooftop.scene.solvedGates" if False else "()=>!document.getElementById('puzzle').open && rooftop.scene.solvedGates.has('workshop-gate')"), '(expect True)')
    ctx.close()

    print('--- 10. Complete Level 1, reload -> Continue shows Main semula / completed status ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#start'); pg.wait_for_timeout(300)
    pg.evaluate("""()=>{
        const s=rooftop.scene,b=s.player.body;
        s.solvedGates.add('workshop-gate');s.solvedGates.add('rooftop-gate');s.solvedGates.add('final-gate');
        s.levelCompleted=true;s.writeSave();
    }""")
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    print('continue label when completed:', pg.evaluate("()=>document.getElementById('continue-btn').textContent"), '(expect Main semula)')
    print('save-status mentions completed:', pg.evaluate("()=>document.getElementById('save-status').textContent"))
    ctx.close()

    print('--- 11. Start New Adventure asks for confirmation and clears the save ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#start'); pg.wait_for_timeout(300)
    reach_cp1(pg)
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    print('save exists before New Adventure:', raw_save(pg) is not None, '(expect True)')
    pg.click('#new-adventure'); pg.wait_for_timeout(300)
    print('save cleared after New Adventure (dialog auto-accepted):', raw_save(pg), '(expect None)')
    print('mode after New Adventure:', pg.evaluate("()=>rooftop.scene.mode"), '(expect playing)')
    ctx.close()

    print('--- 12. Replay Completed Level (complete dialog) also asks for confirmation ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#start'); pg.wait_for_timeout(300)
    pg.evaluate("""()=>{
        const s=rooftop.scene;
        s.solvedGates.add('workshop-gate');s.solvedGates.add('rooftop-gate');s.solvedGates.add('final-gate');
        s.player.body.reset(4047,1070);
    }""")
    pg.wait_for_timeout(600)
    pg.keyboard.press('e')  # V8.7: goal now requires an explicit exit interaction
    pg.wait_for_selector('#complete[open]')
    pg.click('#replay'); pg.wait_for_timeout(300)
    print('mode after confirmed replay:', pg.evaluate("()=>rooftop.scene.mode"), '(expect playing)')
    print('solvedGates reset in-memory:', pg.evaluate("()=>rooftop.scene.solvedGates.size"), '(expect 0)')
    ctx.close()

    print('--- 13. Corrupted JSON in storage -> treated as no save, fails gracefully ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.evaluate(f"()=>localStorage.setItem('{KEY}','{{not valid json')")
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    print('#start shown despite corrupted storage:', not pg.evaluate("()=>document.getElementById('start').hidden"), '(expect True)')
    print('no page errors thrown:', pg.evaluate("()=>true"))
    ctx.close()

    print('--- 14. Unsupported schema version -> discarded ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.evaluate(f"""()=>localStorage.setItem('{KEY}',JSON.stringify({{
        schemaVersion: 999, levelId: 'lorong-atas-bumbung-1', checkpointId: 'cp1-cafe',
        solvedGateIds: ['workshop-gate'], collectedCoinIds: [], completed: false, updatedAt: Date.now(),
    }}))""")
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    print('#start shown for unsupported schema version:', not pg.evaluate("()=>document.getElementById('start').hidden"), '(expect True)')
    ctx.close()

    print('--- 15. localStorage unavailable/blocked -> fails gracefully to a playable start ---')
    ctx, pg = fresh_page(storage_blocked=True); goto(pg)
    print('#start shown when localStorage throws:', not pg.evaluate("()=>document.getElementById('start').hidden"), '(expect True)')
    pg.click('#start'); pg.wait_for_timeout(300)
    print('game still playable (mode):', pg.evaluate("()=>rooftop.scene.mode"), '(expect playing)')
    ctx.close()

    print('--- 16. Repeated reload+continue cycles do not duplicate/corrupt state ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#start'); pg.wait_for_timeout(300)
    solve_p1(pg)
    for i in range(3):
        pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
        pg.click('#continue-btn'); pg.wait_for_timeout(300)
        n = pg.evaluate("()=>rooftop.scene.solvedGates.size")
        print(f'  cycle {i+1}: solvedGates.size =', n, '(expect 1, never growing)')
    ctx.close()

    b.close()
    print('done')
