import { db } from "../firebaseConfig.mjs";
import {
    ref,
    set,
    push
  } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

document.getElementById('create-page').addEventListener('submit', sumbitCourse);

function sumbitCourse(e) {
    e.preventDefault();

    const courseName = getElementVal('course-name');
    const startDate = getElementVal('start-date');
    const endDate = getElementVal('end-date');
    const startTime = getElementVal('start-time');
    const endTime = getElementVal('end-time');
    const keyPoints = getElementVal('key-points');
    const trainerName = getElementVal('trainer');
    const targetAudience = getElementVal('audience');
    const maxParticipation = getElementVal('max-participants');

    const mode = document.getElementsByName('mode');
    let selectedValue = '';
    for (const radio of mode) {
        
        if (radio.checked) {
            selectedValue = radio.value;
            break;
        }
    }
    saveInDB(courseName, startDate, endDate, startTime, endTime, keyPoints, trainerName, targetAudience, maxParticipation, selectedValue);
}

const saveInDB = (courseName, startDate, endDate, startTime, endTime, keyPoints, trainerName, targetAudience, maxParticipation, mode) => {
    
    const coursesRef = ref(db, 'courses');
    const newCourseRef = push(coursesRef);
    set(newCourseRef, {
        courseName: courseName,
        startDate: startDate,
        endDate: endDate,
        startTime: startTime,
        endTime: endTime,
        keyPoints: keyPoints,
        trainerName: trainerName,
        targetAudience: targetAudience,
        maxParticipation: maxParticipation,
        mode: mode
    })
    .then(() => {
        // Success! Show popup and redirect to home page
        showPopup('Course added successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'viewAllCourse.html';  // Redirect to home page
        }, 2000);  // 2-second delay before redirecting
    })
    .catch((error) => {
        // Error occurred, show an error popup
        showPopup('Failed to add the course. Please try again.', 'error');
        console.error("Error adding course: ", error);
    });
};
const getElementVal = (id) => {
    return document.getElementById(id).value;
}
// Function to show a popup message
const showPopup = (message, type) => {
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.padding = '20px';
    popup.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    popup.style.color = 'white';
    popup.style.fontSize = '18px';
    popup.style.borderRadius = '10px';
    popup.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
    popup.innerHTML = message;

    // Append the popup to the body
    document.body.appendChild(popup);

    // Automatically remove the popup after 3 seconds
    setTimeout(() => {
        document.body.removeChild(popup);
    }, 2000);
}