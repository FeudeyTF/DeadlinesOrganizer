import { Button } from "../common/components/Button";
import { DeadlineCard } from "../common/components/DeadlineCard";
import { Section } from "../common/components/Section";
import { AddDeadlineModal } from "../common/modals/AddDeadlineModal";
import { EditDeadlineModal } from "../common/modals/EditDeadlineModal";
import { DeadlineManager } from "../common/managers/DeadlineManager";
import { Deadline, priorityToColor, Tag, Priority } from "../common/types";
import { useState } from "react";
import { Modal } from "../common/components/Modal";
import { TagsManager } from "../common/managers/TagsManager";
import { ManageTagsModal } from "../common/modals/ManageTagsModal";
import { WarningMessage } from "../common/components/WarningMessage";
import { classes } from "../common/functions";
import { TagField } from "../common/components/TagField";
import { Calendar } from "../common/components/Calendar";
import { DeadlinePlanner } from "../common/components/DeadlinePlanner";
import { Roadmap } from "../common/components/Roadmap";

const deadlineManager = new DeadlineManager();
const tagsManager = new TagsManager();

type Filters = {
  search: string;
  priority: Priority | "all";
  tags: string[];
};

export default function MainPage() {
  const [deadlines, setDeadlines] = useState(deadlineManager.deadlines);
  const [tags, setTags] = useState(tagsManager.tags);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageTagsModalOpen, setIsManageTagsModalOpen] = useState(false);

  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    priority: "all",
    tags: [],
  });

  const [areFiltersVisible, setAreFiltersVisible] = useState(false);
  const [scheduleViewMode, setScheduleViewMode] = useState<'planner' | 'roadmap'>('planner');

  const filteredDeadlines = deadlines.filter((deadline) => {
    const matchesSearch =
      deadline.courseName
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      deadline.taskName.toLowerCase().includes(filters.search.toLowerCase());

    const matchesPriority =
      filters.priority === "all" || deadline.priority === filters.priority;

    const matchesTags =
      filters.tags.length === 0 ||
      filters.tags.every((tag) => deadline.tags.includes(tag));

    return matchesSearch && matchesPriority && matchesTags;
  });

  const now = new Date();
  const upcomingDeadlines = filteredDeadlines.filter(
    (d) => new Date(d.endDate) > now
  );
  const pastDeadlines = deadlines.filter(
    (d) => new Date(d.endDate) <= now
  );

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
        <Section title="Calendar">
          
        <Calendar deadlines={deadlineManager.deadlines} />
          </Section>
        <Section
          title="Upcoming Deadlines"
          headerButtons={
            <Button
              icon="filter"
              color="transparent"
              className="filter-button"
              onClick={() => setAreFiltersVisible(!areFiltersVisible)}
            />
          }
        >
          <div
            className={classes([
              "filters-container",
              areFiltersVisible ? "visible" : "hidden",
            ])}
          >
            <div className="filters-row">
              <div className="form-group">
                <label>Search</label>
                <input
                  type="text"
                  placeholder="Search by course or task name..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      priority: e.target.value as Priority | "all",
                    })
                  }
                >
                  <option value="all">All Priorities</option>
                  <option value={Priority.High}>High</option>
                  <option value={Priority.Medium}>Medium</option>
                  <option value={Priority.Low}>Low</option>
                </select>
              </div>
            </div>
            <div className="tags-section">
              <label>Tags</label>
              <div className="tags-select">
                {tags.map((tag) => (
                  <TagField
                    key={tag.id}
                    tag={tag}
                    onTagClick={(tag) => {
                      const newTags = filters.tags.includes(tag.name)
                        ? filters.tags.filter((t) => t !== tag.name)
                        : [...filters.tags, tag.name];
                      setFilters({ ...filters, tags: newTags });
                    }}
                    disabled={!filters.tags.includes(tag.name)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="deadlines-list">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((deadline) => (
                <DeadlineCard
                  key={deadline.id}
                  deadline={deadline}
                  color={priorityToColor(deadline.priority)}
                  buttons={[
                    <Button
                      key="delete"
                      color="bad"
                      icon="trash"
                      circle
                      onClick={() => {
                        deadlineManager.deleteDeadline(deadline.id);
                        setDeadlines([...deadlineManager.deadlines]);
                      }}
                    />,
                    <Button
                      key="edit"
                      icon="pen"
                      circle
                      onClick={() => openEditDeadlineModal(deadline)}
                    />,
                  ]}
                />
              ))
            ) : (
              <WarningMessage
                icon="filter"
                name="No matching deadlines"
                description="Try adjusting your filters or adding new deadlines."
              />
            )}
          </div>
        </Section>
        <Section title="Past Deadlines">
          <div className="deadlines-list">
            {pastDeadlines.length > 0 ? (
              pastDeadlines.map((deadline) => (
                <DeadlineCard
                  key={deadline.id}
                  deadline={deadline}
                  className="past-deadline"
                />
              ))
            ) : (
              <WarningMessage
                icon="clock-rotate-left"
                name="No past deadlines"
                description="Completed deadlines will appear here after their due date."
              />
            )}
          </div>
        </Section>
        <Section 
          title="Deadline Schedule" 
          headerButtons={
            <Button
              icon={scheduleViewMode === 'planner' ? 'timeline' : 'calendar-days'}
              color="primary"
              onClick={() => setScheduleViewMode(
                scheduleViewMode === 'planner' ? 'roadmap' : 'planner'
              )}
            />
          }
        >
          {scheduleViewMode === 'planner' ? (
            <DeadlinePlanner deadlines={upcomingDeadlines} />
          ) : (
            <Roadmap deadlines={upcomingDeadlines} />
          )}
        </Section>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => closeAddDeadlineModal(null)}
        title="Add New Deadline"
      >
        <AddDeadlineModal tags={tagsManager.tags} onSubmit={closeAddDeadlineModal} />
      </Modal>

      <Modal
        isOpen={editingDeadline != null}
        onClose={() => closeEditDeadlineModal(null)}
        title="Edit Deadline"
      >
        {editingDeadline && (
          <EditDeadlineModal
            deadline={editingDeadline}
            tags={tagsManager.tags}
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
