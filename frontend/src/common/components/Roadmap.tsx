import { Deadline, priorityToColor } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { classes } from "../functions";

type RoadmapProps = {
  deadlines: Deadline[];
};

export function Roadmap(props: RoadmapProps) {
  const { deadlines } = props;
  const sortedDeadlines = [...deadlines].sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  );

  const milestones = groupDeadlinesByDay(sortedDeadlines);

  return (
    <div className="roadmap">
      <div className="roadmap-line" />
      {milestones.map((milestone, index) => (
        <MilestoneNode key={index} milestone={milestone} />
      ))}
    </div>
  );
}

type Milestone = {
  date: Date;
  deadlines: Deadline[];
};

function groupDeadlinesByDay(deadlines: Deadline[]): Milestone[] {
  const groups = deadlines.reduce(
    (acc: { [key: string]: Deadline[] }, deadline) => {
      const date = new Date(deadline.endDate);
      const key = date.toISOString().split("T")[0]; // YYYY-MM-DD format

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(deadline);
      return acc;
    },
    {}
  );

  return Object.entries(groups)
    .map(([dateStr, deadlines]) => ({
      date: new Date(dateStr),
      deadlines,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

type MilestoneNodeProps = {
  milestone: Milestone;
};

function MilestoneNode(props: MilestoneNodeProps) {
  const { milestone } = props;
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const isToday = new Date().toDateString() === milestone.date.toDateString();
  const isPast = milestone.date < new Date();

  return (
    <div
      className={classes([
        "milestone-node",
        isToday && "today",
        isPast && "past",
      ])}
    >
      <div className="milestone-header">
        <div className={classes(["milestone-dot", isToday && "pulse"])} />
        <FontAwesomeIcon
          icon="calendar-alt"
          className={isToday ? "highlight" : ""}
        />
        <h3>{milestone.date.toLocaleDateString(undefined, dateOptions)}</h3>
        {isToday && <span className="today-badge">TODAY</span>}
      </div>
      <div className="milestone-content">
        {milestone.deadlines.map((deadline, index) => {
          const progress = calculateProgress(
            deadline.createdDate,
            deadline.endDate
          );
          return (
            <div
              key={index}
              className={classes([
                "milestone-deadline",
                `priority-${priorityToColor(deadline.priority)}`,
              ])}
            >
              <div className="deadline-header">
                <span className="deadline-date">
                  <FontAwesomeIcon icon="calendar" />
                  {new Date(deadline.endDate).toLocaleDateString()}
                </span>
                <span className="deadline-hours">
                  <FontAwesomeIcon icon="clock" />
                  {deadline.timeToDo}h {Math.floor(deadline.timeToDo / 60)}m
                </span>
              </div>
              <h4>{deadline.courseName}</h4>
              <p>{deadline.taskName}</p>
              {deadline.tags.length > 0 && (
                <div className="deadline-tags">
                  {deadline.tags.map((tag, idx) => (
                    <span key={idx} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function calculateProgress(createdDate: string, endDate: string) {
  const end = new Date(endDate);
  const created = new Date(createdDate);
  created.setDate(created.getDate() - 14);
  const total = end.getTime() - created.getTime();
  const remaining = end.getTime() - new Date().getTime();
  if (remaining <= 0) {
    return 100;
  }
  if (total <= 0) {
    return 0;
  }

  const progress = (remaining / total) * 100;
  return Math.min(Math.max(progress, 0), 100);
}
