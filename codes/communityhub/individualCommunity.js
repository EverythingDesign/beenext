// Founder Voices hero quotes
//
// The quote circle in #fv-hero holds one quote per hexagon on its ring: the
// first quote belongs to the top hexagon, then right, bottom and left. A white
// progress arc runs clockwise from the top; as it reaches each hexagon, that
// hexagon lights up and its quote fades in while the last one fades out. The
// hexagons the arc has already passed stay yellow until it starts a new lap.
// Clicking a hexagon (or pressing Enter/Space on it) jumps the arc to that
// point and carries on from there.
//
// The arc is .fv-hero-progress, masked to the --fv-progress angle by the
// hero's CSS embed, which also styles the current hexagon (.is-active) and the
// passed ones (.is-passed), and hides every quote but the first until this
// runs.

const HERO_CIRCLE_SELECTOR = "#fv-hero .fv-hero-circle";
const HERO_QUOTE_SELECTOR = ".fv-hero-quote";
const HERO_QUOTE_AUTHOR_SELECTOR = ".fv-hero-quote-text + *";
// Clockwise from the top, where the arc starts.
const HERO_POINT_SELECTORS = [
  ".fv-hero-hex.is-top",
  ".fv-hero-hex.is-right",
  ".fv-hero-hex.is-bottom",
  ".fv-hero-hex.is-left",
];
const HERO_POINT_ACTIVE_CLASS = "is-active";
const HERO_POINT_PASSED_CLASS = "is-passed";
// Seconds the arc takes from one hexagon to the next, which is how long each
// quote stays up.
const HERO_SEGMENT_DURATION = 7;
const HERO_FADE_DURATION = 0.6;
const HERO_FADE_EASE = "sine.inOut";

function initFounderVoicesHero() {
  const gsap = window.gsap;
  const circle = document.querySelector(HERO_CIRCLE_SELECTOR);
  if (!gsap || !circle) return;

  const points = HERO_POINT_SELECTORS.map((selector) => circle.querySelector(selector));
  const quotes = [...circle.querySelectorAll(HERO_QUOTE_SELECTOR)];
  if (points.some((point) => !point) || quotes.length < points.length) {
    console.warn(
      `Founder Voices hero: expected ${points.length} hexagons and as many quotes, found ${
        points.filter(Boolean).length
      } and ${quotes.length}.`,
    );
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const step = 360 / points.length;
  const progress = { angle: 0 };
  let current = -1;
  let tween = null;
  let inView = false;

  const drawArc = () => {
    circle.style.setProperty("--fv-progress", `${progress.angle}deg`);
  };

  const show = (index, { immediate = false } = {}) => {
    if (index === current) return;
    current = index;

    points.forEach((point, pointIndex) => {
      const active = pointIndex === index;
      point.classList.toggle(HERO_POINT_ACTIVE_CLASS, active);
      point.classList.toggle(HERO_POINT_PASSED_CLASS, pointIndex < index);
      point.setAttribute("aria-pressed", String(active));
    });

    quotes.slice(0, points.length).forEach((quote, quoteIndex) => {
      const active = quoteIndex === index;
      quote.setAttribute("aria-hidden", String(!active));
      gsap.to(quote, {
        autoAlpha: active ? 1 : 0,
        duration: immediate || reducedMotion.matches ? 0 : HERO_FADE_DURATION,
        ease: HERO_FADE_EASE,
        overwrite: true,
      });
    });
  };

  const canPlay = () => inView && !document.hidden;

  // One lap of the ring from wherever the arc is now, then round again from
  // the top. With reduced motion the arc stays put until a hexagon is chosen.
  const run = () => {
    tween?.kill();
    tween = null;
    if (reducedMotion.matches) return;

    tween = gsap.to(progress, {
      angle: 360,
      duration: ((360 - progress.angle) / step) * HERO_SEGMENT_DURATION,
      ease: "none",
      paused: !canPlay(),
      onUpdate: () => {
        drawArc();
        show(Math.min(points.length - 1, Math.floor(progress.angle / step)));
      },
      onComplete: () => {
        progress.angle = 0;
        drawArc();
        show(0);
        run();
      },
    });
  };

  const goTo = (index) => {
    progress.angle = index * step;
    drawArc();
    show(index);
    run();
  };

  const updatePlayback = () => {
    if (!tween) return;
    if (canPlay()) tween.play();
    else tween.pause();
  };

  points.forEach((point, index) => {
    const author = quotes[index].querySelector(HERO_QUOTE_AUTHOR_SELECTOR)?.textContent.trim();

    point.setAttribute("role", "button");
    point.setAttribute("tabindex", "0");
    point.setAttribute(
      "aria-label",
      `Show quote ${index + 1} of ${points.length}${author ? `, ${author}` : ""}`,
    );

    point.addEventListener("click", () => goTo(index));
    point.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      goTo(index);
    });
  });

  // Quotes past the ring's hexagons have no point to reach, so stay hidden.
  quotes.slice(points.length).forEach((quote) => {
    gsap.set(quote, { autoAlpha: 0 });
    quote.setAttribute("aria-hidden", "true");
  });

  reducedMotion.addEventListener("change", () => goTo(current));
  document.addEventListener("visibilitychange", updatePlayback);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    updatePlayback();
  }).observe(circle);

  drawArc();
  show(0, { immediate: true });
  run();
}

document.addEventListener("DOMContentLoaded", () => {
  initFounderVoicesHero();
});
