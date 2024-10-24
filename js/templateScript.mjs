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
  console.log("Fetching data from Firebase..."); // Log before fetching data

  const dbref = ref(db);

  get(child(dbref, "courses"))
    .then((snapshot) => {

      if (snapshot.exists()) {
        console.log("Data fetched successfully!"); // Log when data is fetched
        const courses = snapshot.val(); // Get the courses object
        console.log("Courses data:", courses); // Log the fetched courses data

        for (const courseId in courses) {
          if (courses.hasOwnProperty(courseId)) {
            console.log(`Rendering course: ${courses[courseId].courseName}`); // Log each course being rendered
            renderCourses(courses[courseId]);
          }
        }

        // chatGPTstarts

        const coursesArray = Object.keys(courses).map((key) => courses[key]);

        // Sort courses by the start date
        const sortedCourses = coursesArray.sort((a, b) => {
          const dateA = new Date(a.startDate);
          const dateB = new Date(b.startDate);
          return dateA - dateB; // Ascending order
        });

        // Get the current date
        const currentDate = new Date();

        // Separate courses into ongoing and upcoming
        sortedCourses.forEach((course) => {
          const courseStartDate = new Date(course.startDate);

          if (courseStartDate >= currentDate) {
            // Upcoming courses (Start date is today or later)
            console.log(`Rendering upcoming course: ${course.courseName}`);
            renderCourses(course, "upcoming");
          } else {
            // Ongoing courses (Start date is in the past)
            console.log(`Rendering ongoing course: ${course.courseName}`);
            renderCourses(course, "ongoing");
          }
        });

        // chatGPTends


      } else {
        console.log("No data available"); // Log when no data is found
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error); // Log any errors
    });

}

function renderCourses(course,section) {
  console.log(`Rendering course card for: ${course.courseName}`);

  // Create the main card div
  const card = document.createElement("div");
  card.classList.add("training-card");

  // Circle number
  const circleNumber = document.createElement("div");
  circleNumber.classList.add("circle-number");
  circleNumber.innerHTML = `<span>${cardNo}</span>`;

  // Training details
  const trainingDetails = document.createElement("div");
  trainingDetails.classList.add("training-details");
  trainingDetails.innerHTML = `
    <h3>${course.courseName}</h3>
    <p><strong>Target Audience:</strong> ${course.targetAudience}</p>
    <p><strong>Date:</strong> ${course.startDate} (${course.startTime})</p>
    <p><strong>Trainer:</strong> ${course.trainerName}</p>
    <p><strong>Key points:</strong> ${course.keyPoints}</p>
  `;

  // Mode tag (Online/Offline)
  const modeTag = document.createElement("span");
  modeTag.classList.add("tag", course.mode);
  modeTag.textContent = course.mode.charAt(0).toUpperCase() + course.mode.slice(1); // Capitalize first letter of mode

  // Append elements to the card
  card.appendChild(circleNumber);
  card.appendChild(trainingDetails);
  card.appendChild(modeTag);

  // Append the card to the container
  if (section === "upcoming") {
    upcomingDiv.appendChild(card);
  } else {    
    ongoingDiv.appendChild(card);
  }

  // ongoingDiv.appendChild(card);
  // upcomingDiv.appendChild(card);


  console.log(`Course card for '${course.courseName}' added to the DOM.`);
  cardNo++;
}


// Call the function to fetch and render courses
getCourses();

 