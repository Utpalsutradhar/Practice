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

const addSubjectBtn = document.getElementById("addSubjectBtn");
const newSubjectNameInput = document.getElementById("newSubjectName");

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
addSubjectBtn.addEventListener("click", addSubject);

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

  students.sort((a, b) => Number(a.roll) - Number(b.roll));
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
   ADD SUBJECT DYNAMICALLY
======================= */
async function addSubject() {
  const cls = classSelect.value;
  const subjectName = newSubjectNameInput.value.trim();

  if (!cls) {
    alert("Select class first");
    return;
  }

  if (!subjectName) {
    alert("Enter subject name");
    return;
  }

  // Safe Firebase key
  const subjectKey = subjectName
    .toLowerCase()
    .replace(/\s+/g, "");

  const subjectPath = `subjects/${cls}/${subjectKey}`;

  const exists = await get(ref(db, subjectPath));
  if (exists.exists()) {
    alert("Subject already exists");
    return;
  }

  await set(ref(db, subjectPath), subjectName);

  newSubjectNameInput.value = "";
  await loadSubjects(cls);

  msg.textContent = `✅ Subject "${subjectName}" added`;
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
   LOAD MARKS (IF EXIST)
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
   SAVE MARKS (DYNAMIC)
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
    if (!confirm("Marks already exist. Overwrite?")) return;
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
