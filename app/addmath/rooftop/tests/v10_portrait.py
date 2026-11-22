"""Save fixtures verify UI/restoration only, not reachability (see v10_full.py)."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parents[4]/'audits/level-v10/full-world-implementation'
URL='http://127.0.0.1:8765/app/addmath/rooftop/v10.html?test'
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 ctx=b.new_context(viewport={'width':370,'height':740},has_touch=True,is_mobile=True,reduced_motion='reduce')
 pg=ctx.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
 pg.goto(URL,wait_until='networkidle')
 old=json.dumps({'schemaVersion':2,'levelId':'lorong-atas-bumbung-1','checkpointId':'cp1-cafe','solvedGateIds':[],'collectedCoinIds':['coin-c'],'discoveredSecretIds':['secret-oyen'],'completed':False})
 pg.evaluate('(s)=>localStorage.setItem("lorong-save-v1",s)',old);pg.reload(wait_until='networkidle')
 assert pg.evaluate('localStorage.getItem("lorong-save-v10")') is None
 pg.tap('#import-v9');pg.tap('#continue-btn');pg.wait_for_function('()=>rooftop.scene.player.body.blocked.down')
 assert pg.evaluate('rooftop.scene.player.body.bottom')==810
 assert pg.evaluate('localStorage.getItem("lorong-save-v1")')==old
 for cp,gates,latches,name in [('cp-e',['gear','block'],{},'E'),('cp-f',['gear','block','pipe'],{},'F'),('cp-g',['gear','block','pipe'],{'input':True},'G')]:
  save={'schemaVersion':3,'layoutVersion':10,'levelId':'lorong-atas-bumbung-v10','checkpointId':cp,'solvedGateIds':gates,'finalLatches':latches,'elapsedMs':12345,'inverseSolved':name=='F','discoveredSecretIds':['secret-cave-treasure'] if name=='F' else []}
  pg.evaluate('(s)=>localStorage.setItem("lorong-save-v10",JSON.stringify(s))',save);pg.reload(wait_until='networkidle');pg.tap('#continue-btn');pg.wait_for_function('()=>rooftop.scene.player.body.blocked.down')
  assert pg.evaluate('rooftop.scene.elapsed')>=12345
  assert pg.evaluate('document.documentElement.scrollWidth<=innerWidth')
  pg.screenshot(path=str(OUT/'screenshots'/f'portrait-{name}-restore.png'))
  if name=='F':
   assert pg.evaluate('rooftop.scene.inverseSolved')
   continue
  if name=='G':
   # Main-bank checkpoint lies exactly at the interaction radius; take two small touch steps.
   box=pg.locator('[data-hold="right"]').bounding_box();cdp=ctx.new_cdp_session(pg)
   point={'x':box['x']+box['width']/2,'y':box['y']+box['height']/2,'id':1}
   cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[point]});pg.wait_for_timeout(150)
   cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[point]});pg.wait_for_timeout(150)
  pg.tap('[data-action="interact"]');pg.wait_for_function('()=>rooftop.scene.mode==="mechanism"')
  pg.tap('#dial-hint');pg.tap('#dial-test');pg.wait_for_function('()=>!rooftop.scene.dialBusy')
  pg.screenshot(path=str(OUT/'screenshots'/f'portrait-{name}-panel.png'))
  pg.tap('[data-order="fg"]');pg.tap('#dial-test');pg.wait_for_function('()=>rooftop.scene.mode==="playing"')
  assert pg.locator('#mechanism').is_hidden()
  expected='pipe' if name=='E' else 'final'
  assert pg.evaluate('(id)=>!!rooftop.scene.gateBodies[id]',expected)
  pg.reload(wait_until='networkidle');pg.tap('#continue-btn');pg.wait_for_function('()=>rooftop.scene.player.body.blocked.down')
  assert pg.evaluate('(id)=>!!rooftop.scene.gateBodies[id]',expected)
  pg.tap('#pause');pg.wait_for_function('()=>rooftop.scene.mode==="paused"');pg.tap('#resume');pg.wait_for_function('()=>rooftop.scene.mode==="playing"')
 assert pg.evaluate('localStorage.getItem("lorong-save-v1")')==old
 assert not errors,errors
 (OUT/'logs/portrait-save.json').write_text(json.dumps({'passed':True,'fixtureBased':True,'reachabilityProof':False,'viewport':'370x740','reducedMotion':True,'legacyBytesPreserved':True,'restoredCheckpoints':['cp-c','cp-e','cp-f','cp-g'],'automaticCloseAndSafeCollision':['pipe','final'],'pauseResume':True,'errors':errors},indent=2))
 ctx.close();b.close()
