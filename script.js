const state = {
  tasks: [
    { id: 1, title: '更新项目视觉稿', category: '设计', priority: '高', complete: false },
    { id: 2, title: '修复登录页面 bug', category: '开发', priority: '中', complete: false },
    { id: 3, title: '准备测试用例', category: '测试', priority: '低', complete: true },
  ],
  filter: 'all',
  search: '',
  theme: 'light',
  note: '',
  weeklyGoal: 10,
};

const elements = {
  taskList: document.getElementById('taskList'),
  statPending: document.getElementById('statPending'),
  statCompleted: document.getElementById('statCompleted'),
  statRatio: document.getElementById('statRatio'),
  statFocus: document.getElementById('statFocus'),
  weekProgress: document.getElementById('weekProgress'),
  weekProgressBar: document.getElementById('weekProgressBar'),
  quickAddBtn: document.getElementById('quickAddBtn'),
  newTaskModalBtn: document.getElementById('newTaskModalBtn'),
  taskModal: document.getElementById('taskModal'),
  closeModal: document.getElementById('closeModal'),
  taskForm: document.getElementById('taskForm'),
  taskTitle: document.getElementById('taskTitle'),
  taskPriority: document.getElementById('taskPriority'),
  taskCategory: document.getElementById('taskCategory'),
  taskSearch: document.getElementById('taskSearch'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  noteInput: document.getElementById('noteInput'),
  saveNoteBtn: document.getElementById('saveNoteBtn'),
  notePreview: document.getElementById('notePreview'),
  tabButtons: document.querySelectorAll('.nav-link'),
  panels: document.querySelectorAll('[data-tab-panel]'),
  themeToggle: document.getElementById('themeToggle'),
  greeting: document.getElementById('greeting'),
};

function renderTasks() {
  const filtered = state.tasks.filter((task) => {
    const matchesFilter = state.filter === 'all'
      || (state.filter === 'active' && !task.complete)
      || (state.filter === 'completed' && task.complete);
    const matchesSearch = task.title.toLowerCase().includes(state.search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  elements.taskList.innerHTML = filtered.map((task) => {
    return `
      <div class="task-item ${task.complete ? 'completed' : ''}">
        <div class="task-info">
          <label class="checkbox-wrap">
            <input type="checkbox" data-action="toggle" data-id="${task.id}" ${task.complete ? 'checked' : ''} />
            <div>
              <strong>${task.title}</strong>
              <span>${task.category} · 优先级 ${task.priority}</span>
            </div>
          </label>
        </div>
        <div class="task-actions">
          <button data-action="delete" data-id="${task.id}" aria-label="删除任务">🗑</button>
        </div>
      </div>
    `;
  }).join('') || '<p class="empty-state">当前没有匹配的任务，试试添加一个新任务。</p>';
}

function updateStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.complete).length;
  const pending = total - completed;
  const ratio = total ? Math.round((completed / total) * 100) : 0;
  const focus = Math.min(100, Math.max(25, Math.round((pending / (state.weeklyGoal || 1)) * 100)));

  elements.statPending.textContent = pending;
  elements.statCompleted.textContent = completed;
  elements.statRatio.textContent = `${ratio}%`;
  elements.statFocus.textContent = `${focus}%`;
  elements.weekProgress.textContent = `${completed} / ${state.weeklyGoal}`;
  elements.weekProgressBar.style.width = `${Math.min(100, ratio)}%`;
}

function saveState() {
  try {
    localStorage.setItem('dashboardState', JSON.stringify(state));
  } catch (error) {
    console.warn('无法保存状态', error);
  }
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('dashboardState') || 'null');
    if (saved) {
      state.tasks = saved.tasks || state.tasks;
      state.filter = saved.filter || state.filter;
      state.search = saved.search || state.search;
      state.theme = saved.theme || state.theme;
      state.note = saved.note || state.note;
    }
  } catch (error) {
    console.warn('无法读取状态', error);
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  state.theme = isDark ? 'dark' : 'light';
  elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
  saveState();
}

function openModal() {
  elements.taskModal.classList.remove('hidden');
  elements.taskModal.setAttribute('aria-hidden', 'false');
  elements.taskTitle.focus();
}

function closeModal() {
  elements.taskModal.classList.add('hidden');
  elements.taskModal.setAttribute('aria-hidden', 'true');
  elements.taskForm.reset();
}

function addTask(title, priority, category) {
  state.tasks.unshift({
    id: Date.now(),
    title,
    priority,
    category,
    complete: false,
  });
  renderTasks();
  updateStats();
  saveState();
}

function setFilter(value) {
  state.filter = value;
  elements.filterBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.filter === value));
  renderTasks();
  saveState();
}

function setSearch(value) {
  state.search = value;
  renderTasks();
  saveState();
}

function handleTaskAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  if (action === 'toggle') {
    task.complete = !task.complete;
  }
  if (action === 'delete') {
    state.tasks = state.tasks.filter((item) => item.id !== id);
  }
  renderTasks();
  updateStats();
  saveState();
}

function switchTab(tabName) {
  elements.tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tabName));
  elements.panels.forEach((panel) => {
    panel.style.display = panel.dataset.tabPanel === tabName ? 'block' : 'none';
  });
}

function updateNotePreview() {
  const content = state.note.trim();
  elements.notePreview.textContent = content ? content : '暂无笔记。保持你的思路清晰。';
}

function init() {
  loadState();
  if (state.theme === 'dark') {
    document.body.classList.add('dark-mode');
    elements.themeToggle.textContent = '☀️';
  }
  elements.greeting.textContent = `欢迎回来，管理员`;
  elements.noteInput.value = state.note;

  renderTasks();
  updateStats();
  updateNotePreview();
  setFilter(state.filter);
  setSearch(state.search);
  switchTab('overview');

  elements.quickAddBtn.addEventListener('click', openModal);
  elements.newTaskModalBtn.addEventListener('click', openModal);
  elements.closeModal.addEventListener('click', closeModal);
  elements.taskModal.addEventListener('click', (event) => {
    if (event.target === elements.taskModal) {
      closeModal();
    }
  });

  elements.taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = elements.taskTitle.value.trim();
    if (!title) return;
    addTask(title, elements.taskPriority.value, elements.taskCategory.value);
    closeModal();
  });

  elements.taskSearch.addEventListener('input', (event) => {
    setSearch(event.target.value);
  });

  elements.filterBtns.forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
  });

  elements.taskList.addEventListener('click', handleTaskAction);

  elements.saveNoteBtn.addEventListener('click', () => {
    state.note = elements.noteInput.value;
    updateNotePreview();
    saveState();
  });

  elements.themeToggle.addEventListener('click', toggleTheme);

  elements.tabButtons.forEach((button) => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });
}

init();