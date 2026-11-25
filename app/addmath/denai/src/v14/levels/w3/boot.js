// World 3 level pages: <main data-level="w3-l1"> … boots that level (scene.js).
import { bootLevel } from './scene.js';
bootLevel(document.querySelector('main[data-level]').dataset.level);
