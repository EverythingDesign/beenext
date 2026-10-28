// Quote circle shared by the Founder Voices and Innovation heroes.
// Each visible polygon has one quote. The progress arc reaches the polygons
// in clockwise order, using their positions on the ring rather than assuming
// that every page has four equally spaced points.

const HERO_CIRCLE_SELECTOR = "#fv-hero .fv-hero-circle";
const HERO_QUOTE_SELECTOR = ".fv-hero-quote";
const HERO_QUOTE_AUTHOR_SELECTOR = ".fv-hero-quote-text + *";
const HERO_POINT_SELECTORS = [
  ".fv-hero-hex.is-top",
  ".fv-hero-hex.is-right",
  ".fv-hero-hex.is-bottom",
  ".fv-hero-hex.is-left",
];
const HERO_POINT_ACTIVE_CLASS = "is-active";
const HERO_POINT_PASSED_CLASS = "is-passed";
const HERO_SEGMENT_DURATION = 7;
const HERO_FADE_DURATION = 0.6;

function initFounderVoicesHero() {
  const gsap = window.gsap;
  const circle = document.querySelector(HERO_CIRCLE_SELECTOR);
  if (!gsap || !circle) return;

  // Keep the existing quote order (top, right, bottom, left), but only use
  // markers that actually exist. Also support future markers without a side
  // class, in their DOM order.
  const namedPoints = HERO_POINT_SELECTORS.map((selector) => circle.querySelector(selector)).filter(Boolean);
  const points = [
    ...namedPoints,
    ...[...circle.querySelectorAll(".fv-hero-hex")].filter((point) => !namedPoints.includes(point)),
  ].filter((point) => point.getClientRects().length);
  const quotes = [...circle.querySelectorAll(HERO_QUOTE_SELECTOR)];

  if (!points.length || quotes.length !== points.length) {
    console.warn(
      `Quote circle: expected one quote per visible polygon, found ${points.length} polygons and ${quotes.length} quotes.`,
    );
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const entries = points.map((point, index) => ({ point, quote: quotes[index], angle: 0 }));
  const progress = { angle: 0 };
  let ordered = [];
  let current = null;
  let tween = null;
  let inView = false;

  const drawArc = () => {
    circle.style.setProperty("--fv-progress", `${progress.angle}deg`);
  };

  const measure = () => {
    const ring = circle.getBoundingClientRect();
    const centerX = ring.left + ring.width / 2;
    const centerY = ring.top + ring.height / 2;

    entries.forEach((entry) => {
      const rect = entry.point.getBoundingClientRect();
      const dx = rect.left + rect.width / 2 - centerX;
      const dy = rect.top + rect.height / 2 - centerY;
      // atan2(dx, -dy) makes the top 0deg and increases clockwise.
      let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
      if (angle < 0) angle += 360;
      if (angle > 359.5) angle = 0; // avoid a top marker rounding to 360deg
      entry.angle = angle;
    });

    ordered = [...entries].sort((a, b) => a.angle - b.angle);
  };

  const show = (entry, { immediate = false, force = false } = {}) => {
    if (entry === current && !force) return;
    current = entry;
    const currentIndex = ordered.indexOf(entry);

    ordered.forEach(({ point }, index) => {
      const active = index === currentIndex;
      point.classList.toggle(HERO_POINT_ACTIVE_CLASS, active);
      point.classList.toggle(HERO_POINT_PASSED_CLASS, index < currentIndex);
      point.setAttribute("aria-pressed", String(active));
    });

    entries.forEach(({ quote }) => {
      const active = quote === entry.quote;
      quote.setAttribute("aria-hidden", String(!active));
      gsap.to(quote, {
        autoAlpha: active ? 1 : 0,
        duration: immediate || reducedMotion.matches ? 0 : HERO_FADE_DURATION,
        ease: "sine.inOut",
        overwrite: true,
      });
    });
  };

  const canPlay = () => inView && !document.hidden;

  const run = () => {
    tween?.kill();
    tween = null;
    if (reducedMotion.matches || !current) return;

    const index = ordered.indexOf(current);
    const next = ordered[index + 1];
    const targetAngle = next ? next.angle : 360;

    tween = gsap.to(progress, {
      angle: targetAngle,
      duration: HERO_SEGMENT_DURATION,
      ease: "none",
      paused: !canPlay(),
      onUpdate: drawArc,
      onComplete: () => {
        if (next) {
          show(next);
        } else {
          progress.angle = ordered[0].angle;
          drawArc();
          show(ordered[0]);
        }
        run();
      },
    });
  };

  const goTo = (entry) => {
    progress.angle = entry.angle;
    drawArc();
    show(entry);
    run();
  };

  const updatePlayback = () => {
    if (!tween) return;
    if (canPlay()) tween.play();
    else tween.pause();
  };

  entries.forEach((entry) => {
    const author = entry.quote.querySelector(HERO_QUOTE_AUTHOR_SELECTOR)?.textContent.trim();
    const index = entries.indexOf(entry);

    entry.point.setAttribute("role", "button");
    entry.point.setAttribute("tabindex", "0");
    entry.point.setAttribute(
      "aria-label",
      `Show quote ${index + 1} of ${entries.length}${author ? `, ${author}` : ""}`,
    );

    entry.point.addEventListener("click", () => goTo(entry));
    entry.point.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      goTo(entry);
    });
  });

  reducedMotion.addEventListener("change", () => {
    if (current) goTo(current);
  });
  document.addEventListener("visibilitychange", updatePlayback);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    updatePlayback();
  }).observe(circle);

  measure();
  progress.angle = ordered[0].angle;
  drawArc();
  show(ordered[0], { immediate: true });
  run();

  // Responsive layouts can move the polygons around the ring.
  if (window.ResizeObserver) {
    new ResizeObserver(() => {
      const selected = current;
      measure();
      if (selected) {
        progress.angle = selected.angle;
        drawArc();
        show(selected, { immediate: true, force: true });
        run();
      }
    }).observe(circle);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFounderVoicesHero, { once: true });
} else {
  initFounderVoicesHero();
}
