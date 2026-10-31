// Demo contact details. TODO: replace both placeholders before going live.
const CONTACT = {
  whatsapp: "91XXXXXXXXXX", // international format, digits only
  email: "hello@example.com",
  message: "Hi Mesha Dine, I'd like a demo for my restaurant.",
};

const whatsappHref = (text) => `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
const ctaHrefs = {
  whatsapp: whatsappHref(CONTACT.message),
  email: `mailto:${CONTACT.email}?subject=${encodeURIComponent("Mesha Dine demo")}`,
};
document.querySelectorAll("[data-cta]").forEach((a) => {
  if (ctaHrefs[a.dataset.cta]) a.href = ctaHrefs[a.dataset.cta];
  if (a.dataset.cta.startsWith("whatsapp")) { a.target = "_blank"; a.rel = "noopener"; }
});
document.querySelectorAll("[data-cta-label]").forEach((a) => (a.textContent = CONTACT.email));
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Nav border once the page scrolls.
const nav = document.querySelector(".nav");
const onScrollNav = () => nav.classList.toggle("is-scrolled", scrollY > 8);
addEventListener("scroll", onScrollNav, { passive: true });
onScrollNav();

// How it works: the step nearest the middle of the screen drives the phone screen.
const howPhone = document.querySelector(".phone--how");
const steps = document.querySelectorAll(".step");
const stepObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      steps.forEach((s) => s.classList.toggle("is-active", s === e.target));
      howPhone.dataset.step = e.target.dataset.step;
    });
  },
  // Phones: the mockup covers the top half, so the active band sits lower.
  { rootMargin: matchMedia("(min-width: 860px)").matches ? "-45% 0px -45% 0px" : "-62% 0px -25% 0px" },
);
steps.forEach((s) => stepObserver.observe(s));

// Brand preview: re-skin the phone like the diner app does per restaurant (customer-fe branding.ts).
const luminance = (hex) => {
  const ch = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(1) + 0.7152 * ch(3) + 0.0722 * ch(5);
};
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
// White or near-black text, whichever reads better on the colour (same rule as the diner app).
const readableOn = (hex) =>
  contrast(luminance(hex), 1) >= contrast(luminance(hex), luminance("#111111")) ? "#ffffff" : "#111111";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const brandStage = document.querySelector(".brand__stage");
const brandName = document.querySelector("[data-brand-name]");
const brandLogo = document.querySelector("[data-brand-logo]");
const brandCta = document.querySelector('[data-cta="whatsapp-brand"]');
const nameInput = document.getElementById("brand-name");
const logoInput = document.getElementById("brand-logo");
const logoClear = document.getElementById("logo-clear");
const logoError = document.getElementById("logo-error");
const primaryInput = document.getElementById("brand-primary");
const secondaryInput = document.getElementById("brand-secondary");
const swatches = [...document.querySelectorAll("[data-brand]")];

function render() {
  const primary = primaryInput.value;
  const name = nameInput.value.trim() || "Your restaurant";
  brandStage.style.setProperty("--brand", primary);
  brandStage.style.setProperty("--accent", secondaryInput.value);
  brandStage.style.setProperty("--on-brand", readableOn(primary));
  // Brand-coloured text on the white menu needs 3:1, else fall back to dark ink.
  brandStage.style.setProperty("--brand-ink", contrast(luminance(primary), 1) >= 3 ? primary : "#222222");
  brandName.textContent = name;
  brandLogo.alt = name;
  const logoNote = brandLogo.hidden ? "" : " I'll send our logo in this chat.";
  brandCta.href = whatsappHref(
    `Hi Mesha Dine, I'd like a demo for my restaurant, ${name}. Our colours are ${primary} (main) and ${secondaryInput.value} (accent).${logoNote}`,
  );
}

function checkPreset(btn) {
  swatches.forEach((b) => b.setAttribute("aria-checked", String(b === btn)));
  // Keep one swatch tabbable even when a custom colour is picked.
  const tabbable = btn || swatches[0];
  swatches.forEach((b) => (b.tabIndex = b === tabbable ? 0 : -1));
}

function applyPreset(btn) {
  primaryInput.value = btn.dataset.brand;
  secondaryInput.value = btn.dataset.accent;
  nameInput.value = btn.dataset.name;
  checkPreset(btn);
  render();
}

swatches.forEach((btn, i) => {
  btn.addEventListener("click", () => applyPreset(btn));
  btn.addEventListener("keydown", (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = swatches[(i + step + swatches.length) % swatches.length];
    applyPreset(next);
    next.focus();
  });
});
nameInput.addEventListener("input", render);
[primaryInput, secondaryInput].forEach((el) => el.addEventListener("input", () => { checkPreset(null); render(); }));

// The logo is only shown from a local object URL; it never leaves the device.
function setLogo(file) {
  if (brandLogo.src.startsWith("blob:")) URL.revokeObjectURL(brandLogo.src);
  brandLogo.hidden = !file;
  logoClear.hidden = !file;
  if (file) brandLogo.src = URL.createObjectURL(file);
  else brandLogo.removeAttribute("src");
  render();
}
logoInput.addEventListener("change", () => {
  const file = logoInput.files[0];
  logoInput.value = "";
  if (!file) return;
  // Some phones report an empty type for SVGs, so fall back to the extension.
  const okType = LOGO_TYPES.includes(file.type) || (!file.type && /\.(png|jpe?g|svg)$/i.test(file.name));
  const problem = !okType
    ? "That file type isn't supported. Choose a PNG, JPG or SVG."
    : file.size > MAX_LOGO_BYTES
      ? `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. Choose a logo up to 2MB.`
      : "";
  logoError.textContent = problem;
  logoError.hidden = !problem;
  if (!problem) setLogo(file);
});
logoClear.addEventListener("click", () => { setLogo(null); logoInput.focus(); });

applyPreset(swatches[0]);

// Motion fallback for browsers without CSS scroll timelines (Firefox, older Safari).
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduced && !CSS.supports("animation-timeline: scroll()")) {
  document.documentElement.classList.add("js-motion");

  const revealObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); revealObserver.unobserve(e.target); }
    }),
    { rootMargin: "0px 0px -10% 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  // Same mapping as the CSS keyframes: 0 → --shift over the first viewport height.
  const layers = [...document.querySelectorAll(".parallax")].map((el) => ({
    el,
    shift: parseFloat(getComputedStyle(el).getPropertyValue("--shift")) || 0,
  }));
  let ticking = false;
  const paint = () => {
    const p = Math.min(scrollY / innerHeight, 1);
    layers.forEach(({ el, shift }) => (el.style.transform = `translateY(${p * shift}px)`));
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  paint();
}
