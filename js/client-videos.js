document.addEventListener("DOMContentLoaded", function () {
  // Select all video elements within containers having the class "videos"
  // This allows the script to handle multiple video players on the page if needed.
  const allVideos = document.querySelectorAll(".videos video");

  // Variable to keep track of the currently playing video, allowing us to pause others.
  let currentPlaying = null;

  // Loop through each found video element to apply the desired behaviors.
  allVideos.forEach((video) => {
    // Flag to ensure the initial seek to 2 seconds for the thumbnail happens only once per video
    // OR when the video has ended and reset to its thumbnail state.
    let hasSeekedForThumbnail = false;

    // Listen for the 'loadedmetadata' event.
    // This event fires when the video's metadata (like duration, dimensions)
    // is loaded, and it's safe to seek to a specific time.
    video.addEventListener("loadedmetadata", function () {
      if (!hasSeekedForThumbnail) {
        // Set the current time to 2 seconds to display that frame as a "thumbnail".
        video.currentTime = 2;
        // Pause the video immediately after seeking to keep that frame visible.
        video.pause();
        // Set the flag to true to indicate it's now in the thumbnail state.
        hasSeekedForThumbnail = true;
      }
    });

    // Listen for the 'play' event.
    // This event fires when the user clicks the play button (native or custom).
    video.addEventListener("play", function () {
      // Check if the video is starting from its initial "thumbnail" position (2 seconds).
      // We use a small tolerance (0.1 seconds) for floating point comparisons to avoid issues.
      // This condition ensures the video only resets to 0 if it's playing from the thumbnail state.
      if (Math.abs(this.currentTime - 2) < 0.1 && hasSeekedForThumbnail) {
        // If it's starting from the thumbnail state, reset to 0 for actual playback.
        this.currentTime = 0;
        // After the first play from thumbnail, set this flag to false.
        // This prevents subsequent plays (after seeking or pausing) from resetting to 0.
        hasSeekedForThumbnail = false;
      }

      // Ensure the video is unmuted when it starts playing.
      this.muted = false;

      // Pause any other video that might be currently playing.
      allVideos.forEach((v) => {
        if (v !== this && !v.paused) {
          v.pause();
        }
      });
      // Update the global tracker for the currently playing video.
      currentPlaying = this;
    });

    // Listen for the 'ended' event.
    // This event fires when the video finishes playing.
    video.addEventListener("ended", function () {
      // When the video finishes, pause it and reset its display to the 2-second mark.
      // This prepares it for a fresh replay, showing the desired thumbnail again.
      this.currentTime = 2;
      this.pause();
      // IMPORTANT: Set hasSeekedForThumbnail back to true.
      // This indicates that the video is now back in its "thumbnail state"
      // and the *next* play should start from the beginning (0 seconds).
      hasSeekedForThumbnail = true;
      // Clear the currentPlaying tracker if this was the video that just ended.
      if (currentPlaying === this) {
        currentPlaying = null;
      }
    });

    // Add an event listener for 'error' events during video loading or playback.
    video.addEventListener("error", function () {
      console.error("Video loading error or playback issue:", this.src);
      // In a production environment, you might display a user-friendly error message here.
    });

    // Initially, unmute the video. Note: modern browsers require user interaction to play sound.
    video.muted = false;

    // Add a click listener to each video.
    // This will toggle play/pause and manage other videos.
    video.addEventListener("click", function (e) {
      // Prevent default click behavior (e.g., if there are overlapping links, though not applicable here).
      e.preventDefault();

      // If the clicked video is not paused (i.e., it's playing), then pause it.
      if (!this.paused) {
        this.pause();
        // If this was the current playing video, clear the tracker.
        if (currentPlaying === this) {
          currentPlaying = null;
        }
      } else {
        // If the clicked video is paused, then play it.
        // The 'play' event listener above will handle setting currentTime to 0 (if applicable) and muting.
        this.play();
      }
    });
  });

  // Console error messages if no video elements are found, for debugging.
  if (allVideos.length === 0) {
    console.error("No video elements found within .videos containers.");
  }
});
