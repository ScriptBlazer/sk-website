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

      // Get the keys and sort them explicitly
      const sortedYears = Object.keys(normalizedData).sort((a, b) => {
        // Custom sorting logic for years and special keys
        if (a === "") return -1; // Empty string "" always comes first
        if (b === "") return 1; // Empty string "" always comes first

        // For numerical years, sort in descending order
        const numA = parseInt(a);
        const numB = parseInt(b);

        if (!isNaN(numA) && !isNaN(numB)) {
          return numB - numA; // Sort years from newest to oldest (e.g., 2025, 2023, 2022)
        }

        // For non-numerical keys (like "Old Branding"), sort alphabetically
        return a.localeCompare(b);
      });

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
                  muteIcon.style.opacity = video.muted ? "0.7" : "1";
                });

                videoWrapper.appendChild(video);
                videoWrapper.appendChild(timeline);
                videoWrapper.appendChild(muteIcon);

                if (caption) wrapper.appendChild(caption);
                wrapper.appendChild(videoWrapper);
              }

              grid.appendChild(wrapper);
            });

            yearSection.appendChild(grid);
            yearSection.appendChild(document.createElement("br"));
          }
        });

        container.appendChild(yearSection);
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
