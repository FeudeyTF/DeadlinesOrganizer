import { useState, useEffect } from "react";
import { Deadline, Priority, priorityToColor } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ScheduleDay = {
  date: Date;
  deadlines: (Deadline & { allocatedHours: number })[];
  totalHours: number;
};

type ScheduleWarning = {
  deadlineId: number;
  message: string;
  severity: Priority;
};

type DeadlinePlannerProps = {
  deadlines: Deadline[];
};

export function DeadlinePlanner(props: DeadlinePlannerProps) {
  const { deadlines } = props;
  const [plannedDays, setPlannedDays] = useState<ScheduleDay[]>([]);
  const [warnings, setWarnings] = useState<ScheduleWarning[]>([]);
  const MAX_HOURS_PER_DAY = 8;

  function calculatePlan() {
    const currentWarnings: ScheduleWarning[] = [];
    const validDeadlines = deadlines.filter((d) => {
      if (!validateDeadline(d)) {
        currentWarnings.push({
          deadlineId: d.id,
          message: "Invalid deadline data",
          severity: Priority.High,
        });
        return false;
      }
      return true;
    });

    const sortedDeadlines = [...validDeadlines].sort((a, b) => {
      if (a.priority === Priority.High && b.priority !== Priority.High)
        return -1;
      if (a.priority !== Priority.High && b.priority === Priority.High)
        return 1;
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    });

    const plan: ScheduleDay[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    sortedDeadlines.forEach((deadline) => {
      const dueDate = new Date(deadline.endDate);
      dueDate.setHours(0, 0, 0, 0);

      const daysUntilDue = Math.max(
        0,
        Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
      );

      const minimumDaysNeeded = Math.ceil(
        deadline.timeToDo / MAX_HOURS_PER_DAY
      );

      if (minimumDaysNeeded > daysUntilDue) {
        currentWarnings.push({
          deadlineId: deadline.id,
          message: `Insufficient time for "${deadline.taskName}". Needs ${minimumDaysNeeded} days but only ${daysUntilDue} available.`,
          severity: Priority.High,
        });
      }

      let hoursRemaining = deadline.timeToDo;
      let currentDay = 0;

      while (hoursRemaining > 0 && currentDay < daysUntilDue) {
        const planDate = new Date(now);
        planDate.setDate(planDate.getDate() + currentDay);

        let daySchedule = plan.find(
          (d) => d.date.toDateString() === planDate.toDateString()
        );

        if (!daySchedule) {
          daySchedule = {
            date: planDate,
            deadlines: [],
            totalHours: 0,
          };
          plan.push(daySchedule);
        }

        const availableHours = MAX_HOURS_PER_DAY - daySchedule.totalHours;
        const hoursToAdd = Math.min(availableHours, hoursRemaining);

        if (hoursToAdd > 0) {
          daySchedule.deadlines.push({
            ...deadline,
            allocatedHours: hoursToAdd,
          });
          daySchedule.totalHours += hoursToAdd;
          hoursRemaining -= hoursToAdd;
        }

        currentDay++;
      }

      if (hoursRemaining > 0) {
        currentWarnings.push({
          deadlineId: deadline.id,
          message: `Could not allocate all hours for "${deadline.taskName}". ${hoursRemaining}h unscheduled.`,
          severity: Priority.Medium,
        });
      }
    });

    setWarnings(currentWarnings);
    setPlannedDays(plan.sort((a, b) => a.date.getTime() - b.date.getTime()));
  }

  useEffect(() => {
    calculatePlan();
  });

  return (
    <div className="planning-container">
      <div className="planning-info">
        <FontAwesomeIcon icon="info-circle" />
        <div className="info-content">
          <span className="info-title">Work Hours Limitation</span>
          <span className="info-text">
            Maximum {MAX_HOURS_PER_DAY} hours of work scheduled per day to
            maintain productivity and prevent burnout.
          </span>
        </div>
      </div>

      <WarningBox warnings={warnings} />

      {plannedDays.map((day, index) => (
        <ScheduleDayBox key={index} day={day} />
      ))}
    </div>
  );
}

function validateDeadline(deadline: Deadline) {
  return !!(
    deadline.id &&
    deadline.taskName &&
    deadline.endDate &&
    deadline.timeToDo &&
    deadline.timeToDo > 0
  );
}

type ScheduleDayBoxProps = {
  day: ScheduleDay;
};

function ScheduleDayBox(props: ScheduleDayBoxProps) {
  const { day } = props;
  return (
    <div className="planning-day">
      <div className="planning-day-header">
        <span className="day-date">{day.date.toLocaleDateString()}</span>
        <span className="day-hours">
          <FontAwesomeIcon icon="clock" />
          {day.totalHours} hours scheduled
        </span>
      </div>
      <div className="planning-tasks">
        {day.deadlines.map((deadline, deadlineIndex) => (
          <div
            key={deadlineIndex}
            className={`planning-task ${priorityToColor(deadline.priority)}`}
          >
            <div className="task-info">
              <span className="task-name">{deadline.taskName}</span>
              <span className="task-hours">
                <FontAwesomeIcon icon="hourglass" />
                {deadline.allocatedHours}h
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type WarningBoxProps = {
  warnings: ScheduleWarning[];
};

function WarningBox(props: WarningBoxProps) {
  const { warnings } = props;
  return warnings.length > 0 ? (
    <div className="planning-warnings">
      <div className="warning-header">
        <i className="fas fa-exclamation-triangle"></i>
        <span>Schedule Warnings</span>
      </div>
      {warnings.map((warning, index) => (
        <div key={index} className="warning-item">
          <div className={`warning-title ${priorityToColor(warning.severity)}`}>
            {warning.message}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div />
  );
}
