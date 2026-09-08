// Load tasks when page opens
document.addEventListener("DOMContentLoaded", loadTasks);


// Add Task
async function addTask() {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const priority = document.getElementById("taskPriority").value;
    const dueDate = document.getElementById("taskDueDate").value;

    if (title.trim() === "") {
        alert("Please enter a task title!");
        return;
    }

    await fetch("/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            description: description,
            priority: priority,
            due_date: dueDate
        })
    });

    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("taskPriority").value = "Medium";
    document.getElementById("taskDueDate").value = "";

    loadTasks();
}


// Load Tasks
async function loadTasks() {
    const response = await fetch("/tasks");
    const tasks = await response.json();

    updateStatistics(tasks);

    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML = "<p>No tasks yet. Add your first task! 🚀</p>";
        return;
    }

    tasks.forEach(task => {
        const taskDiv = document.createElement("div");

        taskDiv.className = "task";

        if (task.status === "Completed") {
            taskDiv.classList.add("completed");
        }

        let priorityEmoji = "🟡";

        if (task.priority === "High") {
            priorityEmoji = "🔴";
        } else if (task.priority === "Low") {
            priorityEmoji = "🟢";
        }

        taskDiv.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description || "No description"}</p>

            <p><strong>Priority:</strong> ${priorityEmoji} ${task.priority}</p>
            <p><strong>Due Date:</strong> ${task.due_date || "No due date"}</p>

            <div class="task-actions">
                <button class="complete-btn"
                    onclick='completeTask(${task.id}, ${JSON.stringify(task.title)}, ${JSON.stringify(task.description || "")}, ${JSON.stringify(task.priority)}, ${JSON.stringify(task.due_date || "")})'>
                    ${task.status === "Completed" ? "Completed ✓" : "Mark Complete"}
                </button>

                <button class="delete-btn"
                    onclick="deleteTask(${task.id})">
                    Delete
                </button>
            </div>
        `;

        taskList.appendChild(taskDiv);
    });
}


// Update Dashboard Statistics
function updateStatistics(tasks) {

    const total = tasks.length;

    const pending = tasks.filter(
        task => task.status === "Pending"
    ).length;

    const completed = tasks.filter(
        task => task.status === "Completed"
    ).length;

    const highPriority = tasks.filter(
        task => task.priority === "High"
    ).length;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("highPriorityTasks").textContent = highPriority;
}


// Complete Task
async function completeTask(id, title, description, priority, dueDate) {

    await fetch(`/tasks/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            description: description,
            status: "Completed",
            priority: priority,
            due_date: dueDate
        })
    });

    loadTasks();
}


// Delete Task
async function deleteTask(id) {

    if (confirm("Are you sure you want to delete this task?")) {

        await fetch(`/tasks/${id}`, {
            method: "DELETE"
        });

        loadTasks();
    }
}