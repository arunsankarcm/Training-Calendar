import { db, auth } from "../firebaseConfig.mjs";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  ref,
  set,
  push,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  const endDateInput = document.getElementById("end-date");
  const startDateInput = document.getElementById("start-date");
  const endTimeInput = document.getElementById("end-time");
  const startTimeInput = document.getElementById("start-time");
  const maxParticipantsInput = document.getElementById("max-participants");

  // Event listeners for date and time validation
  startDateInput.addEventListener("blur", validateEndDate);
  endDateInput.addEventListener("blur", validateEndDate);
  startTimeInput.addEventListener("blur", validateEndTime);
  endTimeInput.addEventListener("blur", validateEndTime);

  // Event listener for maximum participants validation
  maxParticipantsInput.addEventListener("input", validateMaxParticipants);
});

function validateEndDate() {
  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;

 

  // Convert to Date objects for comparison
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  if (endDate !== "" && startDateObj >= endDateObj) {
    alert("End date must be after the start date.");
    document.getElementById("end-date").value = "";
  }
}

function validateEndTime() {
  const startTime = document.getElementById("start-time").value;
  const endTime = document.getElementById("end-time").value;

  

  if (endTime !== "") {
    // Convert time strings to Date objects for comparison
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTimeDate = new Date(0, 0, 0, startHours, startMinutes);
    const endTimeDate = new Date(0, 0, 0, endHours, endMinutes);

    // Compare the two times
    if (startTimeDate >= endTimeDate) {
      alert("End time must be after the start time.");
      document.getElementById("end-time").value = "";
    }
  }
}

// Validation for maximum participants
function validateMaxParticipants() {
  const maxParticipantsInput = document.getElementById("max-participants");
  const value = maxParticipantsInput.value;

  // Check if value is not an integer
  if (!/^\d+$/.test(value) && value !== "") {
    alert("Please enter a valid integer for maximum participants.");
    maxParticipantsInput.value = "";
  }
}



// Back button functionality
document.getElementById('back-button').addEventListener('click', () => {
  window.location.href = 'viewAllCourse.html';
});

// Submission event
document.getElementById("create-page").addEventListener("submit", submitCourse);

function submitCourse(e) {
  e.preventDefault();

  const courseName = getElementVal("course-name");
  const startDate = getElementVal("start-date");
  const endDate = getElementVal("end-date");
  const startTime = getElementVal("start-time");
  const endTime = getElementVal("end-time");
  const keyPoints = getElementVal("key-points");
  const trainerName = getElementVal("trainer");
  const targetAudience = getElementVal("audience");
  const maxParticipation = getElementVal("max-participants");

  const mode = document.getElementsByName("mode");
  let selectedValue = "";
  for (const radio of mode) {
    if (radio.checked) {
      selectedValue = radio.value;
      break;
    }
  }

  saveInDB(
    courseName,
    startDate,
    endDate,
    startTime,
    endTime,
    keyPoints,
    trainerName,
    targetAudience,
    maxParticipation,
    selectedValue
  );
}

// Save to Firebase
const saveInDB = (
  courseName,
  startDate,
  endDate,
  startTime,
  endTime,
  keyPoints,
  trainerName,
  targetAudience,
  maxParticipation,
  mode
) => {
  const coursesRef = ref(db, "courses");
  const newCourseRef = push(coursesRef);

  set(newCourseRef, {
    courseName: courseName,
    startDate: startDate,
    endDate: endDate,
    startTime: startTime,
    endTime: endTime,
    keyPoints: keyPoints,
    trainerName: trainerName,
    targetAudience: targetAudience,
    maxParticipation: maxParticipation,
    mode: mode,
  })
    .then(() => {
      alert("Course registered successfully!");
      window.location.href = "viewAllCourse.html";
    })
    .catch((error) => {
      alert("Error registering course: " + error);
    });
};

// Authentication handling
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, continue to the page
  } else {
    // User is signed out, redirect to login page
    window.location.href = "login.html";
  }
});

// Logout button functionality
document.getElementById("logout_button").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("Successfully logged out.");
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert("Error signing out: " + error.message);
    });
});

// Helper function to get element value
const getElementVal = (id) => {
  return document.getElementById(id).value;
};
