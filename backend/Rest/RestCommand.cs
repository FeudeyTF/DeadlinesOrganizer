﻿namespace DeadlineOrganizerBackend.Rest
{
    internal class RestCommand
    {
        public string Name;

        public string Description;

        public HttpMethodType Method;

        public string Route;

        public RestCommandDelegate Delegate;

        public RestCommand(string name, string description, HttpMethodType method, string route, RestCommandDelegate @delegate)
        {
            Name = name;
            Description = description;
            Method = method;
            Route = route;
            Delegate = @delegate;
        }
    }
}
