import { db } from "../firebaseConfig.mjs";

import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const cardsDiv = document.getElementById("card-grid");
let cardNo = 1;

function getCourses() {
  const dbref = ref(db);

  get(child(dbref, "courses"))
    .then((courses) => {
      if (courses.exists()) {
        courses.forEach((course) => {
          AddCourseToCard(course);
        });
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching data: ", error);
    });
}

function AddCourseToCard(course) {
  const value = course.val();
  const card = document.createElement("div");
  card.classList.add("training-card");

  card.innerHTML = `
    <div class="status">
      <span class="circle yellow"><p id="course-number">${cardNo}</p></span>
      <p id="course-name">${value.courseName || "No name"}</p>
    </div>
    <ul class="details">
      <li id="key-points">${value.keyPoints || "No key points available"}</li>
    </ul>
    <p class="audience">
      Target Audience: <strong id="target-audience">${
        value.targetAudience || "Not specified"
      }</strong>
    </p>
    <p class="date">
      Date: <strong id="date-time">${value.startDate || "N/A"} ${
    value.startTime || ""
  } - ${value.endDate || "N/A"} ${value.endTime || ""}</strong>
    </p>
    <p class="trainer">Trainer: <strong id="trainer-name">${
      value.trainerName || "Unknown"
    }</strong></p>
    <div class="icons">
      <img src="../pics/laptop.png" alt="Laptop icon" />
    </div>
  `;

  cardsDiv.appendChild(card);

  cardNo++;
}

window.addEventListener("load", getCourses);
