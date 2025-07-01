

    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const priorityInput = document.getElementById('priorityInput');
    const filterSelect = document.getElementById('filter');
    const dueDateInput = document.getElementById('dueDateInput');
    const pingSound = document.getElementById('ping');

    let tasks = [];

    function updateProgress() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}% Complete`;
    }

    function getCountdown(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const diff = due - now;
        if (diff <= 0) return "Overdue";
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return days === 0 ? "Due today" : `${days} day(s) left`;
    }

    function renderTasks() {
        taskList.innerHTML = '';
        const filter = filterSelect.value;

        tasks.forEach((task, index) => {
        if ((filter === 'completed' && !task.completed) || (filter === 'pending' && task.completed)) return;

        const li = document.createElement('li');
        li.className = 'task-item';
        li.draggable = true;

        li.ondragstart = (e) => e.dataTransfer.setData('text/plain', index);
        li.ondragover = (e) => e.preventDefault();
        li.ondrop = (e) => {
            const from = parseInt(e.dataTransfer.getData('text'));
            const draggedTask = tasks.splice(from, 1)[0];
            tasks.splice(index, 0, draggedTask);
            renderTasks();
            updateProgress();
        };

        const left = document.createElement('div');
        left.className = 'task-left';
        if (task.completed) left.classList.add('completed');

        const mainRow = document.createElement('div');
        mainRow.className = 'task-main';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.onchange = () => {
            task.completed = checkbox.checked;
            pingSound.play();
            renderTasks();
            updateProgress();
        };

        const span = document.createElement('span');
        span.textContent = task.text;

        const tag = document.createElement('span');
        tag.className = `priority-tag ${task.priority}`;
        tag.textContent = task.priority;

        mainRow.appendChild(checkbox);
        mainRow.appendChild(span);
        mainRow.appendChild(tag);

        const dateInfo = document.createElement('div');
        dateInfo.className = 'task-date';
        dateInfo.textContent = `Due: ${task.due || 'N/A'}`;

        const countdown = document.createElement('div');
        countdown.className = 'countdown';
        countdown.textContent = task.due ? getCountdown(task.due) : '';

        left.appendChild(mainRow);
        left.appendChild(dateInfo);
        left.appendChild(countdown);

        const actions = document.createElement('div');
        actions.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-btn';
        editBtn.onclick = () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = task.text;
            input.className = 'edit-input';
            input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                task.text = input.value.trim();
                task.notified = false; // reset for notification
                renderTasks();
            }
            };
            input.onblur = () => {
            task.text = input.value.trim();
            task.notified = false;
            renderTasks();
            };
            span.replaceWith(input);
            input.focus();
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => {
            tasks.splice(index, 1);
            pingSound.play();
            renderTasks();
            updateProgress();
        };

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(left);
        li.appendChild(actions);
        taskList.appendChild(li);
        });
    }

    function addTask() {
        const text = taskInput.value.trim();
        const priority = priorityInput.value;
        const due = dueDateInput.value;
        if (text !== '') {
        tasks.push({ text, priority, due, completed: false, notified: false });
        taskInput.value = '';
        dueDateInput.value = '';
        pingSound.play();
        renderTasks();
        updateProgress();
        }
    }

    function toggleMode() {
        document.body.classList.toggle('light-mode');
    }

    function suggestTask() {
        const ideas = [
        "Organize your desk",
        "Take a 10-minute walk",
        "Call a friend",
        "Read 5 pages of a book",
        "Clear email inbox"
        ];
        taskInput.value = ideas[Math.floor(Math.random() * ideas.length)];
    }

    function checkForDueTasks() {
        const now = new Date();
        tasks.forEach(task => {
        if (task.due && !task.notified && !task.completed) {
            const due = new Date(task.due);
            const diff = due - now;
            if (diff <= 0 && Notification.permission === 'granted') {
            new Notification('🔔 Task Reminder', {
                body: `${task.text} is due or overdue!`
            });
            task.notified = true;
            }
        }
        });
    }

    // Trigger countdown and notification updates
    setInterval(renderTasks, 60000);
    setInterval(checkForDueTasks, 60000);

    // Allow enter key to add task
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Request browser notification permission once on load
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }