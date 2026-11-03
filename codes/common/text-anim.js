// Section headings ([section-heading]) and eyebrows ([section-eyebrow])
// animate in as they scroll into view. Each page's text splitter splits them
// into .word / .char spans. A splitter may split some of them later, when
// their section comes near; it then sends a "bn:split" event from the element
// it split, and that element is set up then. Each element is set up once.
const initializedSectionText = new WeakSet();

function prefersReducedTextMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initSectionHeading(sectionHeading) {
  if (initializedSectionText.has(sectionHeading)) return;

  const headingWords = sectionHeading.querySelectorAll(".word");

  if (!headingWords.length) return;

  initializedSectionText.add(sectionHeading);

  if (prefersReducedTextMotion()) {
    gsap.set(headingWords, { yPercent: 0, opacity: 1 });
    return;
  }

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: sectionHeading,
      start: "top 85%",
      end: "top 70%",
      scrub: 1.2,
    },
  });

  timeline.to(
    headingWords,
    {
      yPercent: 0,
      opacity: 1,
      duration: 1,
      ease: "power4.out",
      stagger: 0.06,
    },
  );
}

function initSectionEyebrow(sectionEyebrow) {
  if (initializedSectionText.has(sectionEyebrow)) return;

  const eyebrowChars = sectionEyebrow.querySelectorAll(".char");

  if (!eyebrowChars.length) return;

  initializedSectionText.add(sectionEyebrow);

  if (prefersReducedTextMotion()) {
    gsap.set(eyebrowChars, { opacity: 1 });
    return;
  }

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: sectionEyebrow,
      start: "top 85%",
      end: "top 70%",
      scrub: 1.2,
      // toggleActions: "play none none reverse",
    },
  });

  timeline
    .to(sectionEyebrow, {
      x: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
    })
    .to(
      eyebrowChars,
      {
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        stagger: 0.02,
      },
      "<0.15",
    );
}

function initSectionTextAnimation() {
  if (!window.gsap || !window.ScrollTrigger) {
    console.warn(
      "Section text animation: GSAP and ScrollTrigger must load first.",
    );
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll("[section-heading]").forEach(initSectionHeading);
  document.querySelectorAll("[section-eyebrow]").forEach(initSectionEyebrow);
}

function initSectionBlockAnimation(){
    if (!window.gsap || !window.ScrollTrigger) {
    console.warn(
      "Section text animation: GSAP and ScrollTrigger must load first.",
    );
    return;
  }

  const { gsap, ScrollTrigger } = window;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll("[section-block]").forEach((sectionBlock) => {
    if (prefersReducedMotion) {
      gsap.set(sectionBlock, { opacity: 1 });
      return;
    }

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionBlock,
        start: "top 90%",
        end: "top center",
        scrub: 1.2,
      },
    });
    timeline.from(sectionBlock, {
        opacity: 0,
        yPercent: 10,
        duration: 1,
        ease: "power3.out",
    });
  })
}

// Text split later by the page's splitter (see the top of this file).
document.addEventListener("bn:split", (event) => {
  const target = event.detail?.target;

  if (!target || !window.gsap || !window.ScrollTrigger) return;

  const sectionHeading = target.closest("[section-heading]");
  const sectionEyebrow = target.closest("[section-eyebrow]");

  if (sectionHeading) initSectionHeading(sectionHeading);
  if (sectionEyebrow) initSectionEyebrow(sectionEyebrow);
});

document.addEventListener("DOMContentLoaded", () => {
    document.fonts.ready.then(() => {
        initSectionTextAnimation();
        initSectionBlockAnimation();
    })
});
