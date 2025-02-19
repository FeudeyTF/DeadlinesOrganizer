class FilterManager {
    constructor() {
        this.filters = {
            priority: 'all',
            status: 'all',
            search: '',
            tags: [],
            tagMode: 'any'
        };
        this.initializeFilters();
        this.restoreFilterVisibility();
    }

    initializeFilters() {
        const priorityFilter = document.getElementById('priorityFilter');
        const statusFilter = document.getElementById('statusFilter');
        const searchFilter = document.getElementById('searchFilter');
        const tagMode = document.querySelector('input[name="tagFilterMode"]:checked');

        this.filters.priority = priorityFilter.value;
        this.filters.status = statusFilter.value;
        this.filters.search = searchFilter.value;
        this.filters.tagMode = tagMode ? tagMode.value : 'any';
    }

    updateFilter(type, value) {
        switch (type) {
            case 'priority':
            case 'status':
            case 'search':
            case 'tagMode':
                this.filters[type] = value;
                break;
            case 'tags':
                this.filters.tags = Array.isArray(value) ? value : [value];
                break;
        }
    }

    applyFilters(deadlines) {
        return deadlines.filter(deadline => {
            if (!this.checkPriorityFilter(deadline)) return false;
            if (!this.checkStatusFilter(deadline)) return false;
            if (!this.checkSearchFilter(deadline)) return false;
            if (!this.checkTagFilter(deadline)) return false;
            return true;
        });
    }

    checkPriorityFilter(deadline) {
        return this.filters.priority === 'all' || deadline.priority === this.filters.priority;
    }

    checkStatusFilter(deadline) {
        if (this.filters.status === 'all') return true;
        const progress = deadline.progress || 0;

        switch (this.filters.status) {
            case 'pending':
                return progress === 0;
            case 'inProgress':
                return progress > 0 && progress < 100;
            case 'completed':
                return progress === 100;
            default:
                return true;
        }
    }

    checkSearchFilter(deadline) {
        if (!this.filters.search)
            return true;
        const searchText = `${deadline.courseName} ${deadline.taskName}`.toLowerCase();
        return searchText.includes(this.filters.search.toLowerCase());
    }

    checkTagFilter(deadline) {
        if (!this.filters.tags || this.filters.tags.length === 0)
            return true;
        const deadlineTags = deadline.tagIds || [];

        if (deadlineTags.length === 0)
            return false;

        return this.filters.tagMode === 'all'
            ? this.filters.tags.every(tagId => deadlineTags.includes(tagId))
            : this.filters.tags.some(tagId => deadlineTags.includes(tagId));
    }

    resetFilters() {
        this.filters = {
            priority: 'all',
            status: 'all',
            search: '',
            tags: [],
            tagMode: 'any'
        };
    }

    toggleFiltersVisibility() {
        const filterControls = document.getElementById('filterControls');
        const isCollapsed = filterControls.classList.toggle('collapsed');
        localStorage.setItem('filtersVisible', !isCollapsed);
    }

    restoreFilterVisibility() {
        const filterControls = document.getElementById('filterControls');
        const filtersVisible = localStorage.getItem('filtersVisible') === 'true';

        if (filtersVisible) {
            filterControls.classList.remove('collapsed');
        } else {
            filterControls.classList.add('collapsed');
        }
    }
}
