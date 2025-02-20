import { Button } from "./common/components/Button";
import { DeadlineCard } from "./common/components/DeadlineCard";
import { Section } from "./common/components/Section";

function DeadlinesOrganizer() {
  return (
    <div className="container">
      <header>
        <h1>Course Deadline Tracker</h1>
        <div className="header-buttons">
          <Button content="Toggle Admin Mode" />
          <Button content="Add New Deadline" />
          <Button content="Manage Tags" />
        </div>
      </header>

      <div className="dashboard">
        <Section title="Calendar" />
        <Section title="Upcoming Deadlines">
          <DeadlineCard
            timeToDo={1}
            name="test"
            taskName="test123"
            endDate={new Date(2025, 1, 21)}
            color="bad"
            buttons={[<Button />, <Button />]}
          />
        </Section>
        <Section title="Past Deadlines" />
        <Section title="Work Plan" />
      </div>
    </div>
  );
}

export default DeadlinesOrganizer;
