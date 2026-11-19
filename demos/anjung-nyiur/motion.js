(() => {
  const mobileMenu = document.querySelector('.mobile-menu');
  mobileMenu?.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => { mobileMenu.open = false; });
  });

  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver((entries, currentObserver) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

  document.documentElement.classList.add('has-motion');
  targets.forEach((target) => observer.observe(target));
})();
