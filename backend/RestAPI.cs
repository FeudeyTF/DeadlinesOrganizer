using DeadlineOrganizerBackend.API;
using DeadlineOrganizerBackend.Rest;
using DeadlineOrganizerBackend.Rest.Attributes;
using System.Net;
using System.Text.Json;
using System.Text;

namespace DeadlineOrganizerBackend
{
    internal class RestAPI : IRestVersion
    {
        public int Version => 1;

        public List<RestCommand> GetRestCommands()
        {
            return new List<RestCommand>
            {
                new RestCommand("GetDeadlines", "Gets all deadlines", HttpMethodType.Get, "/deadlines", GetDeadlines),
                new RestCommand("AddDeadline", "Adds deadline", HttpMethodType.Post, "/deadlines", AddDeadline),
            };
        }


        [RestMethod(HttpMethodType.Post)]
        [RestRoute("deadlines")]
        private static RestResponse AddDeadline(RestEventArgs args)
        {
            var body = new byte[args.RequestArgs.Request.Body.Length];
            args.RequestArgs.Request.Body.ReadExactly(body);
            var str = Encoding.UTF8.GetString(body);
            var deadline = JsonSerializer.Deserialize<Deadline>(str);
            if (deadline != null)
            {
                //Program.Deadlines.Add(deadline.CourseName, deadline.TaskName, deadline);
                return new RestResponse(HttpStatusCode.OK);
            }
            return new RestResponse(HttpStatusCode.BadRequest);
        }

        [RestMethod(HttpMethodType.Get)]
        [RestRoute("deadlines")]
        private static RestResponse GetDeadlines(RestEventArgs args)
        {
            return new RestResponse(HttpStatusCode.OK)
            {
                ["deadlines"] = Program.Deadlines.Deadlines.Select(x => x.ToRestResponse())
            };
        }
    }
}
