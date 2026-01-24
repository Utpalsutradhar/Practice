// reportcard.js
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { db } from "./firebase.js";

console.log("✅ reportcard.js loaded");

/* ===============================
   DOM ELEMENTS
   =============================== */
const classSelect   = document.getElementById("classSelect");
const studentSelect = document.getElementById("studentSelect");
const tbody         = document.getElementById("marks-body");

const displayName  = document.getElementById("displayName");
const displayRoll  = document.getElementById("displayRoll");
const displayClass = document.getElementById("displayClass");

/* ===============================
   CACHE
   =============================== */
let studentsCache = {};

/* ===============================
   LOAD CLASSES
   =============================== */
async function loadClasses() {
    classSelect.innerHTML   = `<option value="">Select Class</option>`;
    studentSelect.innerHTML = `<option value="">Select Student</option>`;
    studentSelect.disabled  = true;
    tbody.innerHTML         = "";

    resetStudentInfo();

    const snap = await get(ref(db, "students"));
    if (!snap.exists()) return;

    Object.keys(snap.val()).forEach(classKey => {
        const opt = document.createElement("option");
        opt.value = classKey;                 // DB KEY
        opt.textContent = classKey.replace("class", "Class ");
        classSelect.appendChild(opt);
    });
}

/* ===============================
   LOAD STUDENTS
   =============================== */
async function loadStudents(classKey) {
    studentSelect.innerHTML = `<option value="">Select Student</option>`;
    studentSelect.disabled  = true;
    tbody.innerHTML         = "";
    resetStudentInfo();

    if (!classKey) return;

    displayClass.textContent = classKey.replace("class", "Class ");

    const snap = await get(ref(db, `students/${classKey}`));
    if (!snap.exists()) return;

    studentsCache = snap.val();

    Object.entries(studentsCache)
        .sort((a, b) => a[1].roll - b[1].roll)
        .forEach(([rollKey, student]) => {
            const opt = document.createElement("option");
            opt.value = rollKey;            // DB KEY
            opt.textContent = `Roll ${student.roll} - ${student.name}`;
            studentSelect.appendChild(opt);
        });

    studentSelect.disabled = false;
}

/* ===============================
   LOAD REPORT CARD
   =============================== */
async function loadReportCard(classKey, rollKey) {
    tbody.innerHTML = "";
    if (!classKey || !rollKey) return;

    const student = studentsCache[rollKey];
    if (!student) return;

    // ✅ UPDATE STUDENT INFO TABLE
    displayClass.textContent = classKey.replace("class", "Class ");
    displayRoll.textContent  = student.roll;
    displayName.textContent  = student.name.toUpperCase();

    const rollIndex = rollKey.replace("roll_", "");

    const subjectsSnap = await get(ref(db, `subjects/${classKey}`));
    const marksSnap    = await get(ref(db, `marks/${classKey}`));

    if (!subjectsSnap.exists() || !marksSnap.exists()) return;

    const subjects = subjectsSnap.val();
    const marks    = marksSnap.val();

    Object.entries(subjects).forEach(([subjectKey, subjectValue]) => {

        const displaySubject =
            typeof subjectValue === "string"
                ? subjectValue
                : subjectValue?.name ?? subjectKey;

        const i1 = marks.internal1?.[subjectKey]?.[rollIndex] ?? "";
        const mt = marks.midterm?.[subjectKey]?.[rollIndex] ?? "";
        const i2 = marks.internal2?.[subjectKey]?.[rollIndex] ?? "";
        const fe = marks.final?.[subjectKey]?.[rollIndex] ?? "";

        const sem1Total = (Number(i1) || 0) + (Number(mt) || 0) || "";
        const sem2Total = (Number(i2) || 0) + (Number(fe) || 0) || "";

        const w40 = sem1Total !== "" ? Math.round(sem1Total * 0.4) : "";
        const w60 = sem2Total !== "" ? Math.round(sem2Total * 0.6) : "";
        const grand = w40 !== "" && w60 !== "" ? w40 + w60 : "";

        tbody.insertAdjacentHTML("beforeend", `
            <tr>
                <td class="left">${displaySubject}</td>

                <td>20</td><td>${i1}</td>
                <td>80</td><td>${mt}</td>
                <td>${sem1Total}</td>

                <td>20</td><td>${i2}</td>
                <td>80</td><td>${fe}</td>
                <td>${sem2Total}</td>

                <td>${w40}</td>
                <td>${w60}</td>
                <td>${grand}</td>
                <td>${grade(grand)}</td>
            </tr>
        `);
    });
}

/* ===============================
   RESET STUDENT INFO
   =============================== */
function resetStudentInfo() {
    displayClass.textContent = "—";
    displayRoll.textContent  = "—";
    displayName.textContent  = "—";
}

/* ===============================
   GRADE LOGIC
   =============================== */
function grade(total) {
    if (total === "") return "";
    if (total >= 90) return "A";
    if (total >= 75) return "B";
    if (total >= 60) return "C";
    if (total >= 45) return "D";
    return "E";
}

/* ===============================
   EVENTS
   =============================== */
classSelect.addEventListener("change", () => {
    loadStudents(classSelect.value);
});

studentSelect.addEventListener("change", () => {
    loadReportCard(classSelect.value, studentSelect.value);
});

/* ===============================
   PRINT
   =============================== */
window.printReport = function () {
    document.body.classList.add("frozen");
    window.print();
};

/* ===============================
   INIT
   =============================== */
window.addEventListener("DOMContentLoaded", loadClasses);
