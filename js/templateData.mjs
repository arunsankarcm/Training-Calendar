import { db, auth } from "../firebaseConfig.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

document.addEventListener("DOMContentLoaded", function() {
  const loadingScreen = document.getElementById("loadingScreen");
  loadingScreen.style.display = "flex"; 
  setTimeout(function() {
      loadingScreen.style.display = "none"; 
      document.getElementById("body-main").style.display = "block"; 
  }, 1000);
});

getCourses();

const upcomingDiv = document.getElementById("upcoming-training-cards-section");
const ongoingDiv = document.getElementById("ongoing-training-cards-section");
let cardNo = 1;
let upcomingCardNo = 1;
let ongoingCardNo = 1;

const todaysDate = new Date();
const monthNamesArray = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const currentMonth = monthNamesArray[todaysDate.getMonth()];
const currentYear = todaysDate.getFullYear();

const urlParams = new URLSearchParams(window.location.search);
const monthText = urlParams.get("month");
const yearText = urlParams.get("year");
console.log("URL Parameters - Month:", monthText, "Year:", yearText);

const monthYearHeader = document.getElementById("month-year-header");
monthYearHeader.innerHTML = `<h6>${monthText} ${yearText}</h6>`;

const monthIndexFromURL = monthNamesArray.indexOf(monthText);
const yearFromURL = parseInt(yearText, 10);

const startOfMonth = new Date(yearFromURL, monthIndexFromURL, 1);
const endOfMonth = new Date(
  yearFromURL,
  monthIndexFromURL + 1,
  0,
  23,
  59,
  59,
  999
);

const currentDate = new Date();

