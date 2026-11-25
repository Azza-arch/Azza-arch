export const LEVELS=Object.freeze([
  {id:'w1-l1',scene:'Lorong',title:'Jejak Taman Fungsi',ready:true},
  {id:'w1-l2',scene:'Jambatan',title:'Jambatan Berkembar',ready:true,requires:'w1-l1'},
  {id:'w1-l3',scene:'GerbangSongsang',title:'Gerbang Songsang',ready:true,requires:'w1-l2'},
  // World 2 levels run on their own page (owner decision: World 2 opens after 1-1).
  {id:'w2-l1',page:'w2-l1.html',title:'Jejak Lengkung',ready:true,requires:'w1-l1'},
  {id:'w2-l2',page:'w2-l2.html',title:'Lembah Puncak',ready:true,requires:'w2-l1'},
  {id:'w2-l3',page:'w2-l3.html',title:'Gerbang Parabola',ready:true,requires:'w2-l2'},
]);
export function canPlay(id,completed,{localPreview=false}={}) {
  const level=LEVELS.find(l=>l.id===id);
  return !!level?.ready&&(!level.requires||completed.includes(level.requires)||localPreview);
}
