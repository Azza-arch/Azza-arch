from pathlib import Path
import zipfile,hashlib,json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).parent
(OUT/'screenshots/baseline').mkdir(parents=True,exist_ok=True)
runtime=ROOT/'app/addmath/rooftop'
files=[runtime/'v11.html',runtime/'style.css',*sorted((runtime/'src/v11').glob('*'))]
backup=OUT/'phase4-snapshot.zip'
if not backup.exists():
 with zipfile.ZipFile(backup,'w',zipfile.ZIP_DEFLATED) as z:
  for f in files:
   if f.is_file():z.write(f,f.relative_to(runtime))
 (OUT/'phase4-hashes.json').write_text(json.dumps({str(f.relative_to(runtime)):hashlib.sha256(f.read_bytes()).hexdigest() for f in files if f.is_file()},indent=2))
with sync_playwright() as p:
 b=p.chromium.launch()
 for name,size in [('desktop',{'width':1440,'height':900}),('portrait',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
  page=b.new_page(viewport=size,is_mobile=name!='desktop',has_touch=name!='desktop')
  page.goto('http://127.0.0.1:8765/app/addmath/rooftop/v11.html?test');page.wait_for_selector('#welcome:not([hidden])')
  page.screenshot(path=str(OUT/f'screenshots/baseline/{name}-title.png'))
  page.click('#start');page.wait_for_timeout(400)
  page.screenshot(path=str(OUT/f'screenshots/baseline/{name}-game.png'))
  page.close()
 b.close()
print('Phase4 snapshot and six baseline captures saved.')