// fetching from DB course details
function getCourses() {
  console.log("Fetching data from Firebase...");

  const dbref = ref(db);

  get(child(dbref, "courses"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log("Data fetched successfully!");
        const courses = snapshot.val();
        console.log("Courses data:", courses);

        const coursesArray = Object.keys(courses).map((key) => courses[key]);

        const sortedCourses = coursesArray.sort((a, b) => {
          const dateA = new Date(a.startDate);
          const dateB = new Date(b.startDate);
          return dateA - dateB;
        });

        const upcomingCourses = [];
        const ongoingCourses = [];

        sortedCourses.forEach((course) => {
          const courseStartDate = new Date(course.startDate);
          const courseEndDate = new Date(course.endDate);

          if (courseEndDate < currentDate) {
            console.log(
              `Course '${course.courseName}' has already ended, skipping.`
            );
          } else if (
            courseEndDate < startOfMonth ||
            courseStartDate > endOfMonth
          ) {
            console.log(
              `Course '${course.courseName}' does not overlap with the selected month, skipping.`
            );
          } else if (
            courseStartDate >= currentDate &&
            courseStartDate >= startOfMonth &&
            courseStartDate <= endOfMonth
          ) {
            console.log(`Rendering upcoming course: ${course.courseName}`);
            upcomingCourses.push(course);
          } else {
            console.log(`Rendering ongoing course: ${course.courseName}`);
            ongoingCourses.push(course);
          }
        });

        if (upcomingCourses.length === 0) {
          upcomingDiv.innerHTML = `<div class="NoCase">There are no upcoming courses.</div>`;
        } else {
          upcomingCourses.forEach((course, index) => {
            renderCourses(course, "upcoming", upcomingCourses.length, index);
          });
        }

        if (ongoingCourses.length === 0) {
          ongoingDiv.innerHTML = `<div class="NoCase">There are no ongoing courses in this month.</div>`;
        } else {
          ongoingCourses.forEach((course, index) => {
            renderCourses(course, "ongoing", ongoingCourses.length, index);
          });
        }
      } else {
        console.log("No data available");
      }
      //   upcomingCourses.forEach((course, index) => {
      //     renderCourses(course, "upcoming", upcomingCourses.length, index);
      //   });

      //   ongoingCourses.forEach((course, index) => {
      //     renderCourses(course, "ongoing", ongoingCourses.length, index);
      //   });
      // } else {
      //   console.log("No data available");
      // }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// rendering courses and inputing to the template
function renderCourses(course, section, totalCoursesInSection, currentIndex) {
  console.log(`Rendering course card for: ${course.courseName}`);
  const startDate = convertDateToCustomFormat(course.startDate);
  const endDate = convertDateToCustomFormat(course.endDate);
  // let courseEndDateValid = convertDateToCustomFormat(course.endDate);

  console.log(`Start Date: ${startDate}`);
  console.log(`End Date: ${endDate}`);
  
  const startTime = new Date(`${course.startDate}T${course.startTime}`);
  const endTime = new Date(`${course.startDate}T${course.endTime}`);

  const durationMs = endTime - startTime;
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.floor(
    (durationMs % (1000 * 60 * 60)) / (1000 * 60)
  );
  let durationString = null;
  if (durationHours > 1 && durationMinutes > 0) {
    durationString = `${durationHours} hrs ${durationMinutes} mins`;
  } else if (durationHours > 1 && durationMinutes === 0) {
    durationString = `${durationHours} hrs`;
  } else if (durationHours === 1 && durationMinutes > 0) {
    durationString = `${durationHours} hr ${durationMinutes} mins`;
  } else if (durationHours === 1 && durationMinutes === 0) {
    durationString = `${durationHours} hr`;
  } else if (durationHours === 0 && durationMinutes > 0) {
    durationString = `${durationMinutes} mins`;
  } else {
    durationString = `NS`;
  }

  // main card div
  const card = document.createElement("div");
  card.classList.add("training-card");

  const circleNumber = document.createElement("div");
  circleNumber.classList.add("circle-number");

  if (section === "upcoming") {
    circleNumber.innerHTML = `<span>${upcomingCardNo}</span>`;
    upcomingCardNo++;
  } else {
    circleNumber.innerHTML = `<span>${ongoingCardNo}</span>`;
    ongoingCardNo++;
  }

  // training details
  const trainingDetails = document.createElement("div");
  trainingDetails.classList.add("training-details");

  trainingDetails.innerHTML = `
    <p id ="training-heading">  ${course.courseName} </p>
    <div id="training-card-details">
    <p>Target Audience: <strong style="-webkit-text-stroke: 0.5px #4d4d4d;">${course.targetAudience}</strong></p>
    <p>Date: <strong style="-webkit-text-stroke: 0.5px #4d4d4d;"> ${startDate} </strong> <span style= "color: #4d4d4d;"> to </span> <strong style="-webkit-text-stroke: 0.5px #4d4d4d"> 
    ${endDate} </strong>  <strong style="-webkit-text-stroke: 0.5px #4d4d4d"> (${durationString}) </strong> </p>
    <p>Trainer:<strong style="-webkit-text-stroke: 0.5px #4d4d4d;"> ${course.trainerName} </strong> </p>
    </div>
  `;

  const modeTag = document.createElement("span");
  modeTag.classList.add("tag");

  if (course.mode && course.mode.trim() !== "") {
    modeTag.classList.add(course.mode.toLowerCase());
  }

  modeTag.textContent = course.mode
    ? course.mode.charAt(0).toUpperCase() + course.mode.slice(1)
    : "Unknown";

  card.appendChild(circleNumber);
  card.appendChild(trainingDetails);
  card.appendChild(modeTag);

  if (section === "upcoming") {
    upcomingDiv.appendChild(card);
  } else {
    ongoingDiv.appendChild(card);
  }

  if (currentIndex < totalCoursesInSection - 1) {
    const separationLine = document.createElement("div");
    separationLine.classList.add("line");

    if (section === "upcoming") {
      upcomingDiv.appendChild(separationLine);
    } else {
      ongoingDiv.appendChild(separationLine);
    }
  }

  console.log(`Course card for '${course.courseName}' added to the DOM.`);
  cardNo++;
}

// Excel sheet downloading function
document.getElementById("downloadBtn").addEventListener("click", function () {
  var data = [];

  data.push([
    "Number",
    "Training Title",
    "Target Audience",
    "Date",
    "Trainer",
    "Key Points",
    "Type",
  ]);

  var upcomingCards = document.querySelectorAll(
    "#upcoming-training-cards-section .training-card"
  );
  upcomingCards.forEach((card, index) => {
    var number = card.querySelector(".circle-number span").textContent.trim();
    var title = card
      .querySelector(".training-details #training-heading")
      .textContent.trim();
    var audience = card
      .querySelector(
        ".training-details #training-card-details p:nth-child(1)"
      )
      .textContent.replace("Target Audience: ", "").trim();
    var date = card
      .querySelector(
        ".training-details #training-card-details p:nth-child(2)"
      )
      .textContent.replace("Date: ", "").trim();
    var trainer = card
      .querySelector(
        ".training-details #training-card-details p:nth-child(3)"
      )
      .textContent.replace("Trainer:", "").trim();
    var keyPoints = ""; // Update this if you have key points in your data
    var type = card.querySelector(".tag").textContent.trim();

    data.push([number, title, audience, date, trainer, keyPoints, type]);
  });

  var ongoingCards = document.querySelectorAll(
    "#ongoing-training-cards-section .training-card"
  );
  ongoingCards.forEach((card, index) => {
    var number = card.querySelector(".circle-number span").textContent.trim();
    var title = card
      .querySelector(".training-details #training-heading")
      .textContent.trim();
    var audience = card
      .querySelector(
        ".training-details #training-card-details p:nth-child(1)"
      )
      .textContent.replace("Target Audience: ", "").trim();
    var date = card
      .querySelector(
        ".training-details #training-card-details p:nth-child(2)"
      )
      .textContent.replace("Date: ", "").trim();
    var trainer = card
      .querySelector(
        ".training-details #training-card-details p:nth-child(3)"
      )
      .textContent.replace("Trainer:", "").trim();
    var keyPoints = ""; // Update this if you have key points in your data
    var type = card.querySelector(".tag").textContent.trim();

    data.push([number, title, audience, date, trainer, keyPoints, type]);
  });

  var wb = XLSX.utils.book_new();

  var ws = XLSX.utils.aoa_to_sheet(data);

  XLSX.utils.book_append_sheet(wb, ws, "Training Calendar");

  XLSX.writeFile(wb, `Training_Calendar_${currentMonth}_${currentYear}.xlsx`);
  console.log("Number:", number);
console.log("Title:", title);
console.log("Audience:", audience);
console.log("Date:", date);
console.log("Trainer:", trainer);
console.log("Type:", type);

});

function convertDateToCustomFormat(dateString) {
  if (dateString == ''){
    return `TBD`;
  }
else {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}}


onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user.email);
  } else {
    window.location.href = "../index.html";
  }
});

document.getElementById("back-button").addEventListener("click", () => {
  window.location.href = "viewAllCourse.html";
});



