namespace DeadlineOrganizerBackend.Rest
{
    internal class RestEndpoint
    {
        public string Name;

        public string Description;

        public HttpMethodType Method;

        public string Route;

        public RestEndpointDelegate Delegate;

        public RestEndpoint(string name, string description, HttpMethodType method, string[] route, RestEndpointDelegate @delegate) : this(name, description, method, "", @delegate)
        {
            Route = string.Join('/', route);
        }

        public RestEndpoint(string name, string description, HttpMethodType method, string route, RestEndpointDelegate @delegate)
        {
            Name = name;
            Description = description;
            Method = method;
            Route = route;
            Delegate = @delegate;
        }
    }
}
