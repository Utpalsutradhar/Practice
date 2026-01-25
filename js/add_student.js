// student.js
import {
  ref,
  get,
  set,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { db } from "./firebase.js";

/* =========================
   ADD STUDENT
   ========================= */
window.addStudent = async function () {
  const classKey = document.getElementById("classSelect").value;
  const name = document.getElementById("studentName").value.trim();
  const msg = document.getElementById("msg");

  msg.textContent = "";

  if (!classKey || !name) {
    msg.textContent = "Select class and enter name";
    msg.style.color = "red";
    return;
  }

  const classRef = ref(db, `students/${classKey}`);
  const snap = await get(classRef);

  let nextRoll = 1;
  if (snap.exists()) {
    const rolls = Object.values(snap.val()).map(s => s.roll);
    nextRoll = Math.max(...rolls) + 1;
  }

  await set(ref(db, `students/${classKey}/roll_${nextRoll}`), {
    name,
    roll: nextRoll,
    class: classKey
  });

  msg.textContent = `Student added (Roll ${nextRoll})`;
  msg.style.color = "green";
  document.getElementById("studentName").value = "";
};
