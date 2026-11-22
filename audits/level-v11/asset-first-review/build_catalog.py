from pathlib import Path
from PIL import Image
import hashlib,json,csv,html
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).resolve().parent
PACK=ROOT/'app/addmath/rooftop/assets/kenney-pixel-platformer'
atlas=Image.open(PACK/'Tilemap/tilemap_packed.png').convert('RGBA')
assert atlas.size==(360,162)
# Descriptive audit labels, not claimed official Kenney semantic names.
rows=[
['Tanah rumput tunggal','Rumput kiri tertutup','Rumput tengah tertutup','Rumput kanan tertutup','Isi tanah A','Isi tanah B','Blok tanah berbingkai','Serpihan besar','Serpihan kecil','Kotak emas kosong','Kotak tanda !','Kotak tanda bulat','Pelantar merah kiri','Pelantar merah tengah','Pelantar merah tunggal','Pelantar merah kanan','Daun tunggal','Kanopi atas kiri','Kanopi atas tengah','Kanopi atas kanan'],
['Rumput atas tunggal','Rumput atas kiri','Rumput atas tengah','Rumput atas kanan','Tanah sudut dalam A','Tanah sudut dalam B','Kotak kayu diagonal','Kunci','Kotak tanda dua arah','Blok kayu kosong','Blok kayu tanda T','Blok kayu tanda bulat','Batang tepi A','Air permukaan A','Air bekas atas kiri','Air bekas atas kanan','Daun sisi tunggal','Kanopi tengah kiri','Kanopi tengah','Kanopi tengah kanan'],
['Tanah jalur tunggal','Tanah jalur kiri','Tanah jalur tengah','Tanah jalur kanan','Hati penuh','Hati separuh','Hati kosong','Kotak kayu silang','Kayu pelantar kiri','Kayu pelantar tengah','Kayu pelantar kanan','Tangga pendek','Batang tepi B','Air permukaan B','Air bekas tengah kiri','Air bekas tengah kanan','Daun bawah tunggal','Kanopi bawah kiri','Kanopi bawah tengah','Kanopi bawah kanan'],
['Tanah atas rata tunggal','Tanah atas rata kiri','Tanah atas rata tengah','Tanah atas rata kanan','Tuil pose kiri','Tuil pose tegak','Tuil pose kanan','Permata biru','Duri','Tiang sokongan bercabang','Bentuk U kecil','Tangga sambungan','Akar batang','Isi air','Air bekas bawah kiri','Air bekas bawah kanan','Kanopi pendek tunggal','Kanopi pendek kiri','Kanopi pendek tengah','Kanopi pendek kanan'],
['Terrain pucat tunggal','Terrain pucat kiri','Terrain pucat tengah','Terrain pucat kanan','Papan anak panah kanan','Papan kosong','Papan anak panah kiri','Papan bentuk kiri','Papan bentuk kanan','Tiang kayu','Penyambung kayu kiri','Rasuk kayu','Penyambung kayu kanan','Paip siku atas kiri','Paip siku atas kanan','Paip menegak atas','Dahan berdaun A','Daun berjuntai','Gumpalan daun kecil','Dahan berdaun B'],
['Terrain pucat terbuka tunggal','Terrain pucat terbuka kiri','Terrain pucat terbuka tengah','Terrain pucat terbuka kanan','Isi tanah bertompok','Pagar silang','Pagar mendatar','Butang merah rendah','Butang merah tinggi','Hujung bawah tiang','Tiang bendera','Bendera pose A','Bendera pose B','Paip siku bawah kiri','Paip siku bawah kanan','Paip menegak tengah','Batang sempit','Cabang batang','Ranting kecil','Dahan mendatar'],
['Tanah sisi kiri A','Tanah sisi kanan A','Tanah sisi kiri B','Tanah sisi kanan B','Tumbuhan kecil','Tumbuhan tinggi','Pokok konifer kecil','Kaktus','Cendawan','Papan tinggi','Pintu bahagian atas','Batang kelabu sempit','Paip mendatar kiri','Paip mendatar tengah','Paip mendatar kanan','Paip menegak bawah','Batang pangkal kiri','Batang pangkal tengah','Batang bercabang sisi','Ranting bersudut'],
['Tanah bawah tunggal','Tanah bawah kiri','Tanah bawah tengah','Tanah bawah kanan','Bentuk kecil bertanduk','Bentuk nyalaan / makhluk','Plat coklat','Plat kelabu','Suis biru timbul','Suis biru rendah','Pintu bahagian bawah','Syiling muka','Syiling sisi','Bentuk pucat bawah kiri','Bentuk pucat bawah tengah','Bentuk pucat bawah kanan','Bentuk pucat kecil','Titik berbingkai','Simbol silang','Simbol garis serong'],
['Digit A '+str(i) for i in range(10)]+['Digit B '+str(i) for i in range(10)]
]
terrain=set(range(0,6))|set(range(12,16))|set(range(20,26))|set(range(40,44))|set(range(48,51))|set(range(60,64))|set(range(80,84))|set(range(100,105))|set(range(120,124))|set(range(140,144))
interaction={9,10,11,26,27,28,29,30,31,47,51,64,65,66,71,107,108,110,111,112,130,148,149,150}
water={33,34,35,53,54,55,73,74,75}
pipes={93,94,95,113,114,115,132,133,134,135}
uncertain={7,8,70,144,145,146,147,153,154,155,156,157,158,159}
records=[];mismatches=[]
for i,name in enumerate(sum(rows,[])):
 x,y=(i%20)*18,(i//20)*18
 tile=atlas.crop((x,y,x+18,y+18));single=Image.open(PACK/f'Tiles/tile_{i:04}.png').convert('RGBA')
 if tile.size!=single.size or any(a[3]!=b[3] or (a[3] and a[:3]!=b[:3]) for a,b in zip(tile.getdata(),single.getdata())):mismatches.append(i)
 cat='terrain' if i in terrain else 'interaksi' if i in interaction or i in pipes else 'collectible' if i in {67,151,152} else 'hazard' if i==68 or i in water else 'hiasan'
 use={'terrain':'Cantum tepi/tengah mengikut permukaan sebenar; collision dibina berasingan.','interaksi':'Komponen visual; perlu kod interaksi dan keadaan.','collectible':'Ganjaran pilihan; perlu overlap, ID stabil dan save.','hazard':'Duri/air bukan hazard automatik; hanya aktif jika reka bentuk dan recovery ditentukan.','hiasan':'Tiada collision; jangan janjikan mekanik daripada rupa.'}[cat]
 if i in pipes:use='Paip statik; fungsi, urutan, aliran dan output semuanya memerlukan kod.'
 if i>=160:use='Label nombor pada blok/output; bukan blok fizik dengan sendirinya.'
 if i in {44,45,46}:use='Ikon UI sahaja; katalog ini tidak mencadangkan sistem nyawa baharu.'
 if i in {51,71}:use='Tangga visual; perlu zon panjat, titik masuk/keluar dan pelantar selamat.'
 if i in {151,152}:use='Dua rupa syiling; bukan bukti urutan animasi lengkap.'
 if i in uncertain:use+=' Identiti/tujuan asal belum disahkan; jangan jadikan asas mekanik.'
 records.append(dict(frame=i,name=name,category=cat,atlas_x=x,atlas_y=y,width=18,height=18,function=use,confidence='rupa diperiksa; semantik belum disahkan' if i in uncertain else 'label deskriptif berdasarkan piksel',native_behavior='tiada; PNG statik'))
assert len(records)==180 and not mismatches,mismatches
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
lock={'atlas':'app/addmath/rooftop/assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png','sha256':sha(PACK/'Tilemap/tilemap_packed.png'),'size':[360,162],'frames':180,'pitch':18,'visiblePixelMismatches':mismatches,'labels':'Descriptive audit labels; not official Kenney semantics','ambiguousFrames':sorted(uncertain),'files':{str(p.relative_to(PACK)):sha(p) for p in sorted(PACK.rglob('*')) if p.is_file()}}
(OUT/'asset-lock.json').write_text(json.dumps(lock,indent=2),encoding='utf-8')
(OUT/'catalog-180.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
with (OUT/'catalog-180.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.DictWriter(f,fieldnames=list(records[0]));w.writeheader();w.writerows(records)
cards=''.join(f'<article data-category="{r["category"]}"><img src="../../../app/addmath/rooftop/assets/kenney-pixel-platformer/Tiles/tile_{r["frame"]:04}.png" alt="Frame {r["frame"]}"><b>{r["frame"]:03} · {html.escape(r["name"])}</b><small>{r["category"]} · atlas ({r["atlas_x"]},{r["atlas_y"]})</small><p>{html.escape(r["function"])}</p></article>' for r in records)
page='''<!doctype html><html lang="ms"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Katalog Kenney · 180 frame sebenar</title><style>body{margin:0;background:#f4f0e5;color:#243837;font:16px/1.5 system-ui}main{max-width:1400px;margin:auto;padding:24px}header{max-width:900px}nav{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0}button{font:inherit;padding:10px 16px;border:1px solid #426967;background:white;cursor:pointer}button[aria-pressed=true]{background:#14666d;color:white}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(225px,1fr));gap:14px}article{border:1px solid #c6c4b8;background:white;padding:16px}article img{width:90px;height:90px;image-rendering:pixelated;display:block;margin-bottom:12px;background:#e2e7e5}b,small{display:block}small{color:#5c625c}p{font-size:14px}[hidden]{display:none!important}a{color:#14666d}</style><main><header><h1>Kenney sebenar · 180 frame</h1><p>Atlas 360×162; setiap frame 18×18. Semua potongan dibandingkan dengan PNG individu. Nama di sini ialah label audit berdasarkan rupa, bukan nama fungsi rasmi Kenney. Semua aset statik; tiada collision atau mekanik terbina dalam.</p><p><strong>Pembetulan audit:</strong> frame 157 ialah titik kecil, bukan gear siap. Frame 145 tidak cukup jelas untuk dilabel sebagai hazard api. Frame 153–156 tidak dikunci sebagai awan. Mekanik tidak boleh bergantung pada andaian ini.</p><p><a href="review.md">Cadangan 16 ruang & keputusan semakan</a> · <a href="asset-gameplay.md">Matriks aset → gameplay</a> · <a href="catalog-180.csv">CSV lengkap</a> · <a href="asset-lock.json">Manifest hash</a></p></header><nav>'''+''.join(f'<button aria-pressed="{str(c=="semua").lower()}" data-filter="{c}">{c}</button>' for c in ['semua','terrain','interaksi','collectible','hazard','hiasan'])+'''</nav><p id="count">180 / 180 frame</p><section class="grid">'''+cards+'''</section></main><script>for(const b of document.querySelectorAll('[data-filter]'))b.onclick=()=>{for(const t of document.querySelectorAll('button'))t.setAttribute('aria-pressed',String(t===b));let n=0;for(const c of document.querySelectorAll('article')){c.hidden=b.dataset.filter!=='semua'&&c.dataset.category!==b.dataset.filter;if(!c.hidden)n++}document.querySelector('#count').textContent=n+' / 180 frame'}</script></html>'''
(OUT/'index.html').write_text(page,encoding='utf-8')
print(json.dumps({'frames':len(records),'pixelMismatches':mismatches,'categories':{c:sum(r['category']==c for r in records) for c in ['terrain','interaksi','collectible','hazard','hiasan']}},indent=2))
