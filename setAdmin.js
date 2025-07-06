// setAdmin.js
// This script gives a user the 'admin' custom claim.

// 1. CONFIGURE FIREBASE ADMIN
const admin = require('firebase-admin');
// You MUST download your service account key for this to work.
// Go to Project Settings -> Service accounts -> Generate new private key
// Save the downloaded JSON file as 'serviceAccountKey.json' in your project's root.
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


// 2. PASTE THE USER'S UID HERE
// Get this from the Firebase Emulator UI -> Authentication tab
const uid = 'some-hardcoded-uid-here'; 


// 3. SET THE CUSTOM CLAIM
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`Success! User ${uid} has been made an admin.`);
    console.log('You may need to log out and log back in for the changes to take effect.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting custom claims:', error);
    process.exit(1);
  });
