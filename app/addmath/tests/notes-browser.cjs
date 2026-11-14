const {chromium,devices}=require('playwright');const S=process.argv[2];const B='http://127.0.0.1:8790/app/addmath/';
(async()=>{const b=await chromium.launch();const R=[];const ok=(n,c,d)=>{R.push(c);console.log(c?'PASS':'FAIL',n,d!==undefined?JSON.stringify(d).slice(0,300):'');};
 for(const [name,opt] of [['desktop',{viewport:{width:1280,height:900},deviceScaleFactor:1}],['phone',{...devices['iPhone 13']}]]){
  const c=await b.newContext(opt);const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'&&!/frame-ancestors/.test(m.text()))errs.push(m.text())});
  // public view
  await p.goto(B+'#/bab/t4-1');await p.waitForTimeout(700);
  const pub=await p.evaluate(()=>({subs:document.querySelectorAll('.sub-card').length,banner:!!document.querySelector('.preview-banner'),legacy:!!document.getElementById('ch-legacy')}));
  ok(`${name}: public Bab 1 hides review notes, keeps legacy lessons`,pub.subs===0&&!pub.banner&&pub.legacy,pub);
  await p.goto(B+'#/nota/t4-1/1.1');await p.waitForTimeout(700);
  ok(`${name}: public cannot open a review subtopic by URL`,await p.evaluate(()=>location.hash==='#/bab/t4-1'),await p.evaluate(()=>location.hash));
  // preview
  await p.goto(B+'?semak=1#/bab/t4-1');await p.waitForTimeout(800);
  ok(`${name}: preview shows 3 subtopics with banner`,await p.evaluate(()=>document.querySelectorAll('.sub-card').length===3&&!!document.querySelector('.preview-banner')));
  for(const sub of ['1.1','1.2','1.3']){
   await p.goto(B+'#/nota/t4-1/'+sub);await p.waitForSelector('.q-card',{timeout:8000});await p.waitForTimeout(500);
   const st=await p.evaluate(()=>({katex:document.querySelectorAll('.katex').length,katexErr:document.querySelectorAll('.katex-error').length,mathml:document.querySelectorAll('.katex math').length,svgs:document.querySelectorAll('.visual-fig svg, .value-table').length,figs:document.querySelectorAll('.visual-fig').length,q:document.querySelectorAll('.q-card').length,ex:document.querySelectorAll('.example').length,overflow:document.documentElement.scrollWidth>innerWidth+1,font:getComputedStyle(document.querySelector('.katex')).fontFamily}));
   ok(`${name}: ${sub} renders (KaTeX+MathML, visuals, examples, practice, no h-scroll)`,st.katex>30&&st.katexErr===0&&st.mathml===st.katex&&st.svgs>=st.figs&&st.q>=9&&st.ex>=5&&!st.overflow&&/KaTeX/.test(st.font),st);
   if(sub==='1.1'&&name==='desktop'){await p.screenshot({path:`${S}/nota11_top.png`});}
  }
  // practice interactions on 1.2
  await p.goto(B+'#/nota/t4-1/1.2');await p.waitForSelector('.q-card');
  const card=id=>p.locator(`[id="q-${id}-card"]`);
  await card('t4-1.2-03').locator('.q-input').fill('4(x+2)-1');await card('t4-1.2-03').locator('.q-check').click();
  const r1=await card('t4-1.2-03').locator('.q-feedback').getAttribute('class');
  await card('t4-1.2-03').locator('.q-input').fill('4x+1');await card('t4-1.2-03').locator('.q-check').click();
  const r2=await card('t4-1.2-03').locator('.q-feedback').innerText();
  ok(`${name}: expression answer accepts equivalent form, explains gf mistake`,/is-right/.test(r1)&&/gf/.test(r2),{r1,r2});
  await card('t4-1.2-01').locator('.q-input').fill('21');await card('t4-1.2-01').locator('.q-check').click();
  ok(`${name}: numeric wrong answer gives specific feedback`,/gf\(2\)|gf/.test(await card('t4-1.2-01').locator('.q-feedback').innerText()));
  await card('t4-1.2-09').locator('.q-part').nth(0).locator('.q-input').fill('104');await card('t4-1.2-09').locator('.q-part').nth(0).locator('.q-check').click();
  ok(`${name}: structured part checks`,/is-right/.test(await card('t4-1.2-09').locator('.q-part').nth(0).locator('.q-feedback').getAttribute('class')));
  // visual slider
  await p.goto(B+'#/nota/t4-1/1.1');await p.waitForSelector('.plot-svg');
  const before=await p.locator('.plot-readout').first().innerText();await p.locator('.plot-param input').first().fill('2.5');await p.locator('.plot-param input').first().dispatchEvent('input');
  const after=await p.locator('.plot-readout').first().innerText();ok(`${name}: slider updates visual readout`,before!==after,{after:after.slice(0,80)});
  if(name==='phone'){await p.locator('.visual-fig').nth(1).scrollIntoViewIfNeeded();await p.screenshot({path:`${S}/nota11_phone_visual.png`});await p.locator('#latihan').scrollIntoViewIfNeeded();await p.screenshot({path:`${S}/nota11_phone_practice.png`});}
  ok(`${name}: no console errors`,errs.length===0,errs);await c.close();}
 console.log(`${R.filter(Boolean).length}/${R.length} passed`);await b.close();})();
