
import { db } from "./firebase.js";
import {
  ref,
  get,
  set
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* =======================
   DOM ELEMENTS
======================= */
const classSelect = document.getElementById("classSelect");
const examSelect = document.getElementById("examSelect");
const subjectSelect = document.getElementById("subjectSelect");
const marksTable = document.getElementById("marksTable");
const saveBtn = document.getElementById("saveBtn");
const msg = document.getElementById("msg");

/* =======================
   STATE
======================= */
let students = [];

/* =======================
   EVENT LISTENERS
======================= */
classSelect.addEventListener("change", onClassChange);
examSelect.addEventListener("change", tryLoadMarks);
subjectSelect.addEventListener("change", tryLoadMarks);
saveBtn.addEventListener("click", saveMarks);

/* =======================
   1️⃣ CLASS CHANGE
   → load students + subjects
======================= */
async function onClassChange() {
  const cls = classSelect.value;
  resetUI();

  if (!cls) return;

  await loadStudents(cls);
  await loadSubjects(cls);
  renderTable();
}

/* =======================
   LOAD STUDENTS
======================= */
async function loadStudents(cls) {
  students = [];

  const snap = await get(ref(db, `students/${cls}`));
  if (!snap.exists()) return;

  snap.forEach(s => {
    students.push({
      roll: s.key,
      name: s.val().name
    });
  });

  students.sort((a, b) => a.roll - b.roll);
}

/* =======================
   LOAD SUBJECTS
======================= */
async function loadSubjects(cls) {
  subjectSelect.innerHTML = `<option value="">Select Subject</option>`;

  const snap = await get(ref(db, `subjects/${cls}`));
  if (!snap.exists()) return;

  snap.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.key;
    opt.textContent = s.val();
    subjectSelect.appendChild(opt);
  });
}

/* =======================
   RENDER STUDENT TABLE
======================= */
function renderTable(existingMarks = {}) {
  marksTable.innerHTML = "";

  students.forEach((stu, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${stu.name}</td>
      <td>
        <input type="number"
               data-roll="${stu.roll}"
               value="${existingMarks[stu.roll] ?? ""}">
      </td>
    `;
    marksTable.appendChild(tr);
  });
}

/* =======================
   2️⃣ LOAD MARKS (IF EXIST)
======================= */
async function tryLoadMarks() {
  const cls = classSelect.value;
  const exam = examSelect.value;
  const subject = subjectSelect.value;

  if (!cls || !exam || !subject || students.length === 0) return;

  const path = `marks/${cls}/${exam}/${subject}`;
  const snap = await get(ref(db, path));

  const marks = snap.exists() ? snap.val() : {};
  renderTable(marks);
}

/* =======================
   3️⃣ SAVE MARKS (DYNAMIC)
======================= */
async function saveMarks() {
  const cls = classSelect.value;
  const exam = examSelect.value;
  const subject = subjectSelect.value;

  msg.textContent = "";

  if (!cls || !exam || !subject) {
    msg.textContent = "❌ Select class, exam and subject";
    return;
  }

  const inputs = marksTable.querySelectorAll("input");
  const marksData = {};

  inputs.forEach(input => {
    if (input.value !== "") {
      marksData[input.dataset.roll] = Number(input.value);
    }
  });

  if (Object.keys(marksData).length === 0) {
    msg.textContent = "❌ No marks entered";
    return;
  }

  const path = `marks/${cls}/${exam}/${subject}`;
  const existing = await get(ref(db, path));

  if (existing.exists()) {
    const confirmOverwrite = confirm(
      "Marks already exist for this exam & subject.\nOverwrite?"
    );
    if (!confirmOverwrite) return;
  }

  await set(ref(db, path), marksData);
  msg.textContent = "✅ Marks saved successfully";
}

/* =======================
   RESET UI
======================= */
function resetUI() {
  students = [];
  marksTable.innerHTML = "";
  subjectSelect.innerHTML = `<option value="">Select Subject</option>`;
  msg.textContent = "";
}
