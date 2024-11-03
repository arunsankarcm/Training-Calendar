import { db, auth } from "../firebaseConfig.mjs";
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
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
  const courseNameInput = document.getElementById("course-name");
  // const keyPointsInput = document.getElementById("key-points");
  const trainerInput = document.getElementById("trainer");
  const audienceInput = document.getElementById("audience");

  // Event listeners for date and time validation
  startDateInput.addEventListener("blur", validateEndDate);
  endDateInput.addEventListener("blur", validateEndDate);
  startTimeInput.addEventListener("blur", validateEndTime);
  endTimeInput.addEventListener("blur", validateEndTime);

  // Event listener for maximum participants validation
  maxParticipantsInput.addEventListener("input", validateMaxParticipants);

  // Event listeners for text fields
  courseNameInput.addEventListener("input", () =>
    validateTextField(courseNameInput, "Course name")
  );
  // keyPointsInput.addEventListener("input", () =>
  //   validateTextField(keyPointsInput, "Key points")
  // );
  trainerInput.addEventListener("input", () =>
    validateTextField(trainerInput, "Trainer name")
  );
  audienceInput.addEventListener("input", () =>
    validateTextField(audienceInput, "Target audience")
  );

  // Add blur events to check for empty fields
  courseNameInput.addEventListener("blur", () =>
    validateEmptyField(courseNameInput, "Course name")
  );
  // keyPointsInput.addEventListener("blur", () =>
  //   validateEmptyField(keyPointsInput, "Key points")
  // );
  trainerInput.addEventListener("blur", () =>
    validateEmptyField(trainerInput, "Trainer name")
  );
  audienceInput.addEventListener("blur", () =>
    validateEmptyField(audienceInput, "Target audience")
  );
});

// Validation for empty fields
function validateEmptyField(inputElement, fieldName) {
  const value = inputElement.value.trim();
  if (!value) {
    inputElement.classList.add("invalid");
    showError(`${fieldName} cannot be empty. Please enter valid text.`);
    return false;
  }
  inputElement.classList.remove("invalid");
  return true;
}

// Validation for text fields
function validateTextField(inputElement, fieldName) {
  // Get the input value
  const value = inputElement.value;

  // Remove leading whitespace
  const trimmedValue = value.replace(/^\s+/, "");

  // Set the maximum word limit
  const maxLength = 100;

  // Update the input value with trimmed value
  inputElement.value = trimmedValue;

  // Check for maximum length
  if (trimmedValue.length > maxLength) {
    inputElement.classList.add("invalid");
    showError(`${fieldName} must not exceed ${maxLength} characters.`);
    return false;
  }

  // Remove invalid class if validation passes
  inputElement.classList.remove("invalid");
  return true;
}



function validateEndDate() {
  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  
  if (endDate !== "" && startDateObj > endDateObj) {
    showError("End date must be the same as or after the start date.");
    document.getElementById("end-date").value = "";
    return false;
  }
  return true;
}


function validateEndTime() {
  const startTime = document.getElementById("start-time").value;
  const endTime = document.getElementById("end-time").value;

  if (endTime !== "") {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const startTimeDate = new Date(0, 0, 0, startHours, startMinutes);
    const endTimeDate = new Date(0, 0, 0, endHours, endMinutes);

    if (startTimeDate >= endTimeDate) {
      showError("End time must be after the start time.");
      document.getElementById("end-time").value = "";
      return false;
    }
  }
  return true;
}

function validateMaxParticipants() {
  const maxParticipantsInput = document.getElementById("max-participants");
  const value = maxParticipantsInput.value;

  if (!/^\d+$/.test(value) && value !== "") {
    showError("Please enter a valid integer for maximum participants.");
    maxParticipantsInput.value = "";
    return false;
  }
  return true;
}

// Show error message function
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.style.position = "fixed";
  errorDiv.style.top = "20px";
  errorDiv.style.left = "50%";
  errorDiv.style.transform = "translateX(-50%)";
  errorDiv.style.backgroundColor = "#ff4444";
  errorDiv.style.color = "white";
  errorDiv.style.padding = "10px 20px";
  errorDiv.style.borderRadius = "5px";
  errorDiv.style.zIndex = "1000";
  errorDiv.textContent = message;

  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

// Submission event
document.getElementById("create-page").addEventListener("submit", submitCourse);

function submitCourse(e) {
  e.preventDefault();

  // Get all input elements
  const courseNameInput = document.getElementById("course-name");
  // const keyPointsInput = document.getElementById("key-points");
  const trainerInput = document.getElementById("trainer");
  const audienceInput = document.getElementById("audience");
  const maxParticipantsInput = document.getElementById("max-participants");

  // Validate all fields
  const isValidCourseName =
    validateTextField(courseNameInput, "Course name") &&
    validateEmptyField(courseNameInput, "Course name");
  // const isValidKeyPoints =
  //   validateTextField(keyPointsInput, "Key points") &&
  //   validateEmptyField(keyPointsInput, "Key points");
  const isValidTrainer =
    validateTextField(trainerInput, "Trainer name") &&
    validateEmptyField(trainerInput, "Trainer name");
  const isValidAudience =
    validateTextField(audienceInput, "Target audience") &&
    validateEmptyField(audienceInput, "Target audience");
  const isValidMaxParticipants = validateMaxParticipants();
  const isValidDates = validateEndDate();
  const isValidTimes = validateEndTime();

  // Check if all validations pass
  if (
    !isValidCourseName ||
    // !isValidKeyPoints ||
    !isValidTrainer ||
    !isValidAudience ||
    !isValidMaxParticipants ||
    !isValidDates ||
    !isValidTimes
  ) {
    showError("Please fill in all fields correctly before submitting.");
    return;
  }

  // Get values for submission
  const courseName = courseNameInput.value.trim();
  const startDate = getElementVal("start-date");
  const endDate = getElementVal("end-date");
  const startTime = getElementVal("start-time");
  const endTime = getElementVal("end-time");
  // const keyPoints = keyPointsInput.value.trim();
  const trainerName = trainerInput.value.trim();
  const targetAudience = audienceInput.value.trim();
  const maxParticipation = maxParticipantsInput.value;

  const mode = document.getElementsByName("mode");
  let selectedValue = "";
  for (const radio of mode) {
    if (radio.checked) {
      selectedValue = radio.value;
      break;
    }
  }

  if (!selectedValue) {
    showError("Please select a mode before submitting.");
    return;
  }

  saveInDB(
    courseName,
    startDate,
    endDate,
    startTime,
    endTime,
    
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

  // Add auto-close feature
  setTimeout(() => {
    popup.remove();
}, 3000); // Automatically close after 3 seconds
};

//style for error message - checking
const style = document.createElement("style");
style.textContent = `
  .invalid {
    border: 2px solid #ff4444;
    background-color: #fff8f8;
  }
  
  .error-message {
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
`;
document.head.appendChild(style);

// Authentication code remains the same
document.getElementById("logout_button").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      localStorage.setItem("logoutMessage", "Logged out successfully.");
      window.location.href = "../index.html";
    })
    .catch((error) => {
      console.error("Sign out error:", error);
    });
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user.email);
  } else {
    window.location.href = "../index.html";
  }
});

document.getElementById('back-button').addEventListener('click', () => {
  window.location.href = 'viewAllCourse.html';
});

