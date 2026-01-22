import { db } from "./firebase.js";
import {
  ref,
  get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const classSelect = document.getElementById("viewClass");
const studentList = document.getElementById("studentList");

// Auto-load students when class changes
classSelect.addEventListener("change", loadStudents);

async function loadStudents() {
  const cls = classSelect.value;
  studentList.innerHTML = "";

  if (!cls) {
    studentList.innerHTML = "<li>Select a class to view students</li>";
    return;
  }

  try {
    const snapshot = await get(ref(db, `students/${cls}`));

    if (!snapshot.exists()) {
      studentList.innerHTML = "<li>No students found</li>";
      return;
    }

    const students = [];

    snapshot.forEach(snap => {
      students.push({
        roll: snap.key,
        name: snap.val().name
      });
    });

    // Sort by roll number (numeric safety)
    students.sort((a, b) => Number(a.roll) - Number(b.roll));

    // Render students
    students.forEach(stu => {
      const li = document.createElement("li");
      li.textContent = `Roll ${stu.roll} – ${stu.name}`;
      studentList.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    studentList.innerHTML = "<li>Error loading students</li>";
  }
}
