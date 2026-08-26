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

let rememberedBeliefCard = null;

/**
 * ScrollSmoother translates #smooth-content. Native position: sticky can
 * therefore resolve against the transformed/overflow-hidden wrapper instead
 * of the page viewport. Pin the existing sticky scenes with ScrollTrigger and
 * use their existing spacer elements as the pin end points.
 */
function initScrollSmootherStickyPins() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const pinScenes = [
    {
      pin: "#home-hero > section.u-position-sticky",
      endTrigger: "#hero-trigger-1",
    },
    {
      pin: ".founders_note-section",
      endTrigger: ".bee-track-trigger",
    },
    {
      pin: ".belief-system-section",
      endTrigger: ".belief-system-trigger",
    },
    {
      pin: "#innovation-stories",
      endTrigger: ".i-s-trigger",
    },
  ];

  const media = gsap.matchMedia();

  media.add("(min-width: 768px)", () => {
    const pins = [];
    const originalStickyClasses = [];

    pinScenes.forEach(({ pin: pinSelector, endTrigger: endSelector }) => {
      const pinElement = document.querySelector(pinSelector);
      const endTrigger = document.querySelector(endSelector);

      if (!pinElement || !endTrigger) return;

      originalStickyClasses.push({
        element: pinElement,
        hadClass: pinElement.classList.contains("u-position-sticky"),
      });

      // Disable the conflicting native sticky rule while ScrollTrigger owns
      // the pin. The class is restored on media cleanup.
      pinElement.classList.remove("u-position-sticky");

      pins.push(
        ScrollTrigger.create({
          trigger: pinElement,
          pin: pinElement,
          start: "top top",
          endTrigger,
          end: "bottom bottom",
          // The existing trigger spacer already provides the scroll distance.
          // Adding ScrollTrigger's duration padding would duplicate that
          // space and make the following scene drift/overlap.
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }),
      );
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      pins.forEach((pin) => pin.kill());
      originalStickyClasses.forEach(({ element, hadClass }) => {
        if (hadClass) element.classList.add("u-position-sticky");
      });
    };
  });
}

