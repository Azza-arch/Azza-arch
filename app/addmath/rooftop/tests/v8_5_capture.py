"""V8 Phase 8.5: real-browser screenshot capture, consistent camera anchors
used for BOTH the before pass and the after pass, so comparisons are
pixel-position-comparable. Run with `--out before` or `--out after`.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT_NAME = 'after'
for i, a in enumerate(sys.argv):
    if a == '--out' and i + 1 < len(sys.argv):
        OUT_NAME = sys.argv[i + 1]

OUT = Path(__file__).parent / 'artifacts' / 'phase8-5' / OUT_NAME
OUT.mkdir(parents=True, exist_ok=True)
URL = 'http://127.0.0.1:8765/app/addmath/rooftop/?test'

# zone id -> (camera center x, camera center y, zoom)
ZONES = {
    'A-taman-perumahan': (250, 950, 0.85),
    'B-lorong-pekan': (820, 880, 0.85),
    'C-cafe-atas-angin': (850, 730, 0.85),
    'D-bengkel-fungsi': (1430, 880, 0.85),
    'E-deretan-bumbung': (2050, 620, 0.78),
    'F-bukit-tanjung-gua': (3030, 820, 0.8),
    'G-jambatan-sungai': (3850, 950, 0.78),
}


def set_cam(pg, x, y, zoom):
    pg.evaluate(f"()=>{{const c=rooftop.scene.cameras.main; c.stopFollow(); c.setZoom({zoom}); c.centerOn({x},{y});}}")
    pg.wait_for_timeout(120)


with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page(viewport={'width': 1000, 'height': 700})
    pg.goto(URL, wait_until='networkidle')
    pg.wait_for_selector('#welcome:not([hidden])')
    pg.click('#start')
    pg.wait_for_timeout(300)

    for name, (x, y, zoom) in ZONES.items():
        set_cam(pg, x, y, zoom)
        pg.screenshot(path=str(OUT / f'{name}.png'))

    # Gate locked/unlocked pairs — camera parked on each gate specifically.
    set_cam(pg, 1300, 950, 0.95)
    pg.screenshot(path=str(OUT / 'gate-workshop-locked.png'))
    set_cam(pg, 2580, 640, 0.95)
    pg.screenshot(path=str(OUT / 'gate-rooftop-locked.png'))
    set_cam(pg, 3700, 1080, 0.95)
    pg.screenshot(path=str(OUT / 'gate-final-locked.png'))

    # Solve all three (direct state injection — visuals only, this script
    # does not re-verify puzzle logic, probe.py already does that).
    pg.evaluate("""()=>{
        const s=rooftop.scene;
        for (const g of ['workshop-gate','rooftop-gate','final-gate']) {
            s.solvedGates.add(g);
            const puzzle=rooftop.constants.PUZZLES.find(p=>p.gate===g);
            const lever=s.machines[puzzle.id];
            lever.setTexture('function_machine_active');
            const gate=rooftop.constants.GATES.find(x=>x.id===g);
            s.gateStubs?.[g]?.forEach(st=>st.destroy());
            s.gateArt(gate);
            s.gateBodies[gate.id]=s.platform(gate);
        }
    }""")
    pg.wait_for_timeout(150)
    set_cam(pg, 1300, 950, 0.95)
    pg.screenshot(path=str(OUT / 'gate-workshop-unlocked.png'))
    set_cam(pg, 2580, 640, 0.95)
    pg.screenshot(path=str(OUT / 'gate-rooftop-unlocked.png'))
    set_cam(pg, 3700, 1080, 0.95)
    pg.screenshot(path=str(OUT / 'gate-final-unlocked.png'))

    # Checkpoint idle/active pair (CP1).
    pg.evaluate("()=>{const s=rooftop.scene; s.checkpointArts[0].setTexture('checkpoint_post_idle');}")
    set_cam(pg, 950, 790, 1.0)
    pg.screenshot(path=str(OUT / 'checkpoint-idle.png'))
    pg.evaluate("()=>{const s=rooftop.scene; s.checkpointArts[0].setTexture('checkpoint_post_active');}")
    pg.screenshot(path=str(OUT / 'checkpoint-active.png'))

    # Wide "world overview": zoomed far out, whole 4300-wide world in frame.
    set_cam(pg, 2150, 680, 0.235)
    pg.screenshot(path=str(OUT / 'world-overview.png'))

    # Camera-movement alignment check: three frames along a pan across E
    # (the rooftop showcase), to visually confirm architecture tracks with
    # gameplay geometry rather than sliding out of alignment.
    for i, cx in enumerate([1850, 2150, 2450]):
        set_cam(pg, cx, 650, 0.85)
        pg.screenshot(path=str(OUT / f'pan-align-{i}.png'))

    b.close()
    print('done', OUT_NAME)
