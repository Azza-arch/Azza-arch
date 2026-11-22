"""Save fixtures for bounded UI confirmation; not reachability evidence."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parents[4]/'audits/level-v10/implementation'
URL='http://127.0.0.1:8765/app/addmath/rooftop/v10.html?test'
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);results=[]
 for width,height,touch in [(1440,1000,False),(844,390,True),(370,740,True)]:
  ctx=b.new_context(viewport={'width':width,'height':height},has_touch=touch,is_mobile=touch,reduced_motion='reduce')
  pg=ctx.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)));pg.goto(URL,wait_until='networkidle')
  pg.evaluate("localStorage.setItem('lorong-save-v10',JSON.stringify({schemaVersion:3,layoutVersion:10,levelId:'lorong-atas-bumbung-v10',checkpointId:'cp-b',solvedGateIds:[]}))")
  pg.reload(wait_until='networkidle');pg.click('#continue-btn');pg.wait_for_function('rooftop.scene.player.body.blocked.down')
  if touch:pg.tap('[data-action="interact"]')
  else:pg.keyboard.press('e')
  pg.wait_for_selector('#mechanism:not([hidden])');pg.click('#dial-preview');pg.wait_for_timeout(100)
  geometry=pg.evaluate('''()=>{const s=rooftop.scene,c=s.cameras.main,r=document.querySelector('canvas').getBoundingClientRect(),p=s.player.body,m=document.getElementById('mechanism').getBoundingClientRect(),scale=r.height/700; const screen=(x,y)=>({x:r.x+(x-c.worldView.x)*c.zoom*scale,y:r.y+(y-c.worldView.y)*c.zoom*scale});let a=screen(p.left,p.top),z=screen(p.right,p.bottom),g=screen(2010,978);return {player:{left:a.x,top:a.y,right:z.x,bottom:z.y},panel:{left:m.left,top:m.top,right:m.right,bottom:m.bottom},gear:g,fps:s.game.loop.actualFps,objects:s.children.length};}''')
  a=geometry['player'];m=geometry['panel'];assert a['right']<m['left'] or a['left']>m['right'] or a['bottom']<m['top'] or a['top']>m['bottom'],geometry
  g=geometry['gear'];assert not(m['left']<g['x']<m['right'] and m['top']<g['y']<m['bottom']),geometry
  pg.screenshot(path=str(OUT/'after'/f'confirmed-gear-{width}.png'))
  for _ in range(4):pg.click('#dial-more')
  pg.click('#dial-test');pg.wait_for_function('!!rooftop.scene.gateBodies.gear');pg.click('#dial-close')
  assert not errors,errors;results.append({'viewport':[width,height],'playerAndGearUncovered':True,'errors':errors,'geometry':geometry})
  ctx.close()
 (OUT/'logs/visual-confirmation.json').write_text(json.dumps(results,indent=2));print(json.dumps(results),flush=True);b.close()
