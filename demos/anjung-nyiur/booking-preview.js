(() => {
  const nameInput = document.querySelector('#guest-name');
  const checkInInput = document.querySelector('#check-in');
  const checkOutInput = document.querySelector('#check-out');
  const guestCountInput = document.querySelector('#guest-count');
  const questionInput = document.querySelector('#guest-question');
  const previewButton = document.querySelector('#preview-booking');
  const errorMessage = document.querySelector('#booking-error');
  const preview = document.querySelector('#message-preview');
  const messageText = document.querySelector('#message-text');

  if (!nameInput || !checkInInput || !checkOutInput || !guestCountInput || !previewButton || !errorMessage || !preview || !messageText) return;

  const showError = (message, field) => {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    field?.focus();
  };

  const formatDate = (value) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('ms-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, day)));
  };

  previewButton.addEventListener('click', () => {
    errorMessage.hidden = true;
    preview.hidden = true;

    const name = nameInput.value.trim();
    const checkIn = checkInInput.value;
    const checkOut = checkOutInput.value;
    const guestCount = Number(guestCountInput.value);
    const question = questionInput?.value.trim() || '';

    if (!name) return showError('Masukkan nama tetamu untuk melihat pratonton.', nameInput);
    if (!checkIn) return showError('Pilih tarikh daftar masuk.', checkInInput);
    if (!checkOut) return showError('Pilih tarikh daftar keluar.', checkOutInput);
    if (Date.parse(`${checkOut}T00:00:00Z`) <= Date.parse(`${checkIn}T00:00:00Z`)) {
      return showError('Tarikh daftar keluar mestilah selepas tarikh daftar masuk.', checkOutInput);
    }
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 8) {
      return showError('Bilangan tetamu mestilah antara 1 hingga 8 untuk contoh ini.', guestCountInput);
    }

    const lines = [
      'Salam, saya ingin bertanya tentang penginapan Anjung Nyiur.',
      '',
      `Nama tetamu: ${name}`,
      `Daftar masuk: ${formatDate(checkIn)}`,
      `Daftar keluar: ${formatDate(checkOut)}`,
      `Bilangan tetamu: ${guestCount}`,
    ];
    if (question) lines.push(`Soalan tambahan: ${question}`);

    messageText.textContent = lines.join('\n');
    preview.hidden = false;
  });

  previewButton.disabled = false;
})();
