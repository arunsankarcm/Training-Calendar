import { db } from "../firebaseConfig.mjs";
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
 
    //month year static
const todaysDate = new Date();
const monthNamesArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentMonth = monthNamesArray[todaysDate.getMonth()];
const currentYear = todaysDate.getFullYear();
 
// Update the header with the current month and year
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
 
        // Get the current date
        const currentDate = new Date();
        const upcomingCourses = [];
        const ongoingCourses = [];
 
 
        // Separate courses into ongoing and upcoming
        sortedCourses.forEach((course) => {
          const courseStartDate = new Date(course.startDate);
          const courseEndDate = new Date(course.endDate);
 
            // Extract current month and year
            const currentMonth = currentDate.getMonth();
            const courseStartMonth = courseStartDate.getMonth();
     
 
 
          if ((courseEndDate < currentDate) || ( courseStartMonth > currentMonth))
          {
            // Ignore courses that have already ended
            console.log(`Course '${course.courseName}' has ended, skipping.`);
          }
 
          else if ((courseStartDate >= currentDate) && (courseStartMonth === currentMonth))
           {
            // Upcoming courses (Start date is in the future)
            console.log(`Rendering upcoming course: ${course.courseName}`);
            upcomingCourses.push(course);
          }
          else 
          {
            // Ongoing courses (Start date is in the past, but the end date is today or later)
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
 
 
function renderCourses(course,section,totalCoursesInSection, currentIndex) {
  console.log(`Rendering course card for: ${course.courseName}`);
 
  // const courseDate = new Date(course.startDate);  
  const startTime = new Date(`${course.startDate}T${course.startTime}`);
  const endTime = new Date(`${course.startDate}T${course.endTime}`);
 
 
  const durationMs = endTime - startTime;
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
 let durationString = null;
if ((durationHours > 1) && ( durationMinutes > 0))
{
  durationString = `${durationHours} hrs ${durationMinutes} mins`;
}
else if ((durationHours > 1) && (durationMinutes === 0))
{
  durationString = `${durationHours} hrs`;
}
else if ((durationHours === 1) && ( durationMinutes > 0)) {
  durationString = `${durationHours} hr ${durationMinutes} mins`;
}
else if ((durationHours === 1) && ( durationMinutes === 0)) {
  durationString = `${durationHours} hr`;
}
else if ((durationHours === 0) && (durationMinutes > 0)){
  durationString = `${durationMinutes} mins`;
}
else{
  durationString = `NS`;
}
 
  let courseEndDateValid=course.endDate;
  if (courseEndDateValid === '')
  {
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
    <p><strong>Key topics:</strong> ${course.keyPoints}</p>
  `;
 
  // //online/offline
  // const modeTag = document.createElement("span");
  // modeTag.classList.add("tag", course.mode);
  // modeTag.textContent = course.mode.charAt(0).toUpperCase() + course.mode.slice(1); // Capitalize first letter of mode

  const modeTag = document.createElement("span");
modeTag.classList.add("tag"); // Always add the "tag" class

// Only add the mode class if it's a valid non-empty string
if (course.mode && course.mode.trim() !== "") {
    modeTag.classList.add(course.mode.toLowerCase()); // Convert to lowercase for consistency
}

modeTag.textContent = course.mode ? course.mode.charAt(0).toUpperCase() + course.mode.slice(1) : "Unknown"; // Handle case where mode is missing

 
 
  card.appendChild(circleNumber);
  card.appendChild(trainingDetails);
  card.appendChild(modeTag);
 
  if (section === "upcoming") {

      upcomingDiv.appendChild(card);
      

    // upcomingDiv.appendChild(separationLine)
  } else {    
    ongoingDiv.appendChild(card);
    // ongoingDiv.appendChild(separationLine);
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
 
document.getElementById('downloadPDFbtn').addEventListener('click', function () {
  const doc = new jsPDF();
  let yOffset = 10; // Initial y-offset for the text position
  const pageHeight = doc.internal.pageSize.height - 20; // Page height minus bottom margin
 
  // Helper function to check if content exceeds page height
  function checkPageBreak(yOffset) {
    if (yOffset > pageHeight) {
      doc.addPage();
      return 10; // Reset yOffset for the new page
    }
    return yOffset;
  }
 
    //month year static
const todaysDate = new Date();
const monthNamesArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentMonth = monthNamesArray[todaysDate.getMonth()];
const currentYear = todaysDate.getFullYear();
 
 
 
  // Add a title to the PDF
  doc.setFontSize(14);
  doc.text(`Training Calendar - ${currentMonth} ${currentYear}`, 10, yOffset);
  yOffset += 10;
 
  // Get the text from upcoming and ongoing sections
  const upcomingCoursesText = document.getElementById("upcoming-training-cards-section").innerText;
  const ongoingCoursesText = document.getElementById("ongoing-training-cards-section").innerText;
 
  // Print Upcoming Courses
  if (upcomingCoursesText.trim().length > 0) {
    doc.setFontSize(12);
    doc.text("Upcoming Courses:", 10, yOffset);
    yOffset += 10;
 
    // Split upcoming courses text into lines and print each line
    const upcomingCoursesLines = upcomingCoursesText.split('\n');
    upcomingCoursesLines.forEach((line) => {
      doc.setFontSize(10);
      doc.text(line, 10, yOffset);
      yOffset += 6;
      yOffset = checkPageBreak(yOffset); // Check for page break
    });
    yOffset += 10; // Add space after the section
    yOffset = checkPageBreak(yOffset); // Check for page break
  }
 
  // Print Ongoing Courses
  if (ongoingCoursesText.trim().length > 0) {
    doc.setFontSize(12);
    doc.text("Ongoing Courses:", 10, yOffset);
    yOffset += 10;
 
    // Split ongoing courses text into lines and print each line
    const ongoingCoursesLines = ongoingCoursesText.split('\n');
    ongoingCoursesLines.forEach((line) => {
      doc.setFontSize(10);
      doc.text(line, 10, yOffset);
      yOffset += 6;
      yOffset = checkPageBreak(yOffset); // Check for page break
    });
    yOffset += 10; // Add space after the section
    yOffset = checkPageBreak(yOffset); // Check for page break
  }
 
  // Download the generated PDF
  doc.save(`Training_Calendar_${currentMonth}_${currentYear}.pdf`);
});