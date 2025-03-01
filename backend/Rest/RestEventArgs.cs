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

        public IParameter Get(string name)
        {
            return RequestArgs.Request.Parameters.Get(name);
        }
    }
}
