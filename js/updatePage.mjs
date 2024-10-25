import { db, auth } from "../firebaseConfig.mjs";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { ref, set, update } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  const endDateInput = document.getElementById("end-date");
  const startDateInput = document.getElementById("start-date");
  const endTimeInput = document.getElementById("end-time");
  const startTimeInput = document.getElementById("start-time");
  const maxParticipantsInput = document.getElementById("max-participants");
  const courseNameInput = document.getElementById("course-name");
  const keyPointsInput = document.getElementById("key-points");
  const trainerInput = document.getElementById("trainer");
  const audienceInput = document.getElementById("audience");

  // Event listeners for validation
  startDateInput.addEventListener("blur", validateEndDate);
  endDateInput.addEventListener("blur", validateEndDate);
  startTimeInput.addEventListener("blur", validateEndTime);
  endTimeInput.addEventListener("blur", validateEndTime);
  maxParticipantsInput.addEventListener("input", validateMaxParticipants);

  courseNameInput.addEventListener("input", () =>
    validateTextField(courseNameInput, "Course name")
  );
  keyPointsInput.addEventListener("input", () =>
    validateTextField(keyPointsInput, "Key points")
  );
  trainerInput.addEventListener("input", () =>
    validateTextField(trainerInput, "Trainer name")
  );
  audienceInput.addEventListener("input", () =>
    validateTextField(audienceInput, "Target audience")
  );

  // Add blur events for empty field validation
  courseNameInput.addEventListener("blur", () =>
    validateEmptyField(courseNameInput, "Course name")
  );
  keyPointsInput.addEventListener("blur", () =>
    validateEmptyField(keyPointsInput, "Key points")
  );
  trainerInput.addEventListener("blur", () =>
    validateEmptyField(trainerInput, "Trainer name")
  );
  audienceInput.addEventListener("blur", () =>
    validateEmptyField(audienceInput, "Target audience")
  );
});

// Similar validation functions as the create page
// validateEmptyField, validateTextField, validateEndDate, validateEndTime, validateMaxParticipants, showError

// Submission event for update page
document.getElementById("update-page").addEventListener("submit", updateCourse);

function updateCourse(e) {
  e.preventDefault();

  const courseNameInput = document.getElementById("course-name");
  const keyPointsInput = document.getElementById("key-points");
  const trainerInput = document.getElementById("trainer");
  const audienceInput = document.getElementById("audience");
  const maxParticipantsInput = document.getElementById("max-participants");

  const isValidCourseName =
    validateTextField(courseNameInput, "Course name") &&
    validateEmptyField(courseNameInput, "Course name");
  const isValidKeyPoints =
    validateTextField(keyPointsInput, "Key points") &&
    validateEmptyField(keyPointsInput, "Key points");
  const isValidTrainer =
    validateTextField(trainerInput, "Trainer name") &&
    validateEmptyField(trainerInput, "Trainer name");
  const isValidAudience =
    validateTextField(audienceInput, "Target audience") &&
    validateEmptyField(audienceInput, "Target audience");
  const isValidMaxParticipants = validateMaxParticipants();
  const isValidDates = validateEndDate();
  const isValidTimes = validateEndTime();

  if (
    !isValidCourseName ||
    !isValidKeyPoints ||
    !isValidTrainer ||
    !isValidAudience ||
    !isValidMaxParticipants ||
    !isValidDates ||
    !isValidTimes
  ) {
    showError("Please fill in all fields correctly before submitting.");
    return;
  }

  // Fetch input values
  const courseName = courseNameInput.value.trim();
  const startDate = getElementVal("start-date");
  const endDate = getElementVal("end-date");
  const startTime = getElementVal("start-time");
  const endTime = getElementVal("end-time");
  const keyPoints = keyPointsInput.value.trim();
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

  // Update course details in Firebase
  const courseId = document.getElementById("course-id").value; // Assuming the course ID is available for update
  updateCourseInDB(
    courseId,
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

// Update function to save updated course data in Firebase
const updateCourseInDB = (
  courseId,
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
  const courseRef = ref(db, "courses/" + courseId);

  update(courseRef, {
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
      showPopup("Course updated successfully!", "success");
      setTimeout(() => {
        window.location.href = "viewAllCourse.html";
      }, 3000);
    })
    .catch((error) => {
      showPopup("Failed to update the course. Please try again.", "error");
      console.error("Error updating course: ", error);
    });
};
