// Live V10 geometry, materialised from candidate-world.json. Physics remains V9's.
import {MOTION,PUZZLES as ORIGINAL_PUZZLES,SECRETS as ORIGINAL_SECRETS} from '../level.js';
export {MOTION};
export const WORLD={width:8400,height:1600,gravity:1400};
export const SPAWN={x:80,feet:1296};
export const FIRST_GAP={x:648,width:108};
export const BUILD_STAGE = 5;
export const BATCH_END = 8400;
export const GOAL = {
  "x": 8316,
  "feet": 1296
};
export const SURFACES = [
  {
    "id": "A0",
    "x": 0,
    "y": 1296,
    "width": 648,
    "kind": "solid",
    "zone": "A",
    "gate": null
  },
  {
    "id": "A1",
    "x": 756,
    "y": 1296,
    "width": 270,
    "kind": "solid",
    "zone": "A",
    "gate": null
  },
  {
    "id": "A2",
    "x": 1026,
    "y": 1242,
    "width": 108,
    "kind": "solid",
    "zone": "A",
    "gate": null
  },
  {
    "id": "A3",
    "x": 1134,
    "y": 1188,
    "width": 108,
    "kind": "solid",
    "zone": "A",
    "gate": null
  },
  {
    "id": "A4",
    "x": 1242,
    "y": 1134,
    "width": 162,
    "kind": "solid",
    "zone": "A",
    "gate": null
  },
  {
    "id": "A-ledge",
    "x": 414,
    "y": 1176,
    "width": 162,
    "kind": "optional",
    "zone": "A",
    "gate": null
  },
  {
    "id": "B0",
    "x": 1404,
    "y": 1134,
    "width": 270,
    "kind": "solid",
    "zone": "B",
    "gate": null
  },
  {
    "id": "B1",
    "x": 1674,
    "y": 1080,
    "width": 108,
    "kind": "solid",
    "zone": "B",
    "gate": null
  },
  {
    "id": "B2",
    "x": 1782,
    "y": 1080,
    "width": 270,
    "kind": "solid",
    "zone": "B",
    "gate": null
  },
  {
    "id": "G1",
    "x": 2052,
    "y": 1080,
    "width": 324,
    "kind": "gate",
    "zone": "B",
    "gate": "gear"
  },
  {
    "id": "B3",
    "x": 2376,
    "y": 1080,
    "width": 216,
    "kind": "solid",
    "zone": "B",
    "gate": null
  },
  {
    "id": "B4",
    "x": 2592,
    "y": 1026,
    "width": 108,
    "kind": "solid",
    "zone": "B",
    "gate": null
  },
  {
    "id": "B5",
    "x": 2700,
    "y": 972,
    "width": 216,
    "kind": "solid",
    "zone": "B",
    "gate": null
  },
  {
    "id": "C0",
    "x": 1512,
    "y": 810,
    "width": 432,
    "kind": "optional",
    "zone": "C",
    "gate": null
  },
  {
    "id": "D0",
    "x": 2916,
    "y": 972,
    "width": 432,
    "kind": "solid",
    "zone": "D",
    "gate": null
  },
  {
    "id": "G2",
    "x": 3348,
    "y": 972,
    "width": 324,
    "kind": "gate",
    "zone": "D",
    "gate": "block"
  },
  {
    "id": "D1",
    "x": 3672,
    "y": 972,
    "width": 432,
    "kind": "solid",
    "zone": "D",
    "gate": null
  },
  {
    "id": "D-upper",
    "x": 3780,
    "y": 756,
    "width": 270,
    "kind": "optional",
    "zone": "D",
    "gate": null
  },
  {
    "id": "E0",
    "x": 4104,
    "y": 972,
    "width": 216,
    "kind": "solid",
    "zone": "E",
    "gate": null
  },
  {
    "id": "E1",
    "x": 4104,
    "y": 756,
    "width": 324,
    "kind": "oneway",
    "zone": "E",
    "gate": null
  },
  {
    "id": "E-recovery",
    "x": 4320,
    "y": 1080,
    "width": 594,
    "kind": "solid",
    "zone": "E",
    "gate": null
  },
  {
    "id": "E2",
    "x": 4536,
    "y": 810,
    "width": 270,
    "kind": "oneway",
    "zone": "E",
    "gate": null
  },
  {
    "id": "E3",
    "x": 4590,
    "y": 648,
    "width": 324,
    "kind": "oneway",
    "zone": "E",
    "gate": null
  },
  {
    "id": "G3",
    "x": 4914,
    "y": 648,
    "width": 324,
    "kind": "gate",
    "zone": "E",
    "gate": "pipe"
  },
  {
    "id": "E4",
    "x": 5238,
    "y": 648,
    "width": 432,
    "kind": "oneway",
    "zone": "E",
    "gate": null
  },
  {
    "id": "F0",
    "x": 5724,
    "y": 702,
    "width": 216,
    "kind": "solid",
    "zone": "F",
    "gate": null
  },
  {
    "id": "F1",
    "x": 5940,
    "y": 756,
    "width": 108,
    "kind": "solid",
    "zone": "F",
    "gate": null
  },
  {
    "id": "F2",
    "x": 6048,
    "y": 810,
    "width": 108,
    "kind": "solid",
    "zone": "F",
    "gate": null
  },
  {
    "id": "F3",
    "x": 6156,
    "y": 864,
    "width": 108,
    "kind": "solid",
    "zone": "F",
    "gate": null
  },
  {
    "id": "F4",
    "x": 6264,
    "y": 918,
    "width": 216,
    "kind": "solid",
    "zone": "F",
    "gate": null
  },
  {
    "id": "F-roof",
    "x": 6480,
    "y": 918,
    "width": 270,
    "kind": "oneway",
    "zone": "F",
    "gate": null
  },
  {
    "id": "F-cave",
    "x": 6480,
    "y": 1242,
    "width": 270,
    "kind": "solid",
    "zone": "F",
    "gate": null
  },
  {
    "id": "F5",
    "x": 6750,
    "y": 972,
    "width": 108,
    "kind": "solid",
    "zone": "F",
    "gate": null
  },
  {
    "id": "F6",
    "x": 6858,
    "y": 1026,
    "width": 108,
    "kind": "solid",
    "zone": "F",
    "gate": null
  },
  {
    "id": "F7",
    "x": 6966,
    "y": 1080,
    "width": 108,
    "kind": "solid",
    "zone": "F",
    "gate": null
  },
  {
    "id": "F8",
    "x": 7074,
    "y": 1134,
    "width": 108,
    "kind": "solid",
    "zone": "F",
    "gate": null
  },
  {
    "id": "F9",
    "x": 7182,
    "y": 1188,
    "width": 108,
    "kind": "solid",
    "zone": "F",
    "gate": null
  },
  {
    "id": "G0",
    "x": 7290,
    "y": 1242,
    "width": 216,
    "kind": "solid",
    "zone": "G",
    "gate": null
  },
  {
    "id": "G-bank",
    "x": 7506,
    "y": 1296,
    "width": 216,
    "kind": "solid",
    "zone": "G",
    "gate": null
  },
  {
    "id": "G4",
    "x": 7722,
    "y": 1296,
    "width": 378,
    "kind": "gate",
    "zone": "G",
    "gate": "final"
  },
  {
    "id": "G-exit",
    "x": 8100,
    "y": 1296,
    "width": 300,
    "kind": "solid",
    "zone": "G",
    "gate": null
  }
];
export const LADDERS = [
  {
    "id": "LC-in",
    "x": 1566,
    "top": 810,
    "bottom": 1134,
    "upper": "C0",
    "lower": "B0",
    "optional": true
  },
  {
    "id": "LC-out",
    "x": 1836,
    "top": 810,
    "bottom": 1080,
    "upper": "C0",
    "lower": "B2",
    "optional": true
  },
  {
    "id": "LD-note",
    "x": 3834,
    "top": 756,
    "bottom": 972,
    "upper": "D-upper",
    "lower": "D1",
    "optional": true
  },
  {
    "id": "LE-main",
    "x": 4212,
    "top": 756,
    "bottom": 972,
    "upper": "E1",
    "lower": "E0",
    "optional": false
  },
  {
    "id": "LE-recover",
    "x": 4374,
    "top": 756,
    "bottom": 1080,
    "upper": "E1",
    "lower": "E-recovery",
    "optional": false
  },
  {
    "id": "LE-pipe",
    "x": 4698,
    "top": 648,
    "bottom": 810,
    "upper": "E3",
    "lower": "E2",
    "optional": false
  },
  {
    "id": "LF-cave",
    "x": 6588,
    "top": 918,
    "bottom": 1242,
    "upper": "F-roof",
    "lower": "F-cave",
    "optional": true
  }
];
export const CHECKPOINTS = [
  {
    "id": "cp-a",
    "x": 1080,
    "feet": 1242,
    "optional": false,
    "requires": []
  },
  {
    "id": "cp-b",
    "x": 1900,
    "feet": 1080,
    "optional": false,
    "requires": []
  },
  {
    "id": "cp-c",
    "x": 1620,
    "feet": 810,
    "optional": true,
    "requires": []
  },
  {
    "id": "cp-b-exit",
    "x": 2790,
    "feet": 972,
    "requires": [
      "gear"
    ]
  },
  {
    "id": "cp-d",
    "x": 3024,
    "feet": 972,
    "optional": false,
    "requires": [
      "gear"
    ]
  },
  {
    "id": "cp-e",
    "x": 4752,
    "feet": 648,
    "optional": false,
    "requires": [
      "gear",
      "block"
    ]
  },
  {
    "id": "cp-f",
    "x": 5832,
    "feet": 702,
    "optional": false,
    "requires": [
      "gear",
      "block",
      "pipe"
    ]
  },
  {
    "id": "cp-g",
    "x": 7560,
    "feet": 1296,
    "optional": false,
    "requires": [
      "gear",
      "block",
      "pipe"
    ]
  }
];
export const GATES = [
  {
    "id": "gear",
    "x": 2052,
    "y": 1080,
    "width": 324
  },
  {
    "id": "block",
    "x": 3348,
    "y": 972,
    "width": 324
  },
  {
    "id": "pipe",
    "x": 4914,
    "y": 648,
    "width": 324
  },
  {
    "id": "final",
    "x": 7722,
    "y": 1296,
    "width": 378
  }
];
export const TERMINALS = [
  {
    "id": "probe",
    "kind": "probe",
    "x": 1480,
    "feet": 1134
  },
  {
    "id": "p1",
    "kind": "gear",
    "gate": "gear",
    "x": 1960,
    "feet": 1080
  },
  {
    "id": "cafe",
    "kind": "mapping",
    "x": 1740,
    "feet": 810
  },
  {
    "id": "p2",
    "kind": "block",
    "gate": "block",
    "x": 3186,
    "feet": 972
  },
  {
    "id": "primer",
    "kind": "primer",
    "x": 3942,
    "feet": 972
  },
  {
    "id": "pipe",
    "kind": "pipe",
    "gate": "pipe",
    "x": 4806,
    "feet": 648
  },
  {
    "id": "inverse",
    "kind": "inverse",
    "x": 6650,
    "feet": 1242
  },
  {
    "id": "p3",
    "kind": "final",
    "gate": "final",
    "x": 7632,
    "feet": 1296
  }
];
export const ZONES = [
  {
    "id": "taman-perumahan",
    "name": "A · Taman Pembelajaran",
    "xStart": 0,
    "xEnd": 1404
  },
  {
    "id": "lorong-pekan",
    "name": "B · Kincir Fungsi",
    "xStart": 1404,
    "xEnd": 2916
  },
  {
    "id": "cafe-atas-angin",
    "name": "C · Café Atas Angin (pilihan)",
    "xStart": 1512,
    "xEnd": 1944,
    "yMax": 870
  },
  {
    "id": "bengkel-fungsi",
    "name": "D · Bengkel Fungsi",
    "xStart": 2916,
    "xEnd": 4104
  },
  {
    "id": "deretan-bumbung",
    "name": "E · Bumbung Air",
    "xStart": 4104,
    "xEnd": 5670
  },
  {
    "id": "bukit-tanjung-gua",
    "name": "F · Bukit & Arkib Gua",
    "xStart": 5670,
    "xEnd": 7290
  },
  {
    "id": "jambatan-destinasi",
    "name": "G · Sungai & Destinasi",
    "xStart": 7290,
    "xEnd": 8400
  }
];
export const COLLECTIBLES = [
  {
    "id": "coin-a",
    "x": 500,
    "y": 1112
  },
  {
    "id": "coin-b",
    "x": 2520,
    "y": 1020
  },
  {
    "id": "coin-c",
    "x": 1880,
    "y": 750
  },
  {
    "id": "coin-d-note",
    "x": 3996,
    "y": 696
  },
  {
    "id": "coin-e1",
    "x": 4536,
    "y": 750
  },
  {
    "id": "coin-e2",
    "x": 5508,
    "y": 588
  },
  {
    "id": "coin-cave",
    "x": 6690,
    "y": 1182
  },
  {
    "id": "coin-g",
    "x": 8210,
    "y": 1236
  }
];
export const AB_TERRAIN=SURFACES.filter(s=>s.kind==='solid');
export const DECKS=SURFACES.filter(s=>s.kind!=='solid'&&s.kind!=='gate'&&s.id!=='A-ledge');
export const GROUND_RANGES=AB_TERRAIN.map(s=>[s.x,s.x+s.width]);
export const SECRETS=[{...ORIGINAL_SECRETS[0],x:1900,feet:810,radius:48},
 {...ORIGINAL_SECRETS[1],x:3996,feet:756,radius:40},
 ...(BUILD_STAGE>=4?[{...ORIGINAL_SECRETS[2],x:6700,feet:1242,radius:36}]:[])];
export const CRATE_PUZZLE={crate:{id:'crate-1',x:270,feet:1296},floorSwitch:{id:'switch-1',x:450,feet:1296,radius:40},platform:{id:'A-ledge',x:414,y:1176,width:162}};
export const BASELINE_QUESTIONS=ORIGINAL_PUZZLES;
export const PUZZLES=[{...ORIGINAL_PUZZLES[0],gate:'gear'},{...ORIGINAL_PUZZLES[1],gate:'block'},
 ...(BUILD_STAGE>=3?[{id:'pipe',gate:'pipe',formula:'g(f(3))',hints:['Lakukan f dahulu, kemudian g.','f(3)=7, kemudian g(7)=3(7)−2=19.']}]:[]),
 ...(BUILD_STAGE>=5?[{...ORIGINAL_PUZZLES[2],gate:'final'}]:[])];
