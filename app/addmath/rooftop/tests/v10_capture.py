"""Fixed camera composition review. Save fixtures, not traversal evidence."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parents[4]/'audits/level-v10/full-world-implementation'
with sync_playwright() as p:
 b=p.chromium.launch(headless=True);ctx=b.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce');pg=ctx.new_page()
 pg.goto('http://127.0.0.1:8765/app/addmath/rooftop/v10.html?test',wait_until='networkidle')
 cameras=[]
 for zone,cp,x,y in [('A','cp-a',640,1100),('B','cp-b',2150,900),('C','cp-c',1740,650),('D','cp-d',3440,800),('E','cp-e',4800,750),('F','cp-f',6500,1000),('G','cp-g',7800,1110)]:
  save={'schemaVersion':3,'layoutVersion':10,'levelId':'lorong-atas-bumbung-v10','checkpointId':cp,'solvedGateIds':['gear','block','pipe','final'],'finalLatches':{'input':True,'composition':True}}
  pg.evaluate('(s)=>localStorage.setItem("lorong-save-v10",JSON.stringify(s))',save);pg.reload(wait_until='networkidle');pg.click('#continue-btn');pg.wait_for_function('()=>rooftop.scene.player.body.blocked.down')
  pg.evaluate('([x,y])=>{let c=rooftop.scene.cameras.main;c.stopFollow();c.centerOn(x,y)}',[x,y]);pg.wait_for_timeout(250)
  pg.locator('.game-stage').screenshot(path=str(OUT/'screenshots'/f'zone-{zone}-composition.png'))
  cameras.append({'zone':zone,'centerX':x,'centerY':y,'checkpointFixture':cp,'traversalEvidence':False})
 (OUT/'logs/composition-cameras.json').write_text(json.dumps(cameras,indent=2));ctx.close();b.close()
