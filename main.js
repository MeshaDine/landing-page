// Demo contact details. TODO: replace both placeholders before going live.
const CONTACT = {
  whatsapp: "91XXXXXXXXXX", // international format, digits only
  email: "hello@example.com",
  message: "Hi Mesha Dine, I'd like a demo for my restaurant.",
};

const ctaHrefs = {
  whatsapp: `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.message)}`,
  email: `mailto:${CONTACT.email}?subject=${encodeURIComponent("Mesha Dine demo")}`,
};
document.querySelectorAll("[data-cta]").forEach((a) => {
  a.href = ctaHrefs[a.dataset.cta];
  if (a.dataset.cta === "whatsapp") { a.target = "_blank"; a.rel = "noopener"; }
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

// Brand demo: re-skin the phone like the diner app does per restaurant.
const brandStage = document.querySelector(".brand__stage");
const brandName = document.querySelector("[data-brand-name]");
const swatches = document.querySelectorAll("[data-brand]");
swatches.forEach((btn, i) => {
  btn.addEventListener("click", () => select(btn));
  btn.addEventListener("keydown", (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = swatches[(i + step + swatches.length) % swatches.length];
    select(next);
    next.focus();
  });
});
function select(btn) {
  swatches.forEach((b) => {
    b.setAttribute("aria-checked", String(b === btn));
    b.tabIndex = b === btn ? 0 : -1;
  });
  brandStage.style.setProperty("--brand", btn.dataset.brand);
  brandName.textContent = btn.dataset.name;
}
select(swatches[0]);

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
