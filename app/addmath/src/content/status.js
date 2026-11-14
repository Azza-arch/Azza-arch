// Publication status for notes, lessons and questions.
//   published   — complete, reviewed, and approved by the site owner; visible to everyone
//   review      — complete and waiting for the owner's approval; NOT shown publicly
//   draft       — still being written; NOT shown publicly
//   coming_soon — topic listed in the catalogue only ("Dalam penyediaan")
// Nothing moves to 'published' automatically: the owner sets it by hand.
export const STATUS = Object.freeze({ PUBLISHED: 'published', REVIEW: 'review', DRAFT: 'draft', COMING_SOON: 'coming_soon' });
export const STATUSES = Object.values(STATUS);
export const isPublic = (item) => item?.status === STATUS.PUBLISHED;
export const PREPARING_LABEL = 'Dalam penyediaan';
