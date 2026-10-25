// Community hub hero
//
// The page reuses the homepage preloader (#mycelium-static-preloader). The
// Dandelion code component drives it: it shrinks the preloader once the
// dandelion is built and fires `dandelion:grow` on window shortly before the
// shrink ends, the same handoff the Mycelium component does with
// `mycelium:grow`. The heading waits until the preloader is actually gone.

const DANDELION_GROW_EVENT = "dandelion:grow";
const PRELOADER_ID = "mycelium-static-preloader";
// If the dandelion never reports in (WebGL blocked, component failed to
// load), stop waiting and show the page.
const PRELOADER_TIMEOUT_MS = 12000;

function hidePreloaderFallback() {
  const preloader = document.getElementById(PRELOADER_ID);
  if (!preloader) return;

  if (window.gsap) {
    window.gsap.to(preloader, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => preloader.remove(),
    });
  } else {
    preloader.remove();
  }
}

// `dandelion:grow` fires a little before the shrink ends, while the
// preloader is still on screen. Dandelion removes the preloader from the DOM
// once it has fully faded, so this waits for that removal instead.
function onPreloaderGone(callback) {
  const preloader = document.getElementById(PRELOADER_ID);

  if (!preloader?.parentNode) {
    callback();
    return;
  }

  const observer = new MutationObserver(() => {
    if (preloader.isConnected) return;
    observer.disconnect();
    callback();
  });

  observer.observe(preloader.parentNode, { childList: true });
}

// Runs the callback once, when the dandelion grows in, or right away if it
// already has.
function onDandelionGrow(callback) {
  let done = false;

  const run = () => {
    if (done) return;
    done = true;
    callback();
  };

  if (window.__dandelionGrown) {
    run();
    return;
  }

  window.addEventListener(DANDELION_GROW_EVENT, run, { once: true });

  window.setTimeout(() => {
    if (done) return;
    console.warn(
      "Community hero animation: the dandelion did not load in time, revealing the page anyway.",
    );
    hidePreloaderFallback();
    run();
  }, PRELOADER_TIMEOUT_MS);
}

// Every hero move starts and ends at rest, so nothing snaps into place.
const SOFT_EASE = "sine.inOut";
const RISE_DURATION = 1.6;
const RISE_STAGGER = 0.08;
const SUBHERO_FADE_DURATION = 1;
const SWAP_DURATION = 0.9;

// Scoped to #main: the page also keeps a hidden style holder with the
// .community-hero-heading class outside it.
const TITLE_SELECTOR = "#main .community-hero-h1 h1";
const KANJI_SELECTOR = "#main .community-hero-heading";
const SUBHERO_SELECTOR = "#main .community-subhero";
const PARA_SELECTOR = "#main .community-para";

// The hero is pinned while this spacer scrolls past, as #hero-trigger-1 does on
// the homepage. The Dandelion's Scroll Trigger ID and Scroll Start props use the
// same element and start, so the seeds begin to fly as the paragraph appears.
const HERO_TRIGGER_SELECTOR = "#community-hero-trigger";
const HERO_TRIGGER_START = "top 80%";

// Each character rises on its own, masked by its line like the homepage
// words (Japanese has no spaces to split words on, and "Ichigo ichi" matches it).
function splitIntoChars(SplitText, element) {
  return SplitText.create(element, {
    type: "lines, chars",
    linesClass: "line",
    charsClass: "char",
    mask: "lines",
  }).chars;
}

function riseDuration(chars) {
  return RISE_DURATION + RISE_STAGGER * Math.max(chars.length - 1, 0);
}

