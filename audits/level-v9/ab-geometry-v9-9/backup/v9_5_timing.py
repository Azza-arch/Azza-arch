"""V9.5 level-length analysis: a clean mandatory-route-only traversal
(no bypass/failed-jump/edge-case detours, no answer retries), timed with
wall-clock time.time() around each real natural-input action. Movement is
driven by held keys exactly like a human player, so elapsed time reflects
actual MOTION.speed-paced traversal, not scripted/instant teleports. This
is a FASTEST-COMPETENT-RUN floor, not an average player's time (a real
player will pause to read prompts/solve puzzles more slowly) — reported as
such in level-length-analysis.md.
"""
import time, json
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).parent / 'artifacts' / 'phase5-kenney-import'
OUT.mkdir(parents=True, exist_ok=True)
marks = []

def mark(label, t0):
    now = time.time()
    marks.append((label, now - t0))
    print(f'{label}: {now - t0:.2f}s', flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--disable-background-timer-throttling','--disable-renderer-backgrounding'])
    page = browser.new_page(viewport={'width':1440,'height':1000})
    page.on('dialog', lambda d: d.accept())
    page.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test', wait_until='networkidle')
    page.wait_for_selector('#welcome:not([hidden])')
    page.click('#start')
    page.wait_for_timeout(300)

    def wait(expr):
        page.wait_for_function('() => {const s=rooftop.scene,b=s.player.body; return '+expr+'}', timeout=45000)
    def walk(target):
        x = page.evaluate('rooftop.scene.player.x')
        key = 'd' if x < target else 'a'
        page.keyboard.down(key)
        wait(f's.mode==="complete" || s.player.x {">=" if x<target else "<="} {target}')
        page.keyboard.up(key)
        wait('Math.abs(b.velocity.x)<1')
    def climb_up(top):
        page.keyboard.down('w'); wait(f'b.bottom<={top+1} && !s.climbing'); page.keyboard.up('w'); wait('b.blocked.down')
    def climb_down(bottom):
        page.keyboard.down('s'); wait(f'b.bottom>={bottom-1} && !s.climbing'); page.keyboard.up('s'); wait('b.blocked.down')
    def running_jump(jump_at_x, land_min_x):
        page.keyboard.down('d'); wait(f's.player.x>={jump_at_x}')
        page.keyboard.press('Space'); wait('b.velocity.y<0')
        wait(f's.player.x>={land_min_x}'); page.keyboard.up('d'); wait('b.blocked.down')
    def solve(x, feet, correct):
        walk(x)
        page.keyboard.press('e'); page.wait_for_selector('#puzzle[open]')
        page.locator('#answer').fill(correct); page.locator('#answer-form button').click()
        page.wait_for_selector('#puzzle-continue:not([hidden])')
        page.locator('#puzzle-continue').click()
        wait('s.mode==="playing"')

    t0 = time.time()
    # A: first gap
    page.keyboard.down('d'); wait('s.player.x>=390')
    page.keyboard.press('Space'); wait('b.velocity.y<0')
    wait('s.player.x>=560'); page.keyboard.up('d'); wait('b.blocked.down')
    mark('A: start -> first gap cleared', t0)

    # A -> B ladder, B's real jump straight to Machine 1 (skip optional café detour)
    walk(610); climb_up(980)
    running_jump(860, 1060)
    mark('A->B: reached Machine 1 (skipped optional cafe detour)', t0)

    solve(1250, 980, '7')
    mark('M1 solved', t0)
    walk(1770); climb_up(700)
    mark('D->E: climbed to roof-entry', t0)

    running_jump(1920, 2120)
    walk(2280); climb_up(660)
    mark('E: reached Machine 2 (skipped optional cave)', t0)

    solve(2400, '4') if False else solve(2400, 660, '4')
    mark('M2 solved', t0)

    running_jump(2850, 2950)
    mark('E->F: crossed rooftop-gate (checkpoint 2)', t0)

    running_jump(3040, 3240)
    walk(3230); climb_down(1100)
    walk(3550)
    mark('F->G: reached checkpoint 3', t0)

    solve(3650, 1100, '5')
    mark('M3 solved', t0)

    walk(4100)
    page.keyboard.press('e')
    page.wait_for_selector('#complete[open]')
    mark('TOTAL: level complete', t0)

    browser.close()

Path(OUT / 'timing-raw.json').write_text(json.dumps(marks, indent=2), encoding='utf-8')
print('done')
