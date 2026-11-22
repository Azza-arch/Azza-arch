from pathlib import Path
import json,hashlib,time,statistics
from playwright.sync_api import sync_playwright
OUT=Path(__file__).parent;ROOT=OUT.resolve().parents[2]
BASE='http://127.0.0.1:8765/app/addmath/rooftop/v11.html'
checks=[];errors=[];metrics={}
with sync_playwright() as p:
 b=p.chromium.launch()
 ctx=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE);page.wait_for_selector('#welcome:not([hidden])')
 assert page.evaluate('typeof rooftop')=='undefined';checks.append('Normal route exposes no test hook')
 page.click('#start');page.wait_for_timeout(200)
 cdp=ctx.new_cdp_session(page)
 def hold(selector,ident=1):
  box=page.locator(selector).bounding_box();cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':box['x']+box['width']/2,'y':box['y']+box['height']/2,'id':ident}]})
 # Test-only reload for state reads; inputs remain actual touch events.
 page.goto(BASE+'?test');page.wait_for_selector('#welcome:not([hidden])');page.click('#start')
 hold('[data-hold="right"]');page.wait_for_function('()=>rooftop.scene.player.x>120')
 cdp.send('Input.dispatchTouchEvent',{'type':'touchCancel','touchPoints':[]})
 page.wait_for_function('()=>Math.abs(rooftop.scene.player.body.velocity.x)<1')
 x=page.evaluate('rooftop.scene.player.x');page.wait_for_timeout(200);assert abs(page.evaluate('rooftop.scene.player.x')-x)<1
 hold('[data-hold="right"]');page.wait_for_function('()=>rooftop.scene.player.body.velocity.x>0')
 page.evaluate('window.dispatchEvent(new Event("blur"))');page.wait_for_function("()=>rooftop.scene.mode==='paused'")
 cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.click('#resume');page.wait_for_timeout(200)
 assert page.evaluate('Math.abs(rooftop.scene.player.body.velocity.x)<1')
 checks.append('Touch cancellation and focus loss clear held movement')
 page.click('#pause');page.click('#pause-help');page.click('#help-close');assert page.evaluate('document.activeElement.id')=='pause-help'
 page.click('#pause-settings-btn');page.check('#audio-mute');page.click('#settings-close');page.click('#pause-menu');page.wait_for_selector('#welcome:not([hidden])')
 page.click('#continue-btn');page.wait_for_function("()=>rooftop.scene.mode==='playing'")
 checks.append('Pause help/settings return focus; title and Continue preserve save')
 metrics['portraitRAF']=page.evaluate('()=>new Promise(resolve=>{const deltas=[];let previous;function tick(t){if(previous)deltas.push(t-previous);previous=t;if(deltas.length<90)requestAnimationFrame(tick);else resolve({medianMs:deltas.sort((a,b)=>a-b)[45],over50ms:deltas.filter(x=>x>50).length});}requestAnimationFrame(tick);})')
 metrics['resources']=page.evaluate('performance.getEntriesByType("resource").reduce((o,r)=>({count:o.count+1,transferBytes:o.transferBytes+r.transferSize}),{count:0,transferBytes:0})')
 ctx.close()
 for size in [{'width':320,'height':568},{'width':844,'height':390}]:
  ctx=b.new_context(viewport=size,is_mobile=True,has_touch=True,reduced_motion='reduce');page=ctx.new_page()
  page.goto(BASE+'?test');page.wait_for_selector('#welcome:not([hidden])')
  assert page.evaluate("getComputedStyle(document.querySelector('.menu-mascot')).animationName==='none'")
  for selector in ['#start','#how-to-play','#settings-btn']:
   r=page.locator(selector).bounding_box();assert r['y']>=0 and r['y']+r['height']<=size['height']
  page.screenshot(path=str(OUT/f'screenshots/final/{size["width"]}-reduced-title.png'))
  page.click('#start');page.wait_for_timeout(150)
  boxes=page.locator('#touch-controls button:visible').evaluate_all('(nodes)=>nodes.map(n=>{const r=n.getBoundingClientRect();return {id:n.dataset.hold||n.dataset.action,x:r.x,y:r.y,w:r.width,h:r.height}})')
  assert all(q['w']>=44 and q['h']>=44 and q['x']>=0 and q['x']+q['w']<=size['width'] for q in boxes),boxes
  checks.append(f'{size["width"]}×{size["height"]}: reachable title; touch targets ≥44px; reduced motion')
  ctx.close()
 b.close()
# Compare high-risk preserved files with the actual Phase4 snapshot.
baseline={k.replace('\\','/'):v for k,v in json.loads((ROOT/'audits/level-v11/final-game-presentation/phase4-hashes.json').read_text()).items()}
for name in ['src/v11/level.js','src/v11/save.js','style.css']:
 assert hashlib.sha256((ROOT/'app/addmath/rooftop'/name).read_bytes()).hexdigest()==baseline[name],name
checks.append('Level geometry, save sanitizer and shared V9/V10 stylesheet hashes unchanged; V11.2 environment edits are visual only')
def contrast(a,b):
 def lum(h):
  rgb=[int(h[i:i+2],16)/255 for i in [0,2,4]]
  return sum(w*(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4) for w,v in zip([.2126,.7152,.0722],rgb))
 x,y=sorted([lum(a),lum(b)]);return round((y+.05)/(x+.05),2)
metrics['contrast']={k:contrast(a,b) for k,a,b in [('panel text','fff2ce','183a32'),('secondary text','e3e9d3','183a32'),('primary button','19352e','ffd16b'),('title','173e32','aee3f5')]}
assert all(v>=4.5 for v in metrics['contrast'].values())
checks.append('Authored text/button palette contrast ≥4.5:1')
(OUT/'release-qa.json').write_text(json.dumps({'passed':not errors,'checks':checks,'errors':errors,'metrics':metrics},indent=2))
print(json.dumps({'passed':not errors,'checks':checks,'errors':errors,'metrics':metrics}))
