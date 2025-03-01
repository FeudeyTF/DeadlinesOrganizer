using DeadlineOrganizerBackend.Rest;
using System.Net;

namespace DeadlineOrganizerBackend.API
{
    internal class Deadline
    {
        public int Id { get; set; }

        public string CourseName { get; set; }

        public string TaskName { get; set; }

        public int TimeToDo { get; set; }

        public Priority Priority { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime EndDate { get; set; }

        public List<Tag> Tags { get; set; }

        public Deadline(int id, string courseName, string taskName, int timeToDo, Priority priority, DateTime createdDate, DateTime endDate, List<Tag> tags)
        {
            Id = id;
            CourseName = courseName;
            TaskName = taskName;
            TimeToDo = timeToDo;
            Priority = priority;
            CreatedDate = createdDate;
            EndDate = endDate;
            Tags = tags;
        }

        public RestResponse ToRestResponse()
        {
            RestResponse response = new(HttpStatusCode.OK)
            {
                ["id"] = Id,
                ["courseName"] = CourseName,
                ["taskName"] = TaskName,
                ["timeToDo"] = TimeToDo,
                ["priority"] = Priority,
                ["createdDate"] = CreatedDate.ToAPI(),
                ["endDate"] = EndDate.ToAPI(),
                ["tags"] = Tags
            };
            return response;
        }
    }
}