function initBeliefSystemTextAnimation() {
  const mountain = document.querySelector(".bonsai-img-outer");
  const mountainStartY = mountain
    ? Number(gsap.getProperty(mountain, "yPercent")) || 0
    : 0;
  const mountainMotion = {
    beliefOffset: 5,
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

  renderMountainPosition();

  const beliefTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".belief-system-section",
      start: "top 80%",
      end: "top 10%",
      scrub: 1.2
    },
  });
  beliefTimeline.to(
    ".belief_heading p .word",
    {
      yPercent: 0,
      opacity: 1,
      duration: 1,
      ease: "power4.out",
      stagger: 0.06,
    }
  );

  const beliefHeading = document.querySelector(".belief_heading");
  const beliefCards = gsap.utils.toArray(".belief-card");
  const firstCard = beliefCards[0];
  const beliefMedia = gsap.matchMedia();

  function setRememberedBeliefCardActive(isActive) {
    const cardToOpen = beliefCards.includes(rememberedBeliefCard)
      ? rememberedBeliefCard
      : firstCard;

    beliefCards.forEach((card) => {
      const dropdownOuter = card.querySelector(".card_dd_outer");
      const dropdownInner = card.querySelector(".card_dd_inner");
      const shouldOpen = isActive && card === cardToOpen;

      card.classList.toggle("is-active", shouldOpen);
      card.classList.toggle("is-open", shouldOpen);

      if (dropdownOuter) {
        dropdownOuter.style.height =
          shouldOpen && dropdownInner
            ? `${dropdownInner.scrollHeight}px`
            : "0px";
      }
    });
  }

  beliefMedia.add("(min-width: 992px)", () => {
    beliefTimeline.to(
      mountainMotion,
      {
        beliefOffset: -10,
        duration: 1,
        ease: "none",
        onUpdate: renderMountainPosition,
      },
      "<0.8",
    );

    const beliefSystemTimeline = gsap.timeline({
      paused: true,
      onComplete: () => setRememberedBeliefCardActive(true),
      onReverseComplete: () => setRememberedBeliefCardActive(false),
    });

    beliefSystemTimeline
      .to(
        beliefHeading,
        {
          opacity: 0.15,
          duration: 1,
          ease: "power4.out",
        },
        "<",
      )
      .from(beliefCards, {
        opacity: 0,
        stagger: 0.2,
        duration: 0.5,
        ease: "none",
      });

    let beliefSystemDirection = 1;
    const playBeliefSystem = () =>
      beliefSystemTimeline.timeScale(1).play();
    const reverseBeliefSystem = () =>
      beliefSystemTimeline.timeScale(1.5).reverse();

    const beliefSystemTrigger = ScrollTrigger.create({
      trigger: ".belief-system-trigger",
      start: "top 95%",
      end: "top top",
      onEnter: playBeliefSystem,
      onEnterBack: reverseBeliefSystem,
      onUpdate: (self) => {
        if (self.direction === beliefSystemDirection) return;

        beliefSystemDirection = self.direction;

        if (self.direction < 0 && beliefSystemTimeline.progress() > 0) {
          reverseBeliefSystem();
        } else if (
          self.direction > 0 &&
          self.progress > 0
        ) {
          playBeliefSystem();
        }
      },
      onLeaveBack: reverseBeliefSystem,
    });

    const syncFrame = requestAnimationFrame(() => {
      if (beliefSystemTrigger.progress > 0) {
        beliefSystemTimeline.progress(1, true);
        setRememberedBeliefCardActive(true);
      } else {
        beliefSystemTimeline.pause(0, true);
        setRememberedBeliefCardActive(false);
      }
    });

    return () => {
      cancelAnimationFrame(syncFrame);
      beliefSystemTrigger.kill();
      beliefSystemTimeline.kill();
      setRememberedBeliefCardActive(false);
    };
  });

  beliefMedia.add("(max-width: 991px)", () => {
    gsap.set(beliefHeading, { opacity: 1 });

    const beliefCardTimeline = gsap.timeline({
      paused: true,
      onComplete: () => setRememberedBeliefCardActive(true),
      onReverseComplete: () => setRememberedBeliefCardActive(false),
    });

    beliefCardTimeline
      .from(beliefCards, {
        opacity: 0,
        stagger: 0.2,
        duration: 0.5,
        ease: "none",
      });

    let beliefCardDirection = 1;
    const playBeliefCards = () => beliefCardTimeline.timeScale(1).play();
    const reverseBeliefCards = () =>
      beliefCardTimeline.timeScale(1.5).reverse();

    const beliefCardTrigger = ScrollTrigger.create({
      trigger: ".belief-system-section",
      start: "top center",
      end: "top top",
      onLeave: playBeliefCards,
      onEnterBack: reverseBeliefCards,
      onUpdate: (self) => {
        if (self.direction === beliefCardDirection) return;

        beliefCardDirection = self.direction;

        if (self.direction < 0 && beliefCardTimeline.progress() > 0) {
          reverseBeliefCards();
        } else if (
          self.direction > 0 &&
          beliefCardTimeline.progress() > 0
        ) {
          playBeliefCards();
        }
      },
      onLeaveBack: reverseBeliefCards,
    });

    const syncFrame = requestAnimationFrame(() => {
      if (beliefCardTrigger.progress === 1) {
        beliefCardTimeline.progress(1, true);
        setRememberedBeliefCardActive(true);
      } else {
        beliefCardTimeline.pause(0, true);
        setRememberedBeliefCardActive(false);
      }
    });

    return () => {
      cancelAnimationFrame(syncFrame);
      beliefCardTrigger.kill();
      beliefCardTimeline.kill();
      setRememberedBeliefCardActive(false);
    };
  });

}

