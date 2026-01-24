// reportcard.js
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { db } from "./firebase.js";

const classSelect   = document.getElementById("classSelect");
const studentSelect = document.getElementById("studentSelect");
const tbody         = document.getElementById("marks-body");

/* =====================================================
   1️⃣ LOAD CLASSES (from students node – source of truth)
   ===================================================== */
async function loadClasses() {
    classSelect.innerHTML = `<option value="">Select Class</option>`;
    studentSelect.innerHTML = `<option value="">Select Student</option>`;
    studentSelect.disabled = true;
    tbody.innerHTML = "";

    const snap = await get(ref(db, "students"));
    if (!snap.exists()) return;

    Object.keys(snap.val()).forEach(classKey => {
        const opt = document.createElement("option");
        opt.value = classKey;
        opt.textContent = classKey.replace("class_", "Class ");
        classSelect.appendChild(opt);
    });
}

/* =====================================================
   2️⃣ LOAD STUDENTS (from students/class_x)
   ===================================================== */
async function loadStudents(className) {
    studentSelect.innerHTML = `<option value="">Select Student</option>`;
    studentSelect.disabled = true;
    tbody.innerHTML = "";

    if (!className) return;

    const snap = await get(ref(db, `students/${className}`));
    if (!snap.exists()) return;

    Object.entries(snap.val())
        .sort((a, b) => a[1].roll - b[1].roll)
        .forEach(([rollKey, student]) => {
            const opt = document.createElement("option");
            opt.value = rollKey;
            opt.textContent = `Roll ${student.roll} – ${student.name}`;
            studentSelect.appendChild(opt);
        });

    studentSelect.disabled = false;
}

/* =====================================================
   3️⃣ LOAD REPORT CARD (subjects + marks)
   ===================================================== */
async function loadReportCard(className, rollKey) {
    tbody.innerHTML = "";
    if (!className || !rollKey) return;

    const [subjectsSnap, marksSnap] = await Promise.all([
        get(ref(db, `subjects/${className}`)),
        get(ref(db, `marks/${className}/${rollKey}`))
    ]);

    if (!subjectsSnap.exists()) return;

    const subjects = subjectsSnap.val();
    const marks    = marksSnap.exists() ? marksSnap.val() : {};

    Object.entries(subjects).forEach(([key, value]) => {
        const subject =
            typeof value === "string" ? value :
            typeof value === "object" && value.name ? value.name :
            key;

        const m  = marks[subject] || {};
        const s1 = m.sem1 || {};
        const s2 = m.sem2 || {};

        const i1 = s1.internal1 ?? "";
        const mt = s1.midterm   ?? "";
        const i2 = s2.internal2 ?? "";
        const fe = s2.final     ?? "";

        const sem1Total = (Number(i1) || 0) + (Number(mt) || 0) || "";
        const sem2Total = (Number(i2) || 0) + (Number(fe) || 0) || "";

        const w40 = sem1Total !== "" ? Math.round(sem1Total * 0.4) : "";
        const w60 = sem2Total !== "" ? Math.round(sem2Total * 0.6) : "";
        const grand = w40 !== "" && w60 !== "" ? w40 + w60 : "";

        tbody.insertAdjacentHTML("beforeend", `
            <tr>
                <td class="left">${subject}</td>

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

/* =====================================================
   GRADE LOGIC
   ===================================================== */
function grade(total) {
    if (total === "") return "";
    if (total >= 90) return "A";
    if (total >= 75) return "B";
    if (total >= 60) return "C";
    if (total >= 45) return "D";
    return "E";
}

/* =====================================================
   EVENTS
   ===================================================== */
classSelect.addEventListener("change", () => {
    loadStudents(classSelect.value);
});

studentSelect.addEventListener("change", () => {
    loadReportCard(classSelect.value, studentSelect.value);
});

/* =====================================================
   INIT
   ===================================================== */
window.addEventListener("DOMContentLoaded", loadClasses);
