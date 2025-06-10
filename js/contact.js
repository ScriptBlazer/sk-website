const sendButton = document.getElementById("send-button");

if (sendButton) {
  sendButton.addEventListener("click", () => {
    // Get input values
    const name = document.querySelector("#name").value.trim();
    const subject = document.querySelector("#subject").value.trim();
    const message = document.querySelector("#message").value.trim();

    // Clear previous error messages
    document
      .querySelectorAll(".form-error")
      .forEach((el) => (el.textContent = ""));

    let hasError = false;

    if (!name) {
      document.querySelector("#name-error").textContent =
        "Please enter your name.";
      hasError = true;
    }

    if (!subject) {
      document.querySelector("#subject-error").textContent =
        "Please enter a subject.";
      hasError = true;
    }

    if (!message) {
      document.querySelector("#message-error").textContent =
        "Please enter a message.";
      hasError = true;
    }

    if (hasError) return;

    // Construct mailto link
    const mailtoLink = `mailto:info@socialklick.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(message + "\n\n— " + name)}`;
    window.location.href = mailtoLink;
  });
}
