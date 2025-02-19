import { classes } from "../functions";

type Props = Partial<{
    content: string;
    color: string;
    className: string;
    disabled: boolean;
    fluid: boolean;
    icon: string | false;
    iconColor: string;
    iconPosition: string;
    iconRotation: number;
    iconSize: number;
    onClick: (e: any) => void;
    selected: boolean;
    verticalAlignContent: string;
  }>

export function Button(props: Props) {
    const {
      content,
      color,
      className,
      disabled,
      fluid,
      iconPosition,
      onClick,
      selected,
      verticalAlignContent,
    } = props;
  
    
  
    return <div className={classes([
        'Button',
        fluid && 'Button--fluid',
        disabled && 'Button--disabled',
        selected && 'Button--selected',
        iconPosition && `Button--iconPosition--${iconPosition}`,
        verticalAlignContent && 'Button--flex',
        verticalAlignContent && fluid && 'Button--flex--fluid',
        verticalAlignContent &&
          `Button--verticalAlignContent--${verticalAlignContent}`,
        color && typeof color === 'string'
          ? `Button--color--${color}`
          : 'Button--color--default',
        className,
      ])} onClick={(event) => {
        if (!disabled && onClick) {
          onClick(event);
        }
      }}>
        {content}
    </div>;
  }