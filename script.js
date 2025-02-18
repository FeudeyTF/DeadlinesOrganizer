class DeadlineTracker {
    constructor() {
        this.deadlines = JSON.parse(localStorage.getItem('deadlines')) || [];
        this.chart = null;
        this.filters = {
            priority: 'all',
            status: 'all',
            search: '',
            tags: [],
            tagMode: 'any'
        };
        this.currentDate = new Date();
        this.tags = JSON.parse(localStorage.getItem('tags')) || [];
        this.initializeEventListeners();
        this.initializeEditModal();
        this.initializeFilters();
        this.initializeFilterToggle();
        this.initializeCalendar();
        this.initializeTagsModal();
        this.updateUI();
        this.initializeDeadlineTagsSelection();
        this.initializeTagFilters();
    }

    initializeEventListeners() {
        const modal = document.getElementById('deadlineModal');
        const addBtn = document.getElementById('addDeadlineBtn');
        const closeBtn = document.querySelector('.close');
        const form = document.getElementById('deadlineForm');

        addBtn.onclick = () => this.showModal(modal);
        closeBtn.onclick = () => this.hideModal(modal);
        window.onclick = (e) => {
            if (e.target === modal) this.hideModal(modal);
        }

        form.onsubmit = (e) => {
            e.preventDefault();
            this.addDeadline();
        }
    }

    initializeEditModal() {
        const editModal = document.getElementById('editModal');
        const editForm = document.getElementById('editForm');
        const closeBtn = editModal.querySelector('.close');

        closeBtn.onclick = () => this.hideModal(editModal);
        window.onclick = (e) => {
            if (e.target === editModal) this.hideModal(editModal);
        }

        editForm.onsubmit = (e) => {
            e.preventDefault();
            this.updateDeadline();
        }
    }

    initializeFilters() {
        const priorityFilter = document.getElementById('priorityFilter');
        const statusFilter = document.getElementById('statusFilter');
        const searchFilter = document.getElementById('searchFilter');

        priorityFilter.addEventListener('change', () => {
            this.filters.priority = priorityFilter.value;
            this.updateUI();
        });

        statusFilter.addEventListener('change', () => {
            this.filters.status = statusFilter.value;
            this.updateUI();
        });

        searchFilter.addEventListener('input', () => {
            this.filters.search = searchFilter.value.toLowerCase();
            this.updateUI();
        });
    }

    initializeFilterToggle() {
        const toggleBtn = document.getElementById('toggleFilters');
        const filterControls = document.getElementById('filterControls');

        toggleBtn.addEventListener('click', () => {
            filterControls.classList.toggle('collapsed');
            // Save filter state preference
            localStorage.setItem('filtersVisible', !filterControls.classList.contains('collapsed'));
        });

        // Restore filter state
        const filtersVisible = localStorage.getItem('filtersVisible') === 'true';
        if (filtersVisible) {
            filterControls.classList.remove('collapsed');
        }
    }

    initializeTagsModal() {
        const modal = document.getElementById('tagsModal');
        const manageTagsBtn = document.getElementById('manageTagsBtn');
        const closeBtn = modal.querySelector('.close');
        const form = document.getElementById('tagForm');
        const colorInput = document.getElementById('tagColor');
        const colorPreview = document.getElementById('colorPreview');

        // Initialize color picker
        colorInput.value = '#4a90e2';
        colorPreview.style.backgroundColor = colorInput.value;

        colorInput.addEventListener('input', (e) => {
            colorPreview.style.backgroundColor = e.target.value;
        });

        manageTagsBtn.onclick = () => this.showModal(modal);
        closeBtn.onclick = () => this.hideModal(modal);
        window.onclick = (e) => {
            if (e.target === modal) this.hideModal(modal);
        }

        form.onsubmit = (e) => {
            e.preventDefault();
            this.addTag();
        }

        this.updateTagsList();
    }

    showModal(modal) {
        modal.style.display = 'flex';
        modal.offsetHeight;
        modal.classList.add('active');
    }

    hideModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.querySelectorAll('.calendar-day').forEach(day => {
                day.classList.remove('active');
            });
        }, 300);
    }

    addDeadline() {
        const deadline = {
            id: Date.now(),
            courseName: document.getElementById('courseName').value,
            taskName: document.getElementById('taskName').value,
            dueDate: new Date(document.getElementById('dueDate').value),
            priority: document.getElementById('priority').value,
            createdAt: new Date(),
            tagIds: this.getSelectedTags('deadlineTags')
        };

        this.deadlines.push(deadline);
        this.saveDeadlines();
        this.updateUI();

        document.getElementById('deadlineForm').reset();
        this.updateTagsSelect('deadlineTags'); // Reset tags selection
        this.hideModal(document.getElementById('deadlineModal'));
    }

    updateUI() {
        this.updateDeadlinesList();
        this.updateCalendar();
    }

    calculateTimeProgress(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const created = new Date(due);
        created.setDate(created.getDate() - 14); // Assuming 2 weeks standard duration

        const total = due - created;
        const elapsed = now - created;
        const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);

        const progressClass = progress >= 75 ? 'critical' :
            progress >= 40 ? 'warning' : 'safe';

        return { progress, progressClass };
    }

    formatDateTime(date) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(date).toLocaleString('en-US', options);
    }

    sortDeadlines(deadlines) {
        return deadlines.sort((a, b) => {
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);

            // Calculate urgency based on remaining time
            const nowTime = new Date().getTime();
            const urgencyA = dateA.getTime() - nowTime;
            const urgencyB = dateB.getTime() - nowTime;

            return urgencyA - urgencyB;
        });
    }

    applyFilters(deadlines) {
        return deadlines.filter(deadline => {
            // Existing filters
            if (this.filters.priority !== 'all' && deadline.priority !== this.filters.priority) {
                return false;
            }

            if (this.filters.status !== 'all') {
                const progress = deadline.progress;
                switch (this.filters.status) {
                    case 'pending':
                        if (progress > 0) return false;
                        break;
                    case 'inProgress':
                        if (progress === 0 || progress === 100) return false;
                        break;
                    case 'completed':
                        if (progress < 100) return false;
                        break;
                }
            }

            if (this.filters.search) {
                const searchText = `${deadline.courseName} ${deadline.taskName}`.toLowerCase();
                if (!searchText.includes(this.filters.search)) {
                    return false;
                }
            }

            // Tag filtering
            if (this.filters.tags.length > 0) {
                const deadlineTags = deadline.tagIds || [];
                if (this.filters.tagMode === 'all') {
                    // All selected tags must be present
                    return this.filters.tags.every(tagId => deadlineTags.includes(tagId));
                } else {
                    // At least one selected tag must be present
                    return this.filters.tags.some(tagId => deadlineTags.includes(tagId));
                }
            }

            return true;
        });
    }

    updateDeadlinesList() {
        const deadlinesList = document.getElementById('deadlinesList');
        deadlinesList.innerHTML = '';

        let sortedDeadlines = this.sortDeadlines([...this.deadlines]);
        sortedDeadlines = this.applyFilters(sortedDeadlines);

        if (sortedDeadlines.length === 0) {
            deadlinesList.innerHTML = '<div class="no-results">No deadlines match your filters</div>';
            return;
        }

        sortedDeadlines.forEach(deadline => {
            const timeRemaining = this.calculateTimeRemaining(deadline.dueDate);
            const { progress, progressClass } = this.calculateTimeProgress(deadline.dueDate);
            const fullDateTime = this.formatDateTime(deadline.dueDate);
            const card = document.createElement('div');
            card.className = `deadline-card ${deadline.priority}`;
            const tagsHtml = this.getDeadlineTagsHtml(deadline);

            card.innerHTML = `
                <div class="deadline-info">
                    <div class="deadline-title-group">
                        <div class="deadline-title">${deadline.courseName} - ${deadline.taskName}</div>
                        <div class="deadline-actions">
                            <button class="btn-edit" data-id="${deadline.id}" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete" data-id="${deadline.id}" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="deadline-date" data-full-date="${fullDateTime}">
                        ${new Date(deadline.dueDate).toLocaleDateString()}
                    </div>
                </div>
                <div class="time-remaining">${timeRemaining}</div>
                ${tagsHtml}
                <div class="progress-bar">
                    <div class="progress-bar-fill ${progressClass}" style="width: ${progress}%"></div>
                </div>
            `;

            const editBtn = card.querySelector('.btn-edit');
            const deleteBtn = card.querySelector('.btn-delete');

            editBtn.onclick = () => this.editDeadline(deadline.id);
            deleteBtn.onclick = () => this.deleteDeadline(deadline.id);

            const tagElements = card.querySelectorAll('.deadline-tag');
            tagElements.forEach(tagElement => {
                tagElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const tagColor = tagElement.style.backgroundColor;
                    const tagName = tagElement.textContent.trim();
                    const clickedTag = this.tags.find(t =>
                        t.color === tagColor &&
                        t.name === tagName
                    );

                    if (clickedTag) {
                        // Show filters if they're hidden
                        document.getElementById('filterControls').classList.remove('collapsed');

                        // Clear existing tag filters
                        document.querySelectorAll('#filterTags .tag-select-item').forEach(tag => {
                            tag.classList.remove('selected');
                        });

                        // Select the clicked tag
                        const filterTag = document.querySelector(`#filterTags [data-tag-id="${clickedTag.id}"]`);
                        if (filterTag) {
                            filterTag.classList.add('selected');
                            this.filters.tags = [clickedTag.id];
                            this.filters.tagMode = 'any';

                            // Update radio button
                            document.querySelector('input[name="tagFilterMode"][value="any"]').checked = true;

                            this.updateUI();
                        }
                    }
                });
            });

            deadlinesList.appendChild(card);
        });
    }

    initializeCalendar() {
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        const todayBtn = document.getElementById('todayBtn');

        prevMonth.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.updateCalendar();
        });

        nextMonth.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.updateCalendar();
        });

        todayBtn.addEventListener('click', () => {
            this.currentDate = new Date();
            this.updateCalendar();
        });

        this.updateCalendar();
    }

    updateCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Update month/year display
        document.getElementById('currentMonth').textContent =
            new Date(year, month).toLocaleDateString('default', { month: 'long', year: 'numeric' });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();

        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            this.createCalendarDay(calendarDays, prevMonthLastDay - i, true);
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const deadlines = this.getDeadlinesForDate(date);
            this.createCalendarDay(calendarDays, i, false, deadlines, date);
        }

        // Next month days
        const remainingDays = 42 - (startDay + daysInMonth); // 42 = 6 rows × 7 days
        for (let i = 1; i <= remainingDays; i++) {
            this.createCalendarDay(calendarDays, i, true);
        }
    }

    createCalendarDay(container, dayNumber, isOtherMonth, deadlines = [], date = null) {
        const day = document.createElement('div');
        day.className = 'calendar-day' + (isOtherMonth ? ' other-month' : '');

        if (date && this.isToday(date)) {
            day.classList.add('today');
        }

        const content = document.createElement('div');
        content.className = 'calendar-day-content';

        content.innerHTML = `
            <div class="calendar-day-number">${dayNumber}</div>
            ${deadlines.length > 0 ? `
                <div class="priority-dots-container">
                    ${deadlines.slice(0, 9).map(d => `
                        <div class="priority-dot ${d.priority}" 
                             title="${d.courseName}: ${d.taskName}"
                             data-id="${d.id}">
                        </div>
                    `).join('')}
                    ${deadlines.length > 9 ? `
                        <div class="priority-dot more" title="More deadlines">+${deadlines.length - 9}</div>
                    ` : ''}
                </div>
                <div class="deadline-popup">
                    ${deadlines.map(d => `
                        <div class="deadline-popup-item ${d.priority}" data-id="${d.id}">
                            <div class="deadline-popup-title">${d.courseName}: ${d.taskName}</div>
                            <div class="deadline-popup-time">
                                ${new Date(d.dueDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;

        // Handle click events for dots and popup items
        if (deadlines.length > 0) {
            [...content.querySelectorAll('.priority-dot:not(.more)'),
            ...content.querySelectorAll('.deadline-popup-item')].forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const deadlineId = parseInt(item.dataset.id);
                    const deadline = this.deadlines.find(d => d.id === deadlineId);
                    if (deadline) {
                        day.classList.add('active');
                        this.editDeadline(deadlineId);
                    }
                });
            });
        }

        day.appendChild(content);
        container.appendChild(day);
    }

    getDeadlinesForDate(date) {
        return this.deadlines.filter(deadline => {
            const deadlineDate = new Date(deadline.dueDate);
            return deadlineDate.getDate() === date.getDate() &&
                deadlineDate.getMonth() === date.getMonth() &&
                deadlineDate.getFullYear() === date.getFullYear();
        });
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    calculateTimeRemaining(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const diff = due - now;

        if (diff < 0) return 'Past due';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return `${days} days ${hours} hours remaining`;
        } else {
            return `${hours} hours remaining`;
        }
    }

    saveDeadlines() {
        localStorage.setItem('deadlines', JSON.stringify(this.deadlines));
    }

    estimateTimeNeeded(deadline) {
        // Basic estimation based on priority
        const baseHours = {
            high: 8,
            medium: 5,
            low: 3
        };
        return baseHours[deadline.priority];
    }

    calculateStartDate(deadline, hoursNeeded) {
        const dueDate = new Date(deadline.dueDate);
        const startDate = new Date(dueDate);
        startDate.setDate(startDate.getDate() - Math.ceil(hoursNeeded / 4)); // Assuming 4 hours per day
        return startDate.toLocaleDateString();
    }

    editDeadline(id) {
        const deadline = this.deadlines.find(d => d.id === id);
        if (!deadline) return;

        document.getElementById('editDeadlineId').value = deadline.id;
        document.getElementById('editCourseName').value = deadline.courseName;
        document.getElementById('editTaskName').value = deadline.taskName;
        document.getElementById('editDueDate').value = new Date(deadline.dueDate).toISOString().slice(0, 16);
        document.getElementById('editPriority').value = deadline.priority;

        // Set selected tags
        const tagContainer = document.getElementById('editDeadlineTags');
        tagContainer.querySelectorAll('.tag-select-item').forEach(tagElement => {
            const tagId = parseInt(tagElement.getAttribute('data-tag-id'));
            if (deadline.tagIds && deadline.tagIds.includes(tagId)) {
                tagElement.classList.add('selected');
            }
        });

        const editModal = document.getElementById('editModal');
        this.showModal(editModal);
    }

    updateDeadline() {
        const id = parseInt(document.getElementById('editDeadlineId').value);
        const index = this.deadlines.findIndex(d => d.id === id);

        if (index === -1) return;

        this.deadlines[index] = {
            ...this.deadlines[index],
            courseName: document.getElementById('editCourseName').value,
            taskName: document.getElementById('editTaskName').value,
            dueDate: new Date(document.getElementById('editDueDate').value),
            priority: document.getElementById('editPriority').value,
            tagIds: this.getSelectedTags('editDeadlineTags')
        };

        this.saveDeadlines();
        this.updateUI();
        this.hideModal(document.getElementById('editModal'));
    }

    deleteDeadline(id) {
        if (confirm('Are you sure you want to delete this deadline?')) {
            this.deadlines = this.deadlines.filter(d => d.id !== id);
            this.saveDeadlines();
            this.updateUI();
        }
    }

    addTag() {
        const name = document.getElementById('tagName').value;
        const color = document.getElementById('tagColor').value;

        const tag = {
            id: Date.now(),
            name,
            color
        };

        this.tags.push(tag);
        this.saveTags();
        this.updateTagsList();
        document.getElementById('tagForm').reset();
    }

    deleteTag(id) {
        // Remove tag from tags list
        this.tags = this.tags.filter(tag => tag.id !== id);

        // Remove deleted tag from all deadlines
        this.deadlines = this.deadlines.map(deadline => ({
            ...deadline,
            tagIds: deadline.tagIds ? deadline.tagIds.filter(tagId => tagId !== id) : []
        }));

        // Save both tags and deadlines
        this.saveTags();
        this.saveDeadlines();

        this.filters.tags = this.filters.tags.filter(tagId => tagId !== id);

        // Update UI
        this.updateTagsList();
        this.updateUI();
    }

    updateTagsList() {
        const tagsList = document.getElementById('tagsList');
        tagsList.innerHTML = '';

        this.tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-item';
            tagElement.style.backgroundColor = tag.color;

            tagElement.innerHTML = `
                ${tag.name}
                <button class="delete-tag" data-id="${tag.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;

            const deleteBtn = tagElement.querySelector('.delete-tag');
            deleteBtn.onclick = () => this.deleteTag(tag.id);

            tagsList.appendChild(tagElement);
        });

        this.updateTagsSelect('deadlineTags');
        this.updateTagsSelect('editDeadlineTags');
    }

    saveTags() {
        localStorage.setItem('tags', JSON.stringify(this.tags));
    }

    initializeDeadlineTagsSelection() {
        this.updateTagsSelect('deadlineTags');
        this.updateTagsSelect('editDeadlineTags');
    }

    updateTagsSelect(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        this.tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-select-item';
            tagElement.setAttribute('data-tag-id', tag.id);
            tagElement.style.backgroundColor = tag.color;
            tagElement.textContent = tag.name;

            if (containerId === 'filterTags') {
                tagElement.addEventListener('click', () => {
                    tagElement.classList.toggle('selected');
                    this.filters.tags = this.getSelectedTags('filterTags');
                    this.updateUI();
                });
            } else {
                tagElement.addEventListener('click', () => {
                    tagElement.classList.toggle('selected');
                });
            }

            container.appendChild(tagElement);
        });
    }

    getSelectedTags(containerId) {
        const container = document.getElementById(containerId);
        const selectedTags = container.querySelectorAll('.tag-select-item.selected');
        return Array.from(selectedTags).map(tag => parseInt(tag.getAttribute('data-tag-id')));
    }

    getDeadlineTagsHtml(deadline) {
        if (!deadline.tagIds || deadline.tagIds.length === 0) return '';

        const tags = deadline.tagIds
            .map(tagId => this.tags.find(t => t.id === tagId))
            .filter(tag => tag);

        if (tags.length === 0) return '';

        return `
            <div class="deadline-tags">
                ${tags.map(tag => `
                    <span class="deadline-tag" style="background-color: ${tag.color}">
                        ${tag.name}
                    </span>
                `).join('')}
            </div>
        `;
    }

    initializeTagFilters() {
        const radioButtons = document.getElementsByName('tagFilterMode');

        // Initialize tag selection
        this.updateTagsSelect('filterTags');

        // Add change handlers for radio buttons
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                this.filters.tagMode = radio.value;
                this.updateUI();
            });
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const tracker = new DeadlineTracker();
});