// DENAI map redesign — proposed geometry (DESIGN DATA ONLY, not loaded by the game).
// Units: tiles (1 tile = 54 world units). x = tile column, y/row = surface row (world y = row × 54).
// terrain:  [x0, x1, topRow]            solid ground to the level floor
// slab:     [x0, x1, topRow, bottomRow] finite rock / stair block
// cave:     [x0, x1, topRow, bottomRow] hollow carved inside terrain (drawn dark)
// deck:     [x0, x1, row]               one-way platform
// gate:     [x0, x1, row, label]        puzzle-built bridge (no collision until solved)
// ladder:   [x, topRow, bottomRow]
// water:    [x0, x1, surfaceRow]
// mech / cp / secret / mark: [x, row, label]
// main: route nodes [x, row, how] ; how = walk | jump | drop | ladder | gate | start | goal
// optional: list of polylines [[x,row], ...]
// status per item: 'keep' (existing, validated) | 'new' | 'move' | 'change'
export const T = 54;

// Annotation fields (added in the V2 refinement):
// math:  [x, row, label]   mechanism that needs mathematical reasoning
// inter: [x, row, label]   non-mathematical interaction (push, lever, walk, drop)
// opt:   { id, pts, why }  optional route with its real purpose; every one returns to the main route
// loops: { id, pts, why }  return loop (comes back by a different way)
// risk:  [x, row, label]   where a player may get stuck or misread the route
export const L11 = {
  id: 'w1-l1', title: 'Level 1-1 · Jejak Taman Fungsi (cadangan V2)', width: 110, rowTop: 15, rowBottom: 30,
  terrain: [[0, 15, 24, 'keep'], [15, 17, 23, 'change'], [17, 19, 22, 'change'], [19, 20, 23, 'change'], [20, 28, 26, 'keep'], [28, 30, 25, 'keep'], [30, 33, 24, 'keep'],
    [33, 47, 23, 'keep'], [53, 58, 23, 'keep'], [60, 63, 24, 'keep'], [69, 72, 22, 'keep'], [65, 68, 26, 'new'],
    [78, 85, 24, 'keep'], [85, 88, 25, 'keep'], [88, 96, 24, 'keep'], [96, 105, 23, 'keep'], [105, 108, 22, 'keep'], [108, 110, 23, 'keep']],
  slab: [[20, 22, 23, 24, 'keep'], [23, 32, 20, 23, 'new'], [36, 38, 22, 23, 'new']],
  cave: [[20, 22, 24, 26, 'keep']],
  deck: [[0, 3, 22, 'new'], [8, 11, 22, 'keep'], [64.67, 67, 23, 'keep'], [73.67, 76.33, 23, 'keep'],
    [79, 85, 21, 'keep'], [84.5, 87, 20, 'keep'], [81.67, 84, 19, 'keep'], [84, 90, 19, 'new'], [90, 93, 19, 'new']],
  gate: [[47, 53, 23, 'Jambatan 7 papan'], [58, 65, 27, 'Jeti 11 papan (pilihan)']],
  ladder: [[22.5, 20, 26, 'move'], [81, 21, 24, 'keep'], [68.5, 22, 26, 'new'], [58.5, 23, 27, 'new']],
  water: [[47, 53, 28], [58, 78, 28]],
  math: [[44, 23, '∑ f(x)=2x+1 → 7 papan'], [34.5, 23, '∑ g(b)=3b−1 (pilihan)']],
  inter: [[4, 24, 'Tolak kotak'], [7.5, 24, 'Plat'], [39.8, 23, 'Probe'], [46, 21, 'Kren: angkat ikatan papan'], [1.5, 22, 'Papan nota'], [87, 19, 'Jambatan tali']],
  cp: [[2.2, 24], [31.5, 24], [54.4, 23], [69.6, 22], [80.2, 24], [97, 23]],
  secret: [[20.8, 26, 'Jejak di Akar'], [82.3, 19, 'Nota Fungsi'], [66.5, 26, 'Peti Jeti (baharu)']],
  mark: [[2, 20.5, 'Rumah kampung'], [18, 20.5, 'Bukit taman'], [27.5, 18.5, 'Gerbang batu akar'], [45.5, 18.8, 'Kren'], [82.5, 16.5, 'Pokok Tinjau'], [106.5, 19.5, 'Gerbang Taman'], [109, 21.5, '→ Lembah']],
  main: [[1, 24, 'start'], [15, 24, 'walk'], [15, 23, 'jump'], [17, 23, 'walk'], [17, 22, 'jump'], [19, 22, 'walk'], [19, 23, 'drop'], [22, 23, 'walk'], [22, 26, 'drop'], [28, 26, 'walk'], [28, 25, 'jump'], [30, 24, 'jump'], [33, 23, 'jump'],
    [36, 23, 'walk'], [36, 22, 'jump'], [38, 22, 'walk'], [38, 23, 'drop'], [47, 23, 'walk'], [53, 23, 'gate'], [58, 23, 'walk'], [60, 24, 'drop'], [63, 24, 'walk'], [64.67, 23, 'jump'], [67, 23, 'walk'], [69, 22, 'jump'], [72, 22, 'walk'], [73.67, 23, 'drop'], [76.33, 23, 'walk'], [78, 24, 'drop'],
    [85, 24, 'walk'], [85, 25, 'drop'], [88, 24, 'jump'], [96, 24, 'walk'], [96, 23, 'jump'], [105, 23, 'walk'], [105, 22, 'jump'], [106.5, 22, 'goal']],
  opt: [
    { id: 'P1', pts: [[1, 24], [1, 22], [3, 22], [3, 24]], why: 'Anjung rumah: papan nota permulaan (kawalan) + 1 syiling; turun semula ke tanah' },
    { id: 'P2', pts: [[7, 24], [8, 22], [11, 22], [11, 24]], why: 'Tebing kotak: 3 syiling ganjaran teka-teki kotak; terjun semula ke padang' },
    { id: 'P3', pts: [[22.5, 26], [22.5, 20], [32, 20], [33, 23]], why: 'Atas gerbang batu: 3 syiling kanopi + pandangan awal kren dan jurang; mendarat di laman binaan' },
    { id: 'P4', pts: [[58.5, 23], [58.5, 27], [65, 27], [65, 26], [68.5, 26], [68.5, 22]], why: 'Jeti → pulau: Peti Jeti (rahsia) + pintasan 2 lompatan; perlu kilang papan; naik tangga ke tebing rehat' },
    { id: 'P5', pts: [[81, 24], [81, 21], [82, 19], [93, 19], [93, 24]], why: 'Rumah pokok → jambatan tali: Nota Fungsi + 3 syiling; turun di hutan timur' }],
  loops: [
    { id: 'G1', pts: [[33, 23], [30, 24], [28, 26], [22.5, 26], [22.5, 20], [32, 20], [33, 23]], why: 'Gelung akar: dari laman binaan balik melalui terowong, naik tangga, lintas atas gerbang batu' },
    { id: 'G2', pts: [[58, 23], [58.5, 27], [65, 27], [68.5, 26], [68.5, 22], [64.67, 23], [60, 24], [58, 23]], why: 'Gelung jeti: tebing jauh → jeti → pulau → tebing rehat → lompat balik ke tebing jauh' },
    { id: 'G3', pts: [[81, 24], [81, 21], [84, 19], [93, 19], [93, 24], [85, 24], [81, 24]], why: 'Gelung rumah pokok: naik, lintas jambatan tali, turun, jalan balik melalui lekuk akar' }],
  risk: [[5.5, 21.5, 'R1 kotak tersekat → kekunci C (sedia ada)'], [22, 27.5, 'R2 jatuh ke terowong: tangga x22.5 mesti jelas'], [50, 21, 'R3 lompat jurang sebelum jambatan → respawn (sedia ada)'],
    [58.5, 21.5, 'R4 tangga ke jeti sebelum jeti siap: sembunyi/papan tanda'], [68.5, 24.2, 'R5 pulau disangka laluan utama: papan "Pulau (pilihan)"'], [86.8, 17.5, 'R6 dinding cabang perlu bukaan untuk jambatan tali (ubah collision)']],
};

export const L12 = {
  id: 'w1-l2', title: 'Level 1-2 · Jambatan Berkembar (cadangan V2)', width: 90, rowTop: 15, rowBottom: 30,
  terrain: [[0, 6, 22, 'new'], [6, 9, 23, 'new'], [9, 12, 24, 'change'], [12, 18, 23, 'keep'], [20, 34, 24, 'keep'], [40, 46, 24, 'keep'],
    [48, 52, 23, 'keep'], [54, 58, 24, 'keep'], [58, 64, 23, 'keep'], [64, 72, 23, 'keep'], [78, 84, 23, 'keep'], [84, 90, 22, 'keep']],
  slab: [], cave: [[54.5, 58, 25, 27, 'new'], [57, 58, 24, 25, 'new']],
  deck: [[31, 34, 21, 'keep'], [40, 45, 21, 'keep'], [54, 58, 20, 'keep'], [59, 62, 19, 'keep'], [62, 67, 19, 'new'], [67, 70, 20, 'new'], [52, 54, 26, 'new']],
  gate: [[34, 40, 24, 'Jambatan berkembar'], [34, 40, 21, 'Dek atas'], [72, 78, 23, 'Jambatan akhir']],
  ladder: [[32.5, 21, 24, 'keep'], [42, 21, 24, 'keep'], [56, 20, 24, 'keep'], [57.5, 24, 27, 'new']],
  water: [[18, 20, 28], [34, 40, 28], [46, 48, 28], [52, 54, 28], [72, 78, 28]],
  math: [[26, 24, '∑ f∘g / g∘f · 9 & 25'], [65, 23, '∑ f∘g / g∘f · 19 & 49'], [49.5, 23, '∑ tiket bot (pilihan)']],
  inter: [[23, 24, 'Tuil kincir air'], [51.5, 23, 'Tuil pintu air'], [64.5, 19, 'Jambatan tali menurun'], [86, 22, 'Tugu batu'], [3, 22, 'Pemandangan lembah']],
  cp: [[2, 22], [22, 24], [41, 24], [55, 24], [63, 23], [79, 23]],
  secret: [[44, 21, 'Pemerhatian kembar'], [61, 19, 'Pemerhatian kanopi'], [56, 27, 'Gua tebing (baharu)']],
  mark: [[1, 19.5, 'Gerbang 1-1 di kejauhan'], [24, 20.5, 'Kincir air'], [56, 16, 'Pokok kanopi gergasi'], [68, 20.8, 'Empangan batu'], [88, 19.5, 'Tugu → runtuhan']],
  main: [[1, 22, 'start'], [6, 22, 'walk'], [6, 23, 'drop'], [9, 23, 'walk'], [9, 24, 'drop'], [12, 24, 'walk'], [12, 23, 'jump'], [18, 23, 'walk'], [20, 24, 'drop'],
    [34, 24, 'walk'], [40, 24, 'gate'], [46, 24, 'walk'], [48, 23, 'jump'], [52, 23, 'walk'], [54, 24, 'drop'], [58, 24, 'walk'], [58, 23, 'jump'],
    [72, 23, 'walk'], [78, 23, 'gate'], [84, 23, 'walk'], [84, 22, 'jump'], [87, 22, 'goal']],
  opt: [
    { id: 'P1', pts: [[32.5, 24], [32.5, 21], [45, 21], [42, 21], [42, 24]], why: 'Dek atas berkembar (MENEGAK): pemerhatian f∘g ≠ g∘f + syiling; turun tangga x42 ke laluan utama' },
    { id: 'P2', pts: [[56, 24], [56, 20], [58, 20], [59, 19], [67, 19], [70, 20], [70, 23]], why: 'Kanopi → jambatan tali menurun (MENEGAK): pemerhatian kanopi + syiling; mendarat di laman empangan' },
    { id: 'P3', pts: [[52, 23], [52, 26], [54.5, 26], [57.5, 27], [57.5, 24]], why: 'Gua tebing (BAWAH TANAH): perlu tuil pintu air; rahsia; keluar ikut tangga ke tebing' },
    { id: 'P4', pts: [[48.5, 23], [51, 23]], why: 'Gerai jeti: cabaran tiket pilihan; ganjaran rakit pintas ke gua (bukan wajib)' }],
  loops: [
    { id: 'G1', pts: [[52, 23], [52, 26], [57.5, 27], [57.5, 24], [54, 24], [52, 23]], why: 'Gelung bawah tanah: pulau → gua → tebing → lompat balik ke pulau' },
    { id: 'G2', pts: [[70, 23], [58, 23], [56, 24], [56, 20], [59, 19], [67, 19], [70, 20], [70, 23]], why: 'Gelung kanopi: laman empangan → balik ke pokok gergasi → naik → jambatan tali → empangan' }],
  risk: [[6, 20.6, 'R1 turun rabung: langkah 1 jubin (boleh naik semula)'], [53, 24.8, 'R2 gua tenggelam sebelum pintu air: paras air jelas'],
    [47, 26, 'R3 jatuh antara pulau → respawn (sedia ada)'], [50, 21.6, 'R4 gerai jeti tidak menghalang laluan'], [70, 21.4, 'R5 jambatan tali mendarat dekat panel empangan']],
};

