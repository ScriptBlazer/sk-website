// Email validation helper function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Form validation for contact form
const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const message = document.querySelector("#message").value.trim();

    let isValid = true;
    let errorMessage = "";

    if (!name) {
      isValid = false;
      errorMessage += "Please enter your name.\n";
    }

    if (!email) {
      isValid = false;
      errorMessage += "Please enter your email.\n";
    } else if (!isValidEmail(email)) {
      isValid = false;
      errorMessage += "Please enter a valid email address.\n";
    }

    if (!message) {
      isValid = false;
      errorMessage += "Please enter your message.\n";
    }

    if (isValid) {
      // Here you would typically send the form data to your server
      alert("Thank you for your message! We will get back to you soon.");
      contactForm.reset();
    } else {
      alert(errorMessage);
    }
  });
}
