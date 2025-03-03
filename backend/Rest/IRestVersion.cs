namespace DeadlineOrganizerBackend.Rest
{
    internal interface IRestVersion
    {
        public int Version { get; }

        public List<RestEndpoint> GetRestEndpoints();
    }
}