async function initBonsaiWebGPUVideo() {
  const outer = document.querySelector(".bonsai-img-outer");
  const trigger = document.querySelector(".belief-system-trigger");
  const beliefSection = document.querySelector(".belief-system-section");

  if (
    !outer ||
    !trigger ||
    !beliefSection ||
    !window.gsap ||
    !window.ScrollTrigger
  ) return;

  const fallbackImage = outer.querySelector(".visual_mountain_colored");
  const existingVideo = outer.querySelector("video[data-bonsai-video]");
  const webmSource = outer.getAttribute("video-url-webm");
  const mp4Source = outer.getAttribute("video-url-mp4");
  const isIOS =
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari =
    /Safari/i.test(navigator.userAgent) &&
    !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|Android/i.test(navigator.userAgent);
  const shouldUseHevcAlpha = isIOS || isSafari;
  const useNativeAlphaVideo = shouldUseHevcAlpha && Boolean(mp4Source);
  const directVideoSource =
    outer.dataset.bonsaiVideoSrc ||
    outer.dataset.videoSrc ||
    existingVideo?.currentSrc ||
    existingVideo?.getAttribute("src") ||
    existingVideo?.querySelector("source[src]")?.getAttribute("src");

  if (!webmSource && !mp4Source && !directVideoSource) {
    console.warn(
      "Bonsai WebGPU video: add video-url-webm or video-url-mp4 to .bonsai-img-outer.",
    );
    return;
  }

  if (!useNativeAlphaVideo && !navigator.gpu) {
    console.warn("Bonsai WebGPU video: WebGPU is not available.");
    return;
  }

  const video = existingVideo || document.createElement("video");
  const canvasHost = outer;
  const canvas =
    canvasHost.querySelector("canvas.bonsai-webgpu-canvas") ||
    document.createElement("canvas");

  if (!existingVideo) {
    video.dataset.bonsaiVideo = "";
    outer.appendChild(video);
  }

  if (canvas.parentElement !== canvasHost) {
    canvas.classList.add("bonsai-webgpu-canvas");
    canvasHost.appendChild(canvas);
  }

  video.crossOrigin = "anonymous";
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.disablePictureInPicture = true;
  video.setAttribute("aria-hidden", "true");
  video.style.display = "none";

  if (webmSource || mp4Source) {
    video.removeAttribute("src");
    video
      .querySelectorAll("source[data-bonsai-generated-source]")
      .forEach((source) => source.remove());

    if (shouldUseHevcAlpha && mp4Source) {
      // Safari supports WebM, but not VP9 alpha reliably. Assign the HEVC
      // alpha file directly so Safari cannot select the WebM source first.
      video.src = mp4Source;
    } else {
      [
        { src: webmSource, type: 'video/webm; codecs="vp9"' },
        { src: mp4Source, type: 'video/mp4; codecs="hvc1"' },
      ].forEach(({ src, type }) => {
        if (!src) return;

        const source = document.createElement("source");
        source.src = src;
        source.type = type;
        source.dataset.bonsaiGeneratedSource = "";
        video.appendChild(source);
      });
    }
  } else if (
    directVideoSource &&
    !video.currentSrc &&
    video.getAttribute("src") !== directVideoSource
  ) {
    video.src = directVideoSource;
  }

  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    display: "block",
    position: "absolute",
    left: "0",
    bottom: "0",
    width: "100%",
    height: "auto",
    maxWidth: "100%",
    opacity: "0",
    pointerEvents: "none",
  });

  if (window.getComputedStyle(outer).position === "static") {
    outer.style.position = "relative";
  }

  outer.style.overflow = "visible";

  function waitForVideoEvent(eventName) {
    return new Promise((resolve, reject) => {
      const handleSuccess = () => {
        video.removeEventListener("error", handleError);
        resolve();
      };
      const handleError = () => {
        video.removeEventListener(eventName, handleSuccess);
        reject(video.error || new Error("The bonsai video failed to load."));
      };

      video.addEventListener(eventName, handleSuccess, { once: true });
      video.addEventListener("error", handleError, { once: true });
    });
  }

  try {
    video.load();

    if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
      await waitForVideoEvent("loadedmetadata");
    }

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      await waitForVideoEvent("loadeddata");
    }

    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error("The bonsai video must have a finite duration.");
    }

    if (useNativeAlphaVideo) {
      // Safari decodes HEVC alpha correctly in its native media compositor,
      // but its WebGPU external-texture path currently returns an opaque
      // frame. Keep the same scroll scrub while rendering the video natively.
      canvas.remove();
      video.classList.add(
        "bonsai-webgpu-canvas",
        "bonsai-native-alpha-video",
      );
      Object.assign(video.style, {
        display: "block",
        position: "absolute",
        left: "0",
        bottom: "0",
        width: "100%",
        height: "auto",
        maxWidth: "100%",
        objectFit: "contain",
        background: "transparent",
        opacity: "1",
        pointerEvents: "none",
      });

      if (fallbackImage) fallbackImage.style.opacity = "0";

      const frameRate = 24;
      const frameDuration = 1 / frameRate;
      const maxVideoTime = Math.max(0, video.duration - frameDuration);
      const videoScrub = { time: 0 };
      let pendingVideoTime = 0;
      let seekInProgress = false;

      function seekToPendingFrame() {
        const quantizedTime = Math.min(
          maxVideoTime,
          Math.max(
            0,
            Math.round(pendingVideoTime * frameRate) / frameRate,
          ),
        );

        if (Math.abs(video.currentTime - quantizedTime) < frameDuration / 2) {
          seekInProgress = false;
          return;
        }

        seekInProgress = true;
        video.currentTime = quantizedTime;
      }

      function queueNativeVideoSeek(time) {
        pendingVideoTime = time;
        if (!seekInProgress) seekToPendingFrame();
      }

      function handleNativeVideoSeeked() {
        seekInProgress = false;

        if (
          Math.abs(video.currentTime - pendingVideoTime) >=
          frameDuration / 2
        ) {
          seekToPendingFrame();
        }
      }

      video.addEventListener("seeked", handleNativeVideoSeeked);

      const scrubTween = gsap.to(videoScrub, {
        time: maxVideoTime,
        duration: 1,
        ease: "none",
        paused: true,
        onUpdate: () => queueNativeVideoSeek(videoScrub.time),
      });

      let scrollTrigger = null;
      const scrubMedia = gsap.matchMedia();

      scrubMedia.add(
        {
          mobile: "(max-width: 991px)",
          desktop: "(min-width: 992px)",
        },
        (context) => {
          const isMobile = context.conditions.mobile;

          scrollTrigger = ScrollTrigger.create({
            trigger: isMobile ? beliefSection : trigger,
            start: isMobile ? "top center" : "top bottom",
            end: "top top",
            animation: scrubTween,
            scrub: true,
            invalidateOnRefresh: true,
          });

          return () => {
            scrollTrigger?.kill();
            scrollTrigger = null;
          };
        },
      );

      window.addEventListener(
        "pagehide",
        () => {
          scrubMedia.revert();
          scrubTween.kill();
          video.removeEventListener("seeked", handleNativeVideoSeeked);
        },
        { once: true },
      );

      return;
    }

    const frameWidth = Number(outer.getAttribute("video-width")) || 1440;
    const frameHeight = Number(outer.getAttribute("video-height")) || 900;
    canvas.style.aspectRatio = `${frameWidth} / ${frameHeight}`;

    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: "high-performance",
    });
    if (!adapter) throw new Error("No WebGPU adapter was found.");

    const device = await adapter.requestDevice();
    const context = canvas.getContext("webgpu");
    if (!context) throw new Error("A WebGPU canvas context could not be created.");

    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device,
      format: presentationFormat,
      alphaMode: "premultiplied",
    });

    const shaderModule = device.createShaderModule({
      code: `
        struct VertexOutput {
          @builtin(position) position: vec4f,
          @location(0) uv: vec2f,
        };

        @vertex
        fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
          var positions = array<vec2f, 3>(
            vec2f(-1.0, -1.0),
            vec2f(3.0, -1.0),
            vec2f(-1.0, 3.0)
          );

          let position = positions[vertexIndex];
          var output: VertexOutput;
          output.position = vec4f(position, 0.0, 1.0);
          output.uv = vec2f(
            (position.x + 1.0) * 0.5,
            (1.0 - position.y) * 0.5
          );
          return output;
        }

        @group(0) @binding(0) var videoSampler: sampler;
        @group(0) @binding(1) var videoTexture: texture_external;

        @fragment
        fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
          return textureSampleBaseClampToEdge(
            videoTexture,
            videoSampler,
            input.uv
          );
        }
      `,
    });

    const pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [
          {
            format: presentationFormat,
            blend: {
              color: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha",
              },
              alpha: {
                srcFactor: "one",
                dstFactor: "one-minus-src-alpha",
              },
            },
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
      },
    });

    const sampler = device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge",
    });

    let deviceIsLost = false;
    let hasRenderedFrame = false;
    let renderWarningShown = false;
    let seekFrame = null;
    let pendingVideoTime = 0;

    device.lost.then(() => {
      deviceIsLost = true;
      canvas.style.opacity = "0";
      if (fallbackImage) fallbackImage.style.opacity = "";
    });

    function resizeCanvas() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));

      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
    }

    function renderVideoFrame() {
      if (deviceIsLost || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        return;
      }

      try {
        resizeCanvas();

        // HTMLVideoElement external textures expire after use, so import the
        // current decoded frame again for every WebGPU render.
        const externalTexture = device.importExternalTexture({
          source: video,
          colorSpace: "srgb",
        });
        const bindGroup = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: sampler },
            { binding: 1, resource: externalTexture },
          ],
        });
        const commandEncoder = device.createCommandEncoder();
        const renderPass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: context.getCurrentTexture().createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 0 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });

        renderPass.setPipeline(pipeline);
        renderPass.setBindGroup(0, bindGroup);
        renderPass.draw(3);
        renderPass.end();
        device.queue.submit([commandEncoder.finish()]);

        if (!hasRenderedFrame) {
          hasRenderedFrame = true;
          canvas.style.opacity = "1";
          if (fallbackImage) fallbackImage.style.opacity = "0";
        }
      } catch (error) {
        if (!renderWarningShown) {
          renderWarningShown = true;
          console.warn("Bonsai WebGPU video: frame rendering failed.", error);
        }
      }
    }

    function queueVideoSeek(time) {
      pendingVideoTime = time;
      if (seekFrame !== null) return;

      seekFrame = requestAnimationFrame(() => {
        seekFrame = null;

        if (Math.abs(video.currentTime - pendingVideoTime) < 1 / 120) {
          renderVideoFrame();
          return;
        }

        video.currentTime = pendingVideoTime;
      });
    }

    const handleSeeked = () => renderVideoFrame();
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      renderVideoFrame();
    });

    video.addEventListener("seeked", handleSeeked);
    resizeObserver.observe(canvasHost);
    resizeCanvas();
    renderVideoFrame();

    const maxVideoTime = Math.max(0, video.duration - 1 / 60);
    const videoScrub = { time: 0 };
    const scrubTween = gsap.to(videoScrub, {
      time: maxVideoTime,
      duration: 1,
      ease: "none",
      paused: true,
      onUpdate: () => queueVideoSeek(videoScrub.time),
    });

    let scrollTrigger = null;
    const scrubMedia = gsap.matchMedia();

    scrubMedia.add(
      {
        mobile: "(max-width: 991px)",
        desktop: "(min-width: 992px)",
      },
      (context) => {
        const isMobile = context.conditions.mobile;

        scrollTrigger = ScrollTrigger.create({
          trigger: isMobile ? beliefSection : trigger,
          start: isMobile ? "top center" : "top bottom",
          end: "top top",
          animation: scrubTween,
          scrub: true,
          invalidateOnRefresh: true,
        });

        return () => {
          scrollTrigger?.kill();
          scrollTrigger = null;
        };
      },
    );

    window.addEventListener(
      "pagehide",
      () => {
        scrubMedia.revert();
        scrubTween.kill();
        resizeObserver.disconnect();
        video.removeEventListener("seeked", handleSeeked);
        if (seekFrame !== null) cancelAnimationFrame(seekFrame);
      },
      { once: true },
    );
  } catch (error) {
    canvas.remove();
    console.warn("Bonsai WebGPU video could not initialize.", error);
  }
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
    window.smoother?.paused(true);
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
      window.smoother?.paused(false);
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
    window.smoother?.paused(true);
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
      window.smoother?.paused(false);
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

    card.classList.remove("is-active");
    card.classList.remove("is-open");
    outer.style.height = "0px";
  }

  function openCard(card) {
    const inner = card.querySelector(".card_dd_inner");
    const outer = card.querySelector(".card_dd_outer");

    if (!inner || !outer) return;

    rememberedBeliefCard = card;
    card.classList.add("is-active", "is-open");
    outer.style.height = `${inner.scrollHeight}px`;
  }

  beliefCards.forEach((beliefCard) => {
    const outer = beliefCard.querySelector(".card_dd_outer");
    if (!outer) return;

    outer.style.height = beliefCard.classList.contains("is-open")
      ? `${outer.querySelector(".card_dd_inner").scrollHeight}px`
      : "0px";

    beliefCard.addEventListener("click", () => {
      AudioManager.playSfx("clickAction");

      const wasOpen = beliefCard.classList.contains("is-open");

      beliefCards.forEach(closeCard);

      // Clicking the open card closes it; otherwise open the clicked card.
      if (!wasOpen) {
        openCard(beliefCard);
      } else if (rememberedBeliefCard === beliefCard) {
        rememberedBeliefCard = null;
      }
    });
  });
}


