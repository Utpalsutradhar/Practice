import { db } from "./firebase.js";
import {
  ref,
  push,
  get,
  child,
  remove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* =========================
   ADD STUDENT
========================= */
window.addStudent = function () {
  const cls = document.getElementById("classSelect");
  const nameInput = document.getElementById("studentName");
  const msg = document.getElementById("msg");

  if (!cls || !nameInput) return;

  const classValue = cls.value;
  const studentName = nameInput.value.trim();

  if (classValue === "" || studentName === "") {
    msg.textContent = "Class and name required";
    msg.style.color = "red";
    return;
  }

  push(ref(db, "students/" + classValue), {
    name: studentName
  })
    .then(() => {
      msg.textContent = "Student added successfully";
      msg.style.color = "green";
      nameInput.value = "";
    })
    .catch(err => {
      console.error("Add failed", err);
      msg.textContent = "Error adding student";
      msg.style.color = "red";
    });
};

/* =========================
   VIEW STUDENTS + DELETE
========================= */
window.loadStudents = function () {
  const clsSelect = document.getElementById("viewClass");
  const list = document.getElementById("studentList");

  if (!clsSelect || !list) return;

  const cls = clsSelect.value;
  list.innerHTML = "";

  if (cls === "") return;

  get(child(ref(db), "students/" + cls))
    .then(snapshot => {
      if (!snapshot.exists()) {
        list.innerHTML = "<li>No students found</li>";
        return;
      }

      snapshot.forEach(childSnap => {
        const studentKey = childSnap.key;
        const studentName = childSnap.val().name;

        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.width = "100%";
        li.style.padding = "6px 0";

        const span = document.createElement("span");
        span.textContent = studentName;

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.style.padding = "4px 10px";
        delBtn.style.marginLeft = "10px";
        delBtn.style.backgroundColor = "#dc3545";
        delBtn.style.color = "#fff";
        delBtn.style.border = "none";
        delBtn.style.borderRadius = "4px";
        delBtn.style.cursor = "pointer";

        delBtn.onclick = () => deleteStudent(cls, studentKey);

        li.appendChild(span);
        li.appendChild(delBtn);
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Load failed", err);
      list.innerHTML = "<li>Error loading students</li>";
    });
};

/* =========================
   DELETE STUDENT
========================= */
window.deleteStudent = function (cls, key) {
  const confirmDelete = confirm("Are you sure you want to delete this student?");
  if (!confirmDelete) return;

  remove(ref(db, "students/" + cls + "/" + key))
    .then(() => {
      loadStudents(); // refresh list
    })
    .catch(err => {
      console.error("Delete failed", err);
      alert("Error deleting student");
    });
};
