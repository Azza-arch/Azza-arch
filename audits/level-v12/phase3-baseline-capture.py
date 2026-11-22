from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'audits/level-v12/phase3-baseline/screenshots'
OUT.mkdir(parents=True,exist_ok=True)
URL='http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
save={'schemaVersion':1,'layoutVersion':120,'levelId':'denai-bab1-functions-v12','checkpointId':'e-crossing','solvedGateIds':['lift','number-span','water-crossing'],'mappingInputs':[],'collectedCoinIds':[],'discoveredSecretIds':[],'elapsedMs':0,'waterOrder':'fg','waterworksState':'CROSSING_SAFE'}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 c=b.new_context(viewport={'width':1440,'height':900},device_scale_factor=1)
 page=c.new_page(); errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(URL,wait_until='networkidle')
 page.evaluate("d=>localStorage.setItem('denai-save-v12',JSON.stringify(d))",save)
 page.reload(wait_until='networkidle');page.locator('#continue-btn:not([hidden])').wait_for();page.click('#continue-btn')
 page.wait_for_timeout(400);page.screenshot(path=str(OUT/'before-zone-f-entry.png'))
 def hold(key,ms,jump=False):
  page.keyboard.down(key)
  if jump: page.keyboard.down('Space')
  page.wait_for_timeout(ms)
  if jump: page.keyboard.up('Space')
  page.keyboard.up(key);page.wait_for_timeout(500)
 hold('d',650);hold('d',600,True);hold('d',600,True)
 page.screenshot(path=str(OUT/'before-zone-f-step2.png'))
 result={'pageErrors':errors,'checkpointAfterTraverse':page.evaluate("JSON.parse(localStorage.getItem('denai-save-v12')).checkpointId")}
 (OUT/'baseline.json').write_text(json.dumps(result,indent=2),encoding='utf8')
 print(json.dumps(result,indent=2));b.close()
