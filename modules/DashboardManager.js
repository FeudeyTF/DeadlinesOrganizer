class DashboardManager {
    constructor() {
        this.draggedItem = null;
        this.initialize();
    }

    initialize() {
        const dashboard = document.querySelector('.dashboard');
        const items = document.querySelectorAll('.dashboard-item');

        items.forEach(item => {
            item.setAttribute('draggable', 'true');
            
            item.addEventListener('dragstart', (e) => {
                this.draggedItem = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                
                item.classList.add('dashboard-drop-preview');
                
                setTimeout(() => {
                    item.style.opacity = '0.5';
                }, 0);
            });

            item.addEventListener('dragend', () => {
                item.style.opacity = '1';
                item.classList.remove('dragging', 'dashboard-drop-preview');
                this.saveLayout();
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (item === this.draggedItem) return;
                
                const rect = item.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;

                document.querySelectorAll('.dashboard-item').forEach(el => {
                    if (el !== this.draggedItem) {
                        el.classList.remove('dashboard-drop-preview');
                    }
                });

                if (e.clientY < midY) {
                    item.classList.add('dashboard-drop-preview');
                    if (item.previousElementSibling !== this.draggedItem) {
                        dashboard.insertBefore(this.draggedItem, item);
                    }
                } else {
                    item.classList.add('dashboard-drop-preview');
                    if (item.nextElementSibling !== this.draggedItem) {
                        dashboard.insertBefore(this.draggedItem, item.nextElementSibling);
                    }
                }
            });

            item.addEventListener('dragleave', () => {
                if (item !== this.draggedItem) {
                    item.classList.remove('dashboard-drop-preview');
                }
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('dashboard-drop-preview');
            });
        });

        this.loadLayout();
    }

    saveLayout() {
        const layout = [...document.querySelectorAll('.dashboard-item')].map((item, index) => {
            item.dataset.position = index;
            return {
                id: item.querySelector('h2')?.textContent || `panel-${index}`,
                position: index
            };
        });
        localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    }

    loadLayout() {
        const savedLayout = localStorage.getItem('dashboardLayout');
        if (!savedLayout) return;

        const layout = JSON.parse(savedLayout);
        const dashboard = document.querySelector('.dashboard');
        const items = [...document.querySelectorAll('.dashboard-item')];

        items.forEach(item => {
            const itemId = item.querySelector('h2')?.textContent || '';
            const savedItem = layout.find(l => l.id === itemId);
            if (savedItem) {
                item.dataset.position = savedItem.position;
            }
        });

        items.sort((a, b) => {
            return (parseInt(a.dataset.position) || 0) - (parseInt(b.dataset.position) || 0);
        });

        items.forEach(item => dashboard.appendChild(item));
    }
}
