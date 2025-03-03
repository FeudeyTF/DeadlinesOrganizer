namespace DeadlineOrganizerBackend.Rest.Attributes
{
    internal class RestRouteAttribute : Attribute
    {
        public string Route;

        public RestRouteAttribute(string route)
        {
            Route = route;
        }
    }
}
