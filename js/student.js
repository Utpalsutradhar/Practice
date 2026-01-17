/* 
function addStudent() {
  const cls = document.getElementById("classSelect").value;
  const name = document.getElementById("studentName").value.trim();
  const msg = document.getElementById("msg");

  if (!cls || !name) {
    msg.textContent = "Class and name required!";
    return;
  }

  let data = JSON.parse(localStorage.getItem("students")) || {};

  if (!data[cls]) {
    data[cls] = [];
  }

  data[cls].push(name);
  localStorage.setItem("students", JSON.stringify(data));

  msg.textContent = "Student added successfully";
  document.getElementById("studentName").value = "";
}

function loadStudents() {
  const cls = document.getElementById("viewClass").value;
  const list = document.getElementById("studentList");
  list.innerHTML = "";

  if (!cls) return;

  let data = JSON.parse(localStorage.getItem("students")) || {};

  if (!data[cls]) {
    list.innerHTML = "<li>No students found</li>";
    return;
  }

  data[cls].forEach((name, i) => {
    let li = document.createElement("li");
    li.textContent = (i + 1) + ". " + name;
    list.appendChild(li);
  });
}
*/

import { db } from "./firebase.js";
console.log("Firebase connected", db);
