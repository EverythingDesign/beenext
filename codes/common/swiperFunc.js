
  window.Webflow ||= [];

  console.log("bv")

  window.Webflow.push(async () => {
    if (typeof gsap === 'undefined' || typeof Swiper === 'undefined' || typeof SplitText === 'undefined') {
      return;
    }

    gsap.registerPlugin(SplitText);

    const section = document.querySelector('#builder-testimonial');
    const slider =
      section?.querySelector('.testimonial_wrapper.swiper') ||
      section?.querySelector('.testimonial_wrapper') ||
      section?.querySelector('.swiper');

    if (!section || !slider) return;

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    const slideWrapper = slider.querySelector(':scope > .swiper-wrapper');
    const slides = slideWrapper
      ? gsap.utils
          .toArray(slideWrapper.children)
          .filter((slide) => slide.classList.contains('swiper-slide'))
      : [];

    if (!slides.length) return;

    let transitionTimeline = null;
    let testimonialSwiper = null;

    function makeEmphasisBreakable(target) {
      target.querySelectorAll('em').forEach((emphasis) => {
        const parts = emphasis.textContent.match(/\S+|\s+/g) || [];

        if (parts.length < 2) return;

        const fragment = document.createDocumentFragment();

        parts.forEach((part) => {
          if (/^\s+$/.test(part)) {
            fragment.append(document.createTextNode(part));
            return;
          }

          const wordEmphasis = emphasis.cloneNode(false);
          wordEmphasis.textContent = part;
          fragment.append(wordEmphasis);
        });

        emphasis.replaceWith(fragment);
      });
    }

    /*
     * Split the text inside each Webflow rich-text block. Targeting its
     * paragraph prevents nested inline elements such as <em> from being
     * measured together with the rich-text wrapper.
     */
    const splitInstances = slides.map((slide) => {
      const testimonialBlocks = gsap.utils.toArray(
        slide.querySelectorAll('.testimonial-text'),
      );
      const testimonials = testimonialBlocks.flatMap((testimonialBlock) => {
        const paragraphs = gsap.utils.toArray(
          testimonialBlock.querySelectorAll(':scope > p'),
        );

        return paragraphs.length ? paragraphs : [testimonialBlock];
      });

      return testimonials.map((testimonial) => {
        testimonial.style.setProperty('text-wrap', 'wrap');
        makeEmphasisBreakable(testimonial);

        const splitInstance = new SplitText(testimonial, {
          type: 'lines, words',
          linesClass: 'testimonial-line',
          wordsClass: 'testimonial-word',
          mask: 'lines',
          deepSlice: true,
        });

        return splitInstance;
      });
    });

    function getLines(slideIndex) {
      return (
        splitInstances[slideIndex]?.flatMap(
          (splitInstance) => splitInstance.lines || [],
        ) || []
      );
    }

    function getInfoText(slide) {
      return gsap.utils.toArray(slide.querySelectorAll('.testimonee_info.u-text'));
    }

    function getFadeElements(slide) {
      return gsap.utils.toArray(slide.querySelectorAll('.testimonial_image-wrap, .testimonial-image_wide, .testimonial-image_square'));
    }

    function hideSlide(slide) {
      slide.classList.remove('is-testimonial-visible');

      gsap.set(slide, {
        opacity: 0,
        visibility: 'hidden',
        pointerEvents: 'none',
      });
    }

    function showSlide(slide) {
      slide.classList.add('is-testimonial-visible');

      gsap.set(slide, {
        opacity: 1,
        visibility: 'visible',
        pointerEvents: 'auto',
      });
    }

    /*
     * Prepare initial states.
     */
    slides.forEach((slide, index) => {
      const lines = getLines(index);
      const infoText = getInfoText(slide);
      const fadeElements = getFadeElements(slide);

      if (index === 0) {
        showSlide(slide);

        gsap.set(lines, {
          yPercent: 0,
          opacity: 1,
        });

        gsap.set(infoText, {
          yPercent: 0,
          opacity: 1,
        });

        gsap.set(fadeElements, {
          opacity: 1,
        });
      } else {
        hideSlide(slide);

        gsap.set(lines, {
          yPercent: 110,
          opacity: 1,
        });

        gsap.set(infoText, {
          yPercent: 110,
          opacity: 0,
        });

        gsap.set(fadeElements, {
          opacity: 0,
        });
      }
    });

    function animateTestimonials(swiper) {
      const outgoingIndex = swiper.previousIndex;
      const incomingIndex = swiper.activeIndex;

      if (outgoingIndex === incomingIndex || !slides[outgoingIndex] || !slides[incomingIndex]) {
        return;
      }

      if (transitionTimeline) {
        transitionTimeline.kill();
      }

      const outgoingSlide = slides[outgoingIndex];
      const incomingSlide = slides[incomingIndex];

      const outgoingLines = getLines(outgoingIndex);
      const incomingLines = getLines(incomingIndex);

      const outgoingInfo = getInfoText(outgoingSlide);
      const incomingInfo = getInfoText(incomingSlide);

      const outgoingFadeElements = getFadeElements(outgoingSlide);

      const incomingFadeElements = getFadeElements(incomingSlide);

      /*
       * Ensure only the outgoing slide is initially visible.
       */
      slides.forEach((slide, index) => {
        if (index !== outgoingIndex) {
          hideSlide(slide);
        }
      });

      showSlide(outgoingSlide);

      gsap.set(outgoingLines, {
        yPercent: 0,
        opacity: 1,
      });

      gsap.set(outgoingInfo, {
        yPercent: 0,
        opacity: 1,
      });

      gsap.set(outgoingFadeElements, {
        opacity: 1,
      });

      /*
       * Prepare incoming content below the masks.
       */
      gsap.set(incomingLines, {
        yPercent: 110,
        opacity: 1,
      });

      gsap.set(incomingInfo, {
        yPercent: 110,
        opacity: 0,
      });

      gsap.set(incomingFadeElements, {
        opacity: 0,
      });

      transitionTimeline = gsap.timeline({
        defaults: {
          overwrite: true,
          force3D: false,
        },

        onComplete() {
          slides.forEach((slide, index) => {
            if (index !== incomingIndex) {
              hideSlide(slide);
            }
          });

          transitionTimeline = null;
        },
      });

      transitionTimeline.addLabel('outgoing', 0);

      /*
       * Outgoing testimonial lines.
       */
      transitionTimeline.to(
        outgoingLines,
        {
          yPercent: -110,
          duration: 0.8,
          stagger: 0.035,
          ease: 'power2.in',
        },
        'outgoing',
      );

      /*
       * Outgoing name and role.
       */
      transitionTimeline.to(
        outgoingInfo,
        {
          yPercent: -110,
          opacity: 0,
          duration: 0.5,
          stagger: 0.025,
          ease: 'power2.in',
        },
        'outgoing',
      );

      /*
       * Logo and portrait disappear quickly.
       */
      transitionTimeline.to(
        outgoingFadeElements,
        {
          opacity: 0,
          duration: 0.12,
          ease: 'none',
        },
        'outgoing',
      );

      /*
       * Perform an instant slide handoff once the outgoing
       * content animation has completed.
       */
      transitionTimeline.call(
        () => {
          hideSlide(outgoingSlide);
          showSlide(incomingSlide);
        },
        null,
        '>',
      );

      transitionTimeline.addLabel('incoming', '>');

      /*
       * Logo and portrait appear immediately and quickly,
       * preventing the slide from looking empty.
       */
      transitionTimeline.to(
        incomingFadeElements,
        {
          opacity: 1,
          duration: 0.6,
          ease: 'power1.out',
          stagger: 0,
        },
        'incoming',
      );

      /*
       * Incoming testimonial lines move up from below.
       */
      transitionTimeline.to(
        incomingLines,
        {
          yPercent: 0,
          duration: 0.5,
          stagger: 0.04,
          ease: 'power3.out',
        },
        'incoming',
      );

      /*
       * Incoming name and role.
       */
      transitionTimeline.to(
        incomingInfo,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.42,
          stagger: 0.035,
          ease: 'power3.out',
        },
        'incoming+=0.04',
      );
    }

    /*
     * Initialize Swiper without its default horizontal movement.
     */
    testimonialSwiper = new Swiper(slider, {
      virtualTranslate: true,
      speed: 0,
      allowTouchMove: true,
      rewind: true,
      pagination: {
        el: section.querySelector('.swiper-pagination'),
        type: 'fraction',
      },

      navigation: {
        nextEl: section.querySelector('.chevron-arrow_next'),
        prevEl: section.querySelector('.chevron-arrow_previous'),
      },

      on: {
        init(swiper) {
          slides.forEach((slide, index) => {
            if (index === swiper.activeIndex) {
              showSlide(slide);
            } else {
              hideSlide(slide);
            }
          });
        },

        slideChange(swiper) {
          animateTestimonials(swiper);
        },
      },
    });

    const mobileImageMedia = gsap.matchMedia();

    mobileImageMedia.add('(max-width: 767px)', () => {
      const squareImageMoves = slides
        .map((parentSlide) => {
          const squareOuter = parentSlide.querySelector(
            '.testimonial-image_square_outer',
          );
          const squareWrap = parentSlide.querySelector(
            '.testimonial-image_wrap_square',
          );

          if (!squareOuter || !squareWrap || squareOuter.contains(squareWrap)) {
            return null;
          }

          const originalPosition = document.createComment(
            'testimonial-square-image-original-position',
          );

          squareWrap.parentNode.insertBefore(originalPosition, squareWrap);
          squareOuter.append(squareWrap);

          return {
            squareWrap,
            originalPosition,
          };
        })
        .filter(Boolean);

      const childCarousels = slides
        .map((parentSlide) => {
          const imageMain = parentSlide.querySelector(
            '.testimonial-image_main',
          );

          if (!imageMain) return null;

          const testimonialGrid = parentSlide.querySelector(
            '.testimonial-grid',
          );
          const hadSwiperClass = imageMain.classList.contains('swiper');

          imageMain.classList.add('swiper');

          gsap.set([parentSlide, testimonialGrid, imageMain].filter(Boolean), {
            minWidth: 0,
          });
          gsap.set(imageMain, {
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          });

          const childCarousel = new Swiper(imageMain, {
            slidesPerView: 1.15,
            spaceBetween: 16,
            speed: 600,
            grabCursor: true,
            nested: true,
            rewind: true,
            watchOverflow: true,
            slideToClickedSlide: true,
            observer: true,
            observeParents: true,
          });

          return {
            childCarousel,
            imageMain,
            hadSwiperClass,
          };
        })
        .filter(Boolean);

      if (!childCarousels.length && !squareImageMoves.length) return;

      return () => {
        childCarousels.forEach(({
          childCarousel,
          imageMain,
          hadSwiperClass,
        }) => {
          childCarousel.destroy(true, true);

          if (!hadSwiperClass) {
            imageMain.classList.remove('swiper');
          }
        });

        squareImageMoves.forEach(({ squareWrap, originalPosition }) => {
          originalPosition.parentNode.insertBefore(
            squareWrap,
            originalPosition,
          );
          originalPosition.remove();
        });

        testimonialSwiper.update();
      };
    });
  });