export const L13 = {
  id: 'w1-l3', title: 'Level 1-3 · Gerbang Songsang (cadangan V2)', width: 104, rowTop: 17, rowBottom: 39,
  terrain: [[0, 7, 32, 'keep'], [9, 12, 32, 'keep'], [13, 24, 31, 'keep'], [25, 35, 32, 'keep'], [36, 46, 31, 'keep'], [47, 60, 30, 'keep'],
    [64, 75, 31, 'keep'], [76, 87, 30, 'keep'], [88, 104, 29, 'keep']],
  slab: [[19, 24, 30, 31, 'new'], [20.5, 24, 29, 30, 'new'], [21.5, 24, 28, 29, 'new'], [22.5, 24, 27, 28, 'new'], [27, 29, 25, 25.5, 'new'],
    [22, 24, 34, 35, 'new'], [23, 24, 33, 34, 'new']],
  cave: [[14, 25, 33, 35, 'new'], [24, 25, 31, 33, 'keep'], [64, 76, 33, 35, 'new'], [75, 76, 31, 33, 'keep']],
  deck: [[14, 19, 28, 'keep'], [20, 29, 26, 'keep'], [29, 35, 24, 'keep'], [34, 39, 22, 'keep'], [29, 35, 26, 'keep'], [83, 88, 23, 'keep'], [39, 47, 24, 'new'], [35, 36.5, 23, 'new'], [7, 9, 32, 'keep']],
  gate: [[60, 64, 30, 'Jambatan meterai']],
  ladder: [[85, 23, 30, 'keep'], [68.5, 31, 35, 'new']],
  water: [[7, 9, 33], [60, 64, 31]],
  math: [[53, 30, '∑ f⁻¹(y)=(y−3)/2 · meterai 13, 7, 15'], [16, 35, '∑ C=(F−32)/1.8 (pilihan)']],
  inter: [[37.5, 22, 'Injap takungan'], [43, 24, 'Akueduk mengalir'], [24.5, 31, 'Lubang runtuhan'], [75.5, 31, 'Lubang runtuhan'], [93, 29, 'Gerbang meterai']],
  cp: [[2, 32], [37, 31], [48, 30], [66, 31], [90, 29]],
  secret: [[17.5, 28, 'Prasasti'], [56, 30, 'Tablet domain'], [85, 23, 'Tablet songsang'], [19, 35, 'Ruang (baharu)'], [70, 35, 'Gua (baharu)']],
  mark: [[3, 30, 'Batu tanda 1-2'], [36, 19.5, 'Menara + takungan'], [43, 22.5, 'Akueduk'], [61, 27, 'Air terjun'], [93, 23.5, 'Gerbang Utama']],
  main: [[1, 32, 'start'], [7, 32, 'walk'], [9, 32, 'jump'], [12, 32, 'walk'], [13, 31, 'jump'], [19, 31, 'walk'], [19, 30, 'jump'], [20.5, 29, 'jump'], [21.5, 28, 'jump'], [22.5, 27, 'jump'], [22.5, 26, 'jump'],
    [27, 26, 'walk'], [27, 25, 'jump'], [29, 24, 'jump'], [35, 24, 'walk'], [35.5, 23, 'jump'], [36.5, 22, 'jump'], [39, 22, 'walk'], [39, 24, 'drop'], [47, 24, 'walk'], [47, 30, 'drop'],
    [60, 30, 'walk'], [64, 30, 'gate'], [64, 31, 'drop'], [75, 31, 'walk'], [76, 30, 'jump'], [87, 30, 'walk'], [88, 29, 'jump'], [96, 29, 'goal']],
  opt: [
    { id: 'P1', pts: [[24, 31], [25, 32], [35, 32], [36, 31], [46, 31], [47, 30]], why: 'Halaman bawah: laluan tanah lama, kini laluan balik + syiling; tidak membuka injap' },
    { id: 'P2', pts: [[19, 30], [19, 28], [14, 28]], why: 'Balkoni akar: Prasasti runtuhan; terjun semula ke tangga batu' },
    { id: 'P3', pts: [[24.5, 31], [24.5, 33], [23.5, 34], [14, 35]], why: 'Ruang tersembunyi: termometer lama (pilihan, konteks tukang air zaman dahulu); keluar ikut tangga batu' },
    { id: 'P4', pts: [[75.5, 31], [75.5, 35], [68.5, 35], [68.5, 31]], why: 'Gua di bawah tebing: rahsia + pemandangan air terjun dari dalam; naik tangga ke tebing' },
    { id: 'P5', pts: [[85, 30], [85, 23], [88, 23]], why: 'Jalan atas gerbang: Tablet songsang' }],
  loops: [
    { id: 'G1', pts: [[13, 31], [22.5, 26], [36.5, 22], [39, 24], [47, 24], [47, 30], [46, 31], [36, 31], [35, 32], [25, 32], [24, 31], [19, 31]], why: 'Gelung menara: tangga → takungan → akueduk → laman mesin → halaman bawah → balik ke kaki tangga' },
    { id: 'G2', pts: [[72, 31], [75.5, 31], [75.5, 35], [68.5, 35], [68.5, 31], [72, 31]], why: 'Gelung gua: lubang runtuhan → gua → tangga → tebing' }],
  risk: [[24.5, 29.8, 'R1 lubang sedia ada: kini mendarat dalam ruang, ada jalan keluar'], [53, 28.2, 'R2 ke mesin sebelum injap: "tiada aliran" + akueduk kering'],
    [38.5, 20.5, 'R3 terlepas injap di puncak: anak panah air + bunyi'], [75.5, 29.8, 'R4 lubang kedua: kini ke gua'], [62, 28.5, 'R5 jurang → respawn checkpoint mesin (sedia ada)']],
};

