using System.Net;

namespace DeadlineOrganizerBackend.Rest
{
    public class RestObject
    {
        public HttpStatusCode Status;

        public object? Object;

        public RestObject(HttpStatusCode status, object? obj)
        {
            Status = status;
            Object = obj;
        }
    }
}
