import { db } from "./firebase.js";
import {
  ref,
  push,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ADD STUDENT
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

// VIEW STUDENTS
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
        const li = document.createElement("li");
        li.textContent = childSnap.val().name;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error(err);
      list.innerHTML = "<li>Error loading students</li>";
    });
};
