from pathlib import Path
from shutil import copy2
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[3]
out=root/'audits/level-v11/full-world-implementation/screenshots'
base='http://127.0.0.1:8765/app/addmath/rooftop/v11.html?menu-baseline-recreation'
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 for name,view,mobile in [('desktop',{'width':1440,'height':900},False),('mobile',{'width':390,'height':844},True)]:
  ctx=b.new_context(viewport=view,device_scale_factor=1,is_mobile=mobile,has_touch=mobile)
  page=ctx.new_page();page.goto(base,wait_until='networkidle');page.wait_for_selector('#welcome:not([hidden])')
  page.evaluate("""() => {
    document.body.classList.remove('menu-active');
    const w=document.querySelector('#welcome');
    w.querySelector('.menu-kicker').hidden=true;
    w.querySelector('.menu-mascot').hidden=true;
    w.querySelector('h2').innerHTML='Satu lorong.<br>Banyak laluan.';
    w.querySelector('h2').style.cssText='font:650 32px/1.1 system-ui,sans-serif;letter-spacing:-.035em;text-shadow:none;color:inherit;margin:0 0 14px';
    const intro=w.querySelector('#welcome-title').nextElementSibling;
    intro.textContent='Teroka taman, lintasi pengangkat bertuil dan cari laluan bonus kayu. Binaan ini merangkumi kawasan A, B dan C.';
    intro.style.cssText='font:13px/1.65 system-ui,sans-serif;color:#6b7068;margin:0';
    w.querySelector('#start').innerHTML='Mula Pengembaraan <span aria-hidden="true">→</span>';
    const small=[...w.children].find(x=>x.classList.contains('small')&&!x.hidden&&!x.classList.contains('menu-v9'));
    small.textContent='Dunia V11.1 · Main versi V9 penuh';
    w.querySelector('.menu-v9').hidden=true;
    Object.assign(w.style,{width:'350px',right:'5%',left:'auto',top:'5%',bottom:'5%',transform:'none',padding:'28px',background:'#fff',border:'1px solid #d4d6cf',borderRadius:'8px',boxShadow:'none',maxHeight:'none'});
    const media=matchMedia('(max-width:540px) and (orientation:portrait)').matches;
    if(media) Object.assign(w.style,{left:'16px',right:'16px',top:'50%',bottom:'auto',width:'auto',transform:'translateY(-50%)',padding:'24px'});
    w.querySelectorAll('.primary').forEach(x=>x.style.cssText='width:100%;display:flex;justify-content:space-between;align-items:center;background:#323a31;color:#fff;border:1px solid #323a31;border-radius:6px;box-shadow:none;font:650 16px system-ui,sans-serif');
    w.querySelector('.menu-section').style.cssText='display:flex;justify-content:flex-start;gap:8px;margin-top:12px';
  }""")
  page.screenshot(path=str(out/f'menu-before-reconstructed-{name}.png'))
  copy2(out/f'phase1-menu-{name}.png',out/f'menu-after-{name}.png')
  ctx.close()
 b.close()
print('Captured reconstructed pre-polish and actual after menu views at desktop and mobile sizes.')
