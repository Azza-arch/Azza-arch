// Presentation references only. The reviewed chapter remains the source of truth.
export const PROTOTYPE_CHAPTER = 't4-2';
export const PROTOTYPE_SUBTOPIC = '2.3';
export const PLAN = {
  objective: 'Kenal pasti bentuk, bucu dan pintasan parabola untuk melakar graf serta mencari nilai maksimum atau minimum.',
  coreConcepts: [1, 2, 4, 5, 7, 8],
  visuals: [3, 6],
  formula: 9,
  examples: 10,
  featuredExamples: [0, 2],
  mistakes: 11,
  summary: 12,
  context: 0,
  next: 13,
};

export const FORMULA_GUIDES = {
  '2.1': [
    { title: 'Rumus kuadratik', when: 'Mencari punca apabila pemfaktoran tidak mudah.', condition: String.raw`\(a \ne 0\); punca nyata memerlukan \(b^2 - 4ac \ge 0\).`, section: 3 },
    { title: 'Persamaan daripada punca', when: 'Dua punca diberi; bina persamaannya.', condition: String.raw`Bentuk monik mempunyai pekali \(x^2\) sama dengan 1; untuk hubungan pekali bentuk am, \(a \ne 0\).`, section: 5 },
    { title: 'Ketaksamaan kuadratik', when: 'Mencari julat nilai x yang memenuhi ketaksamaan.', condition: String.raw`\(\alpha < \beta\); hasil darab di sini berpekali utama positif. Uji tanda, dan bezakan \(<\) daripada \(\le\).`, section: 6 },
  ],
  '2.2': [
    { title: 'Pembezalayan dan jenis punca', when: 'Menentukan bilangan punca nyata tanpa menyelesaikan persamaan.', condition: String.raw`Susun sebagai \(ax^2 + bx + c = 0\), dengan \(a \ne 0\).`, section: 1 },
  ],
  '2.3': [
    { title: 'Bentuk verteks', keywords: 'penyempurnaan kuasa dua sempurnakan', when: 'Membaca bucu dan nilai maksimum atau minimum terus daripada fungsi.', condition: String.raw`\(a \ne 0\). Minimum jika \(a > 0\); maksimum jika \(a < 0\).`, section: 4 },
    { title: 'Paksi simetri', when: 'Fungsi diberi dalam bentuk am; cari koordinat x bagi bucu.', condition: String.raw`\(a \ne 0\). Gantikan nilai x ke dalam fungsi untuk mencari koordinat y.`, section: 5 },
  ],
};

// An auditable placement for every original section and example, not copied content.
export function coverageManifest(chapter) {
  const sub = chapter.subtopics.find(s => s.id === PROTOTYPE_SUBTOPIC);
  return {
    chapter: chapter.id, status: chapter.status, subtopic: sub.id, sp: sub.sp,
    sections: sub.sections.map((section, index) => ({
      index, kind: section.kind, sp: section.sp || [],
      destination: PLAN.coreConcepts.includes(index) ? 'fahami/core'
        : PLAN.visuals.includes(index) ? 'fahami/visual-tabs'
        : index === PLAN.formula ? 'ulang-kaji/formulas'
        : index === PLAN.examples ? 'fahami/examples'
        : index === PLAN.context ? 'fahami/context-disclosure'
        : index === PLAN.mistakes ? 'fahami/mistakes'
        : index === PLAN.summary ? 'fahami/summary'
        : index === PLAN.next ? 'fahami/next' : null,
    })),
    examples: sub.sections[PLAN.examples].items.map((e, index) => ({ index, sp: e.sp, destination: PLAN.featuredExamples.includes(index) ? 'fahami/featured' : 'fahami/additional-disclosure' })),
    questions: chapter.questions.map(q => ({ id: q.id, subtopic: q.subtopic, sp: q.sp, status: q.status, destination: 'latihan' })),
  };
}
