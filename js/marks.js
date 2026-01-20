import { db } from "./firebase.js";
import {
  ref,
  get,
  child,
  update
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const classSelect = document.getElementById("classSelect");
const examSelect = document.getElementById("examSelect");
const subjectSelect = document.getElementById("subjectSelect");
const marksTable = document.getElementById("marksTable");
const saveBtn = document.getElementById("saveBtn");
const msg = document.getElementById("msg");

let currentStudents = {}; // studentId → name
let maxMarks = 0;

/* =========================
   EXAM CHANGE → SET MAX
========================= */
examSelect.addEventListener("change", () => {
  const opt = examSelect.options[examSelect.selectedIndex];
  maxMarks = Number(opt.dataset.max || 0);
});

/* =========================
   LOAD STUDENTS
========================= */
classSelect.addEventListener("change", loadStudents);

async function loadStudents() {
  const cls = classSelect.value;
  marksTable.innerHTML = "";
  currentStudents = {};

  if (!cls) return;

  const snapshot = await get(child(ref(db), "students/" + cls));
  if (!snapshot.exists()) {
    marksTable.innerHTML = "<tr><td colspan='3'>No students</td></tr>";
    return;
  }

  let i = 1;
  snapshot.forEach(childSnap => {
    const studentId = childSnap.key;
    const studentName = childSnap.val().name;

    currentStudents[studentId] = studentName;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${i++}</td>
      <td>${studentName}</td>
      <td>
        <input type="number"
               min="0"
               max="${maxMarks}"
               data-id="${studentId}">
      </td>
    `;
    marksTable.appendChild(row);
  });
}

/* =========================
   SAVE MARKS
========================= */
saveBtn.addEventListener("click", saveMarks);

async function saveMarks() {
  const cls = classSelect.value;
  const exam = examSelect.value;
  const subject = subjectSelect.value;

  if (!cls || !exam || !subject) {
    msg.textContent = "Select class, exam and subject";
    msg.style.color = "red";
    return;
  }

  if (maxMarks === 0) {
    msg.textContent = "Invalid exam selection";
    msg.style.color = "red";
    return;
  }

  const inputs = marksTable.querySelectorAll("input");
  const updates = {};

  inputs.forEach(input => {
    const marks = Number(input.value);
    const studentId = input.dataset.id;

    if (isNaN(marks)) return;

    if (marks < 0 || marks > maxMarks) {
      msg.textContent = `Marks must be 0–${maxMarks}`;
      msg.style.color = "red";
      return;
    }

    updates[
      `marks/${cls}/${studentId}/${subject}/${exam}`
    ] = marks;
  });

  await update(ref(db), updates);

  msg.textContent = "Marks saved successfully";
  msg.style.color = "green";
}