// On the first scroll, "一期一会" and the subhero give way to the paragraph,
// like the homepage hero's second fold. Scrolling back reverses it.
function initHeroSwap({ gsap, kanjiChars, subhero, prefersReducedMotion }) {
  const para = document.querySelector(PARA_SELECTOR);
  const trigger = document.querySelector(HERO_TRIGGER_SELECTOR);

  if (!para || !trigger) return;

  if (!window.ScrollTrigger) {
    console.warn("Community hero swap: ScrollTrigger must load first.");
    return;
  }

  gsap.registerPlugin(window.ScrollTrigger);

  const swapTl = gsap.timeline({ paused: true });

  if (kanjiChars.length) {
    swapTl.to(
      kanjiChars,
      prefersReducedMotion
        ? { opacity: 0, duration: 0.3 }
        : {
            yPercent: 110,
            opacity: 0,
            duration: SWAP_DURATION,
            ease: SOFT_EASE,
            stagger: 0.05,
          },
      0,
    );
  }

  if (subhero) {
    swapTl.to(
      subhero,
      { opacity: 0, duration: SWAP_DURATION * 0.8, ease: SOFT_EASE },
      0,
    );
  }

  swapTl.to(
    para,
    { opacity: 1, duration: SWAP_DURATION * 1.1, ease: SOFT_EASE },
    "-=0.4",
  );

  window.ScrollTrigger.create({
    trigger,
    start: HERO_TRIGGER_START,
    onEnter: () => swapTl.play(),
    onLeaveBack: () => swapTl.reverse(),
  });
}

// "Ichigo ichi" and "一期一会" rise in the way the homepage hero heading does,
// and the subhero fades in halfway through the "Ichigo ichi" rise.
function initCommunityHeroAnimation() {
  const unlockScroll = () => window.BNScroll?.unlock?.();

  if (!window.gsap || !window.SplitText) {
    console.warn("Community hero animation: GSAP and SplitText must load first.");
    onDandelionGrow(unlockScroll);
    return;
  }

  const { gsap, SplitText } = window;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  gsap.registerPlugin(SplitText);

  const title = document.querySelector(TITLE_SELECTOR);
  const kanji = document.querySelector(KANJI_SELECTOR);
  const subhero = document.querySelector(SUBHERO_SELECTOR);

  if (!title && !kanji) {
    onDandelionGrow(unlockScroll);
    return;
  }

  const titleChars = title ? splitIntoChars(SplitText, title) : [];
  const kanjiChars = kanji ? splitIntoChars(SplitText, kanji) : [];
  const chars = [...titleChars, ...kanjiChars];

  if (!prefersReducedMotion) {
    gsap.set(chars, {
      yPercent: 110,
      opacity: 0,
      willChange: "transform, opacity",
    });

    if (subhero) gsap.set(subhero, { opacity: 0 });
  }

  // Armed once the intro has finished, so the two never tween the same
  // characters at once. If the visitor has already scrolled past the trigger,
  // ScrollTrigger plays the swap straight away.
  const armHeroSwap = () =>
    initHeroSwap({ gsap, kanjiChars, subhero, prefersReducedMotion });

  onDandelionGrow(() => {
    unlockScroll();

    if (prefersReducedMotion) {
      armHeroSwap();
      return;
    }

    onPreloaderGone(() => {
      const rise = {
        yPercent: 0,
        opacity: 1,
        duration: RISE_DURATION,
        ease: SOFT_EASE,
        stagger: RISE_STAGGER,
        clearProps: "willChange",
      };
      const tl = gsap.timeline({ onComplete: armHeroSwap });

      if (titleChars.length) tl.to(titleChars, rise, 0);
      if (kanjiChars.length) tl.to(kanjiChars, rise, 0);

      if (subhero) {
        const leadChars = titleChars.length ? titleChars : kanjiChars;

        tl.to(
          subhero,
          {
            opacity: 1,
            duration: SUBHERO_FADE_DURATION,
            ease: SOFT_EASE,
          },
          riseDuration(leadChars) / 2,
        );
      }
    });
  });
}

// Community Moments marquee
//
// The CMS list drifts left on its own and can be dragged or flicked either
// way; a flick coasts and then eases back into the drift. The items are
// cloned so the strip loops without a gap.

