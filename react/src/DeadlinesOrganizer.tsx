import { useState } from "react";
import { Button } from "./common/components/Button";
import { DeadlineCard } from "./common/components/DeadlineCard";
import { Modal } from "./common/components/Modal";
import { Section } from "./common/components/Section";

export default function DeadlinesOrganizer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="container">
      <header>
        <h1>Course Deadline Tracker</h1>
        <div className="header-buttons">
          <Button content="Toggle Admin Mode" />
          <Button content="Add New Deadline" />
          <Button content="Manage Tags" onClick={() => setIsModalOpen(true)} />
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
            buttons={[
              <Button
                color="bad"
                icon="trash"
                circle
              />,
              <Button
                icon="pen"
                circle
              />
            ]}
          />
        </Section>
        <Section title="Past Deadlines" />
        <Section title="Work Plan" />
      </div>

      <Modal
        isOpen={isModalOpen}
        title="Test"
        onClose={() => setIsModalOpen(false)}
      >
        <p>This is a test modal content</p>
      </Modal>
    </div>
  );
}
