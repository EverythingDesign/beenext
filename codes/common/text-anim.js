function initSectionTextAnimation() {
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

  document.querySelectorAll("[section-heading]").forEach((sectionHeading) => {
    const headingWords = sectionHeading.querySelectorAll(".word");

    if (!headingWords.length) return;

    if (prefersReducedMotion) {
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
  });
  document.querySelectorAll("[section-eyebrow]").forEach((sectionEyebrow) => {
    const eyebrowChars = sectionEyebrow.querySelectorAll(".char");

    if (!eyebrowChars.length) return;

    if (prefersReducedMotion) {
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

    if (sectionEyebrow) {
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
  });
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

document.addEventListener("DOMContentLoaded", () => {
    document.fonts.ready.then(() => {
        initSectionTextAnimation();
        initSectionBlockAnimation();
    })
});
