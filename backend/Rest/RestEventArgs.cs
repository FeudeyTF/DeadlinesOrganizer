using HttpServer;

namespace DeadlineOrganizerBackend.Rest
{
    internal class RestEventArgs
    {
        public RequestEventArgs RequestArgs;

        public string Body { get; }

        public RestEventArgs(RequestEventArgs requestArgs)
        {
            RequestArgs = requestArgs;
            Body = new StreamReader(RequestArgs.Request.Body).ReadToEnd();
        }

        public IParameter Get(string name)
        {
            return RequestArgs.Request.Parameters.Get(name);
        }
    }
}
