import assert from 'node:assert/strict';
import { previewMode, visibleStatus } from '../src/notes/preview.js';

const data = new Map();
globalThis.sessionStorage = { getItem: k => data.get(k), setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) };
for (const host of ['localhost', '127.0.0.1', '[::1]', 'azza-arch.test']) {
  data.clear();
  globalThis.location = new URL(`http://${host}/?semak=1`);
  assert.equal(previewMode(), true, host);
  location.search = '';
  assert.equal(visibleStatus('review'), true, 'tab remembers preview');
  assert.equal(visibleStatus('draft'), false);
  location.search = '?semak=0';
  assert.equal(visibleStatus('review'), false, 'explicit opt-out');
}
for (const host of ['example.com', 'azza-arch.test.example.com', 'localhost.example.com', '192.168.1.2']) {
  globalThis.location = new URL(`https://${host}/?semak=1`);
  data.set('addmath-semak', '1');
  assert.equal(visibleStatus('review'), false, host);
  assert.equal(data.has('addmath-semak'), false, 'clear stale preview');
  assert.equal(visibleStatus('published'), true);
}
console.log('PASS local preview, persistence, opt-out, public host denial and draft hiding');
