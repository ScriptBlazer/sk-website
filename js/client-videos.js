document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("client-videos");

  const filename = window.location.pathname.split("/").pop().split(".")[0];
  const jsonPath = `../../videos json/${filename}.json`;

  fetch(jsonPath)
    .then((res) => res.json())
    .then((data) => {
      const normalizedData = {};

      const isFlatStructure = data.landscape || data.portrait;
      if (isFlatStructure) {
        normalizedData[""] = data;
      } else {
        Object.assign(normalizedData, data);
      }

      // --- MODIFIED SORTING LOGIC START ---
      const allKeys = Object.keys(normalizedData);
      const numericKeys = [];
      const nonNumericKeys = [];
      const nonNumericKeyOrder = {}; // To store the original index for non-numeric keys

      allKeys.forEach((key, index) => {
        // Check if the key is composed entirely of digits
        if (/^\d+$/.test(key)) {
          numericKeys.push(key);
        } else {
          nonNumericKeys.push(key);
          nonNumericKeyOrder[key] = index; // Store original position
        }
      });

      // Sort numeric keys from highest to lowest
      numericKeys.sort((a, b) => parseInt(b) - parseInt(a));

      // Sort non-numeric keys by their original appearance order in the JSON
      nonNumericKeys.sort(
        (a, b) => nonNumericKeyOrder[a] - nonNumericKeyOrder[b]
      );

      // Combine the sorted keys.
      // This part is the most critical for your specific requirement.
      // We will iterate through the original keys' order to decide where to place
      // the sorted numeric keys and the preserved non-numeric keys.
      // This is a more complex merge to respect both internal ordering and original JSON order.

      const sortedYears = [];
      let numericIndex = 0;
      let nonNumericIndex = 0;

      // Reconstruct the order based on the original `allKeys`
      allKeys.forEach((originalKey) => {
        if (/^\d+$/.test(originalKey)) {
          // If the original key was numeric, add the next highest numeric key
          // from our sorted list. This assumes all numeric keys will eventually be consumed.
          if (numericIndex < numericKeys.length) {
            sortedYears.push(numericKeys[numericIndex]);
            numericIndex++;
          }
        } else {
          // If the original key was non-numeric, add the next non-numeric key
          // from our insertion-order preserved list.
          if (nonNumericIndex < nonNumericKeys.length) {
            sortedYears.push(nonNumericKeys[nonNumericIndex]);
            nonNumericIndex++;
          }
        }
      });

      // Handle any remaining numeric keys if the allKeys loop finishes first
      while (numericIndex < numericKeys.length) {
        sortedYears.push(numericKeys[numericIndex]);
        numericIndex++;
      }
      // Handle any remaining non-numeric keys if the allKeys loop finishes first
      while (nonNumericIndex < nonNumericKeys.length) {
        sortedYears.push(nonNumericKeys[nonNumericIndex]);
        nonNumericIndex++;
      }

      // A simpler, more reliable approach for combining, sacrificing strict inter-type insertion order
      // but guaranteeing numeric descending and non-numeric insertion order *within their groups*.
      // If you have "Pizza", "2023", "Chicken", "2022" in your JSON, and you want them to appear
      // exactly in that order (Pizza, 2023, Chicken, 2022), the above complex merge is needed.
      // However, if the numeric keys might be interspersed and you want them sorted,
      // it's often easier to group them.
      // Let's stick with the more robust approach that tries to preserve the inter-type order.
      // The `allKeys.forEach` loop above is a good attempt at that.

      // --- MODIFIED SORTING LOGIC END ---

      // Iterate over the sorted keys
      sortedYears.forEach((year) => {
        const layouts = normalizedData[year];
        const yearSection = document.createElement("section");
        yearSection.className = "year-section";

        if (year) {
          const yearHeading = document.createElement("h2");
          yearHeading.textContent = year;
          yearSection.appendChild(yearHeading);
        }

        Object.keys(layouts).forEach((layout) => {
          if (!layouts[layout]) return;

          const grid = document.createElement("div");

          const baseLayout = layout.replace(/[0-9]/g, "");
          grid.className = `video-grid ${baseLayout}-videos ${layout}-videos`;

          if (Array.isArray(layouts[layout])) {
            layouts[layout].forEach((item, index) => {
              const wrapper = document.createElement("div");
              wrapper.className = "videos";

              let caption = null;
              if (
                item.title &&
                !(index === 0 && year === "" && isFlatStructure)
              ) {
                caption = document.createElement("h3");
                caption.className = "caption";
                caption.textContent = item.title;
              }

              if (item.type === "iframe") {
                const iframe = document.createElement("iframe");
                iframe.src = item.video;
                iframe.setAttribute("title", item.title);
                iframe.setAttribute("frameborder", "0");
                iframe.setAttribute("allowfullscreen", true);
                iframe.setAttribute(
                  "allow",
                  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                );
                if (caption) wrapper.appendChild(caption);
                wrapper.appendChild(iframe);
              } else {
                const videoWrapper = document.createElement("div");
                videoWrapper.className = "video-wrapper";
                videoWrapper.style.position = "relative";

                const video = document.createElement("video");
                video.className = "custom-video";
                video.setAttribute("playsinline", "");
                video.setAttribute("preload", "none");
                video.setAttribute("poster", item.thumbnail);
                video.setAttribute("data-src", item.video);
                video.muted = false;

                const source = document.createElement("source");
                source.type = "video/mp4";
                video.appendChild(source);
                video.append("Your browser does not support the video tag.");

                const muteIcon = document.createElement("img");
                muteIcon.className = "mute-toggle";
                muteIcon.src = "/images/misc/music_note_icon.png";
                muteIcon.alt = "Toggle Mute";
                muteIcon.style.opacity = "1";

                const timeline = document.createElement("input");
                timeline.type = "range";
                timeline.className = "video-timeline";
                timeline.min = 0;
                timeline.value = 0;
                timeline.step = 0.01;

                let fullscreenButton = null; // Declare it outside the if to be accessible later

                // Only create the fullscreen button for landscape videos
                // Check if it's a landscape layout in a nested structure OR
                // if it's a flat structure AND the current layout being processed is 'landscape'
                if (
                  baseLayout === "landscape" ||
                  (isFlatStructure && layout === "landscape")
                ) {
                  fullscreenButton = document.createElement("span");
                  fullscreenButton.className =
                    "material-symbols-outlined fullscreen-toggle";
                  fullscreenButton.textContent = "fullscreen";
                  fullscreenButton.alt = "Toggle Fullscreen";

                  // Fullscreen functionality (attached only if button is created)
                  fullscreenButton.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (
                      document.fullscreenElement ||
                      document.webkitFullscreenElement ||
                      document.mozFullScreenElement ||
                      document.msFullscreenElement
                    ) {
                      if (document.exitFullscreen) {
                        document.exitFullscreen();
                      } else if (document.mozCancelFullScreen) {
                        /* Firefox */
                        document.mozCancelFullScreen();
                      } else if (document.webkitExitFullscreen) {
                        /* Chrome, Safari and Opera */
                        document.webkitExitFullscreen();
                      } else if (document.msExitFullscreen) {
                        /* IE/Edge */
                        document.msExitFullscreen();
                      }
                    } else {
                      if (videoWrapper.requestFullscreen) {
                        videoWrapper.requestFullscreen();
                      } else if (videoWrapper.mozRequestFullScreen) {
                        /* Firefox */
                        videoWrapper.mozRequestFullScreen();
                      } else if (videoWrapper.webkitRequestFullscreen) {
                        /* Chrome, Safari and Opera */
                        videoWrapper.webkitRequestFullscreen();
                      } else if (videoWrapper.msRequestFullscreen) {
                        /* IE/Edge */
                        videoWrapper.msRequestFullscreen();
                      }
                    }
                  });
                }
                // --- END: MODIFIED SECTION FOR FULLSCREEN TOGGLE ---

                video.addEventListener("timeupdate", () => {
                  timeline.max = video.duration || 1;
                  timeline.value = video.currentTime;
                });

                timeline.addEventListener("input", () => {
                  video.currentTime = timeline.value;
                });

                muteIcon.addEventListener("click", (e) => {
                  e.stopPropagation();
                  video.muted = !video.muted;
                  muteIcon.src = video.muted ? "/images/misc/music_note_icon_mute.png" : "/images/misc/music_note_icon.png";
                });

                videoWrapper.appendChild(video);
                videoWrapper.appendChild(timeline);
                videoWrapper.appendChild(muteIcon);

                // --- START: MODIFIED APPENDING OF FULLSCREEN BUTTON ---
                if (fullscreenButton) {
                  // Only append if the button was created
                  videoWrapper.appendChild(fullscreenButton);
                }
                // --- END: MODIFIED APPENDING OF FULLSCREEN BUTTON ---

                if (caption) wrapper.appendChild(caption);
                wrapper.appendChild(videoWrapper);
              }

              grid.appendChild(wrapper);
            });

            yearSection.appendChild(grid);
            yearSection.appendChild(document.createElement("br"));
          }
        });

        if (container) {
          container.appendChild(yearSection);
        }
      });

      initializeLazyVideos();
    })
    .catch((err) => {
      console.error("❌ Could not load video JSON:", err);
    });

  function initializeLazyVideos() {
    const lazyVideos = document.querySelectorAll("video[data-src]");
    let currentPlaying = null;
    const initializedVideos = new WeakSet();

    const loadVideo = (video) => {
      const source = video.querySelector("source");
      const dataSrc = video.getAttribute("data-src");
      if (source && dataSrc) {
        source.src = dataSrc;
        video.load();
        video.removeAttribute("data-src");
      }
    };

    const setupVideo = (video) => {
      if (initializedVideos.has(video)) return;
      initializedVideos.add(video);

      video.addEventListener("play", function () {
        document.querySelectorAll(".videos video").forEach((v) => {
          if (v !== this && !v.paused) v.pause();
        });
        currentPlaying = this;
      });

      video.addEventListener("ended", function () {
        if (currentPlaying === this) currentPlaying = null;
      });

      video.addEventListener("error", function () {
        console.error("Video error:", this.querySelector("source")?.src);
      });

      video.addEventListener("click", function (e) {
        e.preventDefault();
        this.paused ? this.play() : this.pause();
      });
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            setupVideo(video);
            if (entry.isIntersecting) {
              if (video.hasAttribute("data-src")) loadVideo(video);
            } else {
              if (!video.paused) video.pause();
            }
          });
        },
        { threshold: 0.25 }
      );

      lazyVideos.forEach((video) => observer.observe(video));
    } else {
      lazyVideos.forEach((video) => {
        loadVideo(video);
        setupVideo(video);
      });
    }
  }
});
