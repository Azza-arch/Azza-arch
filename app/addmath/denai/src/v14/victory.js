// One victory panel for every level. Level 1-1 fills #complete itself
// (celebration, leaderboard, share). 1-2 and 1-3 call showLevelVictory(),
// which reuses the SAME dialog and styles in "level mode": same banner,
// coin / secret / time stats, next-adventure teaser and the same actions
// (Teruskan · Main semula · Peta Dunia · Menu utama).
const $=id=>document.getElementById(id);
const fmt=ms=>{const s=Math.max(0,Math.floor(ms/1000));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
let handlers={};

function ensureLevelActions(){
  if($('lv-actions'))return;
  const actions=document.createElement('div');actions.id='lv-actions';actions.className='victory-actions lv-actions';
  actions.innerHTML='<button type="button" id="lv-replay" class="secondary">Main semula</button><button type="button" id="lv-map" class="secondary">Peta Dunia</button><button type="button" id="lv-menu" class="link-btn">Menu utama</button>';
  document.querySelector('#complete .victory-panel').append(actions);
  const next=document.createElement('button');next.type='button';next.id='lv-next';next.className='primary';
  document.querySelector('#complete .teaser').append(next);
  const run=key=>()=>{const h=handlers[key];if(!h)return;$('complete').close();exitLevelMode();h();};
  next.addEventListener('click',run('next'));
  $('lv-replay').addEventListener('click',run('replay'));
  $('lv-map').addEventListener('click',run('map'));
  $('lv-menu').addEventListener('click',run('menu'));
}
// Back to the 1-1 layout (called by 1-1 before it shows its own panel).
export function exitLevelMode(){
  const dlg=$('complete');if(!dlg)return;
  dlg.classList.remove('is-level-mode');
  const k=dlg.querySelector('.victory-kicker');if(k&&k.dataset.l1)k.textContent=k.dataset.l1;
  const t=dlg.querySelector('.teaser');if(t?.dataset.l1){const [kick,title,quote]=JSON.parse(t.dataset.l1);t.querySelector('.teaser-kicker').textContent=kick;t.querySelector('.teaser-title').textContent=title;t.querySelector('.teaser-quote').textContent=quote;t.hidden=false;}
}
/**
 * @param o.level      e.g. '1-2'
 * @param o.quote      one line on the maths just practised
 * @param o.coins      [found,total]   o.secrets [found,total]   o.timeMs
 * @param o.newBest    true when this run set the level's best time
 * @param o.hint       optional line (missed secrets / coins)
 * @param o.next       {title,quote,label} or null (last level of the world)
 * @param o.finale     {kicker,title,quote} shown in the teaser when there is no next level
 * @param o.on         {next,replay,map,menu} callbacks
 */
export function showLevelVictory(o){
  const dlg=$('complete');if(!dlg)return;
  ensureLevelActions();handlers=o.on||{};
  const kick=dlg.querySelector('.victory-kicker'),teaser=dlg.querySelector('.teaser');
  kick.dataset.l1??=kick.textContent;
  teaser.dataset.l1??=JSON.stringify([teaser.querySelector('.teaser-kicker').textContent,teaser.querySelector('.teaser-title').textContent,teaser.querySelector('.teaser-quote').textContent]);
  dlg.classList.add('is-level-mode');
  kick.textContent=`★ Level ${o.level} ★`;
  $('destination-reaction').textContent=o.quote?`“${o.quote}”`:'';
  $('completion-coins').textContent=`${o.coins[0]}/${o.coins[1]}`;
  $('completion-secrets').textContent=`${o.secrets[0]}/${o.secrets[1]}`;
  $('completion-time').textContent=fmt(o.timeMs);
  $('vstat-time').querySelector('.vbadge')?.remove();
  if(o.newBest){const b=document.createElement('span');b.className='vbadge';b.textContent='Rekod!';b.title=`Masa terbaik baharu: ${fmt(o.timeMs)}`;$('vstat-time').append(b);}
  const hint=$('completion-pb');hint.hidden=!o.hint;hint.textContent=o.hint||'';hint.classList.remove('is-best');
  $('vrank')&&($('vrank').hidden=true);
  const nextBtn=$('lv-next');
  if(o.next){
    teaser.hidden=false;teaser.querySelector('.teaser-kicker').textContent='Pengembaraan seterusnya';
    teaser.querySelector('.teaser-title').textContent=o.next.title;teaser.querySelector('.teaser-quote').textContent=o.next.quote||'';
    nextBtn.hidden=false;nextBtn.textContent=o.next.label;
    $('lv-map').className='secondary';
  }else{
    const f=o.finale;teaser.hidden=!f;nextBtn.hidden=true;
    if(f){teaser.querySelector('.teaser-kicker').textContent=f.kicker;teaser.querySelector('.teaser-title').textContent=f.title;teaser.querySelector('.teaser-quote').textContent=f.quote||'';}
    $('lv-map').className='primary victory-main'; // the natural next step after the last level
  }
  if(!dlg.open)dlg.showModal();
  requestAnimationFrame(()=>(o.next?nextBtn:$('lv-map')).focus({preventScroll:true}));
}
