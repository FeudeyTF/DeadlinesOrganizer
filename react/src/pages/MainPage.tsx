import { Button } from "../common/components/Button";
import { DeadlineCard } from "../common/components/DeadlineCard";
import { Section } from "../common/components/Section";
import { AddDeadlineModal } from "../common/modals/AddDeadlineModal";
import { EditDeadlineModal } from "../common/modals/EditDeadlineModal";
import { DeadlineManager } from "../common/managers/DeadlineManager";
import { Deadline, Tag } from "../common/types";
import { useState } from "react";
import { Modal } from "../common/components/Modal";
import { TagsManager } from "../common/managers/TagsManager";
import { ManageTagsModal } from "../common/modals/ManageTagsModal";

const deadlineManager = new DeadlineManager();
const tagsManager = new TagsManager();

export default function MainPage() {
  const [deadlines, setDeadlines] = useState(deadlineManager.deadlines);
  const [tags, setTags] = useState(tagsManager.tags);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageTagsModalOpen, setIsManageTagsModalOpen] = useState(false);

  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);

  function openEditDeadlineModal(deadline: Deadline) {
    setEditingDeadline(deadline);
  }

  function closeEditDeadlineModal(deadline: Deadline | null) {
    if (editingDeadline && deadline) {
      deadlineManager.updateDeadline(editingDeadline.id, deadline);
      setDeadlines([...deadlineManager.deadlines]);
    }
    setEditingDeadline(null);
  }

  function openAddDeadlineModal() {
    setIsAddModalOpen(true);
  }

  function closeAddDeadlineModal(deadline: Deadline | null) {
    if (deadline) {
      deadlineManager.addDeadline(deadline);
      setDeadlines([...deadlineManager.deadlines]);
    }
    setIsAddModalOpen(false);
  }

  function openManageTagsModal() {
    setIsManageTagsModalOpen(true);
  }

  function closeManageTagsModal() {
    setIsManageTagsModalOpen(false);
  }

  function submitManageTagsModal(tag: Tag | null) {
    if (tag) {
      tagsManager.addTag(tag);
      setTags([...tagsManager.tags]);
    }
  }
  
  function handleTagDelete(tag: Tag) {
    console.log(tag);
    tagsManager.deleteTag(tag.id);
    setTags([...tagsManager.tags]);
  }

  return (
    <div className="container">
      <header>
        <h1>Course Deadline Tracker</h1>
        <div className="header-buttons">
          <Button content="Toggle Admin Mode" />
          <Button content="Add New Deadline" onClick={openAddDeadlineModal} />
          <Button content="Manage Tags" onClick={openManageTagsModal} />
        </div>
      </header>
      <div className="dashboard">
        <Section title="Calendar" />
        <Section title="Upcoming Deadlines">
          <div className="deadlines-list">
            {deadlines.map((deadline) => (
              <DeadlineCard
                key={deadline.id}
                deadline={deadline}
                color="red"
                buttons={[
                  <Button
                    color="bad"
                    icon="trash"
                    circle
                    onClick={() => {
                      deadlineManager.deleteDeadline(deadline.id);
                      setDeadlines([...deadlineManager.deadlines]);
                    }}
                  />,
                  <Button
                    icon="pen"
                    circle
                    onClick={() => openEditDeadlineModal(deadline)}
                  />,
                ]}
              />
            ))}
          </div>
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
            availableTags={tagsManager.tags}
            onSubmit={closeEditDeadlineModal}
          />
        )}
      </Modal>

      <Modal
        isOpen={isManageTagsModalOpen}
        onClose={() => closeManageTagsModal()}
        title="Manage Tags"
      >
        <ManageTagsModal
          onTagDelete={handleTagDelete}
          tags={tags}
          onSubmit={submitManageTagsModal}
        />
      </Modal>
    </div>
  );
}
