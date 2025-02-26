namespace DeadlineOrganizerBackend.Rest.Attributes
{
    internal class RestMethodAttribute : Attribute
    {
        public HttpMethodType Method;

        public RestMethodAttribute(HttpMethodType method) 
        {
            Method = method;
        }
    }
}
