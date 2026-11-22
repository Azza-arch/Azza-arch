"""V6.3 Phase 1 visual QA capture: all 7 zones at 3 viewport sizes, plus
console/error checks. Not a regression test (tests/probe.py covers that) —
pure visual-evidence capture for audits/level-v6.3/."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json

OUT = Path(__file__).parent / 'artifacts' / 'phase1'
OUT.mkdir(parents=True, exist_ok=True)

ZONES = [
    ('A', 300, 1000),
    ('B', 1400, 960),
    ('C', 2750, 1000),
    ('D', 3750, 1000),
    ('E', 4900, 800),
    ('F', 6700, 824),
    ('G', 6900, 824),
]
VIEWPORTS = [
    ('1366x768', 1366, 768),
    ('1920x1080', 1920, 1080),
    ('shortwide-1400x560', 1400, 560),
]

results = {}
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for vname, vw, vh in VIEWPORTS:
        page = browser.new_page(viewport={'width': vw, 'height': vh})
        errors = []
        console_errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: console_errors.append(m.text) if m.type == 'error' else None)
        page.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test', wait_until='networkidle')
        page.wait_for_selector('#welcome:not([hidden])')
        page.click('#start')
        page.wait_for_timeout(300)
        for zname, x, feet in ZONES:
            page.evaluate(f'''() => {{
                const s = rooftop.scene, b = s.player.body;
                b.reset({x}, {feet} - 30);
                b.setAllowGravity(true);
                s.cameras.main.centerOn({x}, {feet} - 150);
            }}''')
            page.wait_for_timeout(250)
            page.screenshot(path=str(OUT / f'{vname}__zone-{zname}.png'))
        results[vname] = {'errors': errors, 'consoleErrors': console_errors}
        page.close()
    browser.close()

(OUT / 'phase1-capture-results.json').write_text(json.dumps(results, indent=2))
print(json.dumps(results, indent=2))
