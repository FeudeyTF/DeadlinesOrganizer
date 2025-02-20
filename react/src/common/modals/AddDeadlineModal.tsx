import React, { useState } from "react";
import { Modal, ModalProps } from "../components/Modal";
import { Button } from "../components/Button";

type DeadlineFormData = {
  courseName: string;
  taskName: string;
  dueDate: string;
  timeToDo: number;
  priority: "high" | "medium" | "low";
  tags: string[];
};

type AddDeadlineModalProps = {
  onSubmit: (data: DeadlineFormData) => void;
  availableTags: Array<{ id: string; name: string }>;
} & ModalProps;

export function AddDeadlineModal(props: AddDeadlineModalProps) {
  const { isOpen, onClose, onSubmit, availableTags } = props;
  const [formData, setFormData] = useState<DeadlineFormData>({
    courseName: "",
    taskName: "",
    dueDate: "",
    timeToDo: 1,
    priority: "medium",
    tags: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if(onClose)
        onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Deadline">
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="courseName">Course Name:</label>
          <input
            type="text"
            id="courseName"
            value={formData.courseName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="taskName">Task Name:</label>
          <input
            type="text"
            id="taskName"
            value={formData.taskName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date:</label>
          <input
            type="datetime-local"
            id="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="timeToDo">Time to Do (hours):</label>
          <input
            type="number"
            id="timeToDo"
            min="0.5"
            step="0.5"
            value={formData.timeToDo}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority:</label>
          <select
            id="priority"
            value={formData.priority}
            onChange={handleInputChange}
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
                  checked={formData.tags.includes(tag.id)}
                  onChange={(e) => {
                    const newTags = e.target.checked
                      ? [...formData.tags, tag.id]
                      : formData.tags.filter((t) => t !== tag.id);
                    setFormData((prev) => ({ ...prev, tags: newTags }));
                  }}
                />
                <span>{tag.name}</span>
              </label>
            ))}
          </div>
        </div>
        
        <Button content="Save Deadline" onClick={handleSubmit} />
      </form>
    </Modal>
  );
}
