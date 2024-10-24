import { db, auth } from "../firebaseConfig.mjs";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  ref,
  set,
  push,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// Validation code
document.addEventListener("DOMContentLoaded", () => {
  const endDateInput = document.getElementById("end-date");
  const startDateInput = document.getElementById("start-date");
  const endTimeInput = document.getElementById("end-time");
  const startTimeInput = document.getElementById("start-time");

  startDateInput.addEventListener("change", validateEndDate);
  endDateInput.addEventListener("change", validateEndDate);
  startTimeInput.addEventListener("change", validateEndTime);
  endTimeInput.addEventListener("change", validateEndTime);
});

function validateEndDate() {
  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;

  if (startDate === "") {
    alert("Please select a start date first.");
    document.getElementById("end-date").value = "";
    return;
  }

  if (endDate !== "" && startDate > endDate) {
    alert("End date must be after the start date.");
    document.getElementById("end-date").value = "";
  }
}

function validateEndTime() {
  const startTime = document.getElementById("start-time").value;
  const endTime = document.getElementById("end-time").value;

  if (startTime === "") {
    alert("Please select a start time first.");
    document.getElementById("end-time").value = "";
    return;
  }

  if (endTime !== "" && startTime >= endTime) {
    alert("End time must be after the start time.");
    document.getElementById("end-time").value = "";
  }
}

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
