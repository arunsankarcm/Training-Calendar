import { auth, db } from "../firebaseConfig.mjs";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  ref,
  update,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("error-message");

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      errorMessage.textContent = "";
      sessionStorage.setItem("successMessage", "Successfully logged in!");
      window.location.href = "viewAllCourse.html";

      const user = userCredential.user;
      const dt = new Date().toISOString(); // Store date in ISO format for consistency

      // Update only the last_login field in Firebase without affecting other fields
      update(ref(db, "users/" + user.uid), {
        last_login: dt
      })
      .then(() => {
        console.log("Last login updated successfully");
      })
      .catch((error) => {
        console.error("Error updating last login:", error);
      });
    })
    .catch((error) => {
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
      errorMessage.textContent = "Invalid email or password. Please try again.";
      console.error("Login error:", error.code, error.message);
    });
});

// Check if user is authenticated
onAuthStateChanged(auth, (user) => {
  if (user) {
    
    console.log('User is signed in:', user.email);
  } else {
    console.log('User is signed out.');
  }
});

window.addEventListener('load', () => {
  // Check if the logout message exists
  const logoutMessage = localStorage.getItem('logoutMessage');

  if (logoutMessage) {
    // Display the alert with the logout message
    alert(logoutMessage);

    // Clear the message from localStorage to avoid showing it again
    localStorage.removeItem('logoutMessage');
  }
});

