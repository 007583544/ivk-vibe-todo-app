// ============================================
// IVK VIBE To Do App - JavaScript
// Complete Task Management System
// ============================================

// Configuration
const APP_CONFIG = {
    STORAGE_KEY: 'ivk_vibe_tasks',
    TEAM_MEMBERS: ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Emma Davis']
};

// Global State
let allTasks = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentFilters = { priority: 'All', assignee: '' };
let currentEditingTaskId = null;

// DOM Elements
const DOM = {
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    priorityFilter: document.getElementById('priorityFilter'),
    assigneeFilter: document.getElementById('assigneeFilter'),
    itemsPerPage: document.getElementById('itemsPerPage'),
    exportBtn: document.getElementById('exportBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    totalTasks: document.getElementById('totalTasks'),
    completedTasks: document.getElementById('completedTasks'),
    highPriorityTasks: document.getElementById('highPriorityTasks'),
    overdueTasks: document.getElementById('overdueTasks'),
    tasksContainer: document.getElementById('tasksContainer'),
    paginationSection: document.getElementById('paginationSection'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    pageInfo: document.getElementById('pageInfo'),
    taskModal: document.getElementById('taskModal'),
    closeModalBtn: document.querySelector('.close'),
    saveTaskBtn: document.getElementById('saveTaskBtn'),
    deleteTaskBtn: document.getElementById('deleteTaskBtn'),
    modalCloseBtn: document.getElementById('closeModalBtn'),
    modalTaskTitle: document.getElementById('modalTaskTitle'),
    modalTaskDescription: document.getElementById('modalTaskDescription'),
    modalTaskPriority: document.getElementById('modalTaskPriority'),
    modalTaskAssignee: document.getElementById('modalTaskAssignee'),
    modalTaskDueDate: document.getElementById('modalTaskDueDate'),
    modalTaskStatus: document.getElementById('modalTaskStatus')
};

// ============================================
// Utility Functions
// ============================================

function generateTaskId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function isOverdue(dueDate) {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return due < today;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function saveTasks() {
    localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(allTasks));
}

function loadTasks() {
    const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
    allTasks = stored ? JSON.parse(stored) : [];
}

// ============================================
// Task Management
// ============================================

function addTask() {
    const title = DOM.taskInput.value.trim();
    if (!title) {
        alert('Please enter a task title');
        return;
    }

    const newTask = {
        id: generateTaskId(),
        title: title,
        description: '',
        priority: 'Medium',
        assignee: '',
        dueDate: '',
        completed: false,
        createdAt: new Date().toISOString()
    };

    allTasks.push(newTask);
    saveTasks();
    DOM.taskInput.value = '';
    DOM.taskInput.focus();
    currentPage = 1;
    render();
}

function deleteTask(taskId) {
    allTasks = allTasks.filter(task => task.id !== taskId);
    saveTasks();
    closeModal();
    currentPage = 1;
    render();
}

function updateTask(taskId, updates) {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
        Object.assign(task, updates);
        saveTasks();
        render();
    }
}

function toggleTaskCompletion(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        render();
    }
}

function clearAllTasks() {
    if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
        allTasks = [];
        saveTasks();
        currentPage = 1;
        render();
    }
}

// ============================================
// Filtering
// ============================================

function getFilteredTasks() {
    return allTasks.filter(task => {
        if (currentFilters.priority !== 'All' && task.priority !== currentFilters.priority) {
            return false;
        }
        if (currentFilters.assignee && task.assignee !== currentFilters.assignee) {
            return false;
        }
        return true;
    });
}

function getPaginatedTasks() {
    const filtered = getFilteredTasks();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filtered.slice(start, end);
}

// ============================================
// Statistics
// ============================================

function updateStatistics() {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.completed).length;
    const highPriority = allTasks.filter(t => t.priority === 'High' && !t.completed).length;
    const overdue = allTasks.filter(t => t.dueDate && isOverdue(t.dueDate) && !t.completed).length;

    DOM.totalTasks.textContent = total;
    DOM.completedTasks.textContent = completed;
    DOM.highPriorityTasks.textContent = highPriority;
    DOM.overdueTasks.textContent = overdue;
}

// ============================================
// Export
// ============================================

