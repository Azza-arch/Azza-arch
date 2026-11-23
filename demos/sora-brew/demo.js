(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  const closeMenu = (restoreFocus = false) => {
    if (!header?.classList.contains("menu-open")) return;
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    menu.inert = true;
    if (restoreFocus) toggle.focus();
  };

  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    header.classList.toggle("menu-open", open);
    menu.inert = !open;
  });
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (header?.classList.contains("menu-open") && !header.contains(event.target)) closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 640) closeMenu();
  });

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sections = [...document.querySelectorAll("[data-reveal]")];
  let observer;

  const showAll = () => {
    root.classList.remove("motion-ready");
    observer?.disconnect();
    sections.forEach((section) => section.classList.add("is-in-view"));
  };

  const start = () => {
    observer?.disconnect();
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      showAll();
      return;
    }

    sections.forEach((section) => {
      const siblingGroups = new Map();
      section.querySelectorAll("[data-reveal-item], [data-reveal-image]").forEach((item) => {
        const siblings = siblingGroups.get(item.parentElement) ?? [];
        siblings.push(item);
        siblingGroups.set(item.parentElement, siblings);
      });
      siblingGroups.forEach((siblings) => siblings.forEach((item, index) => {
        item.style.setProperty("--reveal-delay", `${Math.min(index * 110, 330)}ms`);
      }));

      section.querySelectorAll(".menu-group").forEach((group, groupIndex) => {
        group.style.setProperty("--group-delay", `${groupIndex * 100}ms`);
        group.querySelectorAll("li").forEach((item, index) => {
          item.style.setProperty("--item-delay", `${index * 85}ms`);
        });
      });
      section.querySelectorAll(".story-points li, .room-stats > div, .footer-group a").forEach((item, index) => {
        item.style.setProperty("--item-delay", `${Math.min(index * 100, 300)}ms`);
      });
    });

    root.classList.add("motion-ready");
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in-view");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: "0px" });

    sections.forEach((section) => observer.observe(section));
  };

  start();
  reduceMotion.addEventListener?.("change", start);
  if (!reduceMotion.addEventListener) reduceMotion.addListener?.(start);

  const navLinks = [...document.querySelectorAll(".desktop-nav a, .mobile-nav a")];
  const trackedSections = ["menu", "story", "visit"].map((id) => document.getElementById(id)).filter(Boolean);
  if ("IntersectionObserver" in window && navLinks.length) {
    const currentObserver = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;
      navLinks.forEach((link) => {
        if (link.hash === `#${current.target.id}`) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-20% 0px -68% 0px", threshold: [0, .15, .4] });
    trackedSections.forEach((section) => currentObserver.observe(section));
  }
})();
