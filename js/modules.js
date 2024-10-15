process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


const { ref, get, child,push,set } = require('firebase/database');
const { database } = require('../firebaseConfig');

// Function to GET data from Firebase Realtime Database
async function getData() {
  try {
    const dbRef = ref(database); // Reference to the database root
    const snapshot = await get(child(dbRef, 'courses/-O9GFtvwsOHT6QQpvajH')); 
    if (snapshot.exists()) {
      console.log('Data Retrieved:', snapshot.val());
    } else {
      console.log('No data available');
    }
  } catch (error) {
    console.error('Error getting data:', error);
  }
}

// getData();

async function postData() {
    try {
      const coursesRef = ref(database, 'courses'); // Reference to the 'courses' node
      const newCourseRef = push(coursesRef); // Create a new child with a unique key
      await set(newCourseRef, {
        courseName: "Node.js Firebase SDK Course 2",
        startDate: "2024-10-20",
        trainerName: "Jane Doe",
        mode: "online"
      });
      console.log('Data added successfully.');
    } catch (error) {
      console.error('Error posting data:', error);
    }
  }
  
  postData();
