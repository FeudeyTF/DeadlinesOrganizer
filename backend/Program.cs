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

        public static ConfigFile Config { get; set; }

        private static readonly RestServer _server;

        static Program()
        {
            Config = ConfigFile.Load("config");
            if (IPAddress.TryParse(Config.ServerIP, out var parsedIp))
                IP = parsedIp;
            else
            {
                IP = IPAddress.Loopback;
                Console.WriteLine("Can't parse config IP address. Using default: " + IP);
            }
            Deadlines = new DeadlinesManager([]);
            Port = Config.Port;
            _server = new RestServer(IP, Port);
            _server.AddVersion(new RestApi());
        }

        private static void Main(string[] args)
        {
            _server.Start();

            Deadlines.Add("test", "test123", 1, Priority.High, DateTime.Now.AddDays(-10), DateTime.Now.AddDays(10), []);

            Console.WriteLine($"REST Server started at {IP}:{Port}");
            while (true)
            {
                var command = Console.ReadLine();
                if (!string.IsNullOrEmpty(command) && command.Equals("exit", StringComparison.OrdinalIgnoreCase))
                    return;
            }
        }
    }
}
