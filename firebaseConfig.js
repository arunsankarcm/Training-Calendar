// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB56Ttr01dSS6C1JR1zZEX0-quWTfiq77M",
    authDomain: "training-calendar-ilp05.firebaseapp.com",
    databaseURL: "https://training-calendar-ilp05-default-rtdb.asia-southeast1.firebasedatabase.app", // Corrected URL
    projectId: "training-calendar-ilp05",
    storageBucket: "training-calendar-ilp05.appspot.com",
    messagingSenderId: "180932006030",
    appId: "1:180932006030:web:6fbca66b630a312eb179df",
    measurementId: "G-NBQVMQW0VL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

module.exports = { app, database };
