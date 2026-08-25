function initFooterCtaAnimation() {
  const footerCta = document.querySelector("#footer-cta");
  if (!footerCta || !window.gsap || !window.ScrollTrigger) return;

  const sky = footerCta.querySelector("[footer-cta-sky]");
  const mountain = footerCta.querySelector("[footer-cta-mountain]");
  const backgroundSlot = footerCta.querySelector(".u-background-slot");

  if (!sky || !mountain) return;
  if (footerCta.dataset.parallaxInitialized === "true") return;

  footerCta.dataset.parallaxInitialized = "true";

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  if (backgroundSlot) {
    backgroundSlot.style.overflow = "hidden";
  }

  // Keep the oversized parallax layers clipped to the footer. The extra
  // scale provides enough bleed so their edges never enter the viewport.
  gsap.set([sky, mountain], {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set([sky, mountain], {
      yPercent: 0,
      scale: 1,
    });
    return;
  }

  gsap.set([sky, mountain], {
    transformOrigin: "center center",
    willChange: "transform",
  });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: footerCta,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    })
    .fromTo(
      sky,
      {
        yPercent: 3,
        scale: 1.16,
      },
      {
        yPercent: -3,
        scale: 1.16,
        duration: 1,
        ease: "none",
      },
      0,
    )
    .fromTo(
      mountain,
      {
        yPercent: 8,
        scale: 1.3,
      },
      {
        yPercent: -8,
        scale: 1.3,
        duration: 1,
        ease: "none",
      },
      0,
    );
}

function initFooterLinksAnimation() {
  const footer = document.querySelector("#footer");
  if (!footer || !window.gsap || !window.ScrollTrigger) return;

  const footerHeading = footer.querySelectorAll("[footer-heading]");
  const linkWords = footer.querySelectorAll(".footer_link_text .word");

  if (!footerHeading || !linkWords.length) return;
  if (footer.dataset.linksAnimationInitialized === "true") return;

  footer.dataset.linksAnimationInitialized = "true";

  const { gsap, ScrollTrigger } = window;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  gsap.registerPlugin(ScrollTrigger);

  if (prefersReducedMotion) {
    gsap.set(footerHeading, { opacity: 1 });
    gsap.set(linkWords, { yPercent: 0, opacity: 1 });
    return;
  }

  gsap.set(linkWords, {
    yPercent: 110,
    opacity: 0,
    willChange: "transform, opacity",
  });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: footer,
        start: "top 80%",
        end: "top 20%",
        scrub: true,
      },
    })
    .to(footerHeading, {
      opacity: 1,
      duration: 0.5,
      stagger: 0.06,
      ease: "power2.out",
    },"0")
    .to(linkWords, {
      yPercent: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power4.out",
      stagger: 0.06,
    },"0");
}

function initializeFooterCtaAnimation() {
  const fontsReady = document.fonts?.ready || Promise.resolve();
  fontsReady.then(() => {
    initFooterCtaAnimation();
    initFooterLinksAnimation();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeFooterCtaAnimation, {
    once: true,
  });
} else {
  initializeFooterCtaAnimation();
}
