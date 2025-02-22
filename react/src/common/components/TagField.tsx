import { classes } from "../functions";
import { Tag } from "../types";
import { Button } from "./Button";

type TagProps = {
  onTagClick?: (tag: Tag) => void;
  onTagDelete?: (tag: Tag) => void;
  disabled?: boolean;
  tag: Tag;
};

export function TagField(props: TagProps) {
  const { tag, disabled = false, onTagDelete, onTagClick } = props;
  return (
    <div
      key={tag.id}
      onClick={() => onTagClick && onTagClick(tag)}
      className={classes(["tag-item", disabled && "disabled"])}
      style={{ backgroundColor: disabled ? tag.color : tag.color }}
    >
      {tag.name}
      {onTagDelete && <Button
        icon="times"
        color="transparent"
        onClick={() => onTagDelete(tag)}
        className="delete-tag"
      />}
    </div>
  );
}
