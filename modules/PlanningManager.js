class PlanningManager {
    constructor(deadlineManager) {
        this.deadlineManager = deadlineManager;
        this.dailyHoursConstraint = JSON.parse(localStorage.getItem('dailyHoursConstraint')) || {
            monday: 8,
            tuesday: 8,
            wednesday: 8,
            thursday: 8,
            friday: 8,
            saturday: 4,
            sunday: 4
        };
    }

    getDayConstraint(date) {
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[date.getDay()];
        return this.dailyHoursConstraint[dayName];
    }

    updateDailyConstraint(dayConstraints) {
        this.dailyHoursConstraint = { ...this.dailyHoursConstraint, ...dayConstraints };
        localStorage.setItem('dailyHoursConstraint', JSON.stringify(this.dailyHoursConstraint));
    }

    generatePlan() {
        const activeDeadlines = this.getActiveDeadlines();
        if (activeDeadlines.length === 0) {
            return { message: "No active deadlines to plan", days: [] };
        }

        const plan = this.createOptimizedPlan(activeDeadlines);
        return this.formatPlan(plan);
    }

    getActiveDeadlines() {
        const now = new Date();
        return this.deadlineManager.deadlines.filter(deadline =>
            new Date(deadline.dueDate) > now
        ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    createOptimizedPlan(deadlines) {
        const plan = [];
        const today = new Date();
        const uncompletableDeadlines = [];

        const deadlinesWithUrgency = deadlines.map(deadline => {
            const dueDate = new Date(deadline.dueDate);
            const daysUntilDue = Math.max(1, Math.floor((dueDate - today) / (1000 * 60 * 60 * 24)));
            const timeNeeded = deadline.timeToDo || 1;

            let availableHours = 0;
            let checkDate = new Date(today);
            for (let i = 0; i < daysUntilDue; i++) {
                availableHours += this.getDayConstraint(checkDate);
                checkDate.setDate(checkDate.getDate() + 1);
            }

            if (timeNeeded > availableHours) {
                uncompletableDeadlines.push({
                    deadline,
                    timeNeeded,
                    daysUntilDue,
                    availableHours
                });
            }

            const urgencyScore = (timeNeeded / availableHours) * this.getPriorityMultiplier(deadline.priority);
            return { ...deadline, urgencyScore, daysUntilDue, timeNeeded, availableHours };
        }).sort((a, b) => b.urgencyScore - a.urgencyScore);

        if (uncompletableDeadlines.length > 0) {
            plan.warnings = uncompletableDeadlines.map(item => ({
                courseName: item.deadline.courseName,
                taskName: item.deadline.taskName,
                timeNeeded: item.timeNeeded,
                daysUntilDue: item.daysUntilDue,
                availableHours: item.availableHours
            }));
        }

        deadlinesWithUrgency.forEach(deadline => {
            let remainingTime = deadline.timeNeeded;
            let currentDay = new Date(today);
            let daysUsed = 0;

            while (remainingTime > 0 && daysUsed < deadline.daysUntilDue) {
                const dayConstraint = this.getDayConstraint(currentDay);
                const existingDayIndex = plan.findIndex(d =>
                    d.date.getDate() === currentDay.getDate() &&
                    d.date.getMonth() === currentDay.getMonth()
                );

                let availableHoursForDay = dayConstraint;
                if (existingDayIndex >= 0) {
                    const usedHours = plan[existingDayIndex].tasks.reduce(
                        (sum, task) => sum + task.hours, 0
                    );
                    availableHoursForDay = Math.max(0, dayConstraint - usedHours);
                }

                if (availableHoursForDay > 0) {
                    const hoursForDay = Math.min(
                        remainingTime,
                        availableHoursForDay
                    );

                    if (hoursForDay >= 0.5) {
                        const planDay = {
                            date: new Date(currentDay),
                            tasks: [{
                                deadline: deadline,
                                hours: Math.round(hoursForDay * 2) / 2
                            }]
                        };

                        if (existingDayIndex >= 0) {
                            plan[existingDayIndex].tasks.push(planDay.tasks[0]);
                        } else {
                            plan.push(planDay);
                        }
                        remainingTime -= hoursForDay;
                    }
                }

                currentDay.setDate(currentDay.getDate() + 1);
                daysUsed++;
            }
        });

        return plan.sort((a, b) => a.date - b.date);
    }

    getPriorityMultiplier(priority) {
        switch (priority) {
            case 'high':
                return 2.0;
            case 'medium':
                return 1.5;
            case 'low':
                return 1.0;
            default:
                return 1.0;
        }
    }

    formatPlan(plan) {
        const formattedPlan = {
            message: "Suggested work plan:",
            days: plan.map(day => ({
                date: day.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                }),
                tasks: day.tasks.map(task => ({
                    courseName: task.deadline.courseName,
                    taskName: task.deadline.taskName,
                    hours: task.hours,
                    priority: task.deadline.priority
                }))
            }))
        };

        if (plan.warnings) {
            formattedPlan.warnings = plan.warnings;
        }

        return formattedPlan;
    }

    updatePlanDisplay() {
        const plan = this.generatePlan();
        const planContainer = document.getElementById('planningContainer');

        if (!planContainer)
            return;

        let html = `
            <div class="planning-header">
                <h3>${plan.message}</h3>
                <div class="daily-constraints">
                    Daily hour limits: 
                    ${Object.entries(this.dailyHoursConstraint).map(([day, hours]) =>
            `<span class="day-constraint">${day.charAt(0).toUpperCase()}: ${hours}</span>`
        ).join(' ')}
                </div>
            </div>`;

        if (plan.warnings) {
            html += `
                <div class="planning-warnings">
                    <div class="warning-header">
                        <i class="fas fa-exclamation-triangle"></i>
                        Warning: Some deadlines may be impossible to complete
                    </div>
                    ${plan.warnings.map(warning => `
                        <div class="warning-item">
                            <p class="warning-title">${warning.courseName}: ${warning.taskName}</p>
                            <p class="warning-details">
                                Requires ${warning.timeNeeded} hours but only ${warning.availableHours} hours available 
                                in ${warning.daysUntilDue} days
                            </p>
                        </div>
                    `).join('')}
                </div>`;
        }

        html += `<div class="planning-days">`;
        plan.days.forEach(day => {
            const totalHours = day.tasks.reduce((sum, task) => sum + task.hours, 0);

            html += `
                <div class="planning-day">
                    <div class="planning-day-header">
                        <span class="day-date">${day.date}</span>
                        <span class="day-hours">${totalHours} hours total</span>
                    </div>
                    <div class="planning-tasks">
                        ${day.tasks.map(task => `
                            <div class="planning-task ${task.priority}">
                                <div class="task-info">
                                    <span class="task-name">${task.courseName}: ${task.taskName}</span>
                                    <span class="task-hours">${task.hours} hours</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        planContainer.innerHTML = html;
    }
}
