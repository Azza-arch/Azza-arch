export const WORLD={width:5616,height:2200,floor:2106,gravity:1400};
export const SPAWN={x:108,feet:1728};
export const GOAL={x:5292,feet:1566};
// Five readable spaces: stream approach, stepped ruins, machine yard,
// waterfall crossing, and the raised gate court.
export const AB_TERRAIN=[
 ['stream-approach-west',0,378,1728],['stream-approach-east',486,162,1728],['ruin-entry',702,594,1674],
 ['ruin-courtyard',1350,540,1728],['upper-ruins',1944,540,1674],
 ['machine-yard',2538,702,1620],['waterfall-bank',3456,594,1674],
 ['gate-approach',4104,594,1620],['gate-court',4752,864,1566],
].map(([id,x,width,y])=>({id,x,width,y,style:['ruin-entry','ruin-courtyard','upper-ruins'].includes(id)?'stone':undefined}));
export const DECKS=[
 {id:'creek-crossing',x:378,y:1728,width:108},
 {id:'root-balcony',x:756,y:1512,width:270},
 {id:'broken-gallery',x:1080,y:1404,width:486},
 {id:'upper-gallery',x:1566,y:1296,width:324},
 {id:'lookout',x:1836,y:1188,width:270},
 {id:'gallery-step',x:1566,y:1404,width:324},
 {id:'gate-arch-walk',x:4482,y:1242,width:270},
];
export const LADDERS=[
 {x:918,top:1512,bottom:1674},
 {x:1188,top:1404,bottom:1674},
 {x:1674,top:1296,bottom:1404},
 {x:1890,top:1188,bottom:1404},
 {x:4590,top:1242,bottom:1620},
];
export const BRIDGE={id:'seal-crossing',x:3240,y:1620,width:216};
export const CHECKPOINTS=[
 {id:'entry',x:108,feet:1728},
 {id:'ruins',x:1998,feet:1674},
 {id:'machine',x:2592,feet:1620},
 {id:'far-bank',x:3564,feet:1674,requires:'seals'},
 {id:'gate-court',x:4860,feet:1566,requires:'seals'},
];
export const COINS=[
 [324,1692],[756,1638],[1026,1476],[1188,1368],[1512,1368],
 [1674,1260],[1890,1152],[2106,1638],[2430,1584],[2700,1584],
 [3024,1368],[3186,1584],[3402,1584],[3672,1638],[3996,1584],
 [4266,1584],[4482,1206],[4806,1530],[5076,1530],[5400,1530],
].map(([x,y],i)=>({id:`l3-coin-${i+1}`,x,y}));
export const SECRETS=[
 {id:'ruin-inscription',x:945,feet:1512,text:'Runtuhan ini dibina bertingkat: lihat laluan atas dari halaman, kemudian cari tangga pada dinding yang masih utuh.'},
 {id:'domain-tablet',x:3024,feet:1620,text:'Domain f ialah {0,1,2,3,4,5,6}. Imejnya {3,5,7,9,11,13,15}; setiap input berbeza menghasilkan output berbeza.'},
 {id:'inverse-tablet',x:4590,feet:1242,text:'Songsangan memulangkan input: f⁻¹(y)=(y−3)/2 untuk y dalam imej f. f⁻¹ bukan 1/f; nilai di luar imej tiada input songsang dalam domain ini.'},
];
export const WATER=[{x:378,width:108},{x:3240,width:216}];
export const WATER_Y=1692;
// Decorative spillway beside the bridge; it has no collider or gameplay effect.
export const WATERFALL={x:3240,width:54,top:1512,bottom:1674};
export const DEFINITION={WORLD,AB_TERRAIN,DECKS,LADDERS,parallaxShift:216};
