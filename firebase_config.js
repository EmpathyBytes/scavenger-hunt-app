// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAHoxFtaZx4ONMVnOgCaxONwQj2EtRLQkE",
  authDomain: "scavengerhunt-f9285.firebaseapp.com",
  databaseURL: "https://scavengerhunt-f9285-default-rtdb.firebaseio.com",
  projectId: "scavengerhunt-f9285",
  storageBucket: "scavengerhunt-f9285.firebasestorage.app",
  messagingSenderId: "446853870903",
  appId: "1:446853870903:web:24b4bbc0e6f1d0232816b2",
  measurementId: "G-9VMXHGSSP2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };