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
  };

  return (
    <div className="milestone-node">
      <div className="milestone-header">
        <div className="milestone-dot" />
        <FontAwesomeIcon icon="calendar-alt" />
        <h3>{milestone.date.toLocaleDateString(undefined, dateOptions)}</h3>
      </div>
      <div className="milestone-content">
        {milestone.deadlines.map((deadline, index) => (
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
          </div>
        ))}
      </div>
    </div>
  );
}
