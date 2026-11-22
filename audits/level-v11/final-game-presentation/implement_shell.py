from pathlib import Path
root=Path(__file__).resolve().parents[3]/'app/addmath/rooftop'
p=root/'v11.html';s=p.read_text(encoding='utf-8-sig')
s=s.replace('Binaan semakan Phase 1 Lorong Atas Bumbung: teroka taman, pengangkat bertuil dan laluan bonus pilihan bersama Chill Boy.','Pengembaraan platform Tingkatan 4. Teroka bersama Chill Boy, uji fungsi dan buka laluan dari taman ke sungai.')
a=s.index('    <header class="masthead">');b=s.index('    <div class="game-stage">',a)
s=s[:a]+'''    <header class="masthead" aria-label="Status permainan">
      <span class="level-identity">Level 1</span><span id="hud-collection" aria-label="Koleksi">0 / 9</span>
      <button type="button" id="pause" disabled aria-label="Jeda permainan">Jeda <kbd>Esc</kbd></button>
    </header>
'''+s[b:]
a=s.index('          <p class="menu-kicker">');b=s.index('        </section>',a)
s=s[:a]+'''          <div class="title-copy"><h1 id="welcome-title">Lorong Atas<br><span>Bumbung</span></h1>
            <p class="title-tagline">Satu lorong. Banyak jalan untuk difikirkan.</p>
            <div class="title-actions">
              <button type="button" id="start" class="primary">Main Pengembaraan</button>
              <button type="button" id="continue-btn" class="primary" hidden>Sambung Permainan</button>
              <button type="button" id="new-adventure" class="secondary" hidden>Pengembaraan Baharu</button>
              <p id="save-status" class="small" hidden></p>
            </div>
            <nav class="menu-section" aria-label="Menu utama">
              <button type="button" id="level-select-btn">Pilih Level</button>
              <button type="button" id="how-to-play">Cara Main</button>
              <button type="button" id="settings-btn">Tetapan</button>
              <button type="button" id="collection-btn">Koleksi</button>
            </nav>
          </div>
          <div class="title-character" aria-hidden="true"><div class="menu-mascot"></div><div class="title-platform"></div></div>
          <a class="title-return" href="../">Kembali ke Add Math</a>
          <button id="import-v9" type="button" hidden>Salin kemajuan serasi</button>
'''+s[b:]
s=s.replace('aria-labelledby="welcome-title"','aria-labelledby="welcome-title" tabindex="-1"')
s=s.replace('<div id="coin-count" hidden></div>','<div id="coin-count" hidden></div><div id="notice" role="status" aria-live="polite"></div><div id="tutorial" aria-live="polite"></div>')
s=s.replace('<button id="dial-close"', '<button id="dial-solution" type="button">Langkah kerja</button><button id="dial-close"')
s=s.replace('</div></section>\n        <div id="touch-controls"','</div><div id="worked-solution" hidden></div></section>\n        <div id="touch-controls"')
a=s.index('  <dialog id="paused"');b=s.index('  <dialog id="secret-note"',a)
s=s[:a]+'''  <dialog id="paused" aria-labelledby="pause-title"><h2 id="pause-title">Rehat sekejap.</h2><p>Lorong ini menunggu.</p>
    <div class="pause-actions"><button type="button" id="resume" class="primary">Sambung Permainan</button><button type="button" id="restart-checkpoint">Kembali ke Checkpoint</button><button type="button" id="pause-help">Cara Main</button><button type="button" id="pause-settings-btn">Tetapan</button><button type="button" id="pause-collection-btn">Koleksi</button><button type="button" id="restart">Mula Semula</button><button type="button" id="pause-menu">Menu Utama</button><button type="button" id="fullscreen">Skrin penuh</button></div>
    <a class="dialog-return" href="../">Kembali ke Add Math</a></dialog>
  <dialog id="help" aria-labelledby="help-title"><button type="button" class="close" id="help-close" aria-label="Tutup cara main">×</button><h2 id="help-title">Cari jalan anda.</h2>
    <dl class="help-controls"><div><dt>A / D · ← / →</dt><dd>Bergerak</dd></div><div><dt>Space</dt><dd>Lompat</dd></div><div><dt>W / S · ↑ / ↓</dt><dd>Naik atau turun tangga</dd></div><div><dt>E</dt><dd>Gunakan mesin atau pintu</dd></div><div><dt>R</dt><dd>Kembali ke checkpoint</dd></div><div><dt>Esc</dt><dd>Jeda atau tutup panel</dd></div></dl>
    <p>Telefon: gunakan butang arah, Lompat dan Guna. Butang tangga muncul apabila berhampiran.</p><p>Tolak kotak ke plet untuk membuka laluan bonus. Mesin mengira output daripada input pilihan anda. Jawapan salah boleh dicuba semula tanpa penalti.</p><p>Laluan atas dan laluan bawah bukit ialah pilihan. Bendera menyimpan checkpoint secara automatik.</p></dialog>
'''+s[b:]
a=s.index('  <dialog id="complete"');b=s.index('  <noscript>',a)
s=s[:a]+'''  <dialog id="complete" aria-labelledby="complete-title"><div class="victory-content"><div class="victory-flag" aria-hidden="true"></div><h2 id="complete-title">LEVEL 1<br><span>SELESAI!</span></h2><p class="victory-message">Dari taman ke sungai.<br>Anda yang membuka jalannya.</p>
    <div class="results"><p id="completion-time"></p><p id="completion-coins"></p><p id="completion-secrets"></p></div><p id="completion-puzzles"></p>
    <div class="dialog-actions"><button type="button" id="replay" class="primary">Main Semula</button><button type="button" id="menu-btn">Menu Utama</button><button type="button" id="complete-level-select" hidden>Pilih Level</button></div><a class="dialog-return" href="../">Kembali ke Add Math</a></div></dialog>
'''+s[b:]
p.write_text(s,encoding='utf-8')
