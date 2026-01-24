// reportcard.js
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { db } from "./firebase.js";

const classSelect = document.getElementById("classSelect");
const rollSelect  = document.getElementById("rollSelect");
const tbody = document.getElementById("marks-body");

/* =============================
   LOAD CLASSES FROM DATABASE
   ============================= */
async function loadClasses() {
    classSelect.innerHTML = `<option value="">Select Class</option>`;
    rollSelect.innerHTML  = `<option value="">Select Roll</option>`;
    tbody.innerHTML = "";

    try {
        const subjectsRef = ref(db, "subjects");
        const snap = await get(subjectsRef);

        if (!snap.exists()) return;

        Object.keys(snap.val()).forEach(classKey => {
            const opt = document.createElement("option");
            opt.value = classKey;
            opt.textContent = classKey.replace("class_", "Class ");
            classSelect.appendChild(opt);
        });
    } catch (err) {
        console.error("Failed to load classes:", err);
    }
}

/* =============================
   INIT
   ============================= */
window.addEventListener("DOMContentLoaded", loadClasses);


/* =============================
   LOAD ROLL NUMBERS
   ============================= */
async function loadRollNumbers(className) {
    rollSelect.innerHTML = `<option value="">Select Roll</option>`;
    tbody.innerHTML = "";

    if (!className) return;

    const marksRef = ref(db, `marks/${className}`);
    const snap = await get(marksRef);

    if (!snap.exists()) return;

    Object.keys(snap.val())
        .filter(key => key.startsWith("roll_"))   // 🔑 CRITICAL FILTER
        .sort((a, b) => {
            const n1 = parseInt(a.replace("roll_", ""));
            const n2 = parseInt(b.replace("roll_", ""));
            return n1 - n2;
        })
        .forEach(roll => {
            const opt = document.createElement("option");
            opt.value = roll;
            opt.textContent = roll.replace("roll_", "Roll ");
            rollSelect.appendChild(opt);
        });
}


/* =============================
   LOAD REPORT CARD
   ============================= */
async function loadReportCard(className, rollNo) {
    tbody.innerHTML = "";
    if (!className || !rollNo) return;

    const subjectsRef = ref(db, `subjects/${className}`);
    const marksRef = ref(db, `marks/${className}/${rollNo}`);

    const [subjectsSnap, marksSnap] = await Promise.all([
        get(subjectsRef),
        get(marksRef)
    ]);

    if (!subjectsSnap.exists()) return;

    const subjects = subjectsSnap.val();
    const marks = marksSnap.exists() ? marksSnap.val() : {};
    Object.entries(subjects).forEach(([key, value]) => {

    // Determine subject name safely
    const subject =
        typeof value === "string" ? value :
        typeof value === "object" && value.name ? value.name :
        key;

    const m = marks[subject] || {};

        const s1 = m.sem1 || {};
        const s2 = m.sem2 || {};

        const i1 = s1.internal1 ?? "";
        const mt = s1.midterm ?? "";
        const i2 = s2.internal2 ?? "";
        const fe = s2.final ?? "";

        const sem1Total = (Number(i1) || 0) + (Number(mt) || 0) || "";
        const sem2Total = (Number(i2) || 0) + (Number(fe) || 0) || "";

        const w40 = sem1Total !== "" ? Math.round(sem1Total * 0.4) : "";
        const w60 = sem2Total !== "" ? Math.round(sem2Total * 0.6) : "";
        const grand = w40 !== "" && w60 !== "" ? w40 + w60 : "";

        const grade = getGrade(grand);

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
                <td>${grade}</td>
            </tr>
        `);
    });
}

/* =============================
   GRADE LOGIC
   ============================= */
function getGrade(total) {
    if (total === "") return "";
    if (total >= 90) return "A";
    if (total >= 75) return "B";
    if (total >= 60) return "C";
    if (total >= 45) return "D";
    return "E";
}

/* =============================
   EVENTS
   ============================= */
classSelect.addEventListener("change", () => {
    loadRollNumbers(classSelect.value);
});

rollSelect.addEventListener("change", () => {
    loadReportCard(classSelect.value, rollSelect.value);
});

/* =============================
   INIT
   ============================= */
loadClasses();
