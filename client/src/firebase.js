// S3CURE_New/client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your copied firebaseConfig object
const firebaseConfig = {
  apiKey: "AIzaSyBtw2vmMSrQ0OzYqjGQDIoB_5yBPaDBrdo",
  authDomain: "s3cure-9f3a2.firebaseapp.com",
  projectId: "s3cure-9f3a2",
  storageBucket: "s3cure-9f3a2.firebasestorage.app",
  messagingSenderId: "74081647886",
  appId: "1:74081647886:web:e3e1fbf3d229e87d79eb5f",
  measurementId: "G-F8FQ7TPYEG"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services you'll use
export const auth = getAuth(app);
export const db = getFirestore(app);