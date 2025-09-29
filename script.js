// DOM Elements
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.getElementById("tasks-list");
const itemsLeft = document.getElementById("items-left");
const clearCompletedBtn = document.getElementById("clear-completed");
const emptyState = document.querySelector(".empty-state");
const dateElement = document.getElementById("date");
const filters = document.querySelectorAll(".filter");

const dateControl = document.querySelector('#dateControl');
let selectedDate = "";


let tasks = [];
let currentFilter = "all";

dateControl.addEventListener("change", function () {
  const selectedDate = dateControl.value;
});

addTaskBtn.addEventListener("click", () => {
  addTask(taskInput.value, dateControl.value);
});

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask(taskInput.value, dateControl.value);
});

clearCompletedBtn.addEventListener("click", clearCompleted);

function addTask(text, dueDate = '') {
  if (text.trim() === '') return;

  const task = {
    id: Date.now(),
    text,
    completed: false,
    dueDate,
  };

  tasks.push(task);

  saveTasks();
  renderTasks();
  taskInput.value = '';
  dateControl.value = '';
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateItemsCount();
  checkEmptyState();
}

function updateItemsCount() {
  const uncompletedTasks = tasks.filter((task) => !task.completed);
  itemsLeft.textContent = `${uncompletedTasks?.length} item${uncompletedTasks?.length !== 1 ? "s" : ""
    } left`;
}

function checkEmptyState() {
  const filteredTasks = filterTasks(currentFilter);
  if (filteredTasks?.length === 0) emptyState.classList.remove("hidden");
  else emptyState.classList.add("hidden");
}

function filterTasks(filter) {
  switch (filter) {
    case "active":
      return tasks.filter((task) => !task.completed);
    case "completed":
      return tasks.filter((task) => task.completed);
    default:
      return tasks;
  }
}

function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = filterTasks(currentFilter);

  filteredTasks.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.classList.add("task-item");
    if (task.completed) taskItem.classList.add("completed");

    const checkboxContainer = document.createElement("label");
    checkboxContainer.classList.add("checkbox-container");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("task-checkbox");
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const checkmark = document.createElement("span");
    checkmark.classList.add("checkmark");

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(checkmark);

    const taskText = document.createElement("span");
    taskText.classList.add("task-item-text");
    taskText.textContent = task.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    taskItem.appendChild(checkboxContainer);
    taskItem.appendChild(taskText);

    // Add due date to task item if available
    if (task.dueDate) {
      const dueDateElement = document.createElement("span");
      dueDateElement.classList.add("task-due-date");
      dueDateElement.textContent = `Due: ${formatDateToHebrewStyle(task.dueDate)}`;
      taskItem.appendChild(dueDateElement);
    }

    taskItem.appendChild(deleteBtn);
    taskList.appendChild(taskItem);
  });
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }

    return task;
  });
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function loadTasks() {
  const storedTasks = localStorage.getItem("tasks");
  if (storedTasks) tasks = JSON.parse(storedTasks);
  renderTasks();
}

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    setActiveFilter(filter.getAttribute("data-filter"));
  });
});

function setActiveFilter(filter) {
  currentFilter = filter;

  filters.forEach((item) => {
    if (item.getAttribute("data-filter") === filter) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  renderTasks();
}

function setDate() {
  const options = { weekday: "long", month: "short", day: "numeric" };
  const today = new Date();
  dateElement.textContent = today.toLocaleDateString("en-US", options);
}

// Add sorting by due date functionality
const sortByDateBtn = document.createElement('span');
sortByDateBtn.className = 'filter';
sortByDateBtn.textContent = 'Sort by Date';
sortByDateBtn.addEventListener('click', () => {
  tasks.sort((a, b) => {
    const dateA = new Date(a.dueDate || '31-12-9999');
    const dateB = new Date(b.dueDate || '31-12-9999');
    return dateA - dateB;
  });
  renderTasks();
});

document.querySelector('.filters').appendChild(sortByDateBtn);

// Function to load tasks from API
async function loadTasksFromAPI() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
    const apiTasks = await response.json();

    const apiTaskIds = tasks.map(task => task.id);

    apiTasks.forEach(apiTask => {
      if (!apiTaskIds.includes(apiTask.id)) {
        const task = {
          id: apiTask.id,
          text: apiTask.title,
          completed: apiTask.completed,
        };
        tasks.push(task);
      }
    });

    saveTasks();
    renderTasks();
  } catch (error) {
    console.error('Failed to load tasks from API:', error);
  }
}

// Load tasks from API on page load
window.addEventListener('DOMContentLoaded', loadTasksFromAPI);

window.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  updateItemsCount();
  setDate();
});

// Function to format date in Hebrew style (DD/MM/YYYY)
function formatDateToHebrewStyle(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}
