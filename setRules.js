process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const admin = require("firebase-admin");
const serviceAccount = require("../Training-Calendar/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://training-calendar-ilp05-default-rtdb.asia-southeast1.firebasedatabase.app",
});

async function setRole(uid, role) {
  await admin.auth().setCustomUserClaims(uid, { role });
  console.log(`Role ${role} has been assigned to user ${uid}`);
}

// Run this function to assign roles
setRole("U3fVdYNUClR8UyXfm83QC5LtPpa2", "superadmin");
setRole("8qrsudZ61SV47aJKKjzHdECjRgE3", "admin");
