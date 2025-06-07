// Function to load HTML components and run an optional callback
async function loadComponent(elementId, path, callback) {
  try {
    const response = await fetch(path);
    const html = await response.text();
    const container = document.getElementById(elementId);
    if (container) {
      container.innerHTML = html;

      // Execute callback if provided
      if (callback && typeof callback === "function") {
        callback();
      }
    }
  } catch (error) {
    console.error(`Error loading component for ${elementId}:`, error);
  }
}

// Function to initialize mobile menu functionality
function initializeMobileMenu() {
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (mobileMenuBtn && navLinks) {
    // Toggle menu open/close
    mobileMenuBtn.addEventListener("click", () => {
      const isOpening = !navLinks.classList.contains("active");

      navLinks.classList.toggle("active");
      mobileMenuBtn.classList.toggle("active");

      if (isOpening) {
        document.body.classList.add("menu-open");
      } else {
        document.body.classList.remove("menu-open");
      }
    });

    // Close menu on outside click
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".main-nav")) {
        navLinks.classList.remove("active");
        mobileMenuBtn.classList.remove("active");
        document.body.classList.remove("menu-open");
      }
    });

    // Close menu when clicking any nav link
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        mobileMenuBtn.classList.remove("active");
        document.body.classList.remove("menu-open");
      });
    });
  }
}

// Function to initialize smooth scrolling
function initializeSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        // Close mobile menu after clicking a link (if mobile menu exists)
        const navLinks = document.querySelector(".nav-links");
        const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
        if (navLinks && mobileMenuBtn) {
          navLinks.classList.remove("active");
          mobileMenuBtn.classList.remove("active");
        }
      }
    });
  });
}

// Function to initialize hero heading animation
function initializeHeroAnimation() {
  const headings = document.querySelectorAll(".hero-heading");
  let currentHeadingIndex = 0;
  const animationDuration = 1000;
  const displayDuration = 1000;

  function animateHeadings() {
    const currentHeading = headings[currentHeadingIndex];
    const nextHeadingIndex = (currentHeadingIndex + 1) % headings.length;
    const nextHeading = headings[nextHeadingIndex];

    if (!headings || headings.length <= 1) {
      if (currentHeading) {
        currentHeading.classList.add("active");
      }
      return;
    }

    currentHeading.style.animation = `slide-out-left ${
      animationDuration / 1000
    }s ease-in-out forwards`;

    setTimeout(() => {
      currentHeading.classList.remove("active");
      currentHeading.style.animation = "";

      nextHeading.classList.add("active");
      nextHeading.style.animation = `slide-in-right ${
        animationDuration / 1000
      }s ease-in-out forwards`;

      setTimeout(() => {
        nextHeading.style.animation = "";
        currentHeadingIndex = nextHeadingIndex;
        animateHeadings();
      }, animationDuration + displayDuration);
    }, animationDuration / 2);
  }

  if (headings.length > 0) {
    headings[currentHeadingIndex].classList.add("active");
    setTimeout(animateHeadings, displayDuration);
  }
}

// Load header and footer when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("Components loaded");
  const currentPath = window.location.pathname;
  const depth = window.location.pathname
    .split("/")
    .filter((segment) => segment !== "").length;

  const prefix = "../".repeat(depth - 1); // minus 1 to stay relative to root

  loadComponent("header-container", `${prefix}components/header.html`, () => {
    initializeMobileMenu();
    initializeSmoothScrolling();
    initializeHeroAnimation();
    highlightCurrentNavLink();
  });

  loadComponent("footer-container", `${prefix}components/footer.html`);
});

function highlightCurrentNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href").replace(/^\//, "");
    if (href === currentPage) {
      link.classList.add("active");
    }
  });
}
