// Bee Track Animation
(function initBeeTrackAnimation() {
  const bee = document.querySelector(".big-bee");
  const svg = document.querySelector("#bee-track");
  const path = svg?.querySelector("path");
  const trigger = document.querySelector(".bee-track-trigger");
  const horizontalInner = document.querySelector(".home_horizontal_inner");

  if (!bee || !svg || !path || !trigger) {
    console.warn("Bee track animation: required Webflow elements were not found.");
    return;
  }

  if (!window.gsap || !window.ScrollTrigger || !window.MotionPathPlugin) {
    console.warn(
      "Bee track animation: GSAP, ScrollTrigger, and MotionPathPlugin must load first.",
    );
    return;
  }

  const { gsap, ScrollTrigger, MotionPathPlugin } = window;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  const media = gsap.matchMedia();

  media.add("(min-width: 768px)", () => {
    if (horizontalInner && !prefersReducedMotion) {
      gsap.to(horizontalInner, {
        x: () => {
          const currentX = Number(gsap.getProperty(horizontalInner, "x")) || 0;
          const right = horizontalInner.getBoundingClientRect().right;

          return currentX + window.innerWidth - right;
        },
        ease: "none",
        scrollTrigger: {
          trigger,
          start: "top 90%",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }

    gsap.set(bee, {
      position: "absolute",
      top: 0,
      left: 0,
      transformOrigin: "50% 50%",
      willChange: "transform",
    });

    if (prefersReducedMotion) return;

    const tween = gsap.to(bee, {
      motionPath: {
        path,
        align: path,
        alignOrigin: [0.5, 0.5],
        autoRotate: true,
        start: 0,
        end: 1,
      },
      ease: "none",
      scrollTrigger: {
        trigger,
        start: "top bottom",
        end: "top top",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

//   window.KandouBeeTrack = tween;
  });

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
})();

function initBeliefSystemTextAnimation() {
  const mountain = document.querySelector(".mountain-img-wrap");
  const mountainStartY = mountain
    ? Number(gsap.getProperty(mountain, "yPercent")) || 0
    : 0;
  const mountainMotion = {
    beliefOffset: 0,
    cardOffset: 0,
  };

  function renderMountainPosition() {
    if (!mountain) return;

    gsap.set(mountain, {
      yPercent:
        mountainStartY +
        mountainMotion.beliefOffset +
        mountainMotion.cardOffset,
    });
  }
  const beliefTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".belief-system-section",
      start: "top 80%",
      end: "top top",
      scrub: 1.2
    },
  });
  beliefTimeline
  .to(
    "[eyebrow-text]",
    {
      x: 0,
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
    },
  )
  .to(
    "[eyebrow-text] .char",
    {
      opacity: 1,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.02,
    },
    "0.15",
  )
  .to(
    "[heading-text]",
    {
      x: 0,
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
    },
    0.15,
  )
  .to(
    "[heading-text] .char",
    {
      opacity: 1,
      duration: 0.6,
      ease: "power3.out",
      stagger: 0.02,
    },
    "<0.15",
  )
  .from(
    ".belief_heading p .word",
    {
      yPercent: 110,
      opacity: 0,
      duration: 1,
      ease: "power4.out",
      stagger: 0.06,
    }
  )
  .to(
    mountainMotion,
    {
      beliefOffset: -50,
      duration: 1,
      ease: "none",
      onUpdate: renderMountainPosition,
    },"<0.8"
  )
  const beliefSystemTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".belief-system-trigger",
      start: "top 95%",
      toggleActions: "play none none reverse",
    },
  });

  beliefSystemTimeline
  .to(mountainMotion, {
      cardOffset: -20,
      duration: 1,
      ease: "none",
      onUpdate: renderMountainPosition,
  })
  .to(".mountain-img-wrap",{
      filter: "grayscale(100%)",
      duration: 1,
      ease: "none",
  }, "<")
  .to(
    ".belief_heading",
    {
      opacity: 0.15,
      duration: 1,
      ease: "power4.out",
    },"<"
  )
  .from(".belief-card",{
      opacity: 0,
      stagger: 0.2,
      duration: 0.5,
      ease: "none",
  })
  
}
document.addEventListener("DOMContentLoaded", () => {
  initBeliefSystemTextAnimation();
})


