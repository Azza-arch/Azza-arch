"""V7 exploratory smoke test — teleport-based, FOR DEBUGGING ONLY. Not used
as proof of reachability (the brief explicitly forbids that); the real
proof is tests/probe.py's natural-input traversal."""
from playwright.sync_api import sync_playwright
import json, sys

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1600, 'height': 900})
    errors = []
    console_errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: console_errors.append(m.text) if m.type == 'error' else None)
    page.goto('http://127.0.0.1:8765/app/addmath/rooftop/?test', wait_until='networkidle')
    page.wait_for_selector('#welcome:not([hidden])')
    page.click('#start')
    page.wait_for_timeout(300)

    checks = [
        ('A spawn', 80, 1100), ('B tier', 900, 980), ('C tier', 900, 820),
        ('D tier', 1650, 980), ('E entry', 1850, 700), ('E laundry', 2150, 740),
        ('E m2', 2350, 660), ('F step1', 2920, 700), ('F cave', 2950, 880),
        ('F step2', 3220, 900), ('G approach', 3550, 1100), ('Goal', 4100, 1100),
    ]
    results = {}
    for name, x, feet in checks:
        page.evaluate(f'''() => {{
            const s = rooftop.scene, b = s.player.body;
            b.setAllowGravity(false);
            b.reset({x}, {feet} - 30);
        }}''')
        page.wait_for_timeout(120)
        state = page.evaluate('() => ({x:rooftop.scene.player.x, y:rooftop.scene.player.y, mode:rooftop.scene.mode})')
        results[name] = state
    page.screenshot(path='tests/artifacts/v7-smoke.png')
    print(json.dumps({'results': results, 'errors': errors, 'consoleErrors': console_errors}, indent=2))
    browser.close()
    if errors or console_errors:
        sys.exit(1)
