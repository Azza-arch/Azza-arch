"""Read-only runtime review; isolated browser storage, no gameplay modifications."""
from pathlib import Path
import ast, hashlib, json
from playwright.sync_api import sync_playwright
ROOT=Path.cwd(); OUT=ROOT/'audits/denai-v12/phase6-5a'; E=OUT/'evidence'; E.mkdir(exist_ok=True)
files=list((ROOT/'app/addmath/rooftop').rglob('*'))
def hashes():
    return {str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files if p.is_file()}
before=hashes()
tree=ast.parse((ROOT/'audits/level-v12/phase5-browser-qa.py').read_text(encoding='utf-8-sig'))
hook=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(getattr(t,'id','')=='HOOK' for t in n.targets))
url='http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
result={'purpose':'Visual review, not a new traversal certification','errors':[], 'views':[]}
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    for mobile,w,h in [(False,1440,900),(True,390,844)]:
        ctx=browser.new_context(viewport={'width':w,'height':h},has_touch=mobile,is_mobile=mobile)
        p=ctx.new_page(); p.add_init_script(hook)
        p.on('pageerror',lambda err:result['errors'].append(str(err)))
        p.goto(url,wait_until='networkidle')
        tag='portrait' if mobile else 'desktop'
        if not mobile:
            p.locator('#start').wait_for(state='visible');p.wait_for_timeout(500)
            p.screenshot(path=str(E/'title.png'));p.click('#start');p.wait_for_timeout(500)
            p.click('#pause');p.screenshot(path=str(E/'pause.png'))
        save={'schemaVersion':1,'layoutVersion':120,'levelId':'denai-bab1-functions-v12','checkpointId':'b-lift','solvedGateIds':[],'mappingInputs':[],'collectedCoinIds':[],'discoveredSecretIds':[],'elapsedMs':0,'waterOrder':None,'waterworksState':'LOCKED'}
        p.evaluate('(s)=>localStorage.setItem("denai-save-v12",JSON.stringify(s))',save)
        p.reload(wait_until='networkidle');p.click('#continue-btn');p.wait_for_timeout(400)
        if mobile:p.locator('[data-action="interact"]').tap()
        else:p.keyboard.press('e')
        p.locator('#mechanism:not([hidden])').wait_for();p.screenshot(path=str(E/(tag+'-b-panel.png')))
        result['views'].append({'viewport':[w,h],'state':p.evaluate('({mode:window.__s.mode, x:window.__s.player.x, text:document.querySelector("#mechanism").innerText})')})
        ctx.close()
    browser.close()
after=hashes();result['runtime_files_unchanged']=before==after;result['runtime_file_count']=len(before)
(E/'runtime-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
(E/'runtime-sha256.json').write_text(json.dumps(before,indent=2),encoding='utf-8')
print(json.dumps({'errors':result['errors'],'runtime_files_unchanged':before==after,'views':len(result['views'])}))
