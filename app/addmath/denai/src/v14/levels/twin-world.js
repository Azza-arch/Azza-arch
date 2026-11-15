export const WORLD={width:4860,height:1600,floor:1566,gravity:1400};
export const SPAWN={x:108,feet:1296};
export const GOAL={x:4698,feet:1188};
export const AB_TERRAIN=[
  ['entry',0,648,1296],['garden',648,324,1242],
  ['machines',1080,756,1296],['landing',2160,324,1296],
  ['island',2592,216,1242],['secret-bank',2916,216,1296],
  ['rise',3132,324,1242],['final-yard',3456,432,1242],
  ['exit',4212,324,1242],['flag',4536,324,1188],
].map(([id,x,width,y])=>({id,x,width,y}));
export const DECKS=[
  {id:'upper-west',x:1674,y:1134,width:162},
  {id:'upper-east',x:2160,y:1134,width:270},
  {id:'canopy',x:2916,y:1080,width:216},
  {id:'lookout',x:3186,y:1026,width:162},
];
export const LADDERS=[{x:1755,top:1134,bottom:1296},{x:2268,top:1134,bottom:1296},{x:3024,top:1080,bottom:1296}];
export const STATIONS=[
  {id:'twins',x:1404,y:1296,bridge:{id:'twins-bridge',x:1836,y:1296,width:324},title:'Dua Mesin',targets:'9 & 25'},
  {id:'final',x:3510,y:1242,bridge:{id:'final-bridge',x:3888,y:1242,width:324},title:'Jambatan Akhir',targets:'19 & 49'},
];
export const CHECKPOINTS=[
  {id:'entry',x:108,feet:1296},
  {id:'machines',x:1188,feet:1296},
  {id:'beyond-twins',x:2214,feet:1296,requires:'twins'},
  {id:'secret-bank',x:2970,feet:1296,requires:'twins'},
  {id:'final-yard',x:3402,feet:1242,requires:'twins'},
  {id:'exit',x:4266,feet:1242,requires:'final'},
];
export const COINS=[
  [324,1260],[756,1206],[918,1206],[1242,1260],
  [1728,1098],[2052,1098],[2376,1098],
  [2430,1260],[2700,1206],[3024,1044],[3240,990],
  [3294,1206],[4320,1206],[4590,1152],[4752,1152],
].map(([x,y],i)=>({id:`l2-coin-${i+1}`,x,y}));
export const SECRETS=[
  {id:'twin-observation',x:2376,feet:1134,text:'Urutan dibaca dari dalam: f(g(x)) bermula dengan g. Pada x = 2, 9 ≠ 25.'},
  {id:'canopy-observation',x:3294,feet:1026,text:'Tidak semestinya berbeza untuk setiap input: pada x = 0, f(g(0)) = g(f(0)) = 1. Satu persamaan tidak membuktikan dua fungsi sama.'},
];
export const WATER=[{x:972,width:108},{x:1836,width:324},{x:2484,width:108},{x:2808,width:108},{x:3888,width:324}];
export const WATER_Y=1512;
export const DEFINITION={WORLD,AB_TERRAIN,DECKS,LADDERS};