// World 2 · Level 2-1 (planned; Station A uses the tested slice geometry, scaled 1 maths unit = 1 tile).
export const L21 = {
  id: 'w2-l1', title: 'Level 2-1 · Jejak Lengkung (rancangan)', width: 96, rowTop: 12, rowBottom: 32,
  terrain: [[0, 5, 21, 'new'], [5, 9, 22, 'new'], [9, 12, 23, 'new'], [12, 18.5, 25.5, 'new'], [20.5, 21.5, 22, 'new'], [23.5, 33, 25.5, 'new'],
    [38, 44, 24, 'new'], [44, 50, 26, 'new'], [58, 70, 26, 'new'], [70, 80, 24, 'new'], [80, 96, 22, 'new']],
  slab: [[33, 38, 18, 20, 'new'], [68, 70, 25, 26, 'new'], [78, 80, 23, 24, 'new']],
  cave: [[24, 32, 27, 29, 'new']],
  deck: [[86, 90, 19, 'new']],
  gate: [[50, 58, 26, 'Jambatan gantung (Stesen C)'], [18.5, 23.5, 25.5, 'Batu lengkung A'], [33, 38, 25, 'Batu lengkung B']],
  ladder: [[30, 25.5, 29, 'new'], [83, 19, 22, 'new']],
  water: [[18.5, 23.5, 27], [33, 38, 28], [50, 58, 29]],
  curves: [{ ox: 18, oy: 25.5 - 0.5, a: -0.5, h: 3, k: 4, from: 0, to: 6, label: 'A: y = −½(x−3)² + 4' },
    { ox: 34, oy: 26, a: -1, h: 5, k: 4, from: 2.5, to: 7.5, label: 'B: y = −(x−5)² + 4' },
    { ox: 50, oy: 26, a: 0.5, h: 4, k: 1, from: 0, to: 8, label: 'C: y = ½(x−4)² + 1' }],
  math: [[16, 25.5, '∑ Pancur A (a)'], [33, 25.5, '∑ Pancur B (h, k)'], [50, 26, '∑ Kabel C']], inter: [[30, 25.5, 'Tangga gua']],
  cp: [[2, 21], [14, 25.5], [39, 24], [63, 26], [82, 22]],
  secret: [[28, 29, 'Gua bawah tebing'], [88, 19, 'Cincin emas ke-3']],
  mark: [[2, 18.5, 'Pancur rosak (mercu tanda)'], [21, 19, 'Tiang pancur'], [44, 18, 'Bukit batu kapur'], [55, 23, 'Sungai lembah'], [92, 19.5, 'Gerbang batu → 2-2']],
  main: [[1, 21, 'start'], [5, 21, 'walk'], [5, 22, 'drop'], [9, 22, 'walk'], [9, 23, 'drop'], [12, 23, 'walk'], [12, 25.5, 'drop'], [18.5, 25.5, 'walk'], [23.5, 25.5, 'gate'],
    [33, 25.5, 'walk'], [38, 24, 'gate'], [44, 24, 'walk'], [44, 26, 'drop'], [50, 26, 'walk'], [58, 26, 'gate'], [68, 26, 'walk'], [68, 25, 'jump'], [70, 24, 'jump'], [78, 24, 'walk'], [78, 23, 'jump'], [80, 22, 'jump'], [94, 22, 'goal']],
  opt: [{ id: 'P1', pts: [[30, 25.5], [30, 29], [24, 29]], why: 'Gua bawah tebing: rahsia' }, { id: 'P2', pts: [[83, 22], [83, 19], [90, 19]], why: 'Dek tinggi: cincin emas ke-3 (penyelesaian alternatif Stesen B)' }],
  loops: [], risk: [[23.5, 23, 'R1 BLUEPRINT SAHAJA: tunggu penilaian Stesen A']],
};
