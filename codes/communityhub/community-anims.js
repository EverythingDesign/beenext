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
// preloader is still on screen. Once the shrink is done, Dandelion fades the
// preloader to opacity 0 and then removes it; this runs as that fade begins,
// so the intro starts while the last of the preloader dissolves. Removal is
// the fallback.
function onPreloaderGone(callback) {
  const preloader = document.getElementById(PRELOADER_ID);

  if (!preloader?.parentNode) {
    callback();
    return;
  }

  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    fadeObserver.disconnect();
    removeObserver.disconnect();
    callback();
  };

  const fadeObserver = new MutationObserver(() => {
    if (preloader.style.opacity === "0") run();
  });
  const removeObserver = new MutationObserver(() => {
    if (!preloader.isConnected) run();
  });

  fadeObserver.observe(preloader, { attributes: true, attributeFilter: ["style"] });
  removeObserver.observe(preloader.parentNode, { childList: true });
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

// Every hero move ends at rest, so nothing snaps into place. The scroll swap
// also eases in; the load-in starts moving straight away so it doesn't feel
// late after the preloader.
const SOFT_EASE = "sine.inOut";
const INTRO_EASE = "sine.out";
const RISE_DURATION = 1.1;
const RISE_STAGGER = 0.05;
const SUBHERO_FADE_DURATION = 0.7;
const SWAP_DURATION = 0.9;

// Scoped to #main: the page also keeps a hidden style holder with the
// .community-hero-heading class outside it.
const TITLE_SELECTOR = "#main .community-hero-h1 h1";
// "Ichigo ichi" moves up to the top of this container as the paragraph appears.
const HERO_CONTAINER_SELECTOR = "#main .community-hero-container";
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
function initHeroSwap({ gsap, title, kanjiChars, subhero, prefersReducedMotion }) {
  const para = document.querySelector(PARA_SELECTOR);
  const trigger = document.querySelector(HERO_TRIGGER_SELECTOR);
  const container = document.querySelector(HERO_CONTAINER_SELECTOR);
  // The heading's wrapper moves, so its letters keep their own rise tween.
  const titleBlock = title?.parentElement;

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

  // "Ichigo ichi" rises to the top-left of the container. The distance is
  // measured from where the heading sits in the layout (less any move already
  // applied), and re-measured whenever ScrollTrigger refreshes on resize.
  let titleTween = null;
  if (titleBlock && container) {
    const riseToTop = () => {
      const top = container.getBoundingClientRect().top + parseFloat(getComputedStyle(container).paddingTop);
      const current = gsap.getProperty(titleBlock, "y");
      return top - (titleBlock.getBoundingClientRect().top - current);
    };

    titleTween = gsap.fromTo(
      titleBlock,
      { y: 0 },
      {
        y: riseToTop,
        duration: prefersReducedMotion ? 0.3 : SWAP_DURATION * 1.1,
        ease: SOFT_EASE,
        immediateRender: false,
      },
    );
    swapTl.add(titleTween, 0);
  }

  window.ScrollTrigger.create({
    trigger,
    start: HERO_TRIGGER_START,
    onEnter: () => swapTl.play(),
    onLeaveBack: () => swapTl.reverse(),
  });

  window.ScrollTrigger.addEventListener("refresh", () => {
    if (!titleTween) return;
    titleTween.invalidate();
    swapTl.progress(swapTl.progress());
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
    initHeroSwap({ gsap, title, kanjiChars, subhero, prefersReducedMotion });

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
        ease: INTRO_EASE,
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
            ease: INTRO_EASE,
          },
          riseDuration(leadChars) / 2,
        );
      }
    });
  });
}

