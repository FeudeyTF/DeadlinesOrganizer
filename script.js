class DeadlineTracker {
    constructor() {
        this.deadlineManager = new DeadlineManager();
        this.filterManager = new FilterManager();
        this.tagManager = new TagManager();
        this.calendarManager = new CalendarManager(this.deadlineManager);
    }

    initialize() {
        this.initializeEventListeners();
        this.initializeModals();
        this.updateUI();
        this.initializeCalendarEvents();
        this.initializeFilterEvents();
    }

    initializeEventListeners() {
        // Add deadline form
        const deadlineForm = document.getElementById('deadlineForm');
        deadlineForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddDeadline();
        });

        // Edit deadline form
        const editForm = document.getElementById('editForm');
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditDeadline();
        });

        // Filter controls
        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.filterManager.updateFilter('priority', e.target.value);
            this.updateUI();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filterManager.updateFilter('status', e.target.value);
            this.updateUI();
        });

        document.getElementById('searchFilter').addEventListener('input', (e) => {
            this.filterManager.updateFilter('search', e.target.value.toLowerCase());
            this.updateUI();
        });

        // Tag filter mode
        document.querySelectorAll('input[name="tagFilterMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.filterManager.updateFilter('tagMode', e.target.value);
                this.updateUI();
            });
        });

        // Initialize tag filters
        this.initializeTagFilters();

        // Add filter toggle button handler
        const toggleFiltersBtn = document.getElementById('toggleFilters');
        toggleFiltersBtn.addEventListener('click', () => {
            this.filterManager.toggleFiltersVisibility();
        });

        // Modal buttons
        document.getElementById('addDeadlineBtn').addEventListener('click', () => {
            UIManager.showModal(document.getElementById('deadlineModal'));
        });

        document.getElementById('manageTagsBtn').addEventListener('click', () => {
            UIManager.showModal(document.getElementById('tagsModal'));
        });

        // Close buttons for all modals
        document.querySelectorAll('.modal .close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                UIManager.hideModal(e.target.closest('.modal'));
            });
        });

        // Add tag form handler
        const tagForm = document.getElementById('tagForm');
        tagForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('tagName').value;
            const color = document.getElementById('tagColor').value;

            this.tagManager.addTag(name, color);
            this.initializeTagFilters(); // Refresh tag filters

            // Reset form
            tagForm.reset();
            document.getElementById('colorPreview').style.backgroundColor = '#4a90e2';
            document.getElementById('tagColor').value = '#4a90e2';

            // Close modal if needed
            // UIManager.hideModal(document.getElementById('tagsModal')); // Uncomment if you want to close modal after creation
        });

        // Initialize color picker preview
        const colorInput = document.getElementById('tagColor');
        const colorPreview = document.getElementById('colorPreview');
        colorInput.value = '#4a90e2';
        colorPreview.style.backgroundColor = '#4a90e2';

        colorInput.addEventListener('input', (e) => {
            colorPreview.style.backgroundColor = e.target.value;
        });
    }

    initializeTagFilters() {
        const filterTags = document.getElementById('filterTags');
        if (!filterTags)
            return;

        // Clear existing content
        filterTags.innerHTML = '';

        // Add tag options
        this.tagManager.tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-select-item';
            tagElement.setAttribute('data-tag-id', tag.id);
            tagElement.style.backgroundColor = tag.color;
            tagElement.textContent = tag.name;

            tagElement.addEventListener('click', () => {
                tagElement.classList.toggle('selected');
                const selectedTags = Array.from(filterTags.querySelectorAll('.tag-select-item.selected'))
                    .map(el => parseInt(el.getAttribute('data-tag-id')));
                this.filterManager.updateFilter('tags', selectedTags);
                this.updateUI();
            });

            filterTags.appendChild(tagElement);
        });
    }

    initializeModals() {
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                UIManager.hideModal(e.target);
            }
        });
    }

    initializeCalendarEvents() {
        window.addEventListener('calendarDeadlineClick', (e) => {
            this.handleEditClick(e.detail.deadlineId);
        });
    }

    initializeFilterEvents() {
        window.addEventListener('filterTagsChanged', (e) => {
            this.filterManager.updateFilter('tags', e.detail.selectedTags);
            this.updateUI();
        });

        document.querySelectorAll('input[name="tagFilterMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.filterManager.updateFilter('tagMode', e.target.value);
                this.updateUI();
            });
        });
    }

    updateUI() {
        const filteredDeadlines = this.filterManager.applyFilters(
            this.deadlineManager.sortDeadlines()
        );
        UIManager.updateDeadlinesList(filteredDeadlines, this.tagManager, {
            onEdit: (id) => this.handleEditClick(id),
            onDelete: (id) => this.handleDeleteClick(id)
        });
        this.calendarManager.updateCalendar();
    }

    handleAddDeadline() {
        const tagIds = Array.from(document.querySelectorAll('#deadlineTags .tag-select-item.selected'))
            .map(tag => parseInt(tag.getAttribute('data-tag-id')));

        const deadline = {
            courseName: document.getElementById('courseName').value,
            taskName: document.getElementById('taskName').value,
            dueDate: new Date(document.getElementById('dueDate').value),
            priority: document.getElementById('priority').value,
            tagIds: tagIds
        };

        this.deadlineManager.addDeadline(deadline);
        UIManager.hideModal(document.getElementById('deadlineModal'));
        document.getElementById('deadlineForm').reset();

        document.querySelectorAll('#deadlineTags .tag-select-item').forEach(tag => {
            tag.classList.remove('selected');
        });

        this.updateUI();
    }

    handleEditClick(id) {
        const deadline = this.deadlineManager.deadlines.find(d => d.id === id);
        if (!deadline)
            return;

        UIManager.populateEditForm(deadline);
        UIManager.showModal(document.getElementById('editModal'));
    }

    handleEditDeadline() {
        const id = parseInt(document.getElementById('editDeadlineId').value);
        const tagIds = Array.from(document.querySelectorAll('#editDeadlineTags .tag-select-item.selected'))
            .map(tag => parseInt(tag.getAttribute('data-tag-id')));

        const updatedDeadline = {
            courseName: document.getElementById('editCourseName').value,
            taskName: document.getElementById('editTaskName').value,
            dueDate: new Date(document.getElementById('editDueDate').value),
            priority: document.getElementById('editPriority').value,
            tagIds: tagIds
        };

        this.deadlineManager.updateDeadline(id, updatedDeadline);
        UIManager.hideModal(document.getElementById('editModal'));
        this.updateUI();
    }

    handleDeleteClick(id) {
        if (confirm('Are you sure you want to delete this deadline?')) {
            this.deadlineManager.deleteDeadline(id);
            this.updateUI();
        }
    }

    getSelectedTagIds(containerId) {
        const container = document.getElementById(containerId);
        return Array.from(container.querySelectorAll('.tag-select-item.selected'))
            .map(tag => parseInt(tag.getAttribute('data-tag-id')));
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const tracker = new DeadlineTracker();
    tracker.initialize();
});