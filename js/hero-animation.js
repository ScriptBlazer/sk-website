document.addEventListener("DOMContentLoaded", () => {
  const headings = document.querySelectorAll(".hero-heading");
  let current = 0;

  // Set base styles
  headings.forEach((heading) => {
    heading.style.transition = "opacity 0.5s ease, transform 1s ease";
    heading.style.position = "absolute";
    heading.style.opacity = "0";
    heading.style.visibility = "hidden";
    heading.style.transform = "translateX(100%)";
  });

  function showHeading(index) {
    const heading = headings[index];
    heading.style.visibility = "visible";
    heading.style.opacity = "1";

    // Wait for opacity fade-in to complete, then slide in
    setTimeout(() => {
      heading.style.transform = "translateX(0)";
    }, 200); // match fade duration
  }

  function hideHeading(index) {
    const heading = headings[index];
    heading.style.opacity = "0";
    heading.style.transform = "translateX(-100%)";

    // Wait for transform to finish, then hide
    setTimeout(() => {
      heading.style.visibility = "hidden";
      heading.style.transform = "translateX(100%)"; // reset
    }, 1000); // match slide duration
  }

  // Initial delay to avoid layout shift
  setTimeout(() => {
    showHeading(current);

    setInterval(() => {
      hideHeading(current);
      current = (current + 1) % headings.length;
      showHeading(current);
    }, 4000);
  }, 300); // slight delay before starting
});
