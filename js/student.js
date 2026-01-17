import { db } from "./firebase.js";
import {
  ref,
  push,
  get,
  child,
  remove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ADD STUDENT (UNCHANGED)
window.addStudent = function () {
  const cls = document.getElementById("classSelect").value;
  const name = document.getElementById("studentName").value.trim();
  const msg = document.getElementById("msg");

  if (!cls || !name) {
    msg.textContent = "Class and name required";
    msg.style.color = "red";
    return;
  }

  push(ref(db, "students/" + cls), {
    name: name
  });

  msg.textContent = "Student added successfully";
  msg.style.color = "green";
  document.getElementById("studentName").value = "";
};

// VIEW STUDENTS + DELETE BUTTON
window.loadStudents = function () {
  const cls = document.getElementById("viewClass").value;
  const list = document.getElementById("studentList");
  list.innerHTML = "";

  if (!cls) return;

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

        const span = document.createElement("span");
        span.textContent = studentName;

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.style.background = "red";
        delBtn.style.color = "white";
        delBtn.style.border = "none";
        delBtn.style.cursor = "pointer";

        delBtn.onclick = () => deleteStudent(cls, studentKey);

        li.appendChild(span);
        li.appendChild(delBtn);
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error(err);
      list.innerHTML = "<li>Error loading students</li>";
    });
};

// DELETE STUDENT
window.deleteStudent = function (cls, key) {
  const confirmDelete = confirm("Are you sure you want to delete this student?");
  if (!confirmDelete) return;

  remove(ref(db, "students/" + cls + "/" + key))
    .then(() => {
      loadStudents(); // refresh list
    })
    .catch(err => {
      console.error("Delete failed", err);
    });
};
