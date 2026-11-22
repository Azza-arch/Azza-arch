"""V8 Phase 3 visual evidence capture: real browser screenshots at the
moment each effect is visible."""
from playwright.sync_api import sync_playwright
from pathlib import Path

OUT = Path(__file__).parent / 'artifacts' / 'phase3'
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={'width': 900, 'height': 650})
    pg.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test', wait_until='networkidle')
    pg.wait_for_selector('#welcome:not([hidden])')
    pg.click('#start')
    pg.wait_for_timeout(300)
    pg.evaluate("()=>{rooftop.scene.cameras.main.setZoom(2);}")

    # 1. Takeoff dust
    pg.evaluate("()=>{rooftop.scene.cameras.main.centerOn(150,1050);}")
    pg.wait_for_timeout(100)
    pg.keyboard.down('Space')
    pg.wait_for_timeout(40)
    pg.screenshot(path=str(OUT / '1-takeoff-dust.png'))
    pg.keyboard.up('Space')
    pg.wait_for_timeout(600)

    # 2. Landing dust (teleport up, let gravity drop onto ground)
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(300,850);}")
    pg.wait_for_timeout(550)
    pg.evaluate("()=>{rooftop.scene.cameras.main.centerOn(300,1070);}")
    pg.wait_for_timeout(20)
    pg.screenshot(path=str(OUT / '2-landing-dust.png'))
    pg.wait_for_timeout(500)

    # 3. Coin collection (coin-a at x=300,y=1050)
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(290,1020);}")
    pg.wait_for_timeout(250)
    pg.evaluate("()=>{rooftop.scene.cameras.main.centerOn(300,1050);}")
    pg.wait_for_timeout(30)
    pg.screenshot(path=str(OUT / '3-coin-sparkle.png'))
    pg.wait_for_timeout(500)

    # 4. Checkpoint pulse (teleport right at CP1, x=950,feet=820)
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(940,790);}")
    pg.wait_for_timeout(250)
    pg.evaluate("()=>{rooftop.scene.cameras.main.centerOn(950,820);}")
    pg.wait_for_timeout(30)
    pg.screenshot(path=str(OUT / '4-checkpoint-pulse.png'))
    pg.wait_for_timeout(500)

    # 5. Machine readiness glow (approach M1 without solving, x=1250,feet=980)
    pg.evaluate("()=>{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset(1245,950);}")
    pg.wait_for_timeout(250)
    pg.evaluate("()=>{rooftop.scene.cameras.main.centerOn(1250,980);}")
    pg.wait_for_timeout(30)
    pg.screenshot(path=str(OUT / '5-machine-readiness.png'))

    # 6. Machine solved pulse (solve M1)
    pg.keyboard.press('e')
    pg.wait_for_selector('#puzzle[open]')
    pg.locator('#answer').fill('7')
    pg.locator('#answer-form button').click()
    pg.wait_for_timeout(60)
    pg.screenshot(path=str(OUT / '6-machine-solved.png'))
    pg.wait_for_timeout(500)

    # 7. Goal celebration — solve all gates then reach GOAL
    pg.evaluate("""()=>{
        const s = rooftop.scene;
        s.solvedGates.add('rooftop-gate'); s.solvedGates.add('final-gate');
        s.machines['p2'].setTexture('kenney_lever_left'); s.machines['p3'].setTexture('kenney_lever_left');
        const rootG = rooftop.constants.GATES.find(g=>g.id==='rooftop-gate');
        const finG = rooftop.constants.GATES.find(g=>g.id==='final-gate');
        s.gateBodies['rooftop-gate']=s.platform(rootG);
        s.gateBodies['final-gate']=s.platform(finG);
        const b = s.player.body; b.setAllowGravity(true); b.reset(4080,1070);
    }""")
    pg.wait_for_timeout(300)
    pg.evaluate("()=>{rooftop.scene.cameras.main.centerOn(4100,1100);}")
    pg.wait_for_timeout(60)
    pg.screenshot(path=str(OUT / '7-goal-celebration.png'))
    pg.wait_for_timeout(300)
    pg.screenshot(path=str(OUT / '7b-goal-celebration-later.png'))

    b.close()
    print('done')
