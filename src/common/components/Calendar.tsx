import { useState } from "react";
import { Deadline, priorityToColor } from "../types";
import { Button } from "./Button";
import { classes } from "../functions";

type CalendarProps = {
  deadlines: Deadline[];
};

export function Calendar({ deadlines }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <Button icon="chevron-left" onClick={goToPreviousMonth} />
        <h2>
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <Button icon="chevron-right" onClick={goToNextMonth} />
        <Button content="Today" onClick={goToToday} />
      </div>
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        <CalendarCells currentDate={currentDate} deadlines={deadlines} />
      </div>
    </div>
  );
}

type CalendarCellsProps = {
  currentDate: Date;
  deadlines: Deadline[];
};

function CalendarCells(props: CalendarCellsProps) {
  const { currentDate, deadlines } = props;

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getLastMonthDays = (date: Date) => {
    const lastMonth = new Date(date.getFullYear(), date.getMonth(), 0);
    return getDaysInMonth(lastMonth);
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const lastMonthDays = getLastMonthDays(currentDate);

  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    const day = lastMonthDays - firstDay + i + 1;
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      day
    );
    cells.push(
      <Cell
        key={`prev-${day}`}
        deadlines={deadlines}
        date={date}
        day={day}
        isCurrentMonth={false}
      />
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    cells.push(
      <Cell
        key={`current-${day}`}
        deadlines={deadlines}
        date={date}
        day={day}
        isCurrentMonth
      />
    );
  }

  const remainingCells = 42 - (firstDay + daysInMonth);
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      day
    );
    cells.push(
      <Cell
        key={`next-${day}`}
        deadlines={deadlines}
        date={date}
        day={day}
        isCurrentMonth={false}
      />
    );
  }

  return <>{cells}</>;
}

type CellProps = {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  deadlines: Deadline[];
};

function Cell(props: CellProps) {
  const { date, day, isCurrentMonth, deadlines } = props;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDayDeadlines = (date: Date) => {
    return deadlines.filter((deadline) => {
      const deadlineDate = new Date(deadline.endDate);
      return (
        deadlineDate.getDate() === date.getDate() &&
        deadlineDate.getMonth() === date.getMonth() &&
        deadlineDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const dayDeadlines = getDayDeadlines(date);
  const isToday = date.toDateString() === new Date().toDateString();

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    setSelectedDate(date);
  };

  return (
    <div
      key={`${isCurrentMonth ? "" : "other-"}${day}`}
      className={classes([
        "calendar-cell",
        !isCurrentMonth && "empty",
        isToday && "today",
      ])}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setSelectedDate(null)}
    >
      <div className="cell-content">
        <span className="day-number">{day}</span>
        {dayDeadlines.length > 0 && (
          <div className="deadline-dots">
            {dayDeadlines.map((deadline, index) => (
              <span
                key={index}
                className={`deadline-dot deadline-${priorityToColor(
                  deadline.priority
                )}`}
              />
            ))}
          </div>
        )}
        {selectedDate?.getDate() === day && dayDeadlines.length > 0 && (
          <CalendarPopup deadlines={dayDeadlines} />
        )}
      </div>
    </div>
  );
}

type CalendarPopupProps = {
  deadlines: Deadline[];
};

function CalendarPopup(props: CalendarPopupProps) {
  const { deadlines } = props;
  return (
    <div className="deadline-popup">
      {deadlines.map((deadline, index) => (
        <div
          key={index}
          className={`deadline-item deadline-${priorityToColor(
            deadline.priority
          )}`}
        >
          <div className="deadline-header">
            <span className="deadline-time">
              {new Date(deadline.endDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="deadline-priority">{deadline.priority}</span>
          </div>
          <div className="deadline-title">{deadline.courseName}</div>
          <div className="deadline-subtitle">{deadline.taskName}</div>
          {deadline.tags.length > 0 && (
            <div className="deadline-tags">
              {deadline.tags.map((tag) => (
                <span key={tag} className="deadline-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
