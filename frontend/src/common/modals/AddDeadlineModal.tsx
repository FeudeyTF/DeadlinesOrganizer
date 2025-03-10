import React, { useState } from "react";
import { Button } from "../components/Button";
import { Deadline, Priority, stringToPriority, Tag } from "../types";
import { TagField } from "../components/TagField";

type AddDeadlineModalProps = {
  onSubmit: (data: Deadline) => void;
  tags: Tag[];
};

const initialDeadline: Deadline = {
  id: 0,
  createdDate: "",
  courseName: "",
  taskName: "",
  endDate: new Date().toISOString().slice(0, 16),
  timeToDo: 1,
  priority: Priority.Low,
  tags: [],
};

export function AddDeadlineModal(props: AddDeadlineModalProps) {
  const { onSubmit, tags } = props;
  const [deadline, setDeadline] = useState<Deadline>({...initialDeadline, createdDate: new Date(Date.now()).toISOString().slice(0, 16)});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(deadline);
    setDeadline(initialDeadline);
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-group">
        <label>Course Name:</label>
        <input
          type="text"
          value={deadline.courseName}
          onChange={(e) =>
            setDeadline({ ...deadline, courseName: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Task Name:</label>
        <input
          type="text"
          value={deadline.taskName}
          onChange={(e) =>
            setDeadline({ ...deadline, taskName: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Due Date:</label>
        <input
          type="datetime-local"
          value={deadline.endDate.slice(0, 16)}
          onChange={(e) =>
            setDeadline({ ...deadline, endDate: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Time to Do (hours):</label>
        <input
          type="number"
          min="0.5"
          step="0.5"
          value={deadline.timeToDo}
          onChange={(e) =>
            setDeadline({ ...deadline, timeToDo: Number(e.target.value) })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Priority:</label>
        <select
          value={deadline.priority}
          onChange={(e) => {
            setDeadline({
              ...deadline,
              priority: stringToPriority(e.target.value),
            });
          }}
          required
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <div className="form-group">
        <label>Tags:</label>
        <div className="tags-select">
          {tags.map((tag) => (
            <TagField
              key={tag.id}
              tag={tag}
              disabled={!deadline.tags.includes(tag.name)}
              onTagClick={(tag) => {
                const newTags = !deadline.tags.includes(tag.name)
                  ? [...deadline.tags, tag.name]
                  : deadline.tags.filter((t) => t !== tag.name);
                setDeadline({ ...deadline, tags: newTags });
              }}
            />
          ))}
        </div>
      </div>
      <button type="submit">
        <Button className="submit-button" content="Save Deadline" />
      </button>
    </form>
  );
}
