class CalendarManager {
    constructor(deadlineManager) {
        this.currentDate = new Date();
        this.deadlineManager = deadlineManager;
        this.initializeNavigation();
    }

    initializeNavigation() {
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        const todayBtn = document.getElementById('todayBtn');

        prevMonth.addEventListener('click', () => {
            this.navigateMonth(-1);
        });

        nextMonth.addEventListener('click', () => {
            this.navigateMonth(1);
        });

        todayBtn.addEventListener('click', () => {
            this.currentDate = new Date();
            this.updateCalendar();
        });
    }

    navigateMonth(delta) {
        const newDate = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth() + delta,
            1
        );

        this.currentDate = newDate;
        this.updateCalendar();
    }

    updateCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        this.updateCalendarHeader(year, month);
        this.renderCalendarDays(year, month);
    }

    updateCalendarHeader(year, month) {
        document.getElementById('currentMonth').textContent =
            new Date(year, month).toLocaleDateString('default', {
                month: 'long',
                year: 'numeric'
            });
    }

    renderCalendarDays(year, month) {
        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) return;

        calendarDays.innerHTML = '';

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Previous month
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            this.createCalendarDay(calendarDays, prevMonthDays - i, true);
        }

        // Current month
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const deadlines = this.deadlineManager.getDeadlinesForDate(date);
            this.createCalendarDay(calendarDays, i, false, deadlines, date);
        }

        // Next month
        const totalDaysShown = 42; // 6 rows × 7 days
        const remainingDays = totalDaysShown - (firstDay + daysInMonth);
        for (let i = 1; i <= remainingDays; i++) {
            this.createCalendarDay(calendarDays, i, true);
        }
    }

    getMonthInfo(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        return {
            firstDay: firstDay.getDay(),
            lastDay: lastDay.getDate(),
            daysInMonth: lastDay.getDate()
        };
    }

    renderPreviousMonthDays(calendarDays, startDay) {
        const prevMonthLastDay = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            0
        ).getDate();

        for (let i = startDay - 1; i >= 0; i--) {
            this.createCalendarDay(calendarDays, prevMonthLastDay - i, true);
        }
    }

    renderCurrentMonthDays(calendarDays, year, month, daysInMonth) {
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const deadlines = this.deadlineManager.getDeadlinesForDate(date);
            this.createCalendarDay(calendarDays, i, false, deadlines, date);
        }
    }

    renderNextMonthDays(calendarDays, startDay, daysInMonth) {
        const totalDays = 42; // 6 rows × 7 days
        const remainingDays = totalDays - (startDay + daysInMonth);

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
            ${this.getDeadlineDotsHtml(deadlines)}
        `;

        if (deadlines?.length > 0) {
            this.attachDeadlineHandlers(content, deadlines);
        }

        day.appendChild(content);
        container.appendChild(day);
    }

    getDeadlineDotsHtml(deadlines = []) {
        if (!deadlines.length) return '';

        return `
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
        `;
    }

    attachDeadlineHandlers(content, deadlines) {
        [...content.querySelectorAll('.priority-dot:not(.more)'),
        ...content.querySelectorAll('.deadline-popup-item')].forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const deadlineId = parseInt(item.dataset.id);
                const deadline = deadlines.find(d => d.id === deadlineId);
                if (deadline) {
                    item.closest('.calendar-day').classList.add('active');
                    window.dispatchEvent(new CustomEvent('calendarDeadlineClick', {
                        detail: { deadlineId }
                    }));
                }
            });
        });
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }
}
