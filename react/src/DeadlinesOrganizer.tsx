import { Button } from "./common/components/Button";

function DeadlinesOrganizer() {
  return (
    <div className="container">
      <header>
        <h1>Course Deadline Tracker</h1>
        <div className="header-buttons">
          <Button content="Toggle Admin Mode" />
          <Button content="Add New Deadline" />
          <Button content="Manage Tags" />
        </div>
      </header>

      <div className="dashboard">
        <div className="dashboard-item" data-position="0"></div>
      </div>
    </div>
  );
}

export default DeadlinesOrganizer;
