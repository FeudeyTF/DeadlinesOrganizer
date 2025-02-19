class TagManager {
    constructor() {
        this.tags = JSON.parse(localStorage.getItem('tags')) || [];
        this.initializeTagsList();
    }

    initializeTagsList() {
        this.updateTagsList();
        this.updateAllTagSelectors();
    }

    addTag(name, color) {
        const tag = {
            id: Date.now(),
            name,
            color
        };
        this.tags.push(tag);
        this.saveTags();
        this.updateTagsList();
        this.updateAllTagSelectors();
        return tag;
    }

    updateTagsList() {
        const tagsList = document.getElementById('tagsList');
        if (!tagsList) return;

        if (this.tags.length === 0) {
            tagsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tags"></i>
                    <h3>No tags created yet</h3>
                    <p>Create your first tag using the form below to start organizing your deadlines.</p>
                </div>
            `;
            return;
        }

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
    }

    updateAllTagSelectors() {
        ['deadlineTags', 'editDeadlineTags', 'filterTags'].forEach(containerId => {
            this.updateTagSelector(containerId);
        });
    }

    updateTagSelector(containerId) {
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
                    const event = new CustomEvent('filterTagsChanged', {
                        detail: {
                            selectedTags: Array.from(container.querySelectorAll('.tag-select-item.selected'))
                                .map(el => parseInt(el.getAttribute('data-tag-id')))
                        }
                    });
                    window.dispatchEvent(event);
                });
            } else {
                tagElement.addEventListener('click', () => {
                    tagElement.classList.toggle('selected');
                });
            }

            container.appendChild(tagElement);
        });
    }

    deleteTag(id) {
        this.tags = this.tags.filter(tag => tag.id !== id);
        this.saveTags();
        this.updateTagsList();
        this.updateAllTagSelectors();
    }

    getTagById(id) {
        return this.tags.find(tag => tag.id === id);
    }

    saveTags() {
        localStorage.setItem('tags', JSON.stringify(this.tags));
    }
}
