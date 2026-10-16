import { navigate } from '../utils/router.js';

export function renderFormScreen(root) {
  root.innerHTML = `
    <div class="form-screen">
      <button type="button" class="btn-back" id="form-back" aria-label="Kembali">&larr; Kembali</button>
      <h1 class="form-title">Pilih tingkatan</h1>
      <div class="form-choices">
        <button type="button" class="form-choice" id="choose-4">
          <span class="form-choice-big">Tingkatan 4</span>
        </button>
        <button type="button" class="form-choice" id="choose-5">
          <span class="form-choice-big">Tingkatan 5</span>
        </button>
      </div>
    </div>
  `;
  root.querySelector('#form-back').addEventListener('click', () => navigate('start'));
  root.querySelector('#choose-4').addEventListener('click', () => navigate('map/4'));
  root.querySelector('#choose-5').addEventListener('click', () => navigate('map/5'));
}