// Cycle the desktop collage through the same content reveal as a hover.
// Actual hover or keyboard focus takes priority; smaller screens keep the
// stacked cards and their existing always-visible content.
function initMomentsHoverLoop() {
  const collage = document.querySelector("#main .moments-collage");
  if (!collage) return;

  const cards = ["is-kunal", "is-prashant", "is-sreevathsa", "is-priya"].map(
    (name) => collage.querySelector(`.moments-card.${name}`),
  );
  if (cards.some((card) => !card)) return;

  const desktop = window.matchMedia("(min-width: 992px) and (hover: hover)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const activeClass = "is-auto-active";
  const intervalMs = 2000;
  let inView = false;
  let timer = 0;
  let current = 0;

  // The Webflow page already transitions these layers on hover. The class
  // follows the same opacity rules without changing the manual hover styles.
  const style = document.createElement("style");
  style.textContent = `
    @media screen and (min-width: 992px) and (hover: hover) {
      #main .moments-collage .moments-card.${activeClass} .moments-card_media,
      #main .moments-collage .moments-card.${activeClass} .moments-card_name {
        opacity: 0;
      }
      #main .moments-collage .moments-card.${activeClass} .moments-card_hover {
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  const clearActive = () => cards.forEach((card) => card.classList.remove(activeClass));
  const pause = () => {
    window.clearInterval(timer);
    timer = 0;
    clearActive();
  };
  const interacting = () =>
    cards.some((card) => card.matches(":hover") || card.contains(document.activeElement));
  const canRun = () =>
    desktop.matches && reducedMotion.matches === false && inView &&
    !document.hidden && !interacting();

  const show = (index) => {
    cards.forEach((card, cardIndex) => {
      card.classList.toggle(activeClass, cardIndex === index);
    });
  };
  const update = () => {
    pause();
    if (!canRun()) return;

    current = 0;
    show(current);
    timer = window.setInterval(() => {
      if (!canRun()) {
        pause();
        return;
      }
      current = (current + 1) % cards.length;
      show(current);
    }, intervalMs);
  };

  cards.forEach((card) => {
    card.addEventListener("pointerenter", pause);
    card.addEventListener("pointerleave", update);
    card.addEventListener("focusin", pause);
    card.addEventListener("focusout", () => window.setTimeout(update, 0));
  });
  desktop.addEventListener("change", update);
  reducedMotion.addEventListener("change", update);
  document.addEventListener("visibilitychange", update);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    update();
  }, { threshold: 0.25 }).observe(collage);
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
// Fastest flick, in viewport widths per second. A flick coasts about
// MARQUEE_SETTLE times its speed, so this caps the coast at under two screens.
const MARQUEE_MAX_FLICK = 2;
// Movement in this many ms before release sets the flick speed; a finger held
// still for longer than this lets go without a flick.
const MARQUEE_FLICK_WINDOW_MS = 100;

// Each CMS item is one event, and its photos come from the Event Images field
// through a Collection List nested inside the item. Every photo becomes its own
// tile carrying the event's caption. Items without the nested list keep their
// single Image.
const MOMENT_MEDIA_SELECTOR = ".moments_media";
const MOMENT_EVENT_IMAGES_SELECTOR = ".w-dyn-list img";
const MOMENT_IMAGE_CLASS = "moments_image";
// Photos at least this tall (in px) are cut for the tall Featured tile; the
// rest use the standard tile height. Either way the width follows the photo.
const MOMENT_FEATURED_MIN_HEIGHT = 400;
// Stop waiting for photos that never load and size them as Landscape.
const MOMENT_IMAGE_TIMEOUT_MS = 4000;

function createMomentTile(item, image) {
  const tile = item.cloneNode(true);
  tile.querySelectorAll(".w-dyn-list").forEach((list) => list.remove());

  const photo = image.cloneNode(true);
  photo.className = MOMENT_IMAGE_CLASS;
  // Off-screen tiles must load before the loop is measured.
  photo.loading = "eager";
  photo.draggable = false;
  if (!photo.alt) {
    const event = item.querySelector(".moments_caption p")?.textContent.trim();
    photo.alt = event ? `Community moment at ${event}` : "";
  }

  const media = tile.querySelector(MOMENT_MEDIA_SELECTOR);
  media.replaceChildren(photo);
  return tile;
}

// Lays the photos out in a fixed order that keeps photos of the same event
// apart: each step takes the event with the most photos left, other than the
// event just placed (ties go to the CMS order). The strip loops, so the last
// tile is moved if it would sit next to the first.
function orderMomentTiles(events) {
  const queues = events.map((tiles) => [...tiles]);
  const ordered = [];
  let previous = -1;

  while (queues.some((queue) => queue.length)) {
    let pick = -1;
    queues.forEach((queue, index) => {
      if (!queue.length || index === previous) return;
      if (pick === -1 || queue.length > queues[pick].length) pick = index;
    });
    // Only the event just placed has photos left.
    if (pick === -1) pick = previous;

    ordered.push({ event: pick, tile: queues[pick].shift() });
    previous = pick;
  }

  const count = ordered.length;
  if (count > 2 && ordered[count - 1].event === ordered[0].event) {
    const last = ordered[count - 1];
    for (let index = 1; index < count - 1; index += 1) {
      const fits =
        ordered[index - 1].event !== last.event &&
        ordered[index].event !== last.event &&
        ordered[count - 2].event !== ordered[0].event;
      if (fits) {
        ordered.splice(index, 0, ordered.pop());
        break;
      }
    }
  }

  return ordered.map(({ tile }) => tile);
}

// Replaces the event items with one tile per photo, in display order.
function buildMomentTiles(list) {
  const events = [...list.children].map((item) => {
    const images = [...item.querySelectorAll(MOMENT_EVENT_IMAGES_SELECTOR)];
    if (!images.length) return [item];
    return images.map((image) => createMomentTile(item, image));
  });

  const tiles = orderMomentTiles(events);
  list.replaceChildren(...tiles);
  return tiles;
}

function waitForImage(image) {
  if (image.complete) return Promise.resolve();

  return new Promise((resolve) => {
    const timer = setTimeout(resolve, MOMENT_IMAGE_TIMEOUT_MS);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    image.addEventListener("load", done, { once: true });
    image.addEventListener("error", done, { once: true });
  });
}

// Picks the tile height from the photo's shape and sets the width to match, so
// no photo is cropped. Tiles whose photo has not loaded keep the CMS layout.
function sizeMomentTile(tile) {
  const media = tile.querySelector(MOMENT_MEDIA_SELECTOR);
  const image = media?.querySelector("img");
  if (!image?.naturalWidth || !image.naturalHeight) return;

  media.dataset.layout =
    image.naturalHeight >= MOMENT_FEATURED_MIN_HEIGHT ? "Featured" : "Landscape";
  media.style.width = "";
  const height = media.getBoundingClientRect().height;
  media.style.width = `${(height * image.naturalWidth) / image.naturalHeight}px`;
}

function initMomentsMarquee() {
  const marquee = document.querySelector(MARQUEE_SELECTOR);
  const list = marquee?.querySelector(MARQUEE_LIST_SELECTOR);

  if (!marquee || !list || !list.children.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const cruise = prefersReducedMotion ? 0 : -MARQUEE_SPEED;
  const originals = buildMomentTiles(list);

  let clones = [];
  let loopWidth = 0;
  let x = 0;
  let velocity = cruise;
  let dragging = false;
  let visible = true;
  let frame = 0;
  let lastTime = performance.now();
  let pointerId = null;
  let pointerX = 0;
  let dragSamples = [];

  // One loop is a full set of items plus the gap after the last one. Enough
  // copies are appended to cover the screen while a set scrolls out of view.
  const build = () => {
    clones.forEach((clone) => clone.remove());
    clones = [];
    originals.forEach(sizeMomentTile);

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

    if (!dragging && loopWidth) {
      velocity += (cruise - velocity) * (1 - Math.exp(-dt / MARQUEE_SETTLE));
      x = wrap(x + velocity * dt);
      render();
    }

    // Off screen the loop stops entirely; the observer below restarts it.
    frame = visible ? requestAnimationFrame(tick) : 0;
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

    // Keep the recent movement to read the flick speed on release.
    dragSamples.push({ x: event.clientX, t: event.timeStamp });
    while (
      dragSamples.length > 2 &&
      event.timeStamp - dragSamples[0].t > MARQUEE_FLICK_WINDOW_MS
    ) {
      dragSamples.shift();
    }
  });

  // The flick speed comes from the drag samples only, never the release
  // event's own position, and is capped so a short, sharp swipe cannot send
  // the strip several screens.
  const flickVelocity = (releaseTime) => {
    const last = dragSamples[dragSamples.length - 1];
    if (releaseTime - last.t > MARQUEE_FLICK_WINDOW_MS) return 0;

    const recent = dragSamples.filter(
      (sample) => releaseTime - sample.t <= MARQUEE_FLICK_WINDOW_MS,
    );
    const first = recent.length > 1 ? recent[0] : dragSamples[0];
    const elapsed = (last.t - first.t) / 1000;
    if (elapsed <= 0) return 0;

    const max = window.innerWidth * MARQUEE_MAX_FLICK;
    return Math.max(-max, Math.min(max, (last.x - first.x) / elapsed));
  };

  const endDrag = (event, flick) => {
    if (!dragging || event.pointerId !== pointerId) return;

    dragging = false;
    marquee.classList.remove("is-dragging");
    // From rest, the strip eases back into the drift.
    velocity = flick ? flickVelocity(event.timeStamp) : 0;
    lastTime = performance.now();
  };

  marquee.addEventListener("pointerup", (event) => endDrag(event, true));
  // On touch, a swipe that turns vertical is handed to the page scroll and the
  // pointer is cancelled. Some browsers report the cancel at 0,0, so it must
  // not count as a flick.
  marquee.addEventListener("pointercancel", (event) => endDrag(event, false));

  // Only run while the marquee is on screen.
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
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
  frame = requestAnimationFrame(tick);

  // Tile widths come from the photos, so measure the loop again once they load.
  const images = originals.flatMap((tile) => [...tile.querySelectorAll("img")]);
  Promise.all(images.map(waitForImage)).then(() => {
    build();
    x = loopWidth ? wrap(x) : 0;
    render();
  });
}

// Falling seeds (#about-community)
//
// The seeds in the section's background layer carry on the fall from the hero
// above, the way a dandelion seed comes down: slowly, hanging under its tuft,
// swinging from side to side and tilting with each swing, a little slower at
// the ends of the swing. Seeds only ever fall.
//
// While the join between the two sections is on screen, a seed only comes in
// when the hero's Dandelion hands one off (`dandelion:seedfall`): a waiting
// seed takes over at the same spot and speed, fading in as the hero's fades
// out. Further down, with the join scrolled away, seeds come back in from
// above on their own. Each starts from where it sits in Webflow. The hero lets
// seeds go faster than six can fall through, so each seed is copied once as a
// stand-in that only ever carries on a seed from the hero. Only transforms and
// opacity are animated; size and placement stay in Webflow.

const FALLING_SEEDS_SELECTOR = "[data-falling-seeds]";
const FALLING_SEED_SELECTOR = ".falling-seed";
const DANDELION_SEED_FALL_EVENT = "dandelion:seedfall";
// Fall speed, in viewport heights per second, matching the hero's seeds.
const SEED_FALL_SPEED = [0.045, 0.07];
// Side-to-side swing: px each way, and seconds per full swing.
const SEED_SWAY = [16, 34];
const SEED_SWAY_PERIOD = [4.5, 7];
// Tilt, in degrees each way, at the ends of the swing.
const SEED_TILT = [8, 16];
// Fraction of the layer height over which an entering seed fades in.
const SEED_FADE_IN = 0.12;
// Seconds a seed waits above the section before coming back on its own.
const SEED_RETURN_WAIT = [2, 9];

function initFallingSeeds() {
  const layer = document.querySelector(FALLING_SEEDS_SELECTOR);
  const originals = layer ? [...layer.querySelectorAll(FALLING_SEED_SELECTOR)] : [];

  if (!originals.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const standIns = originals.map((original) => {
    const copy = original.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.style.opacity = "0";
    original.after(copy);
    return copy;
  });
  const elements = [...originals, ...standIns];

  // Stable per-seed variety from its index, so a reload looks the same.
  const pick = ([min, max], index, salt) =>
    min + (max - min) * ((Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453) % 1 + 1) % 1;

  const seeds = elements.map((element, index) => ({
    element,
    standIn: index >= originals.length,
    fallSpeed: pick(SEED_FALL_SPEED, index, 1),
    sway: pick(SEED_SWAY, index, 2),
    swayPeriod: pick(SEED_SWAY_PERIOD, index, 3),
    tilt: pick(SEED_TILT, index, 4),
    phase: pick([0, Math.PI * 2], index, 5),
    wait: pick(SEED_RETURN_WAIT, index, 6),
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    // Each starts falling from its place in the Webflow layout; stand-ins wait.
    falling: index < originals.length,
    speed: 0,
    x: 0,
    y: 0,
    returnAt: 0,
  }));

  let layerHeight = 0;
  let visible = false;
  let frame = 0;
  let lastTime = 0;
  let clock = 0;

  const swingOf = (seed) =>
    Math.sin((clock / seed.swayPeriod) * Math.PI * 2 + seed.phase);
  const marginOf = (seed) => seed.height * 0.5;

  // Placement comes from Webflow; read it back whenever the layout changes.
  const measure = () => {
    layerHeight = layer.clientHeight;
    seeds.forEach((seed) => {
      seed.left = seed.element.offsetLeft;
      seed.top = seed.element.offsetTop;
      seed.width = seed.element.offsetWidth;
      seed.height = seed.element.offsetHeight;
      if (!seed.speed) seed.speed = seed.fallSpeed * window.innerHeight;
    });
  };

  const render = () => {
    seeds.forEach((seed) => {
      const swing = swingOf(seed);
      const x = seed.x + swing * seed.sway;
      const tilt = -swing * seed.tilt;
      const enter = (seed.top + seed.y + seed.height) / (layerHeight * SEED_FADE_IN);
      const opacity = seed.falling ? Math.min(Math.max(enter, 0), 1) : 0;

      seed.element.style.transform = `translate3d(${x}px, ${seed.y}px, 0) rotate(${tilt}deg)`;
      seed.element.style.opacity = opacity;
    });
  };

  // The join with the hero is on screen while the top of this layer is.
  const joinInView = () => layer.getBoundingClientRect().top >= 0;

  const tick = (now) => {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    clock += dt;

    const handOffsOnly = joinInView();

    seeds.forEach((seed) => {
      if (seed.falling) {
        // Slower at the ends of the swing, where the tuft catches the air.
        const swing = Math.cos((clock / seed.swayPeriod) * Math.PI * 4 + seed.phase * 2);
        seed.y += seed.speed * (1 + 0.3 * swing) * dt;

        // Fully below the section: wait above it for the next turn.
        if (seed.top + seed.y > layerHeight + marginOf(seed)) {
          seed.falling = false;
          seed.returnAt = clock + seed.wait;
        }
      } else if (!seed.standIn && !handOffsOnly && clock >= seed.returnAt) {
        // Back in from above the section, at its own place and pace.
        seed.falling = true;
        seed.x = 0;
        seed.y = -(seed.top + seed.height + marginOf(seed));
        seed.speed = seed.fallSpeed * window.innerHeight;
      }
    });
    render();

    frame = visible ? requestAnimationFrame(tick) : 0;
  };

  // A seed leaving the hero: the longest-waiting seed here carries it on from
  // the same spot (centred on it) at the same speed.
  window.addEventListener(DANDELION_SEED_FALL_EVENT, ({ detail }) => {
    if (!visible) return;

    const rect = layer.getBoundingClientRect();
    if (detail.x < rect.left || detail.x > rect.right) return;

    const seed = seeds
      .filter((candidate) => !candidate.falling)
      .sort((a, b) => a.returnAt - b.returnAt)[0];
    if (!seed) return;

    seed.falling = true;
    seed.speed = detail.speed;
    seed.x = detail.x - rect.left - seed.left - seed.width / 2 - swingOf(seed) * seed.sway;
    seed.y = detail.y - rect.top - seed.top - seed.height / 2;
  });

  // Only run while the section is on screen.
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }).observe(layer);

  new ResizeObserver(() => {
    measure();
    render();
  }).observe(layer);

  measure();
  render();
}

// Hold the page still while the preloader is up, as the homepage does.
window.BNScroll?.lock?.();

document.addEventListener("DOMContentLoaded", () => {
  window.BNScroll?.lock?.();

  initMomentsMarquee();
  initMomentsHoverLoop();
  initFallingSeeds();

  document.fonts.ready.then(() => {
    initCommunityHeroAnimation();
  });
});
