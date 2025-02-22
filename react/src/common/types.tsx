import { CSSProperties, ReactNode } from "react";

export type BooleanLike = number | boolean | null | undefined;

export type DefaultProps = Partial<{
  children: ReactNode;
  className: string;
  id: string;
  style: CSSProperties;
}>;

export enum Priority {
  High = "High",
  Medium = "Medium",
  Low = "Low"
}

export type Deadline = {
  id: number;
  courseName: string;
  taskName: string;
  createdDate: string;
  endDate: string;
  timeToDo: number;
  priority: Priority;
  tags: string[];
};

export function stringToPriority(value: string): Priority {
  switch (value.toLowerCase()) {
    case 'high':
      return Priority.High;
    case 'medium':
      return Priority.Medium;
    case 'low':
      return Priority.Low;
    default:
      throw new Error(`Invalid priority value: ${value}`);
  }
}

export function priorityToColor(priority: Priority): string {
  switch (priority) {
    case Priority.High:
      return 'bad';
    case Priority.Medium:
      return 'average';
    case Priority.Low:
      return 'good';
  }
}

export type Tag = {
  id: number;
  name: string;
  color: string;
}
