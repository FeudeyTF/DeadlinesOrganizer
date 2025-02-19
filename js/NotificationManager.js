class NotificationManager {
    constructor() {
        this.container = this.createContainer();
        this.notifications = [];
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        const id = Date.now();

        notification.className = `notification ${type}`;

        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-times-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };

        notification.innerHTML = `
            <span class="notification-icon">${icons[type]}</span>
            <span class="notification-message">${message}</span>
        `;

        this.container.appendChild(notification);
        this.notifications.push({ id, element: notification });

        setTimeout(() => {
            notification.classList.add('visible');
        }, 100);

        notification.addEventListener('click', () => {
            this.dismiss(id);
        });

        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(id);
            }, duration);
        }

        return id;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    dismiss(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;

        const { element } = notification;
        element.classList.remove('visible');

        setTimeout(() => {
            if (element.parentNode === this.container) {
                this.container.removeChild(element);
            }
            this.notifications = this.notifications.filter(n => n.id !== id);
        }, 500);
    }

    dismissAll() {
        this.notifications.forEach(({ id }) => this.dismiss(id));
    }
}
