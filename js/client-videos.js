// Wait until the entire DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Select all video elements that have a data-src attribute (for lazy loading)
  const lazyVideos = document.querySelectorAll("video[data-src]");

  // Track the currently playing video to pause others
  let currentPlaying = null;

  // WeakSet to remember which videos have already been initialized (setup only once)
  const initializedVideos = new WeakSet();

  /**
   * Loads the actual video source from data-src and starts buffering.
   * Used to lazy-load the video only when it's near the viewport.
   */
  const loadVideo = (video) => {
    const source = video.querySelector("source");
    const dataSrc = video.getAttribute("data-src");
    if (source && dataSrc) {
      source.src = dataSrc; // Assign actual video source
      video.load(); // Begin loading the video
      video.removeAttribute("data-src"); // Prevent reloading on next scroll
    }
  };

  /**
   * Sets up video behaviors such as:
   * - Thumbnail preview (seek to 2s)
   * - Play/pause toggle on click
   * - Reset on end
   * - Pause other videos
   * - Log errors
   */
  const setupVideo = (video) => {
    // Prevent setting up the same video multiple times
    if (initializedVideos.has(video)) return;
    initializedVideos.add(video);

    // Flag to avoid seeking multiple times for thumbnail
    let hasSeekedForThumbnail = false;

    // Seek to 2s to show a nice thumbnail once metadata (duration, dimensions) is ready
    video.addEventListener("loadedmetadata", function () {
      if (!hasSeekedForThumbnail) {
        video.currentTime = 2;
        video.pause();
        hasSeekedForThumbnail = true;
      }
    });

    // When the video is played
    video.addEventListener("play", function () {
      // If it started from 2s (thumbnail), restart from beginning
      if (Math.abs(this.currentTime - 2) < 0.1 && hasSeekedForThumbnail) {
        this.currentTime = 0;
        hasSeekedForThumbnail = false;
      }

      // Pause any other currently playing video
      document.querySelectorAll(".videos video").forEach((v) => {
        if (v !== this && !v.paused) v.pause();
      });

      currentPlaying = this;
    });

    // When video finishes playing, return it to thumbnail preview state
    video.addEventListener("ended", function () {
      this.currentTime = 2;
      this.pause();
      hasSeekedForThumbnail = true;
      if (currentPlaying === this) currentPlaying = null;
    });

    // Handle video errors gracefully
    video.addEventListener("error", function () {
      console.error("Video error:", this.querySelector("source")?.src);
    });

    // Toggle play/pause on video click
    video.addEventListener("click", function (e) {
      e.preventDefault(); // Prevent default behavior (e.g., link clicks if wrapped)
      if (!this.paused) {
        this.pause();
        if (currentPlaying === this) currentPlaying = null;
      } else {
        this.play();
      }
    });
  };

  /**
   * IntersectionObserver to:
   * - Lazy-load videos when they are about to come into view
   * - Pause videos that are scrolled out of view
   */
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          const video = entry.target;

          // Always set up the video functionality (once)
          setupVideo(video);

          if (entry.isIntersecting) {
            // If the video is in view and has not yet been loaded, load it
            if (video.hasAttribute("data-src")) {
              loadVideo(video);
            }
          } else {
            // Pause video when it's scrolled out of view
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      {
        threshold: 0.25, // Consider video "visible" when 25% is in the viewport
      }
    );

    // Start observing each lazy video
    lazyVideos.forEach((video) => observer.observe(video));
  } else {
    // Fallback for old browsers: load and initialize all videos immediately
    lazyVideos.forEach((video) => {
      loadVideo(video);
      setupVideo(video);
    });
  }
});
