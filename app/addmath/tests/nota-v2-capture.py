"""Local Laragon before/after evidence. Uses the installed Python Playwright."""
import asyncio
import json
import sys
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path(__file__).parent / 'artifacts' / 'nota-v2'
BASE = 'http://localhost/Azza-arch/app/addmath/?semak=1#/'

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    before = '--before' in sys.argv
    metrics = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for name, width in [('desktop', 1440), ('mobile', 390)]:
            page = await browser.new_page(viewport={'width': width, 'height': 900 if name == 'desktop' else 844}, device_scale_factor=1)
            modes = ['before'] if before else ['fahami', 'ulang-kaji', 'latihan']
            for mode in modes:
                route = 'nota/t4-2/2.3' if before else f'nota-v2/t4-2/2.3/{mode}'
                await page.goto(BASE + route)
                await page.wait_for_selector('.example' if before else '.v2-main')
                await page.evaluate('document.fonts.ready')
                await page.wait_for_timeout(250)
                metrics[f'{name}-{mode}'] = await page.evaluate('''() => ({height:document.documentElement.scrollHeight, width:innerWidth, overflow:document.documentElement.scrollWidth>innerWidth, mathErrors:document.querySelectorAll('.katex-error').length, questions:document.querySelectorAll('.q-card').length})''')
                await page.screenshot(path=str(OUT / f'{name}-{mode}-full.png'), full_page=True)
                await page.screenshot(path=str(OUT / f'{name}-{mode}.png'))
            await page.close()
        await browser.close()
    (OUT / ('before.json' if before else 'after.json')).write_text(json.dumps(metrics, indent=2))
    print(json.dumps(metrics, indent=2))

asyncio.run(main())
