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

    openTimer = window.setTimeout(() => {
      openTimer = null;
      if (mobileQuery.matches) {
        navLinks.classList.add("is-open");
        revealNavItems();
      }
    }, 500);
  }

  function closeMenu() {
    clearTimeout(openTimer);
    openTimer = null;
    if (window.gsap && navItems.length) {
      window.gsap.killTweensOf(navItems);
    }
    navLinks.classList.remove("is-open");
    menuButton.classList.remove("is-active");
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMobileNavbarMenu, {
    once: true,
  });
} else {
  initMobileNavbarMenu();
}
