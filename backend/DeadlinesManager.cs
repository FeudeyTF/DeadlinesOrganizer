using DeadlineOrganizerBackend.API;

namespace DeadlineOrganizerBackend
{
    internal class DeadlinesManager
    {
        public List<Deadline> Deadlines { get; private set; }

        private int _idIncrement = 0;

        public DeadlinesManager(List<Deadline> deadlines)
        {
            Deadlines = deadlines;
        }

        public Deadline Add(string courseName, string taskName, int timeToDo, Priority priority, DateTime createdDate, DateTime endDate, List<Tag> tags)
        {
            Deadline result = new(++_idIncrement, courseName, taskName, timeToDo, priority, createdDate, endDate, tags);
            Deadlines.Add(result);
            return result;
        }
    }
}
