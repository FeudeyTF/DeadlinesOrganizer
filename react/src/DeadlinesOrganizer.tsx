import { Button } from "./common/components/Button";
import { DeadlineCard } from "./common/components/DeadlineCard";
import { Section } from "./common/components/Section";
import { AddDeadlineModal } from "./common/modals/AddDeadlineModal";
import { EditDeadlineModal } from "./common/modals/EditDeadlineModal";
import { DeadlineManager } from "./common/managers/DeadlineManager";
import { Deadline } from "./common/types";
import { useState } from "react";
import { Modal } from "./common/components/Modal";

export default function DeadlinesOrganizer() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const deadlineManager = new DeadlineManager();

  function openEditDeadlineModal(deadline: Deadline) {
    setEditingDeadline(deadline);
    console.log(editingDeadline);
  }

  function closeEditDeadlineModal(deadline: Deadline | null) {
    if (editingDeadline && deadline) {
      deadlineManager.updateDeadline(editingDeadline.id, deadline);
    }
    console.log(editingDeadline);
    setEditingDeadline(null);
  }

  function openAddDeadlineModal() {
    setIsAddModalOpen(true);
  }

  function closeAddDeadlineModal(deadline: Deadline | null) {
    if (deadline) {
      deadlineManager.addDeadline(deadline);
    }
    setIsAddModalOpen(false);
  }

  return (
    <div className="container">
      <header>
        <h1>Course Deadline Tracker</h1>
        <div className="header-buttons">
          <Button content="Toggle Admin Mode" />
          <Button content="Add New Deadline" onClick={openAddDeadlineModal} />
          <Button content="Manage Tags" />
        </div>
      </header>

      <div className="dashboard">
        <Section title="Calendar" />
        <Section title="Upcoming Deadlines">
          {deadlineManager.deadlines.map((deadline) => (
            <DeadlineCard
              key={deadline.id}
              deadline={deadline}
              color="red"
              buttons={[
                <Button
                  color="bad"
                  icon="trash"
                  circle
                  onClick={() => deadlineManager.deleteDeadline(deadline.id)}
                />,
                <Button
                  icon="pen"
                  circle
                  onClick={() => openEditDeadlineModal(deadline)}
                />,
              ]}
            />
          ))}
        </Section>
        <Section title="Past Deadlines" />
        <Section title="Work Plan" />
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => closeAddDeadlineModal(null)}
        title="Add New Deadline"
      >
        <AddDeadlineModal availableTags={[]} onSubmit={closeAddDeadlineModal} />
      </Modal>
      
      <Modal
        isOpen={editingDeadline != null}
        onClose={() => closeEditDeadlineModal(null)}
        title="Edit Deadline"
      >
        {editingDeadline && (
          <EditDeadlineModal
            deadline={editingDeadline}
            availableTags={[]}
            onSubmit={closeEditDeadlineModal}
          />
        )}
      </Modal>
    </div>
  );
}
