import {auth, db } from "../firebaseConfig.mjs";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const cardsDiv = document.getElementById("card-grid");
let cardNo = 1;
let allCourses = []; 
let currentMonth = new Date().getMonth(); // Current month (0-11)
let currentYear = new Date().getFullYear(); // Current year

function getMonthName(monthIndex) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June", "July", 
    "August", "September", "October", "November", "December"
  ];
  return monthNames[monthIndex];
}

function updateMonthYearDisplay() {
  document.getElementById("month-year").textContent = `${getMonthName(currentMonth)} ${currentYear}`;
}


function getCourses() {
  const dbref = ref(db);

  get(child(dbref, "courses"))
    .then((courses) => {
      if (courses.exists()) {
        courses.forEach((course) => {
          allCourses.push(course);
          AddCourseToCard(course);
        });
        filterCoursesByMonth(); 
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching data: ", error);
    });
}

function filterCoursesByMonth() {
  cardsDiv.innerHTML = ""; // Clear the card grid
  cardNo = 1; // Reset card number

  const filteredCourses = allCourses.filter((course) => {
    const value = course.val();
    const startDate = new Date(value.startDate);
    const endDate = value.endDate ? new Date(value.endDate) : null;

    // Check if the course starts in the selected month/year or is ongoing
    const isStartingThisMonth = (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear);
    const isOngoingThisMonth = (startDate.getMonth() < currentMonth && (!endDate || endDate.getMonth() >= currentMonth) && startDate.getFullYear() <= currentYear);

    return isStartingThisMonth || isOngoingThisMonth;
  });

  // Add the filtered courses to the grid
  filteredCourses.forEach((course) => {
    AddCourseToCard(course);
  });
}

document.getElementById("left-arrow").addEventListener("click", () => {
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear--;
  } else {
    currentMonth--;
  }
  updateMonthYearDisplay();
  filterCoursesByMonth();
});

document.getElementById("right-arrow").addEventListener("click", () => {
  if (currentMonth === 11) {
    currentMonth = 0;
    currentYear++;
  } else {
    currentMonth++;
  }
  updateMonthYearDisplay();
  filterCoursesByMonth();
});

function AddCourseToCard(course) {
  const value = course.val();
  const card = document.createElement("div");
  card.classList.add("training-card");

  // Function to convert 12-hour format to 24-hour format
  function convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") {
      hours = modifier === "AM" ? "00" : "12";
    } else {
      hours = modifier === "PM" ? String(+hours + 12) : hours;
    }
    return `${hours}:${minutes}`;
  }

  // Get the current date
  const currentDate = new Date();

  // Parse course start and end dates
  const startDate = new Date(value.startDate);
  let endDate = value.endDate ? new Date(value.endDate) : null;

  // Handle case where endDate is not provided (show "TBD")
  let endDateText = endDate ? value.endDate : "TBD";

  // Determine course status and set the color dynamically
  let statusColor = "";
  if (currentDate < startDate) {
    statusColor = "#CA1919"; // Upcoming
  } else if (currentDate >= startDate && (!endDate || currentDate <= endDate)) {
    statusColor = "#D0BF26"; // Ongoing or TBD
  } else if (endDate && currentDate > endDate) {
    statusColor = "#156B1F"; // Finished
  }

  // Convert start and end time to 24-hour format
  const startTime = convertTo24Hour(value.startTime || "00:00 AM");
  const endTime = convertTo24Hour(value.endTime || "00:00 AM");

  // Convert time to Date objects for duration calculation
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);

  // Calculate the duration in hours and minutes
  const durationMs = end - start;
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.floor(
    (durationMs % (1000 * 60 * 60)) / (1000 * 60)
  );

  // Format the duration (e.g., "2 hours 30 minutes")
  let formattedDuration = "";
  if (durationHours > 0) {
    formattedDuration += `${durationHours} hour${durationHours > 1 ? "s" : ""}`;
  }
  if (durationMinutes > 0) {
    if (formattedDuration) formattedDuration += " ";
    formattedDuration += `${durationMinutes} minute${
      durationMinutes > 1 ? "s" : ""
    }`;
  }

  // If both hours and minutes are zero, set a default duration
  if (!formattedDuration) {
    formattedDuration = "0 minutes";
  }

  // Generate the date string including both start and end dates (or "TBD")
  const dateString = `${value.startDate || "N/A"} to ${endDateText}`;

  // Determine the correct icon based on the course mode
  const modeIcon =
    value.mode === "online" ? "../images/laptop.png" : "../images/people.png";

  card.innerHTML = `
    <div class="status">
      <span class="circle" style="background-color: ${statusColor};">
        <p id="course-number">${cardNo}</p>
      </span>
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
      Date: <strong id="date-time">${dateString} (${formattedDuration})</strong>
    </p>
    <p class="trainer">Trainer: <strong id="trainer-name">${
      value.trainerName || "Unknown"
    }</strong></p>
    <div class="icons">
      <img src="${modeIcon}" alt="Mode icon" />
    </div>
 <div class="three-dots">
             ⋮
    </div>
    <div class="popup-menu">
      <ul>
        <li> Edit</li>
        <hr>
        <div class="del-tag">
           <li>Delete</li>
        </div>
      </ul>
    </div>
  `;

  cardsDiv.appendChild(card);

  const threeDots = card.querySelector('.three-dots');
  const popupMenu = card.querySelector('.popup-menu');

  threeDots.addEventListener('click', (e) => {
    // Toggle the visibility of the popup menu
    popupMenu.style.display = popupMenu.style.display === 'block' ? 'none' : 'block';
  });

  // Hide the popup if clicking outside of the card
  document.addEventListener('click', (e) => {
    if (!threeDots.contains(e.target) && !popupMenu.contains(e.target)) {
      popupMenu.style.display = 'none';
    }
  });


  cardNo++;
}
// -----------------------------------


function searchCourses() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();
  cardsDiv.innerHTML = "";

  const filteredCourses = allCourses.filter((course) => {
    const courseName = course.val().courseName.toLowerCase();
    return courseName.includes(searchTerm);
  });

  cardNo = 1;
  filteredCourses.forEach((course) => {
    AddCourseToCard(course);
  });
}

document
  .getElementById("search-input")
  .addEventListener("input", searchCourses);

  window.addEventListener("load", () => {
    updateMonthYearDisplay(); // Show current month/year on page load
    getCourses(); // Fetch and display courses
  });



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
    console.log('User is signed in:', user.uid);
  } else {
    window.location.href = 'loginpage.html';
  }
});

//new