// Open founder note
function openFounderNote() {
  const founderNote = document.querySelector(".founder_note_fixed");
  const founderNoteTrigger = document.querySelector("[open-founder-note]");
  const founderNoteClose = document.querySelectorAll("[close-founder-note]");
  const founderNoteInner = founderNote?.querySelector(".founder_note_inner");

  if (!founderNote || !founderNoteTrigger || !founderNoteInner) return;

  let isOpen = false;
  let openFrame = null;
  let closeTimer = null;

  function open() {
    if (isOpen) return;

    isOpen = true;
    clearTimeout(closeTimer);
    closeTimer = null;

    founderNote.style.display = "block";
    lenis.stop();
    AudioManager.playSfx("founderOpen");

    openFrame = requestAnimationFrame(() => {
      openFrame = null;
      if (!isOpen) return;

      founderNoteInner.classList.add("is-open");
    });
  }

  function close() {
    if (!isOpen) return;

    isOpen = false;

    if (openFrame !== null) {
      cancelAnimationFrame(openFrame);
      openFrame = null;
    }

    founderNoteInner.classList.remove("is-open");
    AudioManager.playSfx("founderClose");

    closeTimer = setTimeout(() => {
      closeTimer = null;
      if (isOpen) return;

      founderNote.style.display = "none";
      lenis.start();
    }, 400);
  }

  founderNoteTrigger.addEventListener("click", open);
  founderNoteClose.forEach((closeBtn) => {
    closeBtn.addEventListener("click", close);
  });
}

openFounderNote();

// The Belief System Section (Card Accordion)
function initBeliefCardAccordion() {
  const beliefCards = [...document.querySelectorAll(".belief-card")];

  function closeCard(card) {
    const outer = card.querySelector(".card_dd_outer");
    if (!outer) return;

    card.classList.remove("is-open");
    outer.style.height = "0px";
  }

  function openCard(card) {
    const inner = card.querySelector(".card_dd_inner");
    const outer = card.querySelector(".card_dd_outer");

    if (!inner || !outer) return;

    card.classList.add("is-open");
    outer.style.height = `${inner.scrollHeight}px`;
  }

  beliefCards.forEach((beliefCard) => {
    const outer = beliefCard.querySelector(".card_dd_outer");
    if (!outer) return;

    outer.style.height = beliefCard.classList.contains("is-open")
      ? `${outer.querySelector(".card_dd_inner").scrollHeight}px`
      : "0px";

    beliefCard.addEventListener("click", () => {
      const wasOpen = beliefCard.classList.contains("is-open");

      beliefCards.forEach(closeCard);

      // Clicking the open card closes it; otherwise open the clicked card.
      if (!wasOpen) {
        openCard(beliefCard);
      }
    });
  });
}

initBeliefCardAccordion();

