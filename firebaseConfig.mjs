import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB56Ttr01dSS6C1JR1zZEX0-quWTfiq77M",
  authDomain: "training-calendar-ilp05.firebaseapp.com",
  databaseURL:
    "https://training-calendar-ilp05-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "training-calendar-ilp05",
  storageBucket: "training-calendar-ilp05.appspot.com",
  messagingSenderId: "180932006030",
  appId: "1:180932006030:web:6fbca66b630a312eb179df",
  measurementId: "G-NBQVMQW0VL",
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

export { db };
