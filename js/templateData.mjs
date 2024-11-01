import { db, auth } from "../firebaseConfig.mjs";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const upcomingDiv = document.getElementById("upcoming-training-cards-section");
const ongoingDiv = document.getElementById("ongoing-training-cards-section");
let cardNo = 1;
let upcomingCardNo = 1;
let ongoingCardNo = 1;
const { jsPDF } = window.jspdf;

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

// Parse month and year from URL parameters
// Parse month and year from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const monthText = urlParams.get("month");
const yearText = urlParams.get("year");
console.log("URL Parameters - Month:", monthText, "Year:", yearText);

// Update the header
const monthYearHeader = document.getElementById("month-year-header");
monthYearHeader.innerHTML = `<h6>${monthText} ${yearText}</h6>`;

// Get month index and year
const monthIndexFromURL = monthNamesArray.indexOf(monthText);
const yearFromURL = parseInt(yearText, 10);

// Define start and end of the selected month
const startOfMonth = new Date(yearFromURL, monthIndexFromURL, 1);
const endOfMonth = new Date(yearFromURL, monthIndexFromURL + 1, 0, 23, 59, 59, 999);

// Get the current date
const currentDate = new Date();

getCourses();

// Fetching data from the Database
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

          // Check if the course has already ended
          if (courseEndDate < currentDate) {
            console.log(
              `Course '${course.courseName}' has already ended, skipping.`
            );
          }
          // Check if the course does not overlap with the selected month
          else if (
            courseEndDate < startOfMonth ||
            courseStartDate > endOfMonth
          ) {
            console.log(
              `Course '${course.courseName}' does not overlap with the selected month, skipping.`
            );
          }
          // Upcoming courses: start date is in the future and within the selected month
          else if (
            courseStartDate >= currentDate &&
            courseStartDate >= startOfMonth &&
            courseStartDate <= endOfMonth
          ) {
            console.log(`Rendering upcoming course: ${course.courseName}`);
            upcomingCourses.push(course);
          }
          // Ongoing courses: currently active and overlap with the selected month
          else {
            console.log(`Rendering ongoing course: ${course.courseName}`);
            ongoingCourses.push(course);
          }
        });

        upcomingCourses.forEach((course, index) => {
          renderCourses(course, "upcoming", upcomingCourses.length, index);
        });

        ongoingCourses.forEach((course, index) => {
          renderCourses(course, "ongoing", ongoingCourses.length, index);
        });
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// rendering courses and inputing to the template
function renderCourses(course, section, totalCoursesInSection, currentIndex) {
  console.log(`Rendering course card for: ${course.courseName}`);

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

  let courseEndDateValid = course.endDate;
  if (courseEndDateValid === "") {
    courseEndDateValid = "TBD";
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
    <h3>${course.courseName}</h3>
    <p><strong>Target Audience:</strong> ${course.targetAudience}</p>
    <p><strong>Date & Time:</strong> ${course.startDate} to ${courseEndDateValid} || (${durationString})</p>
    <p><strong>Trainer:</strong> ${course.trainerName}</p>
    
  `;
  //if need copy and paste
  // <p><strong>Key topics:</strong> ${course.keyPoints}</p>

  const modeTag = document.createElement("span");
  modeTag.classList.add("tag");

  if (course.mode && course.mode.trim() !== "") {
    modeTag.classList.add(course.mode.toLowerCase());
  }

  modeTag.textContent = course.mode
    ? course.mode.charAt(0).toUpperCase() + course.mode.slice(1)
    : "Unknown"; // Handle case where mode is missing

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

// PDF downloading Function
document
  .getElementById("downloadPDFbtn")
  .addEventListener("click", function () {
    const doc = new jsPDF();
    let yOffset = 10;
    const pageHeight = doc.internal.pageSize.height - 20;

    function checkPageBreak(yOffset) {
      if (yOffset > pageHeight) {
        doc.addPage();
        return 10;
      }
      return yOffset;
    }

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

    doc.setFontSize(14);
    doc.text(`Training Calendar - ${currentMonth} ${currentYear}`, 10, yOffset);
    yOffset += 10;

    const upcomingCoursesText = document.getElementById(
      "upcoming-training-cards-section"
    ).innerText;
    const ongoingCoursesText = document.getElementById(
      "ongoing-training-cards-section"
    ).innerText;

    if (upcomingCoursesText.trim().length > 0) {
      doc.setFontSize(12);
      doc.text("Upcoming Courses:", 10, yOffset);
      yOffset += 10;

      const upcomingCoursesLines = upcomingCoursesText.split("\n");
      upcomingCoursesLines.forEach((line) => {
        doc.setFontSize(10);
        doc.text(line, 10, yOffset);
        yOffset += 6;
        yOffset = checkPageBreak(yOffset);
      });
      yOffset += 10;
      yOffset = checkPageBreak(yOffset);
    }

    if (ongoingCoursesText.trim().length > 0) {
      doc.setFontSize(12);
      doc.text("Ongoing Courses:", 10, yOffset);
      yOffset += 10;

      const ongoingCoursesLines = ongoingCoursesText.split("\n");
      ongoingCoursesLines.forEach((line) => {
        doc.setFontSize(10);
        doc.text(line, 10, yOffset);
        yOffset += 6;
        yOffset = checkPageBreak(yOffset);
      });
      yOffset += 10;
      yOffset = checkPageBreak(yOffset);
    }

    doc.save(`Training_Calendar_${currentMonth}_${currentYear}.pdf`);
  });

// excel sheet downloading function
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
    ".upcoming-section .training-card"
  );
  upcomingCards.forEach((card, index) => {
    var number = card.querySelector(".circle-number span").textContent;
    var title = card.querySelector(".training-details h3").textContent;
    var audience = card
      .querySelector(".training-details p:nth-child(2)")
      .textContent.replace("Target Audience: ", "");
    var date = card
      .querySelector(".training-details p:nth-child(3)")
      .textContent.replace("Date: ", "");
    var trainer = card
      .querySelector(".training-details p:nth-child(4)")
      .textContent.replace("Trainer: ", "");
    var keyPoints = card
      .querySelector(".training-details p:nth-child(5)")
      .textContent.replace("Key points: ", "");
    var type = card.querySelector(".tag").textContent;

    data.push([number, title, audience, date, trainer, keyPoints, type]);
  });

  var ongoingCards = document.querySelectorAll(
    ".ongoing-section .training-card"
  );
  ongoingCards.forEach((card, index) => {
    var number = card.querySelector(".circle-number span").textContent;
    var title = card.querySelector(".training-details h3").textContent;
    var audience = card
      .querySelector(".training-details p:nth-child(2)")
      .textContent.replace("Target Audience: ", "");
    var date = card
      .querySelector(".training-details p:nth-child(3)")
      .textContent.replace("Date: ", "");
    var trainer = card
      .querySelector(".training-details p:nth-child(4)")
      .textContent.replace("Trainer: ", "");
    var keyPoints = card
      .querySelector(".training-details p:nth-child(5)")
      .textContent.replace("Key points: ", "");
    var type = card.querySelector(".tag").textContent;

    data.push([number, title, audience, date, trainer, keyPoints, type]);
  });

  var wb = XLSX.utils.book_new();

  var ws = XLSX.utils.aoa_to_sheet(data);

  XLSX.utils.book_append_sheet(wb, ws, "Training Calendar");

  XLSX.writeFile(wb, `Training_Calendar_${currentMonth}_${currentYear}.xlsx`);
});

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
