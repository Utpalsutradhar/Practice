 /* import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBgFORFeBsvyT06vJx1sUXyrgJcDdBuXKs",
  authDomain: "school-admin-panel-6d165.firebaseapp.com",
  projectId: "school-admin-panel-6d165",
  storageBucket: "school-admin-panel-6d165.firebasestorage.app",
  messagingSenderId: "300332144263",
  appId: "1:300332144263:web:bf408b4461d76a43400a22"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
*/

import { db } from "./firebase.js";
console.log("Firebase connected", db);




