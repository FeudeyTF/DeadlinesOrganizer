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
        "Button",
        fluid && "Button--fluid",
        disabled && "Button--disabled",
        selected && "Button--selected",
        verticalAlignContent && "Button--flex",
        verticalAlignContent && fluid && "Button--flex--fluid",
        verticalAlignContent &&
          `Button--verticalAlignContent--${verticalAlignContent}`,
        color && typeof color === "string"
          ? `Button--color--${color}`
          : "Button--color--default",
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
