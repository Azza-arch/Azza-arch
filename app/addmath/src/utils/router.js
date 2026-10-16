// Tiny hash router. Hash-based so refresh and the browser Back button work
// correctly on static hosting (no server rewrite rules needed for subpaths).

const listeners = new Set();

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  const name = parts[0] || 'start';
  return { name, params: parts.slice(1) };
}

export function navigate(path) {
  const target = `#/${path}`.replace(/\/+$/, '') || '#/start';
  if (window.location.hash === target) {
    emit();
  } else {
    window.location.hash = target;
  }
}

export function currentRoute() {
  return parseHash();
}

export function onRouteChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  const route = parseHash();
  listeners.forEach((fn) => fn(route));
}

window.addEventListener('hashchange', emit);

export function startRouter() {
  if (!window.location.hash) {
    window.location.hash = '#/start';
  }
  emit();
}
