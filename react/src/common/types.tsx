import { CSSProperties, ReactNode } from "react";

export type BooleanLike = number | boolean | null | undefined;

export type DefaultProps = Partial<{
  children: ReactNode;
  className: string;
  id: string;
  style: CSSProperties;
}>;