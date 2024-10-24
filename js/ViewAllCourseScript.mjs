import { auth, db } from "../firebaseConfig.mjs";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  ref,
  get,
  child,
  remove,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const cardsDiv = document.getElementById("card-grid");
let allCourses = [];
let cardNumberMap = new Map(); // Store original card numbers
let currentMonth = new Date().getMonth(); // Current month (0-11)
let currentYear = new Date().getFullYear(); // Current year

let monthYearText = ""; // Declare monthYearText as a global variable
let month = '';
let year = '';


function getMonthName(monthIndex) {
  const monthNames = [
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
  return monthNames[monthIndex];
}

function updateMonthYearDisplay() {
  month = `${getMonthName(currentMonth)}`;
  year = `${currentYear}`;
  monthYearText = `${getMonthName(currentMonth)} ${currentYear}`; // Set the global variable
  document.getElementById("month-year").textContent = monthYearText;

  // Log the updated value of 'month-year' to the console
  console.log("Inside function:", monthYearText);
}

document.getElementById('export-img').addEventListener('click', () => {
  window.location.href = `templatePage.html?month=${month}&year=${year}`;
});

function getCourses() {
  const dbref = ref(db);

  get(child(dbref, "courses"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        allCourses = [];
        snapshot.forEach((course) => {
          allCourses.push(course);
        });
        assignCardNumbersForCurrentMonth();
        filterCoursesByMonth(); // Initial display of courses
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching data: ", error);
    });
}

function assignCardNumbersForCurrentMonth() {
  cardNumberMap.clear(); // Clear the card number map for the current month

  // Filter the courses for the current month and year
  const filteredCourses = allCourses.filter((course) => {
    const value = course.val();
    const startDate = new Date(value.startDate);
    return (
      startDate.getMonth() === currentMonth &&
      startDate.getFullYear() === currentYear
    );
  });

  // Assign card numbers to the filtered courses
  let cardNo = 1;
  filteredCourses.forEach((course) => {
    cardNumberMap.set(course.key, cardNo++);
  });
}

function filterCoursesByMonth() {
  cardsDiv.innerHTML = "";

  // Filter courses for the current month and year
  const filteredCourses = allCourses.filter((course) => {
    const value = course.val();
    const startDate = new Date(value.startDate);
    const endDate = value.endDate ? new Date(value.endDate) : null;

    const isStartingThisMonth =
      startDate.getMonth() === currentMonth &&
      startDate.getFullYear() === currentYear;
    const isOngoingThisMonth =
      startDate.getMonth() < currentMonth &&
      (!endDate || endDate.getMonth() >= currentMonth) &&
      startDate.getFullYear() <= currentYear;

    return isStartingThisMonth || isOngoingThisMonth;
  });

  // Display the courses using their assigned card numbers
  filteredCourses.forEach((course) => {
    const cardNumber = cardNumberMap.get(course.key);
    if (cardNumber) {
      AddCourseToCard(course, cardNumber);
    }
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
  assignCardNumbersForCurrentMonth();
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
  assignCardNumbersForCurrentMonth();
  filterCoursesByMonth();
});

function AddCourseToCard(course, cardNo) {
  const value = course.val();
  const card = document.createElement("div");
  const courseKey = course.key;
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
        <li class="edit-tag">Edit</li>
        <hr>
        <div class="del-tag">
          <li>Delete</li>
        </div>
      </ul>
    </div>
  `;

  cardsDiv.appendChild(card);

  const threeDots = card.querySelector(".three-dots");
  const popupMenu = card.querySelector(".popup-menu");
  const deleteBtn = card.querySelector(".del-tag");
  const editBtn = card.querySelector(".edit-tag");

  threeDots.addEventListener("click", (e) => {
    // Toggle the visibility of the popup menu
    popupMenu.style.display =
      popupMenu.style.display === "block" ? "none" : "block";
  });

  // Hide the popup if clicking outside of the card
  document.addEventListener("click", (e) => {
    if (!threeDots.contains(e.target) && !popupMenu.contains(e.target)) {
      popupMenu.style.display = "none";
    }
  });

  deleteBtn.addEventListener("click", () => {
    // Confirm deletion
    const confirmDelete = confirm("Are you sure you want to delete this course?");
    if (confirmDelete) {
      // Remove the course from Firebase
      const courseRef = ref(db, `courses/${courseKey}`);
      remove(courseRef)
        .then(() => {
          // Remove the course card from the UI
          card.remove();
          console.log("Course deleted successfully.");
        })
        .catch((error) => {
          console.error("Error deleting course:", error);
        });
    }
  });

  editBtn.addEventListener("click", () => {
    // Redirect to the edit page, passing the course key as a query parameter
    window.location.href = `indexupdate.html?courseKey=${courseKey}`;
  });
}

function searchCourses() {
  const searchTerm = document.getElementById("search-input").value.toLowerCase();
  cardsDiv.innerHTML = "";

  if (searchTerm === "") {
    filterCoursesByMonth();
    return;
  }

  const filteredCourses = allCourses.filter((course) => {
    const value = course.val();
    const courseName = value.courseName.toLowerCase();
    const startDate = new Date(value.startDate);

    // Check if course is in current month and matches search term
    const isInCurrentMonth =
      startDate.getMonth() === currentMonth &&
      startDate.getFullYear() === currentYear;
    const matchesSearch = courseName.includes(searchTerm);

    return isInCurrentMonth && matchesSearch;
  });

  // Display filtered results with their monthly card numbers
  filteredCourses.forEach((course) => {
    const cardNumber = cardNumberMap.get(course.key);
    if (cardNumber) {
      AddCourseToCard(course, cardNumber);
    }
  });
}

const iconButton = document.getElementById('iconButton');
const popupMenuFilter = document.getElementById('popupMenuFilter');

function togglePopup() {
  popupMenuFilter.style.display = popupMenuFilter.style.display === 'block' ? 'none' : 'block';
}

iconButton.addEventListener('click', (e) => {
  e.stopPropagation();
  togglePopup();
});

document.getElementById('filter-upcoming').addEventListener('click', () => {
  filterCourses('upcoming');
  popupMenuFilter.style.display = 'none';
});

document.getElementById('filter-ongoing').addEventListener('click', () => {
  filterCourses('ongoing');
  popupMenuFilter.style.display = 'none';
});

document.getElementById('filter-completed').addEventListener('click', () => {
  filterCourses('completed');
  popupMenuFilter.style.display = 'none';
});

function filterCourses(filterType) {
  cardsDiv.innerHTML = "";
  const currentDate = new Date();

  // Step 1: Filter courses that belong to the currently selected month and year
  const monthFilteredCourses = allCourses.filter((course) => {
    const value = course.val();
    const startDate = new Date(value.startDate);
    const startMonth = startDate.getMonth();
    const startYear = startDate.getFullYear();

    return startMonth === currentMonth && startYear === currentYear;
  });

  let filteredCourses = [];

  // Step 2: Further filter courses based on the filterType
  switch (filterType) {
    case "upcoming":
      filteredCourses = monthFilteredCourses.filter((course) => {
        const value = course.val();
        const startDate = new Date(value.startDate);
        return startDate > currentDate; // Course is upcoming if it starts after the current date
      });
      break;

    case "ongoing":
      filteredCourses = monthFilteredCourses.filter((course) => {
        const value = course.val();
        const startDate = new Date(value.startDate);
        const endDate = value.endDate ? new Date(value.endDate) : null;
        // Course is ongoing if it started before the current date and either has no end date or ends after the current date
        return startDate <= currentDate && (!endDate || endDate >= currentDate);
      });
      break;

    case "completed":
      filteredCourses = monthFilteredCourses.filter((course) => {
        const value = course.val();
        const startDate = new Date(value.startDate);
        const endDate = value.endDate ? new Date(value.endDate) : null;
        // Course is completed if it ended before the current date
        return endDate && endDate < currentDate;
      });
      break;

    default:
      filteredCourses = monthFilteredCourses; // If no specific filter is selected, use all courses for the month
  }

  // Step 3: Display the filtered courses with their monthly card numbers
  filteredCourses.forEach((course) => {
    const cardNumber = cardNumberMap.get(course.key);
    if (cardNumber) {
      AddCourseToCard(course, cardNumber); // Render each filtered course with its card number
    }
  });
}


// Add the event listener for real-time search
document.getElementById("search-input").addEventListener("input", searchCourses);

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
    console.log('User is signed in:', user.email);
  } else {
    window.location.href = 'loginpage.html';
  }
});