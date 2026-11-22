// V11 Phase 4: continuous Level 1, rooms R01-R16. Geometry differs intentionally from V10; no old coordinates migrate.
import {MOTION,PUZZLES as ORIGINAL_PUZZLES} from '../level.js';
export {MOTION};
export const WORLD={width:8400,height:1600,gravity:1400};
export const BUILD_STAGE=4, BATCH_END=8400;
export const SPAWN={x:90,feet:1296},GOAL={x:8316,feet:972};
export const FIRST_GAP={x:1080,width:108};
export const ROOMS=[
 {id:'R01',zone:'A',from:0,to:432,name:'Langkah pertama'},
 {id:'R02',zone:'A',from:432,to:972,name:'Kotak dan plet',optional:true},
 {id:'R03',zone:'A',from:972,to:1458,name:'Jurang dan checkpoint'},
 {id:'R04',zone:'B',from:1458,to:1944,name:'Mendaki dan mencuba input'},
 {id:'R05',zone:'B',from:1944,to:2484,name:'Pengangkat fungsi'},
 {id:'R06',zone:'C',from:1458,to:1944,name:'Bonus atas',optional:true},
 {id:'R07',zone:'B',from:2484,to:3024,name:'Menuju blok nombor'}];
ROOMS.push(
 {id:'R08',zone:'D',from:3024,to:3564,name:'Blok nombor'},
 {id:'R09',zone:'D',from:3100,to:3456,name:'Laluan servis',optional:true},
 {id:'R10',zone:'D',from:3834,to:4104,name:'Susunan fungsi'},
 {id:'R11',zone:'E',from:4104,to:4860,name:'Laluan paip air'},
 {id:'R12',zone:'E',from:4860,to:5650,name:'Komposisi dan takungan'},
 {id:'R13',zone:'F',from:5650,to:7250,name:'Bukit dan pandangan sungai'},
 {id:'R14',zone:'F',from:6136,to:6568,name:'Gua songsang',optional:true},
 {id:'R15',zone:'G',from:7250,to:8046,name:'Sungai dan dua latch'},
 {id:'R16',zone:'G',from:8046,to:8400,name:'Pintu destinasi'});
