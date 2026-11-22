from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8765/app/addmath/rooftop/?test"
OUT = Path(__file__).parent / "artifacts" / "phase5-kenney-import"
OUT.mkdir(parents=True, exist_ok=True)

ZONES = {
    "zone-a": (300, 1050),
    "zone-b": (950, 950),
}

SUFFIX = "before"

with sync_playwright() as p:
    browser = p.chromium.launch()
    pg = browser.new_page(viewport={"width": 1024, "height": 640})
    pg.goto(URL)
    pg.wait_for_selector('#welcome:not([hidden])')
    pg.click('#start')
    pg.wait_for_timeout(600)

    for name, (x, y) in ZONES.items():
        pg.evaluate(
            f"()=>{{const c=rooftop.scene.cameras.main; c.stopFollow(); c.setZoom(1); c.centerOn({x},{y});}}"
        )
        pg.wait_for_timeout(200)
        pg.screenshot(path=str(OUT / f"{name}-{SUFFIX}.png"))
        print(name, "captured")

    browser.close()
print("done")
