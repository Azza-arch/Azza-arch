(function(){
  var content={
    storyOrder:{title:'Order the story / Susun cerita',en:'The pictures start mixed up. Select two pictures to swap them into the correct story order.',bm:'Gambar bermula dalam susunan bercampur. Pilih dua gambar untuk menukarnya ke susunan cerita yang betul.'},
    wordOrder:{title:'Build the sentence / Bina ayat',en:'Move every English word into the answer area. Use Left and Right arrows to reorder a selected word.',bm:'Pindahkan setiap perkataan English ke ruang jawapan. Gunakan anak panah Kiri dan Kanan untuk menyusun semula perkataan.'},
    practice:{title:'Practice help / Bantuan latihan',en:'Look at the picture and time clue, then choose the English answer that fits.',bm:'Lihat gambar dan petunjuk masa, kemudian pilih jawapan English yang sesuai.'}
  };
  var opener=null;
  function open(key,trigger){var c=content[key]||content.storyOrder,p=document.getElementById('learning-help');opener=trigger||document.activeElement;p.querySelector('h2').textContent=c.title;p.querySelector('[data-help-en]').textContent=c.en;p.querySelector('[data-help-bm]').textContent=c.bm;p.hidden=false;document.getElementById('help-close').focus();}
  function close(returnFocus){var p=document.getElementById('learning-help');if(p.hidden)return;p.hidden=true;if(returnFocus&&opener&&opener.isConnected)opener.focus();opener=null;}
  function bind(){document.addEventListener('click',function(e){var b=e.target.closest('[data-help]');if(b)open(b.dataset.help,b);else if(e.target.id==='learning-help')close(false);});document.getElementById('help-close').addEventListener('click',function(){close(true);});document.addEventListener('keydown',function(e){if(e.key==='Escape')close(true);});}
  var api={content:content,open:open,close:close,bind:bind};window.TenseTales.utils.helpSupport=api;
})();
