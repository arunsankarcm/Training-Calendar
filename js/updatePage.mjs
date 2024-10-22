import { db, auth } from "../firebaseConfig.mjs";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
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
