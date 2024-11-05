import { db } from "../firebaseConfig.mjs";
import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const upcomingDiv = document.getElementById("upcoming-training-cards-section");
const ongoingDiv = document.getElementById("ongoing-training-cards-section");
let cardNo = 1;

function getCourses() {
  console.log("Fetching data from Firebase...");

  const dbref = ref(db);

  get(child(dbref, "courses"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log("Data fetched successfully!");
        const courses = snapshot.val();
        console.log("Courses data:", courses);

        for (const courseId in courses) {
          if (courses.hasOwnProperty(courseId)) {
            console.log(`Rendering course: ${courses[courseId].courseName}`);
            renderCourses(courses[courseId]);
          }
        }

        const coursesArray = Object.keys(courses).map((key) => courses[key]);

        const sortedCourses = coursesArray.sort((a, b) => {
          const dateA = new Date(a.startDate);
          const dateB = new Date(b.startDate);
          return dateA - dateB;
        });

        const currentDate = new Date();

        sortedCourses.forEach((course) => {
          const courseStartDate = new Date(course.startDate);

          if (courseStartDate >= currentDate) {
            console.log(`Rendering upcoming course: ${course.courseName}`);
            renderCourses(course, "upcoming");
          } else {
            console.log(`Rendering ongoing course: ${course.courseName}`);
            renderCourses(course, "ongoing");
          }
        });
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

function renderCourses(course, section) {
  console.log(`Rendering course card for: ${course.courseName}`);

  const card = document.createElement("div");
  card.classList.add("training-card");

  const circleNumber = document.createElement("div");
  circleNumber.classList.add("circle-number");
  circleNumber.innerHTML = `<span>${cardNo}</span>`;

  const trainingDetails = document.createElement("div");
  trainingDetails.classList.add("training-details");
  trainingDetails.innerHTML = `
    <h3>${course.courseName}</h3>
    <p><strong>Target Audience:</strong> ${course.targetAudience}</p>
    <p><strong>Date:</strong> ${course.startDate} (${course.startTime})</p>
    <p><strong>Trainer:</strong> ${course.trainerName}</p>
    <p><strong>Key points:</strong> ${course.keyPoints}</p>
  `;

  const modeTag = document.createElement("span");
  modeTag.classList.add("tag", course.mode);
  modeTag.textContent =
    course.mode.charAt(0).toUpperCase() + course.mode.slice(1);

  card.appendChild(circleNumber);
  card.appendChild(trainingDetails);
  card.appendChild(modeTag);

  if (section === "upcoming") {
    upcomingDiv.appendChild(card);
  } else {
    ongoingDiv.appendChild(card);
  }

  console.log(`Course card for '${course.courseName}' added to the DOM.`);
  cardNo++;
}

getCourses();
