import json, subprocess, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ART=Path(__file__).resolve().parent
BASE='http://localhost/Azza-arch/app/addmath/denai/'
SERVER='C:/Users/syhaz/.agents/skills/impeccable/scripts/live-server.mjs'
HOOK="""Object.defineProperty(window,'Phaser',{configurable:true,set(value){const Original=value.Game;value.Game=class extends Original{constructor(config){super(config);window.testGame=this;}};Object.defineProperty(window,'Phaser',{value,writable:true,configurable:true});}});"""
report={'method':'Fresh headless Chromium pages; scene relocation for focused mechanism checks, not a full traversal.','views':[]}
def node(*args):
 return subprocess.run(['node',SERVER,*args],cwd=ART,capture_output=True,text=True,creationflags=subprocess.CREATE_NO_WINDOW,timeout=20)
with sync_playwright() as p:
 browser=p.chromium.launch()
 server=None
 try:
  for level,scene in [(1,'Lorong'),(2,'Jambatan'),(3,'GerbangSongsang')]:
   page=browser.new_page(viewport={'width':1440,'height':900})
   page.add_init_script(HOOK)
   errors=[]; logs=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('console',lambda m:logs.append(m.text) if 'impeccable' in m.text.lower() else None)
   page.goto(BASE+('' if level==1 else '?level=w1-l'+str(level)))
   S="testGame.scene.getScene('"+scene+"')"
   deadline=time.monotonic()+35
   while not page.evaluate('!!window.testGame?.scene.getScene("'+scene+'")?.player'):
    if time.monotonic()>deadline:raise RuntimeError('Scene load timeout: '+scene)
    page.wait_for_timeout(100)
   page.wait_for_timeout(600)
   row={'level':level,'errors':errors}
   page.evaluate("document.title='[Human] DENAI evidence';const s=document.createElement('script');s.textContent='window.auditMutation=true';document.head.append(s)")
   row['mutation']=page.evaluate('window.auditMutation===true')
   if server is None:
    r=node('--background');row['server_start']={'exit':r.returncode,'stdout':r.stdout,'stderr':r.stderr}
    if r.returncode==0: server=json.loads(r.stdout.strip().splitlines()[-1])
   if level==1:
    page.locator('#start').click()
    page.wait_for_timeout(400)
    page.evaluate(S+'.openLiftQuickPanel()')
    page.wait_for_timeout(400)
    row['mission']=page.evaluate('({mission:'+S+'.mission,text:'+S+'.missionText})')
   else:
    page.evaluate(S+'.player.body.reset(' + ('1404,1230' if level==2 else '2862,1560')+')')
    page.wait_for_timeout(500)
   page.screenshot(path=str(ART/('evidence-l'+str(level)+'-desktop.png')))
   if level==2:
    page.locator('[data-command="send"]').click();page.wait_for_timeout(1500)
    row['default_send']=page.evaluate(S+'.run.puzzles.twins')
    page.locator('[data-command="order"]').click();page.locator('[data-command="send"]').click();page.wait_for_timeout(1500)
    row['default_two_orders']=page.evaluate('({puzzle:'+S+'.run.puzzles.twins,bridges:Object.keys('+S+'.bridges||{})})')
   if level==3:
    page.locator('[data-action="reverse"]').click();page.wait_for_timeout(800)
    row['default_reverse']=page.evaluate(S+'.run.puzzle')
    page.locator('[data-action="down"]').click();page.locator('[data-action="reverse"]').click();page.wait_for_timeout(800)
    row['valid_non_target']=page.evaluate(S+'.run.puzzle')
    for _ in range(5):page.locator('[data-action="down"]').click()
    row['wrap_output']=page.evaluate(S+'.run.puzzle.output')
    page.locator('[data-action="reverse"]').click();page.wait_for_timeout(800)
    row['invalid_output']=page.evaluate(S+'.run.puzzle')
   if server:
    try:
     page.add_script_tag(url='http://localhost:'+str(server['port'])+'/detect.js');page.wait_for_timeout(2500)
     row['overlay_injected']=True;row['overlay_console']=logs
    except Exception as e:row['overlay_error']=str(e)
   page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(500)
   page.screenshot(path=str(ART/('evidence-l'+str(level)+'-mobile.png')))
   row['horizontal_overflow']=page.evaluate('document.documentElement.scrollWidth>innerWidth')
   report['views'].append(row)
   page.close()
 except Exception as e:report['failure']=str(e)
 finally:
  if server:
   r=node('stop');report['server_stop']={'exit':r.returncode,'stdout':r.stdout,'stderr':r.stderr}
  browser.close()
  (ART/'browser-evidence.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
  print(json.dumps(report,ensure_ascii=False))
