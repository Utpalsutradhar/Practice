import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { db } from "./firebase.js";

/* =============================
   CHANGE THESE VALUES
   ============================= */
const CLASS_NAME = "class_5";
const ROLL_NO = "roll_12";

/* =============================
   MAIN LOADER
   ============================= */
async function loadReportCard() {
    const tbody = document.getElementById("marks-body");
    tbody.innerHTML = "";

    try {
        const subjectsRef = ref(db, `subjects/${CLASS_NAME}`);
        const marksRef = ref(db, `marks/${CLASS_NAME}/${ROLL_NO}`);

        const [subjectsSnap, marksSnap] = await Promise.all([
            get(subjectsRef),
            get(marksRef)
        ]);

        if (!subjectsSnap.exists()) {
            console.error("No subjects found");
            return;
        }

        const subjects = subjectsSnap.val();
        const marks = marksSnap.exists() ? marksSnap.val() : {};

        Object.values(subjects).forEach(sub => {
            const subject = sub.name;
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

    } catch (err) {
        console.error("Report card load failed:", err);
    }
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

window.addEventListener("DOMContentLoaded", loadReportCard);
