import { db, auth } from "../firebaseConfig.mjs";
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  ref,
  set,
  get,
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

  if (startDate === "") {
    alert("Please select a start date first.");
    document.getElementById("end-date").value = "";
    return;
  }

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

  if (startTime === "") {
    alert("Please select a start time first.");
    document.getElementById("end-time").value = "";
    return;
  }

  if (endTime !== "") {
    // Convert time strings to Date objects for comparison
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

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

// Fetching existing course data
const urlParams = new URLSearchParams(window.location.search);
const courseKey = urlParams.get("courseKey");

if (courseKey) {
  const courseRef = ref(db, `courses/${courseKey}`);
  get(courseRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const courseData = snapshot.val();
        // Populate your form with the fetched course data
        document.getElementById("course-name").value = courseData.courseName;
        document.getElementById("start-date").value = courseData.startDate;
        document.getElementById("end-date").value = courseData.endDate || "";
        document.getElementById("start-time").value = courseData.startTime;
        document.getElementById("end-time").value = courseData.endTime;
        document.getElementById("key-points").value = courseData.keyPoints;
        document.getElementById("trainer").value = courseData.trainerName;
        document.getElementById("audience").value = courseData.targetAudience;
        document.getElementById("max-participants").value =
          courseData.maxParticipation;

        const modeRadioButtons = document.getElementsByName("mode");
        for (const radio of modeRadioButtons) {
          if (radio.value === courseData.mode) {
            radio.checked = true;
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
    mode: selectedValue,
  })
    .then(() => {
      showPopup("Course updated successfully!", "success");
      setTimeout(() => {
        window.location.href = "viewAllCourse.html";
      }, 2000);
    })
    .catch((error) => {
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

// Logout function
document.getElementById("logout_button").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      localStorage.setItem("logoutMessage", "Logged out successfully.");
      window.location.href = "loginpage.html";
    })
    .catch((error) => {
      console.error("Sign out error:", error);
    });
});

// Check if user is authenticated
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user.email);
  } else {
    window.location.href = "loginpage.html";
  }
});
