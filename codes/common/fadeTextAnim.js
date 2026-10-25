// Fade In Text Animation
//
// Fades in the SplitText characters of a section's [fade-text] element as the
// section scrolls through. Each page's text splitter splits "[fade-text] p" into
// .char spans and sets them to x: -16, opacity: 0; this script waits for them.
// The trigger is the section itself. #about-community is a short section, so
// it starts as soon as it enters and finishes once it is fully on screen.
const FADE_TEXT_SECTIONS = [
  { section: "#innovation-stories", start: "top 30%", end: "bottom bottom" },
  { section: "#about-community", start: "top 90%", end: "bottom bottom" },
];

function initSectionTextFade({
  section: sectionSelector,
  trigger: triggerSelector = sectionSelector,
  start,
  end,
}) {
  const section = document.querySelector(sectionSelector);
  const fadeText = section?.querySelector("[fade-text]");
  const trigger = document.querySelector(triggerSelector);

  if (!section || !fadeText || !trigger) return;

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn(
      `Fade text animation (${sectionSelector}): GSAP and ScrollTrigger must load first.`,
    );
    return;
  }

  const { gsap, ScrollTrigger } = window;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  gsap.registerPlugin(ScrollTrigger);

  function setupAnimation(attempt = 0) {
    const characters = Array.from(fadeText.querySelectorAll(".char"));

    if (!characters.length) {
      if (attempt >= 120) {
        console.warn(
          `Fade text animation (${sectionSelector}): SplitText characters were not found.`,
        );
        return;
      }

      requestAnimationFrame(() => setupAnimation(attempt + 1));
      return;
    }

    if (prefersReducedMotion) {
      gsap.set(characters, { x: 0, opacity: 1 });
      return;
    }

    gsap.to(
      characters,
      {
        x: 0,
        opacity: 1,
        ease: "none",
        stagger: 0.015,
        scrollTrigger: {
          trigger,
          start,
          end,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      },
    );
  }

  setupAnimation();
}

document.addEventListener("DOMContentLoaded", () => {
  document.fonts.ready.then(() => {
    FADE_TEXT_SECTIONS.forEach((config) => initSectionTextFade(config));
  })
})
