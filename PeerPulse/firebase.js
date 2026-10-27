
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPCva9UXPXhLzUYfXZ5XKY78kKAs-ILj0",
  authDomain: "peerpulse-e8fcf.firebaseapp.com",
  projectId: "peerpulse-e8fcf",
  storageBucket: "peerpulse-e8fcf.firebasestorage.app",
  messagingSenderId: "806358058112",
  appId: "1:806358058112:web:75f42bd25fe9310015d265",
  measurementId: "G-QHVWB1030V"
};;

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

console.log("Firebase initialized successfully!");
