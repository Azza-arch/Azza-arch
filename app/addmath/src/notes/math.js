// KaTeX (self-hosted, vendor/katex). Authored content writes inline maths as
// \( ... \) and display maths as \[ ... \]. KaTeX outputs HTML for sight and
// MathML for screen readers ('htmlAndMathml').
import katex from '../../vendor/katex/katex.mjs';

const opts = (displayMode) => ({ displayMode, throwOnError: false, output: 'htmlAndMathml', strict: 'ignore' });

export function tex(str, display = false) {
  return katex.renderToString(String(str), opts(display));
}

// Replace \( \) and \[ \] in an authored HTML string with rendered maths.
export function renderMath(html) {
  return String(html ?? '')
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, m) => `<span class="math-display">${tex(m, true)}</span>`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, m) => tex(m, false));
}

let cssLoaded = false;
export function ensureKatexCss() {
  if (cssLoaded) return;
  cssLoaded = true;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('../../vendor/katex/katex.min.css', import.meta.url).href;
  document.head.append(link);
}
