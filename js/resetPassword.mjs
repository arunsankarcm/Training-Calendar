import { auth, db } from "../firebaseConfig.mjs";
import {
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

document.getElementById("backToLogin").addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "loginpage.html";
});


onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, so you can access the email
    const userEmail = user.email;
    console.log("User's email address:", userEmail);

    // You can use the email address in your logic, for example, autofill fields
    document.getElementById("resetEmail").value = userEmail;
  } else {
    // No user is signed in, handle accordingly (e.g., redirect to login)
    console.log("No user is logged in.");
  }
});


document.getElementById("reset_form").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("resetEmail").value;
  const resetMessage = document.getElementById("reset-message");

  sendPasswordResetEmail(auth, email)
    .then(() => {
      resetMessage.style.color = "green";
      resetMessage.textContent =
        "Password reset email sent. Please check your inbox.";
    })
    .catch((error) => {
      resetMessage.style.color = "red";
      resetMessage.textContent = "Invalid Email Address";
      const errorCode = error.code;
      const errorMessage = error.message;
      
    });
});

document.getElementById("resetEmail").addEventListener("focus", () => {
  const resetMessage = document.getElementById("reset-message");
  resetMessage.textContent = ""; // Clear the error message
});
