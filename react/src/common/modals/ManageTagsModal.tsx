import { useState } from "react";
import { Tag } from "../types";
import { Button } from "../components/Button";
import { TagField } from "../components/TagField";
import { WarningMessage } from "../components/WarningMessage";

type ManageTagsModalProps = {
  onTagDelete: (tag: Tag) => void;
  tags: Tag[];
  onSubmit: (tag: Tag) => void;
};

const initialTag: Tag = {
  id: 0,
  name: "",
  color: "#4834d4",
};

export function ManageTagsModal(props: ManageTagsModalProps) {
  const { tags, onSubmit, onTagDelete } = props;
  const [tag, setTag] = useState<Tag>({ ...initialTag, id: Date.now() });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tag.name.trim() === "") {
      return;
    }

    onSubmit(tag);
    setTag({ ...initialTag, id: Date.now() });
  };

  return (
    <>
      <div className="tags-list">
        {tags.length > 0 ? (
          tags.map((tag) => <TagField tag={tag} onTagDelete={onTagDelete} />)
        ) : (
          <WarningMessage
            icon="tags"
            name="No tags created yet"
            description="Create your first tag using the form below to start organizing your deadlines."
          />
        )}
      </div>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <div className="tag-form-container">
            <input
              type="text"
              required
              value={tag.name}
              placeholder="Enter tag name"
              onChange={(e) => setTag({ ...tag, name: e.target.value })}
            />
            <input
              type="color"
              value={tag.color}
              onChange={(e) => setTag({ ...tag, color: e.target.value })}
              title="Choose tag color"
            />
          </div>
        </div>
        <button type="submit">
          <Button content="Add Tag" icon="plus" />
        </button>
      </form>
    </>
  );
}
