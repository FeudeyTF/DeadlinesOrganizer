import { Deadline } from "../types";
import { ApiService } from "../../services/api";

export class DeadlineManager {
  deadlines: Deadline[];
  private static instance: DeadlineManager | null = null;

  private constructor() {
    this.deadlines = [];
  }

  static async getInstance(): Promise<DeadlineManager> {
    if (!this.instance) {
      this.instance = new DeadlineManager();
      await this.instance.loadDeadlines();
    }
    return this.instance;
  }

  private async loadDeadlines() {
    this.deadlines = await ApiService.fetchDeadlines();
  }

  async addDeadline(deadline: Deadline) {
    const newDeadline = await ApiService.createDeadline(deadline);
    this.deadlines.push(newDeadline);
    console.log(this.deadlines);
  }

  async updateDeadline(id: number, updatedDeadline: Deadline) {
    const updated = await ApiService.updateDeadline(id, updatedDeadline);
    const index = this.deadlines.findIndex((d) => d.id === id);
    if (index !== -1) {
      this.deadlines[index] = updated;
    }
  }

  async deleteDeadline(id: number) {
    await ApiService.deleteDeadline(id);
    this.deadlines = this.deadlines.filter((d) => d.id !== id);
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

  sortDeadlines() {
    return [...this.deadlines].sort((a, b) => {
      const dateA = new Date(a.endDate);
      const dateB = new Date(b.endDate);
      return dateA.getTime() - dateB.getTime();
    });
  }
}
