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
  const endTimeInput = document.getElementById("end-time");

  endDateInput.addEventListener("change", validateEndDate);
  endTimeInput.addEventListener("change", validateEndTime);

  document.getElementById("course-name").addEventListener("input", trimInput);
  document.getElementById("trainer").addEventListener("input", trimInput);
  document.getElementById("audience").addEventListener("input", trimInput);
});

function trimInput(e) {
  if (e.target.value.startsWith(" ")) {
    e.target.value = e.target.value.trimStart();
  }
}

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

document.getElementById("back-button").addEventListener("click", () => {
  window.location.href = "viewAllCourse.html";
});

const urlParams = new URLSearchParams(window.location.search);
const courseKey = urlParams.get("courseKey");

if (courseKey) {
  const courseRef = ref(db, `courses/${courseKey}`);
  get(courseRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const courseData = snapshot.val();
        console.log(courseData);

        document.getElementById("course-name").value = courseData.courseName;
        document.getElementById("start-date").value = courseData.startDate;
        document.getElementById("end-date").value = courseData.endDate || "";
        document.getElementById("start-time").value = courseData.startTime;
        document.getElementById("end-time").value = courseData.endTime;

        document.getElementById("trainer").value = courseData.trainerName;
        document.getElementById("audience").value = courseData.targetAudience;
        // document.getElementById("max-participants").value =
        //   courseData.maxParticipation;

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

document.getElementById("update-page").addEventListener("submit", updateCourse);

function updateCourse(e) {
  e.preventDefault();

  const courseName = getElementVal("course-name");
  const startDate = getElementVal("start-date");
  const endDate = getElementVal("end-date");
  const startTime = getElementVal("start-time");
  const endTime = getElementVal("end-time");

  const trainerName = getElementVal("trainer");
  const targetAudience = getElementVal("audience");
  

  const mode = document.getElementsByName("mode");
  let selectedValue = "";
  for (const radio of mode) {
    if (radio.checked) {
      selectedValue = radio.value;
      break;
    }
  }

  const courseRef = ref(db, `courses/${courseKey}`);
  set(courseRef, {
    courseName: courseName,
    startDate: startDate,
    endDate: endDate,
    startTime: startTime,
    endTime: endTime,

    trainerName: trainerName,
    targetAudience: targetAudience,
   
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

const getElementVal = (id) => {
  return document.getElementById(id).value;
};

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

  setTimeout(() => {
    popup.remove();
  }, 3000);
};

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
