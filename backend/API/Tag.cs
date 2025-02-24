namespace DeadlineOrganizerBackend.API
{
    internal class Tag
    {
        public int Id { get; set; }
        
        public string Name { get; set; }

        public string Color { get; set; }

        public Tag(int id, string name, string color)
        {
            Id = id;
            Name = name;
            Color = color;
        }
    }
}
