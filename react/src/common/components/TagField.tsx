import { Tag } from "../types";
import { Button } from "./Button";

type TagProps = {
  onTagDelete: (tag: Tag) => void;
  tag: Tag;
};

export function TagField(props: TagProps) {
  const { tag, onTagDelete } = props;
  return (
    <div
      key={tag.id}
      className="tag-item"
      style={{ backgroundColor: tag.color }}
    >
      {tag.name}
      <Button
        icon="times"
        color="transparent"
        onClick={() => onTagDelete(tag)}
        className="delete-tag"
      />
    </div>
  );
}
