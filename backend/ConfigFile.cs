using System.Text.Json;

namespace DeadlineOrganizerBackend
{
    public class ConfigFile
    {
        public static readonly JsonSerializerOptions SerializeOptions = new()
        {
            WriteIndented = true
        };

        public string ServerIP { get; set; } = "127.0.0.1";

        public int Port { get; set; } = 3001;

        public static ConfigFile Load(string name)
        {
            ConfigFile emptyConfig = new();
            var path = emptyConfig.Save(name);
            var parsedConfig = JsonSerializer.Deserialize<ConfigFile>(File.ReadAllText(path));
            if (parsedConfig != null)
                return parsedConfig;
            return emptyConfig;
        }

        public string Save(string name, bool rewrite = false)
        {
            string configFolder = Environment.CurrentDirectory;
            if (!Directory.Exists(configFolder))
                Directory.CreateDirectory(configFolder);
            string path = Path.Combine(configFolder, name + ".json");
            if (!File.Exists(path) || rewrite)
                File.WriteAllText(path, JsonSerializer.Serialize(this, SerializeOptions));
            return path;
        }
    }
}
