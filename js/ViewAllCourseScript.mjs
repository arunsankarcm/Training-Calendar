import { auth, db } from "../firebaseConfig.mjs";
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  ref,
  get,
  child,
  remove,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const cardsDiv = document.getElementById("card-grid");
let allCourses = [];
let cardNumberMap = new Map();
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

let monthYearText = "";
let month = "";
let year = "";

//Returns the full name of a month based on its index (0-11).

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

//Updates the month and year display on the page based on the current month and year.

function updateMonthYearDisplay() {
  month = `${getMonthName(currentMonth)}`;
  year = `${currentYear}`;
  monthYearText = `${getMonthName(currentMonth)} ${currentYear}`;
  document.getElementById("month-year").textContent = monthYearText;

  console.log("Inside function:", monthYearText);
}

document.getElementById("export-img").addEventListener("click", () => {
  const url = `templatePage.html?month=${month}&year=${year}`;
  window.open(url, '_blank');
});


//Fetches all courses from the Firebase database and initializes the course display.

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
        filterCoursesByMonth();
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error("Error fetching data: ", error);
    });
}

//Assigns sequential card numbers to courses that start in the current month.

function assignCardNumbersForCurrentMonth() {
  cardNumberMap.clear();

  const filteredCourses = allCourses.filter((course) => {
    const value = course.val();
    const startDate = new Date(value.startDate);
    return (
      startDate.getMonth() === currentMonth &&
      startDate.getFullYear() === currentYear
    );
  });

  let cardNo = 1;
  filteredCourses.forEach((course) => {
    cardNumberMap.set(course.key, cardNo++);
  });
}


 //Filters courses to display only those that are relevant to the current month.

