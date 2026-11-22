import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for name, size in [('desktop', {'width':1280,'height':900}), ('phone', {'width':390,'height':844})]:
            page = await browser.new_page(viewport=size)
            errors=[]
            page.on('pageerror', lambda e: errors.append(str(e)))
            await page.goto('http://localhost/Azza-arch/app/addmath/?semak=1#/nota/t4-1/1.1')
            await page.wait_for_selector('.example-tabs')
            groups=await page.locator('.example-tabs').count()
            for i in range(groups):
                tabs=page.locator('.example-tabs').nth(i).get_by_role('tab')
                for k in range(await tabs.count()):
                    await tabs.nth(k).click()
                    panel=page.locator('#'+await tabs.nth(k).get_attribute('aria-controls'))
                    assert await panel.is_visible()
                    assert await panel.locator('..').locator('.example:visible').count()==1
                    assert await panel.locator('.katex-error').count()==0
                await tabs.nth(await tabs.count()-1).press('Home')
                assert await tabs.nth(0).get_attribute('aria-selected')=='true'
                await tabs.nth(0).press('ArrowRight')
                assert await tabs.nth(1).get_attribute('aria-selected')=='true'
            assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
            await page.locator('.example-tabs').first.scroll_into_view_if_needed()
            await page.screenshot(path=f'app/addmath/tests/artifacts/local-preview/example-tabs-{name}.png')
            await page.emulate_media(media='print')
            assert await page.locator('.example:visible').count()==await page.locator('.example').count()
            assert not errors, errors
            print(f'PASS {name}: all tabs, keyboard, KaTeX, width and print')
            await page.close()
        await browser.close()
asyncio.run(main())
