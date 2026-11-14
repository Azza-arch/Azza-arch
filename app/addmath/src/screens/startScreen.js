import { navigate } from '../utils/router.js';

export function renderStartScreen(root) {
  root.innerHTML = `
    <div class="start-screen">
      <p class="start-tag">x&sup2;</p>
      <h1 class="start-title">Add Math</h1>
      <p class="start-subtitle">Sikit-sikit, jadi faham.</p>
      <button type="button" class="btn-primary btn-huge" id="start-mula">MULA</button>
      <a class="game-link" href="denai/">
        <span class="game-link-kicker">Permainan · Bab 1 Fungsi</span>
        <span class="game-link-title">DENAI: Jejak Taman Fungsi</span>
        <span class="game-link-cta">Main &rarr;</span>
      </a>
    </div>
  `;
  root.querySelector('#start-mula').addEventListener('click', () => navigate('form'));
}
