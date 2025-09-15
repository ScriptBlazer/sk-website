// Universal loader hide logic: hide loader on DOMContentLoaded unless a page takes over
// This must be at the very top of the file

document.addEventListener("DOMContentLoaded", function() {
  var loader = document.getElementById('page-loader-overlay');
  if (loader) loader.classList.add('hide');
});

// Hide loader on bfcache restore (back/forward navigation)
window.addEventListener('pageshow', function(event) {
  var loader = document.getElementById('page-loader-overlay');
  if (loader) loader.classList.add('hide');
});

// Function to load HTML components and run an optional callback
async function loadComponent(elementId, path, callback) {
  try {
    const response = await fetch(path);
    const html = await response.text();
    const container = document.getElementById(elementId);
    if (container) {
      container.innerHTML = html;
      // Hide loader after component loads
      var loader = document.getElementById('page-loader-overlay');
      if (loader) loader.classList.add('hide');
      // Execute callback if provided
      if (callback && typeof callback === "function") {
        callback();
      }
    }
  } catch (error) {
    console.error(`Error loading component for ${elementId}:`, error);
    // Hide loader even if fetch fails
    var loader = document.getElementById('page-loader-overlay');
    if (loader) loader.classList.add('hide');
  }
}

// Fallback: hide loader after 5 seconds no matter what
setTimeout(function() {
  var loader = document.getElementById('page-loader-overlay');
  if (loader) loader.classList.add('hide');
}, 5000);

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

// Adds "active" class to the nav link that matches the current page URL
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

// --- Predictive Preloading Logic ---

// Map of page paths to an array of critical assets to preload for that page
// Use absolute paths (starting with '/') for consistency.
const pageAssetsToPreload = {
  "/portfolio.html": [
    // Added for the main portfolio page
    "https://sam-animation-bucket.s3.eu-north-1.amazonaws.com/Animation+vids/sk-website-page-vids/Corporate+reel.mp4",
    "https://sam-animation-bucket.s3.eu-north-1.amazonaws.com/Animation+vids/sk-website-page-vids/Charity+reel.mp4",
    "https://sam-animation-bucket.s3.eu-north-1.amazonaws.com/Animation+vids/sk-website-page-vids/Whatsapp+reel.mp4",
    "https://sam-animation-bucket.s3.eu-north-1.amazonaws.com/Animation+vids/sk-website-page-vids/Corporate+reel+landscape.mp4", // Add landscape versions if applicable
    "https://sam-animation-bucket.s3.eu-north-1.amazonaws.com/Animation+vids/sk-website-page-vids/Charity+reel+landscape.mp4",
    "https://sam-animation-bucket.s3.eu-north-1.amazonaws.com/Animation+vids/sk-website-page-vids/Whatsapp+reel+landscape.mp4",
  ],
  "/portfolio/corporate.html": [
    "/images/client-logos/corporate/Carpet City.png",
    "/images/client-logos/corporate/Grapevine.png",
    "/images/client-logos/corporate/JTrade.png",
    "/images/client-logos/corporate/Meilech Halpern.png",
    "/images/client-logos/corporate/Keepout.png",
    "/images/client-logos/corporate/Plan it Rite.png",
  ],
  "/portfolio/charity.html": [
    "/images/client-logos/charity/ACS.png",
    "/images/client-logos/charity/Belze.png",
    "/images/client-logos/charity/Chaveirim.png",
    "/images/client-logos/charity/Hatzoloh.png",
    "/images/client-logos/charity/JHBJ.png",
    "/images/client-logos/charity/Kol Boniach.png",
    "/images/client-logos/charity/MARS.png",
    "/images/client-logos/charity/Oraysa.png",
    "/images/client-logos/charity/SBS.png",
    "/images/client-logos/charity/Tikvatenoe.png",
  ],
  "/portfolio/whatsappvideos.html": [
    // IMPORTANT: Add the specific logo/thumbnail paths for whatsappvideos.html here.
    // Example: '/images/client-logos/whatsapp/some-whatsapp-logo.png',
  ],
};

// Use a Set to keep track of pages for which assets have already been preloaded
const preloadedPages = new Set();

/**
 * Handles the mouseover event on a link to trigger preloading of the destination page's assets.
 * @param {Event} event The mouseover event object.
 */
