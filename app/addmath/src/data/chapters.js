// Chapter list for Tingkatan 4 and Tingkatan 5, in KSSM order.
// `ready: true` means the chapter has lessons + practice wired up.

export const FORM4_CHAPTERS = [
  { id: 't4-1', number: 1, title: 'Fungsi', ready: true },
  { id: 't4-2', number: 2, title: 'Fungsi Kuadratik', ready: false },
  { id: 't4-3', number: 3, title: 'Sistem Persamaan', ready: false },
  { id: 't4-4', number: 4, title: 'Indeks, Surd dan Logaritma', ready: false },
  { id: 't4-5', number: 5, title: 'Janjang', ready: false },
  { id: 't4-6', number: 6, title: 'Hukum Linear', ready: false },
  { id: 't4-7', number: 7, title: 'Geometri Koordinat', ready: false },
  { id: 't4-8', number: 8, title: 'Vektor', ready: false },
  { id: 't4-9', number: 9, title: 'Penyelesaian Segi Tiga', ready: false },
  { id: 't4-10', number: 10, title: 'Nombor Indeks', ready: false },
];

export const FORM5_CHAPTERS = [
  { id: 't5-1', number: 1, title: 'Sukatan Membulat', ready: false },
  { id: 't5-2', number: 2, title: 'Pembezaan', ready: false },
  { id: 't5-3', number: 3, title: 'Pengamiran', ready: false },
  { id: 't5-4', number: 4, title: 'Pilih Atur dan Gabungan', ready: false },
  { id: 't5-5', number: 5, title: 'Taburan Kebarangkalian', ready: false },
  { id: 't5-6', number: 6, title: 'Fungsi Trigonometri', ready: false },
  { id: 't5-7', number: 7, title: 'Pengaturcaraan Linear', ready: false },
  { id: 't5-8', number: 8, title: 'Kinematik Gerakan Linear', ready: false },
];

export function chaptersForForm(form) {
  return form === 5 ? FORM5_CHAPTERS : FORM4_CHAPTERS;
}

export function findChapter(chapterId) {
  return (
    FORM4_CHAPTERS.find((c) => c.id === chapterId) ||
    FORM5_CHAPTERS.find((c) => c.id === chapterId) ||
    null
  );
}

export function formOfChapter(chapterId) {
  return chapterId.startsWith('t5') ? 5 : 4;
}
