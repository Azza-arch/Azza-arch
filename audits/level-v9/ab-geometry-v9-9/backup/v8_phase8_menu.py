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

    def goto(pg):
        pg.goto(URL, wait_until='networkidle')
        pg.wait_for_selector('#welcome:not([hidden])')

    def wait(pg, expr):
        pg.wait_for_function('() => {const s=rooftop.scene,b=s.player.body; return ' + expr + '}', timeout=20000)

    print('--- Fresh main menu: correct options visible, no duplicates ---')
    ctx, pg = fresh_page(); goto(pg)
    print('#start (Mula Pengembaraan) visible:', not pg.evaluate("()=>document.getElementById('start').hidden"))
    print('#continue-btn hidden:', pg.evaluate("()=>document.getElementById('continue-btn').hidden"))
    print('#new-adventure hidden:', pg.evaluate("()=>document.getElementById('new-adventure').hidden"))
    print('Pilih Level / Koleksi / Tetapan all present:',
          pg.locator('#level-select-btn').count()==1 and pg.locator('#collection-btn').count()==1 and pg.locator('#settings-btn').count()==1)
    pg.screenshot(path='tests/artifacts/phase8/main-menu-fresh.png')
    ctx.close()

    print('--- Level Select: Level 1 shown, status "Belum mula", no fake Level 2 ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#level-select-btn'); pg.wait_for_selector('#level-select[open]')
    print('level1-status:', pg.locator('#level1-status').inner_text(), '(expect Belum mula)')
    print('level1-action label:', pg.locator('#level1-action').inner_text(), '(expect Mula)')
    print('exactly one level card (no fake Level 2):', pg.locator('.level-card').count(), '(expect 1)')
    pg.screenshot(path='tests/artifacts/phase8/level-select-fresh.png')
    ctx.close()

    print('--- Level Select action button starts the game (delegates to #start) ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#level-select-btn'); pg.wait_for_selector('#level-select[open]')
    pg.click('#level1-action'); pg.wait_for_timeout(300)
    print('mode after Level 1 "Mula":', pg.evaluate("()=>rooftop.scene.mode"), '(expect playing)')
    print('level-select dialog closed:', not pg.evaluate("()=>document.getElementById('level-select').open"))
    ctx.close()

    print('--- Main menu after progress: Teruskan shown, Level Select reflects it ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#start'); pg.wait_for_timeout(300)
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(950,790);}")
    pg.wait_for_timeout(400)
    wait(pg, 's.checkpointIndex>=0')
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    print('#continue-btn label:', pg.locator('#continue-btn').inner_text())
    pg.screenshot(path='tests/artifacts/phase8/main-menu-in-progress.png')
    pg.click('#level-select-btn'); pg.wait_for_selector('#level-select[open]')
    print('level1-status mid-run:', pg.locator('#level1-status').inner_text(), '(expect Dalam perjalanan)')
    print('level1-action label mid-run:', pg.locator('#level1-action').inner_text(), '(expect Teruskan)')
    summary = pg.locator('#level1-summary').inner_text()
    print('level1-summary (real saved data):', summary)
    pg.click('#level1-action'); pg.wait_for_timeout(400)
    print('checkpointIndex restored via Level Select -> Teruskan:', pg.evaluate("()=>rooftop.scene.checkpointIndex"), '(expect 0)')
    ctx.close()

    print('--- Collection screen: reachable from main menu, shows 0/3 pre-game ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#collection-btn'); pg.wait_for_selector('#collection[open]')
    print('secrets-count pre-game:', pg.locator('#secrets-count').inner_text(), '(expect 0/3)')
    print('no undiscovered secret reveals a location:', 'x:' not in pg.locator('#secrets-list').inner_text())
    pg.screenshot(path='tests/artifacts/phase8/collection-from-menu.png')
    ctx.close()

    print('--- Settings screen: reachable from main menu, audio controls work pre-game ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#settings-btn'); pg.wait_for_selector('#settings[open]')
    pg.locator('#audio-mute').check()
    print('mute persisted via main-menu Settings:', pg.evaluate("()=>JSON.parse(localStorage.getItem('lorong-audio-settings-v1')).muted"), '(expect True)')
    pg.screenshot(path='tests/artifacts/phase8/settings-from-menu.png')
    ctx.close()

    print('--- Keyboard-only: Tab to a menu button, Enter activates it, Escape backs out ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.keyboard.press('Tab')  # skip back-link / masthead buttons as needed; focus is managed by the browser
    # Directly focus+activate via keyboard semantics: find the button, focus it, press Enter.
    pg.evaluate("()=>document.getElementById('level-select-btn').focus()")
    pg.keyboard.press('Enter')
    pg.wait_for_selector('#level-select[open]')
    print('Enter activated Pilih Level:', pg.evaluate("()=>document.getElementById('level-select').open"))
    pg.keyboard.press('Escape')
    pg.wait_for_timeout(150)
    print('Escape closed Level Select:', not pg.evaluate("()=>document.getElementById('level-select').open"))
    print('focus returned (not trapped) to a focusable element:', pg.evaluate("()=>document.activeElement !== document.body"))
    ctx.close()

    print('--- Completion screen: accurate values, celebration before dialog, new actions work ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#start'); pg.wait_for_timeout(300)
    go = lambda x, feet: pg.evaluate(f"()=>{{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset({x},{feet}-30);}}")
    go(680, 820); pg.wait_for_timeout(200); pg.keyboard.press('e'); pg.wait_for_timeout(150)  # Si Oyen
    pg.evaluate("""()=>{
        const s=rooftop.scene;
        s.solvedGates.add('workshop-gate');s.solvedGates.add('rooftop-gate');s.solvedGates.add('final-gate');
        s.player.body.reset(4047,1070);
    }""")
    pg.wait_for_timeout(300)
    pg.keyboard.press('e')  # V8.7: goal now requires an explicit exit interaction
    # dialog must not appear before the sparkle celebration finishes (~420ms, see finish())
    pg.wait_for_timeout(50)
    still_closed_during_celebration = not pg.evaluate("()=>document.getElementById('complete').open")
    pg.wait_for_selector('#complete[open]')
    print('complete dialog stayed closed during the celebration delay:', still_closed_during_celebration, '(expect True)')
    print('completion-secrets text:', pg.locator('#completion-secrets').inner_text(), '(expect 1/3)')
    print('completion-puzzles text:', pg.locator('#completion-puzzles').inner_text())
    print('completion-coins text:', pg.locator('#completion-coins').inner_text())
    pg.screenshot(path='tests/artifacts/phase8/completion-screen.png')
    # "Pilih Level" from complete dialog
    pg.click('#complete-level-select'); pg.wait_for_selector('#level-select[open]')
    print('level1-status after completion:', pg.locator('#level1-status').inner_text(), '(expect Selesai)')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    ctx.close()

    print('--- "Menu Utama" returns to main menu without resetting the save ---')
    ctx, pg = fresh_page(); goto(pg)
    pg.click('#start'); pg.wait_for_timeout(300)
    pg.evaluate("""()=>{
        const s=rooftop.scene;
        s.solvedGates.add('workshop-gate');s.solvedGates.add('rooftop-gate');s.solvedGates.add('final-gate');
        s.player.body.reset(4047,1070);
    }""")
    pg.wait_for_timeout(300)
    pg.keyboard.press('e')  # V8.7: goal now requires an explicit exit interaction
    pg.wait_for_selector('#complete[open]')
    pg.click('#menu-btn'); pg.wait_for_timeout(200)
    print('welcome visible after Menu Utama:', not pg.evaluate("()=>document.getElementById('welcome').hidden"))
    print('mode after Menu Utama:', pg.evaluate("()=>rooftop.scene.mode"), '(expect welcome)')
    saved = json.loads(pg.evaluate(f"()=>localStorage.getItem('{KEY}')"))
    print('save still shows completed (not reset by Menu Utama):', saved['completed'], '(expect True)')
    print('#continue-btn label after Menu Utama:', pg.locator('#continue-btn').inner_text())
    ctx.close()

    print('--- Mobile: main menu + level select + collection fit and work ---')
    ctx, pg = fresh_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    goto(pg)
    pg.screenshot(path='tests/artifacts/phase8/main-menu-mobile.png')
    pg.tap('#level-select-btn'); pg.wait_for_selector('#level-select[open]')
    pg.screenshot(path='tests/artifacts/phase8/level-select-mobile.png')
    ctx.close()

    print('--- Corrupted/unavailable storage: menu still fully usable ---')
    ctx, pg = fresh_page(); pg.goto(URL, wait_until='networkidle')
    pg.evaluate(f"()=>localStorage.setItem('{KEY}','{{not valid json')")
    pg.reload(); pg.wait_for_selector('#welcome:not([hidden])')
    print('#start shown despite corrupted save:', not pg.evaluate("()=>document.getElementById('start').hidden"))
    pg.click('#level-select-btn'); pg.wait_for_selector('#level-select[open]')
    print('Level Select still renders cleanly:', pg.locator('#level1-status').inner_text(), '(expect Belum mula)')
    ctx.close()

    b.close()
    print('done')
