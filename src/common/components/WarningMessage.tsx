import { IconName } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type WarningMessageProps = {
  icon: IconName;
  name: string;
  description: string;
};

export function WarningMessage(props: WarningMessageProps) {
  const { icon, name, description } = props;
  return (
    <div className="warning-message">
      <FontAwesomeIcon className="icon" icon={["fas", icon]} />
      <h3>{name}</h3>
      <p>{description}</p>
    </div>
  );
}
