namespace DeadlineOrganizerBackend.Rest.Attributes
{
    internal class RestParameterAttribute<TValue> : Attribute
    {
        public string Name;

        public Type Type;

        public RestParameterAttribute(string name)
        {
            Name = name;
            Type = typeof(TValue);
        }
    }
}
