export const LEVELS=Object.freeze([
  {id:'w1-l1',scene:'Lorong',title:'Jejak Taman Fungsi',ready:true},
  {id:'w1-l2',scene:'Jambatan',title:'Jambatan Berkembar',ready:true,requires:'w1-l1'},
  {id:'w1-l3',title:'Gerbang Songsang',ready:false,requires:'w1-l2'},
]);
export function canPlay(id,completed,{localPreview=false}={}) {
  const level=LEVELS.find(l=>l.id===id);
  return !!level?.ready&&(!level.requires||completed.includes(level.requires)||localPreview);
}