// Bee Network mobile slider and desktop click sequence
function initBeeNetworkAnimation() {
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  if (isMobile) {
    const slider = document.querySelector(".network-effect_swiper");
    if (!slider) return;

    if (!window.Swiper) {
      console.warn("Bee network slider: Swiper must load first.");
      return;
    }

    const sliderWrap = slider.closest(".network-effect_swiper_wrap");
    new window.Swiper(slider, {
      slidesPerView: 1,
      spaceBetween: 8,
      speed: 500,
      watchOverflow: true,
      pagination: {
        el: sliderWrap?.querySelector(".swiper-pagination"),
        clickable: true,
        type: 'fraction',
      },
      navigation: {
        prevEl: sliderWrap?.querySelector(".chevron-arrow_previous"),
        nextEl: sliderWrap?.querySelector(".chevron-arrow_next"),
      },
      breakpoints: {
        480: {
          slidesPerView: 1.5,
          spaceBetween: 8,
        },
      },
    });

    return;
  }

  if (!window.gsap) {
    console.warn("Bee network animation: GSAP must load first.");
    return;
  }

  const { gsap } = window;
  const buttons = [
    document.querySelector("#bee-network-1"),
    document.querySelector("#bee-network-2"),
    document.querySelector("#bee-network-3"),
  ].filter(Boolean);

  if (!buttons.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const svgNamespace = "http://www.w3.org/2000/svg";

  function createLineReveal(path, index) {
    const svg = path?.ownerSVGElement;
    if (!svg) return null;

    const maskId = `bee-network-line-mask-${index + 1}`;
    let defs = svg.querySelector("defs[data-bee-network-line-defs]");

    if (!defs) {
      defs = document.createElementNS(svgNamespace, "defs");
      defs.dataset.beeNetworkLineDefs = "";
      svg.insertBefore(defs, svg.firstChild);
    }

    const oldMask = defs.querySelector(`#${maskId}`);
    oldMask?.remove();

    const mask = document.createElementNS(svgNamespace, "mask");
    const revealPath = path.cloneNode(false);

    mask.id = maskId;
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    mask.setAttribute("x", "-20%");
    mask.setAttribute("y", "-20%");
    mask.setAttribute("width", "140%");
    mask.setAttribute("height", "140%");

    revealPath.removeAttribute("mask");
    revealPath.removeAttribute("stroke-dasharray");
    revealPath.setAttribute("fill", "none");
    revealPath.setAttribute("stroke", "white");
    revealPath.setAttribute("stroke-width", "4");
    revealPath.setAttribute("stroke-linecap", "round");

    mask.appendChild(revealPath);
    defs.appendChild(mask);
    path.setAttribute("mask", `url(#${maskId})`);

    const length = revealPath.getTotalLength();
    gsap.set(revealPath, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    return { revealPath, length };
  }

  const items = buttons
    .map((button, index) => {
      const wrapper = button.closest(".network-btn_wrap");
      const contentOuter = wrapper?.querySelector(".network_content_outer");
      const connectedContent = wrapper?.querySelector(
        ".connected_content_wrap",
      );
      const linePath = wrapper?.querySelector(".line-connector-svg svg path");

      if (!wrapper || !contentOuter || !connectedContent || !linePath) {
        console.warn(
          `Bee network animation: required content is missing for #${button.id}.`,
        );
        return null;
      }

      return {
        button,
        wrapper,
        contentOuter,
        connectedContent,
        lineReveal: createLineReveal(linePath, index),
      };
    })
    .filter(Boolean);

  if (!items.length) return;

  function resetItem(item) {
    item.wrapper.classList.remove("is-active");
    item.button.setAttribute("aria-expanded", "false");
    item.button.style.animation = "hovef03 0.8s step-end infinite";

    gsap.set(item.contentOuter, {
      autoAlpha: 0,
      scale: 0.9,
      transformOrigin: "50% 50%",
    });
    gsap.set(item.connectedContent, {
      autoAlpha: 0,
      x: -10,
      transformOrigin: "50% 50%",
    });

    if (item.lineReveal) {
      gsap.set(item.lineReveal.revealPath, {
        strokeDashoffset: item.lineReveal.length,
      });
    }
  }

  items.forEach(resetItem);

  let activeTimeline = null;

  items.forEach((item) => {
    item.button.addEventListener("click", () => {
      activeTimeline?.kill();
      items.forEach(resetItem);

      item.wrapper.classList.add("is-active");
      item.button.setAttribute("aria-expanded", "true");

      if (prefersReducedMotion) {
        gsap.set(item.contentOuter, { autoAlpha: 1, scale: 1 });
        gsap.set(item.connectedContent, {
          autoAlpha: 1,
          x: 0,
          scale: 1,
        });

        if (item.lineReveal) {
          gsap.set(item.lineReveal.revealPath, { strokeDashoffset: 0 });
        }

        return;
      }

      // Force a reflow so the CSS sprite animation restarts on every click.
      void item.button.offsetWidth;
      item.button.style.animation =
        "flower-bee-loop 0.3s step-end forwards";

      activeTimeline = gsap.timeline();

      activeTimeline.to(
        item.contentOuter,
        {
          autoAlpha: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
        },
        0.2,
      );

      if (item.lineReveal) {
        activeTimeline.to(item.lineReveal.revealPath, {
          strokeDashoffset: 0,
          duration: 0.8,
          ease: "power2.inOut",
        }, "<");
      }

      activeTimeline.to(item.connectedContent, {
        autoAlpha: 1,
        x: 0,
        duration: 1,
        ease: "power3.out",
      }, "<0.5");
    });
  });
}

initBeeNetworkAnimation();

function initCommunityAnimation() {
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  if (isMobile) {
    const communitySlider = document.querySelector(".community-grid.swiper");
    if (!communitySlider) return;

    if (!window.Swiper) {
      console.warn("Community slider: Swiper must load first.");
      return;
    }

    const nestedImageSliders = [];

    communitySlider
      .querySelectorAll(".community-img-outer-wrap.swiper-slide")
      .forEach((communitySlide) => {
        // communitySlide.style.opacity = "1";

        const imageSlides = Array.from(communitySlide.children).filter(
          (child) => child.classList.contains("community-img-wrap"),
        );

        if (imageSlides.length < 2) return;

        const imageSlider = document.createElement("div");
        const imageSliderWrapper = document.createElement("div");
        const pagination = communitySlide.querySelector(".swiper-pagination");

        imageSlider.classList.add("community-image-swiper", "swiper");
        imageSliderWrapper.classList.add(
          "community-image-swiper_inner",
          "swiper-wrapper",
        );

        Object.assign(imageSlider.style, {
          position: "relative",
          width: "100%",
          overflow: "hidden",
          touchAction: "pan-y",
        });

        Object.assign(imageSliderWrapper.style, {
          position: "relative",
          display: "flex",
          width: "100%",
          transitionProperty: "transform",
        });

        communitySlide.insertBefore(imageSlider, imageSlides[0]);
        imageSlider.appendChild(imageSliderWrapper);

        imageSlides.forEach((imageSlide) => {
          imageSlide.classList.add("swiper-slide");
          Object.assign(imageSlide.style, {
            position: "relative",
            inset: "auto",
            flex: "0 0 100%",
            width: "100%",
            transitionProperty: "opacity",
          });
          imageSliderWrapper.appendChild(imageSlide);
        });

        const progressFills = [];

        if (pagination) {
          pagination.classList.add("community-image-pagination");
          pagination.replaceChildren();
          Object.assign(pagination.style, {
            display: "flex",
            gap: "0.5rem",
            width: "100%",
          });

          imageSlides.forEach(() => {
            const progressSegment = document.createElement("span");
            const progressFill = document.createElement("span");

            progressSegment.classList.add(
              "community-image-progress_segment",
            );
            progressFill.classList.add("community-image-progress_fill");

            Object.assign(progressSegment.style, {
              flex: "1",
              height: "0.25rem",
              overflow: "hidden",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.35)",
            });

            Object.assign(progressFill.style, {
              display: "block",
              width: "100%",
              height: "100%",
              borderRadius: "inherit",
              background: "currentColor",
              transform: "scaleX(0)",
              transformOrigin: "left center",
            });

            progressSegment.appendChild(progressFill);
            pagination.appendChild(progressSegment);
            progressFills.push(progressFill);
          });
        }

        nestedImageSliders.push({
          communitySlide,
          imageSlider,
          progressFills,
        });
      });

    const communitySwiper = new window.Swiper(communitySlider, {
      spaceBetween: 8,
      slidesPerView: 1,
      speed: 500,
      watchOverflow: true,
    });

    const imageAutoplayDelay = 5000;

    function resetImageProgress(swiper, progressFills) {
      progressFills.forEach((progressFill, index) => {
        progressFill.getAnimations().forEach((animation) => {
          animation.cancel();
        });
        progressFill.style.transform =
          index < swiper.realIndex ? "scaleX(1)" : "scaleX(0)";
      });
    }

    function updateImageProgress(swiper, progressFills) {
      resetImageProgress(swiper, progressFills);

      progressFills[swiper.realIndex]?.animate(
        [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
        {
          duration: imageAutoplayDelay,
          easing: "linear",
          fill: "forwards",
        },
      );
    }

    const nestedSwiperInstances = nestedImageSliders.map(
      ({ communitySlide, imageSlider, progressFills }) => {
        const imageSwiper = new window.Swiper(imageSlider, {
          slidesPerView: 1,
          effect: "fade",
          fadeEffect: {
            crossFade: true,
          },
          loop: true,
          nested: true,
          observer: true,
          observeParents: true,
          speed: 600,
          autoplay: {
            enabled: false,
            delay: imageAutoplayDelay,
            disableOnInteraction: false,
          },
        });

        imageSwiper.autoplay.stop();
        resetImageProgress(imageSwiper, progressFills);

        imageSwiper.on("realIndexChange", () => {
          const activeParentSlide =
            communitySwiper.slides[communitySwiper.activeIndex];

          if (communitySlide === activeParentSlide) {
            updateImageProgress(imageSwiper, progressFills);
          }
        });

        return {
          communitySlide,
          imageSwiper,
          progressFills,
          isParentActive: false,
        };
      },
    );

    function syncNestedAutoplay() {
      const activeParentSlide =
        communitySwiper.slides[communitySwiper.activeIndex];

      nestedSwiperInstances.forEach(
        (nestedSwiperInstance) => {
          const { communitySlide, imageSwiper, progressFills } =
            nestedSwiperInstance;
          const isParentActive = communitySlide === activeParentSlide;

          if (nestedSwiperInstance.isParentActive === isParentActive) return;

          nestedSwiperInstance.isParentActive = isParentActive;

          if (isParentActive) {
            imageSwiper.params.autoplay.enabled = true;
            imageSwiper.autoplay.start();
            updateImageProgress(imageSwiper, progressFills);
          } else {
            imageSwiper.params.autoplay.enabled = false;
            imageSwiper.autoplay.stop();
            resetImageProgress(imageSwiper, progressFills);
          }
        },
      );
    }

    communitySwiper.on("slideChange", syncNestedAutoplay);
    syncNestedAutoplay();

    return;
  }

  const trigger = document.querySelector(".community-trigger");
  const secondCommunityImage = document.querySelector(
    ".community-img-outer-wrap.is-2",
  );
  const beeCampButton = document.querySelector("#community-bee-camp");
  const beeTogetherButton = document.querySelector(
    "#community-bee-together",
  );

  if (
    !trigger ||
    !secondCommunityImage ||
    !beeCampButton ||
    !beeTogetherButton
  ) return;

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn(
      "Community animation: GSAP and ScrollTrigger must load first.",
    );
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const media = gsap.matchMedia();

  function setActiveCommunity(activeButton) {
    beeCampButton.classList.toggle(
      "is-active",
      activeButton === beeCampButton,
    );
    beeTogetherButton.classList.toggle(
      "is-active",
      activeButton === beeTogetherButton,
    );
  }

  media.add("(min-width: 768px)", () => {
    gsap.fromTo(
      secondCommunityImage,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger,
          start: "top 90%",
          toggleActions: "play none none reverse",
          onEnter: () => setActiveCommunity(beeTogetherButton),
          onEnterBack: () => setActiveCommunity(beeTogetherButton),
          onLeaveBack: () => setActiveCommunity(beeCampButton),
        },
      },
    );

    return () => setActiveCommunity(beeCampButton);
  });
}

initCommunityAnimation();

// Belief System Text Animation