function exportToCSV() {
    if (allTasks.length === 0) {
        alert('No tasks to export');
        return;
    }

    const headers = ['Task Title', 'Description', 'Priority', 'Assigned To', 'Due Date', 'Status', 'Created Date'];
    const rows = allTasks.map(task => [
        escapeCSV(task.title),
        escapeCSV(task.description),
        task.priority,
        escapeCSV(task.assignee || 'Unassigned'),
        task.dueDate || 'No due date',
        task.completed ? 'Completed' : 'Incomplete',
        formatDate(task.createdAt.split('T')[0])
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IVK_ToDoList_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function escapeCSV(field) {
    if (!field) return '""';
    const escaped = field.replace(/"/g, '""');
    return `"${escaped}"`;
}

// ============================================
// Rendering
// ============================================

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item priority-${task.priority.toLowerCase()}`;

    if (task.completed) {
        div.classList.add('completed');
    }

    const overdue = task.dueDate && isOverdue(task.dueDate) && !task.completed;

    let metaHTML = `
        <span class="task-badge priority-badge ${task.priority.toLowerCase()}">
            ⚡ ${task.priority}
        </span>
    `;

    if (task.assignee) {
        metaHTML += `
            <span class="task-badge assignee-badge">
                👤 ${task.assignee}
            </span>
        `;
    }

    if (task.dueDate) {
        const dateClass = overdue ? 'overdue-badge' : 'status-badge';
        const dateIcon = overdue ? '⏰' : '📅';
        metaHTML += `
            <span class="task-badge ${dateClass}">
                ${dateIcon} ${formatDate(task.dueDate)}
            </span>
        `;
    }

    if (task.completed) {
        metaHTML += `
            <span class="task-badge status-badge">
                ✓ Completed
            </span>
        `;
    }

    const descriptionHTML = task.description ? `<div class="task-description">${task.description}</div>` : '';

    div.innerHTML = `
        <input 
            type="checkbox" 
            class="task-checkbox" 
            ${task.completed ? 'checked' : ''} 
            onclick="toggleTaskCompletion('${task.id}'); event.stopPropagation();"
        >
        <div class="task-content">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
                ${metaHTML}
            </div>
            ${descriptionHTML}
        </div>
    `;

    div.addEventListener('click', () => openTaskModal(task.id));
    return div;
}

function renderTasks() {
    DOM.tasksContainer.innerHTML = '';

    const tasks = getPaginatedTasks();

    if (tasks.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-icon">📝</div>
            <div class="empty-state-message">
                ${allTasks.length === 0 ? 'No tasks yet. Add one to get started!' : 'No tasks match your filters.'}
            </div>
        `;
        DOM.tasksContainer.appendChild(emptyState);
        return;
    }

    tasks.forEach(task => {
        DOM.tasksContainer.appendChild(createTaskElement(task));
    });
}

function renderPagination() {
    const filtered = getFilteredTasks();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    if (totalPages <= 1) {
        DOM.paginationSection.style.display = 'none';
        return;
    }

    DOM.paginationSection.style.display = 'flex';
    DOM.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    DOM.prevBtn.disabled = currentPage === 1;
    DOM.prevBtn.style.opacity = currentPage === 1 ? '0.5' : '1';

    DOM.nextBtn.disabled = currentPage === totalPages;
    DOM.nextBtn.style.opacity = currentPage === totalPages ? '0.5' : '1';
}

function render() {
    updateStatistics();
    renderTasks();
    renderPagination();
}

// ============================================
// Modal
// ============================================

function openTaskModal(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    currentEditingTaskId = taskId;

    DOM.modalTaskTitle.value = task.title;
    DOM.modalTaskDescription.value = task.description;
    DOM.modalTaskPriority.value = task.priority;
    DOM.modalTaskAssignee.value = task.assignee;
    DOM.modalTaskDueDate.value = task.dueDate;
    DOM.modalTaskStatus.value = task.completed ? 'complete' : 'incomplete';

    DOM.taskModal.style.display = 'block';
}

function closeModal() {
    DOM.taskModal.style.display = 'none';
    currentEditingTaskId = null;
}

function saveTaskChanges() {
    if (!currentEditingTaskId) return;

    const title = DOM.modalTaskTitle.value.trim();
    if (!title) {
        alert('Task title cannot be empty');
        return;
    }

    updateTask(currentEditingTaskId, {
        title: title,
        description: DOM.modalTaskDescription.value,
        priority: DOM.modalTaskPriority.value,
        assignee: DOM.modalTaskAssignee.value,
        dueDate: DOM.modalTaskDueDate.value,
        completed: DOM.modalTaskStatus.value === 'complete'
    });

    closeModal();
}

// ============================================
// Event Listeners
// ============================================

function initializeAssigneeFilter() {
    while (DOM.assigneeFilter.options.length > 1) {
        DOM.assigneeFilter.remove(1);
    }

    APP_CONFIG.TEAM_MEMBERS.forEach(member => {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        DOM.assigneeFilter.appendChild(option);
    });
}

function setupEventListeners() {
    DOM.addTaskBtn.addEventListener('click', addTask);
    DOM.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    DOM.priorityFilter.addEventListener('change', (e) => {
        currentFilters.priority = e.target.value;
        currentPage = 1;
        render();
    });

    DOM.assigneeFilter.addEventListener('change', (e) => {
        currentFilters.assignee = e.target.value;
        currentPage = 1;
        render();
    });

    DOM.itemsPerPage.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1;
        render();
    });

    DOM.exportBtn.addEventListener('click', exportToCSV);
    DOM.clearAllBtn.addEventListener('click', clearAllTasks);

    DOM.prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            render();
        }
    });

    DOM.nextBtn.addEventListener('click', () => {
        const filtered = getFilteredTasks();
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            render();
        }
    });

    DOM.closeModalBtn.addEventListener('click', closeModal);
    DOM.modalCloseBtn.addEventListener('click', closeModal);
    DOM.saveTaskBtn.addEventListener('click', saveTaskChanges);
    DOM.deleteTaskBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTask(currentEditingTaskId);
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target === DOM.taskModal) {
            closeModal();
        }
    });
}

// ============================================
// Initialization
// ============================================

function initializeApp() {
    loadTasks();
    initializeAssigneeFilter();
    setupEventListeners();
    render();
    DOM.taskInput.focus();
    console.log('IVK VIBE To Do App initialized successfully!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