function filterCoursesByMonth() {
  cardsDiv.innerHTML = "";

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


 //* Creates a course card element and appends it to the DOM.
 
function AddCourseToCard(course, cardNo) {
  const value = course.val();
  const card = document.createElement("div");
  const courseKey = course.key;
  card.classList.add("training-card");

  // Converts time from 12-hour format to 24-hour format.
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

  const currentDate = new Date();

  const startDate = new Date(value.startDate);
  let endDate = value.endDate ? new Date(value.endDate) : null;

  let endDateText = endDate ? value.endDate : "TBD";

  // Determines the status color based on the current date and course dates.
  let statusColor = "";
  if (currentDate < startDate) {
    statusColor = "#CA1919"; 
  } else if (currentDate >= startDate && (!endDate || currentDate <= endDate)) {
    statusColor = "#D0BF26"; 
  } else if (endDate && currentDate > endDate) {
    statusColor = "#156B1F"; 
  }

  const startTime = convertTo24Hour(value.startTime || "00:00 AM");
  const endTime = convertTo24Hour(value.endTime || "00:00 AM");

  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);

  const durationMs = end - start;
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.floor(
    (durationMs % (1000 * 60 * 60)) / (1000 * 60)
  );

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

  if (!formattedDuration) {
    formattedDuration = "0 minutes";
  }

  const dateString = `${value.startDate || "N/A"} to ${endDateText}`;

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
    <div class="popup-menu" style="display:none;">
      <ul>
        <li class="edit-tag"><img src="../Images/edit (1).png" alt="edit icon" /></li>
        <hr>
        <div class="del-tag">
          <li><img src="../Images/dustbin.png" alt="delete icon" /></li>
        </div>
      </ul>
    </div>
  `;

  cardsDiv.appendChild(card);

  const threeDots = card.querySelector(".three-dots");
  const popupMenu = card.querySelector(".popup-menu");
  const deleteBtn = card.querySelector(".del-tag");
  const editBtn = card.querySelector(".edit-tag");

  // Event listener to toggle the popup menu when the three dots are clicked.
  threeDots.addEventListener("click", (e) => {
    popupMenu.style.display =
      popupMenu.style.display === "block" ? "none" : "block";
  });

  // Hides the popup menu when clicking outside of it.
  document.addEventListener("click", (e) => {
    if (!threeDots.contains(e.target) && !popupMenu.contains(e.target)) {
      popupMenu.style.display = "none";
    }
  });

  // Deletes the course from the database and UI after confirmation.
  deleteBtn.addEventListener("click", () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this course?"
    );
    if (confirmDelete) {
      const courseRef = ref(db, `courses/${courseKey}`);
      remove(courseRef)
        .then(() => {
          card.remove();
          console.log("Course deleted successfully.");
        })
        .catch((error) => {
          console.error("Error deleting course:", error);
        });
    }
  });

  // Redirects to the course edit page with the course key as a parameter.
  editBtn.addEventListener("click", () => {
    window.location.href = `indexupdate.html?courseKey=${courseKey}`;
  });
}


//Performs a real-time search of courses based on the user's input

function searchCourses() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();
  cardsDiv.innerHTML = "";

  if (searchTerm === "") {
    filterCoursesByMonth();
    return;
  }

  const filteredCourses = allCourses.filter((course) => {
    const value = course.val();
    const courseName = value.courseName.toLowerCase();
    const startDate = new Date(value.startDate);

    const isInCurrentMonth =
      startDate.getMonth() === currentMonth &&
      startDate.getFullYear() === currentYear;
    const matchesSearch = courseName.includes(searchTerm);

    return isInCurrentMonth && matchesSearch;
  });

  filteredCourses.forEach((course) => {
    const cardNumber = cardNumberMap.get(course.key);
    if (cardNumber) {
      AddCourseToCard(course, cardNumber);
    }
  });
}

const iconButton = document.getElementById("iconButton");
const popupMenuFilter = document.getElementById("popupMenuFilter");


//Toggles the visibility of the filter popup menu when the filter icon is clicked.

function togglePopup() {
  popupMenuFilter.style.display =
    popupMenuFilter.style.display === "block" ? "none" : "block";
}

iconButton.addEventListener("click", (e) => {
  e.stopPropagation();
  togglePopup();
});

document.getElementById("filter-upcoming").addEventListener("click", () => {
  filterCourses("upcoming");
  popupMenuFilter.style.display = "none";
});

document.getElementById("filter-ongoing").addEventListener("click", () => {
  filterCourses("ongoing");
  popupMenuFilter.style.display = "none";
});

document.getElementById("filter-completed").addEventListener("click", () => {
  filterCourses("completed");
  popupMenuFilter.style.display = "none";
});

/**
 * Filters courses based on their status (upcoming, ongoing, completed)
 * and displays the filtered courses on the page.
 */
function filterCourses(filterType) {
  cardsDiv.innerHTML = "";
  const currentDate = new Date();

  const monthFilteredCourses = allCourses.filter((course) => {
    const value = course.val();
    const startDate = new Date(value.startDate);
    const startMonth = startDate.getMonth();
    const startYear = startDate.getFullYear();

    return startMonth === currentMonth && startYear === currentYear;
  });

  let filteredCourses = [];

  switch (filterType) {
    case "upcoming":
      filteredCourses = monthFilteredCourses.filter((course) => {
        const value = course.val();
        const startDate = new Date(value.startDate);
        return startDate > currentDate;
      });
      break;

    case "ongoing":
      filteredCourses = monthFilteredCourses.filter((course) => {
        const value = course.val();
        const startDate = new Date(value.startDate);
        const endDate = value.endDate ? new Date(value.endDate) : null;

        return startDate <= currentDate && (!endDate || endDate >= currentDate);
      });
      break;

    case "completed":
      filteredCourses = monthFilteredCourses.filter((course) => {
        const value = course.val();
        const endDate = value.endDate ? new Date(value.endDate) : null;

        return endDate && endDate < currentDate;
      });
      break;

    default:
      filteredCourses = monthFilteredCourses;
  }

  filteredCourses.forEach((course) => {
    const cardNumber = cardNumberMap.get(course.key);
    if (cardNumber) {
      AddCourseToCard(course, cardNumber);
    }
  });
}

document
  .getElementById("search-input")
  .addEventListener("input", searchCourses);

window.addEventListener("load", () => {
  updateMonthYearDisplay();
  getCourses();
});

document.getElementById("logout_button").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      localStorage.setItem("logoutMessage", "Logged out successfully.");

      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Sign out error:", error);
    });
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user.email);
  } else {
    window.location.href = "index.html";
  }
});
