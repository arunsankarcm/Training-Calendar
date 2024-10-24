const successMessage = sessionStorage.getItem("successMessage");

if (successMessage) {
  const messageElement = document.getElementById("message");
  messageElement.textContent = successMessage;

  setTimeout(() => {
    messageElement.classList.add("fade-out");
    setTimeout(() => {
      sessionStorage.removeItem("successMessage");
      messageElement.textContent = "";
    }, 1000);
  }, 1500);
}
