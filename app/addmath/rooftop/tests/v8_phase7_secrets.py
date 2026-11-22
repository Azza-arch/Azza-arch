from playwright.sync_api import sync_playwright
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

URL = 'http://127.0.0.1:8765/app/addmath/rooftop/?test'
KEY = 'lorong-save-v1'

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)

    def fresh_page(**ctx_kwargs):
        ctx = b.new_context(**ctx_kwargs)
        pg = ctx.new_page()
        pg.on('dialog', lambda d: d.accept())
        return ctx, pg

    def goto_and_start(pg):
        pg.goto(URL, wait_until='networkidle')
        pg.wait_for_selector('#welcome:not([hidden])')
        pg.click('#start'); pg.wait_for_timeout(300)

    def wait(pg, expr):
        pg.wait_for_function('() => {const s=rooftop.scene,b=s.player.body; return ' + expr + '}', timeout=20000)

    def raw_save(pg):
        return pg.evaluate(f"() => localStorage.getItem('{KEY}')")

    def go_to_secret(pg, secret_id):
        pos = pg.evaluate(f"()=>rooftop.constants.SECRETS.find(s=>s.id==='{secret_id}')")
        pg.evaluate(f"()=>{{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset({pos['x']},{pos['feet']}-30);}}")
        pg.wait_for_timeout(250)

    print('--- Main adventure completable with ZERO secrets found ---')
    ctx, pg = fresh_page(); goto_and_start(pg)
    # same spawn->goal walk used by probe.py's own "complete" path, condensed:
    pg.evaluate("""()=>{
        const s=rooftop.scene;
        s.solvedGates.add('workshop-gate');s.solvedGates.add('rooftop-gate');s.solvedGates.add('final-gate');
        s.player.body.reset(4047,1070);
    }""")
    pg.wait_for_timeout(600)
    pg.keyboard.press('e')  # V8.7: goal now requires an explicit exit interaction
    pg.wait_for_timeout(200)
    print('finished with 0 secrets:', pg.evaluate("()=>rooftop.scene.mode"), pg.evaluate("()=>rooftop.scene.discoveredSecrets.size"), '(expect complete, 0)')
    ctx.close()

    print('--- Secret A: Si Oyen (direct interact, no dialog) ---')
    ctx, pg = fresh_page(); goto_and_start(pg)
    go_to_secret(pg, 'secret-oyen')
    before_mode = pg.evaluate("()=>rooftop.scene.mode")
    pg.keyboard.press('e'); pg.wait_for_timeout(200)
    after_mode = pg.evaluate("()=>rooftop.scene.mode")
    found = pg.evaluate("()=>rooftop.scene.discoveredSecrets.has('secret-oyen')")
    status_text = pg.evaluate("()=>document.getElementById('status').textContent")
    print('mode stays playing (no dialog):', before_mode, '->', after_mode, '(expect playing -> playing)')
    print('secret-oyen discovered:', found, '(expect True)')
    print('status toast:', status_text)
    pg.screenshot(path='tests/artifacts/phase7/discover-oyen.png')
    # duplicate-award guard: press e again right away
    pg.keyboard.press('e'); pg.wait_for_timeout(150)
    print('still exactly 1 discovered after re-pressing e:', pg.evaluate("()=>rooftop.scene.discoveredSecrets.size"), '(expect 1)')
    ctx.close()

    print('--- Secret B: Nota Fungsi Misteri (opens dialog, educational, no answer leak) ---')
    ctx, pg = fresh_page(); goto_and_start(pg)
    go_to_secret(pg, 'secret-function-note')
    pg.keyboard.press('e'); pg.wait_for_selector('#secret-note[open]')
    note_text = pg.locator('#secret-note-body').inner_text()
    print('note dialog opened, mode:', pg.evaluate("()=>rooftop.scene.mode"), '(expect note)')
    print('note text:', repr(note_text))
    print('note does not leak any mandatory answer (7, x=4, x=5):', not any(t in note_text for t in ['= 7.', 'x = 4', 'x = 5']), '(expect True)')
    print('discovered on open:', pg.evaluate("()=>rooftop.scene.discoveredSecrets.has('secret-function-note')"), '(expect True)')
    pg.screenshot(path='tests/artifacts/phase7/discover-note.png')
    pg.locator('#secret-note-close').click(); pg.wait_for_timeout(150)
    print('mode after closing note:', pg.evaluate("()=>rooftop.scene.mode"), '(expect playing)')
    ctx.close()

    print('--- Secret C: Khazanah Gua (reuses coin-style sparkle + SFX.coin) ---')
    ctx, pg = fresh_page(); goto_and_start(pg)
    go_to_secret(pg, 'secret-cave-treasure')
    pg.keyboard.press('e'); pg.wait_for_timeout(200)
    print('secret-cave-treasure discovered:', pg.evaluate("()=>rooftop.scene.discoveredSecrets.has('secret-cave-treasure')"), '(expect True)')
    pg.screenshot(path='tests/artifacts/phase7/discover-cave-treasure.png')
    ctx.close()

    print('--- Collection UI: Koleksi screen reflects found/undiscovered state ---')
    ctx, pg = fresh_page(); goto_and_start(pg)
    go_to_secret(pg, 'secret-oyen')
    pg.keyboard.press('e'); pg.wait_for_timeout(200)
    # V8 Phase 8: the collection UI moved from inline-in-pause into its own
    # #collection dialog, reached via the main menu's or pause menu's
    # "Koleksi" button. Reached here through pause since the player is
    # mid-run.
    pg.keyboard.press('Escape'); pg.wait_for_selector('#paused[open]')
    pg.click('#pause-collection-btn'); pg.wait_for_selector('#collection[open]')
    count_text = pg.locator('#secrets-count').inner_text()
    items = pg.locator('#secrets-list li').all_inner_texts()
    print('secrets-count:', count_text, '(expect 1/3)')
    print('list items:', items)
    locked_count = pg.locator('#secrets-list li.locked').count()
    print('locked (undiscovered) slots do not reveal title/location:', locked_count, '(expect 2, each showing only "Rahsia belum ditemui.")')
    pg.screenshot(path='tests/artifacts/phase7/collection-ui.png')
    ctx.close()

    print('--- Reload after discovery: secret persists ---')
    ctx, pg = fresh_page(); goto_and_start(pg)
    go_to_secret(pg, 'secret-oyen')
    pg.keyboard.press('e'); pg.wait_for_timeout(200)
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    pg.click('#continue-btn'); pg.wait_for_timeout(300)
    print('secret-oyen still discovered after reload+continue:', pg.evaluate("()=>rooftop.scene.discoveredSecrets.has('secret-oyen')"), '(expect True)')
    ctx.close()

    print('--- Replay Completed Level does NOT reset secrets (only run-state) ---')
    ctx, pg = fresh_page(); goto_and_start(pg)
    go_to_secret(pg, 'secret-oyen')
    pg.keyboard.press('e'); pg.wait_for_timeout(200)
    pg.evaluate("""()=>{
        const s=rooftop.scene;
        s.solvedGates.add('workshop-gate');s.solvedGates.add('rooftop-gate');s.solvedGates.add('final-gate');
        s.player.body.reset(4047,1070);
    }""")
    pg.wait_for_timeout(300)
    pg.keyboard.press('e')  # V8.7: goal now requires an explicit exit interaction
    pg.wait_for_selector('#complete[open]')
    pg.click('#replay'); pg.wait_for_timeout(400)
    print('run-state reset (solvedGates):', pg.evaluate("()=>rooftop.scene.solvedGates.size"), '(expect 0)')
    print('secret-oyen SURVIVES Replay:', pg.evaluate("()=>rooftop.scene.discoveredSecrets.has('secret-oyen')"), '(expect True)')
    saved = json.loads(raw_save(pg))
    print('persisted discoveredSecretIds after replay autosave would still include it once a trigger fires; current save:', saved['discoveredSecretIds'])
    ctx.close()

    print('--- Restart Current Run does NOT reset secrets either ---')
    ctx, pg = fresh_page(); goto_and_start(pg)
    go_to_secret(pg, 'secret-cave-treasure')
    pg.keyboard.press('e'); pg.wait_for_timeout(200)
    pg.keyboard.press('Escape'); pg.wait_for_selector('#paused[open]')
    pg.click('#restart'); pg.wait_for_timeout(400)
    print('secret-cave-treasure survives Restart Current Run:', pg.evaluate("()=>rooftop.scene.discoveredSecrets.has('secret-cave-treasure')"), '(expect True)')
    ctx.close()

    print('--- Start New Adventure DOES wipe secrets (explicit, confirmed full reset) ---')
    ctx, pg = fresh_page(); goto_and_start(pg)
    go_to_secret(pg, 'secret-oyen')
    pg.keyboard.press('e'); pg.wait_for_timeout(200)
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    pg.click('#new-adventure'); pg.wait_for_timeout(300)
    print('secrets wiped by New Adventure (by design, documented):', pg.evaluate("()=>rooftop.scene.discoveredSecrets.size"), '(expect 0)')
    ctx.close()

    print('--- Existing v1 save (pre-Phase-7) migrates cleanly, no secrets lost or crashed ---')
    ctx, pg = fresh_page(); pg.goto(URL, wait_until='networkidle')
    pg.evaluate(f"""()=>localStorage.setItem('{KEY}',JSON.stringify({{
        schemaVersion: 1, levelId: 'lorong-atas-bumbung-1', checkpointId: 'cp1-cafe',
        solvedGateIds: ['workshop-gate'], collectedCoinIds: ['coin-a'], completed: false, updatedAt: Date.now(),
    }}))""")
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    print('#continue-btn shown for migrated v1 save:', not pg.evaluate("()=>document.getElementById('continue-btn').hidden"), '(expect True)')
    pg.click('#continue-btn'); pg.wait_for_timeout(300)
    print('v1 progress intact after migration (solvedGates):', pg.evaluate("()=>[...rooftop.scene.solvedGates]"), '(expect [workshop-gate])')
    print('v1 save had no secrets field -> defaults to empty, no crash:', pg.evaluate("()=>rooftop.scene.discoveredSecrets.size"), '(expect 0)')
    go_to_secret(pg, 'secret-cave-treasure')
    pg.keyboard.press('e'); pg.wait_for_timeout(200)
    upgraded = json.loads(raw_save(pg))
    print('save transparently upgraded to v2 on next write:', upgraded['schemaVersion'], upgraded['discoveredSecretIds'], '(expect 2, [secret-cave-treasure])')
    ctx.close()

    print('--- Reduced motion: discovery still registers, particle helpers just no-op ---')
    ctx, pg = fresh_page()
    pg.emulate_media(reduced_motion='reduce')
    goto_and_start(pg)
    go_to_secret(pg, 'secret-oyen')
    pg.keyboard.press('e'); pg.wait_for_timeout(200)
    print('discovered under reduced-motion:', pg.evaluate("()=>rooftop.scene.discoveredSecrets.has('secret-oyen')"), '(expect True)')
    ctx.close()

    print('--- Muted audio: discovery still registers, SFX just no-ops ---')
    ctx, pg = fresh_page(); goto_and_start(pg)
    # V8 Phase 8: audio controls moved from the pause dialog into their own
    # #settings dialog, reached here via the pause menu's "Tetapan" button.
    pg.click('#pause'); pg.wait_for_selector('#paused[open]')
    pg.click('#pause-settings-btn'); pg.wait_for_selector('#settings[open]')
    pg.locator('#audio-mute').check()
    pg.click('#settings-close'); pg.wait_for_timeout(100)
    pg.click('#resume'); pg.wait_for_timeout(150)
    go_to_secret(pg, 'secret-oyen')
    pg.keyboard.press('e'); pg.wait_for_timeout(200)
    print('discovered while muted:', pg.evaluate("()=>rooftop.scene.discoveredSecrets.has('secret-oyen')"), '(expect True)')
    ctx.close()

    print('--- No duplicate progress across repeated discover attempts + saves ---')
    ctx, pg = fresh_page(); goto_and_start(pg)
    go_to_secret(pg, 'secret-oyen')
    for _ in range(5):
        pg.keyboard.press('e'); pg.wait_for_timeout(80)
    print('exactly 1 entry despite 5 presses:', pg.evaluate("()=>rooftop.scene.discoveredSecrets.size"), '(expect 1)')
    saved = json.loads(raw_save(pg))
    print('persisted discoveredSecretIds has no duplicates:', saved['discoveredSecretIds'], '(expect exactly one entry)')
    ctx.close()

    b.close()
    print('done')
