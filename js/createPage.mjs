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
    });
}
const getElementVal = (id) => {
    return document.getElementById(id).value;
}
