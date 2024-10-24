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
    showPopup("Course added successfully!", "success");
    setTimeout(() => {
      window.location.href = "viewAllCourse.html";
    }, 3000);
  })
  .catch((error) => {
    showPopup("Failed to add the course. Please try again.", "error");
    console.error("Error adding course: ", error);
  });
};

// Get input value by ID
const getElementVal = (id) => {
return document.getElementById(id).value;
};

// Popup function
const showPopup = (message, type) => {
const popup = document.createElement("div");
popup.style.position = "fixed";
popup.style.top = "50%";
popup.style.left = "50%";
popup.style.transform = "translate(-50%, -50%)";
popup.style.width = "350px";
popup.style.height = "200px";
popup.style.padding = "20px";
popup.style.backgroundColor = "white";
popup.style.color = "#333";
popup.style.fontSize = "20px";
popup.style.fontFamily = "'Montserrat', sans-serif";
popup.style.borderRadius = "15px";
popup.style.boxShadow = "0px 6px 12px rgba(0, 0, 0, 0.15)";
popup.style.textAlign = "center";
popup.style.zIndex = "1000";

// Adding the appropriate image based on the type
const messageImg = document.createElement("img");
messageImg.src =
  type === "success"
    ? "https://cdn-icons-png.flaticon.com/128/190/190411.png"
    : "https://cdn-icons-png.flaticon.com/128/1828/1828950.png";
messageImg.style.width = "50px";
messageImg.style.height = "50px";
messageImg.style.marginBottom = "20px";

const messageText = document.createElement("p");
messageText.textContent = message;
messageText.style.margin = "0";

popup.appendChild(messageImg);
popup.appendChild(messageText);
document.body.appendChild(popup);
};





// Logout function (sign out)
document.getElementById('logout_button').addEventListener('click', () => {
signOut(auth).then(() => {
  // Store the logout message in localStorage
  localStorage.setItem('logoutMessage', 'Logged out successfully.');

  // Redirect to login page after logging out
  window.location.href = 'loginpage.html';
}).catch((error) => {
  console.error('Sign out error:', error);
});
});

// Check if user is authenticated
onAuthStateChanged(auth, (user) => {
if (user) {
  console.log('User is signed in:', user.email);
} else {
  window.location.href = 'loginpage.html';
}

});