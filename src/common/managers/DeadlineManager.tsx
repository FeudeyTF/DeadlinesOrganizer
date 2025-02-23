import { Deadline } from "../types";

export class DeadlineManager {
  deadlines: Deadline[];

  constructor() {
    this.deadlines = JSON.parse(localStorage.getItem("deadlines") || "[]");
  }

  addDeadline(deadline: Deadline) {
    this.deadlines.push({
      ...deadline,
      id: Date.now(),
      createdDate: new Date(Date.now()).toISOString(),
    });
    this.saveDeadlines();
  }

  updateDeadline(id: number, updatedDeadline: Deadline) {
    const index = this.deadlines.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.deadlines[index] = { ...this.deadlines[index], ...updatedDeadline };
      this.saveDeadlines();
    }
  }

  deleteDeadline(id: number) {
    this.deadlines = this.deadlines.filter((d) => d.id !== id);
    this.saveDeadlines();
  }

  getDeadlinesForDate(date: Date) {
    return this.deadlines.filter((deadline) => {
      const deadlineDate = new Date(deadline.endDate);
      return (
        deadlineDate.getDate() === date.getDate() &&
        deadlineDate.getMonth() === date.getMonth() &&
        deadlineDate.getFullYear() === date.getFullYear()
      );
    });
  }

  saveDeadlines() {
    localStorage.setItem("deadlines", JSON.stringify(this.deadlines));
  }

  sortDeadlines() {
    return [...this.deadlines].sort((a, b) => {
      const dateA = new Date(a.endDate);
      const dateB = new Date(b.endDate);
      return dateA.getTime() - dateB.getTime();
    });
  }
}
