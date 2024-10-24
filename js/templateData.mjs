import { db } from "../firebaseConfig.mjs";
import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const { jsPDF } = window.jspdf;
const upcomingDiv = document.getElementById("upcoming-training-cards-section");
const ongoingDiv = document.getElementById("ongoing-training-cards-section");
let cardNo = 1;
let upcomingCardNo = 1;
let ongoingCardNo = 1;

// Month and year variables
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
let currentMonth = monthNamesArray[todaysDate.getMonth()];
let currentYear = todaysDate.getFullYear();

const urlParams = new URLSearchParams(window.location.search);
const monthText = urlParams.get("month");
const yearText = urlParams.get("year");
console.log("URL Parameters - Month:", monthText, "Year:", yearText);

if (monthText && yearText) {
  if (monthNamesArray.includes(monthText) && !isNaN(yearText)) {
    currentMonth = monthText;
    currentYear = yearText;
  }
}

// Update the header with the selected month and year
const monthYearHeader = document.getElementById("month-year-header");
monthYearHeader.innerHTML = `<h6>${currentMonth} ${currentYear}</h6>`;

function getCourses() {
  console.log("Fetching data from Firebase...");

  const dbref = ref(db);

  get(child(dbref, "courses"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log("Data fetched successfully!");
        const courses = snapshot.val();
        console.log("Courses data:", courses);

        // Convert courses object into an array for sorting
        const coursesArray = Object.keys(courses).map((key) => courses[key]);

        // Sort courses by the start date
        const sortedCourses = coursesArray.sort((a, b) => {
          const dateA = new Date(a.startDate);
          const dateB = new Date(b.startDate);
          return dateA - dateB; // Ascending order
        });

        // Convert currentMonth and currentYear to numerical values
        const currentMonthIndex = monthNamesArray.indexOf(currentMonth); // 0-based index
        const currentYearNumber = parseInt(currentYear);

        const upcomingCourses = [];
        const ongoingCourses = [];

        sortedCourses.forEach((course) => {
          const courseStartDate = new Date(course.startDate);
          const courseEndDate = course.endDate
            ? new Date(course.endDate)
            : null;

          const courseStartMonth = courseStartDate.getMonth();
          const courseStartYear = courseStartDate.getFullYear();
          const courseEndMonth = courseEndDate
            ? courseEndDate.getMonth()
            : null;
          const courseEndYear = courseEndDate
            ? courseEndDate.getFullYear()
            : null;

          // Check if course occurs in the selected month and year
          const courseOccursInSelectedMonth =
            (courseStartYear < currentYearNumber ||
              (courseStartYear === currentYearNumber &&
                courseStartMonth <= currentMonthIndex)) &&
            (!courseEndDate ||
              courseEndYear > currentYearNumber ||
              (courseEndYear === currentYearNumber &&
                courseEndMonth >= currentMonthIndex));

          if (!courseOccursInSelectedMonth) {
            // Course does not occur in the selected month and year
            console.log(
              `Course '${course.courseName}' does not occur in ${currentMonth} ${currentYear}, skipping.`
            );
          } else if (
            courseStartMonth === currentMonthIndex &&
            courseStartYear === currentYearNumber
          ) {
            // Course starts in the selected month and year
            console.log(`Rendering upcoming course: ${course.courseName}`);
            upcomingCourses.push(course);
          } else {
            // Course spans the selected month and year but started earlier
            console.log(`Rendering ongoing course: ${course.courseName}`);
            ongoingCourses.push(course);
          }
        });

        if (upcomingCourses.length === 0 && ongoingCourses.length === 0) {
          const noCoursesMessage = document.createElement("p");
          noCoursesMessage.textContent = `No courses available for ${currentMonth} ${currentYear}.`;
          noCoursesMessage.style.textAlign = "center";
          noCoursesMessage.style.marginTop = "20px";
          document.getElementById("courses-section").appendChild(noCoursesMessage);
        }

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

function renderCourses(course, section, totalCoursesInSection, currentIndex) {
  // Existing renderCourses function
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

  // Main card div
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

  // Training details
  const trainingDetails = document.createElement("div");
  trainingDetails.classList.add("training-details");

  trainingDetails.innerHTML = `
    <h3>${course.courseName}</h3>
    <p><strong>Target Audience:</strong> ${course.targetAudience}</p>
    <p><strong>Date & Time:</strong> ${course.startDate} to ${courseEndDateValid} || (${durationString})</p> 
    <p><strong>Trainer:</strong> ${course.trainerName}</p>
    <p><strong>Key topics:</strong> ${course.keyPoints}</p>
  `;

  // Online/offline
  const modeTag = document.createElement("span");
  modeTag.classList.add("tag", course.mode.toLowerCase());
  modeTag.textContent =
    course.mode.charAt(0).toUpperCase() + course.mode.slice(1); // Capitalize first letter of mode

  card.appendChild(circleNumber);
  card.appendChild(trainingDetails);
  card.appendChild(modeTag);

  if (section === "upcoming") {
    upcomingDiv.appendChild(card);
  } else {
    ongoingDiv.appendChild(card);
  }

  // Only add a separation line if it's NOT the last course in the section
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

getCourses();

// PDF Generation Function
function generatePDF() {
  // Existing generatePDF function
  const doc = new jsPDF();
  let yOffset = 20; // Initial y-offset for the text position

  // Add a title with the correct month and year
  doc.setFontSize(14);
  doc.text(`Training Calendar - ${currentMonth} ${currentYear}`, 10, yOffset);
  yOffset += 10;

  const upcomingCoursesSection = document.getElementById(
    "upcoming-training-cards-section"
  );
  const ongoingCoursesSection = document.getElementById(
    "ongoing-training-cards-section"
  );

  // Render upcoming courses
  const upcomingCourses =
    upcomingCoursesSection.querySelectorAll(".training-card");
  if (upcomingCourses.length > 0) {
    doc.setFontSize(12);
    doc.text("Upcoming Courses:", 10, yOffset);
    yOffset += 10;

    upcomingCourses.forEach((courseCard) => {
      doc.setFontSize(10);
      const courseText = formatCourseTextFromDOM(courseCard);
      courseText.forEach((line) => {
        doc.text(line, 10, yOffset);
        yOffset += 6;

        // Check for page overflow
        if (yOffset > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yOffset = 20;
        }
      });
      yOffset += 6; // Add space between courses
    });
  }

  // Render ongoing courses
  const ongoingCourses =
    ongoingCoursesSection.querySelectorAll(".training-card");
  if (ongoingCourses.length > 0) {
    doc.setFontSize(12);
    doc.text("Ongoing Courses:", 10, yOffset);
    yOffset += 10;

    ongoingCourses.forEach((courseCard) => {
      doc.setFontSize(10);
      const courseText = formatCourseTextFromDOM(courseCard);
      courseText.forEach((line) => {
        doc.text(line, 10, yOffset);
        yOffset += 6;

        // Check for page overflow
        if (yOffset > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yOffset = 20;
        }
      });
      yOffset += 6; // Add space between courses
    });
  }

  // Download the PDF
  doc.save(`Training_Calendar_${currentMonth}_${currentYear}.pdf`);
}

// Helper function to extract course details from the DOM
function formatCourseTextFromDOM(courseCard) {
  const courseText = [];
  const courseName = courseCard.querySelector(".training-details h3").innerText;
  const details = courseCard.querySelectorAll(".training-details p");

  courseText.push(`Course Name: ${courseName}`);
  details.forEach((detail) => {
    courseText.push(detail.innerText);
  });
  return courseText;
}

// Attach the PDF generation function to the button
document
  .getElementById("downloadPDFbtn")
  .addEventListener("click", generatePDF);
