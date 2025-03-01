using DeadlineOrganizerBackend.API;
using DeadlineOrganizerBackend.Rest;
using System.Net;

namespace DeadlineOrganizerBackend
{
    internal class Program
    {
        public static readonly IPAddress IP;

        public static readonly int Port;
        public static DeadlinesManager Deadlines { get; private set; }

        private static readonly ConfigFile _config;

        private static readonly RestServer _server;

        static Program()
        {
            _config = ConfigFile.Load("config");
            if (IPAddress.TryParse(_config.ServerIP, out var parsedIp))
                IP = parsedIp;
            else
            {
                IP = IPAddress.Loopback;
                Console.WriteLine("Can't parse config IP address. Using default: " + IP);
            }
            Deadlines = new([]);
            Port = _config.Port;
            _server = new(IP, Port);
            _server.AddVersion(new RestAPI());
        }

        private static void Main(string[] args)
        {
            _server.Start();
            
            Deadlines.Add("test", "test123", 1, Priority.High, DateTime.Now.AddDays(-10), DateTime.Now.AddDays(10), []);

            Console.WriteLine($"Http Server started at {IP}:{Port}");
            while (true)
            {
                var command = Console.ReadLine();
                if (!string.IsNullOrEmpty(command) && command.Equals("exit", StringComparison.OrdinalIgnoreCase))
                    return;
            }
        }
    }
}