export const SURFACES=[
 {id:'A-start',x:0,y:1296,width:270,kind:'solid',room:'R01'},
 {id:'A-step',x:270,y:1242,width:162,kind:'solid',room:'R01'},
 {id:'A-crate',x:432,y:1242,width:648,kind:'solid',room:'R02'},
 {id:'A-landing',x:1188,y:1242,width:270,kind:'solid',room:'R03'},
 {id:'B-low',x:1458,y:1188,width:162,kind:'solid',room:'R04'},
 {id:'B-middle',x:1620,y:1134,width:216,kind:'solid',room:'R04'},
 {id:'B-control',x:1836,y:1080,width:324,kind:'solid',room:'R05'},
 {id:'B-lift',x:2160,y:1080,width:324,kind:'gate',room:'R05'},
 {id:'B-bank',x:2484,y:1080,width:162,kind:'solid',room:'R07'},
 {id:'B-terrace',x:2646,y:1026,width:162,kind:'solid',room:'R07'},
 {id:'B-overlook',x:2808,y:972,width:216,kind:'solid',room:'R07'},
 {id:'D-approach',x:3024,y:972,width:540,kind:'solid',room:'R08'},
 {id:'D-crossing',x:3564,y:972,width:270,kind:'gate',room:'R08'},
 {id:'D-landing',x:3834,y:972,width:270,kind:'solid',room:'R10'},
 {id:'D-rack',x:3078,y:918,width:216,kind:'oneWay',room:'R08'},
 {id:'D-service',x:3294,y:738,width:216,kind:'oneWay',room:'R09',optional:true},
 {id:'E-entry',x:4104,y:972,width:162,kind:'solid',room:'R11'},
 {id:'E-step',x:4266,y:918,width:108,kind:'solid',room:'R11'},
 {id:'E-source-terrace',x:4374,y:864,width:216,kind:'solid',room:'R11'},
 {id:'E-recovery',x:4590,y:1188,width:270,kind:'solid',room:'R11'},
 {id:'E-east-bank',x:4860,y:972,width:162,kind:'solid',room:'R12'},
 {id:'E-pool-floor',x:5022,y:1026,width:162,kind:'solid',room:'R12'},
 {id:'E-control-bank',x:5184,y:972,width:108,kind:'solid',room:'R12'},
 {id:'E-lower-crossing',x:5292,y:1296,width:216,kind:'solid',room:'R12'},
 {id:'E-far-bank',x:5508,y:972,width:142,kind:'solid',room:'R12'},
 {id:'E-cave-walkway',x:4590,y:972,width:270,kind:'oneWay',room:'R11'},
 {id:'C-route',x:1458,y:864,width:486,kind:'oneWay',room:'R06'},
 {id:'A-ledge',x:774,y:1122,width:162,kind:'optional',room:'R02'},
 {id:'F-entry',x:5650,y:972,width:162,kind:'solid',room:'R13'},
 {id:'F-step1',x:5812,y:918,width:162,kind:'solid',room:'R13'},
 {id:'F-step2',x:5974,y:864,width:162,kind:'solid',room:'R13'},
 {id:'F-cave-floor',x:6136,y:1134,width:432,kind:'solid',room:'R14',optional:true},
 {id:'F-cave-east',x:6568,y:972,width:162,kind:'solid',room:'R13'},
 {id:'F-down1',x:6730,y:1026,width:162,kind:'solid',room:'R13'},
 {id:'F-down2',x:6892,y:1080,width:216,kind:'solid',room:'R13'},
 {id:'F-river-view',x:7108,y:1026,width:142,kind:'solid',room:'R13'},
 {id:'F-cave-roof',x:6136,y:918,width:432,kind:'oneWay',room:'R14',optional:true},
 {id:'G-west-bank',x:7250,y:972,width:256,kind:'solid',room:'R15'},
 {id:'G-river-crossing',x:7506,y:972,width:324,kind:'gate',room:'R15'},
 {id:'G-far-bank',x:7830,y:972,width:216,kind:'solid',room:'R15'},
 {id:'G-goal-slope',x:8046,y:1026,width:216,kind:'solid',room:'R16'},
 {id:'G-goal-shelf',x:8262,y:972,width:138,kind:'solid',room:'R16'}];
