class UIManager {
    static showModal(modal) {
        modal.style.display = 'flex';
        modal.offsetHeight; // Force reflow
        modal.classList.add('active');
        document.body.classList.add('modal-open');

        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            const closeHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideModal(modal);
                closeBtn.removeEventListener('click', closeHandler);
            };
            closeBtn.addEventListener('click', closeHandler);
        }

        const outsideClickHandler = (e) => {
            if (e.target === modal) {
                const isColorPicker = e.target.closest('.color-setting');
                if (!isColorPicker) {
                    this.hideModal(modal);
                    modal.removeEventListener('click', outsideClickHandler);
                }
            }
        };
        modal.addEventListener('click', outsideClickHandler);
    }

    static hideModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            document.querySelectorAll('.calendar-day').forEach(day => {
                day.classList.remove('active');
            });
        }, 300);
    }

    static formatDateTime(date) {
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

    static calculateTimeRemaining(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const diff = due - now;

        if (diff < 0) return 'Past due';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return days > 0 ? `${days} days ${hours} hours remaining` : `${hours} hours remaining`;
    }

    static updateDeadlinesList(deadlines, tagManager, handlers) {
        const deadlinesList = document.getElementById('deadlinesList');
        deadlinesList.innerHTML = '';

        if (deadlines.length === 0) {
            deadlinesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-filter-circle-xmark"></i>
                    <h3>No matching deadlines found</h3>
                    <p>Try adjusting your filters or adding new deadlines.</p>
                </div>
            `;
            return;
        }

        deadlines.forEach(deadline => {
            const timeRemaining = this.calculateTimeRemaining(deadline.dueDate);
            const { progress, progressClass } = this.calculateProgress(deadline.dueDate);
            const fullDateTime = this.formatDateTime(deadline.dueDate);
            const card = this.createDeadlineCard(deadline, timeRemaining, progress, progressClass, fullDateTime, tagManager);

            card.querySelector('.btn-edit').onclick = () => handlers.onEdit(deadline.id);
            card.querySelector('.btn-delete').onclick = () => handlers.onDelete(deadline.id);

            deadlinesList.appendChild(card);
        });
    }

    static updatePastDeadlinesList(deadlines, tagManager, handlers) {
        const pastDeadlinesList = document.getElementById('pastDeadlinesList');
        if (!pastDeadlinesList) return;

        pastDeadlinesList.innerHTML = '';

        if (deadlines.length === 0) {
            pastDeadlinesList.innerHTML = '<div class="no-results">No past deadlines</div>';
            return;
        }

        deadlines.forEach(deadline => {
            const timeRemaining = this.calculateTimeRemaining(deadline.dueDate);
            const { progress, progressClass } = this.calculateProgress(deadline.dueDate);
            const fullDateTime = this.formatDateTime(deadline.dueDate);
            const card = this.createDeadlineCard(deadline, timeRemaining, progress, progressClass, fullDateTime, tagManager, true);

            card.querySelector('.btn-edit').onclick = () => handlers.onEdit(deadline.id);
            card.querySelector('.btn-delete').onclick = () => handlers.onDelete(deadline.id);

            pastDeadlinesList.appendChild(card);
        });
    }

    static calculateProgress(dueDate) {
        const now = new Date();
        const due = new Date(dueDate);
        const created = new Date(due);
        created.setDate(created.getDate() - 14);

        const total = due - created;
        const elapsed = now - created;
        const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);

        const progressClass = progress >= 75 ? 'critical' :
            progress >= 40 ? 'warning' : 'safe';

        return { progress, progressClass };
    }

    static createDeadlineCard(deadline, timeRemaining, progress, progressClass, fullDateTime, tagManager, isPast = false) {
        const card = document.createElement('div');
        card.className = `deadline-card ${deadline.priority}${isPast ? ' past' : ''}`;

        const tagsHtml = this.getDeadlineTagsHtml(deadline, tagManager);
        const timeToDoHtml = deadline.timeToDo ? `<div class="time-to-do">Estimated time: ${deadline.timeToDo} hours</div>` : '';

        card.innerHTML = `
            <div class="deadline-info">
                <div class="deadline-title-group">
                    <div class="deadline-title">${deadline.courseName} - ${deadline.taskName}</div>
                    <div class="deadline-actions admin-control">
                        <button class="btn-edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="deadline-date" data-full-date="${fullDateTime}">
                    ${new Date(deadline.dueDate).toLocaleDateString()}
                </div>
            </div>
            ${timeToDoHtml}
            <div class="time-remaining">${timeRemaining}</div>
            ${tagsHtml}
            ${!isPast ? `<div class="progress-bar">
                <div class="progress-bar-fill ${progressClass}" style="width: ${progress}%"></div>
            </div>` : ''}
        `;

        return card;
    }

    static getDeadlineTagsHtml(deadline, tagManager) {
        if (!deadline.tagIds || deadline.tagIds.length === 0) return '';

        const tags = deadline.tagIds
            .map(tagId => tagManager.getTagById(tagId))
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

    static populateEditForm(deadline) {
        document.getElementById('editDeadlineId').value = deadline.id;
        document.getElementById('editCourseName').value = deadline.courseName;
        document.getElementById('editTaskName').value = deadline.taskName;
        document.getElementById('editDueDate').value = new Date(deadline.dueDate).toISOString().slice(0, 16);
        document.getElementById('editTimeToDo').value = deadline.timeToDo || '';
        document.getElementById('editPriority').value = deadline.priority;

        document.querySelectorAll('#editDeadlineTags .tag-select-item').forEach(tagElement => {
            tagElement.classList.remove('selected');
        });

        if (deadline.tagIds && deadline.tagIds.length > 0) {
            deadline.tagIds.forEach(tagId => {
                const tagElement = document.querySelector(`#editDeadlineTags [data-tag-id="${tagId}"]`);
                if (tagElement) {
                    tagElement.classList.add('selected');
                }
            });
        }
    }
}
