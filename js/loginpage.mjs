import { auth, db } from "../firebaseConfig.mjs";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
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
      window.location.href = "home.html";

      const user = userCredential.user;
      const dt = new Date();
      update(ref(db, "users/" + user.uid), {
        last_login: dt,
      });
    })
    .catch((error) => {
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
      errorMessage.textContent = "Invalid email or password. Please try again.";
      console.error("Login error:", error.code, error.message);
    });
});

// // Check if user is authenticated
// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     console.log('User is signed in:', user.uid);
//   } else {
//     console.log('User is signed out.');
//   }
// });

// // Logout function (sign out)
// document.getElementById('logoutButton').addEventListener('click', () => {
//   signOut(auth).then(() => {
//     alert('Logged out successfully.');
//     window.location.href = 'login.html'; // Redirect to login page after logging out
//   }).catch((error) => {
//     console.error('Sign out error:', error);
//   });
// });
