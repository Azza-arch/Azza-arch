"""Capture fixed-coordinate browser evidence for the V11.1 baseline."""
from pathlib import Path
import json
import os
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(os.environ.get("SCREENSHOT_DIR", ROOT / "audits/level-v11/quality-polish/screenshots/before"))
OUT.mkdir(parents=True, exist_ok=True)
BASE = os.environ.get("BASE_URL", "http://127.0.0.1:8765/app/addmath/rooftop/v11.html?test")
ZONES = [
    ("A", 540, 1242, "crate approach"),
    ("B", 2700, 1026, "lift and upper landing"),
    ("C", 1692, 864, "optional mapping deck"),
    ("D", 3420, 972, "number rack"),
    ("E", 5238, 972, "waterworks control"),
    ("F", 6020, 864, "ridge tree"),
    ("G", 7390, 972, "river lever and locked bridge"),
]

errors, failed = [], []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    page = context.new_page()
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("requestfailed", lambda r: failed.append(r.url))
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_selector("#welcome:not([hidden])")
    page.click("#start")
    page.wait_for_function("() => rooftop.scene.mode === 'playing'")
    page.wait_for_timeout(2800)
    records = []
    for zone, x, feet, label in ZONES:
        page.evaluate("""({x,feet}) => {
          const s=rooftop.scene, c=s.cameras.main;
          s.physics.world.pause(); c.stopFollow(); s.mode='mechanism-transition';s.input.keyboard.enabled=false;
          s.player.body.reset(x, feet-30); s.syncVisual();
          s.player.body.setVelocity(0,0);s.player.body.blocked.down=true;s.player.body.touching.down=true;
          s.visual.stop().setTexture('idle-00').setOrigin(346/659,525/626).setScale(0.158);
          s.lastAnim='idle';s.lastGrounded=true;
          c.centerOn(x, feet-290);
        }""", {"x": x, "feet": feet})
        page.wait_for_timeout(80)
        path = OUT / f"zone-{zone}-before.png"
        page.screenshot(path=str(path))
        records.append({"zone": zone, "x": x, "feet": feet, "label": label, "screenshot": path.name})
    (OUT / "capture-manifest.json").write_text(json.dumps({
        "viewport": {"width": 1440, "height": 900},
        "input": "Playwright starts the real game; scene is then frozen at authored coordinates for composition review.",
        "zones": records,
        "pageErrors": errors,
        "failedRequests": failed,
    }, indent=2), encoding="utf-8")
    browser.close()
if errors or failed:
    raise SystemExit(json.dumps({"pageErrors": errors, "failedRequests": failed}))
print(f"Captured {len(ZONES)} fixed-coordinate zone screenshots; no browser/network errors.")
