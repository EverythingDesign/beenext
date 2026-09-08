// Mobile navigation menu
function initMobileNavbarMenu() {
  const menuButton = document.querySelector(".menu-btn");
  const navLinks = document.querySelector(".nav_links_component");

  if (!menuButton || !navLinks) return;

  const mobileQuery = window.matchMedia("(max-width: 991px)");
  const navItems = [
    ...navLinks.querySelectorAll(".nav_links_item"),
  ];
  let openTimer = null;
  let closeTimer = null;

  function resetNavItems() {
    if (window.gsap && navItems.length) {
      window.gsap.killTweensOf(navItems);
      window.gsap.set(navItems, { opacity: 0 });
      return;
    }

    navItems.forEach((item) => {
      item.style.opacity = "0";
    });
  }

  function revealNavItems() {
    if (window.gsap && navItems.length) {
      window.gsap.fromTo(
        navItems,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          clearProps: "opacity",
        },
      );
      return;
    }

    navItems.forEach((item) => {
      item.style.opacity = "1";
    });
  }

  function openMenu() {
    if (!mobileQuery.matches) return;

    clearTimeout(closeTimer);
    resetNavItems();
    navLinks.style.display = "flex";
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.classList.add("is-active");
    window.BNScroll?.lock?.();

    openTimer = window.setTimeout(() => {
      openTimer = null;
      if (mobileQuery.matches) {
        navLinks.classList.add("is-open");
        revealNavItems();
      }
    }, 0);
  }

  function closeMenu() {
    clearTimeout(openTimer);
    openTimer = null;
    if (window.gsap && navItems.length) {
      window.gsap.killTweensOf(navItems);
    }
    navLinks.classList.remove("is-open");
    menuButton.classList.remove("is-active");
    window.BNScroll?.unlock?.();
    resetNavItems();
    menuButton.setAttribute("aria-expanded", "false");

    clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      closeTimer = null;
      if (!navLinks.classList.contains("is-open")) {
        navLinks.style.display = "none";
      }
    }, 500);
  }

  menuButton.setAttribute("aria-expanded", "false");
  menuButton.addEventListener("click", () => {
    if (!mobileQuery.matches) return;

    const isOpening = openTimer !== null;
    const isOpen = navLinks.classList.contains("is-open");

    if (isOpening || isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  mobileQuery.addEventListener?.("change", ({ matches }) => {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    openTimer = null;
    closeTimer = null;

    if (!matches) {
      window.BNScroll?.unlock?.();
      navLinks.classList.remove("is-open");
      navLinks.style.removeProperty("display");
      menuButton.classList.remove("is-active");
      if (window.gsap && navItems.length) {
        window.gsap.set(navItems, { clearProps: "opacity" });
      } else {
        navItems.forEach((item) => item.style.removeProperty("opacity"));
      }
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

// Keep the navigation colors in sync with the section behind the fixed nav.
function initNavbarBackgroundState() {
  const nav = document.querySelector(".nav_component");
  const whiteBackgrounds = [
    ...document.querySelectorAll(".u-background-2"),
  ];

  if (!nav || !whiteBackgrounds.length) return;

  const whiteBackgroundClass = "is-white-bg";
  const surfaceSelector =
    ".u-background-2, .u-background-1, .u-background-cream, .u-section, footer";
  let frame = null;

  function isWhiteBackgroundAtViewportTop() {
    const probeX = Math.max(
      0,
      Math.min(window.innerWidth - 1, window.innerWidth / 2),
    );
    const probeY = Math.max(0, Math.min(window.innerHeight - 1, 1));

    if (document.elementsFromPoint) {
      const elementsAtTop = document.elementsFromPoint(probeX, probeY);

      for (const element of elementsAtTop) {
        if (element === nav || nav.contains(element)) continue;

        const surface = element.closest(surfaceSelector);
        if (!surface || surface === nav || nav.contains(surface)) continue;

        return surface.classList.contains("u-background-2");
      }
    }

    return whiteBackgrounds.some((background) => {
      const bounds = background.getBoundingClientRect();
      return bounds.top <= probeY && bounds.bottom > probeY;
    });
  }

  function updateNavbarBackground() {
    frame = null;
    nav.classList.toggle(
      whiteBackgroundClass,
      isWhiteBackgroundAtViewportTop(),
    );
  }

  function scheduleNavbarBackgroundUpdate() {
    if (frame !== null) return;
    frame = window.requestAnimationFrame(updateNavbarBackground);
  }

  updateNavbarBackground();
  window.addEventListener("scroll", scheduleNavbarBackgroundUpdate, {
    passive: true,
  });
  window.addEventListener("resize", scheduleNavbarBackgroundUpdate, {
    passive: true,
  });
  window.addEventListener("load", scheduleNavbarBackgroundUpdate, {
    once: true,
  });
  window.addEventListener("pageshow", scheduleNavbarBackgroundUpdate);
  window.ScrollTrigger?.addEventListener(
    "refresh",
    scheduleNavbarBackgroundUpdate,
  );
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      initMobileNavbarMenu();
      initNavbarBackgroundState();
    },
    { once: true },
  );
} else {
  initMobileNavbarMenu();
  initNavbarBackgroundState();
}
