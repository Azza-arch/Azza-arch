import { navigate } from '../utils/router.js';

export function renderStartScreen(root) {
  root.innerHTML = `
    <div class="start-screen">
      <p class="start-tag">x&sup2;</p>
      <h1 class="start-title">Add Math</h1>
      <p class="start-subtitle">Sikit-sikit, jadi faham.</p>
      <button type="button" class="btn-primary btn-huge" id="start-mula">MULA</button>
    </div>
  `;
  root.querySelector('#start-mula').addEventListener('click', () => navigate('form'));
}
