class DeadlineManager {
    constructor() {
        this.deadlines = JSON.parse(localStorage.getItem('deadlines')) || [];
        this.migrateDeadlines();
    }

    migrateDeadlines() {
        let needsSave = false;
        this.deadlines = this.deadlines.map(deadline => {
            if (typeof deadline.timeToDo === 'undefined') {
                needsSave = true;
                return { ...deadline, timeToDo: 1 }; // Default 1 hour
            }
            return deadline;
        });
        if (needsSave) {
            this.saveDeadlines();
        }
    }

    addDeadline(deadline) {
        this.deadlines.push({
            id: Date.now(),
            ...deadline,
            createdAt: new Date()
        });
        this.saveDeadlines();
    }

    updateDeadline(id, updatedDeadline) {
        const index = this.deadlines.findIndex(d => d.id === id);
        if (index !== -1) {
            this.deadlines[index] = { ...this.deadlines[index], ...updatedDeadline };
            this.saveDeadlines();
        }
    }

    deleteDeadline(id) {
        this.deadlines = this.deadlines.filter(d => d.id !== id);
        this.saveDeadlines();
    }

    getDeadlinesForDate(date) {
        return this.deadlines.filter(deadline => {
            const deadlineDate = new Date(deadline.dueDate);
            return deadlineDate.getDate() === date.getDate() &&
                deadlineDate.getMonth() === date.getMonth() &&
                deadlineDate.getFullYear() === date.getFullYear();
        });
    }

    saveDeadlines() {
        localStorage.setItem('deadlines', JSON.stringify(this.deadlines));
    }

    sortDeadlines() {
        return [...this.deadlines].sort((a, b) => {
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            return dateA.getTime() - dateB.getTime();
        });
    }
}
