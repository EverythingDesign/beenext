// Fade In Text Animation
function initInnovationStoryTextFade(triggerName) {
  const section = document.querySelector("#innovation-stories");
  const fadeText = section?.querySelector("[fade-text]");
  const trigger = document.querySelector(triggerName);

  if (!section || !fadeText || !trigger) return;

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn(
      "Innovation story text animation: GSAP and ScrollTrigger must load first.",
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
          "Innovation story text animation: SplitText characters were not found.",
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
          start: "top 30%",
          end: "bottom bottom",
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
    initInnovationStoryTextFade("#innovation-stories");
  })
})