function handleLinkHover(event) {
  const linkElement = event.currentTarget; // The <a> tag that was hovered over
  let href = linkElement.getAttribute("href");

  // Convert relative href to an absolute path for consistent matching with pageAssetsToPreload keys
  // Example: 'portfolio/corporate.html' becomes '/portfolio/corporate.html' if index.html is at root
  if (href && !href.startsWith("/") && !href.startsWith("http")) {
    const currentPath = window.location.pathname;
    const currentDirectory = currentPath.substring(
      0,
      currentPath.lastIndexOf("/") + 1
    ); // Ensure trailing slash
    try {
      href = new URL(href, window.location.origin + currentDirectory).pathname;
    } catch (e) {
      console.error("Error resolving relative URL for preloading:", e);
      return; // Exit if URL is invalid
    }
  }

  // Check if we have assets to preload for this href and haven't preloaded them yet
  if (href && pageAssetsToPreload[href] && !preloadedPages.has(href)) {
    const assetsToPreload = pageAssetsToPreload[href];
    const head = document.head;

    assetsToPreload.forEach((assetUrl) => {
      // Check if the asset is already in the DOM (e.g., from a static preload tag on a previous page)
      if (!document.querySelector(`link[rel="preload"][href="${assetUrl}"]`)) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as =
          assetUrl.endsWith(".mp4") || assetUrl.endsWith(".webm")
            ? "video"
            : "image"; // Determine type based on extension
        link.href = assetUrl;
        // Add media queries if you have responsive versions for these specific assets
        // Example: link.media = "(max-width: 768px)";

        head.appendChild(link);
        // console.log(`Dynamically preloading: ${assetUrl}`); // Uncomment for debugging
      }
    });

    preloadedPages.add(href); // Mark this page's assets as preloaded
  }
}

// --- Main Document Ready Listener  ---

document.addEventListener("DOMContentLoaded", () => {
  console.log("Components loaded");

  // Attach mouseover listener to the "Explore Our Work" button
  const exploreButton = document.querySelector(
    ".clients-video-section .explore-button"
  );
  if (exploreButton) {
    exploreButton.addEventListener("mouseover", handleLinkHover, {
      once: false,
      passive: true,
    });
  }

  // Attach mouseover listeners to the portfolio category links on the main page (if applicable)
  // This targets the links directly within the main portfolio section on index.html
  const categoryGridLinks = document.querySelectorAll(".category-grid a");
  categoryGridLinks.forEach((link) => {
    link.addEventListener("mouseover", handleLinkHover, {
      once: false,
      passive: true,
    });
  });

  // Load header and then attach listeners to its navigation links
  loadComponent("header-container", "/components/header.html", () => {
    initializeMobileMenu();
    initializeSmoothScrolling();
    initializeHeroAnimation();
    highlightCurrentNavLink();

    // Attach mouseover listener to navigation links (inside the loaded header)
    // Adjust this selector if your header's navigation links have different classes or structure
    const navLinks = document.querySelectorAll(".main-nav a, .nav-links a"); // Targeting common nav link structures
    navLinks.forEach((link) => {
      // Only attach if the link's href is a target for which we have assets to preload
      // This prevents attaching to external links or #anchors unnecessarily
      const href = link.getAttribute("href");
      let absoluteHref = href;
      if (href && !href.startsWith("/") && !href.startsWith("http")) {
        // Handle relative paths
        const currentPath = window.location.pathname;
        const currentDirectory = currentPath.substring(
          0,
          currentPath.lastIndexOf("/") + 1
        );
        try {
          absoluteHref = new URL(
            href,
            window.location.origin + currentDirectory
          ).pathname;
        } catch (e) {
          console.error("Error resolving nav URL for preloading:", e);
          return;
        }
      }
      if (pageAssetsToPreload[absoluteHref]) {
        link.addEventListener("mouseover", handleLinkHover, {
          once: false,
          passive: true,
        });
      }
    });
  });

  loadComponent("footer-container", "/components/footer.html");
});

// Global navigation loader: show loader on internal link click
(function() {
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;
    // Only handle internal links (not external, not target _blank, not mailto/tel)
    const href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      link.target === '_blank' ||
      link.hasAttribute('download')
    ) return;
    // Show loader
    const loader = document.getElementById('page-loader-overlay');
    if (loader) loader.classList.remove('hide');
  }, true); // Use capture to catch early
})();
