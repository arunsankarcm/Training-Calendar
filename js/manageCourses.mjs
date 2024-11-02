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

document.addEventListener("DOMContentLoaded", function () {
  const addRowBtn = document.getElementById("addRowBtn");
  const submitBtn = document.getElementById("submitBtn");
  const coursesTable = document
    .getElementById("coursesTable")
    .getElementsByTagName("tbody")[0];

  // Validation functions
  function validateCourseName(name) {
    return /^[a-zA-Z0-9\s]*$/.test(name);
  }

  function validateDates(startDate, endDate) {
    if (!endDate) return true; // End date is optional
    return new Date(endDate) >= new Date(startDate);
  }

  function validateTimes(startTime, endTime) {
    if (!startTime || !endTime) return false;
    return startTime < endTime;
  }

  function validateMaxParticipants(value) {
    return Number.isInteger(Number(value)) && Number(value) > 0;
  }

  function validateRequired(value) {
    return value.trim() !== "";
  }

  function showError(input, message) {
    const existingError = input.parentElement.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    input.classList.add("error");

    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.color = "red";
    errorDiv.style.fontSize = "12px";
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
  }

  function removeError(input) {
    input.classList.remove("error");
    const errorMessage = input.parentElement.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  function validateRow(row) {
    let isValid = true;
    const inputs = row.getElementsByTagName("input");
    const select = row.querySelector("select");

    const courseName = inputs[0].value;
    const startDate = inputs[1].value;
    const endDate = inputs[2].value;
    const startTime = inputs[3].value;
    const endTime = inputs[4].value;
    // const keyPoints = inputs[5].value;
    const trainer = inputs[5].value;
    const audience = inputs[6].value;
    const maxParticipants = inputs[7].value;

    // Validate course name
    if (!validateRequired(courseName)) {
      showError(inputs[0], "Course name is required");
      isValid = false;
    } else {
      removeError(inputs[0]);
    }

    // Validate required fields
    const requiredFields = [
      { input: inputs[1], name: "Start date" },
      { input: inputs[3], name: "Start time" },
      { input: inputs[4], name: "End time" },
      // { input: inputs[5], name: 'Key points' },
      { input: inputs[5], name: "Trainer" },
      { input: inputs[6], name: "Audience" },
      { input: inputs[7], name: "Max participants" },
    ];

    requiredFields.forEach((field) => {
      if (!validateRequired(field.input.value)) {
        showError(field.input, `${field.name} is required`);
        isValid = false;
      } else {
        removeError(field.input);
      }
    });

    // Validate dates
    if (startDate && endDate && !validateDates(startDate, endDate)) {
      showError(inputs[2], "End date must be after or same as start date");
      isValid = false;
    } else {
      removeError(inputs[2]);
    }

    // Validate times
    if (startTime && endTime && !validateTimes(startTime, endTime)) {
      showError(inputs[4], "End time must be after start time");
      isValid = false;
    } else if (startTime && endTime) {
      removeError(inputs[4]);
    }

    // Validate max participants
    if (maxParticipants && !validateMaxParticipants(maxParticipants)) {
      showError(inputs[7], "Must be a positive whole number");
      isValid = false;
    } else if (maxParticipants) {
      removeError(inputs[7]);
    }

    return isValid;
  }

  function addRow() {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
            <td><input name="course-name" type="text" class="course-name" placeholder="Course Name"></td>
            <td><input name="start-date" type="date" class="date-input"></td>
            <td><input name="end-date" type="date" class="date-input"></td>
            <td><input name="start-time" type="time" class="time-input"></td>
            <td><input name="end-time" type="time" class="time-input"></td>
            <td><input name="key-points" type="text" class="key-points" placeholder="Key Points"></td>
            <td><input name="trainer" type="text" class="trainer-name" placeholder="Trainer Name"></td>
            <td><input name="audience" type="text" class="audience" placeholder="Audience"></td>
            <td><input name="max-participants" type="number" class="max-participants" placeholder="Max Participants"></td>
            <td>
                <select name="mode">
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                </select>
            </td>
            <td>
                <button class="delete-btn">-</button>
            </td>
        `;

    // Append the new row to the table body
    coursesTable.appendChild(newRow);

    // Add event listener to the delete button in the new row
    newRow.querySelector(".delete-btn").addEventListener("click", function () {
      if (coursesTable.children.length > 1) {
        deleteRow(newRow);
      } else {
        alert("Cannot delete the last row!");
      }
    });
  }

  function deleteRow(row) {
    coursesTable.removeChild(row);
  }

  function handleSubmit() {
    let isValid = true;
    const rows = coursesTable.getElementsByTagName("tr");
    const coursesData = []; // Array to hold all courses data

    // Validate all rows
    Array.from(rows).forEach((row) => {
      if (validateRow(row)) {
        const inputs = row.getElementsByTagName("input");
        const select = row.querySelector("select");

        // Collect course data
        const courseData = {
          courseName: inputs[0].value,
          startDate: inputs[1].value,
          endDate: inputs[2].value,
          startTime: inputs[3].value,
          endTime: inputs[4].value,
          // keyPoints: inputs[5].value,
          trainer: inputs[5].value,
          audience: inputs[6].value,
          maxParticipants: inputs[7].value,
          mode: select.value,
        };
        coursesData.push(courseData);
      } else {
        isValid = false; // If any row is invalid, mark overall as invalid
      }
    });

    if (!isValid) {
      alert("Please fill all details correctly before submitting.");
      return;
    }

    // Save all valid courses to the database
    const promises = coursesData.map((course) => {
      return saveInDB(
        course.courseName,
        course.startDate,
        course.endDate,
        course.startTime,
        course.endTime,
        // course.keyPoints,
        course.trainer,
        course.audience,
        course.maxParticipants,
        course.mode
      );
    });

    Promise.all(promises)
      .then(() => {
        showPopup("Course added successfully!", "success");
        setTimeout(() => {
          window.location.href = "viewAllCourse.html";
        }, 2000);
      })
      .catch((error) => {
        showPopup("Failed to add the course. Please try again.", "error");
        console.error("Error adding course: ", error);
        throw error; // Rethrow error to handle it in Promise.all
      });
  }

  // Add event listeners
  addRowBtn.addEventListener("click", addRow);
  submitBtn.addEventListener("click", handleSubmit);

  // Add some basic CSS for validation
  const style = document.createElement("style");
  style.textContent = `
        .error {
            border: 1px solid red !important;
        }
        .error-message {
            color: red;
            font-size: 12px;
            margin-top: 4px;
        }
    `;
  document.head.appendChild(style);
});

//dbsave

const saveInDB = (
  courseName,
  startDate,
  endDate,
  startTime,
  endTime,
  // keyPoints,
  trainerName,
  targetAudience,
  maxParticipation,
  mode
) => {
  const coursesRef = ref(db, "courses");
  const newCourseRef = push(coursesRef);

  return set(newCourseRef, {
    courseName: courseName,
    startDate: startDate,
    endDate: endDate,
    startTime: startTime,
    endTime: endTime,
    // keyPoints: keyPoints,
    trainerName: trainerName,
    targetAudience: targetAudience,
    maxParticipation: maxParticipation,
    mode: mode,
  })
    .then(() => {
      console.log("Couses added Succesfullty");
    })
    .catch((error) => {
      // showPopup("Failed to add the course. Please try again.", "error");
      console.error("Error adding course: ", error);
    });
};

// Function to display a popup message
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

//logout and previous
document.getElementById("back-button").addEventListener("click", () => {
  window.location.href = "viewAllCourse.html";
});

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
