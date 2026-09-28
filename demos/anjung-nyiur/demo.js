(() => {
  // Section menu (phones)
  const button = document.getElementById("menuButton");
  const sheet = document.getElementById("menuSheet");
  const closeMenu = ({ returnFocus = false } = {}) => {
    sheet.classList.remove("is-open");
    sheet.inert = true;
    button.setAttribute("aria-expanded", "false");
    if (returnFocus) button.focus();
  };
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    sheet.classList.toggle("is-open", open);
    sheet.inert = !open;
  });
  sheet.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") closeMenu({ returnFocus: true });
  });
  document.addEventListener("click", (event) => {
    if (button.getAttribute("aria-expanded") === "true" && !sheet.contains(event.target) && !button.contains(event.target)) closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 900) closeMenu();
  });

  // Current section in the navigation
  const navLinks = [...document.querySelectorAll(".desktop-nav a, .menu-sheet a")];
  const sectionIds = ["house", "rooms", "setting", "stay", "faq"];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        if (link.getAttribute("href") === "#" + visible.target.id) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] });
    sections.forEach((section) => observer.observe(section));
  }

  // Enquiry: prepares a message only. Nothing is sent, stored or checked.
  const form = document.getElementById("enquiryForm");
  const checkin = document.getElementById("checkin");
  const checkout = document.getElementById("checkout");
  const guests = document.getElementById("guests");
  const guestName = document.getElementById("guestName");
  const note = document.getElementById("note");
  const errorBox = document.getElementById("formError");
  const preview = document.getElementById("preview");
  const previewText = document.getElementById("previewText");
  const copyButton = document.getElementById("copyMessage");
  const copyStatus = document.getElementById("copyStatus");

  const today = new Date();
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  checkin.min = iso(today);
  checkout.min = iso(today);
  checkin.addEventListener("change", () => {
    if (checkin.value) checkout.min = checkin.value;
  });

  const formatDate = (value) => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const showError = (message, field) => {
    errorBox.textContent = message;
    errorBox.hidden = false;
    preview.hidden = true;
    [checkin, checkout, guests].forEach((el) => el.setAttribute("aria-invalid", el === field ? "true" : "false"));
    field.focus({ preventScroll: true });
    errorBox.scrollIntoView({ block: "center", behavior: "auto" });
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    copyStatus.textContent = "";
    if (!checkin.value) return showError("Please choose a check-in date.", checkin);
    if (!checkout.value) return showError("Please choose a check-out date.", checkout);
    if (checkin.value < iso(today)) return showError("Check-in cannot be in the past.", checkin);
    if (checkout.value <= checkin.value) return showError("Check-out must be after check-in.", checkout);
    if (!guests.value) return showError("Please choose the number of guests.", guests);

    errorBox.hidden = true;
    [checkin, checkout, guests].forEach((el) => el.setAttribute("aria-invalid", "false"));

    const lines = [
      "Hi, I would like to ask about Anjung Nyiur.",
      "",
      `Check-in: ${formatDate(checkin.value)}`,
      `Check-out: ${formatDate(checkout.value)}`,
      `Guests: ${guests.value}`
    ];
    if (guestName.value.trim()) lines.push(`Name: ${guestName.value.trim()}`);
    if (note.value.trim()) lines.push("", `Note: ${note.value.trim()}`);
    lines.push("", "Could you let me know if these dates are free? Thank you.");

    previewText.textContent = lines.join("\n");
    preview.hidden = false;
    preview.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });

  copyButton.addEventListener("click", () => {
    const text = previewText.textContent;
    const done = (ok) => {
      copyStatus.textContent = ok ? "Copied." : "Could not copy. Select the message and copy it manually.";
    };
    const legacy = () => {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.className = "copy-buffer";
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (error) { ok = false; }
      document.body.removeChild(area);
      done(ok);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), legacy);
    else legacy();
  });
})();