export const AB_TERRAIN=SURFACES.filter(s=>s.kind==='solid');
export const DECKS=SURFACES.filter(s=>s.kind==='oneWay');
export const GROUND_RANGES=AB_TERRAIN.map(s=>[s.x,s.x+s.width]);
export const LADDERS=[{id:'C-entry',x:1512,top:864,bottom:1188},{id:'C-return',x:1890,top:864,bottom:1080},{id:'D-service',x:3330,top:738,bottom:972},{id:'E-cave-ladder',x:4806,top:972,bottom:1188},{id:'E-recover-left',x:5292,top:972,bottom:1296},{id:'E-recover-right',x:5508,top:972,bottom:1296},{id:'F-cave-entry',x:6226,top:918,bottom:1134},{id:'F-cave-return',x:6478,top:918,bottom:1134}];
export const GATES=[{id:'lift',x:2160,y:1080,width:324,parkedY:1296},{id:'number-span',x:3564,y:972,width:270,parkedY:1188},{id:'water-crossing',x:5292,y:972,width:216,parkedY:1188},{id:'river-crossing',x:7506,y:972,width:324,parkedY:1242}];
export const TERMINALS=[{id:'probe',kind:'probe',x:1692,feet:1134},{id:'lift',kind:'lift',gate:'lift',x:2070,feet:1080},{id:'mapping',kind:'mapping',x:1692,feet:864},{id:'number',kind:'number',gate:'number-span',x:3420,feet:972},{id:'composition',kind:'composition',x:3960,feet:972},{id:'water-composition',kind:'water-composition',gate:'water-crossing',x:5238,feet:972},{id:'inverse-f',kind:'inverse-f',x:6400,feet:1134},{id:'river-final',kind:'river-final',gate:'river-crossing',x:7390,feet:972}];
export const CHECKPOINTS=[{id:'a-safe',x:378,feet:1242},{id:'a-gap',x:1296,feet:1242},{id:'b-lift',x:2000,feet:1080},{id:'c-bonus',x:1566,feet:864},{id:'b-review',x:2916,feet:972,requires:['lift']},{id:'d-machine',x:3294,feet:972},{id:'d-crossing',x:3915,feet:972,requires:['number-span']},{id:'e-entry',x:4122,feet:972},{id:'e-crossing',x:5598,feet:972,requires:['water-crossing']},{id:'f-overlook',x:7180,feet:1026},{id:'g-river',x:7296,feet:972,requires:['water-crossing']},{id:'g-river-east',x:7890,feet:972,requires:['river-input','river-composition','river-crossing']},{id:'g-goal',x:8170,feet:1026,requires:['river-input','river-composition','river-crossing']}];
export const COLLECTIBLES=[{id:'a-ledge',x:855,y:1062},{id:'c-entry',x:1566,y:804},{id:'c-return',x:1836,y:804},{id:'b-return',x:2556,y:1020},{id:'d-service',x:3402,y:696},{id:'e-waterwalk',x:4644,y:1158},{id:'f-ridge',x:5900,y:816},{id:'f-cave-gem',x:6360,y:1080,kind:'gem',requiresSecret:'f-inverse'},{id:'g-farbank',x:7950,y:918}];
export const CRATE_PUZZLE={crate:{id:'crate-1',x:540,feet:1242},floorSwitch:{id:'plate-1',x:810,feet:1242,radius:40},platform:SURFACES.find(s=>s.id==='A-ledge')};
export const SECRETS=[{id:'bonus-mapping',x:1782,feet:864,radius:36,name:'Permata Pemetaan',description:'Terokai empat pasangan input dan output di laluan atas.',foundText:'Permata pemetaan diperoleh!'},{id:'f-inverse',x:6400,feet:1134,radius:72,puzzleTerminal:true,name:'Gua Songsang',description:'Daripada output 7, songsangkan f untuk mencari input 3.',foundText:'Hubungan songsang ditemui!'}];
export const BASELINE_QUESTIONS=ORIGINAL_PUZZLES;
const numberPuzzle={id:'number',gate:'number-span',check(raw){const value=Number(raw);return {valid:Number.isInteger(value)&&value>=2&&value<=4,correct:Number.isInteger(value)&&value===4};}};
const waterComposition={id:'water-crossing',gate:'water-crossing',check(order){const valid=order==='fg'||order==='gf';return {valid,correct:valid&&order==='fg',output:order==='fg'?19:order==='gf'?15:null};}};
const riverInput={id:'river-input',gate:'river-crossing',check(raw){const x=Number(raw);const valid=Number.isInteger(x)&&x>=0&&x<=9;return {valid,correct:valid&&4*x-3===17,output:valid?4*x-3:null};}};
const riverComposition={id:'river-composition',gate:'river-crossing',check(order){const valid=order==='fg'||order==='gf';return {valid,correct:valid&&order==='fg',output:order==='fg'?13:order==='gf'?9:null};}};
export const PUZZLES=[{...ORIGINAL_PUZZLES[0],gate:'lift'},numberPuzzle,waterComposition,riverInput,riverComposition];
export const ZONES=[{name:'A - Taman Permulaan',xStart:0,xEnd:1458},{name:'B - Bukit & Pengangkat',xStart:1458,xEnd:3024},{name:'C - Bonus Atas',xStart:1458,xEnd:1944,yMax:900},{name:'D - Blok Nombor',xStart:3024,xEnd:4104},{name:'E - Laluan Paip Air',xStart:4104,xEnd:5650},{name:'F - Bukit dan Gua',xStart:5650,xEnd:7250},{name:'G - Sungai dan Destinasi',xStart:7250,xEnd:8400}];
