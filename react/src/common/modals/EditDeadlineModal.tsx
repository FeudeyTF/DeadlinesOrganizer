import React, { useState } from "react";
import { Button } from "../components/Button";
import { Deadline, stringToPriority } from "../types";

type EditDeadlineModalProps = {
  deadline: Deadline;
  onSubmit: (data: Deadline) => void;
  availableTags: Array<{ id: string; name: string }>;
};

export function EditDeadlineModal(props: EditDeadlineModalProps) {
  const { deadline, onSubmit, availableTags } = props;
  const [resultDeadline, setResultDeadline] = useState<Deadline>(deadline);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resultDeadline && onSubmit(resultDeadline);
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-group">
        <label>Course Name:</label>
        <input
          type="text"
          value={resultDeadline.courseName}
          onChange={(e) =>
            setResultDeadline({ ...resultDeadline, courseName: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Task Name:</label>
        <input
          type="text"
          value={resultDeadline.taskName}
          onChange={(e) =>
            setResultDeadline({ ...resultDeadline, taskName: e.target.value })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Due Date:</label>
        <input
          type="datetime-local"
          value={resultDeadline.endDate.slice(0, 16)}
          onChange={(e) =>
            setResultDeadline({ ...resultDeadline, endDate: e.target.value })
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
          value={resultDeadline.timeToDo}
          onChange={(e) =>
            setResultDeadline({ ...resultDeadline, timeToDo: Number(e.target.value) })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Priority:</label>
        <select
          value={resultDeadline.priority}
          onChange={(e) =>
            setResultDeadline({
              ...resultDeadline,
              priority: stringToPriority(e.target.value),
            })
          }
          required
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="form-group">
        <label>Tags:</label>
        <div className="tags-select">
          {availableTags.map((tag) => (
            <label key={tag.id} className="tag-checkbox">
              <input
                type="checkbox"
                checked={resultDeadline?.tags.includes(tag.id)}
                onChange={(e) => {
                  const newTags = e.target.checked
                    ? [...resultDeadline.tags, tag.id]
                    : resultDeadline.tags.filter((t) => t !== tag.id);
                  setResultDeadline(
                    (prev) => prev && { ...prev, tags: newTags }
                  );
                }}
              />
              <span>{tag.name}</span>
            </label>
          ))}
        </div>
      </div>
      <button type="submit">
        <Button className="submit-button" content="Edit Deadline" />
      </button>
    </form>
  );
}
