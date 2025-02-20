import { useState } from "react";
import { Button } from "./common/components/Button";
import { DeadlineCard } from "./common/components/DeadlineCard";
import { Section } from "./common/components/Section";
import { AddDeadlineModal } from "./common/modals/AddDeadlineModal";
import { EditDeadlineModal } from "./common/modals/EditDeadlineModal";

export default function DeadlinesOrganizer() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="container">
      <header>
        <h1>Course Deadline Tracker</h1>
        <div className="header-buttons">
          <Button content="Toggle Admin Mode" />
          <Button
            content="Add New Deadline"
            onClick={() => setIsAddModalOpen(true)}
          />
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
            buttons={[
              <Button color="bad" icon="trash" circle />,
              <Button
                icon="pen"
                circle
                onClick={() => setIsEditModalOpen(true)}
              />,
            ]}
          />
        </Section>
        <Section title="Past Deadlines" />
        <Section title="Work Plan" />
      </div>

      <AddDeadlineModal
        availableTags={[]}
        onSubmit={(data) => {
          console.log("Submitted add form ");
        }}
        isOpen={isAddModalOpen}
        title="Test"
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditDeadlineModal
        deadline={{
          courseName: "sas",
          taskName: "sas",
          endDate: new Date(2025, 1, 21),
          timeToDo: 1,
          priority: "medium",
          tags: [],
        }}
        availableTags={[]}
        onSubmit={(data) => {
          console.log("Submitted edit form ");
        }}
        isOpen={isEditModalOpen}
        title="Test"
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
