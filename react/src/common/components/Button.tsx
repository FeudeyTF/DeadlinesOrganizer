import { classes } from "../functions";
import { DefaultProps } from "../types";

type Props = Partial<{
  content: string;
  color: string;
  disabled: boolean;
  fluid: boolean;
  reverse: boolean;
  onClick: (e: any) => void;
  selected: boolean;
  verticalAlignContent: string;
}> & DefaultProps;

export function Button(props: Props) {
  const {
    content,
    color,
    className,
    disabled,
    fluid,
    onClick,
    selected,
    verticalAlignContent,
    ...rest
  } = props;

  return (
    <div
      className={classes([
        "button",
        fluid && "button-fluid",
        disabled && "button-disabled",
        selected && "button-selected",
        verticalAlignContent && "button-flex",
        verticalAlignContent && fluid && "button-flex-fluid",
        verticalAlignContent &&
          `button-verticalAlignContent-${verticalAlignContent}`,
        color && typeof color === "string"
          ? `button-color-${color}`
          : "button-color-default",
        className,
      ])}
      onClick={(event) => {
        if (!disabled && onClick) {
          onClick(event);
        }
      }}
      {...rest}
    >
      {content}
    </div>
  );
}
