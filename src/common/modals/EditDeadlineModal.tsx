import React, { useState } from "react";
import { Button } from "../components/Button";
import { Deadline, stringToPriority, Tag } from "../types";
import { TagField } from "../components/TagField";

type EditDeadlineModalProps = {
  deadline: Deadline;
  onSubmit: (data: Deadline) => void;
  tags: Tag[];
};

export function EditDeadlineModal(props: EditDeadlineModalProps) {
  const { deadline, onSubmit, tags } = props;
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
            setResultDeadline({
              ...resultDeadline,
              timeToDo: Number(e.target.value),
            })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Priority:</label>
        <select
          value={deadline.priority}
          onChange={(e) => {
            setResultDeadline({
              ...resultDeadline,
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
              disabled={!resultDeadline.tags.includes(tag.name)}
              onTagClick={(tag) => {
                const newTags = !resultDeadline.tags.includes(tag.name)
                  ? [...resultDeadline.tags, tag.name]
                  : resultDeadline.tags.filter((t) => t !== tag.name);
                setResultDeadline({ ...resultDeadline, tags: newTags });
              }}
            />
          ))}
        </div>
      </div>
      <button type="submit">
        <Button className="submit-button" content="Edit Deadline" />
      </button>
    </form>
  );
}
