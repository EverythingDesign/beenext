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


// Open founder note
function openFounderNote() {
  const founderNote = document.querySelector(".founder_note_fixed");
  const founderNoteTrigger = document.querySelector("[open-founder-note]");
  const founderNoteClose =
    founderNote?.querySelectorAll("[close-founder-note]") || [];
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


function openYouTubePopup() {
  const popup = document.querySelector(".yt-popup_fixed");
  const popupTrigger = document.querySelector("#popup-our-roots[yt-link]");
  const popupInner = popup?.querySelector(".yt_popup_inner");
  const popupFrame = popup?.querySelector(".yt-popup_frame-wrap");
  const popupCloseButtons = popup?.querySelectorAll(
    "[close-yt-popup]",
  );

  if (!popup || !popupTrigger || !popupInner || !popupFrame) return;

  let isOpen = false;
  let openFrame = null;
  let closeTimer = null;
  let shouldResumeBackgroundAudio = false;

  function pauseBackgroundAudio() {
    if (typeof AudioManager === "undefined") return;

    if (AudioManager.isBgmPlaying) {
      shouldResumeBackgroundAudio = true;
      AudioManager.bgm.pause();
    }
  }

  function resumeBackgroundAudio() {
    if (
      typeof AudioManager === "undefined" ||
      !shouldResumeBackgroundAudio
    ) return;

    shouldResumeBackgroundAudio = false;

    if (!AudioManager.isMuted && !AudioManager.bgm.playing()) {
      AudioManager.bgm.play();
    }
  }

  function getYouTubeEmbedUrl(link) {
    try {
      const url = new URL(link);
      const hostname = url.hostname.replace(/^www\./, "");
      let videoId = "";

      if (hostname === "youtu.be") {
        videoId = url.pathname.split("/").filter(Boolean)[0] || "";
      } else if (
        hostname === "youtube.com" ||
        hostname === "m.youtube.com"
      ) {
        const pathParts = url.pathname.split("/").filter(Boolean);

        if (url.pathname === "/watch") {
          videoId = url.searchParams.get("v") || "";
        } else if (["embed", "shorts", "live"].includes(pathParts[0])) {
          videoId = pathParts[1] || "";
        }
      }

      if (!videoId) return null;

      const embedUrl = new URL(
        `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`,
      );
      embedUrl.searchParams.set("autoplay", "1");
      embedUrl.searchParams.set("playsinline", "1");
      embedUrl.searchParams.set("rel", "0");

      return embedUrl.toString();
    } catch {
      return null;
    }
  }

  function createYouTubeIframe(embedUrl) {
    const iframe = document.createElement("iframe");

    iframe.classList.add("yt-popup_iframe");
    iframe.src = embedUrl;
    iframe.title = popupTrigger.getAttribute("aria-label") || "YouTube video";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.setAttribute("loading", "eager");

    Object.assign(iframe.style, {
      width: "100%",
      height: "100%",
      border: "0",
    });

    return iframe;
  }

  function open() {
    if (isOpen) return;

    const embedUrl = getYouTubeEmbedUrl(popupTrigger.getAttribute("yt-link"));

    if (!embedUrl) {
      console.warn("YouTube popup: a valid yt-link was not found.");
      return;
    }

    isOpen = true;
    clearTimeout(closeTimer);
    closeTimer = null;

    popupFrame.replaceChildren(createYouTubeIframe(embedUrl));
    popup.style.display = "flex";
    window.lenis?.stop();
    pauseBackgroundAudio();

    openFrame = requestAnimationFrame(() => {
      openFrame = null;
      if (!isOpen) return;

      popupInner.classList.add("is-open");
    });
  }

  function close() {
    if (!isOpen) return;

    isOpen = false;

    if (openFrame !== null) {
      cancelAnimationFrame(openFrame);
      openFrame = null;
    }

    popupInner.classList.remove("is-open");

    closeTimer = setTimeout(() => {
      closeTimer = null;
      if (isOpen) return;

      popup.style.display = "none";
      popupFrame.replaceChildren();
      window.lenis?.start();
      resumeBackgroundAudio();
    }, 400);
  }

  popupTrigger.addEventListener("click", open);
  popupCloseButtons?.forEach((closeButton) => {
    closeButton.addEventListener("click", close);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}


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

function initBeeNetworkTabs() {
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  document.querySelectorAll(".bee-network-grid_wrap").forEach((networkGrid) => {
    const triggerContainer = networkGrid.querySelector(
      ".bee-network-triggers",
    );
    const triggers = Array.from(
      networkGrid.querySelectorAll(
        ".bee-network-triggers .bee-network-trigger",
      ),
    );
    const contents = Array.from(
      networkGrid.querySelectorAll(
        ".bee-network-content_wrap > .bee-network-content",
      ),
    );
    const triggerOuters = triggers.map((trigger) =>
      trigger.closest(".bee-network-trigger_outer"),
    );

    if (
      !triggerContainer ||
      !triggers.length ||
      triggerOuters.some((triggerOuter) => !triggerOuter) ||
      !contents.length
    ) return;

    let triggerSwiper = null;
    let currentActiveIndex = -1;
    let contentTimeline = null;
    let contentAnimationReady = false;
    let networkGridIsInView = false;

    function getContentAnimationTargets(content) {
      const heading = content.querySelector("[bee-network-heading]");
      const paragraph = content.querySelector("[bee-network-para]");
      const splitHeadingWords = Array.from(
        heading?.querySelectorAll(".word") || [],
      );
      const splitParagraphWords = Array.from(
        paragraph?.querySelectorAll(".word") || [],
      );
      const headingTargets = splitHeadingWords.length
        ? splitHeadingWords
        : [heading?.firstElementChild || heading].filter(Boolean);
      const paragraphTargets = splitParagraphWords.length
        ? splitParagraphWords
        : [paragraph?.firstElementChild || paragraph].filter(Boolean);
      const cta = content.querySelector("[bee-network-cta]");
      const ctaTarget = cta?.closest(".button_main_wrap") || cta;

      return { headingTargets, paragraphTargets, ctaTarget };
    }

    function animateActiveNetworkContent(index) {
      if (!contentAnimationReady || !networkGridIsInView) return;

      const content = contents[index];
      if (!content) return;

      const { headingTargets, paragraphTargets, ctaTarget } =
        getContentAnimationTargets(content);

      contentTimeline?.kill();

      gsap.set(headingTargets, {
        yPercent: 110,
        opacity: 0,
      });
      gsap.set(paragraphTargets, { opacity: 0 });
      if (ctaTarget) gsap.set(ctaTarget, { y: 16, opacity: 0 });

      contentTimeline = gsap.timeline({
        defaults: { overwrite: "auto" },
      });

      contentTimeline
        .to(headingTargets, {
          yPercent: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power4.out",
          stagger: 0.06,
        })
        .to(
          paragraphTargets,
          {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.025,
          },
          "<0.2",
        );

      if (ctaTarget) {
        contentTimeline.to(
          ctaTarget,
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            ease: "power3.out",
          },
          "<0.15",
        );
      }
    }

    function setupContentAnimation() {
      if (!window.gsap || !window.ScrollTrigger) {
        console.warn(
          "Bee network content animation: GSAP and ScrollTrigger must load first.",
        );
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.registerPlugin(ScrollTrigger);

      contents.forEach((content) => {
        const { headingTargets, paragraphTargets, ctaTarget } =
          getContentAnimationTargets(content);
        const targets = [
          ...headingTargets,
          ...paragraphTargets,
          ctaTarget,
        ].filter(Boolean);

        if (prefersReducedMotion) {
          gsap.set(targets, { clearProps: "opacity,transform,willChange" });
          return;
        }

        gsap.set(headingTargets, {
          yPercent: 110,
          opacity: 0,
          willChange: "transform,opacity",
        });
        gsap.set(paragraphTargets, {
          opacity: 0,
          willChange: "opacity",
        });
        if (ctaTarget) {
          gsap.set(ctaTarget, {
            y: 16,
            opacity: 0,
            willChange: "transform,opacity",
          });
        }
      });

      if (prefersReducedMotion) return;

      contentAnimationReady = true;

      ScrollTrigger.create({
        trigger: networkGrid,
        start: "top 85%",
        once: true,
        onEnter: () => {
          networkGridIsInView = true;
          animateActiveNetworkContent(currentActiveIndex);
        },
      });

      ScrollTrigger.refresh();
    }

    function setActiveNetworkItem(nextActiveIndex) {
      const activeItemChanged = nextActiveIndex !== currentActiveIndex;

      triggers.forEach((trigger, index) => {
        const isActive = index === nextActiveIndex;

        triggerOuters[index].classList.toggle("is-active", isActive);
        trigger.setAttribute("aria-pressed", String(isActive));
      });

      contents.forEach((content, index) => {
        content.classList.toggle("is-active", index === nextActiveIndex);
      });

      currentActiveIndex = nextActiveIndex;

      if (activeItemChanged) {
        animateActiveNetworkContent(nextActiveIndex);
      }
    }

    triggerOuters.forEach((triggerOuter, index) => {
      triggerOuter.addEventListener("click", () => {
        if (!contents[index]) return;
        setActiveNetworkItem(index);
        triggerSwiper?.slideToLoop(index);
      });
    });

    const initialActiveIndex = triggerOuters.findIndex((triggerOuter) =>
      triggerOuter.classList.contains("is-active"),
    );
    const startingIndex = initialActiveIndex >= 0 ? initialActiveIndex : 0;

    setActiveNetworkItem(startingIndex);

    const fontsReady = document.fonts?.ready || Promise.resolve();
    fontsReady.then(() => {
      requestAnimationFrame(setupContentAnimation);
    });

    if (!isMobile) return;

    if (!window.Swiper) {
      console.warn("Bee network tabs: Swiper must load first.");
      return;
    }

    const triggerWrapper = document.createElement("div");
    triggerWrapper.classList.add(
      "bee-network-trigger_swiper-wrapper",
      "swiper-wrapper",
    );

    Object.assign(triggerContainer.style, {
      overflow: "hidden",
      touchAction: "pan-y",
    });

    Object.assign(triggerWrapper.style, {
      position: "relative",
      zIndex: "1",
      display: "flex",
      alignItems: "flex-end",
      width: "100%",
      transitionProperty: "transform",
    });

    triggerOuters.forEach((triggerOuter) => {
      triggerOuter.classList.add("swiper-slide");
      Object.assign(triggerOuter.style, {
        flexShrink: "0",
        width: "max-content",
      });
      triggerWrapper.appendChild(triggerOuter);
    });

    triggerContainer.appendChild(triggerWrapper);

    const swiperNavigator = networkGrid.querySelector(
      ".bee-network-swiper-navigator",
    );
    const previousButton = swiperNavigator?.querySelector(
      ".chevron-arrow_previous",
    );
    const nextButton = swiperNavigator?.querySelector(
      ".chevron-arrow_next",
    );
    const pagination = swiperNavigator?.querySelector(".swiper-pagination");

    triggerSwiper = new window.Swiper(triggerContainer, {
      slidesPerView: "auto",
      centeredSlides: true,
      loop: true,
      initialSlide: startingIndex,
      spaceBetween: 16,
      speed: 500,
      navigation: {
        prevEl: previousButton,
        nextEl: nextButton,
      },
      pagination: {
        el: pagination,
        type: "fraction",
      },
      on: {
        realIndexChange(swiper) {
          setActiveNetworkItem(swiper.realIndex);
        },
      },
    });
  });
}

function initPortfolioSwiper() {
  const portfolioSlider = document.querySelector(
    "#portfolio .portfolio-list-wrapper.swiper",
  );

  if (!portfolioSlider) return;

  if (!window.Swiper) {
    console.warn("Portfolio slider: Swiper must load first.");
    return;
  }

  const portfolioWrapper = portfolioSlider.querySelector(
    ":scope > .portfolio-list.swiper-wrapper",
  );
  const portfolioSlides = portfolioWrapper?.querySelectorAll(
    ":scope > .portfolio-item.swiper-slide",
  );

  if (!portfolioWrapper || !portfolioSlides?.length) return;


  const portfolioSwiper = new window.Swiper(portfolioSlider, {
    slidesPerView: 1.5,
    centeredSlides: true,
    initialSlide: 2,
    spaceBetween: 16,
    speed: 500,
    watchOverflow: true,
    mousewheel: {
      enabled: true,
      forceToAxis: true,
    },
    breakpoints: {
      480: {
        slidesPerView: 1.75,
      },
      768: {
        slidesPerView: 2.5,
      },
      992: {
        slidesPerView: 5.5,
      },
      1440: {
        slidesPerView: 4.5,
      },
    },
  });

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn(
      "Portfolio entrance animation: GSAP and ScrollTrigger must load first.",
    );
    return;
  }

  const { gsap, ScrollTrigger } = window;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  gsap.registerPlugin(ScrollTrigger);

  if (prefersReducedMotion) return;

  requestAnimationFrame(() => {
    portfolioSwiper.update();

    const activeSlide = portfolioSlides[portfolioSwiper.activeIndex];
    if (!activeSlide) return;

    const activeRect = activeSlide.getBoundingClientRect();
    const activeCenter = activeRect.left + activeRect.width / 2;

    portfolioSlides.forEach((portfolioSlide, index) => {
      const slideRect = portfolioSlide.getBoundingClientRect();
      const slideCenter = slideRect.left + slideRect.width / 2;

      gsap.set(portfolioSlide, {
        x: activeCenter - slideCenter,
        zIndex:
          portfolioSlides.length -
          Math.abs(index - portfolioSwiper.activeIndex),
        willChange: "transform",
      });
    });

    gsap.to(portfolioSlides, {
      x: 0,
      duration: 1.2,
      ease: "power3.inOut",
      stagger: {
        each: 0.08,
        from: portfolioSwiper.activeIndex,
      },
      scrollTrigger: {
        trigger: "#portfolio",
        start: "top center",
        toggleActions: "play none none reverse",
      },
    });
  });
}

function initFounderStories() {
  const section = document.querySelector("#highlight-stories");
  const storyItems = section?.querySelectorAll(".founders-stories-item");

  if (!section || !storyItems?.length) return;

  function setActiveStory(activeStory) {
    storyItems.forEach((storyItem) => {
      const isActive = storyItem === activeStory;
      storyItem.classList.toggle("is-active", isActive);
      storyItem.setAttribute("aria-expanded", String(isActive));
    });
  }

  function enableStoryClicks() {
    storyItems.forEach((storyItem) => {
      storyItem.addEventListener("click", () => {
        setActiveStory(storyItem);
      });
    });
  }

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn(
      "Founder stories animation: GSAP and ScrollTrigger must load first.",
    );
    setActiveStory(storyItems[0]);
    enableStoryClicks();
    return;
  }

  const { gsap, ScrollTrigger } = window;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  gsap.registerPlugin(ScrollTrigger);

  if (prefersReducedMotion) {
    setActiveStory(storyItems[0]);
    enableStoryClicks();
    return;
  }

  gsap.set(storyItems, {
    opacity: 0,
    willChange: "opacity",
  });

  const storyStagger = 0.15;
  const storyTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top center",
      once: true,
    },
  });

  storyTimeline.to(storyItems, {
    opacity: 1,
    duration: 0.6,
    ease: "power2.out",
    stagger: storyStagger,
  });

  storyTimeline.call(
    () => {
      gsap.set(storyItems, { clearProps: "opacity,willChange" });
      enableStoryClicks();
    },
    null,
    ">",
  );

  storyTimeline.call(
    () => setActiveStory(storyItems[0]),
    null,
    (storyItems.length - 1) * storyStagger,
  );
}




document.addEventListener("DOMContentLoaded", () => {
  document.fonts?.ready.then(() => {
    openFounderNote();
    openYouTubePopup();
    initBeliefCardAccordion();
    initBeeNetworkAnimation();
    initCommunityAnimation();
    initFounderStories();
    initPortfolioSwiper();
    initBeeNetworkTabs();
  })
});