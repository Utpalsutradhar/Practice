import { db } from "./firebase.js";
import {
  ref,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const classSelect = document.getElementById("classSelect");
const studentTable = document.getElementById("studentTable");

// Load students when class changes
classSelect.addEventListener("change", loadStudents);

async function loadStudents() {
  const cls = classSelect.value;
  studentTable.innerHTML = "";

  if (!cls) return;

  try {
    const snapshot = await get(child(ref(db), "students/" + cls));

    if (!snapshot.exists()) {
      studentTable.innerHTML =
        "<tr><td colspan='2'>No students found</td></tr>";
      return;
    }

    // Convert snapshot → array
    const students = [];
    snapshot.forEach(childSnap => {
      students.push({
        id: childSnap.key,
        ...childSnap.val()
      });
    });

    // Sort by roll number
    students.sort((a, b) => a.roll - b.roll);

    // Render table
    students.forEach(stu => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${stu.roll}</td>
        <td>${stu.name}</td>
      `;
      studentTable.appendChild(row);
    });

  } catch (error) {
    console.error("Error loading students:", error);
    studentTable.innerHTML =
      "<tr><td colspan='2'>Error loading students</td></tr>";
  }
}
