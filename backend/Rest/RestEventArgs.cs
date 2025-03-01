using HttpServer;

namespace DeadlineOrganizerBackend.Rest
{
    internal class RestEventArgs
    {
        public RequestEventArgs RequestArgs;

        public RestEventArgs(RequestEventArgs requestArgs)
        {
            RequestArgs = requestArgs;
        }
    }
}
