import { db } from "./firebase.js";
import {
  ref,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const classSelect = document.getElementById("viewClass");
const studentList = document.getElementById("studentList");

// Auto-load students when class changes
classSelect.addEventListener("change", loadStudents);

async function loadStudents() {
  const cls = classSelect.value;
  studentList.innerHTML = "";

  if (!cls) return;

  try {
    const snapshot = await get(child(ref(db), "students/" + cls));

    if (!snapshot.exists()) {
      studentList.innerHTML = "<li>No students found</li>";
      return;
    }

    const students = [];

    snapshot.forEach(childSnap => {
      students.push({
        id: childSnap.key,
        ...childSnap.val()
      });
    });

    // Sort by roll number
    students.sort((a, b) => a.roll - b.roll);

    // Render students
    students.forEach(stu => {
      const li = document.createElement("li");
      li.textContent = `Roll ${stu.roll} - ${stu.name}`;
      studentList.appendChild(li);
    });

  } catch (error) {
    console.error("Error loading students:", error);
    studentList.innerHTML = "<li>Error loading students</li>";
  }
}
