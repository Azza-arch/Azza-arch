"""Meaningful prototype checks against the real Laragon app, not a mocked renderer."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

BASE = 'http://localhost/Azza-arch/app/addmath/'
OUT = Path(__file__).parent / 'artifacts' / 'nota-v2'

async def main():
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for width in [1440, 390, 320, 768]:
            page = await browser.new_page(viewport={'width': width, 'height': 900})
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            async def go(mode, target=''):
                await page.goto(BASE + '?semak=1#/nota-v2/t4-2/2.3/' + mode + ('/' + target if target else ''))
                await page.wait_for_selector('.v2-main')
                await page.evaluate('document.fonts.ready')

            await go('fahami')
            assert await page.locator('.v2-section[data-source-section] h2').count() >= 6
            assert await page.locator('.q-card').count() == 0
            assert await page.locator('[data-example-index]').count() == 7
            assert await page.locator('[data-example-index]:visible').count() == 2
            assert await page.locator('.v2-prereq').is_visible()
            # All core concepts stay visible, including their complete authored HTML.
            preservation = await page.evaluate('''async() => {
                const { CHAPTER } = await import('./src/content/notes/t4-2.js');
                const { PLAN } = await import('./src/notes/v2/quadraticPlan.js');
                const sub = CHAPTER.subtopics[2];
                return PLAN.coreConcepts.every(i => {
                    const e = document.querySelector('#s'+i);
                    return e && e.getClientRects().length && e.querySelector('h2').textContent===sub.sections[i].title;
                }) && sub.sections[10].items.every((e,i)=>document.querySelector('[data-example-index="'+i+'"] .v2-steps').children.length===e.steps.length);
            }''')
            assert preservation
            await page.get_by_role('link', name='Graf interaktif', exact=True).click()
            before = await page.locator('#graph-panel-0 .plot-readout').inner_text()
            slider = page.locator('#graph-panel-0 input[type=range]').first
            await slider.fill('0')
            await slider.dispatch_event('input')
            assert 'bukan parabola' in await page.locator('#graph-panel-0 .plot-readout').inner_text()
            await slider.fill('-2')
            await slider.dispatch_event('input')
            assert before != await page.locator('#graph-panel-0 .plot-readout').inner_text()
            await page.get_by_role('tab', name='Bentuk am: a, b, c', exact=True).focus()
            await page.keyboard.press('ArrowRight')
            assert await page.locator('#graph-panel-1').is_visible()
            assert not await page.locator('#graph-panel-0').is_visible()
            await page.locator('#graph-panel-1 input[type=range]').first.fill('0')
            await page.locator('#graph-panel-1 input[type=range]').first.dispatch_event('input')
            assert 'bukan fungsi kuadratik' in await page.locator('#graph-panel-1 .plot-readout').inner_text()
            # Expand all retained content and check every formula is parsed, not only the first viewport.
            await page.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
            assert await page.locator('[data-example-index]:visible').count() == 7
            assert await page.locator('.katex-error').count() == 0
            assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), f'fahami overflow {width}'

            # Find the requested formula with one mode selection + a search, and follow its exact explanation.
            await go('ulang-kaji')
            await page.locator('#v2-formula-search').fill('paksi simetri')
            assert await page.locator('.v2-formula:visible').count() == 1
            await page.get_by_role('link', name='Fahami paksi simetri sepenuhnya').click()
            await page.wait_for_selector('#s5')
            assert await page.evaluate('document.activeElement.id') == 's5'
            assert await page.locator('#s5').is_visible()
            await page.reload()
            await page.wait_for_selector('#s5')
            assert await page.locator('#s5').is_visible()
            await go('ulang-kaji')
            await page.locator('#v2-formula-search').fill('zz-no-match')
            assert '0 rumus' in await page.locator('#v2-search-count').inner_text()
            await page.locator('#v2-formula-search').fill('')
            assert await page.locator('.v2-formula:visible').count() == 6
            await page.locator('#v2-formula-search').fill('penyempurnaan')
            assert await page.locator('.v2-formula:visible').count() == 2
            await page.locator('#v2-formula-search').fill('')
            await page.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
            assert await page.locator('.katex-error').count() == 0
            assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), f'recap overflow {width}'

            await go('latihan')
            if width <= 800:
                assert await page.locator('.q-prompt').evaluate('(e)=>e.getBoundingClientRect().top < innerHeight'), 'question should appear in first mobile viewport'
            # All 30 original questions, including structured parts, run through the real event handlers.
            checks = await page.evaluate('''async() => {
                const { CHAPTER } = await import('./src/content/notes/t4-2.js');
                const failures=[];
                for(const q of CHAPTER.questions) {
                    const sub=document.querySelector('#v2-practice-sub');sub.value=q.subtopic;sub.dispatchEvent(new Event('change'));
                    const pick=document.querySelector('#v2-question-picker');pick.value=q.id;pick.dispatchEvent(new Event('change'));
                    const card=document.querySelector('.q-card');
                    if(!card || card.id!=='q-'+q.id+'-card'){failures.push(q.id+' missing');continue;}
                    if(q.type==='mcq') q.options.forEach((o,i)=>{card.querySelectorAll('.q-option')[i].click();if(!card.querySelector('.q-feedback').classList.contains(o.correct?'is-right':'is-wrong'))failures.push(q.id+' option '+i)});
                    else {
                        const specs=q.type==='structured'?q.parts:[q], holders=q.type==='structured'?[...card.querySelectorAll('.q-part')]:[card];
                        specs.forEach((s,i)=>{if(!['numeric','expression'].includes(s.type))return;const h=holders[i];h.querySelector('.q-input').value=String(s.answer);h.querySelector('.q-check').click();if(!h.querySelector('.q-feedback').classList.contains('is-right'))failures.push(q.id+' answer '+i);});
                    }
                    card.querySelector('.q-solution').open=true;
                    if(!card.querySelector('.q-solution li'))failures.push(q.id+' solution');
                    if(!document.querySelector('.v2-review-links a'))failures.push(q.id+' return link');
                    if(document.querySelector('.katex-error'))failures.push(q.id+' math error');
                    if(document.documentElement.scrollWidth>innerWidth+1)failures.push(q.id+' overflow');
                }
                return failures;
            }''')
            assert not checks, (width, checks)
            if not await page.locator('.v2-practice-filters').get_attribute('open') == '':
                await page.locator('.v2-practice-filters > summary').click()
            await page.locator('#v2-practice-sub').select_option('2.3')
            await page.locator('#v2-practice-skill').select_option('2.3.1')
            await page.get_by_role('button', name='Cabaran', exact=True).click()
            assert 'Tiada soalan' in await page.locator('.v2-practice-body').inner_text()
            await page.get_by_role('button', name='Semua', exact=True).click()
            assert await page.locator('.q-card').count() == 1
            # Wrong answer -> explanation -> browser Back restores the same question and answer.
            await go('latihan', 't4-2.3-04')
            await page.locator('.q-input').fill('999')
            await page.locator('.q-check').click()
            assert await page.locator('.q-feedback.is-wrong').count() == 1
            await page.locator('.v2-review-links a').first.click()
            await page.wait_for_selector('#s5')
            await page.go_back()
            await page.wait_for_selector('.q-input')
            assert await page.locator('.q-input').input_value() == '999'
            assert await page.locator('.q-feedback.is-wrong').count() == 1
            assert 't4-2.3-04' in page.url
            # Review-only prototype cannot be opened outside preview.
            await page.goto(BASE + '?semak=0#/nota-v2/t4-2/2.3/fahami')
            await page.wait_for_timeout(250)
            assert await page.locator('.nota-v2').count() == 0
            assert not errors, errors
            results.append({'width': width, 'result': 'PASS', 'questions': 30, 'coreStandards': 6, 'examples': 7})
            print(json.dumps(results[-1]), flush=True)
            await page.close()
        await browser.close()
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'interaction-results.json').write_text(json.dumps(results, indent=2))

asyncio.run(main())
