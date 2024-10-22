import { db } from "../firebaseConfig.mjs";
import {
  ref,
  set,
  get
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  const endDateInput = document.getElementById("end-date");
  const endTimeInput = document.getElementById("end-time");

  endDateInput.addEventListener("change", validateEndDate);
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


function changeBackgroundColor(event) {
  event.target.style.backgroundColor = "#357ae8";
}

function resetBackgroundColor(event) {
  event.target.style.backgroundColor = "";
}

const inputFields = document.querySelectorAll(
  'input[type="text"], input[type="date"], input[type="time"], textarea'
);

inputFields.forEach((input) => {
  input.addEventListener("focus", changeBackgroundColor);
  input.addEventListener("input", changeBackgroundColor);
  input.addEventListener("blur", resetBackgroundColor);
});

const urlParams = new URLSearchParams(window.location.search);
const courseKey = urlParams.get('courseKey');

if (courseKey) {
  const courseRef = ref(db, `courses/${courseKey}`);
  get(courseRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const courseData = snapshot.val();
        console.log(courseData);
        // Populate your form or fields with the course data
        document.getElementById('course-name').value = courseData.courseName;
        document.getElementById('start-date').value = courseData.startDate;
        document.getElementById('end-date').value = courseData.endDate || '';
        document.getElementById("start-time").value = courseData.startTime;
        document.getElementById("end-time").value = courseData.endTime;
        document.getElementById("key-points").value = courseData.keyPoints;
        document.getElementById("trainer").value = courseData.trainerName;
        document.getElementById("audience").value = courseData.targetAudience;
        document.getElementById("max-participants").value = courseData.maxParticipation;

        const modeRadioButtons = document.getElementsByName("mode");
        for (const radio of modeRadioButtons) {
          if (radio.value === courseData.mode) {
            radio.checked = true; // Set the correct mode as checked
          }
        }
      } else {
        console.log("No course data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching course data:", error);
    });
} else {
  console.error("No courseKey found in URL");
}



// Function to handle form submission for updating the course
document.getElementById("update-page").addEventListener("submit", updateCourse);

function updateCourse(e) {
  e.preventDefault();

  // Retrieve updated form data
  const courseName = getElementVal("course-name");
  const startDate = getElementVal("start-date");
  const endDate = getElementVal("end-date");
  const startTime = getElementVal("start-time");
  const endTime = getElementVal("end-time");
  const keyPoints = getElementVal("key-points");
  const trainerName = getElementVal("trainer");
  const targetAudience = getElementVal("audience");
  const maxParticipation = getElementVal("max-participants");

  // Get the selected radio button value
  const mode = document.getElementsByName("mode");
  let selectedValue = "";
  for (const radio of mode) {
    if (radio.checked) {
      selectedValue = radio.value;
      break;
    }
  }

  // Update the data in Firebase using the existing courseKey
  const courseRef = ref(db, `courses/${courseKey}`);
  set(courseRef, {
    courseName: courseName,
    startDate: startDate,
    endDate: endDate,
    startTime: startTime,
    endTime: endTime,
    keyPoints: keyPoints,
    trainerName: trainerName,
    targetAudience: targetAudience,
    maxParticipation: maxParticipation,
    mode: selectedValue
  })
    .then(() => {
      // Success! Show success popup and redirect
      showPopup("Course updated successfully!", "success");
      setTimeout(() => {
        window.location.href = "viewAllCourse.html"; // Redirect to the courses page after 2 seconds
      }, 2000);
    })
    .catch((error) => {
      // Error occurred, show error popup
      showPopup("Failed to update the course. Please try again.", "error");
      console.error("Error updating course: ", error);
    });
}

// Utility function to get the value of form elements by id
const getElementVal = (id) => {
  return document.getElementById(id).value;
};

// Function to show a popup message
const showPopup = (message, type) => {
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.padding = "20px";
  popup.style.backgroundColor = type === "success" ? "#4CAF50" : "#f44336";
  popup.style.color = "white";
  popup.style.fontSize = "18px";
  popup.style.borderRadius = "10px";
  popup.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
  popup.innerHTML = message;

  document.body.appendChild(popup);

  setTimeout(() => {
    document.body.removeChild(popup);
  }, 2000); // Remove popup after 2 seconds
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
    console.log('User is signed in:', user.uid);
  } else {
    window.location.href = 'loginpage.html';
  }
});
