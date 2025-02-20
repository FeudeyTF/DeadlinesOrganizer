import { DefaultProps } from "../types";

type ProgressBarProps = {
  progress: number;
  color?: string;
  height?: string;
} & DefaultProps;

export function ProgressBar(props: ProgressBarProps) {
  const { progress, color = "#4CAF50", height = "16px", children } = props;
  const progressStyle = {
    width: `${Math.min(Math.max(progress, 0), 100)}%`,
    backgroundColor: color,
    height,
  };

  return (
    <div className="progress-bar">
      <div className="progress-bar-fill" style={progressStyle}>
        {children}
      </div>
    </div>
  );
}
