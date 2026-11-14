// Browser smoke test for every registered notes chapter (preview mode).
// Needs: python3 -m http.server 8790 at the repo root; Playwright.
//   node app/addmath/tests/notes-smoke.cjs [chapterId…]
const {chromium,devices}=require('playwright');const fs=require('fs');const path=require('path');
const B='http://127.0.0.1:8790/app/addmath/';
const idx=fs.readFileSync(path.join(__dirname,'../src/content/notes/index.js'),'utf8');
const chapters=process.argv.slice(2).length?process.argv.slice(2):[...idx.matchAll(/'(t[45]-\d+)': \(\) => import/g)].map(m=>m[1]);
(async()=>{const b=await chromium.launch();let pass=0,total=0;const ok=(n,c,d)=>{total++;if(c)pass++;else console.log('FAIL',n,JSON.stringify(d));};
for(const [name,opt] of [['desktop',{viewport:{width:1280,height:900}}],['phone',{...devices['iPhone 13']}]]){
 const c=await b.newContext(opt);const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'&&!/frame-ancestors/.test(m.text()))errs.push(m.text())});
 for(const ch of chapters){
  await p.goto(B+'?semak=0#/bab/'+ch);await p.waitForTimeout(400);ok(`${name} ${ch}: hidden publicly`,await p.evaluate(()=>document.querySelectorAll('.sub-card').length===0));
  await p.goto(B+'?semak=1#/bab/'+ch);await p.waitForTimeout(500);
  const subs=await p.evaluate(()=>[...document.querySelectorAll('.sub-card')].map(s=>s.dataset.sub));ok(`${name} ${ch}: preview lists subtopics`,subs.length>0,subs);
  for(const s of subs){await p.goto(B+`#/nota/${ch}/${s}`);await p.waitForSelector('.q-card',{timeout:8000});await p.waitForTimeout(300);
   const st=await p.evaluate(()=>({katex:document.querySelectorAll('.katex').length,err:document.querySelectorAll('.katex-error').length,figs:document.querySelectorAll('.visual-fig').length,drawn:document.querySelectorAll('.visual-fig svg,.visual-fig .value-table').length,q:document.querySelectorAll('.q-card').length,overflow:document.documentElement.scrollWidth>innerWidth+1}));
   ok(`${name} ${ch} ${s}: renders`,st.katex>20&&!st.err&&st.drawn>=st.figs&&st.q>=5&&!st.overflow,st);
   // every visual's first slider must change its readout (if it has both)
   const vis=await p.evaluate(()=>[...document.querySelectorAll('.visual-fig')].map((f,i)=>({i,slider:!!f.querySelector('input[type=range]'),readout:!!f.querySelector('.plot-readout')})));
   for(const v of vis.filter(v=>v.slider&&v.readout)){const fig=p.locator('.visual-fig').nth(v.i);const before=await fig.locator('.plot-readout').innerText();let changed=false;const rs=fig.locator('input[type=range]');for(let k=0;k<await rs.count()&&!changed;k++){const r=rs.nth(k);await r.fill(await r.getAttribute('max'));await r.dispatchEvent('input');changed=before!==await fig.locator('.plot-readout').innerText();}ok(`${name} ${ch} ${s} visual ${v.i+1}: sliders update readout`,changed);}
  }}
 ok(`${name}: no console errors`,!errs.length,errs);await c.close();}
console.log(`${pass}/${total} passed (${chapters.join(', ')})`);await b.close();process.exit(pass===total?0:1);})();
