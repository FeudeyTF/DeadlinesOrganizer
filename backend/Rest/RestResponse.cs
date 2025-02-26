using System.Net;

namespace DeadlineOrganizerBackend.Rest
{
    public class RestResponse
    {
        public HttpStatusCode Status;

        public object? Object;

        public RestResponse(HttpStatusCode status, object? obj)
        {
            Status = status;
            Object = obj;
        }
    }
}
