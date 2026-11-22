import time
from playwright.sync_api import sync_playwright

BASE='http://localhost/Azza-arch/storage/denai-main-merge-20261115/app/addmath/denai/main.html'
HOOK="""Object.defineProperty(window,'Phaser',{configurable:true,set(v){const G=v.Game;v.Game=class extends G{constructor(c){super(c);window.testGame=this}};Object.defineProperty(window,'Phaser',{value:v,writable:true,configurable:true})}});"""
def wait(p,expr):
    end=time.monotonic()+30
    while time.monotonic()<end:
        if p.evaluate(expr): return
        p.wait_for_timeout(100)
    raise AssertionError(expr)
with sync_playwright() as pw:
    browser=pw.chromium.launch()
    errors=[]
    for mobile in [False,True]:
        context=browser.new_context(viewport={'width':390 if mobile else 1440,'height':844 if mobile else 900},is_mobile=mobile,has_touch=mobile,reduced_motion='reduce')
        p=context.new_page();p.add_init_script(HOOK);p.on('pageerror',lambda e:errors.append(str(e)))
        p.goto(BASE)
        wait(p,'!!window.testGame?.scene.getScene("Lorong")?.player')
        if mobile:
            p.locator('.rotate-stay').click()
            assert p.locator('.rotate-card').is_hidden()
        p.locator('#start').click()
        wait(p,'testGame.scene.getScene("Lorong").mode==="playing"')
        for level,scene in [('w1-l2','Jambatan'),('w1-l3','GerbangSongsang')]:
            p.goto(BASE+'?level='+level)
            wait(p,f'!!window.testGame?.scene.getScene("{scene}")?.player')
            assert p.locator('#level3-action').count()==1
            assert p.evaluate('Array.from(document.styleSheets).some(s=>s.href?.endsWith("inverse.css"))')
        p.evaluate('testGame.scene.getScene("GerbangSongsang").player.body.reset(2862,1589)')
        wait(p,'!document.querySelector("#inverse-panel").hidden')
        p.locator('[data-action="demo"]').click();wait(p,'!testGame.scene.getScene("GerbangSongsang").busy')
        p.locator('[data-action="apply"]').click();wait(p,'testGame.scene.getScene("GerbangSongsang").run.puzzle.seals[13]')
        assert not errors,errors
        context.close()
    browser.close()
    print('PASS: merged main.html boots L1/L2/L3; orientation dismissal and L3 demo/apply on desktop/mobile; no page errors.')
