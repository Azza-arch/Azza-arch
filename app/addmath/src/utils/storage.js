// Small localStorage wrapper. Falls back to an in-memory object if storage
// is unavailable (private browsing, blocked cookies, etc.) so the app keeps
// working without persistence.

const KEY = 'addmath-progress-v1';
const memory = {};

function isStorageAvailable() {
  try {
    const test = '__addmath_test__';
    window.localStorage.setItem(test, '1');
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

const available = isStorageAvailable();

function readAll() {
  if (!available) return { ...memory };
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  if (!available) {
    Object.assign(memory, data);
    return;
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Ignore quota/availability errors; app still works without persistence.
  }
}

export function getProgress() {
  return readAll();
}

export function saveLastLocation({ form, chapterId, lessonIndex }) {
  const data = readAll();
  writeAll({
    ...data,
    lastForm: form ?? data.lastForm,
    lastChapterId: chapterId ?? data.lastChapterId,
    lastLessonIndex: typeof lessonIndex === 'number' ? lessonIndex : data.lastLessonIndex,
  });
}
