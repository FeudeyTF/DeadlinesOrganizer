using DeadlineOrganizerBackend.API;
using DeadlineOrganizerBackend.Rest;
using System.Net;

namespace DeadlineOrganizerBackend
{
    internal class RestApi : IRestVersion
    {
        public int Version => 1;

        private readonly List<RestEndpoint> _commands;

        public RestApi()
        {
            _commands = 
            [
                new RestEndpoint("GetDeadlines", "Gets all deadlines", HttpMethodType.Get, "deadlines", GetDeadlines),
                new RestEndpoint("AddDeadline", "Adds deadline", HttpMethodType.Post, "deadline", AddDeadline),
            ];
        }

        public List<RestEndpoint> GetRestEndpoints()
            => _commands;

        private static RestResponse AddDeadline(RestEventArgs args)
        {
            var token = args.Get("token").Value;
            if (token != Program.Config.Token)
                return new RestErrorResponse(HttpStatusCode.Unauthorized, "Invalid token!");

            var courseName = args.Get("courseName").Value;
            var taskName = args.Get("taskName").Value;
            var timeToDo = int.Parse(args.Get("timeToDo").Value);
            var priority = Enum.Parse<Priority>(args.Get("priority").Value);
            var createdDate = args.Get("createdDate").Value.ToDate();
            var endDate = args.Get("endDate").Value.ToDate();
            var tags = args.Get("tags").Value;

            var result = Program.Deadlines.Add(courseName, taskName, timeToDo, priority, createdDate, endDate, []);
            return new RestResponse()
            {
                { "deadline", result.ToRestResponse() }
            };
        }

        private static RestResponse GetDeadlines(RestEventArgs args)
        {
            return new RestResponse()
            {
                ["deadlines"] = Program.Deadlines.Deadlines.Select(x => x.ToRestResponse())
            };
        }
    }
}
