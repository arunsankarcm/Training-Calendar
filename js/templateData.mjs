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
      


          if (courseEndDate < currentDate) 
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

  //online/offline
  const modeTag = document.createElement("span");
  modeTag.classList.add("tag", course.mode);
  modeTag.textContent = course.mode.charAt(0).toUpperCase() + course.mode.slice(1); // Capitalize first letter of mode



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


document.getElementById('downloadPDFbtn').addEventListener('click', function (){
  const doc = new jsPDF();
  const upcomingCourses = document.getElementById("upcoming-training-cards-section");
  const ongoingCourses = document.getElementById("ongoing-training-cards-section");
  const dbref = ref(db);

  get(child(dbref, "courses"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log("Data fetched successfully!");
        const courses = snapshot.val();
        console.log("Courses data:", courses);

        // Render upcoming courses
  if (upcomingCourses.length > 0) {
    doc.setFontSize(12);
    doc.text("Upcoming Courses:", 10, yOffset);
    yOffset += 10;

    upcomingCourses.forEach((courses) => {
      doc.setFontSize(10);
      const courseText = formatCourseText(courses);
      // courseText.forEach((line) => {
      //   doc.text(line, 10, yOffset);
      //   yOffset += 6;
      // });
      yOffset += 6; // Add space between courses
    });
  }

  // Render ongoing courses
  if (ongoingCourses.length > 0) {
    doc.setFontSize(12);
    doc.text("Ongoing Courses:", 10, yOffset);
    yOffset += 10;

    ongoingCourses.forEach((courses) => {
      doc.setFontSize(10);
      const courseText = formatCourseText(courses);
      // courseText.forEach((line) => {
      //   doc.text(line, 10, yOffset);
      //   yOffset += 6;
      // });
      yOffset += 6; // Add space between courses
    });
  }
        
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });

  let yOffset = 10; // Initial y-offset for the text position

  // Add a title
  doc.setFontSize(14);
  doc.text("Training Calendar - October 2024", 10, yOffset);
  yOffset += 10;

  

  // Download the PDF
  doc.save("Training_Calendar_October_2024.pdf");
});

// Helper function to format course details into text
function formatCourseText(course) {
  const courseText = [];
  courseText.push(`Course Name: ${course.courseName}`);
  courseText.push(`Target Audience: ${course.targetAudience}`);
  courseText.push(`Date: ${course.startDate} to ${course.endDate}`);
  courseText.push(`Duration: ${course.startTime, course.endTime}`);
  courseText.push(`Trainer: ${course.trainerName}`);
  courseText.push(`Mode: ${course.mode}`);
  courseText.push(`Key Topics: ${course.keyPoints}`);
  return courseText;
}

// Helper function to calculate duration in hours and minutes
// function calculateDuration(startTime, endTime) {
//   const start = new Date(`1970-01-01T${startTime}`);
//   const end = new Date(`1970-01-01T${endTime}`);
//   const durationMs = end - start;
//   const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
//   const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
//   return `${durationHours} hrs ${durationMinutes} mins`;
// }

// Attach the PDF generation function to a button
document.getElementById("downloadPDFbtn").addEventListener("click", generatePDF);