const MARQUEE_SELECTOR = "[data-moments-marquee]";
const MARQUEE_LIST_SELECTOR = ".moments_list";
// Drift speed, in px per second (leftwards).
const MARQUEE_SPEED = 40;
// Seconds for a flick to settle back into the drift.
const MARQUEE_SETTLE = 0.8;

function initMomentsMarquee() {
  const marquee = document.querySelector(MARQUEE_SELECTOR);
  const list = marquee?.querySelector(MARQUEE_LIST_SELECTOR);

  if (!marquee || !list || !list.children.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const cruise = prefersReducedMotion ? 0 : -MARQUEE_SPEED;
  const originals = [...list.children];

  let clones = [];
  let loopWidth = 0;
  let x = 0;
  let velocity = cruise;
  let dragging = false;
  let visible = true;
  let lastTime = performance.now();
  let pointerId = null;
  let pointerX = 0;
  let dragSamples = [];

  // One loop is a full set of items plus the gap after the last one. Enough
  // copies are appended to cover the screen while a set scrolls out of view.
  const build = () => {
    clones.forEach((clone) => clone.remove());
    clones = [];

    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    loopWidth = list.scrollWidth + gap;
    if (!loopWidth) return;

    const copies = Math.ceil((window.innerWidth + loopWidth) / loopWidth);
    for (let copy = 0; copy < copies; copy += 1) {
      originals.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        list.appendChild(clone);
        clones.push(clone);
      });
    }
  };

  const wrap = (value) => ((value % loopWidth) - loopWidth) % loopWidth;

  const render = () => {
    list.style.transform = `translate3d(${x}px, 0, 0)`;
  };

  const tick = (now) => {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (!dragging && visible && loopWidth) {
      velocity += (cruise - velocity) * (1 - Math.exp(-dt / MARQUEE_SETTLE));
      x = wrap(x + velocity * dt);
      render();
    }

    requestAnimationFrame(tick);
  };

  marquee.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragging = true;
    pointerId = event.pointerId;
    pointerX = event.clientX;
    dragSamples = [{ x: event.clientX, t: event.timeStamp }];
    marquee.classList.add("is-dragging");
    marquee.setPointerCapture(pointerId);
  });

  marquee.addEventListener("pointermove", (event) => {
    if (!dragging || event.pointerId !== pointerId || !loopWidth) return;

    x = wrap(x + event.clientX - pointerX);
    pointerX = event.clientX;
    render();

    // Keep the last 100ms of movement to read the flick speed on release.
    dragSamples.push({ x: event.clientX, t: event.timeStamp });
    while (dragSamples.length > 2 && event.timeStamp - dragSamples[0].t > 100) {
      dragSamples.shift();
    }
  });

  const release = (event) => {
    if (!dragging || event.pointerId !== pointerId) return;

    dragging = false;
    marquee.classList.remove("is-dragging");

    const first = dragSamples[0];
    const elapsed = (event.timeStamp - first.t) / 1000;
    velocity = elapsed > 0 ? (event.clientX - first.x) / elapsed : cruise;
    lastTime = performance.now();
  };

  marquee.addEventListener("pointerup", release);
  marquee.addEventListener("pointercancel", release);

  // Only run while the marquee is on screen.
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    lastTime = performance.now();
  }).observe(marquee);

  // Tile sizes change across breakpoints, so the loop is rebuilt on resize.
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      x = loopWidth ? wrap(x) : 0;
      render();
    }, 150);
  });

  build();
  render();
  requestAnimationFrame(tick);
}

// Hold the page still while the preloader is up, as the homepage does.
window.BNScroll?.lock?.();

document.addEventListener("DOMContentLoaded", () => {
  window.BNScroll?.lock?.();

  initMomentsMarquee();

  document.fonts.ready.then(() => {
    initCommunityHeroAnimation();
  });
});
