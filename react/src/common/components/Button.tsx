import { classes } from "../functions";
import { DefaultProps } from "../types";
import { IconName, IconPrefix } from '@fortawesome/fontawesome-common-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = Partial<{
  content: string;
  color: string;
  disabled: boolean;
  fluid: boolean;
  reverse: boolean;
  onClick: (e: any) => void;
  selected: boolean;
  verticalAlignContent: string;
  icon: IconName | [IconPrefix, IconName];
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
    icon,
    ...rest
  } = props;

  return (
    <div
      className={classes([
        "button",
        fluid && "button-fluid",
        disabled && "button-disabled",
        selected && "button-selected",
        icon && !content && "button-icon-only",
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
      {icon && (
        <FontAwesomeIcon 
          icon={typeof icon === 'string' ? ['fas', icon] : icon} 
        />
      )}
      {content}
    </div>
  );
}
