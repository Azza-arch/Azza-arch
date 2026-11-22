"""V8.7 Phase C: real-browser camera zoom A/B test. For each of three
viewport presets (desktop, short-wide laptop, mobile landscape) and three
zoom levels (1.0 / 1.2 / 1.3), captures screenshots at a fixed set of
gameplay moments and records numeric readability measurements.
"""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')
OUT = Path(__file__).parent / 'artifacts' / 'phase8-7' / 'camera-ab'
OUT.mkdir(parents=True, exist_ok=True)
URL = 'http://127.0.0.1:8765/app/addmath/rooftop/?test'

VIEWPORTS = {
    'desktop': {'width': 1440, 'height': 900},
    'short-wide-laptop': {'width': 1366, 'height': 660},
    'mobile-landscape': {'width': 844, 'height': 390},
}
ZOOMS = [1.0, 1.2, 1.3]
# moments: (label, player reset x, player reset feet, camera-follow re-centers automatically)
MOMENTS = [
    ('spawn-first-gap', 80, 1100),
    ('machine1-approach', 1100, 980),
    ('ladder-b-to-c', 700, 980),
]

results = []

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    for vp_name, vp in VIEWPORTS.items():
        for zoom in ZOOMS:
            ctx = b.new_context(viewport=vp)
            pg = ctx.new_page()
            pg.goto(URL, wait_until='networkidle')
            pg.wait_for_selector('#welcome:not([hidden])')
            pg.click('#start')
            pg.wait_for_timeout(250)
            pg.evaluate(f"()=>{{rooftop.scene.cameras.main.setZoom({zoom});}}")
            pg.wait_for_timeout(100)
            for label, x, feet in MOMENTS:
                pg.evaluate(f"()=>{{const s=rooftop.scene,b=s.player.body; b.setAllowGravity(true); b.reset({x},{feet}-30);}}")
                pg.wait_for_timeout(200)
                fname = f'{vp_name}_z{zoom}_{label}.png'
                pg.screenshot(path=str(OUT / fname))
                metrics = pg.evaluate("""() => {
                    const s = rooftop.scene, cam = s.cameras.main, v = s.visual;
                    const vb = v.getBounds();
                    // screen-space player height, in CSS px (account for the
                    // Phaser canvas's own CSS scaling vs its logical size).
                    const canvasEl = document.querySelector('#game canvas');
                    const cssPerLogical = canvasEl.clientWidth / s.game.config.width;
                    const playerScreenH = vb.height * cam.zoom * cssPerLogical;
                    const worldPxVisible = cam.width / cam.zoom; // world px visible across canvas width
                    const hud = document.querySelector('.hud').getBoundingClientRect();
                    const frame = document.querySelector('.game-frame').getBoundingClientRect();
                    return {
                        playerScreenH: Math.round(playerScreenH),
                        worldPxVisible: Math.round(worldPxVisible),
                        canvasCssW: canvasEl.clientWidth, canvasCssH: canvasEl.clientHeight,
                        hudBottom: Math.round(hud.bottom - frame.top),
                    };
                }""")
                results.append({'viewport': vp_name, 'zoom': zoom, 'moment': label, **metrics})
            ctx.close()
    b.close()

(OUT / 'metrics.json').write_text(json.dumps(results, indent=2))
for r in results:
    print(r['viewport'], 'zoom', r['zoom'], r['moment'],
          '| player px height:', r['playerScreenH'],
          '| world px visible:', r['worldPxVisible'],
          '| canvas css:', r['canvasCssW'], 'x', r['canvasCssH'],
          '| hud bottom offset:', r['hudBottom'])
print('done')
