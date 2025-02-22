import { ReactNode } from "react";
import { Deadline, DefaultProps } from "../types";
import { classes } from "../functions";
import { ProgressBar } from "./ProgressBar";

type DeadlineCardProps = {
  deadline: Deadline;
  buttons?: ReactNode;
  color?: string;
} & DefaultProps;

export function DeadlineCard(props: DeadlineCardProps) {
  const { deadline, buttons, color, className, ...rest } = props;

  return (
    <div
      className={classes(["deadline-card", color && "deadline-card-color-" + color, className])}
      {...rest}
    >
      <div className="header">
        <div className="right">
          <div className="title">
            {deadline.courseName} - {deadline.taskName}
          </div>
          {buttons && <div className="actions">{buttons}</div>}
        </div>
        <div className="date">
          {new Date(deadline.endDate).toLocaleDateString()}
        </div>
      </div>
      {deadline.tags && deadline.tags.length > 0 && (
        <div className="tags">
          {deadline.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div>
        <div className="field" style={{ fontSize: 16 }}>
          Estimated time: {formatTimeToDo(deadline.timeToDo)}
        </div>
        <div className="field">
          {getRemainingTime(new Date(deadline.endDate))}
        </div>
      </div>
      <ProgressBar
        progress={generateDeadlineProgress(
          deadline.createdDate,
          deadline.endDate
        )}
      />
    </div>
  );
}

function generateDeadlineProgress(createdDate: string, endDate: string) {
  const end = new Date(endDate);
  const created = new Date(createdDate);
  const total = end.getTime() - created.getTime();
  const remaining = end.getTime() - new Date().getTime();

  if (remaining <= 0) return 100;
  if (total <= 0) return 0;

  const progress = ((total - remaining) / total) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

const getRemainingTime = (endDate: Date) => {
  const diff = endDate.getTime() - new Date().getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} days ${hours} hours remaining`;
  }

  if (hours > 0) {
    return `${hours} hours remaining`;
  }
  return "Past due";
};

const formatTimeToDo = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours} h ${mins} min`;
  }
  return `${mins} min`;
};
