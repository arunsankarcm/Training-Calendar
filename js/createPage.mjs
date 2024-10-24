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


document.getElementById('back-button').addEventListener('click', () => {
  window.location.href = 'viewAllCourse.html';
});



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




// document.addEventListener("DOMContentLoaded", () => {
//   const courseContainer = document.getElementById("courses-container");
//   const addCourseButton = document.getElementById("add-course");
//   let courseCount = 1;  // To track the number of courses

//   // Add new course fields with a remove button
//   addCourseButton.addEventListener("click", () => {
//     courseCount++; // Increment course count for each new course added

//     // Clone the existing course form
//     const newCourseFields = document.querySelector(".course-fields").cloneNode(true);

//     // Clear the input values in the cloned fields
//     newCourseFields.querySelectorAll("input").forEach(input => input.value = "");

//     // Make radio buttons independent by assigning unique name attributes
//     const radioButtons = newCourseFields.querySelectorAll('[name="mode"]');
//     radioButtons.forEach(radio => {
//       radio.name = `mode-${courseCount}`; // Assign a unique name to each radio group
//     });

//     // Add a separating line before the new course form
//     const separator = document.createElement("div");
//     separator.style.borderTop = "5px solid #333"; // 5px solid line
//     separator.style.margin = "20px 0"; // Add margin above and below the line

//     // Add the remove button to the cloned course form
//     const removeButton = document.createElement("button");
//     removeButton.type = "button";
//     removeButton.classList.add("remove-course");
//     removeButton.textContent = "Remove Course";
//     newCourseFields.appendChild(removeButton);

//     // Append the separator and then the new form
//     courseContainer.appendChild(separator);
//     courseContainer.appendChild(newCourseFields);
//   });

//   // Remove course fields
//   courseContainer.addEventListener("click", (e) => {
//     if (e.target.classList.contains("remove-course")) {
//       e.target.closest(".course-fields").previousElementSibling.remove();  // Remove the separator
//       e.target.closest(".course-fields").remove();  // Remove the course form
//     }
//   });

//   // Form submission to Firebase for multiple courses
//   document.getElementById("create-page").addEventListener("submit", submitCourses);

//   function submitCourses(e) {
//     e.preventDefault();

//     const allCourses = document.querySelectorAll(".course-fields");  // Select all course forms

//     allCourses.forEach((course, index) => {
//       const courseName = course.querySelector(`[name="course-name"]`).value;
//       const startDate = course.querySelector(`[name="start-date"]`).value;
//       const endDate = course.querySelector(`[name="end-date"]`).value;
//       const startTime = course.querySelector(`[name="start-time"]`).value;
//       const endTime = course.querySelector(`[name="end-time"]`).value;
//       const keyPoints = course.querySelector(`[name="key-points"]`).value;
//       const trainerName = course.querySelector(`[name="trainer"]`).value;
//       const targetAudience = course.querySelector(`[name="audience"]`).value;
//       const maxParticipation = course.querySelector(`[name="max-participants"]`).value;

//       // Use unique name for mode selection by index
//       const modeName = `mode-${index + 1}`; // Update index for each course dynamically
//       const selectedMode = course.querySelector(`input[name="${modeName}"]:checked`)?.value;

//       if (!selectedMode) {
//         alert(`Please select a mode for course ${index + 1}`);
//         return;
//       }

//       // Save each course to Firebase
//       saveInDB(
//         courseName,
//         startDate,
//         endDate,
//         startTime,
//         endTime,
//         keyPoints,
//         trainerName,
//         targetAudience,
//         maxParticipation,
//         selectedMode
//       );
//     });

//     alert("All courses submitted!");
//   }

//   // Save each course to Firebase
//   const saveInDB = (
//     courseName,
//     startDate,
//     endDate,
//     startTime,
//     endTime,
//     keyPoints,
//     trainerName,
//     targetAudience,
//     maxParticipation,
//     mode
//   ) => {
//     const coursesRef = ref(db, "courses");
//     const newCourseRef = push(coursesRef);

//     set(newCourseRef, {
//       courseName: courseName,
//       startDate: startDate,
//       endDate: endDate,
//       startTime: startTime,
//       endTime: endTime,
//       keyPoints: keyPoints,
//       trainerName: trainerName,
//       targetAudience: targetAudience,
//       maxParticipation: maxParticipation,
//       mode: mode,
//     })
//       .then(() => {
//         showPopup("Course added successfully!", "success");
//       })
//       .catch((error) => {
//         showPopup("Failed to add the course. Please try again.", "error");
//         console.error("Error adding course: ", error);
//       });
//   };
// });

// Popup function (remains unchanged)





document.addEventListener("DOMContentLoaded", () => {
  const courseContainer = document.getElementById("courses-container");
  const addCourseButton = document.getElementById("add-course");
  let courseCount = 1;

  addCourseButton.addEventListener("click", () => {
    courseCount++;

    const newCourseFields = document.querySelector(".course-fields").cloneNode(true);
    newCourseFields.querySelectorAll("input").forEach(input => input.value = "");

    const radioButtons = newCourseFields.querySelectorAll('[name="mode"]');
    radioButtons.forEach(radio => {
      radio.name = `mode-${courseCount}`;
    });

    const separator = document.createElement("div");
    separator.style.borderTop = "5px solid #333";
    separator.style.margin = "20px 0";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.classList.add("remove-course");
    removeButton.textContent = "Remove Course";
    newCourseFields.appendChild(removeButton);

    courseContainer.appendChild(separator);
    courseContainer.appendChild(newCourseFields);
  });

  courseContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-course")) {
      e.target.closest(".course-fields").previousElementSibling.remove();
      e.target.closest(".course-fields").remove();
    }
  });

  document.getElementById("create-page").addEventListener("submit", submitCourses);

  function submitCourses(e) {
    e.preventDefault();

    const allCourses = document.querySelectorAll(".course-fields");

    allCourses.forEach((course, index) => {
      const courseName = course.querySelector(`[name="course-name"]`).value;
      const startDate = course.querySelector(`[name="start-date"]`).value;
      const endDate = course.querySelector(`[name="end-date"]`).value;
      const startTime = course.querySelector(`[name="start-time"]`).value;
      const endTime = course.querySelector(`[name="end-time"]`).value;
      const keyPoints = course.querySelector(`[name="key-points"]`).value;
      const trainerName = course.querySelector(`[name="trainer"]`).value;
      const targetAudience = course.querySelector(`[name="audience"]`).value;
      const maxParticipation = course.querySelector(`[name="max-participants"]`).value;

      const modeName = `mode-${index + 1}`;
      const selectedMode = course.querySelector(`input[name="${modeName}"]:checked`)?.value;

      if (!selectedMode) {
        alert(`Please select a mode for course ${index + 1}`);
        return;
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
        selectedMode
      );
    });

    alert("All courses submitted!");
  }

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
      })
      .catch((error) => {
        showPopup("Failed to add the course. Please try again.", "error");
        console.error("Error adding course: ", error);
      });
  };
});