// Bee Network mobile slider and desktop click sequence
function initBeeNetworkAnimation() {
  const gsap = window.gsap;
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const buttons = [
    document.querySelector("#bee-network-1"),
    document.querySelector("#bee-network-2"),
    document.querySelector("#bee-network-3"),
  ].filter(Boolean);
  const tapIndicator = document.querySelector(
    "#the-network-effect .tap-indicator",
  );
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      AudioManager.playSfx("clickAction");
    });
  });

  if (
    buttons.length &&
    gsap &&
    window.ScrollTrigger
  ) {
    if (prefersReducedMotion) {
      gsap.set([...buttons, tapIndicator].filter(Boolean), {
        opacity: 1,
        yPercent: 0,
        scale: 1,
      });
    } else {
      const beeNetTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#the-network-effect",
          start: "top center",
          end: "bottom bottom",
          scrub: 1,
          // toggleActions: "play none none reverse",
        },
      });

      beeNetTl.from(buttons, {
        opacity: 0,
        yPercent: 100,
        scale: 0,
        transformOrigin: "50% 50%",
        duration: 0.5,
        stagger: 0.5,
        ease: "power2.out",
      });

      if (tapIndicator) {

        const beeNetHeadingTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#the-network-effect",
            start: "top 20% ",
            end: "bottom bottom",
            // scrub: 1,
            toggleActions: "play none none reverse",
          },
        });
        beeNetHeadingTl.from('[network-effect-heading] .word',
          {
            yPercent: 110,
            opacity: 0,
            duration: 1,
            ease: 'power4.out',
            stagger: 0.08,
          },
        )
        .from(
          tapIndicator,
          {
            opacity: 0,
            duration: 0.9,
            ease: "power2.out",
          },"<"
        )
      }
    }
  }

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

  if (!buttons.length) return;
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
  const isMobile = window.matchMedia("(max-width: 991px)").matches;

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

          imageSlides.forEach(() => {
            const progressSegment = document.createElement("span");
            const progressFill = document.createElement("span");

            progressSegment.classList.add(
              "community-image-progress_segment",
            );
            progressFill.classList.add("community-image-progress_fill");

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
    const scrollToCommunityTarget = (target, offset = 0) => {
      const targetElement =
        typeof target === "string" ? document.querySelector(target) : target;

      if (!targetElement) return;

      let targetTop = 0;
      let offsetElement = targetElement;

      // offsetTop preserves the element's original layout position even when
      // the target is currently stuck with position: sticky.
      while (offsetElement) {
        targetTop += offsetElement.offsetTop;
        offsetElement = offsetElement.offsetParent;
      }

      const destination = targetTop + offset;

      const smoother = window.ScrollSmoother?.get();

      if (smoother) {
        const maxScroll = window.ScrollTrigger?.maxScroll(window);
        const clampedDestination =
          typeof maxScroll === "number"
            ? gsap.utils.clamp(0, maxScroll, destination)
            : destination;

        gsap.to(smoother, {
          scrollTop: clampedDestination,
          duration: 0.8,
          ease: "power4.out",
          overwrite: "auto",
        });
        return;
      }

      window.scrollTo({
        top: destination,
        behavior: "smooth",
      });
    };

    const handleBeeTogetherClick = () => {
      scrollToCommunityTarget(trigger, -window.innerHeight * 0.8);
    };

    const handleBeeCampClick = () => {
      scrollToCommunityTarget(trigger, -window.innerHeight);
    };

    beeTogetherButton.addEventListener("click", handleBeeTogetherClick);
    beeCampButton.addEventListener("click", handleBeeCampClick);

    const markerLayer = beeCampButton.closest(".community_option_wrap");
    const beeCampMarkers = Array.from(
      beeCampButton.querySelectorAll(".u-eyebrow-marker"),
    );
    const beeTogetherMarkers = Array.from(
      beeTogetherButton.querySelectorAll(".u-eyebrow-marker"),
    );
    const markerPairs = beeCampMarkers
      .map((sourceMarker, index) => ({
        sourceMarker,
        destinationMarker: beeTogetherMarkers[index],
      }))
      .filter(({ destinationMarker }) => destinationMarker);
    const movingMarkers = [];
    const originalMarkerLayerPosition = markerLayer?.style.position || "";

    const activateCommunity = (activeButton) => {
      const isBeeTogether = activeButton === beeTogetherButton;

      setActiveCommunity(activeButton);
      gsap.to(secondCommunityImage, {
        opacity: isBeeTogether ? 1 : 0,
        duration: 0.6,
        ease: "power2.out",
        overwrite: true,
      });
    };

    gsap.set(secondCommunityImage, { opacity: 0 });

    const communityTimeline = gsap.timeline({
      onComplete: () => activateCommunity(beeTogetherButton),
      onReverseComplete: () => activateCommunity(beeCampButton),
      scrollTrigger: {
        trigger,
        start: "top 100%",
        end: "top 80%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    // communityTimeline.fromTo(
    //   beeCampButton,
    //   {
    //     scale: 1,
    //     transformOrigin: "50% 50%",
    //   },
    //   {
    //     scale: 0.94,
    //     duration: 1,
    //     ease: "none",
    //   },
    //   0,
    // );

    // communityTimeline.fromTo(
    //   beeTogetherButton,
    //   {
    //     scale: 0.94,
    //     transformOrigin: "50% 50%",
    //   },
    //   {
    //     scale: 1,
    //     duration: 1,
    //     ease: "none",
    //   },
    //   0,
    // );

    if (markerLayer && markerPairs.length) {
      if (window.getComputedStyle(markerLayer).position === "static") {
        markerLayer.style.position = "relative";
      }

      const getMarkerBounds = (marker) => {
        const layerBounds = markerLayer.getBoundingClientRect();
        const markerBounds = marker.getBoundingClientRect();

        return {
          x: markerBounds.left - layerBounds.left,
          y: markerBounds.top - layerBounds.top,
          width: markerBounds.width,
          height: markerBounds.height,
        };
      };

      markerPairs.forEach(({ sourceMarker, destinationMarker }) => {
        const movingMarker = sourceMarker.cloneNode(true);

        movingMarker.setAttribute("aria-hidden", "true");
        markerLayer.appendChild(movingMarker);
        movingMarkers.push(movingMarker);

        gsap.set([sourceMarker, destinationMarker], {
          visibility: "hidden",
        });

        gsap.set(movingMarker, {
          position: "absolute",
          top: 0,
          left: 0,
          margin: 0,
          pointerEvents: "none",
          zIndex: 2,
          willChange: "transform, width, height",
        });

        communityTimeline.fromTo(
          movingMarker,
          {
            x: () => getMarkerBounds(sourceMarker).x,
            y: () => getMarkerBounds(sourceMarker).y,
            width: () => getMarkerBounds(sourceMarker).width,
            height: () => getMarkerBounds(sourceMarker).height,
          },
          {
            x: () => getMarkerBounds(destinationMarker).x,
            y: () => getMarkerBounds(destinationMarker).y,
            width: () => getMarkerBounds(destinationMarker).width,
            height: () => getMarkerBounds(destinationMarker).height,
            duration: 1,
            ease: "none",
          },
          0,
        );
      });
    }

    return () => {
      beeTogetherButton.removeEventListener(
        "click",
        handleBeeTogetherClick,
      );
      beeCampButton.removeEventListener("click", handleBeeCampClick);
      gsap.killTweensOf(secondCommunityImage);
      movingMarkers.forEach((movingMarker) => movingMarker.remove());
      gsap.set([beeCampButton, beeTogetherButton], {
        clearProps: "transform,transformOrigin",
      });
      gsap.set([...beeCampMarkers, ...beeTogetherMarkers], {
        clearProps: "visibility",
      });

      if (markerLayer) {
        markerLayer.style.position = originalMarkerLayerPosition;
      }

      setActiveCommunity(beeCampButton);
    };
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

        AudioManager.playSfx("clickAction");
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
        AudioManager.playSfx("clickAction");
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

function initBeliefCardResponsiveScale() {
  const cardWrap = document.querySelector(".belief-card_wrap");

  if (!cardWrap) return;

  const referenceWidth = 1440;
  const referenceHeight = 810;

  function updateScale() {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;

    const scale = isDesktop
      ? Math.min(
          window.innerWidth / referenceWidth,
          window.innerHeight / referenceHeight,
          1
        )
      : 1;

    cardWrap.style.setProperty(
      "--belief-card-scale",
      scale.toFixed(4)
    );

    // Recalculate any currently opened dropdown.
    cardWrap
      .querySelectorAll(".belief-card.is-open")
      .forEach((card) => {
        const outer = card.querySelector(".card_dd_outer");
        const inner = card.querySelector(".card_dd_inner");

        if (outer && inner) {
          outer.style.height = `${inner.scrollHeight}px`;
        }
      });
  }

  updateScale();

  if (window.matchMedia("(min-width: 768px)").matches) {
    window.addEventListener("resize", updateScale, {
      passive: true,
    });

    window.visualViewport?.addEventListener("resize", updateScale, {
      passive: true,
    });
  }

  // window.addEventListener("resize", updateScale);
  // window.visualViewport?.addEventListener("resize", updateScale);
}


document.addEventListener("DOMContentLoaded", () => {
  document.fonts?.ready.then(() => {
    initScrollSmootherStickyPins();
    initBeliefSystemTextAnimation();
    initBonsaiWebGPUVideo();
    openFounderNote();
    openYouTubePopup();
    initBeliefCardAccordion();
    initBeliefCardResponsiveScale();
    initBeeNetworkAnimation();
    initCommunityAnimation();
    initFounderStories();
    initPortfolioSwiper();
    initBeeNetworkTabs();
  })
});
