import { ReactNode } from "react";
import { DefaultProps } from "../types";
import { classes } from "../functions";
import { ProgressBar } from "./ProgressBar";

type DeadlineCardProps = {
  name: string;
  taskName: string;
  buttons?: ReactNode;
  timeToDo: number;
  endDate: Date;
  color?: string;
} & DefaultProps;

export function DeadlineCard(props: DeadlineCardProps) {
  const { name, taskName, buttons, endDate, timeToDo, color } = props;

  return (
    <div className={classes(["deadline-card", "deadline-card-color-" + color])}>
      <div className="header">
        <div className="right">
          <div className="title">
            {name} - {taskName}
          </div>
          {buttons && <div className="actions">{buttons}</div>}
        </div>
        <div className="date">{endDate.toLocaleDateString()}</div>
      </div>
      <div>
      <div className="field" style={{ fontSize: 16 }}>
        Estimated time: {formatTimeToDo(timeToDo)}
      </div>
      <div className="field">{getRemainingTime(endDate)}</div>
      </div>
      <ProgressBar progress={99}/>
    </div>
  );
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
