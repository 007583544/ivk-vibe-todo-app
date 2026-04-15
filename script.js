// Task Management Functions
let tasks = [];

// Load tasks from localStorage
function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add a task
function addTask(task) {
    tasks.push(task);
    saveTasks();
}

// Edit a task
function editTask(taskId, updatedTask) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex >= 0) {
        tasks[taskIndex] = updatedTask;
        saveTasks();
    }
}

// Delete a task
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
}

// Filtering tasks
function filterTasks(priority, assignee) {
    return tasks.filter(task => (priority ? task.priority === priority : true) && (assignee ? task.assignee === assignee : true));
}

// Pagination
function paginateTasks(page, itemsPerPage) {
    const start = (page - 1) * itemsPerPage;
    return tasks.slice(start, start + itemsPerPage);
}

// Export tasks to CSV
function exportTasksToCSV() {
    const csvContent = tasks.map(task => Object.values(task).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Calculate statistics
function calculateStatistics() {
    return {
        total: tasks.length,
        completed: tasks.filter(task => task.completed).length,
        pending: tasks.filter(task => !task.completed).length
    };
}

// Event Listeners
document.getElementById('addTaskButton').addEventListener('click', () => {
    const task = { id: Date.now(), title: document.getElementById('taskTitle').value, priority: document.getElementById('taskPriority').value, assignee: document.getElementById('taskAssignee').value, completed: false };
    addTask(task);
});

document.getElementById('exportButton').addEventListener('click', exportTasksToCSV);

document.getElementById('filterButton').addEventListener('click', () => {
    const priority = document.getElementById('filterPriority').value;
    const assignee = document.getElementById('filterAssignee').value;
    const filteredTasks = filterTasks(priority, assignee);
    // Update task display
});

// Load tasks on page load
loadTasks();