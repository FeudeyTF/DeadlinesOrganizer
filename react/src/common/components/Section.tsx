import { ReactNode } from "react";
import { DefaultProps } from "../types";
import { classes } from "../functions";

type SectionProps = Partial<{
  title: string;
  headerButtons: ReactNode;
}> &
  DefaultProps;

export function Section(props: SectionProps) {
  const { title, headerButtons, className, children } = props;
  return <div className={classes(["Section", className])}>
    <div className={classes(["Section--title", headerButtons ? "with--buttons" : ""])}>
      {title}
      {headerButtons}
    </div>
    {children}
  </div>;
}
