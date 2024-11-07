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
  monthYearText = `${getMonthName(currentMonth)} ${currentYear}`;
  document.getElementById("month-year").textContent = monthYearText;

  console.log("Inside function:", monthYearText);
}

function getCourses() {
  const dbref = ref(db);

  get(child(dbref, "courses"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        allCourses = [];
        snapshot.forEach((course) => {
          allCourses.push(course);
        });

        allCourses.sort((a, b) => {
          const dateA = new Date(a.val().startDate);
          const dateB = new Date(b.val().startDate);
          return dateA - dateB;
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

function assignCardNumbersForCurrentMonth() {
  cardNumberMap.clear();

  const filteredCourses = allCourses.filter((course) => {
    const value = course.val();
    const startDate = new Date(value.startDate);
    const endDate = value.endDate ? new Date(value.endDate) : null;

    const isStartingThisMonth =
      startDate.getMonth() === currentMonth &&
      startDate.getFullYear() === currentYear;

    const isOngoingThisMonth =
      startDate <= new Date(currentYear, currentMonth + 1, 0) && // Course started before or in current month
      (endDate
        ? endDate >= new Date(currentYear, currentMonth, 1) // Course ends after or in current month
        : true); // If no end date, assume ongoing

    return isStartingThisMonth || isOngoingThisMonth;
  });

  let cardNo = 1;
  filteredCourses.forEach((course) => {
    cardNumberMap.set(course.key, cardNo++);
  });
}

function checkForNoCourses() {
  if (cardsDiv.children.length === 0) {
    if (!document.querySelector(".no-courses-popup")) {
      const popup = document.createElement("div");
      popup.textContent = "No courses to display";
      popup.classList.add("no-courses-popup");
      popup.style.position = "fixed";
      popup.style.bottom = "220px";
      popup.style.left = "50%";
      popup.style.transform = "translateX(-50%)";
      popup.style.color = "#555555";
      popup.style.fontSize = "x-large";
      popup.style.zIndex = "1000";
      document.body.appendChild(popup);
    }
  } else {
    const existingPopup = document.querySelector(".no-courses-popup");
    if (existingPopup) {
      existingPopup.remove();
    }
  }
}

function filterCoursesByMonth() {
  cardsDiv.innerHTML = "";

  // Filter courses that are either starting or ongoing in the current month and year
  const filteredCourses = allCourses.filter((course) => {
    const value = course.val();
    const startDate = new Date(value.startDate);
    const endDate = value.endDate ? new Date(value.endDate) : null;

    const isStartingThisMonth =
      startDate.getMonth() === currentMonth &&
      startDate.getFullYear() === currentYear;

    const isOngoingThisMonth =
      startDate.getFullYear() <= currentYear &&
      (endDate
        ? endDate.getFullYear() > currentYear ||
          (endDate.getFullYear() === currentYear &&
            endDate.getMonth() >= currentMonth)
        : true);

    return isStartingThisMonth || isOngoingThisMonth;
  });

  filteredCourses.forEach((course) => {
    const cardNumber = cardNumberMap.get(course.key);
    if (cardNumber) {
      AddCourseToCard(course, cardNumber);
    }
  });
  checkForNoCourses();
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

let userRole;

onAuthStateChanged(auth, (user) => {
  if (user) {
    user.getIdTokenResult().then((idTokenResult) => {
      userRole = idTokenResult.claims.role;
      console.log("User Role:", userRole);
      handleRoleBasedFunctionality(userRole);
    });
    console.log("User is signed in:", user.email);
  } else {
    window.location.href = "../index.html";
  }
});

function AddCourseToCard(course, cardNo) {
  const value = course.val();
  const card = document.createElement("div");
  const courseKey = course.key;
  card.classList.add("training-card");

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

  let modeIcon;
  switch (value.mode) {
    case "online":
      modeIcon = "../Images/laptop.png";
      break;
    case "offline":
      modeIcon = "../Images/people.png";
      break;
    case "blended":
      modeIcon = "../Images/blended.png";
      break;
    default:
      modeIcon = "../Images/default.png";
  }

  card.innerHTML = `
    <div class="status">
      <span class="circle" style="background-color: ${statusColor};">
        <p id="course-number">${cardNo}</p>
      </span>
      <p id="course-name">${value.courseName || "No name"}</p>
    </div>
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

  if (userRole === "superadmin") {
    threeDots.style.display = "block";

    threeDots.addEventListener("click", (e) => {
      popupMenu.style.display =
        popupMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!threeDots.contains(e.target) && !popupMenu.contains(e.target)) {
        popupMenu.style.display = "none";
      }
    });
    document.getElementById("month-year").addEventListener("click", () => {
      popupMenu.style.display = "none";
    });
    document.getElementById("add_button").addEventListener("click", () => {
      popupMenu.style.display = "none";
    });
    document.getElementById("iconButton").addEventListener("click", () => {
      popupMenu.style.display = "none";
    });
    document.getElementById("exportbutton").addEventListener("click", () => {
      popupMenu.style.display = "none";
    });

    deleteBtn.addEventListener("click", () => {
      const confirmDelete = confirm(
        "Are you sure you want to delete this course?"
      );
      if (confirmDelete) {
        const courseRef = ref(db, `courses/${courseKey}`);
        remove(courseRef)
          .then(() => {
            card.remove();
            console.log(
              "Course deleted successfully from the database and UI."
            );
          })
          .catch((error) => console.error("Error deleting course:", error));
      }
    });

    editBtn.addEventListener("click", () => {
      window.location.href = `indexupdate.html?courseKey=${courseKey}`;
    });
  } else {
    threeDots.style.display = "none";
  }
}

function searchCourses() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();

  if (searchTerm === "") {
    filterCoursesByMonth();
    return;
  }

  cardsDiv.innerHTML = "";

  // Remove the current month filter
  const filteredCourses = allCourses.filter((course) => {
    const value = course.val();
    const courseName = value.courseName.toLowerCase();
    const matchesSearch = courseName.includes(searchTerm);

    return matchesSearch;
  });

  // Assign sequential card numbers for search results
  filteredCourses.forEach((course, index) => {
    const cardNumber = index + 1;
    AddCourseToCard(course, cardNumber);
  });
  checkForNoCourses();
}

const exportButton = document.getElementById("exportbutton");
const addButton = document.getElementById("add_button");
const iconButton = document.getElementById("iconButton");
const popupMenuFilter = document.getElementById("popupMenuFilter");

function togglePopup() {
  popupMenuFilter.style.display =
    popupMenuFilter.style.display === "block" ? "none" : "block";
}

iconButton.addEventListener("click", (e) => {
  e.stopPropagation();
  togglePopup();
  popupMenuAdd.style.display = "none";
  popupMenuExport.style.display = "none";
});

document.addEventListener("click", (e) => {
  if (
    popupMenuFilter.style.display === "block" &&
    !popupMenuFilter.contains(e.target) &&
    e.target !== iconButton
  ) {
    popupMenuFilter.style.display = "none";
  }
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
  checkForNoCourses();
}
const popupMenuExport = document.getElementById("popupMenuExport");

function toggleExportPopup() {
  popupMenuExport.style.display =
    popupMenuExport.style.display === "block" ? "none" : "block";
}
exportButton.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleExportPopup();
  popupMenuAdd.style.display = "none";
  popupMenuFilter.style.display = "none";
});
document.getElementById("mail").addEventListener("click", () => {
  window.location.href = "templatemail.html";
  popupMenuExport.style.display = "none";
});
document.getElementById("png").addEventListener("click", () => {
  const url = `templatePage.html?month=${month}&year=${year}`;
  window.open(url, "_blank");
  popupMenuExport.style.display = "none";
});
document.addEventListener("click", (e) => {
  if (!exportButton.contains(e.target) && !popupMenuExport.contains(e.target)) {
    popupMenuExport.style.display = "none";
  }
});

const popupMenuAdd = document.getElementById("popupMenuAdd");

function toggleAddPopup() {
  popupMenuAdd.style.display =
    popupMenuAdd.style.display === "block" ? "none" : "block";
}

addButton.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleAddPopup();
  popupMenuFilter.style.display = "none";
  popupMenuExport.style.display = "none";
});

document.getElementById("add-one-course").addEventListener("click", () => {
  window.location.href = "indexcreate.html";
});

document
  .getElementById("add-multiple-courses")
  .addEventListener("click", () => {
    window.location.href = "manageCourses.html";
  });

document.addEventListener("click", (e) => {
  if (!addButton.contains(e.target) && !popupMenuAdd.contains(e.target)) {
    popupMenuAdd.style.display = "none";
  }
});

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

      window.location.href = "../index.html";
    })
    .catch((error) => {
      console.error("Sign out error:", error);
    });
});

function handleRoleBasedFunctionality(role) {
  if (role === "superadmin") {
    console.log("superadmin");
  } else if (role === "admin") {
    enableAdminFeatures();
  } else {
    showUserFeatures();
  }
}

function enableAdminFeatures() {
  console.log("Admin features enabled.");
}

function showUserFeatures() {
  console.log("User features enabled.");
}

// Toggle the month dropdown
document.getElementById("month-year").addEventListener("click", (e) => {
  e.stopPropagation();
  const monthDropdown = document.getElementById("month-dropdown");
  const popupMenuFilter = document.getElementById("popupMenuFilter");
  const popupMenuAdd = document.getElementById("popupMenuAdd");
  const popupMenuExport = document.getElementById("popupMenuExport");

  monthDropdown.style.display =
    monthDropdown.style.display === "block" ? "none" : "block";
  popupMenuFilter.style.display = "none";
  popupMenuAdd.style.display = "none";
  popupMenuExport.style.display = "none";
});

// Handle month selection in the dropdown
document.getElementById("month-dropdown").addEventListener("click", (e) => {
  e.stopPropagation();
  if (e.target.tagName === "P") {
    currentMonth = parseInt(e.target.getAttribute("data-month"));
    updateMonthYearDisplay();
    document.getElementById("month-dropdown").style.display = "none";

    assignCardNumbersForCurrentMonth();
    filterCoursesByMonth();
    updateMonthYearDisplay();
  }
});

document.addEventListener("click", () => {
  const monthDropdown = document.getElementById("month-dropdown");
  const popupMenuFilter = document.getElementById("popupMenuFilter");
  const popupMenuAdd = document.getElementById("popupMenuAdd");
  const popupMenuExport = document.getElementById("popupMenuExport");

  monthDropdown.style.display = "none";
  popupMenuFilter.style.display = "none";
  popupMenuAdd.style.display = "none";
  popupMenuExport.style.display = "none";
});

document.getElementById("add_button").addEventListener("click", () => {
  const monthDropdown = document.getElementById("month-dropdown");
  monthDropdown.style.display = "none";
});

document.getElementById("iconButton").addEventListener("click", () => {
  const monthDropdown = document.getElementById("month-dropdown");
  monthDropdown.style.display = "none";
});

document.getElementById("exportbutton").addEventListener("click", () => {
  const monthDropdown = document.getElementById("month-dropdown");
  monthDropdown.style.display = "none";
});
