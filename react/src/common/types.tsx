import { CSSProperties, ReactNode } from "react";

export type BooleanLike = number | boolean | null | undefined;

export type DefaultProps = Partial<{
  children: ReactNode;
  className: string;
  id: string;
  style: CSSProperties;
}>;

export type Deadline = {
  courseName: string;
  taskName: string;
  endDate: Date;
  timeToDo: number;
  priority: "high" | "medium" | "low";
  tags: string[];
};
