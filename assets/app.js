/* Site behaviour for haziqbuilds.com
   Loaded with `defer` after aos.js and feather.min.js, so both globals exist
   and the DOM is fully parsed by the time this runs. Kept as an external file
   so the Content-Security-Policy can use `script-src 'self'` with no
   'unsafe-inline'. */
(function () {
  'use strict';

  if (window.AOS) AOS.init({ duration: 650, once: true, offset: 40 });
  if (window.feather) feather.replace();

  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 24);
    }, { passive: true });
  }

  // HERO PORTRAIT PARALLAX
  // Subtle pointer + scroll depth, desktop fine-pointer only. Skips entirely
  // under prefers-reduced-motion, and never attaches on touch (mobile) devices.
  (function () {
    var portrait = document.getElementById('heroPortrait');
    var hero = document.getElementById('top');
    if (!portrait || !hero) return;

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(pointer: fine)').matches;
    if (reducedMotion || !finePointer) return;

    var MAX_POINTER_X = 6;     // px, horizontal cap
    var MAX_POINTER_Y = 4;     // px, vertical cap
    var MAX_SCROLL_SHIFT = 10; // px, total scroll depth
    var pointerX = 0, pointerY = 0, scrollShift = 0;

    // Explicit clamps (not just the multiplier math) so head/crop safety
    // holds even if this gets tuned later: vertical movement never exceeds
    // MAX_POINTER_Y, keeping it far inside the stage's headroom/crop margins.
    function render() {
      var clampedY = Math.max(-MAX_POINTER_Y, Math.min(MAX_POINTER_Y, pointerY)) + scrollShift;
      portrait.style.transform = 'translate3d(' + pointerX + 'px, ' + clampedY + 'px, 0)';
    }

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      pointerX = relX * MAX_POINTER_X * 2;
      pointerY = relY * MAX_POINTER_Y * 2;
      render();
    });

    hero.addEventListener('mouseleave', function () {
      pointerX = 0;
      pointerY = 0;
      render();
    });

    window.addEventListener('scroll', function () {
      var heroHeight = hero.offsetHeight || 1;
      var progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
      scrollShift = progress * MAX_SCROLL_SHIFT;
      render();
    }, { passive: true });
  })();

  // MOBILE NAV
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    var isMenuOpen = function () {
      return navToggle.getAttribute('aria-expanded') === 'true';
    };

    var openMobileMenu = function () {
      mobileMenu.classList.add('is-open');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close menu');
      mobileMenu.removeAttribute('inert');
    };

    var closeMobileMenu = function (opts) {
      mobileMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      mobileMenu.setAttribute('inert', '');
      if (opts && opts.returnFocus) navToggle.focus();
    };

    closeMobileMenu();

    navToggle.addEventListener('click', function () {
      if (isMenuOpen()) closeMobileMenu(); else openMobileMenu();
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { closeMobileMenu(); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isMenuOpen()) closeMobileMenu({ returnFocus: true });
    });

    document.addEventListener('click', function (e) {
      if (!isMenuOpen()) return;
      if (mobileMenu.contains(e.target) || navToggle.contains(e.target)) return;
      closeMobileMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 720 && isMenuOpen()) closeMobileMenu();
    });
  }

  // CONTACT EMAIL + QUOTE FORM
  // Single source of truth: the visible email link always mirrors CONTACT_EMAIL,
  // so it cannot drift from the address the form actually sends to.
  var CONTACT_EMAIL = 'syhaziqdev@gmail.com';

  var emailLink = document.getElementById('contactEmailLink');
  var emailText = document.getElementById('contactEmailText');
  if (emailLink && emailText) {
    emailLink.href = 'mailto:' + CONTACT_EMAIL;
    emailText.textContent = CONTACT_EMAIL;
  }

  var quoteForm = document.getElementById('quoteForm');
  var formError = document.getElementById('formError');
  var nameField = document.getElementById('name');
  var typeField = document.getElementById('type');
  var budgetField = document.getElementById('budget');
  var detailsField = document.getElementById('details');

  if (quoteForm && formError && nameField && typeField && budgetField && detailsField) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = nameField.value.trim();
      var business = document.getElementById('business').value.trim();
      var type = typeField.value;
      var budget = budgetField.value;
      var details = detailsField.value.trim();

      var missing = [];
      [
        [nameField, name, 'your name'],
        [typeField, type, 'what you need'],
        [budgetField, budget, 'an approximate budget'],
        [detailsField, details, 'a few project details']
      ].forEach(function (entry) {
        var field = entry[0], value = entry[1], label = entry[2];
        var invalid = !value;
        field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
        field.classList.toggle('field-invalid', invalid);
        if (invalid) missing.push(label);
      });

      if (missing.length) {
        formError.textContent = 'Please add ' + missing.join(' and ') + ' before sending — or email ' + CONTACT_EMAIL + ' directly.';
        formError.classList.remove('hidden');
        var firstInvalid = quoteForm.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      formError.classList.add('hidden');
      formError.textContent = '';

      var subject = 'Website enquiry — ' + (business || name);
      var body =
        'Hi Syed,\n\n' +
        'I found your portfolio and I’m interested in discussing a website project.\n\n' +
        'Name: ' + name + '\n' +
        'Business / Organisation: ' + (business || '-') + '\n' +
        'Project type: ' + type + '\n' +
        'Approximate budget: ' + budget + '\n\n' +
        'Project details:\n' + details + '\n\n' +
        'Thank you.';

      window.location.href =
        'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }
})();
