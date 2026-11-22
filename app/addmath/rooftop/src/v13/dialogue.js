// Text-only reactions. No timers, physics changes, asset loads or answer hints.
export const MISSION='Hantar bekalan ke destinasi di seberang sungai.';
export const LINES={
 'zone:A':'Baiklah, bekalan ni kena sampai ke seberang.',
 'zone:B':'Hmm, nombor ni tentukan pengangkut berhenti dekat mana?',
 'zone:C':'Ada laluan atas. Boleh singgah dan teroka.',
 'zone:D':'Mesin ni ubah setiap input ikut aturan yang sama.',
 'zone:E':'Kalau tukar susunan mesin, hasilnya berubah ke?',
 'zone:F':'Eh, macam ada jalan lain dekat bawah tu.',
 'zone:G':'Tinggal satu lintasan lagi!',
 'found:crate':'Kotak dan plet ni macam berkaitan. Cuba dekatkan.',
 'found:probe':'Boleh cuba input dan perhatikan output di sini.',
 'found:lift':'Aku cuba dulu. Tengok mesin ni berhenti dekat mana.',
 'found:c-clue':'Setiap input ada pasangannya. Jom perhatikan.',
 'found:c-apply':'Nampak macam ada cara nak uji di sini.',
 'found:c-pattern':'Eh, setiap kali input naik satu, hasilnya naik dua!',
 'found:number':'Blok nombor ni boleh diuji pada mesin.',
 'found:composition':'Hasil mesin pertama masuk ke mesin seterusnya.',
 'found:water':'Aku jejak aliran dari satu mesin ke satu lagi dulu.',
 'found:inverse-f':'Dari output, boleh cari semula input asal?',
 'found:river-select':'Aku periksa kedua-dua bahagian mesin ni dulu.',
 'found:river-lever':'Tuil ni jalankan apa yang dipilih di papan.',
 'failed:lift':'Belum sampai ke lintasan. Cuba input lain.',
 'failed:number':'Hasilnya belum sepadan. Aku cuba blok lain.',
 'failed:water':'Takungan belum penuh. Aku cuba susunan lain.',
 'failed:inverse-f':'Belum kena. Aku semak hubungan input dengan output.',
 'failed:river-final':'Belum terbuka. Aku perhatikan hasil ujian tadi.',
 'activated:crate':'Plet dah ditekan. Laluan bonus terbuka!',
 'activated:lift':'Pengangkut dah berhenti. Boleh lintas!',
 'activated:number-span':'Laluan dah terbuka. Teruskan perjalanan.',
 'activated:water-crossing':'Air dah sampai. Lintasan kini selamat.',
 'activated:river-input':'Bahagian pertama dah aktif. Ada satu lagi.',
 'activated:river-crossing':'Jambatan dah berhenti. Jom ke seberang!',
 'secret:bonus-mapping':'Jumpa sesuatu di laluan atas. Berbaloi singgah!',
 'secret:f-inverse':'Rupanya ada penemuan dalam gua ni!',
 'destination':'Dah sampai! Bekalan selamat dibawa ke seberang.'
};
export function sanitizeDialogue(raw){
 const valid=xs=>Array.isArray(xs)?[...new Set(xs.filter(id=>Object.hasOwn(LINES,id)))]:[];
 const seen=valid(raw?.seen);
 return {seen,pending:valid(raw?.pending).filter(id=>!seen.includes(id))};
}
export class DialogueQueue{
 constructor(saved){const data=sanitizeDialogue(saved);this.seen=new Set(data.seen);this.pending=data.pending;this.active=null;this.remaining=0;this.cooldown=0;}
 enqueue(id){if(!Object.hasOwn(LINES,id)||this.seen.has(id)||this.pending.includes(id))return false;this.pending.push(id);return true;}
 dismiss(){this.active=null;this.remaining=0;this.cooldown=1600;}
 retireStale(zone,solved){
  const origins={crate:'A',probe:'B',lift:'B','c-clue':'C','c-apply':'C','c-pattern':'C','bonus-mapping':'C',number:'D','number-span':'D',composition:'D',water:'E','water-crossing':'E','inverse-f':'F','f-inverse':'F','river-select':'G','river-lever':'G','river-final':'G','river-input':'G','river-crossing':'G'};
  const resolved={lift:'lift',number:'number-span',water:'water-crossing','river-final':'river-input'};
  const stale=id=>{const [kind,key]=id.split(':');const origin=kind==='zone'?key:origins[key];return (origin&&origin!==zone)||(kind==='failed'&&solved.has(resolved[key]));};
  let changed=false;
  this.pending=this.pending.filter(id=>{if(!stale(id))return true;this.seen.add(id);changed=true;return false;});
  if(this.active&&stale(this.active)){this.dismiss();changed=true;}
  return changed;
 }
 tick(delta,available){
  if(!available)return false;
  const dt=Math.max(0,Math.min(delta,100));
  if(this.active){this.remaining-=dt;if(this.remaining<=0)this.dismiss();return false;}
  this.cooldown=Math.max(0,this.cooldown-dt);
  if(this.cooldown||!this.pending.length)return false;
  this.active=this.pending.shift();this.seen.add(this.active);this.remaining=5600;return true;
 }
 snapshot(){return {seen:[...this.seen],pending:[...this.pending]};}
}
export function missionObjective(scene){
 if(scene.levelCompleted)return 'Bekalan sudah sampai.';
 if(!scene.solvedGates.has('lift'))return 'Teroka bukit dan pengangkut.';
 if(!scene.solvedGates.has('number-span'))return 'Cari laluan melalui bengkel.';
 if(!scene.solvedGates.has('water-crossing'))return 'Jejak mesin dan aliran air.';
 if(!scene.solvedGates.has('river-crossing'))return 'Teruskan ke lintasan sungai.';
 return 'Bawa bekalan ke pintu destinasi.';
}
