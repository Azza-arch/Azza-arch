/* Site behaviour for haziqbuilds.com
   Loaded with `defer` after aos.js and feather.min.js, so both globals exist
   and the DOM is fully parsed by the time this runs. Kept as an external file
   so the Content-Security-Policy can use `script-src 'self'` with no
   'unsafe-inline'. */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // With AOS disabled the data-aos attributes are removed, so content is simply visible.
  if (window.AOS) AOS.init({ duration: 650, once: true, offset: 40, disable: function () { return prefersReducedMotion; } });
  if (window.feather) feather.replace();

  var navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 24);
    }, { passive: true });

    // Hide the nav "Request a Quote" button while the hero is on screen —
    // the hero already carries its own quote CTA. Falls back to always
    // showing it if IntersectionObserver is unavailable.
    var heroEl = document.getElementById('top');
    if (heroEl && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        navbar.classList.toggle('at-hero', entries[0].intersectionRatio > 0.12);
      }, { threshold: [0, 0.12, 0.4, 1] }).observe(heroEl);
    }
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

    var MAX_POINTER_X = 6;
    var MAX_POINTER_Y = 4;
    var MAX_SCROLL_SHIFT = 10;
    var pointerX = 0, pointerY = 0, scrollShift = 0;

    // Explicit clamps so head/crop safety holds even if this gets tuned later.
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

  // Package buttons preselect the matching project type in the quote form.
  var PACKAGE_TYPES = {
    'Starter': 'Starter (one page)',
    'Business': 'Business (up to three pages)',
    'Custom website': 'Custom website',
    'Custom web system': 'Custom web system (quotation)'
  };
  document.querySelectorAll('[data-package]').forEach(function (link) {
    link.addEventListener('click', function () {
      var select = document.getElementById('type');
      var wanted = PACKAGE_TYPES[link.getAttribute('data-package')];
      if (select && wanted) select.value = wanted;
    });
  });

  // CONTACT EMAIL + QUOTE FORM
  var CONTACT_EMAIL = 'syhaziqdev@gmail.com';

  var emailLink = document.getElementById('contactEmailLink');
  var emailText = document.getElementById('contactEmailText');
  if (emailLink && emailText) {
    emailLink.href = 'mailto:' + CONTACT_EMAIL;
    emailText.textContent = CONTACT_EMAIL;
  }

  var WHATSAPP_NUMBER = '60129536858';

  function buildMessage(data) {
    return 'Hi Haziq,\n\n' +
      'I found your portfolio and I am interested in discussing a website project.\n\n' +
      'Name: ' + data.name + '\n' +
      'Business / Organisation: ' + (data.business || '-') + '\n' +
      'Project type: ' + data.type + '\n' +
      'Approximate budget: ' + data.budget + '\n\n' +
      'Project details:\n' + data.details + '\n\n' +
      'Thank you.';
  }

  function buildMailtoHref(data) {
    var subject = 'Website enquiry - ' + (data.business || data.name);
    var body = buildMessage(data);

    return 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  var quoteForm = document.getElementById('quoteForm');
  var formError = document.getElementById('formError');
  var nameField = document.getElementById('name');
  var businessField = document.getElementById('business');
  var typeField = document.getElementById('type');
  var budgetField = document.getElementById('budget');
  var detailsField = document.getElementById('details');

  if (quoteForm && formError && nameField && businessField && typeField && budgetField && detailsField) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var payload = {
        name: nameField.value.trim(),
        business: businessField.value.trim(),
        type: typeField.value,
        budget: budgetField.value,
        details: detailsField.value.trim()
      };

      var missing = [];
      [
        [nameField, payload.name, 'your name'],
        [typeField, payload.type, 'what you need'],
        [budgetField, payload.budget, 'an approximate budget'],
        [detailsField, payload.details, 'a few project details']
      ].forEach(function (entry) {
        var field = entry[0], value = entry[1], label = entry[2];
        var invalid = !value;
        field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
        field.classList.toggle('field-invalid', invalid);
        if (invalid) missing.push(label);
      });

      if (missing.length) {
        formError.textContent = 'Please add ' + missing.join(' and ') + ' before sending - or email ' + CONTACT_EMAIL + ' directly.';
        formError.classList.remove('hidden');
        var firstInvalid = quoteForm.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      formError.classList.add('hidden');
      formError.textContent = '';

      // mailto: does nothing when no mail app is configured, so always show a
      // fallback (copy text / WhatsApp). The message is built in the browser
      // only and is never sent or stored by this page.
      var message = buildMessage(payload);
      var fallback = document.getElementById('formFallback');
      var waLink = document.getElementById('waEnquiry');
      var copyBtn = document.getElementById('copyEnquiry');
      var copyStatus = document.getElementById('copyStatus');
      if (waLink) waLink.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
      if (copyStatus) copyStatus.textContent = '';
      if (copyBtn) {
        copyBtn.onclick = function () {
          var done = function (ok) {
            if (copyStatus) copyStatus.textContent = ok ? 'Copied. Paste it into any email or chat.' : 'Could not copy automatically. Please select and copy your details manually.';
          };
          var legacyCopy = function () {
            var ta = document.createElement('textarea');
            ta.value = message;
            ta.setAttribute('readonly', '');
            ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            var ok = false;
            try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
            document.body.removeChild(ta);
            done(ok);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(message).then(function () { done(true); }, legacyCopy);
          } else { legacyCopy(); }
        };
      }
      if (fallback) fallback.classList.remove('hidden');

      window.location.href = buildMailtoHref(payload);
    });
  }
})();
