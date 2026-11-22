from pathlib import Path
import sys,json
sys.argv=['phase6-touch','B']
prefix=Path('audits/level-v12/phase5-verify.py').read_text(encoding='utf-8').split('results={}')[0]
exec(compile(prefix,'phase5-verify-helpers','exec'))
OUT=ROOT/'audits/level-v12/phase6/touch';OUT.mkdir(parents=True,exist_ok=True)
BASE.update(checkpointId='g-river',solvedGateIds=['lift','number-span','water-crossing'],waterOrder='fg',waterworksState='CROSSING_SAFE')
results=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True)
 for label,width,height,reduce in [('portrait',390,844,'no-preference'),('landscape',844,390,'reduce')]:
  ctx=browser.new_context(viewport={'width':width,'height':height},has_touch=True,is_mobile=True,reduced_motion=reduce)
  p=ctx.new_page();p.add_init_script(HOOK);errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  boot(p);move(p,7340,True);interact(p,True);p.locator('#mechanism:not([hidden])').wait_for()
  p.locator('[data-token="4"]').tap();p.locator('#dial-test').tap();assert '13' in p.locator('#mechanism-value').inner_text();assert not ev(p,'s.solvedGates.has("river-input")')
  p.locator('[data-token="5"]').tap();p.locator('#dial-test').tap();wait(p,'s.mode==="playing"');assert ev(p,'s.riverLever.angle')==-24;shot(p,label+'-latch-one')
  reload(p);assert ev(p,'s.riverLever.angle')==-24;move(p,7340,True);interact(p,True);p.locator('#mechanism:not([hidden])').wait_for()
  p.locator('[data-order="gf"]').tap();assert '9' in p.locator('#mechanism-value').inner_text();assert not ev(p,'!!s.gateBodies["river-crossing"]');shot(p,label+'-order-retry')
  p.locator('[data-order="fg"]').tap()
  if reduce=='no-preference':
   wait(p,'s.riverBridge.some(a=>a.y<1240&&a.y>974)');p.locator('#pause').tap();before=ev(p,'s.riverBridge.map(a=>a.y)');p.wait_for_timeout(300);assert ev(p,'s.riverBridge.map(a=>a.y)')==before
   # Reload while paused mid-animation settles safely at the west checkpoint.
   reload(p)
  else:wait(p,'s.mode==="playing"&&!!s.gateBodies["river-crossing"]')
  assert ev(p,'s.player.x')<7506;assert ev(p,'s.gateBodies["river-crossing"].body.top')==972;assert ev(p,'s.riverLever.angle')==-52
  ev(p,'s.finish()');assert not ev(p,'s.levelCompleted');shot(p,label+'-safe-bridge')
  move(p,7890,True);assert ev(p,'s.player.body.bottom')==972;shot(p,label+'-crossed')
  assert not errors,errors;results.append({'viewport':label,'passed':True,'wrongAndCorrectInputs':True,'partialContinue':True,'touchCrossing':True,'noEarlyCompletion':True,'errors':errors});ctx.close()
 browser.close()
(OUT/'results.json').write_text(json.dumps(results,indent=2),encoding='utf-8');print(json.dumps(results,indent=2))
