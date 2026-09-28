(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  const links = [...menu.querySelectorAll("a")];
  const closeMenu = ({ returnFocus = false } = {}) => {
    if (!header.classList.contains("menu-open")) return;
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    menu.inert = true;
    menu.setAttribute("aria-hidden", "true");
    if (returnFocus) toggle.focus();
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    header.classList.toggle("menu-open", open);
    menu.inert = !open;
    menu.setAttribute("aria-hidden", String(!open));
  });
  links.forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("menu-open")) closeMenu({ returnFocus: true });
  });
  document.addEventListener("click", (event) => {
    if (header.classList.contains("menu-open") && !header.contains(event.target)) closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) closeMenu();
  });

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const replaySections = [...document.querySelectorAll("[data-replay]")];
  const lastHeroAction = document.querySelector(".hero-actions .button-secondary");
  let revealObserver = null;
  let heroMotionPlayed = false;
  let heroMotionTimer = null;
  let heroAnimationEndHandler = null;

  const stopMotion = () => {
    root.classList.remove("motion-ready", "hero-motion");
    revealObserver?.disconnect();
    revealObserver = null;
    replaySections.forEach((section) => section.classList.remove("is-in-view"));
    if (heroMotionTimer !== null) {
      window.clearTimeout(heroMotionTimer);
      heroMotionTimer = null;
    }
    if (heroAnimationEndHandler) {
      lastHeroAction?.removeEventListener("animationend", heroAnimationEndHandler);
      heroAnimationEndHandler = null;
    }
  };

  const startMotion = () => {
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    root.classList.add("motion-ready");
    revealObserver?.disconnect();
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.01) {
          entry.target.classList.add("is-in-view");
        } else {
          entry.target.classList.remove("is-in-view");
        }
      });
    }, { threshold: 0 });
    replaySections.forEach((section) => revealObserver.observe(section));

    if (!heroMotionPlayed) {
      heroMotionPlayed = true;
      root.classList.add("hero-motion");
      const clearHeroMotion = () => {
        root.classList.remove("hero-motion");
        heroAnimationEndHandler = null;
        if (heroMotionTimer !== null) {
          window.clearTimeout(heroMotionTimer);
          heroMotionTimer = null;
        }
      };
      heroAnimationEndHandler = clearHeroMotion;
      lastHeroAction?.addEventListener("animationend", clearHeroMotion, { once: true });
      heroMotionTimer = window.setTimeout(clearHeroMotion, 1200);
    }
  };

  if (reducedMotion.matches) stopMotion();
  else startMotion();

  const handleMotionPreferenceChange = (event) => {
    if (event.matches) stopMotion();
    else startMotion();
  };
  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", handleMotionPreferenceChange);
  } else {
    reducedMotion.addListener?.(handleMotionPreferenceChange);
  }
  // Mark the section in view as the current navigation item.
  (() => {
    const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
    const sections = ['top', 'menu', 'story', 'outlet'].map((id) => document.getElementById(id)).filter(Boolean);
    if (!navLinks.length || !sections.length || !('IntersectionObserver' in window)) return;
    const setCurrent = (id) => {
      navLinks.forEach((link) => {
        if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    };
    const currentObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setCurrent(visible.target.id);
    }, { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] });
    sections.forEach((section) => currentObserver.observe(section));
  })();
})();
