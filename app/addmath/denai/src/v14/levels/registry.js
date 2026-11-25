export const LEVELS=Object.freeze([
  {id:'w1-l1',scene:'Lorong',title:'Jejak Taman Fungsi',ready:true},
  {id:'w1-l2',scene:'Jambatan',title:'Jambatan Berkembar',ready:true,requires:'w1-l1'},
  {id:'w1-l3',scene:'GerbangSongsang',title:'Gerbang Songsang',ready:true,requires:'w1-l2'},
  // World 2 levels run on their own page (owner decision: World 2 opens after 1-1).
  {id:'w2-l1',page:'w2-l1.html',title:'Jejak Lengkung',ready:true,requires:'w1-l1'},
  {id:'w2-l2',page:'w2-l2.html',title:'Lembah Puncak',ready:true,requires:'w2-l1'},
  {id:'w2-l3',page:'w2-l3.html',title:'Gerbang Parabola',ready:true,requires:'w2-l2'},
  // World 3 (Kilang & Lombong): own pages too; it opens after 2-3.
  {id:'w3-l1',page:'w3-l1.html',title:'Tiga Injap',ready:true,requires:'w2-l3'},
  {id:'w3-l2',page:'w3-l2.html',title:'Rel Memotong Cerun',ready:true,requires:'w3-l1'},
  {id:'w3-l3',page:'w3-l3.html',title:'Bilik Kawalan',ready:true,requires:'w3-l2'},
  {id:'w3-l4',page:'w3-l4.html',title:'Loji Optimum',ready:true,requires:'w3-l3'},
]);
export function canPlay(id,completed,{localPreview=false}={}) {
  const level=LEVELS.find(l=>l.id===id);
  return !!level?.ready&&(!level.requires||completed.includes(level.requires)||localPreview);
}
