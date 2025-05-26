document.addEventListener('DOMContentLoaded', () => {
  // Debugging: Verify elements exist
  console.log("DOM Elements Loaded:", {
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    taskList: document.getElementById('taskList'),
    showAllBtn: document.getElementById('showAll'),
    showActiveBtn: document.getElementById('showActive'),
    showCompletedBtn: document.getElementById('showCompleted')
  });

  // DOM Elements
  const taskInput = document.getElementById('taskInput');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskList = document.getElementById('taskList');
  const showAllBtn = document.getElementById('showAll');
  const showActiveBtn = document.getElementById('showActive');
  const showCompletedBtn = document.getElementById('showCompleted');

  // Initialize tasks from localStorage
  let tasks = JSON.parse(localStorage.getItem('realEstateTasks')) || [];
  console.log("Initial tasks loaded:", tasks);

  // Render tasks with optional filtering
  function renderTasks(filter = 'all') {
    console.log("Rendering tasks with filter:", filter, tasks);
    
    taskList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    });

    if (filteredTasks.length === 0) {
      taskList.innerHTML = '<li class="empty-state">No tasks found</li>';
      return;
    }

    filteredTasks.forEach((task, originalIndex) => {
      // Find the original index in the full tasks array
      const fullArrayIndex = tasks.findIndex(t => t.createdAt === task.createdAt);
      if (fullArrayIndex === -1) return;
      
      const taskItem = document.createElement('li');
      taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
      
      taskItem.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <span class="task-text">${task.text}</span>
        <button class="delete-btn" aria-label="Delete task">×</button>
      `;
      
      const checkbox = taskItem.querySelector('.task-checkbox');
      const deleteBtn = taskItem.querySelector('.delete-btn');
      
      // Toggle task completion
      checkbox.addEventListener('change', () => {
        tasks[fullArrayIndex].completed = checkbox.checked;
        saveTasks();
        renderTasks(filter); // Maintain current filter
      });
      
      // Delete task
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        tasks.splice(fullArrayIndex, 1);
        saveTasks();
        renderTasks(filter); // Maintain current filter
      });
      
      taskList.appendChild(taskItem);
    });
  }

  // Save tasks to localStorage
  function saveTasks() {
    localStorage.setItem('realEstateTasks', JSON.stringify(tasks));
    console.log("Tasks saved:", tasks);
  }

  // Add new task
  function addTask() {
    const text = taskInput.value.trim();
    console.log("Adding task:", text);
    
    if (text) {
      const newTask = { 
        text, 
        completed: false,
        createdAt: new Date().toISOString() // Unique identifier
      };
      tasks.push(newTask);
      saveTasks();
      taskInput.value = '';
      renderTasks(getCurrentFilter());
      taskInput.focus();
    } else {
      // Visual feedback for empty input
      taskInput.classList.add('error');
      setTimeout(() => taskInput.classList.remove('error'), 1000);
    }
  }

  // Get current active filter
  function getCurrentFilter() {
    if (showActiveBtn.classList.contains('active')) return 'active';
    if (showCompletedBtn.classList.contains('active')) return 'completed';
    return 'all';
  }

  // Event Listeners
  addTaskBtn.addEventListener('click', addTask);

  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });

  // Filter buttons
  [showAllBtn, showActiveBtn, showCompletedBtn].forEach(btn => {
    btn.addEventListener('click', function() {
      // Update active state
      [showAllBtn, showActiveBtn, showCompletedBtn].forEach(b => 
        b.classList.remove('active')
      );
      this.classList.add('active');
      
      // Apply filter
      const filter = this.id.replace('show', '').toLowerCase();
      renderTasks(filter);
    });
  });

  // Initialize with 'All' filter active
  showAllBtn.classList.add('active');
  renderTasks();

  // Debug: Test adding a task programmatically
  console.log("Test: Adding sample task...");
  tasks.push({
    text: "Sample task - delete me",
    completed: false,
    createdAt: new Date().toISOString()
  });
  saveTasks();
  renderTasks();
});