// Small markup helpers shared by the Bab 1 (Fungsi) lesson diagrams.
// Kept deliberately simple (rows + chip-sets) instead of hand-built SVG so
// every diagram stays readable, responsive, keyboard operable, and quick to
// extend for later chapters.

export function mappingRows(pairs) {
  return `
    <div class="mapping-rows">
      ${pairs
        .map(
          ([a, b]) => `
        <div class="mapping-row">
          <span class="chip chip-in">${a}</span>
          <span class="mapping-arrow" aria-hidden="true">&rarr;</span>
          <span class="chip chip-out">${b}</span>
        </div>`
        )
        .join('')}
    </div>
  `;
}

export function chipSet(label, items, partKey) {
  return `
    <button type="button" class="set-chip" data-part="${partKey}">
      <span class="set-chip-label">${label}</span>
      <span class="set-chip-items">{ ${items.join(', ')} }</span>
    </button>
  `;
}
