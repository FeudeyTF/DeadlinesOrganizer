using DeadlineOrganizerBackend.API;
using DeadlineOrganizerBackend.Rest;
using Newtonsoft.Json;
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
                new RestEndpoint("GetTags", "Gets all tags", HttpMethodType.Get, "tags", GetTags),
                new RestEndpoint("AddDeadline", "Adds deadline", HttpMethodType.Post, "deadlines", AddDeadline),
            ];
        }

        public List<RestEndpoint> GetRestEndpoints()
            => _commands;

        private RestResponse AddDeadline(RestEventArgs args)
        {
            var token = args.Get("token").Value;
            if (token != Program.Config.Token)
                return new RestErrorResponse(HttpStatusCode.Unauthorized, "Invalid token!");

            var deadline = JsonConvert.DeserializeObject<Deadline>(args.Body);
            if (deadline != null)
            {
                var result = Program.Deadlines.Add(deadline.CourseName, deadline.TaskName, deadline.TimeToDo, deadline.Priority, deadline.CreatedDate, deadline.EndDate, deadline.Tags);
                return new RestResponse()
                {
                    { "deadline", result.ToRestResponse() }
                };
            }
            return new RestErrorResponse(HttpStatusCode.ExpectationFailed, "Invalid Deadline type!");
        }

        private RestResponse GetTags(RestEventArgs args)
        {
            return new RestResponse()
            {
                ["tags"] = Array.Empty<Tag>()
            };
        }

        private RestResponse GetDeadlines(RestEventArgs args)
        {
            return new RestResponse()
            {
                ["deadlines"] = Program.Deadlines.Deadlines.Select(x => x.ToRestResponse())
            };
        }
    }
}
