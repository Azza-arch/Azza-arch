from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path.cwd(); out=root/'audits/level-v12/phase5/screenshots'; out.mkdir(parents=True,exist_ok=True)
url='http://127.0.0.1:8765/app/addmath/rooftop/v12.html'
seed={'schemaVersion':1,'layoutVersion':120,'levelId':'denai-bab1-functions-v12','checkpointId':'b-lift','solvedGateIds':[],'mappingInputs':[],'collectedCoinIds':[],'discoveredSecretIds':[],'elapsedMs':0,'waterOrder':None,'waterworksState':'LOCKED'}
seedD={**seed,'checkpointId':'d-machine','solvedGateIds':['lift']}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 page=b.new_page(viewport={'width':1440,'height':900})
 for label,sv in [('before-b',seed),('before-d',seedD)]:
  page.goto(url,wait_until='networkidle');page.evaluate('(x)=>localStorage.setItem("denai-save-v12",JSON.stringify(x))',sv);page.reload(wait_until='networkidle');page.click('#continue-btn');page.wait_for_timeout(800);page.screenshot(path=str(out/(label+'.png')))
 b.close()
